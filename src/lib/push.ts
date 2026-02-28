import webPush from 'web-push';
import prisma from '@/lib/prisma';

// Ensure keys are present (usually passed from .env)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const subject = 'mailto:admin@viewersocial.com';

if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);
} else {
    console.warn('VAPID keys are missing. Web Push notifications will not work securely.');
}

/**
 * Sends a push notification to a specific user's active subscriptions
 */
export async function sendWebPushNotification(userId: string, payload: { title: string, body: string, url?: string, icon?: string }) {
    if (!vapidPublicKey || !vapidPrivateKey) return;

    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return;

        const pushPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            icon: payload.icon || '/favicon.ico'
        });

        const sendPromises = subscriptions.map(async (sub: any) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            try {
                await webPush.sendNotification(pushSub, pushPayload);
            } catch (error: any) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    // Subscription has expired or is no longer valid
                    console.log('Subscription expired. Deleting endpoint:', sub.endpoint);
                    await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                } else {
                    console.error('Error sending push notification to endpoint:', sub.endpoint, error);
                }
            }
        });

        await Promise.allSettled(sendPromises);

    } catch (err) {
        console.error('Failed to send web push notifications:', err);
    }
}
