import { Job } from "bullmq";

import type { IJob } from "../types/bullMqJobDefinition.js";
import type { SubmissionPayload } from "../types/submissionPayload.js";
import createExecutor from "../utils/ExecutorFactory.js";
import type { ExecutionResponse } from "../types/CodeExecutorStrategy.js";
import evaluationQueueProdcuer from "../producers/evaluationQueueProducer.js"


export default class SubmissionJob implements IJob {
    name: string;
    payload: Record<string, SubmissionPayload>;
    constructor(payload: Record<string, SubmissionPayload>) {
        this.payload = payload;
        this.name = this.constructor.name;
    };

    handle = async (job?: Job) => {
        console.log("Handler of the job called");
        if(job) {
            const key = Object.keys(this.payload)[0];
            const codeLanguage = this.payload[key!]!.language;
            const code = this.payload[key!]!.code;
            const inputTestCase = this.payload[key!]!.inputCase;
            const outputTestCase = this.payload[key!]!.outputCase;

            const strategy = createExecutor(codeLanguage);
            if(strategy != null){
                const response: ExecutionResponse = await strategy.execute(code, inputTestCase, outputTestCase);

                evaluationQueueProdcuer({response, userId: this.payload[key!]!.userId, submissionId: this.payload[key!]!.submissionId});
                if(response.status === "COMPLETED"){
                    console.log("Code executed successfully");
                    console.log(response);
                } else {
                    console.log("Code execution failed");
                    console.log(response);
                }
            };
        };
    };

    failed = (job?: Job) : void => {
        console.log("Job Failed");
        if(job){    
            console.log(job.id);
        }
    };
};
