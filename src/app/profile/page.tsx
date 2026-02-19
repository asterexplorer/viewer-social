'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, UserSquare2, BadgeCheck, LayoutDashboard, Clapperboard, Play } from 'lucide-react';
import styles from './profile.module.css';

import Link from 'next/link';
import Footer from '@/components/Footer';
import EditProfileModal from '@/components/EditProfileModal';
import ArchiveModal from '@/components/ArchiveModal';
import SettingsModal from '@/components/SettingsModal';
import PostDetailModal from '@/components/PostDetailModal';
import { useRouter } from 'next/navigation';

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
    posts: Post[];
    shots: Shot[];
    website?: string;
    category?: string;
    isPrivate?: boolean;
    fullName?: string;
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
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // 1. Fetch User (Me)
                const meRes = await fetch('/api/users/me');
                if (!meRes.ok) throw new Error('Failed to fetch user');
                const meData = await meRes.json();

                // 2. Fetch User's Posts (Filtering all posts by userId for now, since we don't have a dedicated user posts endpoint in the list earlier)
                // Ideally: /api/users/me/posts
                // Fallback: /api/posts?userId=...
                // Let's assume we can get all posts and filter (not efficient but works for small app) OR we use the /api/posts structure if it supports filtering.
                // Looking at api/posts/route.ts, it doesn't seem to have ?userId filter yet.
                // But let's check if we can add it or just fetch all and filter client side for now to be safe.
                const postsRes = await fetch('/api/posts?limit=100');
                let myPosts: any[] = [];
                if (postsRes.ok) {
                    const allPosts = await postsRes.json();
                    myPosts = allPosts.filter((p: any) => p.userId === meData.id);
                }

                setUser({
                    id: meData.id,
                    username: meData.username,
                    avatar: meData.avatar,
                    bio: meData.bio || null,
                    followers: meData._count?.followers || 0, // Using _count from API
                    website: meData.website || '',
                    category: meData.category || 'Digital Creator',
                    isPrivate: false,
                    posts: myPosts.map((post: any) => ({
                        id: post.id,
                        image: post.image,
                        likes: post.likes ? post.likes.length : 0,
                        comments: post.comments ? post.comments.length : 0,
                        userId: post.userId || '',
                        caption: post.caption || '',
                        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                        isLiked: false,
                        isSaved: false,
                        user: {
                            id: post.user?.id || '',
                            username: post.user?.username || meData.username,
                            name: post.user?.name || '',
                            avatar: post.user?.avatar || meData.avatar
                        }
                    })),
                } as unknown as User); // Type assertion for cleaner code in this step
            } catch (err) {
                console.error('Profile fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
                        {user.shots && user.shots.length > 0 ? (
                            user.shots.map((shot, index) => (
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
                            ))
                        ) : (
                            <div className={styles.noPosts}>
                                <div className={styles.noPostsIcon}>🎬</div>
                                <h3>No Shots Yet</h3>
                                <p>Vertical videos you create will appear here.</p>
                            </div>
                        )}
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
                    posts={user.posts}
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

