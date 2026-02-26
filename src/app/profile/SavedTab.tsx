import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './profile.module.css';

const SavedTab: React.FC = () => {
    const [saved, setSaved] = useState<any[] | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/saved');
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                setSaved(data);
            } catch (err) {
                console.error(err);
                setSaved([]);
            }
        };
        load();
    }, []);

    if (saved === null) return <div className={styles.emptyTabState}><div>Loading...</div></div>;

    if (saved.length === 0) return (
        <div className={styles.emptyTabState}>
            <div style={{ fontSize: 48 }}>🔖</div>
            <h3>No Saved Posts</h3>
            <p>Save posts to see them here</p>
        </div>
    );

    return (
        <div className={styles.grid}>
            {saved.map((post, i) => (
                <div key={post.id} className={styles.gridItem} style={{ animationDelay: `${i * 0.03}s` }}>
                    <Image src={post.image || 'https://picsum.photos/seed/saved/400'} alt="" className={styles.gridImage} width={400} height={400} />
                    <div className={styles.overlay}>
                        <div className={styles.overlayStats}>
                            <div className={styles.statNumberOverlay}>
                                <span>❤️</span> {post.likes}
                            </div>
                            <div className={styles.statNumberOverlay}>
                                <span>💬</span> {post.comments}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavedTab;
