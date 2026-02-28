import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    Film,
    MessageCircle,
    PlusSquare,
    User,
    Settings,
    MoreHorizontal,
    Layout
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Film, label: 'Reels', href: '/reels' },
        { icon: Film, label: 'Shots', href: '/shots' },
        { icon: MessageCircle, label: 'Chat', href: '/messages' },
        { icon: PlusSquare, label: 'Create', href: '/create' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <nav className={styles.sidebar}>
            <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                    <Layout size={20} fill="white" />
                </div>
            </div>

            <div className={styles.navItems}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            data-tooltip={item.label}
                        >
                            <div className={styles.iconWrap}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className={styles.bottomActions}>
                <button className={styles.navItem} data-tooltip="More">
                    <div className={styles.iconWrap}>
                        <MoreHorizontal size={24} />
                    </div>
                    <span className={styles.label}>More</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
