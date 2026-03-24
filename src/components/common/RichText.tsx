'use client';

import React from 'react';
import Link from 'next/link';

interface RichTextProps {
    text: string;
    className?: string;
}

const RichText: React.FC<RichTextProps> = ({ text, className }) => {
    // Regex for matching tags and mentions.
    // Example: #awesome or @username
    const parseText = (content: string) => {
        const regex = /(@\w+|#\w+)/g;
        const parts = content.split(regex);

        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                const tag = part.substring(1);
                return (
                    <Link key={index} href={`/search?q=${encodeURIComponent(tag)}&tab=tags`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {part}
                    </Link>
                );
            } else if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link key={index} href={`/profile/${username}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        {part}
                    </Link>
                );
            }
            return part; // plain text
        });
    };

    return (
        <span className={className}>
            {parseText(text)}
        </span>
    );
};

export default RichText;
