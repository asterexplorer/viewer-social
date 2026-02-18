import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Identify current user (Simulated)
        const currentUser = await prisma.user.findFirst({
            include: { following: true }
        });

        if (!currentUser) {
            return NextResponse.json([]);
        }

        const followingIds = currentUser.following.map(f => f.followingId);
        const userIdsToFetch = [...followingIds, currentUser.id];

        // 2. Fetch Stories
        // Stories disappear after 24 hours usually, but we'll use expiresAt
        const now = new Date();

        const stories = await prisma.story.findMany({
            where: {
                userId: { in: userIdsToFetch },
                expiresAt: { gt: now }
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // 3. Group by User (Algorithm: Stories are consumed per user)
        // We want to return a list of users who have stories, with their stories attached
        // But the current frontend StoryBar might expect flat list or user list.
        // Looking at MOCK_STORIES in StoryBar, it renders a list of items where each item has a user.
        // It seems simpler to return the raw stories and let the frontend group, 
        // OR return a list of "Story Bundles". 
        // Let's look at StoryBar.tsx again:
        // {MOCK_STORIES.map((story) => ( ... key={story.id} ... story.user.username ... ))}
        // This implies MOCK_STORIES is a list where each element is a User's story set? 
        // Or just individual stories?
        // If it's individual stories, then if a user has 5 stories, they appear 5 times in the bar?
        // That would be bad UI. Usually it's one circle per user.
        // I'll assume MOCK_STORIES was likely a list of "User Stories" objects.

        // Let's Group by User manually to ensure one item per user in the bar.
        const userStoriesMap = new Map();

        stories.forEach(story => {
            if (!userStoriesMap.has(story.userId)) {
                userStoriesMap.set(story.userId, {
                    id: story.userId, // Use userId as the key for the circle
                    user: story.user,
                    stories: [],
                    hasViewed: false, // Placeholder
                    latestAt: story.createdAt
                });
            }
            userStoriesMap.get(story.userId).stories.push(story);
        });

        // Convert to array and sort by latest story
        const groupedStories = Array.from(userStoriesMap.values()).sort((a, b) =>
            new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
        );

        return NextResponse.json(groupedStories);
    } catch (error) {
        console.error('API Error (GET /api/stories):', error);
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }
}
