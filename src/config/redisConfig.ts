import { Redis } from "ioredis";

import ServerConfig from '../config/serverConfig.js';

const redisConfig = {
    prot: ServerConfig.REDIS_PORT,
    host: ServerConfig.REDIS_HOST,
    maxRetriesPerRequest: null,
}

const redisConnection = new Redis(redisConfig);

export default redisConnection;