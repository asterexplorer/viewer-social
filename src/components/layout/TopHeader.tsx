'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Heart, Sun, Moon } from 'lucide-react';
import styles from './TopHeader.module.css';
import { usePathname } from 'next/navigation';
import NotificationModal from '../modals/NotificationModal';
import { notificationService } from '@/services/notification-service';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/lib/haptics';
import { ImpactStyle } from '@capacitor/haptics';

const TopHeader = () => {
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchUnreadCount = async () => {
        if (!isLoggedIn) return;
        try {
            const data = await notificationService.getNotifications();
            if (data && typeof data.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            // Silently handle auth errors for the header
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchUnreadCount();
            // Poll for notifications every 60 seconds
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        } else {
            setUnreadCount(0);
        }
    }, [isLoggedIn]);

    // Refresh count when notification modal closes
    useEffect(() => {
        if (!showNotifications) {
            fetchUnreadCount();
        }
    }, [showNotifications]);

    // Hide header on reels page for a truly immersive experience
    if (pathname === '/reels') return null;

    return (
        <>
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.leftSection}></div>

                <Link href="/" className={styles.logoContainer}>
                    <div className={styles.logoIcon}>
                        <Camera size={24} strokeWidth={2.5} />
                    </div>
                    <span className={`${styles.logoText} text-gradient`}>viewer</span>
                </Link>

                <div className={styles.rightSection}>
                    <button
                        className={styles.themeToggleBtn}
                        onClick={() => {
                            toggleTheme();
                            triggerHaptic(ImpactStyle.Light);
                        }}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        className={styles.notificationBtn}
                        onClick={() => {
                            setShowNotifications(true);
                            triggerHaptic(ImpactStyle.Light);
                        }}
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
