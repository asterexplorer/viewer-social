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
        if (!userId) return null;

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

        return user || null;
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
