import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data to avoid conflicts on re-seed
    await prisma.shotComment.deleteMany();
    await prisma.shotLike.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.shot.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database cleared.');

    // Mock Users
    const usersData = [
        {
            username: 'travel_vibes',
            name: 'Travel Vibes',
            avatar: 'https://i.pravatar.cc/150?u=travel',
            bio: 'Exploring the world one destination at a time 🌍',
            email: 'travel@example.com',
            password: 'password123'
        },
        {
            username: 'food_lover',
            name: 'Foodie Paradise',
            avatar: 'https://i.pravatar.cc/150?u=food',
            bio: 'Chef & Food Photographer 📸🍕',
            email: 'food@example.com',
            password: 'password123'
        },
        {
            username: 'fitness_pro',
            name: 'Fitness Pro',
            avatar: 'https://i.pravatar.cc/150?u=fitness',
            bio: 'Personal Trainer | Nutrition Coach 💪',
            email: 'fitness@example.com',
            password: 'password123'
        },
        {
            username: 'antigravity_dev',
            name: 'Antigravity AI',
            avatar: 'https://i.pravatar.cc/150?u=antigravity',
            bio: 'Building the future of coding with AI 🚀',
            email: 'dev@antigravity.ai',
            password: 'password123'
        }
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.create({
            data: {
                username: u.username,
                fullName: u.name,
                avatar: u.avatar,
                bio: u.bio,
                email: u.email,
                password: u.password
            }
        });
        users.push(user);
    }

    console.log(`${users.length} users created.`);

    // Mock Posts
    const postsData = [
        {
            username: 'travel_vibes',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
            caption: 'Mountain views that take your breath away 🏔️ #travel #nature #mountains'
        },
        {
            username: 'food_lover',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop',
            caption: 'Homemade pizza perfection 🍕 Recipe in bio! #foodie #pizza #cooking'
        },
        {
            username: 'antigravity_dev',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
            caption: 'Lost in the beauty of Yosemite. Nature never fails to amaze me! 🏔️✨'
        }
    ];

    for (const p of postsData) {
        const user = users.find(u => u.username === p.username);
        if (user) {
            await prisma.post.create({
                data: {
                    userId: user.id,
                    image: p.image,
                    caption: p.caption
                }
            });
        }
    }

    console.log('Posts created.');

    // Mock Shots
    const shotsData = [
        {
            username: 'travel_vibes',
            video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            caption: 'Exploring the beautiful mountains 🏔️ #travel #nature',
            music: 'Original Audio - travel_vibes'
        },
        {
            username: 'food_lover',
            video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            caption: 'Making the perfect pasta 🍝 #cooking #foodie',
            music: 'Cooking Beats - DJ Chef'
        }
    ];

    for (const s of shotsData) {
        const user = users.find(u => u.username === s.username);
        if (user) {
            await prisma.shot.create({
                data: {
                    userId: user.id,
                    video: s.video,
                    caption: s.caption,
                    music: s.music
                }
            });
        }
    }

    console.log('Shots created.');
    console.log('Seed data synchronization complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
