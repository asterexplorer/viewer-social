'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Heart, Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ReelCommentSheet.module.css';

interface Comment {
    id: string;
    username: string;
    avatar: string;
    text: string;
    time: string;
    likes: number;
    isLiked: boolean;
}

interface ReelCommentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    _reelId: string;
    commentsCount: number;
}

const MOCK_COMMENTS: Comment[] = [
    { id: '1', username: 'alex_design', avatar: 'https://i.pravatar.cc/150?u=1', text: 'This is absolutely fire! 🔥🔥', time: '2m', likes: 48, isLiked: false },
    { id: '2', username: 'photo_life', avatar: 'https://i.pravatar.cc/150?u=2', text: 'The transitions are so smooth, love how this was edited!', time: '5m', likes: 22, isLiked: true },
    { id: '3', username: 'creative_soul', avatar: 'https://i.pravatar.cc/150?u=3', text: 'Incredible content as always ✨', time: '12m', likes: 15, isLiked: false },
    { id: '4', username: 'studio_vibes', avatar: 'https://i.pravatar.cc/150?u=4', text: 'What song is this?? Need to know for my playlist 🎵', time: '18m', likes: 9, isLiked: false },
    { id: '5', username: 'moment_catcher', avatar: 'https://i.pravatar.cc/150?u=5', text: 'Saved this for inspiration 🙌', time: '24m', likes: 6, isLiked: false },
    { id: '6', username: 'urban_frames', avatar: 'https://i.pravatar.cc/150?u=6', text: 'Can you do a tutorial on how you filmed this?', time: '31m', likes: 4, isLiked: false },
];

const ReelCommentSheet: React.FC<ReelCommentSheetProps> = ({ isOpen, onClose, _reelId, commentsCount }) => {
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [isOpen]);

    const handleLikeComment = (id: string) => {
        setComments(prev => prev.map(c =>
            c.id === id
                ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
                : c
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newComment: Comment = {
            id: Date.now().toString(),
            username: 'you',
            avatar: 'https://i.pravatar.cc/150?u=me',
            text: input.trim(),
            time: 'just now',
            likes: 0,
            isLiked: false,
        };
        setComments(prev => [newComment, ...prev]);
        setInput('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className={styles.sheet}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    >
                        {/* Handle */}
                        <div className={styles.handle} />

                        {/* Header */}
                        <div className={styles.header}>
                            <span className={styles.headerTitle}>
                                {commentsCount.toLocaleString()} Comments
                            </span>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className={styles.commentsList}>
                            {comments.map((comment, i) => (
                                <motion.div
                                    key={comment.id}
                                    className={styles.commentItem}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <Image
                                        src={comment.avatar}
                                        alt={comment.username}
                                        width={38}
                                        height={38}
                                        className={styles.avatar}
                                    />
                                    <div className={styles.commentBody}>
                                        <div className={styles.commentText}>
                                            <span className={styles.commentUsername}>{comment.username}</span>
                                            {' '}{comment.text}
                                        </div>
                                        <div className={styles.commentMeta}>
                                            <span className={styles.commentTime}>{comment.time}</span>
                                            <button className={styles.replyBtn}>Reply</button>
                                        </div>
                                    </div>
                                    <button
                                        className={`${styles.likeBtn} ${comment.isLiked ? styles.liked : ''}`}
                                        onClick={() => handleLikeComment(comment.id)}
                                    >
                                        <Heart
                                            size={14}
                                            fill={comment.isLiked ? '#ff3b5c' : 'none'}
                                            color={comment.isLiked ? '#ff3b5c' : '#94a3b8'}
                                        />
                                        <span>{comment.likes > 0 ? comment.likes : ''}</span>
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Bar */}
                        <form className={styles.inputBar} onSubmit={handleSubmit}>
                            <Image
                                src="https://i.pravatar.cc/150?u=me"
                                alt="You"
                                width={32}
                                height={32}
                                className={styles.inputAvatar}
                            />
                            <div className={styles.inputWrap}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Add a comment..."
                                    className={styles.input}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <button type="button" className={styles.emojiBtn}>
                                    <Smile size={18} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                className={`${styles.sendBtn} ${input.trim() ? styles.active : ''}`}
                                disabled={!input.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ReelCommentSheet;
