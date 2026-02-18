'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import styles from './explore.module.css';
import { MOCK_POSTS, Post } from '@/lib/mockData';
import PostDetailModal from '@/components/PostDetailModal';

const ExplorePage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    React.useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/explore');
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Map API data to component structure if needed, or use directly
                    // MOCK_POSTS structure: { id, user, image, likes, comments }
                    // API returns: { ..., likes: [...], comments: [...] }
                    const formatted = data.map((p: any) => ({
                        ...p,
                        likes: p.likes.length,
                        comments: p.comments.length
                    }));
                    setPosts(formatted);
                }
            } catch (err) {
                console.error('Failed to fetch explore posts:', err);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="container" style={{ maxWidth: '935px' }}>
            <div className={`${styles.exploreHeader} fade-in`}>
                <h1 className={styles.title}>Explore</h1>
                <p className={styles.subtitle}>Discover new content from the community</p>
            </div>

            <div className={styles.grid}>
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        className={styles.gridItem}
                        style={{ animationDelay: `${index * 0.04}s` }}
                        onClick={() => setSelectedPost(post)}
                    >
                        <img src={post.image} alt="" className={styles.gridImage} />
                        <div className={styles.overlay}>
                            <div className={styles.overlayContent}>
                                <div className={styles.overlayStats}>
                                    <span className={styles.stat}>
                                        <Heart size={18} fill="white" color="white" />
                                        {post.likes}
                                    </span>
                                    <span className={styles.stat}>
                                        <MessageCircle size={18} fill="white" color="white" />
                                        {post.comments}
                                    </span>
                                </div>
                                <div className={styles.overlayUser}>@{post.user.username}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3>Nothing to explore yet</h3>
                    <p>Posts from the community will show up here.</p>
                </div>
            )}

            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

export default ExplorePage;
