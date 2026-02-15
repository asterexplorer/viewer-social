'use client';

import React from 'react';
import styles from './StoryBar.module.css';

const MOCK_STORIES = [
    { id: 1, username: 'alex_j', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, username: 'sarah.smith', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, username: 'mike_ross', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, username: 'rachel_z', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, username: 'harvey_specter', avatar: 'https://i.pravatar.cc/150?u=5' },
    { id: 6, username: 'donna_p', avatar: 'https://i.pravatar.cc/150?u=6' },
    { id: 7, username: 'louis_litt', avatar: 'https://i.pravatar.cc/150?u=7' },
    { id: 8, username: 'jess_p', avatar: 'https://i.pravatar.cc/150?u=8' },
];

const StoryBar = () => {
    return (
        <div className={styles.storyBar}>
            {MOCK_STORIES.map((story) => (
                <div key={story.id} className={styles.storyContainer}>
                    <div className={styles.storyCircle}>
                        <img src={story.avatar} alt={story.username} className={styles.avatar} />
                    </div>
                    <span className={styles.username}>{story.username}</span>
                </div>
            ))}
        </div>
    );
};

export default StoryBar;
