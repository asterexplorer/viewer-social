'use client';

import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal } from 'lucide-react';
import styles from '@/app/reels/reels.module.css';

interface ReelSidebarProps {
    likes: number;
    comments: number;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
}

const ReelSidebar: React.FC<ReelSidebarProps> = ({
    likes,
    comments,
    isLiked,
    isSaved,
    onLike,
    onSave
}) => {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className={styles.sidebar}>
            <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); onLike(); }}
            >
                <div className={`${styles.likeIcon} ${isLiked ? styles.liked : ''}`}>
                    <Heart
                        size={32}
                        fill={isLiked ? '#ff3b5c' : 'rgba(255, 255, 255, 0.9)'}
                        color={isLiked ? '#ff3b5c' : 'white'}
                    />
                </div>
                <span>{formatNumber(likes)}</span>
            </button>

            <button className={styles.actionBtn} onClick={(e) => e.stopPropagation()}>
                <MessageCircle size={32} fill="white" color="white" />
                <span>{formatNumber(comments)}</span>
            </button>

            <button className={styles.actionBtn} onClick={(e) => e.stopPropagation()}>
                <Send size={32} fill="white" color="white" />
            </button>

            <button
                className={styles.actionBtn}
                onClick={(e) => { e.stopPropagation(); onSave(); }}
            >
                <Bookmark
                    size={32}
                    fill={isSaved ? '#ffd700' : 'none'}
                    color={isSaved ? '#ffd700' : 'white'}
                />
            </button>

            <button className={styles.actionBtn}>
                <div className={styles.musicDisk}>
                    <Music size={18} color="white" />
                </div>
            </button>

            <button className={styles.actionBtn}>
                <MoreHorizontal size={32} color="white" />
            </button>
        </div>
    );
};

export default ReelSidebar;
