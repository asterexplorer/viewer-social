'use client';

import React from 'react';
import styles from './SuggestionsSidebar.module.css';
import { MOCK_USERS } from '@/lib/mockData';
import { motion } from 'framer-motion';

const SuggestionsSidebar = () => {
    // Current user (mock)
    const currentUser = MOCK_USERS[0];

    // Suggest some users (excluding current)
    const suggestions = MOCK_USERS.slice(1, 6);

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
                    <img src={currentUser.avatar} alt={currentUser.username} />
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.username}>{currentUser.username}</span>
                    <span className={styles.fullName}>{currentUser.name}</span>
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
                            <img src={user.avatar} alt={user.username} />
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
