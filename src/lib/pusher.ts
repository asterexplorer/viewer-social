import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const isServerConfigured =
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER;

// Server-side Pusher client (Lazy initialized or Mocked)
export const pusherServer = isServerConfigured
    ? new PusherServer({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
    })
    : {
        trigger: async () => {
            // console.warn('Pusher Server not configured. Skipping trigger.');
            return {};
        }
    } as any;

// Client-side Pusher client (Resilient)
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock_key', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    enabledTransports: ['ws', 'wss'],
});
