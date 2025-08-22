import { CPP_IMAGE } from '../utils/constants.js';
// import Docker from 'dockerode';

import pullImage from './pullImage.js';
import decodeDockerStream from './dockerHelper.js';
// import type { TestCases } from '../types/testCases';
import createContainer from './containerFactory.js';

async function runCpp(code: string, inputTestCase: string){
    const rawLogBuffer: Buffer[] =[]; 

    await pullImage(CPP_IMAGE);

    console.log("Initialising a new cpp docker container");
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./main`;

    // const cppDockerContainer = await createContainer(CPP_IMAGE, ['java3','-c', code, 'stty -echo']);
    const cppDockerContainer = await createContainer(CPP_IMAGE, [
        '/bin/sh',
        '-c',
        runCommand
    ]);

    //booting the corresponding docker container
    await  cppDockerContainer.start();
    console.log("Started the docker container");

    const loggerStream = await cppDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true
    });

    //Attach events on the stream objects to start and stop reading
    loggerStream.on('data', (chunk) => {
        rawLogBuffer.push(chunk); 
    });

    const response = await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            res(decodedStream);
        });
    });

    //Remove the container when done
    await cppDockerContainer.remove();
    return response;
}

export default runCpp;
