'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';
import LandingPage from '@/app/LandingPage';
import Loader from '../common/Loader';
import PageTransition from '../common/PageTransition';
import TopHeader from './TopHeader';

import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

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

            if (hasFastAuth) {
                // Show the app IMMEDIATELY for returning users!
                setIsLoggedIn(true);
            }

            try {
                // Background check with the real API to verify the cookie
                const res = await fetch('/api/auth');
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        setIsLoggedIn(true);
                        localStorage.setItem('viewer_demo_auth', 'true');
                    } else {
                        // Crucial: The cookie expired or their DB record was deleted! Log them out locally.
                        setIsLoggedIn(false);
                        localStorage.removeItem('viewer_demo_auth');
                    }
                } else {
                    // 401 Unauthorized or 500
                    setIsLoggedIn(false);
                    localStorage.removeItem('viewer_demo_auth');
                }
            } catch (err) {
                console.error('Session check failed', err);
            } finally {
                setIsInitialized(true);
            }
        };

        const initCapacitor = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    await SplashScreen.hide();
                } catch (e) {
                    console.warn('Splash hide failed', e);
                }
            }
        };

        initAuth();
        initCapacitor();
    }, []);

    useEffect(() => {
        if (Capacitor.isNativePlatform() && isInitialized) {
            const updateBar = async () => {
                try {
                    if (pathname === '/search') {
                        await StatusBar.setStyle({ style: Style.Default });
                        await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
                    } else {
                        await StatusBar.setStyle({ style: Style.Dark });
                        await StatusBar.setBackgroundColor({ color: '#000000' });
                    }
                } catch (e) { }
            };
            updateBar();
        }
    }, [pathname, isInitialized]);

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
                    {pathname !== '/reels' && <TopHeader />}
                </div>

                <div
                    className={pathname === '/reels' ? styles.fullWidthWrapper : styles.contentWrapper}
                    style={{ paddingTop: pathname === '/reels' ? 0 : undefined }}
                >
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileNav />
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
