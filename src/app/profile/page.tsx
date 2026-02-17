'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, UserSquare2, BadgeCheck, LayoutDashboard, Clapperboard, Play } from 'lucide-react';
import styles from './profile.module.css';
import { MOCK_USERS, MOCK_POSTS, MOCK_SHOTS, Post } from '@/lib/mockData';
import Link from 'next/link';
import Footer from '@/components/Footer';
import EditProfileModal from '@/components/EditProfileModal';
import ArchiveModal from '@/components/ArchiveModal';
import SettingsModal from '@/components/SettingsModal';
import PostDetailModal from '@/components/PostDetailModal';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    avatar: string;
    bio: string | null;
    followers: number;
    posts: Post[];
    website?: string;
    category?: string;
    isPrivate?: boolean;
}

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'posts' | 'shots' | 'saved' | 'tagged'>('posts');
    const [loading, setLoading] = useState(true);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // User state (initialized from mock)
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();

    useEffect(() => {
        // Initialize user data
        const currentUser = MOCK_USERS[0];
        const userPosts = MOCK_POSTS.filter(post => post.userId === currentUser.id);

        setUser({
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            bio: currentUser.bio || null,
            followers: currentUser.followers || 0,
            website: currentUser.website || 'portfolio.com',
            category: currentUser.category || 'Digital Creator',
            isPrivate: currentUser.isPrivate || false,
            posts: userPosts.map(post => ({
                id: post.id,
                image: post.image,
                likes: post.likes,
                comments: post.comments,
            })),
        } as User);
    }, []);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleEditProfile = () => {
        setIsEditProfileOpen(true);
    };

    const handleSaveProfile = (data: any) => {
        if (!user) return;
        setUser({
            ...user,
            username: data.username,
            bio: data.bio,
            avatar: data.avatar,
            website: data.website,
            category: data.category,
            isPrivate: data.isPrivate
        });
    };

    const handleSettings = () => {
        setIsSettingsOpen(true);
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    };

    const getVerificationBadge = (followers: number) => {
        if (followers >= 100000000) {
            return <BadgeCheck size={22} className={styles.goldTick} fill="#FFD700" color="#fff" />;
        } else if (followers >= 1000000) {
            return <BadgeCheck size={22} className={styles.silverTick} fill="#C0C0C0" color="#fff" />;
        } else if (followers >= 100000) {
            return <BadgeCheck size={22} className={styles.blueTick} fill="#0095F6" color="#fff" />;
        }
        return null; // No tick
    };

    if (loading || !user) {
        return (
            <div className="container" style={{ maxWidth: '935px', padding: '60px 16px' }}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    const totalLikes = user.posts.reduce((sum, post) => sum + post.likes, 0);

    return (
        <div className="container" style={{ maxWidth: '935px' }}>
            <div className={`${styles.profile} fade-in`}>
                {/* Profile Header */}
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarRing}>
                            <img
                                src={user.avatar || 'https://i.pravatar.cc/150?u=' + user.username}
                                alt={user.username}
                                className={styles.avatar}
                            />
                            <div className={styles.addStoryBadge}>+</div>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.topRow}>
                            <h2 className={styles.username}>{user.username}</h2>
                            {getVerificationBadge(user.followers)}

                            <div className={styles.actionButtons}>
                                <button className={styles.editButton} onClick={handleEditProfile}>
                                    Edit Profile
                                </button>
                                <button className={styles.archiveBtn} onClick={() => setIsArchiveOpen(true)}>
                                    View Archive
                                </button>
                                <button
                                    className={styles.monetizationBtn}
                                    onClick={() => router.push('/monetization')}
                                    title="Professional Dashboard"
                                >
                                    <LayoutDashboard size={18} />
                                </button>
                                <button className={styles.settingsBtn} onClick={handleSettings}>
                                    <Settings size={22} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{user.posts.length}</span>
                                <span className={styles.statLabel}>posts</span>
                            </div>
                            <div className={styles.statItem} title={`${user.followers.toLocaleString()} followers`}>
                                <span className={styles.statNumber}>{formatFollowers(user.followers)}</span>
                                <span className={styles.statLabel}>followers</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>450</span>
                                <span className={styles.statLabel}>following</span>
                            </div>
                        </div>

                        <div className={styles.bioSection}>
                            <h1 className={styles.fullName}>{user.username}</h1>
                            {user.category && user.category !== 'None' && <span className={styles.categoryLabel}>{user.category}</span>}
                            <div className={styles.bioText}>
                                {user.bio}
                                {user.website && (
                                    <>
                                        <br />
                                        🔗 <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className={styles.link}>{user.website}</a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Highlights */}
                <div className={styles.highlightsSection}>
                    {[
                        { id: 1, name: 'Travel', img: 'https://picsum.photos/seed/travel/200' },
                        { id: 2, name: 'Art', img: 'https://picsum.photos/seed/art/200' },
                        { id: 3, name: 'Food', img: 'https://picsum.photos/seed/food/200' },
                        { id: 4, name: 'Life', img: 'https://picsum.photos/seed/life/200' },
                        { id: 5, name: 'Tech', img: 'https://picsum.photos/seed/tech/200' },
                    ].map((item) => (
                        <div key={item.id} className={styles.highlightItem}>
                            <div className={styles.highlightCircle}>
                                <img src={item.img} alt={item.name} className={styles.highlightImg} />
                            </div>
                            <span className={styles.highlightName}>{item.name}</span>
                        </div>
                    ))}
                    <div className={styles.highlightItem}>
                        <div className={`${styles.highlightCircle} ${styles.newHighlight}`}>
                            <span>+</span>
                        </div>
                        <span className={styles.highlightName}>New</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        <Grid size={12} strokeWidth={2.5} />
                        <span>POSTS</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        <Bookmark size={12} strokeWidth={2.5} />
                        <span>SAVED</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'shots' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('shots')}
                    >
                        <Clapperboard size={12} strokeWidth={2.5} />
                        <span>SHOTS</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'tagged' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('tagged')}
                    >
                        <UserSquare2 size={12} strokeWidth={2.5} />
                        <span>TAGGED</span>
                    </button>
                </div>

                {/* Grid */}
                {activeTab === 'posts' && (
                    <div className={styles.grid}>
                        {user.posts.map((post, index) => (
                            <div
                                key={post.id}
                                className={styles.gridItem}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onClick={() => setSelectedPost(post)}
                            >
                                <img src={post.image} alt="" className={styles.gridImage} />
                                <div className={styles.overlay}>
                                    <div className={styles.overlayStats}>
                                        <span>❤️ {post.likes}</span>
                                        <span>💬 {post.comments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'shots' && (
                    <div className={styles.grid}>
                        {MOCK_SHOTS.map((shot, index) => (
                            <div
                                key={shot.id}
                                className={styles.gridItem}
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    aspectRatio: '9/16'
                                }}
                            >
                                <video
                                    src={shot.video}
                                    className={styles.gridImage}
                                    style={{ objectFit: 'cover' }}
                                    muted
                                    loop
                                    onMouseOver={e => e.currentTarget.play()}
                                    onMouseOut={e => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                                <div className={styles.overlay}>
                                    <div className={styles.overlayStats}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Play size={14} fill="white" /> {(shot.likes * 12).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className={styles.emptyTabState}>
                        <Bookmark size={64} strokeWidth={1} />
                        <h3>No Saved Posts</h3>
                        <p>Save posts to see them here</p>
                    </div>
                )}

                {activeTab === 'tagged' && (
                    <div className={styles.emptyTabState}>
                        <UserSquare2 size={64} strokeWidth={1} />
                        <h3>No Tagged Posts</h3>
                        <p>Posts you&apos;re tagged in will appear here</p>
                    </div>
                )}

                {activeTab === 'posts' && user.posts.length === 0 && (
                    <div className={styles.noPosts}>
                        <div className={styles.noPostsIcon}>📷</div>
                        <h3>No Posts Yet</h3>
                        <p>When you share photos, they will appear here.</p>
                    </div>
                )}

                <div style={{ marginTop: '48px', paddingBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Footer />
                </div>
            </div>

            {user && (
                <EditProfileModal
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    initialData={{
                        username: user.username,
                        fullName: 'Aster Viewer', // Using a default or adding fullName to User interface later
                        bio: user.bio || '',
                        avatar: user.avatar
                    }}
                    onSave={handleSaveProfile}
                />
            )}

            {user && (
                <ArchiveModal
                    isOpen={isArchiveOpen}
                    onClose={() => setIsArchiveOpen(false)}
                    posts={MOCK_POSTS.filter(p => p.userId === user.id)}
                />
            )}

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onProfileUpdate={handleSaveProfile}
            />

            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

export default ProfilePage;

