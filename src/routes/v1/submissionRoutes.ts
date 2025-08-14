import express from "express";

import { addSubmission } from "../../controllers/submissionController.js";
import { validate } from "../../validators/zodValidator.js";
import { createSubmissionZodSchema } from "../../dtos/CreateSubmissionDto.js";

const submissionRouter = express.Router();

submissionRouter.post('/', validate(createSubmissionZodSchema),addSubmission);

export default submissionRouter;