'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Heart, MessageCircle, UserPlus, AtSign, Settings, CheckCheck, Loader2 } from 'lucide-react';
import styles from './NotificationModal.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { notificationService, Notification } from '@/services/notification-service';
import { formatDistanceToNow } from 'date-fns';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');
    const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart size={14} fill="#ed4956" color="#ed4956" />;
            case 'COMMENT': return <MessageCircle size={14} color="#0095f6" />;
            case 'FOLLOW': return <UserPlus size={14} color="#44b700" />;
            case 'MENTION': return <AtSign size={14} color="#0095f6" />;
            default: return <Heart size={14} />;
        }
    };

    const getNotificationText = (notif: Notification) => {
        switch (notif.type) {
            case 'LIKE': return 'liked your post';
            case 'COMMENT': return `commented: "${notif.commentText?.substring(0, 30)}${notif.commentText && notif.commentText.length > 30 ? '...' : ''}"`;
            case 'FOLLOW': return 'started following you';
            case 'MENTION': return 'mentioned you in a comment';
            default: return 'sent a notification';
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'all') return true;
        if (activeTab === 'likes') return notif.type === 'LIKE';
        if (activeTab === 'comments') return notif.type === 'COMMENT' || notif.type === 'MENTION';
        if (activeTab === 'follows') return notif.type === 'FOLLOW';
        return true;
    });

    const toggleFollow = (userId: string) => {
        setFollowingUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.title}>Activity</h2>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount}</span>
                        )}
                    </div>
                    <div className={styles.headerRight}>
                        {unreadCount > 0 && (
                            <button
                                className={styles.settingsBtn}
                                onClick={handleMarkAllRead}
                                title="Mark all as read"
                            >
                                <CheckCheck size={20} />
                            </button>
                        )}
                        <button className={styles.settingsBtn}>
                            <Settings size={20} />
                        </button>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'likes' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('likes')}
                    >
                        Likes
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'comments' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        Comments
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'follows' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('follows')}
                    >
                        Follows
                    </button>
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <Loader2 className="animate-spin" size={40} color="#0095f6" />
                            <p className={styles.emptyText}>Updating activity...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`${styles.notifItem} ${!notif.read ? styles.unread : ''}`}
                            >
                                <div className={styles.notifLeft}>
                                    <Link href={`/${notif.user.username}`} className={styles.avatarWrapper} onClick={onClose}>
                                        <Image
                                            src={notif.user.avatar || `https://ui-avatars.com/api/?name=${notif.user.username}&background=random`}
                                            alt={notif.user.username}
                                            className={styles.avatar}
                                            width={52}
                                            height={52}
                                           
                                        />
                                        <div className={styles.iconBadge}>
                                            {getIcon(notif.type)}
                                        </div>
                                    </Link>
                                    <div className={styles.notifContent}>
                                        <p>
                                            <Link href={`/${notif.user.username}`} className={styles.username} onClick={onClose}>
                                                {notif.user.fullName || notif.user.username}
                                            </Link>
                                            {' '}{getNotificationText(notif)}
                                        </p>
                                        <span className={styles.time}>{formatDistanceToNow(new Date(notif.createdAt))} ago</span>
                                    </div>
                                </div>
                                <div className={styles.notifRight}>
                                    {notif.postId && notif.postImage && (
                                        <Link href={`/p/${notif.postId}`} onClick={onClose}>
                                            <Image
                                                src={notif.postImage}
                                                alt=""
                                                className={styles.postThumb}
                                                width={52}
                                                height={52}
                                               
                                            />
                                        </Link>
                                    )}
                                    {notif.type === 'FOLLOW' && (
                                        <button
                                            className={`${styles.followBtn} ${followingUsers.has(notif.user.id) ? styles.following : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFollow(notif.user.id);
                                            }}
                                        >
                                            {followingUsers.has(notif.user.id) ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <Heart size={40} />
                            </div>
                            <h3 className={styles.emptyText}>No notifications yet</h3>
                            <p className={styles.emptySubtext}>When people interact with your content, you'll see it here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationModal;
