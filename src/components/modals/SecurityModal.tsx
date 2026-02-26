import React, { useState } from 'react';
import { X, Key, Shield, Smartphone, ChevronRight, AlertTriangle } from 'lucide-react';
import styles from './SecurityModal.module.css';
import ChangePasswordModal from './ChangePasswordModal';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.header}>
                        <div className={styles.title}>
                            <Shield size={20} />
                            <h2>Password & Security</h2>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Account Access</h3>
                            <button className={styles.menuItem} onClick={() => setIsChangePasswordOpen(true)}>
                                <div className={styles.menuItemRow}>
                                    <Key size={18} />
                                    <span>Change Password</span>
                                </div>
                                <ChevronRight size={16} color="var(--foreground-muted)" />
                            </button>
                        </div>

                        <div className={styles.separator} />

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Two-Factor Authentication</h3>
                            <div className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.settingLabel}>
                                        Enable 2FA
                                        {twoFactorAuth && (
                                            <span className={`${styles.statusBadge} ${styles.active}`} style={{ marginLeft: '8px' }}>
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.settingDescription}>
                                        Add an extra layer of security to your account
                                    </div>
                                </div>
                                <div
                                    className={`${styles.toggle} ${twoFactorAuth ? styles.active : ''}`}
                                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                                >
                                    <div className={styles.toggleKnob}></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.separator} />

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Authorized Apps</h3>
                            <button className={styles.menuItem}>
                                <div className={styles.menuItemRow}>
                                    <Smartphone size={18} />
                                    <div>
                                        <div>Apps and Websites</div>
                                        <div style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
                                            Manage third-party apps
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--foreground-muted)" />
                            </button>
                        </div>

                        <div className={styles.separator} />

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Security Alerts</h3>

                            <div className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.settingLabel}>Login Alerts</div>
                                    <div className={styles.settingDescription}>
                                        Get notified when someone logs into your account
                                    </div>
                                </div>
                                <div
                                    className={`${styles.toggle} ${loginAlerts ? styles.active : ''}`}
                                    onClick={() => setLoginAlerts(!loginAlerts)}
                                >
                                    <div className={styles.toggleKnob}></div>
                                </div>
                            </div>

                            <div className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.settingLabel}>Security Alerts</div>
                                    <div className={styles.settingDescription}>
                                        Alerts about unusual account activity
                                    </div>
                                </div>
                                <div
                                    className={`${styles.toggle} ${securityAlerts ? styles.active : ''}`}
                                    onClick={() => setSecurityAlerts(!securityAlerts)}
                                >
                                    <div className={styles.toggleKnob}></div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.separator} />

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Account Recovery</h3>
                            <button className={styles.menuItem}>
                                <div className={styles.menuItemRow}>
                                    <AlertTriangle size={18} />
                                    <span>Recovery Options</span>
                                </div>
                                <ChevronRight size={16} color="var(--foreground-muted)" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </>
    );
};

export default SecurityModal;
