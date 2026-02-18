'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import styles from './shots.module.css';
import Loader from '@/components/Loader';
import { toggleShotLike, toggleSavedShot } from '@/app/actions';

const ShotsPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shots, setShots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [isPending, startTransition] = React.useTransition();

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchShots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/shots');
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.warn('Shots API responded with error:', res.status, text);
                setShots([]);
                return;
            }

            const data = await res.json().catch(() => null);

            if (!Array.isArray(data)) {
                console.warn('Shots API returned non-array, using empty list instead.');
                setShots([]);
                return;
            }
            setShots(data.map((s: any) => ({
                ...s,
                username: s.user.username,
                avatar: s.user.avatar,
                likesCount: s.likes?.length || 0,
                commentsCount: s.comments?.length || 0,
                isLiked: s.likes?.some((l: any) => l.userId === 'demo_user'),
                isSaved: false
            })));
        } catch (err) {
            console.error('Failed to fetch shots:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShots();
    }, []);

    useEffect(() => {
        if (loading || shots.length === 0) return;

        const observerOptions = {
            root: containerRef.current,
            threshold: 0.6,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                const index = videoRefs.current.indexOf(video);

                if (entry.isIntersecting) {
                    setTimeout(() => {
                        video.play().catch(err => console.log('Auto-play prevented:', err));
                        setCurrentIndex(index);
                    }, 300);
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [shots, loading]);

    useEffect(() => {
        const currentVideo = videoRefs.current[currentIndex];
        if (!currentVideo) return;

        const updateProgress = () => {
            if (currentVideo.duration) {
                setProgress((currentVideo.currentTime / currentVideo.duration) * 100);
            }
        };

        currentVideo.addEventListener('timeupdate', updateProgress);
        setIsPlaying(!currentVideo.paused);
        currentVideo.muted = isMuted;

        return () => {
            currentVideo.removeEventListener('timeupdate', updateProgress);
        };
    }, [currentIndex, isMuted, loading]);

    const togglePlayPause = () => {
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            if (currentVideo.paused) {
                currentVideo.play();
                setIsPlaying(true);
            } else {
                currentVideo.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleMute = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        videoRefs.current.forEach(video => {
            if (video) video.muted = newMutedState;
        });
    };

    const handleDoubleClick = (id: string) => {
        handleLike(id, true);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
    };

    const handleLike = (id: string, forceLike = false) => {
        const shot = shots.find(s => s.id === id);
        if (!shot) return;
        if (forceLike && shot.isLiked) return;

        const newIsLiked = !shot.isLiked;

        setShots((prev: any[]) => prev.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    isLiked: newIsLiked,
                    likesCount: newIsLiked ? s.likesCount + 1 : s.likesCount - 1
                };
            }
            return s;
        }));

        startTransition(async () => {
            try {
                await toggleShotLike(id);
            } catch (err) {
                console.error('Failed to toggle shot like:', err);
                setShots((prev: any[]) => prev.map(s => {
                    if (s.id === id) {
                        return {
                            ...s,
                            isLiked: !newIsLiked,
                            likesCount: !newIsLiked ? s.likesCount + 1 : s.likesCount - 1
                        };
                    }
                    return s;
                }));
            }
        });

    };

    const handleSave = (id: string) => {
        setShots(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, isSaved: !s.isSaved };
            }
            return s;
        }));

        startTransition(async () => {
            try {
                await toggleSavedShot(id);
            } catch (err) {
                console.error('Failed to toggle saved shot:', err);
                setShots(prev => prev.map(s => {
                    if (s.id === id) {
                        return { ...s, isSaved: !s.isSaved };
                    }
                    return s;
                }));
            }
        });
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className={styles.shotsContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Shots</h1>
            </div>

            {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader size="large" />
                </div>
            ) : shots.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <Play size={48} color="var(--accent)" />
                    <p style={{ color: 'var(--accent)' }}>No shots found.</p>
                </div>
            ) : (
                <div ref={containerRef} className={styles.shotsFeed}>
                    {shots.map((shot, index) => (
                        <div key={shot.id} className={styles.shotItem}>
                            <div className={styles.videoWrapper} onDoubleClick={() => handleDoubleClick(shot.id)} onClick={togglePlayPause}>
                                <video
                                    ref={el => { videoRefs.current[index] = el; }}
                                    className={styles.video}
                                    src={shot.video}
                                    loop
                                    muted={isMuted}
                                    playsInline
                                />
                                <div className={`${styles.bigHeart} ${showHeart && index === currentIndex ? styles.animateHeart : ''}`}>
                                    <Heart size={100} fill="white" color="white" />
                                </div>
                                {!isPlaying && index === currentIndex && (
                                    <div className={styles.playOverlay}><Play size={48} fill="white" /></div>
                                )}
                            </div>
                            <div className={styles.gradientOverlay} />
                            <div className={styles.progressBarContainer}>
                                <div className={styles.progressBar} style={{ width: `${index === currentIndex ? progress : 0}%` }} />
                            </div>
                            <div className={styles.topControls}>
                                <div className={styles.topRight}>
                                    <button className={styles.muteBtn} onClick={toggleMute}>
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.bottomInfo}>
                                <div className={styles.userInfo}>
                                    <img src={shot.avatar} alt={shot.username} className={styles.avatar} />
                                    <span className={styles.username}>{shot.username}</span>
                                    <button className={styles.followBtn}>Follow</button>
                                </div>
                                <p className={styles.caption}>{shot.caption}</p>
                                <div className={styles.musicInfo}>
                                    <div className={styles.musicIcon}>🎵</div>
                                    <div className={styles.musicTicker}><span>{shot.music || 'Original Audio'}</span></div>
                                </div>
                            </div>
                            <div className={styles.sideActions}>
                                <button className={`${styles.actionBtn} ${shot.isLiked ? styles.liked : ''}`} onClick={() => handleLike(shot.id)}>
                                    <Heart size={28} fill={shot.isLiked ? '#ff3b5c' : 'rgba(0,0,0,0.3)'} strokeWidth={shot.isLiked ? 0 : 2} />
                                    <span>{formatNumber(shot.likesCount)}</span>
                                </button>
                                <button className={styles.actionBtn}><MessageCircle size={28} /><span>{formatNumber(shot.commentsCount)}</span></button>
                                <button className={styles.actionBtn}><Send size={28} /></button>
                                <button className={`${styles.actionBtn} ${shot.isSaved ? styles.saved : ''}`} onClick={() => handleSave(shot.id)}>
                                    <Bookmark size={28} fill={shot.isSaved ? '#ffd700' : 'none'} color={shot.isSaved ? '#ffd700' : 'currentColor'} />
                                </button>
                                <button className={styles.actionBtn}><MoreHorizontal size={28} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShotsPage;
