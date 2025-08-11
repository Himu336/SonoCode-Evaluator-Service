const dotenv = require('dotenv');

dotenv.config();

exports.module = {
    PORT: process.env.PORT
}