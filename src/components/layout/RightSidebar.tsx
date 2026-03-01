'use client';

import React from 'react';
import Link from 'next/link';
// import { MOCK_USERS } from '@/constants/mockData';
import styles from './RightSidebar.module.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const RightSidebar = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const { isSupported, isSubscribed, isLoading, subscribe } = usePushNotifications();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Me
                const meRes = await fetch('/api/users/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    setCurrentUser(meData);
                }

                // Fetch Suggestions (all users for now, filter out me)
                const usersRes = await fetch('/api/users');
                if (usersRes.ok) {
                    const allUsers = await usersRes.json();
                    // Simple logic: take first 5 that are not me
                    setSuggestions(allUsers.filter((u: any) => u.id !== currentUser?.id).slice(0, 5));
                }
            } catch (err) {
                console.error('RightSidebar fetch error', err);
            }
        };
        fetchData();
    }, [currentUser?.id]);

    if (!currentUser) {
        return (
            <aside className={styles.rightSidebar}>
                {/* Skeleton Current User */}
                <div className={styles.userProfile}>
                    <div className={styles.userInfo}>
                        <div className={`${styles.skeleton} ${styles.skeletonAvatar}`}></div>
                        <div className={styles.userDetails}>
                            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80px' }}></div>
                            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '120px', marginBottom: 0 }}></div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Suggestions Header */}
                <div className={styles.suggestionsHeader} style={{ marginTop: '24px' }}>
                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                </div>

                {/* Skeleton Suggestions List */}
                <div className={styles.suggestionsList}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={styles.suggestionItem}>
                            <div className={styles.suggestionUserInfo}>
                                <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} style={{ width: '32px', height: '32px' }}></div>
                                <div className={styles.suggestionDetails}>
                                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '90px' }}></div>
                                    <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '110px', marginBottom: 0 }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside className={styles.rightSidebar}>
            {/* Current User */}
            <motion.div
                className={styles.userProfile}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Link href="/profile" className={styles.userInfo}>
                    <Image
                        src={currentUser.avatar || "https://i.pravatar.cc/150"}
                        alt={currentUser.username}
                        className={styles.avatar}
                        width={48}
                        height={48}
                    />
                    <div className={styles.userDetails}>
                        <div className={styles.username}>{currentUser.username}</div>
                        <div className={styles.fullName}>{currentUser.fullName || currentUser.username}</div>
                    </div>
                </Link>
                <motion.button
                    className={styles.switchBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Switch
                </motion.button>
            </motion.div>

            {/* Push Notifications Prompt */}
            <AnimatePresence>
                {isSupported && !isSubscribed && currentUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            marginBottom: '24px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid rgba(99, 102, 241, 0.15)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '10px', borderRadius: '12px' }}>
                                <Bell size={20} color="#6366f1" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Stay Updated</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>Turn on notifications</div>
                            </div>
                        </div>
                        <motion.button
                            onClick={subscribe}
                            disabled={isLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: '#6366f1',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            {isLoading ? '...' : 'Enable'}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggestions Header */}
            <div className={styles.suggestionsHeader}>
                <div className={styles.suggestionsTitle}>Suggested for you</div>
                <button className={styles.seeAllBtn}>See All</button>
            </div>

            {/* Suggestions List */}
            <div className={styles.suggestionsList}>
                {suggestions.map((user, index) => (
                    <motion.div
                        key={user.id}
                        className={styles.suggestionItem}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                    >
                        <div className={styles.suggestionUserInfo}>
                            <Link href={`/${user.username}`}>
                                <Image
                                    src={user.avatar || `https://i.pravatar.cc/150?u=${user.username}`}
                                    alt={user.username}
                                    className={styles.suggestionAvatar}
                                    width={36}
                                    height={36}
                                />
                            </Link>
                            <div className={styles.suggestionDetails}>
                                <Link href={`/${user.username}`} className={styles.suggestionUsername}>
                                    {user.username}
                                </Link>
                                <div className={styles.suggestionMeta}>Suggested for you</div>
                            </div>
                        </div>
                        <motion.button
                            className={styles.followBtn}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Follow
                        </motion.button>
                    </motion.div>
                ))}
            </div>

            {/* App Stores */}
            <motion.div
                className={styles.appStoreSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className={styles.appStoreTitle}>Get the App</div>
                <div className={styles.storeButtons}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                            alt="Download on the App Store"
                            className={styles.storeBadge}
                            width={135}
                            height={40}
                        />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Get it on Google Play"
                            className={styles.storeBadge}
                            width={135}
                            height={40}
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Tech Stack Info */}
            <motion.div
                className={styles.techInfo}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <span className={styles.techLabel}>Backend</span>
                Powered by a high-performance distributed architecture using Next.js 15, PostgreSQL, and Cassandra for planetary scale.
            </motion.div>
        </aside>
    );
};

export default RightSidebar;
