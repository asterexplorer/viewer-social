import React, { useState } from 'react';
import { X, Camera, Globe, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        username: string;
        fullName: string;
        bio: string;
        avatar: string;
        website?: string;
        category?: string;
        isPrivate?: boolean;
    };
    onSave: (data: any) => void;
}

const CATEGORIES = [
    'None',
    'Artist',
    'Blogger',
    'Digital Creator',
    'Education',
    'Entrepreneur',
    'Health/Beauty',
    'Editor',
    'Writer',
    'Personal Blog'
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        ...initialData,
        website: initialData.website || '',
        category: initialData.category || 'Digital Creator',
        isPrivate: initialData.isPrivate || false
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Edit Profile</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    <div className={styles.scrollArea}>
                        {/* Avatar Section */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarContainer} onClick={() => document.getElementById('avatar-input')?.click()}>
                                <img src={formData.avatar} alt="Avatar" className={styles.avatar} />
                                <div className={styles.avatarOverlay}>
                                    <Camera size={24} />
                                </div>
                            </div>
                            <span className={styles.changePhotoText} onClick={() => document.getElementById('avatar-input')?.click()}>
                                Change profile photo
                            </span>
                            <input
                                id="avatar-input"
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={() => {
                                    const url = prompt("Enter image URL:", formData.avatar);
                                    if (url) setFormData(p => ({ ...p, avatar: url }));
                                }}
                            />
                        </div>

                        {/* Personal Info Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Profile Info</span>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Full Name"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Username"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Website</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className={styles.input}
                                        style={{ paddingLeft: '38px' }}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    placeholder="Write a bio..."
                                    maxLength={150}
                                />
                            </div>
                        </div>

                        {/* Professional Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Professional Tools</span>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Advanced/Privacy Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Privacy & Safety</span>
                            </div>

                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Private Account</span>
                                    <span className={styles.toggleDescription}>When your account is private, only people you approve can see your photos and videos.</span>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        name="isPrivate"
                                        checked={formData.isPrivate}
                                        onChange={handleChange}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>

                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Show Verification Badge</span>
                                    <span className={styles.toggleDescription}>Display a silver or gold checkmark based on your influence score.</span>
                                </div>
                                <ShieldCheck size={24} color="var(--primary)" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
