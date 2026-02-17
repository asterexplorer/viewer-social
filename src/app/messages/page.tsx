'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, Info, Smile, Image, Mic, Send, MoreHorizontal, Edit } from 'lucide-react';
import styles from './messages.module.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'other';
    timestamp: string;
    avatar?: string;
    status?: 'sent' | 'delivered' | 'seen';
}

interface Conversation {
    id: number;
    name: string;
    username: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
}

const CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        name: 'Sarah Johnson',
        username: 'sarahjohnson',
        avatar: 'https://i.pravatar.cc/150?u=1',
        lastMessage: 'That sounds amazing! Can you show me more? 🤩',
        timestamp: '2m',
        unread: 2,
        online: true
    },
    {
        id: 2,
        name: 'Mike Chen',
        username: 'mikechen',
        avatar: 'https://i.pravatar.cc/150?u=12',
        lastMessage: 'Thanks for the help!',
        timestamp: '15m',
        unread: 0,
        online: true
    },
    {
        id: 3,
        name: 'Emily Davis',
        username: 'emilydavis',
        avatar: 'https://i.pravatar.cc/150?u=5',
        lastMessage: 'See you tomorrow 👋',
        timestamp: '1h',
        unread: 0,
        online: false
    },
    {
        id: 4,
        name: 'Alex Turner',
        username: 'alexturner',
        avatar: 'https://i.pravatar.cc/150?u=8',
        lastMessage: 'That sounds great!',
        timestamp: '3h',
        unread: 1,
        online: false
    },
    {
        id: 5,
        name: 'Jessica Lee',
        username: 'jessicalee',
        avatar: 'https://i.pravatar.cc/150?u=9',
        lastMessage: 'Let me know when you\'re free',
        timestamp: '5h',
        unread: 0,
        online: true
    }
];

const INITIAL_MESSAGES: Message[] = [
    {
        id: 1,
        text: 'Hey! How are you doing?',
        sender: 'other',
        timestamp: '10:30 AM',
        status: 'seen'
    },
    {
        id: 2,
        text: 'I\'m doing great! Just working on some new designs.',
        sender: 'user',
        timestamp: '10:32 AM',
        status: 'seen'
    },
    {
        id: 3,
        text: 'That\'s awesome! Can\'t wait to see them.',
        sender: 'other',
        timestamp: '10:33 AM',
        status: 'seen'
    },
    {
        id: 4,
        text: 'I\'ll share them with you soon! 🎨',
        sender: 'user',
        timestamp: '10:35 AM',
        status: 'seen'
    }
];

const MessagesPage = () => {
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Use the constant
    const conversations = CONVERSATIONS;

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, selectedConversation]);

    // Initial load selection (optional)
    useEffect(() => {
        // On desktop, select first conversation if none selected
        if (window.innerWidth > 768 && !selectedConversation) {
            setSelectedConversation(1);
        }
    }, []);

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            text: messageText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageText('');

        // Simulate reply
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const reply: Message = {
                id: messages.length + 2,
                text: 'That sounds amazing! Can you show me more? 🤩',
                sender: 'other',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: selectedConv?.avatar
            };
            setMessages(prev => [...prev, reply]);
        }, 3000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBack = () => {
        setSelectedConversation(null);
    };

    return (
        <div className={styles.messagesContainer}>
            {/* Conversations List - Hidden on mobile if chat is open */}
            <div className={`${styles.conversationsList} ${selectedConversation ? styles.hiddenOnMobile : ''}`}>
                <div className={styles.conversationsHeader}>
                    <h1 className={styles.headerTitle}>Chat</h1>
                    <button className={styles.newMessageBtn}>
                        <Edit size={20} />
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.conversationsScroll}>
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`${styles.conversationItem} ${selectedConversation === conv.id ? styles.active : ''}`}
                            onClick={() => setSelectedConversation(conv.id)}
                        >
                            <div className={styles.avatarContainer}>
                                <img src={conv.avatar} alt={conv.name} className={styles.avatar} />
                                {conv.online && <div className={styles.onlineIndicator} />}
                            </div>
                            <div className={styles.conversationInfo}>
                                <div className={styles.conversationTop}>
                                    <span className={styles.conversationName}>{conv.name}</span>
                                    <span className={styles.timestamp}>{conv.timestamp}</span>
                                </div>
                                <div className={styles.conversationBottom}>
                                    <span className={styles.lastMessage}>
                                        {conv.id === selectedConversation && messages.length > 0
                                            ? messages[messages.length - 1].text
                                            : conv.lastMessage}
                                    </span>
                                    {conv.unread > 0 && (
                                        <span className={styles.unreadBadge}>{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area - Shows empty state or active chat */}
            {selectedConversation ? (
                <div className={`${styles.chatArea} ${selectedConversation ? styles.visibleOnMobile : ''}`}>
                    {/* Chat Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.chatHeaderLeft}>
                            <button className={styles.backBtn} onClick={handleBack}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className={styles.avatarContainer}>
                                <img src={selectedConv?.avatar} alt={selectedConv?.name} className={styles.avatar} />
                                {selectedConv?.online && <div className={styles.onlineIndicator} />}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <h2 className={styles.chatName}>{selectedConv?.name}</h2>
                                <span className={styles.chatStatus}>
                                    {selectedConv?.online ? 'Active now' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className={styles.chatHeaderActions}>
                            <button className={styles.headerActionBtn}>
                                <Phone size={20} />
                            </button>
                            <button className={styles.headerActionBtn}>
                                <Video size={20} />
                            </button>
                            <button className={styles.headerActionBtn}>
                                <Info size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={styles.messagesArea}>
                        <div className={styles.dateSeparator}>
                            <span>Today</span>
                        </div>

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`${styles.messageWrapper} ${message.sender === 'user' ? styles.userMessage : styles.otherMessage}`}
                            >
                                {message.sender === 'other' && (
                                    <img src={message.avatar || selectedConv?.avatar} alt="Avatar" className={styles.messageAvatar} />
                                )}
                                <div className={styles.messageBubble}>
                                    <p className={styles.messageText}>{message.text}</p>
                                    <span className={styles.messageTime}>
                                        {message.timestamp}
                                        {message.sender === 'user' && (
                                            <span className={styles.messageStatus}>
                                                {message.status === 'seen' ? ' • Seen' : ' • Sent'}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className={`${styles.messageWrapper} ${styles.otherMessage}`}>
                                <img src={selectedConv?.avatar} alt="Avatar" className={styles.messageAvatar} />
                                <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                                    <div className={styles.typingIndicator}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className={styles.messageInput}>
                        <button className={styles.inputActionBtn}>
                            <Image size={22} />
                        </button>
                        <button className={styles.inputActionBtn}>
                            <Smile size={22} />
                        </button>
                        <input
                            type="text"
                            placeholder="Message..."
                            className={styles.textInput}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        {messageText.trim() ? (
                            <button className={styles.sendBtn} onClick={handleSendMessage}>
                                <Send size={20} />
                            </button>
                        ) : (
                            <button className={styles.inputActionBtn}>
                                <Mic size={22} />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className={`${styles.emptyState} ${styles.hiddenOnMobile}`} style={{ display: selectedConversation ? 'none' : 'flex' }}>
                    <div className={styles.emptyStateContent}>
                        <div className={styles.emptyIcon}>
                            <Send size={64} />
                        </div>
                        <h2 className={styles.emptyTitle}>Your Chats</h2>
                        <p className={styles.emptyDescription}>
                            Send private photos and chat with a friend or group
                        </p>
                        <button className={styles.sendMessageBtn}>Send Chat</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
