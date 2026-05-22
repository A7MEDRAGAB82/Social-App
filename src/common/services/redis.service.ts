import { createClient, RedisClientType } from 'redis';
import { env } from '../../config/env.service';
import th from 'zod/v4/locales/th.js';
import { Types } from 'mongoose';
import { keyof } from 'zod';

export class RedisService {
    private client: RedisClientType
    
    constructor() {
            this.client = createClient({
                url : env.REDIS_URL || 'redis://localhost:6379',
            });
            this.client.on('error', (err) => console.error('Redis Client Error', err));
    }

    handleConnectionError() {
        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        this.client.on('ready', () => {
            console.log('Redis connection established successfully');
        });
    }

    
    connect() {
         this.client.connect();
         console.log('Connected to Redis');
    }

    createRevokeToken({userId, token, expirationInSeconds}: {userId: Types.ObjectId; token: string; expirationInSeconds?: number}) : string {
        return `revoke:${userId}:${token}`;
    }

   setValue(key: string, value: string, expirationInSeconds?: number) : Promise<string | null> {
        if (expirationInSeconds) {
            return this.client.set(key, value, {
                EX: expirationInSeconds,
            });
        }
        return this.client.set(key, value);
    }
    

    get = async (key: string) : Promise<string | null> => {
        return await this.client.get(key);
    }

    ttl = async (key: string) : Promise<number> => {
        return await this.client.ttl(key);
    }

    exists = async (key: string) : Promise<boolean> => {
        const result = await this.client.exists(key);
        return result === 1;
    }

    redisDel = async (key: string) : Promise<void> => {
        await this.client.del(key);
    }

    mget = async (keys: string[]) : Promise<(string | null)[]> => {
        return await this.client.mGet(keys);
    }

    keys = async (pattern: string) : Promise<string[]> => {
        return await this.client.keys(pattern);
    }





    

}

export const redisService = new RedisService();