'use client';

import React, { useState } from 'react';
import styles from './LandingPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ShieldCheck, Zap, Globe, Github, Info } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate loading
        setTimeout(() => {
            onLogin();
            setIsLoading(false);
        }, 1200);
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
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    onClick={() => {
                                        setIsLoading(true);
                                        setTimeout(onLogin, 1000);
                                    }}
                                    disabled={isLoading}
                                >
                                    Login as Guest
                                </button>
                            </div>

                            <p className={styles.signupText}>
                                Don't have an account? <a href="#" className={styles.link}>Sign Up</a>
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
