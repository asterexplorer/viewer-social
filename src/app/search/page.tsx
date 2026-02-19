'use client';

import React, { useState } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import styles from './search.module.css';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Top');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const tabs = ['Top', 'Accounts', 'Audio', 'Tags', 'Places'];

    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [discoveryPosts, setDiscoveryPosts] = useState<any[]>([]);

    const trendingTags = [
        { name: '#photography', posts: '1.2M' },
        { name: '#travel', posts: '890K' },
        { name: '#art', posts: '500K' },
        { name: '#nature', posts: '2.5M' },
    ];

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch recent users (simulate with all users for now)
                const usersRes = await fetch('/api/users');
                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setRecentUsers(users.slice(0, 5));
                }

                // Fetch posts for explore
                const postsRes = await fetch('/api/posts');
                if (postsRes.ok) {
                    const posts = await postsRes.json();
                    // Transform posts to grid format if needed
                    const gridPosts = posts.map((p: any, i: number) => ({
                        id: p.id,
                        image: p.image,
                        span: i % 5 === 0 ? 'span 2' : 'span 1' // Simple grid logic
                    }));
                    setDiscoveryPosts(gridPosts);
                }
            } catch (err) {
                console.error('Search page fetch error', err);
            }
        };
        fetchData();
    }, []);

    // Simulate search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term) {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.searchPage} fade-in`}>

                {/* Sticky Header */}
                <div className={styles.stickyHeader}>
                    <div className={`${styles.searchBarWrapper} ${isFocused ? styles.focused : ''}`}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search"
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
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

                {/* Filter Tabs (Only show when searching or always if preferred, let's show when items are present or searching) */}
                {searchTerm && (
                    <div className={styles.tabsContainer}>
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Content */}
                <div className={styles.contentArea}>

                    {isLoading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : !searchTerm ? (
                        /* Default / Discovery View */
                        <div className="fade-in">
                            {/* Search History */}
                            <div className={styles.sectionHeader}>
                                <h2>Recent</h2>
                                <button className={styles.seeAllBtn}>See All</button>
                            </div>
                            <div className={styles.recentList}>
                                {recentUsers.map(user => (
                                    <div key={user.id} className={styles.recentItem}>
                                        <img src={user.avatar} alt={user.username} className={styles.recentAvatar} />
                                        <div className={styles.recentInfo}>
                                            <span className={styles.recentUsername}>{user.username}</span>
                                            <span className={styles.recentSub}>{user.fullName}</span>
                                        </div>
                                        <X size={14} className={styles.removeRecent} />
                                    </div>
                                ))}
                            </div>

                            {/* Trending Tags */}
                            <div className={styles.sectionHeader} style={{ marginTop: '24px' }}>
                                <h2>Trending</h2>
                                <TrendingUp size={16} className={styles.trendingIcon} />
                            </div>
                            <div className={styles.trendingGrid}>
                                {trendingTags.map((tag, i) => (
                                    <div key={i} className={styles.trendingTag}>
                                        <span className={styles.tagName}>{tag.name}</span>
                                        <span className={styles.tagCount}>{tag.posts} posts</span>
                                    </div>
                                ))}
                            </div>

                            {/* Explore / For You Grid */}
                            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
                                <h2>Explore</h2>
                            </div>
                            <div className={styles.masonryGrid}>
                                {discoveryPosts.map((post, i) => (
                                    <div
                                        key={post.id}
                                        className={styles.gridItem}
                                        style={{ gridRow: post.span, animationDelay: `${i * 0.1}s` }}
                                    >
                                        <img src={post.image} alt="Explore" loading="lazy" />
                                        <div className={styles.itemOverlay}>
                                            <TrendingUp size={24} color="white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Search Results View */
                        <div className={`${styles.resultsContainer} fade-in`}>
                            {activeTab === 'Top' || activeTab === 'Accounts' ? (
                                <div className={styles.peopleList}>
                                    {recentUsers.filter(u => u.username.includes(searchTerm.toLowerCase())).map(user => (
                                        <div key={user.id} className={styles.resultUserItem}>
                                            <img src={user.avatar} alt={user.username} className={styles.resultAvatar} />
                                            <div className={styles.resultInfo}>
                                                <div className={styles.nameRow}>
                                                    <span className={styles.resultUsername}>{user.username}</span>
                                                    {user.isVerified && <div className={styles.verifiedBadge}>✓</div>}
                                                </div>
                                                <span className={styles.resultSub}>{user.fullName} • {user.followers} followers</span>
                                            </div>
                                            <button className={styles.followBtn}>Follow</button>
                                        </div>
                                    ))}
                                    {recentUsers.filter(u => u.username.includes(searchTerm.toLowerCase())).length === 0 && (
                                        <div className={styles.emptyState}>No results found.</div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    No results for {activeTab} yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
