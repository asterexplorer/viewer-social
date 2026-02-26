import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent multiple instances in dev
const globalForRedis = global as unknown as { redis: Redis };

// Initialize Redis client. If connection fails, it will retry.
// We add lazyConnect so it doesn't crash app if Redis is missing, 
// but subsequent operations might fail/timeout.
// Ideally, we handle errors gracefully in usage.
export const redis = globalForRedis.redis || new Redis(REDIS_URL, {
    lazyConnect: true,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 1
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Helper to get cached data or fetch fresh data
export async function getOrSet<T>(key: string, cb: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
    try {
        // Only try cache if status is ready/connected
        if (redis.status === 'ready') {
            const cached = await redis.get(key);
            if (cached) return JSON.parse(cached);
        }
    } catch (err) {
        console.warn(`Redis get error for key ${key}, falling back to source.`, err);
    }

    const freshData = await cb();

    try {
        if (freshData && redis.status === 'ready') {
            await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
        }
    } catch (err) {
        console.warn(`Redis set error for key ${key}`, err);
    }

    return freshData;
}

export async function invalidateCache(pattern: string) {
    try {
        if (redis.status !== 'ready') return;

        // Scan is safer than keys for production
        const stream = redis.scanStream({
            match: pattern,
            count: 100
        });

        stream.on('data', (keys) => {
            if (keys.length) {
                redis.del(keys);
            }
        });

        stream.on('end', () => {
            // done
        });
    } catch (err) {
        console.error('Redis invalidation error', err);
    }
}
