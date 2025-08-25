import { JAVA_IMAGE } from '../utils/constants.js';
// import Docker from 'dockerode';

import pullImage from './pullImage.js';
import decodeDockerStream from './dockerHelper.js';
// import type { TestCases } from '../types/testCases';
import createContainer from './containerFactory.js';
import type CodeExecutorStrategy from '../types/CodeExecutorStrategy.js';
import type { ExecutionResponse } from '../types/CodeExecutorStrategy.js';

class JavaExecutor implements CodeExecutorStrategy{

    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] =[];

        await pullImage(JAVA_IMAGE);

        console.log("Initialising a new java docker container");
        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java.Main`;

        // const javaDockerContainer = await createContainer(JAVA_IMAGE, ['java3','-c', code, 'stty -echo']);
        const javaDockerContainer = await createContainer(JAVA_IMAGE, [
            '/bin/sh',
            '-c', 
            runCommand
        ]);

        //booting the corresponding docker container
        await  javaDockerContainer.start();
        console.log("Started the docker container");

        const loggerStream = await javaDockerContainer.logs({
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
            return {output: codeResponse, status: "COMPLETED"};
        } catch (error){
            return {output: error as string, status: "ERROR"}
        } finally {
            //Remove the container when done
            await javaDockerContainer.remove();
        }
    };

    //can be moved to docker helper util
    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            loggerStream.on('end', () => {
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

export default JavaExecutor;