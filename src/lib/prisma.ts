import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Improve the database link by verifying connection and logging success
prisma.$connect()
    .then(() => {
        console.log('✅ Database linked with success!');
    })
    .catch((error) => {
        console.error('❌ Failed to link database:', error);
    });
