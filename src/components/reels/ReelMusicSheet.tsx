'use client';

import React, { useState } from 'react';
import { X, Search, Play, Pause, Music, Heart, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ReelMusicSheet.module.css';

interface Song {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: string;
    plays: string;
    cover: string; // gradient or emoji
    isLiked: boolean;
    isTrending?: boolean;
}

const INTERNATIONAL_SONGS: Song[] = [
    { id: 'i1', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop / Synth-pop', duration: '3:20', plays: '3.2B', cover: 'linear-gradient(135deg, #ff0080, #7928ca)', isLiked: true, isTrending: true },
    { id: 'i2', title: 'As It Was', artist: 'Harry Styles', genre: 'Indie Pop', duration: '2:37', plays: '2.8B', cover: 'linear-gradient(135deg, #f093fb, #f5576c)', isLiked: false, isTrending: true },
    { id: 'i3', title: 'Levitating', artist: 'Dua Lipa', genre: 'Disco / Dance-pop', duration: '3:23', plays: '1.9B', cover: 'linear-gradient(135deg, #4facfe, #00f2fe)', isLiked: false },
    { id: 'i4', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', genre: 'Pop / R&B', duration: '2:21', plays: '1.8B', cover: 'linear-gradient(135deg, #43e97b, #38f9d7)', isLiked: true },
    { id: 'i5', title: 'Unholy', artist: 'Sam Smith & Kim Petras', genre: 'Pop', duration: '2:37', plays: '1.5B', cover: 'linear-gradient(135deg, #fa709a, #fee140)', isLiked: false, isTrending: true },
    { id: 'i6', title: 'Flowers', artist: 'Miley Cyrus', genre: 'Pop', duration: '3:21', plays: '1.4B', cover: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', isLiked: false },
    { id: 'i7', title: 'Anti-Hero', artist: 'Taylor Swift', genre: 'Indie Pop', duration: '3:20', plays: '1.7B', cover: 'linear-gradient(135deg, #667eea, #764ba2)', isLiked: true, isTrending: true },
    { id: 'i8', title: 'Calm Down', artist: 'Rema & Selena Gomez', genre: 'Afrobeats', duration: '3:38', plays: '1.2B', cover: 'linear-gradient(135deg, #f77062, #fe5196)', isLiked: false },
];

const LOCAL_SONGS: Song[] = [
    { id: 'l1', title: 'Kesariya', artist: 'Arijit Singh', genre: 'Bollywood / Romantic', duration: '4:28', plays: '920M', cover: 'linear-gradient(135deg, #f6d365, #fda085)', isLiked: true, isTrending: true },
    { id: 'l2', title: 'Naatu Naatu', artist: 'Rahul Sipligunj', genre: 'Telugu Folk / Dance', duration: '3:54', plays: '880M', cover: 'linear-gradient(135deg, #84fab0, #8fd3f4)', isLiked: false, isTrending: true },
    { id: 'l3', title: 'Butta Bomma', artist: 'Armaan Malik', genre: 'Telugu Pop', duration: '3:40', plays: '650M', cover: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', isLiked: false },
    { id: 'l4', title: 'Pasoori', artist: 'Ali Sethi & Shae Gill', genre: 'Coke Studio / Folk', duration: '5:11', plays: '800M', cover: 'linear-gradient(135deg, #ffecd2, #fcb69f)', isLiked: true, isTrending: true },
    { id: 'l5', title: 'Kattu Mooliyo', artist: 'Sid Sriram', genre: 'Malayalam Indie', duration: '3:54', plays: '410M', cover: 'linear-gradient(135deg, #d4fc79, #96e6a1)', isLiked: false },
    { id: 'l6', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', genre: 'Bollywood Pop', duration: '3:52', plays: '740M', cover: 'linear-gradient(135deg, #89f7fe, #66a6ff)', isLiked: false },
    { id: 'l7', title: 'Tere Vaaste', artist: 'Varun Jain & Sachin-Jigar', genre: 'Bollywood', duration: '3:26', plays: '520M', cover: 'linear-gradient(135deg, #fddb92, #d1fdff)', isLiked: true },
    { id: 'l8', title: 'Manike Mage Hithe', artist: 'Yohani', genre: 'Sinhala Pop', duration: '2:53', plays: '490M', cover: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', isLiked: false, isTrending: true },
];

interface ReelMusicSheetProps {
    isOpen: boolean;
    onClose: () => void;
    _currentMusic?: string;
    onSelectSong?: (song: Song) => void;
}

const ReelMusicSheet: React.FC<ReelMusicSheetProps> = ({ isOpen, onClose, _currentMusic, onSelectSong }) => {
    const [tab, setTab] = useState<'international' | 'local'>('international');
    const [search, setSearch] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set(['i1', 'i4', 'i7', 'l1', 'l4', 'l7']));

    const songs = tab === 'international' ? INTERNATIONAL_SONGS : LOCAL_SONGS;

    const filtered = songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase()) ||
        s.genre.toLowerCase().includes(search.toLowerCase())
    );

    const togglePlay = (id: string) => {
        setPlayingId(prev => prev === id ? null : id);
    };

    const toggleLike = (id: string) => {
        setLikedSongs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={styles.sheet}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    >
                        {/* Handle */}
                        <div className={styles.handle} />

                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <Music size={20} className={styles.headerIcon} />
                                <span className={styles.headerTitle}>Music Library</span>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className={styles.searchWrap}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search songs, artists, genres..."
                                className={styles.searchInput}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Tabs */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${tab === 'international' ? styles.activeTab : ''}`}
                                onClick={() => setTab('international')}
                            >
                                🌍 International
                            </button>
                            <button
                                className={`${styles.tab} ${tab === 'local' ? styles.activeTab : ''}`}
                                onClick={() => setTab('local')}
                            >
                                🎵 Local & Regional
                            </button>
                        </div>

                        {/* Songs List */}
                        <div className={styles.songsList}>
                            {filtered.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Music size={40} className={styles.emptyIcon} />
                                    <p>No songs found for "{search}"</p>
                                </div>
                            ) : (
                                filtered.map((song, i) => {
                                    const isPlaying = playingId === song.id;
                                    const isLiked = likedSongs.has(song.id);
                                    return (
                                        <motion.div
                                            key={song.id}
                                            className={`${styles.songItem} ${isPlaying ? styles.playing : ''}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                        >
                                            {/* Cover */}
                                            <div
                                                className={styles.songCover}
                                                style={{ background: song.cover }}
                                                onClick={() => togglePlay(song.id)}
                                            >
                                                {isPlaying ? (
                                                    <motion.div
                                                        className={styles.equalizer}
                                                        animate={{ opacity: [1, 0.5, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                                    >
                                                        <span /><span /><span /><span />
                                                    </motion.div>
                                                ) : (
                                                    <Play size={18} fill="white" color="white" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className={styles.songInfo}>
                                                <div className={styles.songTitleRow}>
                                                    <span className={styles.songTitle}>{song.title}</span>
                                                    {song.isTrending && (
                                                        <span className={styles.trendingBadge}>
                                                            <TrendingUp size={10} /> Trending
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={styles.songArtist}>{song.artist}</span>
                                                <span className={styles.songMeta}>{song.genre} · {song.duration} · {song.plays} plays</span>
                                            </div>

                                            {/* Actions */}
                                            <div className={styles.songActions}>
                                                <button
                                                    className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
                                                    onClick={() => toggleLike(song.id)}
                                                >
                                                    <Heart
                                                        size={18}
                                                        fill={isLiked ? '#ff3b5c' : 'none'}
                                                        color={isLiked ? '#ff3b5c' : '#94a3b8'}
                                                    />
                                                </button>
                                                <button
                                                    className={`${styles.useBtn} ${isPlaying ? styles.useBtnActive : ''}`}
                                                    onClick={() => { onSelectSong?.(song); onClose(); }}
                                                >
                                                    Use
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Now Playing Bar */}
                        <AnimatePresence>
                            {playingId && (() => {
                                const song = [...INTERNATIONAL_SONGS, ...LOCAL_SONGS].find(s => s.id === playingId);
                                if (!song) return null;
                                return (
                                    <motion.div
                                        className={styles.nowPlaying}
                                        initial={{ y: 80 }}
                                        animate={{ y: 0 }}
                                        exit={{ y: 80 }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                    >
                                        <div className={styles.npCover} style={{ background: song.cover }}>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                                className={styles.npDisk}
                                            >
                                                <Music size={12} color="white" />
                                            </motion.div>
                                        </div>
                                        <div className={styles.npInfo}>
                                            <span className={styles.npTitle}>{song.title}</span>
                                            <span className={styles.npArtist}>{song.artist}</span>
                                        </div>
                                        <button
                                            className={styles.npPlayBtn}
                                            onClick={() => setPlayingId(null)}
                                        >
                                            <Pause size={18} fill="white" color="white" />
                                        </button>
                                        <button
                                            className={styles.npUseBtn}
                                            onClick={() => { onSelectSong?.(song); onClose(); }}
                                        >
                                            Use
                                        </button>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>

                        <div className={styles.bottomSpacer} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReelMusicSheet;
