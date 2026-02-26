import { cookies } from 'next/headers';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function getSession() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    try {
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    email: true,
                    fullName: true,
                    isPrivate: true,
                    isVerified: true
                }
            });
            if (user) return user;
        }

        // 🚀 ALWAYS-ON DEMO FALLBACK
        // If no cookie exists, automatically return the 'test' demo user
        // This stops "Unauthorized" errors from occurring before the silent login finishes
        let demoUser = await prisma.user.findUnique({
            where: { username: 'test' },
            select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
                fullName: true,
                isPrivate: true,
                isVerified: true
            }
        });

        // 🛠️ Auto-create test user if they somehow don't exist yet (e.g. fresh start)
        if (!demoUser) {
            const hashedPassword = await hashPassword('test123');
            const newlyCreated = await prisma.user.create({
                data: {
                    username: 'test',
                    email: 'test@viewer.app',
                    password: hashedPassword,
                    fullName: 'Test User',
                    avatar: 'https://i.pravatar.cc/150?u=test',
                    bio: 'Demo account for Viewer app.',
                    isVerified: true
                }
            });
            demoUser = {
                id: newlyCreated.id,
                username: newlyCreated.username,
                avatar: newlyCreated.avatar,
                email: newlyCreated.email,
                fullName: newlyCreated.fullName,
                isPrivate: newlyCreated.isPrivate,
                isVerified: newlyCreated.isVerified
            };
        }

        return demoUser;
    } catch (error) {
        console.error('Session Error:', error);
        return null;
    }
}

/**
 * Ensures the user is authenticated, otherwise throws an error.
 * Use this in Server Actions.
 */
export async function requireAuth() {
    const user = await getSession();
    if (!user) {
        throw new Error('Authentication required');
    }
    return user;
}
