// Mock data for the viewer app
export interface User {
    id: string;
    username: string;
    avatar: string;
    name: string;
    bio?: string;
    verified?: boolean;
    followers?: number;
    website?: string;
    category?: string;
    isPrivate?: boolean;
}

export interface Post {
    id: string;
    userId: string;
    user: User;
    image: string;
    caption: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: Date;
}

export interface Story {
    id: string;
    user: User;
    hasViewed: boolean;
    gradient: string;
    slides: {
        id: string;
        image: string;
        time: string;
    }[];
}

export interface Shot {
    id: number;
    username: string;
    avatar: string;
    video: string;
    caption: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isSaved: boolean;
    music: string;
}

// Mock users
export const MOCK_USERS: User[] = [
    {
        id: '1',
        username: 'travel_vibes',
        name: 'Travel Vibes',
        avatar: 'https://i.pravatar.cc/150?u=travel',
        bio: 'Exploring the world one destination at a time 🌍',
        verified: true,
        followers: 150000000, // Gold Tick (>100M)
    },
    {
        id: '2',
        username: 'food_lover',
        name: 'Foodie Paradise',
        avatar: 'https://i.pravatar.cc/150?u=food',
        bio: 'Chef & Food Photographer 📸🍕',
        verified: false,
        followers: 5000000, // Silver Tick (>1M)
    },
    {
        id: '3',
        username: 'fitness_pro',
        name: 'Fitness Pro',
        avatar: 'https://i.pravatar.cc/150?u=fitness',
        bio: 'Personal Trainer | Nutrition Coach 💪',
        verified: true,
        followers: 500000, // Blue Tick (>100k)
    },
    {
        id: '4',
        username: 'art_studio',
        name: 'Digital Art Studio',
        avatar: 'https://i.pravatar.cc/150?u=art',
        bio: 'Creating digital masterpieces ✨',
        verified: true,
        followers: 50000, // No tick (<100k)
    },
    {
        id: '5',
        username: 'tech_guru',
        name: 'Tech Guru',
        avatar: 'https://i.pravatar.cc/150?u=tech',
        bio: 'Latest tech reviews and tutorials 🚀',
        verified: false,
        followers: 1200000, // Silver Tick
    },
    {
        id: '6',
        username: 'nature_shots',
        name: 'Nature Photography',
        avatar: 'https://i.pravatar.cc/150?u=nature',
        bio: 'Capturing nature\'s beauty 🌿📷',
        verified: true,
        followers: 95000, // Close to blue
    },
    {
        id: '7',
        username: 'fashion_icon',
        name: 'Fashion Icon',
        avatar: 'https://i.pravatar.cc/150?u=fashion',
        bio: 'Fashion & Style Influencer 👗',
        verified: true,
        followers: 105000000, // Gold Tick
    },
    {
        id: '8',
        username: 'music_beats',
        name: 'Music Beats',
        avatar: 'https://i.pravatar.cc/150?u=music',
        bio: 'Producer | DJ | Music Lover 🎵',
        verified: false,
        followers: 1500, // Small account
    },
];

// Mock posts
export const MOCK_POSTS: Post[] = [
    {
        id: '1',
        userId: '1',
        user: MOCK_USERS[0],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
        caption: 'Mountain views that take your breath away 🏔️ #travel #nature #mountains',
        likes: 1234,
        comments: 89,
        isLiked: false,
        isSaved: false,
        createdAt: new Date('2024-02-15T10:30:00'),
    },
    {
        id: '2',
        userId: '2',
        user: MOCK_USERS[1],
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=800&fit=crop',
        caption: 'Homemade pizza perfection 🍕 Recipe in bio! #foodie #pizza #cooking',
        likes: 2341,
        comments: 156,
        isLiked: true,
        isSaved: false,
        createdAt: new Date('2024-02-15T09:15:00'),
    },
    {
        id: '3',
        userId: '3',
        user: MOCK_USERS[2],
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop',
        caption: 'Morning workout complete! 💪 Who else is crushing their fitness goals? #fitness #motivation',
        likes: 987,
        comments: 45,
        isLiked: false,
        isSaved: true,
        createdAt: new Date('2024-02-15T08:00:00'),
    },
    {
        id: '4',
        userId: '4',
        user: MOCK_USERS[3],
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop',
        caption: 'New digital artwork ✨ What do you think? #art #digitalart #creative',
        likes: 3456,
        comments: 234,
        isLiked: true,
        isSaved: true,
        createdAt: new Date('2024-02-14T20:30:00'),
    },
    {
        id: '5',
        userId: '5',
        user: MOCK_USERS[4],
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop',
        caption: 'Latest tech setup review 📱💻 Link in bio! #tech #gadgets #review',
        likes: 1876,
        comments: 92,
        isLiked: false,
        isSaved: false,
        createdAt: new Date('2024-02-14T18:45:00'),
    },
    {
        id: '6',
        userId: '6',
        user: MOCK_USERS[5],
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop',
        caption: 'Golden hour in the forest 🌲✨ #nature #photography #sunset',
        likes: 2109,
        comments: 67,
        isLiked: true,
        isSaved: false,
        createdAt: new Date('2024-02-14T17:20:00'),
    },
    {
        id: '7',
        userId: '7',
        user: MOCK_USERS[6],
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop',
        caption: 'Spring collection preview 👗 Coming soon! #fashion #style #ootd',
        likes: 4321,
        comments: 189,
        isLiked: false,
        isSaved: true,
        createdAt: new Date('2024-02-14T15:00:00'),
    },
    {
        id: '8',
        userId: '8',
        user: MOCK_USERS[7],
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop',
        caption: 'New track dropping this Friday 🎵🔥 #music #producer #newmusic',
        likes: 1654,
        comments: 78,
        isLiked: true,
        isSaved: false,
        createdAt: new Date('2024-02-14T12:30:00'),
    },
];

// Mock stories
export const MOCK_STORIES: Story[] = [
    {
        id: '1',
        user: MOCK_USERS[0],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        slides: [
            { id: '1-1', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1200&fit=crop', time: '2h' },
            { id: '1-2', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=1200&fit=crop', time: '1h' },
        ]
    },
    {
        id: '2',
        user: MOCK_USERS[1],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        slides: [
            { id: '2-1', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop', time: '5h' },
        ]
    },
    {
        id: '3',
        user: MOCK_USERS[2],
        hasViewed: true,
        gradient: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
        slides: [
            { id: '3-1', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1200&fit=crop', time: '8h' },
        ]
    },
    {
        id: '4',
        user: MOCK_USERS[3],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
        slides: [
            { id: '4-1', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1200&fit=crop', time: '10h' },
        ]
    },
    {
        id: '5',
        user: MOCK_USERS[4],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
        slides: [
            { id: '5-1', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1200&fit=crop', time: '12h' },
        ]
    },
    {
        id: '6',
        user: MOCK_USERS[5],
        hasViewed: true,
        gradient: 'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
        slides: [
            { id: '6-1', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1200&fit=crop', time: '14h' },
        ]
    },
    {
        id: '7',
        user: MOCK_USERS[6],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #30cfd0 0%, #330867 100%)',
        slides: [
            { id: '7-1', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop', time: '16h' },
        ]
    },
    {
        id: '8',
        user: MOCK_USERS[7],
        hasViewed: false,
        gradient: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
        slides: [
            { id: '8-1', image: 'https://images.unsplash.com/photo-1514525253344-981c1cad9c3a?w=800&h=1200&fit=crop', time: '20h' },
        ]
    },
];

// Mock shots
export const MOCK_SHOTS: Shot[] = [
    {
        id: 1,
        username: 'travel_vibes',
        avatar: 'https://i.pravatar.cc/150?u=travel',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: 'Exploring the beautiful mountains 🏔️ #travel #nature',
        likes: 45200,
        comments: 892,
        shares: 234,
        isLiked: false,
        isSaved: false,
        music: 'Original Audio - travel_vibes',
    },
    {
        id: 2,
        username: 'food_lover',
        avatar: 'https://i.pravatar.cc/150?u=food',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        caption: 'Making the perfect pasta 🍝 #cooking #foodie',
        likes: 32100,
        comments: 567,
        shares: 189,
        isLiked: false,
        isSaved: false,
        music: 'Cooking Beats - DJ Chef',
    },
    {
        id: 3,
        username: 'fitness_pro',
        avatar: 'https://i.pravatar.cc/150?u=fitness',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Morning workout routine 💪 #fitness #motivation',
        likes: 28900,
        comments: 445,
        shares: 156,
        isLiked: false,
        isSaved: false,
        music: 'Workout Mix 2024',
    },
    {
        id: 4,
        username: 'art_studio',
        avatar: 'https://i.pravatar.cc/150?u=art',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        caption: 'Creating digital art ✨ #art #creative',
        likes: 51300,
        comments: 1023,
        shares: 412,
        isLiked: false,
        isSaved: false,
        music: 'Chill Vibes - Lofi Beats',
    },
    {
        id: 5,
        username: 'tech_guru',
        avatar: 'https://i.pravatar.cc/150?u=tech',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        caption: 'Latest tech gadgets review 📱 #tech #gadgets',
        likes: 39800,
        comments: 678,
        shares: 267,
        isLiked: false,
        isSaved: false,
        music: 'Tech House - Electronic Mix',
    },
];
