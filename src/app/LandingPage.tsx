'use client';

import React, { useState } from 'react';
import styles from './LandingPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ShieldCheck, Zap, Globe, AlertCircle, Lock } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('test');
    const [password, setPassword] = useState('test123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Core login function — accepts credentials directly to avoid React state timing issues
    const loginWithCredentials = async (user: string, pass: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                onLogin();
            } else {
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('Connection error. Please make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await loginWithCredentials(username, password);
    };

    const features = [
        { icon: Smartphone, text: 'Mobile Ready' },
        { icon: ShieldCheck, text: 'Secure Access' },
        { icon: Zap, text: 'Ultra Fast' },
        { icon: Globe, text: 'Global Reach' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <motion.div
                    className={styles.blob}
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className={`${styles.blob} ${styles.blob2}`}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -70, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className={`${styles.blob} ${styles.blob3}`}
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div
                className={styles.content}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={styles.gridContainer}>
                    {/* Left Side: Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.logoArea}>
                            <motion.div
                                className={styles.logoSquare}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                V
                            </motion.div>
                            <h1 className={styles.appName}>Viewer</h1>
                        </div>

                        <h2 className={styles.heroTitle}>
                            Experience social media like <span className={styles.gradientText}>never before</span>.
                        </h2>
                        <p className={styles.heroSubtitle}>
                            A premium platform for creators, explorers, and visionaries. Join a community that values quality and connection.
                        </p>

                        <div className={styles.featureGrid}>
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.featureItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                >
                                    <f.icon size={20} className={styles.featureIcon} />
                                    <span>{f.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Login Card */}
                    <div className={styles.loginSection}>
                        <div className={styles.loginCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.title}>Welcome Back</h3>
                                <p className={styles.subtitle}>Enter your details to access your account</p>
                            </div>

                            <form className={styles.loginForm} onSubmit={handleLogin}>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            className={styles.errorBanner}
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                        >
                                            <div className={styles.errorIconWrap}>
                                                <Lock size={16} />
                                            </div>
                                            <div className={styles.errorContent}>
                                                <span className={styles.errorTitle}>Access Denied</span>
                                                <span className={styles.errorMsg}>Use <strong>test</strong> / <strong>test123</strong> to login</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Username</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(null); }}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className={styles.label}>Password</label>
                                        <a href="#" className={styles.forgotLink}>Forgot?</a>
                                    </div>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`${styles.loginBtn} ${isLoading ? styles.loading : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className={styles.spinner}></div>
                                    ) : 'Sign In'}
                                </button>
                            </form>

                            <div className={styles.divider}>
                                <span>OR</span>
                            </div>

                            <div className={styles.alternativeActions}>
                                <button
                                    className={styles.guestBtn}
                                    onClick={() => loginWithCredentials('test', 'test123')}
                                    disabled={isLoading}

                                >
                                    ⚡ Login as Guest (test / test123)
                                </button>
                            </div>

                            <p className={styles.signupText}>
                                Don&apos;t have an account? <a href="#" className={styles.link}>Sign Up</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.footerLinks}>
                        <a href="#">About</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Help</a>
                    </div>
                    <p className={styles.copyright}>&copy; 2026 Viewer by ASTER. <a href="/LICENSE" className={styles.licenseLink}>MIT Licensed</a>. Designed for the future.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
