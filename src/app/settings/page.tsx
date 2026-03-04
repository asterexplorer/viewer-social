'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/common/Loader';

const SettingsRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/profile?tab=settings');
    }, [router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader size="large" />
        </div>
    );
};

export default SettingsRedirect;

