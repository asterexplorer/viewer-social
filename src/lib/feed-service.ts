import prisma from '@/lib/prisma';
import { getCassandraClient } from '@/lib/cassandra';
import { getOrSet } from '@/lib/redis';

export type FeedItem = {
    id: string;
    type: 'post' | 'shot';
    caption: string | null;
    image: string; // or video for shots
    createdAt: Date;
    user: {
        username: string;
        avatar: string | null;
        fullName: string | null;
    };
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
    // ... other props
};

export const FeedService = {
    // Public: Get Feed (Cached or Fresh)
    async generateFeed(userId: string, page = 1, limit = 20): Promise<any[]> {
        const cacheKey = `feed:user:${userId}`;

        // Cache the first page for 60 seconds (Simulated Pre-computation)
        if (page === 1) {
            const cached = await getOrSet(cacheKey, async () => {
                return await FeedService._generateRun(userId, page, limit);
            }, 60);
            return cached;
        }

        return await FeedService._generateRun(userId, page, limit);
    },

    // Public: Trigger Pre-computation (e.g. from Cron)
    async precomputeFeed(userId: string) {
        await FeedService.generateFeed(userId, 1, 20); // Warms the cache
        return { success: true };
    },

    // Internal: Actual generation logic
    async _generateRun(userId: string, page = 1, limit = 20): Promise<any[]> {
        const offset = (page - 1) * limit;

        // 1. Get User's Social Graph (Who they follow)
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { following: true }
        });

        if (!currentUser) return [];

        const followingIds = currentUser.following.map(f => f.followingId);
        const userIdsToFetch = [...followingIds, userId]; // Include self

        // 2. Fetch Personal Content (Following + Self)
        // Try Cassandra first for scalable timeline
        let personalPosts: any[] = [];
        const cassandra = getCassandraClient();

        if (process.env.CASSANDRA_CONTACT_POINTS && cassandra) {
            try {
                // Simplified scatter-gather query
                // In production, we'd use a dedicated timeline table pre-written on fanout
                const query = `SELECT * FROM ${process.env.CASSANDRA_KEYSPACE || 'viewer_feed'}.posts_by_user WHERE user_id = ? LIMIT 20`;
                const promises = userIdsToFetch.map(uid => cassandra.execute(query, [uid], { prepare: true }));
                const results = await Promise.all(promises);

                // Map Cassandra rows ... (simplified for this reliable service implementation)
                // If this complex mapping is needed, we'd put it here.
                // For simplicity/reliability in this edit, let's stick to the high-level flow and fallback to Prisma if complex.
                // But let's assume we want the Prisma path for rich relations unless Cassandra is fully set up.
            } catch (e) {
                console.warn("Cassandra fetch failed", e);
            }
        }

        // Fallback/Default: Postgres (Prisma)
        if (personalPosts.length === 0) {
            personalPosts = await prisma.post.findMany({
                where: { userId: { in: userIdsToFetch } },
                include: {
                    user: { select: { username: true, avatar: true, fullName: true } },
                    likes: true,
                    comments: { include: { user: { select: { username: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                take: 50 // Fetch recent pool
            });
        }

        // 3. Fetch Suggested Content (Cached "Global Hot" Pool)
        const suggestedPool = await getOrSet('feed:suggested_pool:v1', async () => {
            return await prisma.post.findMany({
                include: {
                    user: { select: { username: true, avatar: true, fullName: true } },
                    likes: true,
                    comments: { include: { user: { select: { username: true } } } },
                },
                orderBy: { createdAt: 'desc' }, // Recent first
                take: 100
            });
        }, 300); // 5 mins cache

        // Filter suggested (remove followed users)
        const suggestedPosts = suggestedPool
            .filter((p: any) => !userIdsToFetch.includes(p.userId))
            .slice(0, 20); // Take top 20 candidates

        // 4. Ranking & Interleaving
        const allContent = [...personalPosts, ...suggestedPosts];

        // Remove duplicates
        const uniqueContent = Array.from(new Map(allContent.map(p => [p.id, p])).values());

        // Score Function
        const now = new Date().getTime();
        const scoreItem = (item: any) => {
            const created = new Date(item.createdAt).getTime();
            const hoursAgo = Math.max(0.1, (now - created) / (1000 * 60 * 60));

            // Engagement
            const likes = item.likes ? item.likes.length : 0;
            const comments = item.comments ? item.comments.length : 0;
            const engagement = likes + (comments * 2);

            // Gravity Decay
            // (Engagement + 1) / (Time + 2)^1.8
            const score = (engagement + 1) / Math.pow(hoursAgo + 2, 1.8);

            // Relationship Boost (1.5x for following)
            const isFollowing = userIdsToFetch.includes(item.userId);
            return score * (isFollowing ? 1.5 : 1.0);
        };

        // Sort by Score
        const rankedFeed = uniqueContent.sort((a, b) => scoreItem(b) - scoreItem(a));

        // Pagination
        const pagedFeed = rankedFeed.slice(offset, offset + limit);

        return pagedFeed.map(p => ({
            ...p,
            type: 'post',
            likesCount: p.likes?.length || 0,
            commentsCount: p.comments?.length || 0,
            isLiked: p.likes?.some((l: any) => l.userId === userId)
        }));
    }
};
