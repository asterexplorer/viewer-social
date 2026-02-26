'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Film, MessageCircle, PlusSquare, User, MoreHorizontal, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Film, label: 'Shots', href: '/shots' },
        { icon: MessageCircle, label: 'Chat', href: '/messages' },
        { icon: PlusSquare, label: 'Create', href: '/create' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <nav className={styles.sidebar}>
            <div className={styles.navItems}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrap}>
                                <item.icon size={26} strokeWidth={isActive ? 2.5 : 1.8} />
                                {isActive && <div className={styles.activeIndicator} />}
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className={styles.bottomActions}>
                <button className={styles.navItem}>
                    <div className={styles.iconWrap}>
                        <MoreHorizontal size={26} strokeWidth={1.8} />
                    </div>
                    <span>More</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
