'use client';

import React, { useState, useTransition } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import styles from './Post.module.css';
import { toggleLike, toggleShotLike, toggleSavedPost, toggleSavedShot, addComment, addShotComment } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface PostProps {
    id: string;
    type?: 'post' | 'shot';
    user: {
        username: string;
        avatar?: string | null;
    };
    image?: string;
    video?: string;
    likes: number;
    isLiked?: boolean;
    caption: string;
    time: string;
    comments?: Array<{
        id: string;
        text: string;
        user: {
            username: string;
            avatar?: string;
        };
        createdAt: string;
    }>;
}

const Post: React.FC<PostProps> = ({ id, type = 'post', user, image, video, likes, isLiked: initialIsLiked, caption, time, comments = [] }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked || false);
    const [localLikes, setLocalLikes] = useState(likes);
    const [isPending, startTransition] = useTransition();
    const [showHeart, setShowHeart] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [localComments, setLocalComments] = useState(comments);
    const [captionExpanded, setCaptionExpanded] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const handleLike = async () => {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLocalLikes(prev => newIsLiked ? prev + 1 : prev - 1);

        if (newIsLiked) {
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 1000);
        }

        startTransition(async () => {
            try {
                if (type === 'shot' || video) {
                    await toggleShotLike(id);
                } else {
                    await toggleLike(id);
                }
            } catch (error) {
                setIsLiked(!newIsLiked);
                setLocalLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
                console.error('Failed to toggle like:', error);
            }
        });
    };

    // Auto-play video on intersect could be added here, but simple controls or autoplay loop is fine for now

    // ... comment and share handlers ...

    const handleComment = () => {
        if (comment.trim()) {
            const newComment = {
                id: Date.now().toString(),
                text: comment,
                user: { username: 'You', avatar: '' }, // Optimistic user
                createdAt: new Date().toISOString()
            };
            setLocalComments([...localComments, newComment]);
            setComment('');

            startTransition(async () => {
                try {
                    if (type === 'shot' || video) {
                        await addShotComment(id, newComment.text);
                    } else {
                        await addComment(id, newComment.text);
                    }
                } catch (error) {
                    console.error('Failed to post comment:', error);
                    // Revert optimistic update
                    setLocalComments(prev => prev.filter(c => c.id !== newComment.id));
                }
            });
        }
    };

    const handleSave = () => {
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);

        startTransition(async () => {
            try {
                if (type === 'shot' || video) {
                    await toggleSavedShot(id);
                } else {
                    await toggleSavedPost(id);
                }
            } catch (error) {
                setIsSaved(!newIsSaved);
                console.error('Failed to toggle save:', error);
            }
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Post by ${user.username}`,
                text: caption,
                url: window.location.href,
            }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const formatLikes = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toLocaleString();
    };

    return (
        <motion.article
            layout
            className={styles.post}
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
            }}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarRing}>
                        <img src={user.avatar || 'https://i.pravatar.cc/150'} alt={user.username} className={styles.avatar} />
                    </div>
                    <div className={styles.userMeta}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.time}>{time}</span>
                    </div>
                </div>
                <button className={styles.moreBtn}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content (Image or Video) */}
            <div className={styles.imageContainer} onDoubleClick={handleLike}>
                {!imageLoaded && !video && (
                    <div className={`${styles.imageSkeleton} skeleton`}></div>
                )}

                {video ? (
                    <video
                        ref={videoRef}
                        src={video}
                        className={styles.postImage} // Reusing image class for size
                        controls={false} // Custom controls or double tap
                        autoPlay
                        muted
                        loop
                        playsInline
                        onLoadedData={() => setImageLoaded(true)}
                        style={{ opacity: imageLoaded ? 1 : 0, objectFit: 'cover' }}
                    />
                ) : (
                    <img
                        src={image}
                        alt="Post content"
                        className={`${styles.postImage} ${imageLoaded ? styles.loaded : ''}`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                    />
                )}

                <AnimatePresence>
                    {showHeart && (
                        <motion.div
                            className={styles.largeHeart}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        >
                            <Heart size={80} fill="white" color="white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <div className={styles.leftActions}>
                    <motion.button
                        whileTap={{ scale: 0.75 }}
                        className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
                        onClick={handleLike}
                        disabled={isPending}
                    >
                        <Heart size={24} fill={isLiked ? '#ed4956' : 'none'} color={isLiked ? '#ed4956' : 'currentColor'} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.75 }}
                        className={styles.actionButton}
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle size={24} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.75 }}
                        className={styles.actionButton}
                        onClick={handleShare}
                    >
                        <Send size={22} />
                    </motion.button>
                </div>
                <motion.button
                    whileTap={{ scale: 0.75 }}
                    className={`${styles.actionButton} ${isSaved ? styles.saved : ''}`}
                    onClick={handleSave}
                >
                    <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                </motion.button>
            </div>

            {/* Engagement */}
            <div className={styles.engagement}>
                <div className={styles.likes}>{formatLikes(localLikes)} likes</div>
                <div className={styles.caption}>
                    <span className={styles.captionUser}>{user.username}</span>
                    {caption.length > 100 && !captionExpanded ? (
                        <>
                            {caption.substring(0, 100)}...{' '}
                            <button
                                className={styles.moreBtn}
                                onClick={() => setCaptionExpanded(true)}
                            >
                                more
                            </button>
                        </>
                    ) : (
                        caption
                    )}
                </div>
                <button
                    className={styles.viewComments}
                    onClick={() => setShowComments(!showComments)}
                >
                    View all comments
                </button>
            </div>

            {/* Comment Input */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        className={styles.commentSection}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {localComments && localComments.length > 0 && (
                            <div className={styles.commentList}>
                                {localComments.map((c) => (
                                    <div key={c.id} className={styles.comment}>
                                        <div className={styles.commentContent}>
                                            <div>
                                                <span className={styles.commentUser}>{c.user.username}</span>
                                                <span className={styles.commentText}>{c.text}</span>
                                            </div>
                                            <span className={styles.commentTime}>
                                                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className={styles.commentInput}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                                className={styles.input}
                            />
                            {comment.trim() && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={styles.postBtn}
                                    onClick={handleComment}
                                >
                                    Post
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
};

export default Post;
