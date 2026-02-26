import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET notifications for the current user
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.id,
                read: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PATCH mark all notifications as read
 */
export async function PATCH() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: {
                userId: session.id,
                read: false
            },
            data: { read: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Notifications Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
