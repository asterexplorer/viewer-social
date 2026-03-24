'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, Info, Smile, Image as LucideImage, Mic, Send, Edit, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
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

import { getConversations, getMessages, sendMessage, startConversation } from '@/app/actions';
import { pusherClient } from '@/lib/pusher';

const MessagesPage = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                const [userRes, convs] = await Promise.all([
                    fetch('/api/users/me').then(r => r.json()),
                    getConversations()
                ]);
                setCurrentUser(userRes);
                setConversations(convs);
            } catch (err) {
                console.error('Initialization failed', err);
            }
        };
        init();
    }, []);

    // Fetch Messages when conversation changes
    useEffect(() => {
        if (!selectedConversation) return;
        const fetchMsgs = async () => {
            try {
                const msgs = await getMessages(selectedConversation);
                setMessages(msgs);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };
        fetchMsgs();

        // Subscribe to private channel for this chat
        const channel = pusherClient.subscribe(`chat-${selectedConversation}`);
        channel.bind('new-message', (message: any) => {
            setMessages(prev => {
                const exists = prev.some(m => m.id === message.id);
                if (exists) return prev;
                return [...prev, message];
            });
        });

        return () => {
            pusherClient.unsubscribe(`chat-${selectedConversation}`);
        };
    }, [selectedConversation]);

    // Global listeners for conversation updates
    useEffect(() => {
        if (!currentUser?.id) return;

        const convChannel = pusherClient.subscribe(`user-conv-${currentUser.id}`);
        convChannel.bind('conversation-update', (data: any) => {
            setConversations(prev => {
                const existsIdx = prev.findIndex(c => c.id === data.conversationId);
                if (existsIdx >= 0) {
                    const newConvs = [...prev];
                    newConvs[existsIdx] = {
                        ...newConvs[existsIdx],
                        messages: [data.lastMessage],
                        updatedAt: data.lastMessage.createdAt
                    };
                    return newConvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                } else {
                    // Refetch all if new conversation
                    getConversations().then(setConversations);
                    return prev;
                }
            });
        });

        return () => {
            pusherClient.unsubscribe(`user-conv-${currentUser.id}`);
        };
    }, [currentUser?.id]);

    // User Search handle
    useEffect(() => {
        if (!isSearching || !searchQuery) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            const res = await fetch('/api/users');
            if (res.ok) {
                const all = await res.json();
                setSearchResults(all.filter((u: any) => 
                    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
                ));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isSearching]);

    const filteredConversations = conversations.filter(c => {
        const otherParticipant = c.participants[0];
        return otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (otherParticipant.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        const text = messageText;
        setMessageText('');

        try {
            await sendMessage(selectedConversation, text);
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                // Add [IMAGE]: prefix to bypass basic text rendering and render as an image
                await sendMessage(selectedConversation, `[IMAGE]:${base64String}`);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Failed to upload image', err);
        }
    };

    const handleStartConversation = async (username: string) => {
        try {
            const conv = await startConversation(username);
            setConversations(prev => {
                const existing = prev.find(c => c.id === conv.id);
                if (existing) return prev;
                return [conv, ...prev];
            });
            setSelectedConversation(conv.id);
            setIsSearching(false);
            setSearchQuery('');
        } catch (err) {
            console.error('Failed to start conversation', err);
        }
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
                        <button className={styles.newMessageBtn} onClick={() => setIsSearching(!isSearching)}>
                            <Edit size={22} />
                        </button>
                    </div>

                    <div className={styles.searchContainer}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={isSearching ? "Find creators..." : "Find a contact..."}
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isSearching && searchResults.length > 0 && (
                        <div className={styles.searchResults}>
                            {searchResults.map((user: any) => (
                                <div 
                                    key={user.id} 
                                    className={styles.searchResultItem}
                                    onClick={() => handleStartConversation(user.username)}
                                >
                                    <Image 
                                        src={user.avatar || 'https://i.pravatar.cc/150'} 
                                        alt={user.username} 
                                        width={40} 
                                        height={40} 
                                        className={styles.resultAvatar} 
                                    />
                                    <div className={styles.resultInfo}>
                                        <span className={styles.resultName}>{user.fullName || user.username}</span>
                                        <span className={styles.resultUsername}>@{user.username}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.conversationsScroll}>
                        {filteredConversations.map((conv, idx) => {
                            const otherUser = conv.participants[0];
                            const lastMsg = conv.messages[0];
                            
                            return (
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
                                            src={otherUser.avatar || 'https://i.pravatar.cc/150'}
                                            alt={otherUser.username}
                                            className={styles.avatar}
                                            width={60}
                                            height={60}
                                        />
                                        {/* Mock online status for now */}
                                        <div className={styles.onlineIndicator} />
                                    </div>
                                    <div className={styles.conversationInfo}>
                                        <div className={styles.conversationTop}>
                                            <span className={styles.conversationName}>{otherUser.fullName || otherUser.username}</span>
                                            <span className={styles.timestamp}>
                                                {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                                            </span>
                                        </div>
                                        <div className={styles.conversationBottom}>
                                            <span className={styles.lastMessage}>{lastMsg?.content || 'Started a conversation'}</span>
                                            {/* conv.unread placeholder */}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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
                                                src={selectedConv?.participants[0]?.avatar || 'https://i.pravatar.cc/150'}
                                                alt={selectedConv?.participants[0]?.username || ''}
                                                className={styles.avatar}
                                                width={48}
                                                height={48}
                                            />
                                            <div className={styles.onlineIndicator} />
                                        </div>
                                        <div className={styles.chatHeaderInfo}>
                                            <h2 className={styles.chatName}>{selectedConv?.participants[0]?.fullName || selectedConv?.participants[0]?.username}</h2>
                                            <span className={styles.chatStatus}>Online now</span>
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
                                        {messages.map((message) => {
                                            const isMe = message.senderId === currentUser?.id;
                                            return (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className={`${styles.messageWrapper} ${isMe ? styles.userMessage : styles.otherMessage}`}
                                                >
                                                    {!isMe && (
                                                        <Image
                                                            src={selectedConv?.participants[0]?.avatar || 'https://i.pravatar.cc/150'}
                                                            alt="Avatar"
                                                            className={styles.messageAvatar}
                                                            width={36}
                                                            height={36}
                                                        />
                                                    )}
                                                    <div className={styles.messageBubble}>
                                                        {message.content.startsWith('[IMAGE]:') ? (
                                                            <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '4px' }}>
                                                                <Image src={message.content.replace('[IMAGE]:', '')} alt="Shared Image" width={240} height={240} style={{ objectFit: 'cover' }} />
                                                            </div>
                                                        ) : (
                                                            <p className={styles.messageText}>{message.content}</p>
                                                        )}
                                                        <span className={styles.messageTime}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isMe && <span className={styles.messageStatus}> ✓✓</span>}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {isTyping && (
                                            <motion.div
                                                key="typing"
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                className={`${styles.messageWrapper} ${styles.otherMessage}`}
                                            >
                                                <Image
                                                    src={selectedConv?.participants[0]?.avatar || 'https://i.pravatar.cc/150'}
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
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        id="chat-image-upload" 
                                        style={{ display: 'none' }} 
                                        onChange={handleImageUpload} 
                                    />
                                    <button 
                                        className={styles.headerActionBtn} 
                                        onClick={() => document.getElementById('chat-image-upload')?.click()}
                                    >
                                        <LucideImage size={22} />
                                    </button>
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
