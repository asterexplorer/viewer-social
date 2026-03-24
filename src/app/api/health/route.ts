import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Attempt a simple query to verify the database link
        await prisma.$queryRaw`SELECT 1`;
        
        return NextResponse.json({ 
            status: 'online', 
            message: 'Database linked with success!',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error: any) {
        console.error('Health check failed:', error);
        return NextResponse.json({ 
            status: 'offline', 
            message: 'Failed to link database.',
            error: error.message
        }, { status: 500 });
    }
}
