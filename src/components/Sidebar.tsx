'use strict';

import React from 'react';
import Link from 'next/link';
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, User, Menu } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Film, label: 'Reels', href: '/reels' },
    { icon: MessageCircle, label: 'Messages', href: '/messages' },
    { icon: Heart, label: 'Notifications', href: '/notifications' },
    { icon: PlusSquare, label: 'Create', href: '/create' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>Instagram</span>
      </div>
      
      <div className={styles.navItems}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className={styles.navItem}>
            <item.icon size={26} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className={`${styles.navItem} ${styles.more}`}>
        <Menu size={26} strokeWidth={2} />
        <span>More</span>
      </div>
    </div>
  );
};

export default Sidebar;
