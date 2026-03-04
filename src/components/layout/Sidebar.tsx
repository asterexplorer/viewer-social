import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    Home,
    Search,
    Film,
    MessageCircle,
    PlusSquare,
    User,
    MoreHorizontal,
    Layout
} from 'lucide-react';
import styles from './Sidebar.module.css';

import { motion } from 'framer-motion';

const Sidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Film, label: 'Reels', href: '/reels' },
        { icon: MessageCircle, label: 'Chat', href: '/messages' },
        { icon: PlusSquare, label: 'Create', href: '/create' },
        { icon: User, label: 'Profile', href: '/profile' },
    ];




    return (
        <nav className={styles.sidebar}>
            <div className={styles.logoSection}>
                <motion.div
                    className={styles.logoIcon}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Layout size={20} fill="white" />
                </motion.div>
            </div>

            <div className={styles.navItems}>
                {navItems.map((item, index) => {
                    const baseHref = item.href.split('?')[0];
                    const hasQuery = item.href.includes('?');
                    const tabParam = item.href.split('tab=')[1];

                    const isActive = pathname === baseHref && (!hasQuery || searchParams.get('tab') === tabParam);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            data-tooltip={item.label}
                        >
                            <motion.div
                                className={styles.iconWrap}
                                initial={false}
                                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            <motion.span
                                className={styles.label}
                                initial={false}
                                animate={isActive ? { x: 2 } : { x: 0 }}
                            >
                                {item.label}
                            </motion.span>
                        </Link>
                    );
                })}
            </div>

            <div className={styles.bottomActions}>
                <motion.button
                    className={styles.navItem}
                    data-tooltip="More"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className={styles.iconWrap}>
                        <MoreHorizontal size={24} />
                    </div>
                    <span className={styles.label}>More</span>
                </motion.button>
            </div>
        </nav>
    );
};

export default Sidebar;
