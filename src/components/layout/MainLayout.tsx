'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';
import LandingPage from '@/app/LandingPage';
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
            }

            try {
                // If we don't have fast auth, we check the backend session
                const res = await fetch('/api/auth');
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        setIsLoggedIn(true);
                        localStorage.setItem('viewer_demo_auth', 'true');
                    }
                }
            } catch (err) {
                console.error('Session check failed', err);
            } finally {
                setIsInitialized(true);
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

    if (!isLoggedIn) {
        return <LandingPage onLogin={handleLogin} />;
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
