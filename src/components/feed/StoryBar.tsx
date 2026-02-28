'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './StoryBar.module.css';
import { Plus } from 'lucide-react';
// import { MOCK_STORIES } from '@/constants/mockData';
import StoryViewer from '../modals/StoryViewer';
import Image from 'next/image';
import { pusherClient } from '@/lib/pusher';

const StoryBar = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [viewerStories, setViewerStories] = useState<any[]>([]);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    React.useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('/api/stories');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setStories(data);
                    // Flatten for viewer
                    const flat = data.flatMap((group: any) => group.stories.map((s: any) => ({ ...s, user: group.user })));
                    setViewerStories(flat);
                }
            } catch (err) {
                console.error('Failed to fetch stories', err);
            }
        };
        fetchStories();
    }, []);

    // Real-time Stories
    React.useEffect(() => {
        const channel = pusherClient.subscribe('stories');

        channel.bind('new-story', (data: any) => {
            setStories(prev => {
                const existingGroupIndex = prev.findIndex(g => g.user.username === data.user.username);

                if (existingGroupIndex >= 0) {
                    const newGroups = [...prev];
                    const group = { ...newGroups[existingGroupIndex] };
                    group.stories = [data, ...group.stories];
                    group.latestAt = data.createdAt;
                    // Move to front
                    newGroups.splice(existingGroupIndex, 1);
                    return [group, ...newGroups];
                } else {
                    return [{
                        id: data.userId,
                        user: data.user,
                        stories: [data],
                        hasViewed: false,
                        latestAt: data.createdAt
                    }, ...prev];
                }
            });

            setViewerStories(prev => [{ ...data, user: data.user }, ...prev]);
        });

        return () => {
            pusherClient.unsubscribe('stories');
        };
    }, []);

    const handleStoryClick = (userIndex: number) => {
        // Find the index in the flat list where this user's stories start
        if (!stories[userIndex]) return;
        const firstStoryId = stories[userIndex].stories[0]?.id;
        const flatIndex = viewerStories.findIndex(s => s.id === firstStoryId);
        setSelectedStoryIndex(flatIndex >= 0 ? flatIndex : 0);
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
                        <Image src="https://i.pravatar.cc/150?u=me" alt="Your story" className={styles.avatar} width={60} height={60} />
                        <div className={styles.plusBadge}>
                            <Plus size={12} strokeWidth={3} />
                        </div>
                    </div>
                    <span className={styles.username}>Your story</span>
                </motion.div>

                {stories.map((group, index) => (
                    <motion.div
                        key={group.user.username}
                        className={styles.storyContainer}
                        variants={itemVariants}
                        onClick={() => handleStoryClick(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Check if any story in group is unseen, for now assume all fresh */}
                        <div className={`${styles.storyCircle} ${styles.hasNew}`}>
                            <Image src={group.user.avatar || 'https://i.pravatar.cc/150'} alt={group.user.username} className={styles.avatar} width={60} height={60} />
                        </div>
                        <span className={styles.username}>{group.user.username}</span>
                    </motion.div>
                ))}
            </motion.div>

            {selectedStoryIndex !== null && viewerStories.length > 0 && (
                <StoryViewer
                    stories={viewerStories}
                    initialStoryIndex={selectedStoryIndex}
                    isOpen={selectedStoryIndex !== null}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </>
    );
};

export default StoryBar;
