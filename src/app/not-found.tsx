import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--background)'
        }}>
            <div style={{
                background: 'var(--background-card)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: 'var(--card-shadow)',
                backdropFilter: 'blur(20px)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Compass size={32} />
                </div>

                <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>Lost in space?</h2>
                <p style={{ color: 'var(--foreground-muted)', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>
                    We couldn't find the page you're looking for. The link might be broken or the page may have been removed.
                </p>

                <Link
                    href="/"
                    style={{
                        background: 'var(--ig-gradient)',
                        color: 'white',
                        textDecoration: 'none',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        transition: 'all 0.2s'
                    }}
                >
                    Return to Feed
                </Link>
            </div>
        </div>
    );
}
