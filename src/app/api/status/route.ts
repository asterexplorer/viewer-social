import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Simple query to verify database connection
        const userCount = await prisma.user.count();
        const postCount = await prisma.post.count();

        return NextResponse.json({
            status: 'online',
            database: 'connected',
            message: 'RESTful API is enabled and operational with Database connection',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            stats: {
                users: userCount,
                posts: postCount
            },
            endpoints: [
                '/api/posts',
                '/api/users',
                '/api/profile',
                '/api/shots'
            ]
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json({
            status: 'online',
            database: 'disconnected',
            error: 'Failed to connect to database',
            timestamp: new Date().toISOString()
        }, { status: 503 });
    }
}
