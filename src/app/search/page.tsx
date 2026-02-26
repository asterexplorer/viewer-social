'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Compass, Users, Hash, Music, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './search.module.css';
import Image from 'next/image';
import Link from 'next/link';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Top');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [discoveryPosts, setDiscoveryPosts] = useState<any[]>([]);

    const tabs = [
        { id: 'Top', icon: <TrendingUp size={16} /> },
        { id: 'Accounts', icon: <Users size={16} /> },
        { id: 'Audio', icon: <Music size={16} /> },
        { id: 'Tags', icon: <Hash size={16} /> },
        { id: 'Places', icon: <MapPin size={16} /> }
    ];

    const trendingTags = [
        { name: '#photography', posts: '1.2M' },
        { name: '#travel', posts: '890K' },
        { name: '#ethereal', posts: '42K' },
        { name: '#visuals', posts: '215K' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch users for discovery
                const usersRes = await fetch('/api/users');
                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setRecentUsers(users.slice(0, 4));
                }

                // Fetch posts for explore
                const postsRes = await fetch('/api/posts');
                if (postsRes.ok) {
                    const posts = await postsRes.json();
                    setDiscoveryPosts(posts.slice(0, 9));
                }
            } catch (err) {
                console.error('Search page fetch error', err);
            }
        };
        fetchData();
    }, []);

    // Effect for search results
    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const allUsers = await res.json();
                    const filtered = allUsers.filter((u: any) =>
                        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    setResults(filtered);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className={styles.container}>
            <div className={styles.searchPage}>
                {/* Header with Search Bar */}
                <div className={styles.stickyHeader}>
                    <div className={`${styles.searchBarWrapper} ${isFocused ? styles.focused : ''}`}>
                        <Search size={22} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Discover creators, visions, and places..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        {searchTerm && (
                            <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                {searchTerm && (
                    <motion.div
                        className={styles.tabsContainer}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className={styles.tabIcon}>{tab.icon}</span>
                                {tab.id}
                            </button>
                        ))}
                    </motion.div>
                )}

                <div className={styles.contentArea}>
                    {isLoading ? (
                        <div className={styles.loadingArea} style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Loader2 className="animate-spin" size={60} color="#0095f6" />
                            <p style={{ marginTop: '20px', fontWeight: 800, color: '#6b7280' }}>Curating the best visions...</p>
                        </div>
                    ) : !searchTerm ? (
                        /* Discovery View */
                        <div className="fade-in">
                            {/* Suggested Creators - Premium Profile Cards */}
                            <div className={styles.sectionHeader}>
                                <h2>Suggested Connections</h2>
                                <button className={styles.seeAllBtn}>Discover More</button>
                            </div>
                            <div className={styles.recentList}>
                                {recentUsers.map(user => (
                                    <Link href={`/${user.username}`} key={user.id} className={styles.recentItem}>
                                        <Image
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                            alt={user.username}
                                            className={styles.recentAvatar}
                                            width={120}
                                            height={120}
                                            unoptimized
                                        />
                                        <div className={styles.recentInfo}>
                                            <span className={styles.recentUsername}>{user.username}</span>
                                            <span className={styles.recentSub}>{user.fullName || 'Digital Visionary'}</span>
                                        </div>

                                        {/* Immersive Showcase (4 Images) */}
                                        <div className={styles.showcaseGrid}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={styles.showcaseItem}>
                                                    <Image
                                                        src={`https://picsum.photos/seed/${user.username}${i}/400/250`}
                                                        alt="Showcase"
                                                        className={styles.showcaseImage}
                                                        width={200}
                                                        height={125}
                                                        unoptimized
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <button className={styles.viewProfileBtn}>Explore Vision</button>
                                    </Link>
                                ))}
                            </div>

                            {/* Trending Labels */}
                            <div className={styles.sectionHeader}>
                                <h2>Popular Tags</h2>
                                <TrendingUp size={24} color="#0095f6" />
                            </div>
                            <div className={styles.trendingGrid}>
                                {trendingTags.map((tag, i) => (
                                    <div key={i} className={styles.trendingTag}>
                                        <span className={styles.tagName}>{tag.name}</span>
                                        <span className={styles.tagCount}>{tag.posts} interactions</span>
                                    </div>
                                ))}
                            </div>

                            {/* Explore Grid */}
                            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
                                <h2>World Explore</h2>
                            </div>
                            <div className={styles.masonryGrid}>
                                {discoveryPosts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        className={styles.gridItem}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -10 }}
                                    >
                                        <Link href={`/p/${post.id}`}>
                                            <Image
                                                src={post.image || 'https://picsum.photos/seed/explore/600/800'}
                                                alt="Explore"
                                                fill
                                                className={styles.gridImage}
                                                unoptimized
                                            />
                                            <div className={styles.itemOverlay}>
                                                <Compass size={48} color="white" strokeWidth={1.5} />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Search Results View */
                        <div className={styles.resultsContainer}>
                            <AnimatePresence mode="popLayout">
                                {results.length > 0 ? (
                                    results.map((user, i) => (
                                        <motion.div
                                            key={user.id}
                                            className={styles.resultUserItem}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                        >
                                            <Link href={`/${user.username}`} className={styles.avatarWrapper}>
                                                <Image
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                    alt={user.username}
                                                    className={styles.resultAvatar}
                                                    width={80}
                                                    height={80}
                                                    unoptimized
                                                />
                                            </Link>
                                            <div className={styles.resultInfo}>
                                                <Link href={`/${user.username}`} className={styles.nameRow}>
                                                    <span className={styles.resultUsername}>{user.username}</span>
                                                    {user.isVerified && <div className={styles.verifiedBadge}>Verified</div>}
                                                </Link>
                                                <span className={styles.resultSub}>
                                                    {user.fullName || user.username} • {Math.floor(Math.random() * 500) + 10} visions shared
                                                </span>
                                            </div>
                                            <button className={styles.followBtn}>Connect</button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        className={styles.emptyState}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className={styles.emptyIcon}>
                                            <Compass size={56} />
                                        </div>
                                        <h3>No results found</h3>
                                        <p>Try searching for a different username or tag.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
