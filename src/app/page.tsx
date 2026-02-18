'use client';

import React from 'react';
import Post from '@/components/Post';
import styles from './home.module.css';
import StoryBar from '@/components/StoryBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [feedItems, setFeedItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchContent = async () => {
    try {
      const [postsRes, shotsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/shots')
      ]);

      const postsData = await postsRes.json();
      const shotsData = await shotsRes.json();

      const formattedPosts = Array.isArray(postsData) ? postsData.map((post: any) => ({
        id: post.id,
        type: 'post',
        user: post.user,
        image: post.image,
        caption: post.caption,
        likes: post.likes ? post.likes.length : 0,
        isLiked: false,
        time: post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now',
        comments: post.comments
      })) : [];

      const formattedShots = Array.isArray(shotsData) ? shotsData.map((shot: any) => ({
        id: shot.id,
        type: 'shot',
        user: shot.user,
        image: undefined,
        video: shot.video,
        caption: shot.caption,
        likes: shot.likes?.length || 0,
        isLiked: false,
        time: shot.createdAt ? formatDistanceToNow(new Date(shot.createdAt), { addSuffix: true }) : 'Just now',
        comments: shot.comments
      })) : [];

      // Interleave: 4 Posts, 1 Shot, repeat
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
  };

  React.useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      const data = await fetchContent();
      if (isMounted) {
        setFeedItems(data);
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

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
      </div>
    </div>
  );
}
