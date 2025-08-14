import { PYTHON_IMAGE } from './../utils/constants';
// import Docker from 'dockerode';

import decodeDockerStream from '../containers/dockerHelper';
// import type { TestCases } from '../types/testCases';
import createContainer from './containerFactory';

async function runPython(code: string){
    const rawLogBuffer: Buffer[] =[];

    const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3','-c', code, 'stty -echo']);

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

    loggerStream.on('end', () => {
        console.log(rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);
        console.log(decodedStream);
    });

    return pythonDockerContainer;
}

export default runPython;