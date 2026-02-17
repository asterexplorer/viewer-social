import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, Heart } from 'lucide-react';
import styles from './TopHeader.module.css';
import { usePathname } from 'next/navigation';
import NotificationModal from './NotificationModal';

const TopHeader = () => {
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);

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
                        <Heart size={24} />
                        <span className={styles.badge}></span>
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
