import { Client, auth } from 'cassandra-driver';

const CASSANDRA_CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
const CASSANDRA_LOCAL_DATACENTER = process.env.CASSANDRA_LOCAL_DATACENTER || 'datacenter1';
const CASSANDRA_KEYSPACE = process.env.CASSANDRA_KEYSPACE || 'viewer_feed';
const CASSANDRA_USERNAME = process.env.CASSANDRA_USERNAME;
const CASSANDRA_PASSWORD = process.env.CASSANDRA_PASSWORD;

let client: Client | null = null;
let isConnected = false;

export function getCassandraClient() {
    if (!client) {
        // Only create client if credentials or contact points are explicitly provided
        // Use a flag or check if we are in environment to run
        const options: any = {
            contactPoints: CASSANDRA_CONTACT_POINTS,
            localDataCenter: CASSANDRA_LOCAL_DATACENTER,
            keyspace: CASSANDRA_KEYSPACE,
        };

        if (CASSANDRA_USERNAME && CASSANDRA_PASSWORD) {
            options.authProvider = new auth.PlainTextAuthProvider(CASSANDRA_USERNAME, CASSANDRA_PASSWORD);
        }

        // Add cloud config support (e.g. for Astra DB) if secure connect bundle provided
        if (process.env.CASSANDRA_SCB_PATH) {
            options.cloud = { secureConnectBundle: process.env.CASSANDRA_SCB_PATH };
        }

        client = new Client(options);
    }
    return client;
}

export async function initCassandra() {
    const client = getCassandraClient();
    try {
        await client.connect();
        isConnected = true;
        console.log('Connected to Cassandra');

        // Define Keyspace if not using Cloud/Astra
        if (!process.env.CASSANDRA_SCB_PATH) {
            await client.execute(`
                CREATE KEYSPACE IF NOT EXISTS ${CASSANDRA_KEYSPACE} 
                WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1' }
            `);
        }

        // Define Tables for massive scale feed storage

        // table: posts_by_user (for user profile feed)
        // Partition Key: user_id (all posts for a user together)
        // Clustering Key: created_at (sorted by time)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS ${CASSANDRA_KEYSPACE}.posts_by_user (
                user_id text,
                post_id timeuuid,
                caption text,
                image_url text,
                location text,
                created_at timestamp,
                likes_count counter,
                comments_count counter,
                PRIMARY KEY (user_id, created_at)
            ) WITH CLUSTERING ORDER BY (created_at DESC);
        `);

        // table: news_feed (pre-computed feed for users)
        // Partition Key: user_id (the user viewing the feed)
        // Clustering Key: created_at (sorted by time)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS ${CASSANDRA_KEYSPACE}.news_feed (
                user_id text,
                post_id timeuuid,
                author_id text,
                caption text,
                image_url text,
                created_at timestamp,
                PRIMARY KEY (user_id, created_at)
            ) WITH CLUSTERING ORDER BY (created_at DESC);
        `);

        // table: activity_metrics (for logging huge amounts of events)
        // Partition Key: user_id
        // Clustering Key: timestamp
        await client.execute(`
            CREATE TABLE IF NOT EXISTS ${CASSANDRA_KEYSPACE}.activity_metrics (
                user_id text,
                event_type text,
                metadata text,
                timestamp timestamp,
                PRIMARY KEY (user_id, timestamp)
            ) WITH CLUSTERING ORDER BY (timestamp DESC);
        `);

        console.log('Cassandra Schema Initialized');
    } catch (err) {
        console.error('Failed to initialize Cassandra:', err);
        isConnected = false;
    }
}

export const isCassandraConnected = () => isConnected;
