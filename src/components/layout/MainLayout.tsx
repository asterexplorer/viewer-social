'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';
import Loader from '../common/Loader';
import PageTransition from '../common/PageTransition';
import TopHeader from './TopHeader';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            // Instantly check if we've logged in before to skip the loading screen
            const hasFastAuth = localStorage.getItem('viewer_demo_auth') === 'true';

            if (hasFastAuth) {
                // Show the app IMMEDIATELY for returning users!
                setIsLoggedIn(true);
                setIsInitialized(true);
            }

            try {
                // Always silently refresh the session cookie in the background
                // This ensures the demo session never truly expires and always works
                const loginRes = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'test', password: 'test123' })
                });

                if (loginRes.ok) {
                    localStorage.setItem('viewer_demo_auth', 'true');
                    if (!hasFastAuth) {
                        setIsLoggedIn(true);
                        setIsInitialized(true);
                    }
                }
            } catch (err) {
                console.error('Auto-login failed', err);
                if (!hasFastAuth) {
                    setIsInitialized(true);
                }
            }
        };

        initAuth();
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
        // Force refresh to ensure all server data and cookies are in sync
        window.location.reload();
    };

    if (!isInitialized) {
        return (
            <div className={styles.loaderContainer}>
                <Loader size="large" />
            </div>
        );
    }

    // Since we auto-login, we can just show loader or empty if not yet logged in but initialized.
    // If somehow auto-login failed, they see the loader forever, or we can just render nothing.
    if (!isLoggedIn) {
        return (
            <div className={styles.loaderContainer}>
                <Loader size="large" />
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.mainContent}>
                {pathname !== '/shots' && <TopHeader />}
                <div
                    className={pathname === '/shots' ? styles.fullWidthWrapper : styles.contentWrapper}
                    style={{ paddingTop: pathname === '/shots' ? 0 : undefined }}
                >
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
