'use client';

import React from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Star, Zap } from 'lucide-react';
import styles from './ThemeSwitcher.module.css';

const themes: { id: Theme; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'light', icon: <Sun size={20} />, label: 'Light', color: '#6366f1' },
    { id: 'dark', icon: <Moon size={20} />, label: 'Dark', color: '#7000ff' },
    { id: 'amethyst', icon: <Sparkles size={20} />, label: 'Amethyst', color: '#a855f7' },
    { id: 'midnight', icon: <Star size={20} />, label: 'Midnight', color: '#3b82f6' },
    { id: 'forest', icon: <Zap size={20} />, label: 'Forest', color: '#10b981' },
];

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Visual Vibe</h3>
            <div className={styles.grid}>
                {themes.map((t) => {
                    const isActive = theme === t.id;
                    return (
                        <motion.button
                            key={t.id}
                            className={`${styles.themeBtn} ${isActive ? styles.active : ''}`}
                            onClick={() => setTheme(t.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                '--theme-color': t.color,
                            } as React.CSSProperties}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTheme"
                                    className={styles.activeBackground}
                                    style={{ backgroundColor: t.color }}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className={styles.iconWrapper} style={{ color: isActive ? '#fff' : t.color }}>
                                {t.icon}
                            </span>
                            <span className={styles.label} style={{ color: isActive ? '#fff' : 'inherit' }}>
                                {t.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default ThemeSwitcher;
