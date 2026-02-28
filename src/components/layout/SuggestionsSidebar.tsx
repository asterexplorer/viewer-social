'use client';

import React from 'react';
import styles from './SuggestionsSidebar.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { useState, useEffect } from 'react';

const SuggestionsSidebar = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);

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
                    setSuggestions(allUsers.filter((u: any) => u.id !== currentUser?.id).slice(0, 5));
                }
            } catch (err) {
                console.error('SuggestionsSidebar fetch error', err);
            }
        };
        fetchData();
    }, [currentUser?.id]);

    if (!currentUser) {
        return (
            <aside className={styles.sidebar}>
                {/* Skeleton User Profile Snippet */}
                <div className={styles.profileSection}>
                    <div className={styles.userAvatar}>
                        <div className={`${styles.skeleton} ${styles.skeletonAvatar}`}></div>
                    </div>
                    <div className={styles.userInfo}>
                        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '80px' }}></div>
                        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '120px', marginBottom: 0 }}></div>
                    </div>
                </div>

                {/* Skeleton Suggestions Header */}
                <div className={styles.suggestionsHeader}>
                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                </div>

                {/* Skeleton Suggestions List */}
                <div className={styles.suggestionsList}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={styles.suggestionItem} style={{ marginBottom: '16px' }}>
                            <div className={styles.suggestionAvatar}>
                                <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} style={{ width: '32px', height: '32px' }}></div>
                            </div>
                            <div className={styles.suggestionInfo}>
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '90px' }}></div>
                                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '110px', marginBottom: 0 }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <motion.aside
            className={styles.sidebar}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* User Profile Snippet */}
            <div className={styles.profileSection}>
                <div className={styles.userAvatar}>
                    <Image src={currentUser.avatar || 'https://i.pravatar.cc/150'} alt={currentUser.username} width={44} height={44} />
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.username}>{currentUser.username}</span>
                    <span className={styles.fullName}>{currentUser.fullName || currentUser.username}</span>
                </div>
                <button className={styles.switchBtn}>Switch</button>
            </div>

            {/* Suggestions Header */}
            <div className={styles.suggestionsHeader}>
                <span className={styles.headerTitle}>Suggested for you</span>
                <button className={styles.seeAllBtn}>See All</button>
            </div>

            {/* Suggestions List */}
            <div className={styles.suggestionsList}>
                {suggestions.map((user, index) => (
                    <motion.div
                        key={user.id}
                        className={styles.suggestionItem}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={styles.suggestionAvatar}>
                            <Image src={user.avatar || 'https://i.pravatar.cc/150'} alt={user.username} width={32} height={32} />
                        </div>
                        <div className={styles.suggestionInfo}>
                            <span className={styles.suggestionUsername}>{user.username}</span>
                            <span className={styles.suggestionFollowedBy}>Suggested for you</span>
                        </div>
                        <button className={styles.followBtn}>Follow</button>
                    </motion.div>
                ))}
            </div>

            {/* Footer Links */}
            <footer className={styles.footer}>
                <nav className={styles.footerLinks}>
                    <a href="#">About</a>
                    <a href="#">Help</a>
                    <a href="#">Press</a>
                    <a href="#">API</a>
                    <a href="#">Jobs</a>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Locations</a>
                    <a href="#">Language</a>
                    <a href="#">Meta Verified</a>
                </nav>
                <p className={styles.copyright}>© 2026 VIEWER BY ASTER. <a href="/LICENSE" className={styles.licenseLink}>MIT Licensed</a></p>
            </footer>
        </motion.aside>
    );
};

export default SuggestionsSidebar;
