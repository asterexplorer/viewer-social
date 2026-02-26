/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    if (users.length > 0) {
        console.log('Usernames:', users.map(u => u.username).join(', '));
    } else {
        console.log('No users found in database.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
