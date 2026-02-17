'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { Image as ImageIcon, X, Upload, Sparkles, MapPin, Smile, ChevronDown, ChevronLeft } from 'lucide-react';
import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import { createPost } from '@/app/actions';
import { MOCK_USERS } from '@/lib/mockData';

const FILTERS = [
    { name: 'Normal', value: 'none' },
    { name: 'Clarendon', value: 'contrast(1.2) saturate(1.3)' },
    { name: 'Gingham', value: 'brightness(1.1) contrast(0.9)' },
    { name: 'Moon', value: 'grayscale(1) contrast(1.1)' },
    { name: 'Lark', value: 'brightness(1.1) contrast(1.1) saturate(1.1)' },
    { name: 'Reyes', value: 'sepia(0.2) brightness(1.1) contrast(0.8)' },
];

const CreatePostPage = () => {
    const [mediaItems, setMediaItems] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [caption, setCaption] = useState('');
    const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
    const [location, setLocation] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isDragging, setIsDragging] = useState(false);
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const router = useRouter();
    const currentUser = MOCK_USERS[0];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            files.forEach(file => {
                const reader = new FileReader();
                const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
                reader.onload = (e) => {
                    setMediaItems(prev => [...prev, { url: e.target?.result as string, type }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            files.forEach(file => {
                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setMediaItems(prev => [...prev, { url: e.target?.result as string, type }]);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleShare = async () => {
        if (mediaItems.length === 0) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append('caption', caption);
            mediaItems.forEach((item, i) => formData.append(`media-${i}`, item.url));
            formData.append('filter', activeFilter.value);
            formData.append('location', location);

            try {
                await createPost(formData);
                router.push('/');
            } catch (error) {
                console.error('Failed to share post:', error);
                alert('Failed to share post. See console for details.');
            }
        });
    };

    const generateAICaption = () => {
        setIsGeneratingCaption(true);
        // Simulate AI generation
        setTimeout(() => {
            const mocks = [
                "Chasing sunsets and good vibes 🌅✨",
                "Wanderlust and city dust. #TravelDiaries",
                "POV: You're exactly where you need to be. 💫",
                "Life is better when you're laughing. 😂💖",
                "Art in every corner. 🎨🖌️"
            ];
            setCaption(mocks[Math.floor(Math.random() * mocks.length)]);
            setIsGeneratingCaption(false);
        }, 1500);
    };

    const handleLocationClick = () => {
        const places = ['New York, USA', 'Tokyo, Japan', 'Paris, France', 'London, UK'];
        setLocation(places[Math.floor(Math.random() * places.length)]);
    };

    return (
        <div className={styles.createPage}>
            <div className={`${styles.modal} fade-in`}>
                {/* Header */}
                <div className={styles.header}>
                    {mediaItems.length > 0 ? (
                        <button className={styles.backBtn} onClick={() => setMediaItems([])} disabled={isPending}>
                            <ChevronLeft size={22} />
                        </button>
                    ) : (
                        <button className={styles.closeBtn} onClick={() => router.back()} disabled={isPending}>
                            <X size={22} />
                        </button>
                    )}

                    <div className={styles.title}>
                        Create new post
                    </div>

                    {mediaItems.length > 0 ? (
                        <button
                            className={styles.shareButton}
                            onClick={handleShare}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <div className={styles.spinner} />
                            ) : 'Share'}
                        </button>
                    ) : (
                        <div style={{ width: 40 }} /> // Spacer to balance header
                    )}
                </div>

                {/* Content */}
                <div
                    className={`${styles.content} ${isDragging ? styles.dragging : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {mediaItems.length > 0 ? (
                        <div className={styles.editorContainer}>
                            {/* Media Preview Side */}
                            <div className={styles.imagePreviewSection}>
                                {mediaItems[currentMediaIndex].type === 'image' ? (
                                    <img
                                        src={mediaItems[currentMediaIndex].url}
                                        alt="Preview"
                                        className={styles.previewImage}
                                        style={{ filter: activeFilter.value }}
                                    />
                                ) : (
                                    <video
                                        src={mediaItems[currentMediaIndex].url}
                                        className={styles.previewImage}
                                        style={{ filter: activeFilter.value }}
                                        autoPlay
                                        muted
                                        loop
                                    />
                                )}

                                {mediaItems.length > 1 && (
                                    <>
                                        {currentMediaIndex > 0 && (
                                            <button className={styles.navBtnPrev} onClick={() => setCurrentMediaIndex(i => i - 1)}>
                                                <ChevronLeft size={20} />
                                            </button>
                                        )}
                                        {currentMediaIndex < mediaItems.length - 1 && (
                                            <button className={styles.navBtnNext} onClick={() => setCurrentMediaIndex(i => i + 1)}>
                                                <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                                            </button>
                                        )}
                                        <div className={styles.carouselDots}>
                                            {mediaItems.map((_, i) => (
                                                <div key={i} className={`${styles.dot} ${i === currentMediaIndex ? styles.activeDot : ''}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sidebar Details Side */}
                            <div className={styles.detailsSidebar}>
                                <div className={styles.userInfo}>
                                    <img src={currentUser.avatar} alt="Me" className={styles.avatar} />
                                    <span className={styles.username}>{currentUser.username}</span>
                                </div>

                                <div className={styles.captionArea}>
                                    <textarea
                                        className={styles.captionInput}
                                        placeholder="Write a caption..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        disabled={isPending}
                                        maxLength={2200}
                                    />
                                    <div className={styles.toolsRow}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button className={styles.toolBtn} title="Add emoji">
                                                <Smile size={20} />
                                            </button>
                                            <button
                                                className={`${styles.toolBtn} ${isGeneratingCaption ? styles.sparkleLoading : ''}`}
                                                title="AI Magic Caption"
                                                onClick={generateAICaption}
                                                disabled={isGeneratingCaption}
                                            >
                                                <Sparkles size={20} color={isGeneratingCaption ? "#0095f6" : "currentColor"} />
                                            </button>
                                        </div>
                                        <div className={styles.charCount}>{caption.length}/2,200</div>
                                    </div>
                                </div>

                                <div className={styles.optionsList}>
                                    <div className={styles.optionItem} onClick={handleLocationClick}>
                                        <span className={styles.optionLabel}>Add Location</span>
                                        {location ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MapPin size={14} color="#0095f6" />
                                                <span className={styles.optionValue}>{location}</span>
                                            </div>
                                        ) : (
                                            <MapPin size={20} color="white" />
                                        )}
                                    </div>
                                    <div className={styles.optionItem}>
                                        <span className={styles.optionLabel}>Tag People</span>
                                        <ChevronDown size={20} color="white" />
                                    </div>
                                    <div className={styles.optionItem}>
                                        <span className={styles.optionLabel}>Add Music</span>
                                        <ChevronDown size={20} color="white" />
                                    </div>
                                    <div className={styles.optionItem}>
                                        <span className={styles.optionLabel}>Advanced settings</span>
                                        <ChevronDown size={20} color="white" />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className={styles.filtersSection}>
                                    <div className={styles.filtersTitle}>Filters</div>
                                    <div className={styles.filtersGrid}>
                                        {FILTERS.map((filter) => (
                                            <div
                                                key={filter.name}
                                                className={`${styles.filterItem} ${activeFilter.name === filter.name ? styles.active : ''}`}
                                                onClick={() => setActiveFilter(filter)}
                                            >
                                                <div className={styles.filterPreview}>
                                                    {mediaItems[currentMediaIndex].type === 'image' ? (
                                                        <img
                                                            src={mediaItems[currentMediaIndex].url}
                                                            alt={filter.name}
                                                            style={{ filter: filter.value }}
                                                        />
                                                    ) : (
                                                        <div className={styles.videoFilterPlaceholder}>
                                                            <Upload size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={styles.filterName}>{filter.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.uploadArea}>
                            <div className={styles.uploadIconWrap}>
                                <Upload size={40} color="white" strokeWidth={1.5} />
                            </div>
                            <div className={styles.uploadText}>Drag photos and videos here</div>
                            <label className={styles.selectButton}>
                                Select from computer
                                <input type="file" hidden onChange={handleFileChange} accept="image/*,video/*" multiple />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
