import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate a random, social-friendly referral code (e.g., ASTER8F2B)
function generateReferralCode(username: string) {
    const cleanName = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${cleanName}${randomHex}`;
}

async function run() {
    console.log('Seeding referral codes for existing users...');

    try {
        const users = await prisma.user.findMany({
            where: { referralCode: null }
        });

        console.log(`Found ${users.length} users needing referral codes.`);

        let updated = 0;
        for (const user of users) {
            let code = generateReferralCode(user.username);
            let isUnique = false;

            // Loop to ensure uniqueness
            while (!isUnique) {
                const existing = await prisma.user.findUnique({ where: { referralCode: code } });
                if (existing) {
                    code = generateReferralCode(user.username);
                } else {
                    isUnique = true;
                }
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: code }
            });
            updated++;
        }

        console.log(`Successfully generated unique referral codes for ${updated} users.`);
    } catch (e) {
        console.error('Failed to seed referral codes:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
