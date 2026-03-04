'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Film, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './MobileNav.module.css';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const MobileNav = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: PlusSquare, label: 'Create', href: '/create' },
        { icon: Film, label: 'Reels', href: '/reels' },
        { icon: User, label: 'Profile', href: '/profile' },
    ];

    const handleHaptic = async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Capacitor not available
        }
    };

    return (
        <nav className={styles.mobileNav}>
            <div className={styles.navContainer}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={handleHaptic}
                        >
                            <motion.div
                                className={styles.iconWrap}
                                initial={false}
                                animate={isActive ? { y: -8, scale: 1.2 } : { y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    color={isActive ? 'var(--primary)' : 'var(--foreground-muted)'}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className={styles.activeIndicator}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area spacer for modern Android/iOS bottom gesture bars */}
            <div className={styles.safeAreaSpacer} />
        </nav>
    );
};

export default MobileNav;
