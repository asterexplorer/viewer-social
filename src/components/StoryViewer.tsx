'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, MoreHorizontal } from 'lucide-react';
import styles from './StoryViewer.module.css';
import { Story } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryViewerProps {
    stories: Story[];
    initialStoryIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryIndex, isOpen, onClose }) => {
    const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentStory = stories[storyIndex];
    const currentSlide = currentStory.slides[slideIndex];

    const nextSlide = useCallback(() => {
        if (slideIndex < currentStory.slides.length - 1) {
            setSlideIndex(slideIndex + 1);
            setProgress(0);
        } else if (storyIndex < stories.length - 1) {
            setStoryIndex(storyIndex + 1);
            setSlideIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [slideIndex, currentStory.slides.length, storyIndex, stories.length, onClose]);

    const prevSlide = useCallback(() => {
        if (slideIndex > 0) {
            setSlideIndex(slideIndex - 1);
            setProgress(0);
        } else if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1);
            setSlideIndex(stories[storyIndex - 1].slides.length - 1);
            setProgress(0);
        }
    }, [slideIndex, storyIndex, stories]);

    useEffect(() => {
        if (!isOpen) return;

        const duration = 5000; // 5 seconds per slide
        const interval = 50; // Update progress every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isOpen, slideIndex, storyIndex, nextSlide]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={28} />
            </button>

            <div className={styles.viewerContainer} onClick={e => e.stopPropagation()}>
                {/* Progress Bars */}
                <div className={styles.progressContainer}>
                    {currentStory.slides.map((_, idx) => (
                        <div key={idx} className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: idx < slideIndex ? '100%' : idx === slideIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.userInfo}>
                        <img src={currentStory.user.avatar} alt={currentStory.user.username} className={styles.avatar} />
                        <span className={styles.username}>{currentStory.user.username}</span>
                        <span className={styles.time}>{currentSlide.time}</span>
                    </div>
                    <button className={styles.actionBtn}>
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.storyContent}>
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentSlide.id}
                            src={currentSlide.image}
                            alt=""
                            className={styles.storyImage}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        />
                    </AnimatePresence>

                    {/* Nav Buttons */}
                    {(storyIndex > 0 || slideIndex > 0) && (
                        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide}>
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide}>
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <input type="text" placeholder={`Reply to ${currentStory.user.username}...`} className={styles.replyInput} />
                    <button className={styles.actionBtn}>
                        <Heart size={24} />
                    </button>
                    <button className={styles.actionBtn}>
                        <Send size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
