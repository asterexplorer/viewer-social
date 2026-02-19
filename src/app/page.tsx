'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Post from '@/components/Post';
import styles from './home.module.css';
import StoryBar from '@/components/StoryBar';
import RightSidebar from '@/components/RightSidebar';
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  const fetchContent = useCallback(async (pageNum: number) => {
    try {
      // Fetch separate streams (8 posts + 2 shots per page approx)
      const [postsRes, shotsRes] = await Promise.all([
        fetch(`/api/posts?page=${pageNum}&limit=8`),
        fetch(`/api/shots?page=${pageNum}&limit=2`)
      ]);

      const postsData = await postsRes.json();
      const shotsData = await shotsRes.json();

      if (!Array.isArray(postsData) || !Array.isArray(shotsData)) {
        return [];
      }

      if (postsData.length === 0 && shotsData.length === 0) {
        return []; // End of feed
      }

      const formattedPosts = postsData.map((post: any) => ({
        id: post.id,
        type: 'post',
        user: post.user,
        image: post.image,
        caption: post.caption,
        likes: post.likes ? (typeof post.likes === 'number' ? post.likes : post.likes.length) : 0,
        isLiked: post.isLiked || false,
        time: post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now',
        comments: post.comments
      }));

      const formattedShots = shotsData.map((shot: any) => ({
        id: shot.id,
        type: 'shot',
        user: shot.user,
        image: undefined,
        video: shot.video,
        caption: shot.caption,
        likes: shot.likes ? (typeof shot.likes === 'number' ? shot.likes : shot.likes.length) : 0,
        isLiked: shot.isLiked || false,
        time: shot.createdAt ? formatDistanceToNow(new Date(shot.createdAt), { addSuffix: true }) : 'Just now',
        comments: shot.comments
      }));

      // Interleave: 4 Posts, 1 Shot
      const combined = [];
      let postIdx = 0;
      let shotIdx = 0;

      while (postIdx < formattedPosts.length || shotIdx < formattedShots.length) {
        // Add up to 4 posts
        for (let i = 0; i < 4 && postIdx < formattedPosts.length; i++) {
          combined.push(formattedPosts[postIdx++]);
        }
        // Add 1 shot
        if (shotIdx < formattedShots.length) {
          combined.push(formattedShots[shotIdx++]);
        }
      }

      return combined;
    } catch (err) {
      console.error('Failed to fetch content:', err);
      return [];
    }
  }, []);

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      const data = await fetchContent(1);
      if (isMounted) {
        setFeedItems(data);
        setLoading(false);
        if (data.length === 0) setHasMore(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [fetchContent]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !fetchingMore) {
        loadMore();
      }
    }, { threshold: 0.5 });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }
  }, [loading, hasMore, fetchingMore]);

  const loadMore = async () => {
    if (fetchingMore || !hasMore) return;
    setFetchingMore(true);

    const nextPage = page + 1;
    const data = await fetchContent(nextPage);

    if (data.length === 0) {
      setHasMore(false);
    } else {
      setFeedItems(prev => [...prev, ...data]);
      setPage(nextPage);
    }
    setFetchingMore(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.feedSection}>
          <StoryBar />
          <div className="skeleton" style={{ height: '500px', width: '100%', borderRadius: '12px', marginTop: '24px' }}></div>
          <div className="skeleton" style={{ height: '500px', width: '100%', borderRadius: '12px', marginTop: '24px' }}></div>
        </div>
        <div className={styles.sidebarSection}>
          {/* Sidebar Skeleton */}
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.feedSection}>
        <StoryBar />

        <motion.div
          className={styles.feedItemsList}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {feedItems.map((item, index) => (
              <Post
                key={`${item.id}-${index}`}
                {...item}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Infinite Scroll Trigger */}
        <div ref={lastElementRef} className={styles.loaderContainer}>
          {fetchingMore && <Loader size="medium" />}
          {!hasMore && feedItems.length > 0 && (
            <div className={styles.endMessage}>You&apos;re all caught up! 🚀</div>
          )}
        </div>
      </div>


    </div>
  );
}
