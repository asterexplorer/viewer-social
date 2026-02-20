'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Compass, Film, MessageCircle, PlusSquare, User, MoreHorizontal, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Compass, label: 'Explore', href: '/explore' },
        { icon: Film, label: 'Shots', href: '/shots' },
        { icon: MessageCircle, label: 'Chat', href: '/messages' },
        { icon: PlusSquare, label: 'Create', href: '/create' },
        { icon: User, label: 'Profile', href: '/profile' },
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

            <div>
                <button className={styles.navItem} onClick={toggleTheme}>
                    <div className={styles.iconWrap}>
                        {theme === 'dark' ? <Moon size={26} strokeWidth={1.8} /> : <Sun size={26} strokeWidth={1.8} />}
                    </div>
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
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
