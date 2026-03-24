'use client';

import React, { useState } from 'react';
import { updateUserSettings } from '@/app/actions';
import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import { Loader2 } from 'lucide-react';

import { User } from './page';

interface SettingsTabProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        bio: user.bio || '',
        website: user.website || '',
        isPrivate: user.isPrivate || false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const res = await updateUserSettings({
            username: formData.username,
            bio: formData.bio,
            website: formData.website,
            isPrivate: formData.isPrivate,
        });

        if (res.success && res.user) {
            setMessage('Profile updated successfully!');
            setUser({
                ...user,
                username: res.user.username,
                bio: res.user.bio,
                website: res.user.website,
                isPrivate: res.user.isPrivate,
            } as any);
        } else {
            setMessage(res.error || 'Failed to update profile.');
        }
        setIsLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            
            <ThemeSwitcher />
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--background-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Profile Information</h3>
                
                {message && (
                    <div style={{ padding: '12px', borderRadius: '8px', background: message.includes('success') ? 'var(--success)' : 'var(--danger)', color: '#fff', fontSize: '0.9rem' }}>
                        {message}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        style={{ padding: '12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>Bio</label>
                    <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        rows={4}
                        style={{ padding: '12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>Website</label>
                    <input 
                        type="url" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleChange} 
                        style={{ padding: '12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                        type="checkbox" 
                        name="isPrivate" 
                        checked={formData.isPrivate} 
                        onChange={handleChange} 
                        id="isPrivate"
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isPrivate" style={{ cursor: 'pointer' }}>Private Account</label>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary"
                    style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                    {isLoading && <Loader2 size={18} className="spin" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default SettingsTab;
