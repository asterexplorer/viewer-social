'use client';

import React from 'react';
import Link from 'next/link';
// import { MOCK_USERS } from '@/constants/mockData';
import styles from './RightSidebar.module.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell } from 'lucide-react';

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
            <div className={styles.userProfile}>
                <Link href="/profile" className={styles.userInfo}>
                    <Image
                        src={currentUser.avatar || "https://i.pravatar.cc/150"}
                        alt={currentUser.username}
                        className={styles.avatar}
                        width={56}
                        height={56}

                    />
                    <div className={styles.userDetails}>
                        <div className={styles.username}>{currentUser.username}</div>
                        <div className={styles.fullName}>{currentUser.fullName || currentUser.username}</div>
                    </div>
                </Link>
                <button className={styles.switchBtn}>Switch</button>
            </div>

            {/* Push Notifications Prompt */}
            {isSupported && !isSubscribed && currentUser && (
                <div style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '50%' }}>
                            <Bell size={20} color="#38bdf8" />
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Stay Updated</div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Turn on notifications</div>
                        </div>
                    </div>
                    <button
                        onClick={subscribe}
                        disabled={isLoading}
                        style={{ background: '#fff', color: '#000', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? '...' : 'Enable'}
                    </button>
                </div>
            )}

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
                                <Image
                                    src={user.avatar || `https://i.pravatar.cc/150?u=${user.username}`}
                                    alt={user.username}
                                    className={styles.suggestionAvatar}
                                    width={32}
                                    height={32}

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
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="Download on the App Store"
                        className={styles.storeBadge}
                        width={135}
                        height={40}

                    />
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Get it on Google Play"
                        className={styles.storeBadge}
                        width={135}
                        height={40}

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
