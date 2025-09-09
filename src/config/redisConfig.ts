import Redis from "ioredis";

import ServerConfig from '../config/serverConfig.js';

const redisConfig = {
    port: ServerConfig.REDIS_PORT,
    host: ServerConfig.REDIS_HOST,
    maxRetriesPerRequest: null,
}

const redisUrl = process.env.REDIS_URL;

const redisConnection = redisUrl
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : new Redis(redisConfig);

export default redisConnection;