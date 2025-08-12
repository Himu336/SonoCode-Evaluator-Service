const express = require('express');
const { PORT } = require('./config/serverConfig');
const apiRouter = require('./routes');

const app = express();

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server started at *:${3000}`)
});
