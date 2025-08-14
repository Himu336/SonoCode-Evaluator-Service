import { Job, Worker } from "bullmq";

import SampleJob from "../jobs/Sample-Job.js";
import redisConnection from "../config/redisConfig.js";

export default function SampleWorker(queueName: string){
    new Worker(
        queueName,
        async (job: Job) => {
            if(job.name === "SampleJob"){
                const sampleJobInstance = new SampleJob(job.data);
                sampleJobInstance.handle(job);

                return true;
            }
        },
        {
            connection: redisConnection
        }
    )
};