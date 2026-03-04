'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Link2, Twitter, Facebook, Mail, Check, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ReelShareSheet.module.css';

interface ReelShareSheetProps {
    isOpen: boolean;
    onClose: () => void;
    reelId: string;
}

const FRIENDS = [
    { id: '1', username: 'alex_design', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', username: 'photo_life', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', username: 'creative_soul', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', username: 'studio_vibes', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: '5', username: 'moment_catcher', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: '6', username: 'urban_frames', avatar: 'https://i.pravatar.cc/150?u=6' },
];

const SHARE_OPTIONS = [
    { id: 'link', icon: Link2, label: 'Copy Link', color: '#6366f1' },
    { id: 'message', icon: MessageCircle, label: 'Message', color: '#10b981' },
    { id: 'twitter', icon: Twitter, label: 'Twitter / X', color: '#1d9bf0' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', color: '#1877f2' },
    { id: 'email', icon: Mail, label: 'Email', color: '#f59e0b' },
];

const ReelShareSheet: React.FC<ReelShareSheetProps> = ({ isOpen, onClose, reelId }) => {
    const [copied, setCopied] = useState(false);
    const [sentTo, setSentTo] = useState<string[]>([]);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/reels/${reelId}`;
        navigator.clipboard.writeText(url).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (id: string) => {
        if (id === 'link') {
            handleCopyLink();
        }
        // Other platforms could open share URLs here
    };

    const handleSendToFriend = (friendId: string) => {
        setSentTo(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={styles.sheet}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    >
                        {/* Handle */}
                        <div className={styles.handle} />

                        {/* Header */}
                        <div className={styles.header}>
                            <span className={styles.headerTitle}>Share</span>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Send to Friends */}
                        <div className={styles.section}>
                            <p className={styles.sectionLabel}>Send to friends</p>
                            <div className={styles.friendsRow}>
                                {FRIENDS.map((friend, i) => {
                                    const isSent = sentTo.includes(friend.id);
                                    return (
                                        <motion.button
                                            key={friend.id}
                                            className={styles.friendBtn}
                                            onClick={() => handleSendToFriend(friend.id)}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileTap={{ scale: 0.92 }}
                                        >
                                            <div className={`${styles.friendAvatarWrap} ${isSent ? styles.sent : ''}`}>
                                                <Image
                                                    src={friend.avatar}
                                                    alt={friend.username}
                                                    width={52}
                                                    height={52}
                                                    className={styles.friendAvatar}
                                                />
                                                {isSent && (
                                                    <motion.div
                                                        className={styles.sentBadge}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                    >
                                                        <Check size={12} strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span className={`${styles.friendName} ${isSent ? styles.sentName : ''}`}>
                                                {isSent ? 'Sent' : friend.username.split('_')[0]}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={styles.divider} />

                        {/* Share Options */}
                        <div className={styles.section}>
                            <p className={styles.sectionLabel}>Share via</p>
                            <div className={styles.shareOptions}>
                                {SHARE_OPTIONS.map((opt, i) => {
                                    const Icon = opt.icon;
                                    const isLink = opt.id === 'link';
                                    return (
                                        <motion.button
                                            key={opt.id}
                                            className={styles.shareOptionBtn}
                                            onClick={() => handleShare(opt.id)}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            <div
                                                className={styles.shareOptionIcon}
                                                style={{ background: `${opt.color}18`, color: opt.color }}
                                            >
                                                {isLink && copied
                                                    ? <Check size={20} strokeWidth={2.5} />
                                                    : <Icon size={20} strokeWidth={2} />
                                                }
                                            </div>
                                            <span className={styles.shareOptionLabel}>
                                                {isLink && copied ? 'Copied!' : opt.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom space */}
                        <div className={styles.bottomSpacer} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReelShareSheet;
