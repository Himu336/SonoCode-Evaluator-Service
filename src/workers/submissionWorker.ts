import { Job, Worker } from "bullmq";

import SubmissionJob from "../jobs/Submission-Job.js";
import redisConnection from "../config/redisConfig.js";

export default function SubmissionWorker(queueName: string){
    new Worker(
        queueName,
        async (job: Job) => {
            if(job.name === "SubmissionJob"){
                const submissionJobInstance = new SubmissionJob(job.data);
                submissionJobInstance.handle(job);

                return true;
            }
        },
        {
            connection: redisConnection
        }
    )
};