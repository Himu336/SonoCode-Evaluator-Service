import express from "express";
import ServerConfig from "./config/serverConfig.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use('/api', apiRouter);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server started at *:${3000}`)
});
