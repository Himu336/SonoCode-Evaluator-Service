import express from "express";

import { addSubmission } from "../../controllers/submissionController.js";

const submissionRouter = express.Router();

submissionRouter.post('/', addSubmission);

export default submissionRouter;