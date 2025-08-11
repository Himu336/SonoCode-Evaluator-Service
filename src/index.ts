const express = require('express');
const { PORT } = require('./config/serverConfig');

const app = express();

app.listen(PORT, () => {
    console.log(`Server started at *:${3000}`)
});
