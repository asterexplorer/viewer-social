'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
    User,
    Shield,
    Bell,
    Key,
    LogOut,
    Check,
    AlertCircle,
    Globe,
    Lock,
    Camera,
    HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './settings.module.css';
import { updateUserSettings } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';
import Image from 'next/image';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const router = useRouter();

    // Form inputs
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        bio: '',
        website: '',
        isPrivate: false
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setFormData({
                        fullName: data.fullName || '',
                        username: data.username || '',
                        bio: data.bio || '',
                        website: data.website || '',
                        isPrivate: data.isPrivate || false
                    });
                } else {
                    const errData = await res.json().catch(() => ({}));
                    setError(errData.error || 'Failed to fetch settings');
                }
            } catch (err) {
                console.error('Failed to fetch user', err);
                setError('Network error: Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        setStatus(null);
        startTransition(async () => {
            const result = await updateUserSettings(formData);
            if (result.success) {
                setStatus({ type: 'success', message: 'Settings updated successfully!' });
                setUser(result.user);
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to update settings' });
            }
        });
    };

    const navItems = [
        { id: 'profile', icon: User, label: 'Edit Profile' },
        { id: 'security', icon: Lock, label: 'Security' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy', icon: Shield, label: 'Privacy' },
        { id: 'language', icon: Globe, label: 'Language' },
        { id: 'advanced', icon: Key, label: 'Advanced' }
    ];

    const renderContent = () => {
        if (error) {
            return (
                <div className={styles.emptyContent}>
                    <AlertCircle size={48} color="var(--danger)" />
                    <h2 style={{ marginTop: '16px' }}>Failed to load user</h2>
                    <p style={{ color: 'var(--foreground-muted)' }}>{error}</p>
                    <button
                        className={styles.saveBtn}
                        style={{ marginTop: '24px' }}
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'profile':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className={styles.contentTitle}>Edit Profile</h2>

                        <div className={styles.profileHeader}>
                            <div className={styles.avatarWrapper}>
                                <Image src={user?.avatar || "https://i.pravatar.cc/150"} alt="Avatar" className={styles.avatar} width={64} height={64} />
                                <div className={styles.avatarOverlay}>
                                    <Camera size={20} color="white" />
                                </div>
                            </div>
                            <div className={styles.usernameInfo}>
                                <h4>{user?.username}</h4>
                                <button className={styles.changeAvatarBtn}>Change profile photo</button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={styles.input}
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Enter your full name"
                            />
                            <p className={styles.helperText}>Help people discover your account by using the name you&apos;re known by: either your full name, nickname, or business name.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                className={styles.input}
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Website</label>
                            <input
                                className={styles.input}
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Bio</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>

                        {status && (
                            <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                                {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {status.message}
                            </div>
                        )}
                    </motion.div>
                );
            case 'privacy':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className={styles.contentTitle}>Account Privacy</h2>
                        <div className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Private Account</div>
                                <div className={styles.toggleDescription}>When your account is private, only people you approve can see your photos and videos.</div>
                            </div>
                            <div
                                className={`${styles.switch} ${formData.isPrivate ? styles.active : ''}`}
                                onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                            >
                                <div className={styles.knob} />
                            </div>
                        </div>
                        <button className={styles.saveBtn} onClick={handleSave} disabled={isPending}>
                            Save Preferences
                        </button>
                    </motion.div>
                )
            default:
                return (
                    <div className={styles.emptyContent}>
                        <HelpCircle size={48} color="var(--foreground-muted)" />
                        <p>This section is coming soon.</p>
                    </div>
                );
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader size="large" />
        </div>
    );

    return (
        <div className={styles.settingsPage}>
            <div className="neural-grid" />

            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.sidebar}>
                    <h1 className={styles.sidebarTitle}>Settings</h1>
                    <div className={styles.navWrapper}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        ))}

                        <button
                            className={`${styles.navItem} ${styles.danger}`}
                            onClick={async () => {
                                await fetch('/api/auth', { method: 'DELETE' });
                                router.push('/');
                                window.location.reload();
                            }}
                        >
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
