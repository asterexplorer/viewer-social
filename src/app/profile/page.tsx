'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, UserSquare2, BadgeCheck, LayoutDashboard, Clapperboard, Play, Heart, MessageCircle, AlertCircle, Plus, Globe, Tag, SquareStack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './profile.module.css';
import { useRouter } from 'next/navigation';
import SavedTab from './SavedTab';
import MonetizationTab from './MonetizationTab';
import Image from 'next/image';

import Footer from '@/components/layout/Footer';
import EditProfileModal from '@/components/modals/EditProfileModal';
import ArchiveModal from '@/components/modals/ArchiveModal';
import SettingsModal from '@/components/modals/SettingsModal';
import PostDetailModal from '@/components/modals/PostDetailModal';
import Loader from '@/components/common/Loader';

interface Post {
    id: string;
    image: string;
    likes: number;
    comments: number;
    userId: string;
    caption: string;
    createdAt: Date;
    isLiked: boolean;
    isSaved: boolean;
    user: {
        id: string;
        username: string;
        name: string;
        avatar: string;
    };
}

interface Shot {
    id: string;
    video: string;
    likes: number;
    comments: number;
    userId: string;
}

interface User {
    id: string;
    username: string;
    avatar: string;
    bio: string | null;
    followers: number;
    following: number;
    posts: Post[];
    shots: Shot[];
    website?: string;
    category?: string;
    isPrivate?: boolean;
    fullName?: string;
}

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'posts' | 'shots' | 'saved' | 'tagged' | 'monetization'>('posts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [user, setUser] = useState<User | null>(null);
    const [postsState, setPostsState] = useState<Post[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                const meRes = await fetch('/api/users/me');
                if (!meRes.ok) {
                    const errorData = await meRes.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to fetch user profile');
                }
                const meData = await meRes.json();

                const postsRes = await fetch('/api/posts?limit=100');
                let myPosts: any[] = [];
                if (postsRes.ok) {
                    const allPosts = await postsRes.json();
                    myPosts = allPosts.filter((p: any) => p.userId === meData.id);
                }

                const formattedPosts = myPosts.map((post: any) => ({
                    id: post.id,
                    image: post.image,
                    likes: post.likes ? post.likes.length : 0,
                    comments: post.comments ? post.comments.length : 0,
                    userId: post.userId || '',
                    caption: post.caption || '',
                    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(0),
                    isLiked: false,
                    isSaved: false,
                    user: {
                        id: post.user?.id || '',
                        username: post.user?.username || meData.username,
                        name: post.user?.name || '',
                        avatar: post.user?.avatar || meData.avatar
                    }
                }));

                setUser({
                    id: meData.id,
                    username: meData.username,
                    avatar: meData.avatar,
                    bio: meData.bio || null,
                    followers: meData._count?.followedBy || 0,
                    following: meData._count?.following || 128,
                    website: meData.website || '',
                    category: meData.category || 'Digital Creator',
                    isPrivate: false,
                    posts: formattedPosts,
                    shots: [], // Mocking shots as empty for now or fetch if available
                } as unknown as User);

                setPostsState(formattedPosts);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEditProfile = () => {
        router.push('/settings');
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

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const getVerificationBadge = (followers: number) => {
        if (followers >= 1000000) return <BadgeCheck size={32} className={styles.blueTick} />;
        return null;
    };

    if (error) {
        return (
            <div className="container" style={{ maxWidth: '1000px', padding: '100px 16px', textAlign: 'center' }}>
                <div className={styles.emptyTabState}>
                    <AlertCircle size={80} color="#ef4444" strokeWidth={1.5} />
                    <h3 style={{ fontSize: '32px', margin: '24px 0' }}>Profile Unavailable</h3>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>{error}</p>
                    <button className={styles.editButton} style={{ marginTop: '32px' }} onClick={() => window.location.reload()}>Retry Access</button>
                </div>
            </div>
        );
    }

    if (loading || !user) {
        return (
            <div className="container" style={{ maxWidth: '1000px', padding: '100px 16px', display: 'flex', justifyContent: 'center' }}>
                <Loader size="large" />
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', paddingTop: '40px' }}>
            <div className="neural-grid" />

            <motion.div
                className={styles.profile}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Profile Header */}
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarRing}>
                            <Image
                                src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.username}
                                alt={user.username}
                                className={styles.avatar}
                                width={160}
                                height={160}
                                unoptimized
                            />
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.topRow}>
                            <h2 className={styles.username}>{user.username}</h2>
                            {getVerificationBadge(user.followers)}

                            <div className={styles.actionButtons}>
                                <button className={styles.editButton} onClick={handleEditProfile}>Edit Profile</button>
                                <button className={styles.archiveBtn} onClick={() => setIsArchiveOpen(true)}>Archive</button>
                                <button className={styles.settingsBtn} onClick={() => router.push('/settings')}><Settings size={22} /></button>
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{user.posts.length}</span>
                                <span className={styles.statLabel}>Visions</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{formatFollowers(user.followers)}</span>
                                <span className={styles.statLabel}>Connections</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{user.following}</span>
                                <span className={styles.statLabel}>Following</span>
                            </div>
                        </div>

                        <div className={styles.bioSection}>
                            {user.category && user.category !== 'None' && <span className={styles.categoryLabel}>{user.category}</span>}
                            <div className={styles.bioText}>
                                {user.bio || "No bio yet. Share your vision with the world."}
                                {user.website && (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Globe size={18} color="#0095f6" />
                                        <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0095f6', fontWeight: 700, textDecoration: 'none' }}>{user.website}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Highlights */}
                <div className={styles.highlightsSection}>
                    {[
                        { id: 1, name: 'Visions', img: 'https://picsum.photos/seed/v/200' },
                        { id: 2, name: 'Spaces', img: 'https://picsum.photos/seed/s/200' },
                        { id: 3, name: 'Studio', img: 'https://picsum.photos/seed/st/200' },
                    ].map((item, idx) => (
                        <motion.div
                            key={item.id}
                            className={styles.highlightItem}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                            <div className={styles.highlightCircle}>
                                <Image src={item.img} alt={item.name} className={styles.highlightImg} width={90} height={90} unoptimized />
                            </div>
                            <span className={styles.highlightName}>{item.name}</span>
                        </motion.div>
                    ))}
                    <div className={styles.highlightItem}>
                        <div className={styles.highlightCircle} style={{ background: 'rgba(0,149,246,0.05)', border: '2px dashed #0095f6' }}>
                            <Plus size={32} color="#0095f6" strokeWidth={1.5} />
                        </div>
                        <span className={styles.highlightName} style={{ color: '#0095f6' }}>New</span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`} onClick={() => setActiveTab('posts')}>
                        <Grid size={18} /> <span>VISIONS</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'shots' ? styles.activeTab : ''}`} onClick={() => setActiveTab('shots')}>
                        <Clapperboard size={18} /> <span>SHOTS</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`} onClick={() => setActiveTab('saved')}>
                        <Bookmark size={18} /> <span>SAVED</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'tagged' ? styles.activeTab : ''}`} onClick={() => setActiveTab('tagged')}>
                        <SquareStack size={18} /> <span>TAGGED</span>
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'monetization' ? styles.activeTab : ''}`} onClick={() => setActiveTab('monetization')}>
                        <LayoutDashboard size={18} /> <span>DASHBOARD</span>
                    </button>
                </div>

                {/* Grid Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {activeTab === 'posts' && (
                            <div className={styles.grid}>
                                {postsState.length > 0 ? postsState.map((post, idx) => (
                                    <motion.div
                                        key={post.id}
                                        className={styles.gridItem}
                                        whileHover={{ y: -5 }}
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <Image src={post.image || 'https://picsum.photos/seed/post/800'} alt="" className={styles.gridImage} width={400} height={400} unoptimized />
                                        <div className={styles.overlay}>
                                            <div className={styles.overlayStats}>
                                                <div className={styles.statNumberOverlay}><Heart size={24} fill="white" /> {post.likes}</div>
                                                <div className={styles.statNumberOverlay}><MessageCircle size={24} fill="white" /> {post.comments}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className={styles.emptyTabState}>
                                        <Grid size={80} strokeWidth={1} />
                                        <h3>No Visions Yet</h3>
                                        <p>Start sharing your creative journey with the world.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'shots' && (
                            <div className={styles.emptyTabState}>
                                <Clapperboard size={80} strokeWidth={1} />
                                <h3>No Shots Captured</h3>
                                <p>Vertical cinematics you post will appear in this space.</p>
                            </div>
                        )}

                        {activeTab === 'saved' && <SavedTab />}

                        {activeTab === 'tagged' && (
                            <div className={styles.emptyTabState}>
                                <Tag size={80} strokeWidth={1} />
                                <h3>No Connections Found</h3>
                                <p>Visions you are mentioned in will reside here.</p>
                            </div>
                        )}

                        {activeTab === 'monetization' && <MonetizationTab />}
                    </motion.div>
                </AnimatePresence>

                <div style={{ marginTop: '80px', opacity: 0.6 }}>
                    <Footer />
                </div>
            </motion.div>

            {/* Post Detail */}
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
