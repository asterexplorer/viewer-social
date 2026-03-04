import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.impact({ style });
        } catch (e) {
            // Silently fail
        }
    }
};

export const triggerHapticNotification = async (type: NotificationType = NotificationType.Success) => {
    if (Capacitor.isNativePlatform()) {
        try {
            await Haptics.notification({ type });
        } catch (e) {
            // Silently fail
        }
    }
};
