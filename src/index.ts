import express from "express";
import bodyParser from "body-parser";

import SampleWorker from "./workers/sampleWorker.js";

import ServerConfig from "./config/serverConfig.js";
import apiRouter from "./routes/index.js";
import runPython from "./containers/runPythonDocker.js";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use('/api', apiRouter);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server started at *:${ServerConfig.PORT}`)

    SampleWorker('SampleQueue');

    const code = `x = input()
y=input()
print("value of x is", x)
print("value of y is", y)
`;

const inputCase = `100
200
`

    runPython(code, inputCase);
});
