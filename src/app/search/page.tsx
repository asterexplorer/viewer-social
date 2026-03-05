'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Compass, Users, Hash, Music, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './search.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import Loader from '@/components/common/Loader';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Top');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [discoveryPosts, setDiscoveryPosts] = useState<any[]>([]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        triggerHaptic(ImpactStyle.Light);
    };

    const handleFocus = () => {
        setIsFocused(true);
        triggerHaptic(ImpactStyle.Light);
    };

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
        <div className={`${styles.container} ${styles.lightMode}`}>
            <div className={`${styles.bgBlob} ${styles.blob1}`} />
            <div className={`${styles.bgBlob} ${styles.blob2}`} />

            <div className={styles.searchPage}>
                {/* Header with Search Bar */}
                <div className={styles.stickyHeader}>
                    <motion.div
                        className={styles.headerTop}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className={styles.pageTitle}>Explore</h1>
                        <div className={styles.userAction}>
                            <button className={styles.actionCircle}>
                                <Compass size={20} />
                            </button>
                            <button className={styles.actionCircle}>
                                <Users size={20} />
                            </button>
                        </div>
                    </motion.div>

                    <div className={`${styles.searchBarWrapper} ${isFocused ? styles.focused : ''}`}>
                        <Search size={22} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Discover creators, visions, and places..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={() => setIsFocused(false)}
                        />
                        {searchTerm && (
                            <button className={styles.clearBtn} onClick={() => { setSearchTerm(''); triggerHaptic(ImpactStyle.Light); }}>
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
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <span className={styles.tabIcon}>{tab.icon}</span>
                                {tab.id}
                            </button>
                        ))}
                    </motion.div>
                )}

                <div className={styles.contentArea}>
                    {isLoading ? (
                        <div className={styles.loadingArea}>
                            <Loader size="large" />
                            <p className={styles.loadingText}>Curating the best visions...</p>
                        </div>
                    ) : !searchTerm ? (
                        /* Discovery View */
                        <div className={styles.resultsContainer}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className={styles.sectionHeader}
                            >
                                <h2>Suggested Connections</h2>
                            </motion.div>

                            <AnimatePresence mode="popLayout">
                                {recentUsers.map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        className={styles.resultUserItem}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link href={`/${user.username}`} prefetch={false} className={styles.avatarWrapper}>
                                            <Image
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                alt={user.username}
                                                className={styles.resultAvatar}
                                                width={80}
                                                height={80}
                                            />
                                        </Link>
                                        <div className={styles.resultInfo}>
                                            <Link href={`/${user.username}`} prefetch={false} className={styles.nameRow}>
                                                <span className={styles.resultUsername}>{user.username}</span>
                                                {user.isVerified && <div className={styles.verifiedBadge}>Verified</div>}
                                            </Link>
                                            <div className={styles.resultDetails}>
                                                <span className={styles.resultFullName}>{user.fullName || 'Digital Creator'}</span>
                                            </div>
                                        </div>
                                        <Link href={`/${user.username}`} prefetch={false}>
                                            <button className={styles.followBtn}>View</button>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
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
                                            <Link href={`/${user.username}`} prefetch={false} className={styles.avatarWrapper}>
                                                <Image
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                    alt={user.username}
                                                    className={styles.resultAvatar}
                                                    width={80}
                                                    height={80}

                                                />
                                            </Link>
                                            <div className={styles.resultInfo}>
                                                <Link href={`/${user.username}`} prefetch={false} className={styles.nameRow}>
                                                    <span className={styles.resultUsername}>{user.username}</span>
                                                    {user.isVerified && <div className={styles.verifiedBadge}>Verified</div>}
                                                </Link>
                                                <div className={styles.resultDetails}>
                                                    <span className={styles.resultFullName}>{user.fullName || 'Digital Creator'}</span>
                                                    <span className={styles.resultStats}>
                                                        • {Math.floor(Math.random() * 500) + 10} visions shared
                                                    </span>
                                                </div>
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
