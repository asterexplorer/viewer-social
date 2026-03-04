'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music } from 'lucide-react';
import styles from '@/app/reels/reels.module.css';
import ReelCommentSheet from './ReelCommentSheet';
import ReelShareSheet from './ReelShareSheet';
import ReelMusicSheet from './ReelMusicSheet';

interface ReelSidebarProps {
    reelId: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
}

const ReelSidebar: React.FC<ReelSidebarProps> = ({
    reelId,
    likes,
    comments,
    isLiked,
    isSaved,
    onLike,
    onSave
}) => {
    const [showComments, setShowComments] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showMusic, setShowMusic] = useState(false);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <>
            <div className={styles.sidebar}>
                {/* Like Button */}
                <button
                    className={styles.actionBtn}
                    onClick={(e) => { e.stopPropagation(); onLike(); }}
                >
                    <div className={`${styles.actionIconWrap} ${isLiked ? styles.likedWrap : ''}`}>
                        <Heart
                            size={28}
                            fill={isLiked ? '#ff3b5c' : 'none'}
                            color={isLiked ? '#ff3b5c' : 'white'}
                            strokeWidth={2}
                        />
                    </div>
                    <span className={styles.actionLabel}>{formatNumber(likes)}</span>
                    <span className={styles.actionText}>Like</span>
                </button>

                {/* Comment Button */}
                <button
                    className={styles.actionBtn}
                    onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                >
                    <div className={styles.actionIconWrap}>
                        <MessageCircle size={28} color="white" strokeWidth={2} />
                    </div>
                    <span className={styles.actionLabel}>{formatNumber(comments)}</span>
                    <span className={styles.actionText}>Comment</span>
                </button>

                {/* Share Button */}
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setShowShare(true); }}>
                    <div className={styles.actionIconWrap}>
                        <Send size={26} color="white" strokeWidth={2} />
                    </div>
                    <span className={styles.actionLabel}>&nbsp;</span>
                    <span className={styles.actionText}>Share</span>
                </button>

                {/* Save Button */}
                <button
                    className={styles.actionBtn}
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                >
                    <div className={`${styles.actionIconWrap} ${isSaved ? styles.savedWrap : ''}`}>
                        <Bookmark
                            size={28}
                            fill={isSaved ? '#ffd700' : 'none'}
                            color={isSaved ? '#ffd700' : 'white'}
                            strokeWidth={2}
                        />
                    </div>
                    <span className={styles.actionLabel}>&nbsp;</span>
                    <span className={styles.actionText}>Save</span>
                </button>

                {/* Music Disk */}
                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setShowMusic(true); }}>
                    <div className={styles.musicDisk}>
                        <Music size={16} color="white" />
                    </div>
                    <span className={styles.actionText}>Audio</span>
                </button>
            </div>

            {/* Comment Sheet */}
            <ReelCommentSheet
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                reelId={reelId}
                commentsCount={comments}
            />

            {/* Share Sheet */}
            <ReelShareSheet
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                reelId={reelId}
            />

            {/* Music Sheet */}
            <ReelMusicSheet
                isOpen={showMusic}
                onClose={() => setShowMusic(false)}
            />
        </>
    );
};

export default ReelSidebar;
