import React, { useState, useEffect, Suspense } from 'react';
import styles from './LandingPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ShieldCheck, Zap, Globe, AlertCircle, LogIn, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface LandingPageProps {
    onLogin: () => void;
}

const LandingContent: React.FC<LandingPageProps & {
    mode: 'login' | 'register';
    setMode: (m: 'login' | 'register') => void;
    isLoading: boolean;
    setIsLoading: (l: boolean) => void;
    error: string | null;
    setError: (e: string | null) => void;
    username: string;
    setUsername: (u: string) => void;
    email: string;
    setEmail: (e: string) => void;
    fullName: string;
    setFullName: (f: string) => void;
    password: string;
    setPassword: (p: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    toggleMode: () => void;
    features: any[];
    isSuccess: boolean;
}> = ({
    mode, setMode, isLoading, error, setError, username, setUsername, email, setEmail, fullName, setFullName, password, setPassword, handleSubmit, toggleMode, features, isSuccess
}) => {
        const searchParams = useSearchParams();
        const referralCode = searchParams.get('ref');

        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

        useEffect(() => {
            if (referralCode && mode === 'login') {
                setMode('register');
            }
        }, [referralCode, mode, setMode]);

        useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                setMousePos({
                    x: (e.clientX / window.innerWidth - 0.5) * 40,
                    y: (e.clientY / window.innerHeight - 0.5) * 40
                });
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }, []);

        return (
            <div className={styles.container}>
                <div className={styles.background}>
                    <motion.div
                        className={styles.blob}
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 90, 0],
                            x: mousePos.x,
                            y: mousePos.y
                        }}
                        transition={{
                            scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                            x: { type: "spring", damping: 30, stiffness: 100 },
                            y: { type: "spring", damping: 30, stiffness: 100 }
                        }}
                    />
                    <motion.div
                        className={`${styles.blob} ${styles.blob2}`}
                        animate={{
                            scale: [1.1, 1, 1.1],
                            rotate: [0, -60, 0],
                            x: -mousePos.x * 1.5,
                            y: -mousePos.y * 1.5
                        }}
                        transition={{
                            scale: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                            x: { type: "spring", damping: 30, stiffness: 80 },
                            y: { type: "spring", damping: 30, stiffness: 80 }
                        }}
                    />
                    <motion.div
                        className={`${styles.blob} ${styles.blob3}`}
                        animate={{
                            scale: [1, 1.2, 1],
                            x: 100 + mousePos.x * 0.5,
                            y: 50 + mousePos.y * 0.5,
                        }}
                        transition={{
                            scale: { duration: 35, repeat: Infinity, ease: "easeInOut" },
                            x: { type: "spring", damping: 30, stiffness: 120 },
                            y: { type: "spring", damping: 30, stiffness: 120 }
                        }}
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
                                    <Image
                                        src="/premium_viewer_logo_v_1772361654761.png"
                                        alt="Viewer Logo"
                                        width={64}
                                        height={64}
                                        className={styles.logoImage}
                                        priority
                                    />
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

                        {/* Right Side: Login/Register Card */}
                        <div className={styles.loginSection}>
                            <div className={styles.loginCard}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.title}>
                                        {isSuccess ? 'Login Successful' : (mode === 'login' ? 'Welcome Back' : 'Create Account')}
                                    </h3>
                                    <p className={styles.subtitle}>
                                        {isSuccess ? 'Redirecting to your feed...' : (mode === 'login' ? 'Enter your credentials to access your feed.' : 'Join Viewer today.')}
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div
                                            key="success"
                                            className={styles.successCard}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                        >
                                            <motion.div
                                                className={styles.successIcon}
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: -5 }}
                                                transition={{ delay: 0.1, type: "spring", damping: 10, stiffness: 200 }}
                                            >
                                                <CheckCircle2 size={40} />
                                            </motion.div>
                                            <h4 className={styles.successTitle}>Welcome, {username}!</h4>
                                            <p className={styles.successText}>Preparing your personalized experience...</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
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
                                                            <AlertCircle size={16} />
                                                        </div>
                                                        <div className={styles.errorContent}>
                                                            <span className={styles.errorTitle}>Error</span>
                                                            <span className={styles.errorMsg}>{error}</span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <form onSubmit={handleSubmit} className={styles.loginForm}>
                                                {mode === 'register' && (
                                                    <>
                                                        <div className={styles.inputGroup}>
                                                            <label className={styles.label}>Email Address</label>
                                                            <input
                                                                type="email"
                                                                className={styles.input}
                                                                placeholder="you@example.com"
                                                                value={email}
                                                                onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                                                                required
                                                            />
                                                        </div>
                                                        <div className={styles.inputGroup}>
                                                            <label className={styles.label}>Full Name (Optional)</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                placeholder="John Doe"
                                                                value={fullName}
                                                                onChange={(e) => { setFullName(e.target.value); if (error) setError(null); }}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <div className={styles.inputGroup}>
                                                    <label className={styles.label}>{mode === 'login' ? 'Username or Email' : 'Username'}</label>
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        placeholder={mode === 'login' ? "Enter username or email" : "Choose a unique username"}
                                                        value={username}
                                                        onChange={(e) => { setUsername(e.target.value); if (error) setError(null); }}
                                                        required
                                                    />
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <label className={styles.label}>Password</label>
                                                        {mode === 'login' && <a href="#" className={styles.forgotLink}>Forgot?</a>}
                                                    </div>
                                                    <input
                                                        type="password"
                                                        className={styles.input}
                                                        placeholder="Enter your secure password"
                                                        value={password}
                                                        onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className={`${styles.loginBtn} ${isLoading ? styles.loading : ''}`}
                                                    disabled={isLoading}
                                                    style={{ marginTop: '10px', height: '56px', fontSize: '16px' }}
                                                >
                                                    {isLoading ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Loader2 size={24} />
                                                        </motion.div>
                                                    ) : (
                                                        <>
                                                            {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                                                            {mode === 'login' ? 'Secure Login' : 'Create Account'}
                                                        </>
                                                    )}
                                                </button>
                                            </form>

                                            <div className={styles.divider}>OR</div>

                                            <p className={styles.signupText} style={{ textAlign: 'center' }}>
                                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                                <button type="button" onClick={toggleMode} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>
                                                    {mode === 'login' ? "Sign Up" : "Log In"}
                                                </button>
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');

    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const referralCode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null;

        const endpoint = mode === 'login' ? '/api/auth' : '/api/auth/register';
        const payload = mode === 'login'
            ? { username, password }
            : { username, email, password, fullName, referralCode };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsSuccess(true);
                // Artificial delay for premium feel and animation
                setTimeout(() => {
                    onLogin();
                }, 1800);
            } else {
                setError(data.error || `${mode === 'login' ? 'Login' : 'Registration'} failed.`);
            }
        } catch (err) {
            setError('Connection error. Please make sure the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: Smartphone, text: 'Mobile Ready' },
        { icon: ShieldCheck, text: 'Secure Access' },
        { icon: Zap, text: 'Ultra Fast' },
        { icon: Globe, text: 'Global Reach' },
    ];

    return (
        <Suspense fallback={<div className={styles.container}><div className={styles.loginCard}><div className={styles.spinner}></div></div></div>}>
            <LandingContent
                onLogin={onLogin}
                mode={mode}
                setMode={setMode}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
                fullName={fullName}
                setFullName={setFullName}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                toggleMode={toggleMode}
                features={features}
                isSuccess={isSuccess}
            />
        </Suspense>
    );
};

export default LandingPage;
