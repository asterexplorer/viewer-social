'use client';

import React, { useState } from 'react';
import { X, Heart, MessageCircle, UserPlus, AtSign, Video, Settings } from 'lucide-react';
import styles from './NotificationModal.module.css';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'like', user: 'sarah_j', name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=1', text: 'liked your photo', time: '2m ago', image: 'https://picsum.photos/seed/1/400', unread: true },
    { id: 2, type: 'comment', user: 'mike_ross', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?img=12', text: 'commented: "Amazing shot! 🔥"', time: '15m ago', image: 'https://picsum.photos/seed/2/400', unread: true },
    { id: 3, type: 'follow', user: 'emma_w', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=5', text: 'started following you', time: '1h ago', unread: true },
    { id: 4, type: 'mention', user: 'alex_dev', name: 'Alex Turner', avatar: 'https://i.pravatar.cc/150?img=8', text: 'mentioned you in a comment', time: '3h ago', image: 'https://picsum.photos/seed/3/400', unread: false },
    { id: 5, type: 'like', user: 'lisa_m', name: 'Lisa Martinez', avatar: 'https://i.pravatar.cc/150?img=9', text: 'and 12 others liked your photo', time: '5h ago', image: 'https://picsum.photos/seed/4/400', unread: false },
    { id: 6, type: 'comment', user: 'john_d', name: 'John Davis', avatar: 'https://i.pravatar.cc/150?img=13', text: 'replied to your comment', time: '6h ago', image: 'https://picsum.photos/seed/5/400', unread: false },
    { id: 7, type: 'follow', user: 'kate_b', name: 'Kate Brown', avatar: 'https://i.pravatar.cc/150?img=10', text: 'started following you', time: '8h ago', unread: false },
    { id: 8, type: 'like', user: 'ryan_c', name: 'Ryan Cooper', avatar: 'https://i.pravatar.cc/150?img=14', text: 'liked your shot', time: '12h ago', image: 'https://picsum.photos/seed/6/400', unread: false },
];

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');
    const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={18} fill="#ed4956" color="#ed4956" />;
            case 'comment': return <MessageCircle size={18} color="var(--primary)" />;
            case 'follow': return <UserPlus size={18} color="#44b700" />;
            case 'mention': return <AtSign size={18} color="var(--primary)" />;
            default: return <Heart size={18} />;
        }
    };

    const filteredNotifications = MOCK_NOTIFICATIONS.filter(notif => {
        if (activeTab === 'all') return true;
        if (activeTab === 'likes') return notif.type === 'like';
        if (activeTab === 'comments') return notif.type === 'comment' || notif.type === 'mention';
        if (activeTab === 'follows') return notif.type === 'follow';
        return true;
    });

    const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

    const toggleFollow = (userId: number) => {
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

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={`${styles.modal} scale-in`}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.title}>Notifications</h2>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount}</span>
                        )}
                    </div>
                    <div className={styles.headerRight}>
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
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif, index) => (
                            <div
                                key={notif.id}
                                className={`${styles.notifItem} ${notif.unread ? styles.unread : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className={styles.notifLeft}>
                                    <div className={styles.avatarWrapper}>
                                        <img src={notif.avatar} alt={notif.user} className={styles.avatar} />
                                        <div className={styles.iconBadge}>
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className={styles.notifContent}>
                                        <p>
                                            <span className={styles.username}>{notif.user}</span> {notif.text}
                                        </p>
                                        <span className={styles.time}>{notif.time}</span>
                                    </div>
                                </div>
                                <div className={styles.notifRight}>
                                    {notif.image && (
                                        <img src={notif.image} alt="" className={styles.postThumb} />
                                    )}
                                    {notif.type === 'follow' && (
                                        <button
                                            className={`${styles.followBtn} ${followingUsers.has(notif.id) ? styles.following : ''}`}
                                            onClick={() => toggleFollow(notif.id)}
                                        >
                                            {followingUsers.has(notif.id) ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <Heart size={48} />
                            </div>
                            <p className={styles.emptyText}>No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationModal;
