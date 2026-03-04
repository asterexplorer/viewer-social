'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, Info, Smile, Image as LucideImage, Mic, Send, Edit, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './messages.module.css';
import Image from 'next/image';

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
        lastMessage: 'That sounds amazing! 🤩',
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
        lastMessage: 'Let me know soon!',
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
        text: 'I\'m doing great! Just working on some new designs for the platform.',
        sender: 'user',
        timestamp: '10:32 AM',
        status: 'seen'
    },
    {
        id: 3,
        text: 'That\'s awesome! I saw the latest search page updates, they look stunning.',
        sender: 'other',
        timestamp: '10:33 AM',
        status: 'seen'
    },
    {
        id: 4,
        text: 'Glad you liked them! 🎨 More coming soon.',
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
    const [conversations] = useState<Conversation[]>(CONVERSATIONS);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConversation]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth > 768 && !selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0].id);
        }
    }, [conversations, selectedConversation]);

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
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
            const replyMessage: Message = {
                id: Date.now(),
                text: 'That sounds really interesting! Tell me more.',
                sender: 'other',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'delivered'
            };
            setMessages(prev => [...prev, replyMessage]);
            setIsTyping(false);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.messagesContainer}>
            <div className={styles.mainWrapper}>
                {/* Sidebar */}
                <div className={`${styles.conversationsList} ${selectedConversation ? styles.hiddenOnMobile : ''}`}>
                    <div className={styles.conversationsHeader}>
                        <h1 className={styles.headerTitle}>Messages</h1>
                        <button className={styles.newMessageBtn}>
                            <Edit size={22} />
                        </button>
                    </div>

                    <div className={styles.searchContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Find a contact..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.conversationsScroll}>
                        {filteredConversations.map((conv, idx) => (
                            <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`${styles.conversationItem} ${selectedConversation === conv.id ? styles.active : ''}`}
                                onClick={() => setSelectedConversation(conv.id)}
                            >
                                <div className={styles.avatarContainer}>
                                    <Image
                                        src={conv.avatar}
                                        alt={conv.name}
                                        className={styles.avatar}
                                        width={60}
                                        height={60}

                                    />
                                    {conv.online && <div className={styles.onlineIndicator} />}
                                </div>
                                <div className={styles.conversationInfo}>
                                    <div className={styles.conversationTop}>
                                        <span className={styles.conversationName}>{conv.name}</span>
                                        <span className={styles.timestamp}>{conv.timestamp}</span>
                                    </div>
                                    <div className={styles.conversationBottom}>
                                        <span className={styles.lastMessage}>{conv.lastMessage}</span>
                                        {conv.unread > 0 && <span className={styles.unreadBadge}>{conv.unread}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`${styles.chatArea} ${selectedConversation ? styles.visibleOnMobile : styles.hiddenOnMobile}`}>
                    <AnimatePresence mode="wait">
                        {selectedConversation ? (
                            <motion.div
                                key="chat"
                                className={styles.chatWrapper}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <div className={styles.chatHeader}>
                                    <div className={styles.chatHeaderLeft}>
                                        <button className={styles.backBtn} onClick={() => setSelectedConversation(null)}>
                                            <ChevronLeft size={28} />
                                        </button>
                                        <div className={styles.avatarContainer}>
                                            <Image
                                                src={selectedConv?.avatar || ''}
                                                alt={selectedConv?.name || ''}
                                                className={styles.avatar}
                                                width={48}
                                                height={48}

                                            />
                                            {selectedConv?.online && <div className={styles.onlineIndicator} />}
                                        </div>
                                        <div className={styles.chatHeaderInfo}>
                                            <h2 className={styles.chatName}>{selectedConv?.name}</h2>
                                            <span className={styles.chatStatus}>
                                                {selectedConv?.online ? 'Online now' : 'Active 2h ago'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.chatHeaderActions}>
                                        <button className={styles.headerActionBtn}><Phone size={20} /></button>
                                        <button className={styles.headerActionBtn}><Video size={20} /></button>
                                        <button className={styles.headerActionBtn}><Info size={20} /></button>
                                    </div>
                                </div>

                                <div className={styles.messagesArea}>
                                    <AnimatePresence mode="popLayout">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`${styles.messageWrapper} ${message.sender === 'user' ? styles.userMessage : styles.otherMessage}`}
                                            >
                                                {message.sender === 'other' && (
                                                    <Image
                                                        src={selectedConv?.avatar || ''}
                                                        alt="Avatar"
                                                        className={styles.messageAvatar}
                                                        width={36}
                                                        height={36}

                                                    />
                                                )}
                                                <div className={styles.messageBubble}>
                                                    <p className={styles.messageText}>{message.text}</p>
                                                    <span className={styles.messageTime}>
                                                        {message.timestamp}
                                                        {message.sender === 'user' && message.status === 'seen' && <span className={styles.messageStatus}> ✓✓</span>}
                                                        {message.sender === 'user' && message.status === 'sent' && <span className={styles.messageStatus}> ✓</span>}
                                                        {message.sender === 'user' && message.status === 'delivered' && <span className={styles.messageStatus}> ✓✓</span>}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isTyping && (
                                            <motion.div
                                                key="typing"
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                className={`${styles.messageWrapper} ${styles.otherMessage}`}
                                            >
                                                <Image
                                                    src={selectedConv?.avatar || ''}
                                                    alt="Avatar"
                                                    className={styles.messageAvatar}
                                                    width={36}
                                                    height={36}
                                                />
                                                <div className={styles.messageBubble}>
                                                    <div className={styles.typingIndicator}>
                                                        <span></span><span></span><span></span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className={styles.messageInput}>
                                    <button className={styles.headerActionBtn}><LucideImage size={22} /></button>
                                    <button className={styles.headerActionBtn}><Smile size={22} /></button>
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        className={styles.textInput}
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    />
                                    <button className={styles.sendBtn} onClick={handleSendMessage}>
                                        <Send size={24} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                className={styles.emptyState}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <div className={styles.emptyIconWrapper}>
                                    <Send size={48} />
                                </div>
                                <h2 className={styles.emptyTitle}>Your Inbox</h2>
                                <p className={styles.emptyDescription}>
                                    Select a conversation to start chatting or initiate a new one.
                                </p>
                                <button className={styles.sendMessageBtn}>Start Messaging</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
