import prisma from '@/lib/prisma';
import { User, Follows } from '@prisma/client';

// Define clear types for User Service responses
export type UserProfile = {
    id: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
    bio: string | null;
    website: string | null;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
};


export const UserService = {

    // 1. Get Profile by Username
    async getProfile(username: string, currentUserId?: string): Promise<UserProfile | null> {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: {
                        followedBy: true,
                        following: true,
                    }
                },
                followedBy: currentUserId ? {
                    where: { followerId: currentUserId }
                } : false
            }
        });

        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            bio: user.bio,
            website: user.website,
            isVerified: user.isVerified,
            followersCount: user._count.followedBy,
            followingCount: user._count.following,
            isFollowing: currentUserId ? user.followedBy.length > 0 : false
        };
    },

    // 2. Follow User
    async followUser(followerId: string, targetuserId: string) {
        if (followerId === targetuserId) throw new Error("Cannot follow yourself");

        // Check if already following
        const existing = await prisma.follows.findFirst({
            where: {
                followerId,
                followingId: targetuserId
            }
        });

        if (existing) return existing;

        return await prisma.follows.create({
            data: {
                followerId,
                followingId: targetuserId
            }
        });
    },

    // 3. Unfollow User
    async unfollowUser(followerId: string, targetuserId: string) {
        const existing = await prisma.follows.findFirst({
            where: {
                followerId,
                followingId: targetuserId
            }
        });

        if (!existing) return null;

        return await prisma.follows.delete({
            where: { id: existing.id }
        });
    },

    // 4. Update Profile
    async updateProfile(userId: string, data: Partial<User>) {
        // Prevent sensitive updates here if needed (e.g. password)
        const { password, id, ...safeData } = data as any;

        return await prisma.user.update({
            where: { id: userId },
            data: safeData
        });
    },

    // 5. Get Following List
    async getFollowing(userId: string) {
        return await prisma.follows.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        fullName: true
                    }
                }
            }
        });
    }
};
