'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './StoryBar.module.css';
import { Plus } from 'lucide-react';
import { MOCK_STORIES } from '@/lib/mockData';
import StoryViewer from './StoryViewer';

const StoryBar = () => {
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const handleStoryClick = (index: number) => {
        setSelectedStoryIndex(index);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <>
            <motion.div
                className={styles.storyBar}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Your Story */}
                <motion.div className={styles.storyContainer} variants={itemVariants}>
                    <div className={`${styles.storyCircle} ${styles.yourStory}`}>
                        <img src="https://i.pravatar.cc/150?u=me" alt="Your story" className={styles.avatar} />
                        <div className={styles.plusBadge}>
                            <Plus size={12} strokeWidth={3} />
                        </div>
                    </div>
                    <span className={styles.username}>Your story</span>
                </motion.div>

                {MOCK_STORIES.map((story) => (
                    <motion.div
                        key={story.id}
                        className={styles.storyContainer}
                        variants={itemVariants}
                        onClick={() => handleStoryClick(MOCK_STORIES.indexOf(story))}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className={`${styles.storyCircle} ${!story.hasViewed ? styles.hasNew : styles.seen}`}>
                            <img src={story.user.avatar} alt={story.user.username} className={styles.avatar} />
                        </div>
                        <span className={styles.username}>{story.user.username}</span>
                    </motion.div>
                ))}
            </motion.div>

            {selectedStoryIndex !== null && (
                <StoryViewer
                    stories={MOCK_STORIES}
                    initialStoryIndex={selectedStoryIndex}
                    isOpen={selectedStoryIndex !== null}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </>
    );
};

export default StoryBar;
