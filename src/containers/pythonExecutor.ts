import { PYTHON_IMAGE } from '../utils/constants.js';
// import Docker from 'dockerode';
import type CodeExecutorStrategy from '../types/CodeExecutorStrategy.js';
import pullImage from './pullImage.js';
import decodeDockerStream from './dockerHelper.js';
// import type { TestCases } from '../types/testCases';
import createContainer from './containerFactory.js';
import type {ExecutionResponse} from '../types/CodeExecutorStrategy.js';

class PythonExecutor implements CodeExecutorStrategy{

    async execute(code: string, inputTestCase: string, outputTestCase: string): Promise<ExecutionResponse> {
        console.log(code, inputTestCase, outputTestCase);
        const rawLogBuffer: Buffer[] =[];

        await pullImage(PYTHON_IMAGE);

        console.log("Initialising a new python docker container");
        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;

        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3','-c', code, 'stty -echo']);
        const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
            '/bin/sh',
            '-c',
            runCommand
        ]);

        //booting the corresponding docker container
        await  pythonDockerContainer.start();
        console.log("Started the docker container");

        const loggerStream = await pythonDockerContainer.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: true
        });

        //Attach events on the stream objects to start and stop reading
        loggerStream.on('data', (chunk) => {
            rawLogBuffer.push(chunk); 
        });

        try{
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rawLogBuffer);
            //string matching
            if(codeResponse.trim() === outputTestCase.trim()){
                return {output: codeResponse, status: "SUCCESS"};
            }
            else {
                return {output: codeResponse, status: "WA"};
            }

        } catch (error){
            console.log("Error occurred", error);
            if(error === "TLE") {
                await pythonDockerContainer.kill();
            }
            return {output: error as string, status: "ERROR"}
        } finally {
            //Remove the container when done
            await pythonDockerContainer.remove();
        }
    };

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            const timeout = setTimeout(() => {
                console.log("Timeout called");
                rej("TLE");
            }, 2000);

            loggerStream.on('end', () => {
                clearTimeout(timeout);
                console.log(rawLogBuffer);
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                console.log(decodedStream);
                if(decodedStream.stderr){
                    rej(decodedStream.stderr);
                }else{
                    res(decodedStream.stdout);
                }
            });
        });
    }
};

export default PythonExecutor;