'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { usePathname } from 'next/navigation';
import LandingPage from '@/app/LandingPage';
import Loader from './Loader';
import PageTransition from './PageTransition';
import TopHeader from './TopHeader';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check local storage or cookie for session (mock)
        const session = localStorage.getItem('viewer_session');
        if (session) {
            setIsLoggedIn(true);
        }
        setIsInitialized(true);
    }, []);

    const handleLogin = () => {
        localStorage.setItem('viewer_session', 'true');
        setIsLoggedIn(true);
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
                <TopHeader />
                <div
                    className={styles.contentWrapper}
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
