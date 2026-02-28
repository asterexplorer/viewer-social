import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/referrals
 * Returns stats on who the logged-in user has referred, their total earnings, and signups.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch User with basic stats
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { referralCode: true, isInfluencer: true }
        });

        // Aggregate Referrals
        const referrals = await prisma.referral.findMany({
            where: { referrerId: session.id },
            include: {
                referred: {
                    select: { username: true, avatar: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate Earnings
        const totalEarnings = referrals
            .filter(r => r.status === 'REWARDED' || r.status === 'COMPLETED')
            .reduce((sum, r) => sum + r.rewardAmount, 0);

        const pendingEarnings = referrals
            .filter(r => r.status === 'PENDING')
            .reduce((sum, r) => sum + r.rewardAmount, 0);

        return NextResponse.json({
            success: true,
            referralCode: user?.referralCode,
            isInfluencer: user?.isInfluencer,
            totalReferrals: referrals.length,
            totalEarnings,
            pendingEarnings,
            history: referrals
        });

    } catch (error) {
        console.error('Fetch Referrals Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
