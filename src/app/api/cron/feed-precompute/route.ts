import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FeedService } from '@/lib/feed-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Authenticate the cron request (in prod using a secret key)
        const authHeader = request.headers.get('Authorization');
        // Simple check: if needed, compare with CRON_SECRET env
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

        // 1. Identify "Active Users"
        // Algorithm: Users who have logged in recently, or posted recently.
        // For simplicity: Users who have posted or liked in the last 24 hours.
        // OR just all users for this demo if small user base.

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const activeUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { posts: { some: { createdAt: { gte: oneDayAgo } } } },
                    { likes: { some: { createdAt: { gte: oneDayAgo } } } },
                    // Or simply recent logins if tracked
                    { username: 'antigravity_dev' } // Always include the dev
                ]
            },
            select: { id: true, username: true }
        });

        // 2. Pre-compute feeds
        // Run in parallel but limited concurrency if large
        const results = await Promise.all(
            activeUsers.map(async (user) => {
                try {
                    await FeedService.precomputeFeed(user.id);
                    return { userId: user.id, status: 'success' };
                } catch (e) {
                    return { userId: user.id, status: 'failed', error: String(e) };
                }
            })
        );

        return NextResponse.json({
            message: 'Feed pre-computation complete',
            processed: results.length,
            details: results
        });

    } catch (error) {
        console.error('Cron Job Failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
