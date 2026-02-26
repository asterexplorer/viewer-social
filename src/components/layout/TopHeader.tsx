'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Heart } from 'lucide-react';
import styles from './TopHeader.module.css';
import { usePathname } from 'next/navigation';
import NotificationModal from '../modals/NotificationModal';
import { notificationService } from '@/services/notification-service';

const TopHeader = () => {
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getNotifications();
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Poll for notifications every 60 seconds
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    // Refresh count when notification modal closes
    useEffect(() => {
        if (!showNotifications) {
            fetchUnreadCount();
        }
    }, [showNotifications]);

    // Hide header on shots page for a truly immersive experience
    if (pathname === '/shots') return null;

    return (
        <>
            <header className={styles.header}>
                <div className={styles.leftSection}></div>

                <Link href="/" className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                        <Camera size={24} strokeWidth={2.5} />
                    </div>
                    <span className={styles.logoText}>viewer</span>
                </Link>

                <div className={styles.rightSection}>
                    <button
                        className={styles.notificationBtn}
                        onClick={() => setShowNotifications(true)}
                        aria-label="Notifications"
                    >
                        <Heart size={24} className={unreadCount > 0 ? styles.activeHeart : ''} />
                        {unreadCount > 0 && (
                            <span className={styles.badge}>{unreadCount}</span>
                        )}
                    </button>
                </div>
            </header>

            <NotificationModal
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </>
    );
};

export default TopHeader;
