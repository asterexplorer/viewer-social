'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_USERS } from '@/lib/mockData';
import styles from './RightSidebar.module.css';

const RightSidebar = () => {
    // Filter out the "current user" (first one) and take next 5 for suggestions
    const currentUser = MOCK_USERS[0];
    const suggestions = MOCK_USERS.slice(1, 6);

    return (
        <aside className={styles.rightSidebar}>
            {/* Current User */}
            <div className={styles.userProfile}>
                <Link href="/profile" className={styles.userInfo}>
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        className={styles.avatar}
                    />
                    <div className={styles.userDetails}>
                        <div className={styles.username}>{currentUser.username}</div>
                        <div className={styles.fullName}>{currentUser.name}</div>
                    </div>
                </Link>
                <button className={styles.switchBtn}>Switch</button>
            </div>

            {/* Suggestions Header */}
            <div className={styles.suggestionsHeader}>
                <div className={styles.suggestionsTitle}>Suggested for you</div>
                <button className={styles.seeAllBtn}>See All</button>
            </div>

            {/* Suggestions List */}
            <div className={styles.suggestionsList}>
                {suggestions.map((user) => (
                    <div key={user.id} className={styles.suggestionItem}>
                        <div className={styles.suggestionUserInfo}>
                            <Link href={`/${user.username}`}>
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className={styles.suggestionAvatar}
                                />
                            </Link>
                            <div className={styles.suggestionDetails}>
                                <Link href={`/${user.username}`} className={styles.suggestionUsername}>
                                    {user.username}
                                </Link>
                                <div className={styles.suggestionMeta}>Suggested for you</div>
                            </div>
                        </div>
                        <button className={styles.followBtn}>Follow</button>
                    </div>
                ))}
            </div>

            {/* App Stores */}
            <div className={styles.appStoreSection}>
                <div className={styles.appStoreTitle}>Get the App</div>
                <div className={styles.storeButtons}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="Download on the App Store"
                        className={styles.storeBadge}
                    />
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Get it on Google Play"
                        className={styles.storeBadge}
                    />
                </div>
            </div>


            {/* Tech Stack Info */}
            <div className={styles.techInfo}>
                <span className={styles.techLabel}>Databases</span>
                PostgreSQL is used as the primary relational database for structured data like user profiles and comments, while Cassandra is used for highly distributed data like activity logs and analytics.
            </div>

        </aside>
    );
};

export default RightSidebar;
