'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Play, Music } from 'lucide-react';
import styles from '@/app/reels/reels.module.css';
import ReelSidebar from './ReelSidebar';

interface ReelCardProps {
    reel: any;
    isActive: boolean;
    isMuted: boolean;
    onLike: (id: string, force?: boolean) => void;
    onSave: (id: string) => void;
    onFollow: (username: string) => void;
}

const ReelCard: React.FC<ReelCardProps> = ({
    reel,
    isActive,
    isMuted,
    onLike,
    onSave,
    onFollow
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(() => { });
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        onLike(reel.id, true);

        // Spawn multiple hearts at click position
        const newHearts = Array.from({ length: 3 }).map((_, i) => ({
            id: Date.now() + i,
            x: e.clientX + (Math.random() * 40 - 20),
            y: e.clientY + (Math.random() * 40 - 20)
        }));

        setHearts(prev => [...prev, ...newHearts]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => !newHearts.includes(h)));
        }, 1000);
    };

    return (
        <div className={styles.reelItem}>
            <div
                className={styles.videoWrapper}
                onDoubleClick={handleDoubleClick}
                onClick={togglePlayPause}
            >
                <video
                    ref={videoRef}
                    className={styles.video}
                    src={reel.video}
                    loop
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                />

                {hearts.map(heart => (
                    <div
                        key={heart.id}
                        className={`${styles.bigHeart} ${styles.animateBigHeart}`}
                        style={{ left: heart.x, top: heart.y }}
                    >
                        <Heart size={80} fill="currentColor" />
                    </div>
                ))}

                {!isPlaying && isActive && (
                    <div className={styles.playOverlay}>
                        <Play size={64} fill="white" color="white" opacity={0.8} />
                    </div>
                )}
            </div>

            <div className={styles.overlay} />

            <div className={styles.content}>
                <div className={styles.userInfo}>
                    <Image
                        src={reel.avatar || 'https://i.pravatar.cc/150'}
                        alt={reel.username}
                        className={styles.avatar}
                        width={44}
                        height={44}
                    />
                    <span className={styles.username}>{reel.username}</span>
                    <button
                        className={styles.followBtn}
                        onClick={(e) => { e.stopPropagation(); onFollow(reel.username); }}
                    >
                        {reel.isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>

                <p className={styles.caption}>{reel.caption}</p>

                <div className={styles.musicTrack}>
                    <Music size={14} className={styles.musicIcon} />
                    <div className={styles.musicTicker}>
                        <span>{reel.music || 'Original Audio'}</span>
                    </div>
                </div>
            </div>

            <ReelSidebar
                likes={reel.likesCount}
                comments={reel.commentsCount}
                isLiked={reel.isLiked}
                isSaved={reel.isSaved}
                onLike={() => onLike(reel.id)}
                onSave={() => onSave(reel.id)}
            />

            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};

export default ReelCard;
