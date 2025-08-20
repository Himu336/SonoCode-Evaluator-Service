import { JAVA_IMAGE } from '../utils/constants.js';
// import Docker from 'dockerode';

import decodeDockerStream from './dockerHelper.js';
// import type { TestCases } from '../types/testCases';
import createContainer from './containerFactory.js';

async function runJava(code: string, inputTestCase: string){
    const rawLogBuffer: Buffer[] =[];

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

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            res(decodedStream);
        });
    });

    //Remove the container when done
    await javaDockerContainer.remove();
}

export default runJava;