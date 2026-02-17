import React, { useState } from 'react';
import { X, Calendar, Clock, Archive } from 'lucide-react';
import styles from './ArchiveModal.module.css';
import { Post } from '@/lib/mockData';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    posts: Post[];
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, posts }) => {
    // Mock archive (filter posts older than 30 days or randomly select some)
    // For demo purposes, we'll just use a subset of posts
    const archivedPosts = posts.length > 0 ? posts.slice(0, 3) : [];

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Archive size={20} />
                        <h2>Archive</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {archivedPosts.length > 0 ? (
                        archivedPosts.map(post => (
                            <div key={post.id} className={styles.archiveItem}>
                                <img src={post.image} alt={post.caption} className={styles.archiveImage} />
                                <div className={styles.archiveDate}>
                                    <Calendar size={12} style={{ marginRight: 4, display: 'inline' }} />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Clock size={48} />
                            <p>No archived stories or posts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchiveModal;
