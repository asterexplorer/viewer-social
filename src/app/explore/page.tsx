'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import styles from './explore.module.css';
import { MOCK_POSTS, Post } from '@/lib/mockData';
import PostDetailModal from '@/components/PostDetailModal';

const ExplorePage = () => {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    return (
        <div className="container" style={{ maxWidth: '935px' }}>
            <div className={`${styles.exploreHeader} fade-in`}>
                <h1 className={styles.title}>Explore</h1>
                <p className={styles.subtitle}>Discover new content from the community</p>
            </div>

            <div className={styles.grid}>
                {MOCK_POSTS.map((post, index) => (
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

            {MOCK_POSTS.length === 0 && (
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
