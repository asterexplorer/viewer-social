'use client';

import React, { useState } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Check, Sparkles, Cloud, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ThemeSwitcher.module.css';

const THEMES: { id: Theme; label: string; icon: any; color: string }[] = [
  { id: 'light', label: 'Light', icon: Sun, color: '#6366f1' },
  { id: 'dark', label: 'Dark', icon: Moon, color: '#7000ff' },
  { id: 'amethyst', label: 'Amethyst', icon: Sparkles, color: '#a855f7' },
  { id: 'midnight', label: 'Midnight', icon: Cloud, color: '#3b82f6' },
  { id: 'forest', label: 'Forest', icon: Leaf, color: '#10b981' },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <motion.button
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-tooltip="Change Theme"
      >
        <Palette size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className={styles.menu}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.header}>
                <h3>Appearance</h3>
                <p>Choose your workspace style</p>
              </div>
              <div className={styles.themeGrid}>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.themeOption} ${theme === t.id ? styles.active : ''}`}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                  >
                    <div 
                      className={styles.themePreview} 
                      style={{ backgroundColor: t.color }}
                    >
                      <t.icon size={20} color="white" />
                      {theme === t.id && (
                        <motion.div 
                          className={styles.checkIcon}
                          layoutId="activeTheme"
                        >
                          <Check size={12} strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
