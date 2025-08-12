const Redis = require('ioredis');

const { REDIS_HOST, REDIS_PORT } = require('../config/serverConfig');


const redisConfig = {
    prot: REDIS_PORT,
    host: REDIS_HOST,
}

const redisConnection = new Redis(redisConfig);

module.exports = {
    redisConnection
}