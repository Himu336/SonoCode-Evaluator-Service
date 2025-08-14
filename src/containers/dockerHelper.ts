import type DockerStreamOutput from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";

export default function decodeDockerStream(buffer: Buffer): DockerStreamOutput {
    //This variable keeps the track od the current position in the buffer while parsing
    let offset =0;

    //The ouput that will store the accumlated stdout and stderr output as strings
    const output: DockerStreamOutput = {
        stdout: '',
        stderr: ''
    };

    //Loop until offset reaches the end of the buffer
    while(offset < buffer.length) {
        const typeOfStream = buffer[offset];

        //This holds the length of data frame/part of buffer where value is
        //We read this variable on an offset of 4 bytes from the start of the chunk
        const length = buffer.readUInt32BE(offset + 4);

        //As now we have read the header, we can move forward to tbe value of chunk
        offset += DOCKER_STREAM_HEADER_SIZE;

        if(typeOfStream === 1){
            //stdout stream
            output.stdout += buffer.toString("utf-8", offset, offset + length);
        } else if(typeOfStream === 2){
            //stderr stream
            output.stderr += buffer.toString("utf-8", offset, offset + length);
        }

        //move offset to next chunk
        offset += length;
    };
 
    return output;
}