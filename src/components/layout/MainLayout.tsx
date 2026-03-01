'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';
import LandingPage from '@/app/LandingPage';
import Loader from '../common/Loader';
import PageTransition from '../common/PageTransition';
import TopHeader from './TopHeader';

import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [isClearView, setIsClearView] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            // Instantly check if we've logged in before to skip the loading screen
            const hasFastAuth = localStorage.getItem('viewer_demo_auth') === 'true';

            // Check clear view preference
            const savedClearView = localStorage.getItem('viewer_clear_view') === 'true';
            if (savedClearView) setIsClearView(true);

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

    const toggleClearView = () => {
        const newState = !isClearView;
        setIsClearView(newState);
        localStorage.setItem('viewer_clear_view', newState.toString());
    };

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
        <div className={`${styles.layout} ${isClearView ? styles.clearView : ''}`}>
            <div className={styles.sidebarWrapper}>
                <Sidebar />
            </div>

            <main className={styles.mainContent}>
                <div className={styles.headerWrapper}>
                    {pathname !== '/shots' && <TopHeader />}
                </div>

                <div
                    className={pathname === '/shots' ? styles.fullWidthWrapper : styles.contentWrapper}
                    style={{ paddingTop: pathname === '/shots' ? 0 : undefined }}
                >
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>

            {/* Clear View Toggle Button */}
            <motion.button
                className={`${styles.clearViewToggle} ${isClearView ? styles.active : ''}`}
                onClick={toggleClearView}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                title={isClearView ? "Show UI" : "Clear View"}
            >
                {isClearView ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
            </motion.button>
        </div>
    );
};

export default MainLayout;
