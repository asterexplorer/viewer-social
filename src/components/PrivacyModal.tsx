import React, { useState } from 'react';
import { X, Shield, Lock, Eye, EyeOff, UserCheck, MessageSquare, Download, ChevronRight } from 'lucide-react';
import styles from './PrivacyModal.module.css';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    const [privateAccount, setPrivateAccount] = useState(false);
    const [activityStatus, setActivityStatus] = useState(true);
    const [storySharing, setStorySharing] = useState(true);
    const [allowMessages, setAllowMessages] = useState(true);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Shield size={20} />
                        <h2>Privacy Settings</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Account Privacy</h3>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingLabel}>Private Account</div>
                                <div className={styles.settingDescription}>
                                    When your account is private, only people you approve can see your photos and videos
                                </div>
                            </div>
                            <div
                                className={`${styles.toggle} ${privateAccount ? styles.active : ''}`}
                                onClick={() => setPrivateAccount(!privateAccount)}
                            >
                                <div className={styles.toggleKnob}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Activity</h3>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingLabel}>Activity Status</div>
                                <div className={styles.settingDescription}>
                                    Show when you're active
                                </div>
                            </div>
                            <div
                                className={`${styles.toggle} ${activityStatus ? styles.active : ''}`}
                                onClick={() => setActivityStatus(!activityStatus)}
                            >
                                <div className={styles.toggleKnob}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Sharing</h3>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingLabel}>Story Sharing</div>
                                <div className={styles.settingDescription}>
                                    Allow others to share your story as messages
                                </div>
                            </div>
                            <div
                                className={`${styles.toggle} ${storySharing ? styles.active : ''}`}
                                onClick={() => setStorySharing(!storySharing)}
                            >
                                <div className={styles.toggleKnob}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Messages</h3>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingLabel}>Allow Messages</div>
                                <div className={styles.settingDescription}>
                                    Let people send you messages
                                </div>
                            </div>
                            <div
                                className={`${styles.toggle} ${allowMessages ? styles.active : ''}`}
                                onClick={() => setAllowMessages(!allowMessages)}
                            >
                                <div className={styles.toggleKnob}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.separator} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Data & History</h3>
                        <button className={styles.menuItem}>
                            <div className={styles.menuItemRow}>
                                <UserCheck size={18} />
                                <span>Blocked Accounts</span>
                            </div>
                            <ChevronRight size={16} color="var(--foreground-muted)" />
                        </button>
                        <button className={styles.menuItem}>
                            <div className={styles.menuItemRow}>
                                <Download size={18} />
                                <span>Download Your Data</span>
                            </div>
                            <ChevronRight size={16} color="var(--foreground-muted)" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
