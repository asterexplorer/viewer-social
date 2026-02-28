export interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION';
    user: {
        id: string;
        username: string;
        avatar?: string;
        fullName?: string;
    };
    postId?: string;
    postImage?: string;
    commentId?: string;
    commentText?: string;
    read: boolean;
    createdAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
}

export const notificationService = {
    async getNotifications(): Promise<NotificationResponse> {
        const response = await fetch('/api/notifications');

        // Gracefully handle unauthenticated users (guests)
        if (response.status === 401) {
            return { notifications: [], unreadCount: 0 };
        }

        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    async markAllAsRead(): Promise<void> {
        const response = await fetch('/api/notifications', { method: 'PATCH' });

        if (response.status === 401) return;

        if (!response.ok) throw new Error('Failed to mark notifications as read');
    }
};
