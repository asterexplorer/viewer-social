'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import styles from './Post.module.css';

interface PostProps {
    user: {
        username: string;
        avatar: string;
    };
    image: string;
    likes: number;
    caption: string;
    time: string;
}

const Post: React.FC<PostProps> = ({ user, image, likes, caption, time }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <div className={styles.post}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <img src={user.avatar} alt={user.username} className={styles.avatar} />
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.time}>• {time}</span>
                </div>
                <button><MoreHorizontal size={20} /></button>
            </div>

            <div className={styles.imageContainer}>
                <img
                    src={image}
                    alt="Post content"
                    className={styles.postImage}
                    onDoubleClick={() => setIsLiked(true)}
                />
            </div>

            <div className={styles.actions}>
                <div className={styles.leftActions}>
                    <button
                        className={styles.actionButton}
                        onClick={() => setIsLiked(!isLiked)}
                        style={{ color: isLiked ? '#ed4956' : 'inherit' }}
                    >
                        <Heart size={24} fill={isLiked ? '#ed4956' : 'none'} />
                    </button>
                    <button className={styles.actionButton}><MessageCircle size={24} /></button>
                    <button className={styles.actionButton}><Send size={24} /></button>
                </div>
                <button className={styles.actionButton}><Bookmark size={24} /></button>
            </div>

            <div className={styles.likes}>{likes + (isLiked ? 1 : 0)} likes</div>

            <div className={styles.caption}>
                <span className={styles.username} style={{ marginRight: '8px' }}>{user.username}</span>
                {caption}
            </div>

            <div className={styles.viewComments}>View all 12 comments</div>
        </div>
    );
};

export default Post;
