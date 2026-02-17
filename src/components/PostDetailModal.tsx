'use client';

import React, { useState } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from 'lucide-react';
import styles from './PostDetailModal.module.css';
import { Post } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface PostDetailModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, isOpen, onClose }) => {
    const [comment, setComment] = useState('');
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [isSaved, setIsSaved] = useState(post.isSaved);

    if (!isOpen) return null;

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => !isLiked ? prev + 1 : prev - 1);
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        // In a real app, send to API
        setComment('');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={32} />
            </button>

            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                {/* Media Section */}
                <div className={styles.mediaSection} onDoubleClick={handleLike}>
                    <img src={post.image} alt={post.caption} className={styles.mainMedia} />
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.header}>
                        <div className={styles.userInfo}>
                            <img src={post.user.avatar} alt={post.user.username} className={styles.avatar} />
                            <span className={styles.username}>{post.user.username}</span>
                        </div>
                        <button className={styles.actionBtn}>
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className={styles.commentsSection}>
                        {/* Caption as first comment */}
                        <div className={styles.commentItem}>
                            <img src={post.user.avatar} alt={post.user.username} className={styles.avatar} />
                            <div className={styles.commentContent}>
                                <div className={styles.commentText}>
                                    <span className={styles.username}>{post.user.username}</span> {post.caption}
                                </div>
                                <div className={styles.commentMeta}>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mock comments */}
                        <div className={styles.commentItem}>
                            <img src="https://i.pravatar.cc/150?u=10" className={styles.avatar} alt="User" />
                            <div className={styles.commentContent}>
                                <div className={styles.commentText}>
                                    <span className={styles.username}>awesome_user</span> This is such a cool shot! Love the colors. 🔥
                                </div>
                                <div className={styles.commentMeta}>
                                    <span>2h</span>
                                    <span>5 likes</span>
                                    <span>Reply</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.commentItem}>
                            <img src="https://i.pravatar.cc/150?u=11" className={styles.avatar} alt="User" />
                            <div className={styles.commentContent}>
                                <div className={styles.commentText}>
                                    <span className={styles.username}>photography_fan</span> Which camera did you use for this?
                                </div>
                                <div className={styles.commentMeta}>
                                    <span>1h</span>
                                    <span>2 likes</span>
                                    <span>Reply</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className={styles.actions}>
                        <div className={styles.actionRow}>
                            <div className={styles.leftActions}>
                                <button className={styles.actionBtn} onClick={handleLike}>
                                    <Heart size={24} fill={isLiked ? "#ed4956" : "none"} color={isLiked ? "#ed4956" : "currentColor"} />
                                </button>
                                <button className={styles.actionBtn}>
                                    <MessageCircle size={24} />
                                </button>
                                <button className={styles.actionBtn}>
                                    <Send size={24} />
                                </button>
                            </div>
                            <button className={styles.actionBtn} onClick={() => setIsSaved(!isSaved)}>
                                <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                        </div>
                        <div className={styles.likes}>
                            {likesCount.toLocaleString()} likes
                        </div>
                        <div className={styles.time}>
                            {new Date(post.createdAt).toDateString()}
                        </div>
                    </div>

                    {/* Input Section */}
                    <form className={styles.inputSection} onSubmit={handlePostComment}>
                        <Smile size={24} className={styles.emojiBtn} />
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className={styles.input}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                            type="submit"
                            className={styles.postBtn}
                            disabled={!comment.trim()}
                        >
                            Post
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default PostDetailModal;
