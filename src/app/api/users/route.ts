import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                avatar: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        shots: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('API Error (GET /api/users):', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password, fullName, avatar } = body;

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password, // In real app, hash this
                fullName,
                avatar: avatar || `https://i.pravatar.cc/150?u=${username}`,
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('API Error (POST /api/users):', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
