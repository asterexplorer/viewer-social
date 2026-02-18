import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Identify current user (Simulated)
        const currentUser = await prisma.user.findFirst({
            include: { following: true }
        });

        let excludeUserIds: string[] = [];
        if (currentUser) {
            excludeUserIds = [currentUser.id, ...currentUser.following.map(f => f.followingId)];
        }

        // 2. Fetch Explore Content (Posts from people you don't follow)
        // Order by raw engagement (likes count)
        const posts = await prisma.post.findMany({
            where: {
                userId: { notIn: excludeUserIds }
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        fullName: true,
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            }
                        }
                    }
                },
            },
            // In a real scenario with thousands of posts, we'd use raw SQL for efficient sorting by relation count.
            // For now, we fetch a larger set and sort in memory.
            take: 100,
            orderBy: {
                createdAt: 'desc' // Only as a primary filter to get recent-ish content
            }
        });

        // 3. Ranking Algorithm for Explore
        // Focus on pure engagement velocity (Viral content)
        const scoreContent = (post: any) => {
            const now = new Date().getTime();
            const created = new Date(post.createdAt).getTime();
            const hoursAgo = Math.max(0.1, (now - created) / (1000 * 60 * 60));

            // Engagement Score
            const distinctLikers = new Set(post.likes.map((l: any) => l.userId)).size;
            const engagement = (distinctLikers * 1) + (post.comments.length * 2);

            // Explore favors highly engaging content regardless of age significantly more than Feed
            // But we still want fresh content.
            // Formula: Engagement^1.2 / (Time + 1)^1.0
            return Math.pow(engagement + 1, 1.2) / Math.pow(hoursAgo + 1, 1.0);
        };

        // Sort and select top items
        const rankedPosts = posts
            .map(p => ({ ...p, score: scoreContent(p) }))
            .sort((a, b) => b.score - a.score);

        return NextResponse.json(rankedPosts);
    } catch (error) {
        console.error('API Error (GET /api/explore):', error);
        return NextResponse.json({ error: 'Failed to fetch explore content' }, { status: 500 });
    }
}
