'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import styles from './reels.module.css';
import ReelCard from '@/components/reels/ReelCard';
import Loader from '@/components/common/Loader';
import { toggleShotLike, toggleSavedShot, trackView, toggleFollow } from '@/app/actions';

const ReelsPage = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
    const [, startTransition] = useTransition();

    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/shots');
            if (res.ok) {
                const data = await res.json();
                setReels(data.map((r: any) => ({
                    ...r,
                    username: r.user.username,
                    avatar: r.user.avatar,
                    likesCount: r.likes?.length || 0,
                    commentsCount: r.comments?.length || 0,
                    isLiked: false,
                    isSaved: false,
                    isFollowing: false
                })));
            }
        } catch (err) {
            console.error('Failed to fetch reels:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    useEffect(() => {
        if (loading || reels.length === 0) return;

        const observerOptions = {
            root: containerRef.current,
            threshold: 0.6,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0');
                    setCurrentIndex(index);

                    const reelId = entry.target.getAttribute('data-id');
                    if (reelId) trackView(reelId, 'SHOT');
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);
        const children = containerRef.current?.querySelectorAll('[data-role="reel-item"]');

        children?.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, [reels.length, loading]);

    const handleLike = (id: string, force = false) => {
        setReels(prev => prev.map(r => {
            if (r.id === id) {
                if (force && r.isLiked) return r;
                const newIsLiked = !r.isLiked;
                return {
                    ...r,
                    isLiked: newIsLiked,
                    likesCount: newIsLiked ? r.likesCount + 1 : r.likesCount - 1
                };
            }
            return r;
        }));

        startTransition(async () => {
            try {
                await toggleShotLike(id);
            } catch (err) {
                console.error('Failed to toggle like:', err);
            }
        });
    };

    const handleSave = (id: string) => {
        setReels(prev => prev.map(r => {
            if (r.id === id) {
                return { ...r, isSaved: !r.isSaved };
            }
            return r;
        }));

        startTransition(async () => {
            try {
                await toggleSavedShot(id);
            } catch (err) {
                console.error('Failed to toggle save:', err);
            }
        });
    };

    const handleFollow = (username: string) => {
        setReels(prev => prev.map(r => {
            if (r.username === username) {
                return { ...r, isFollowing: !r.isFollowing };
            }
            return r;
        }));

        startTransition(async () => {
            try {
                await toggleFollow(username);
            } catch (err) {
                console.error('Failed to follow:', err);
            }
        });
    };

    return (
        <div className={styles.reelsContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    Following
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'foryou' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('foryou')}
                >
                    For You
                </button>
            </div>

            {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader size="large" />
                </div>
            ) : reels.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <p>No reels found.</p>
                </div>
            ) : (
                <div ref={containerRef} className={styles.reelsFeed}>
                    {reels.map((reel, index) => (
                        <div
                            key={reel.id}
                            data-role="reel-item"
                            data-index={index}
                            data-id={reel.id}
                        >
                            <ReelCard
                                reel={reel}
                                isActive={index === currentIndex}
                                isMuted={isMuted}
                                onLike={handleLike}
                                onSave={handleSave}
                                onFollow={handleFollow}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReelsPage;
