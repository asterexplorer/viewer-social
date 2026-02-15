'use client';

import React from 'react';
import StoryBar from '@/components/StoryBar';
import Post from '@/components/Post';

const MOCK_POSTS = [
  {
    id: 1,
    user: { username: 'traveler_globe', avatar: 'https://i.pravatar.cc/150?u=10' },
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    likes: 1240,
    caption: 'Lost in the beauty of Yosemite. Nature never fails to amaze me! 🏔️✨',
    time: '2h'
  },
  {
    id: 2,
    user: { username: 'foodie_vibes', avatar: 'https://i.pravatar.cc/150?u=11' },
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    likes: 850,
    caption: 'Best brunch in town! These pancakes are to die for 🥞🍓 #foodie #brunch',
    time: '4h'
  },
  {
    id: 3,
    user: { username: 'tech_insider', avatar: 'https://i.pravatar.cc/150?u=12' },
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    likes: 3200,
    caption: 'Designing the future of AI. Stay tuned for the big reveal! 🚀💻 #tech #coding',
    time: '1d'
  }
];

export default function Home() {
  return (
    <div className="container" style={{ maxWidth: '630px', padding: '16px 0' }}>
      <StoryBar />

      <div style={{ marginTop: '24px' }}>
        {MOCK_POSTS.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
