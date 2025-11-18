import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";
import MessageInput from "@/Components/App/MessageInput";
import DateSeparator, { groupMessagesByDate } from "@/Components/App/DateSeparator";
import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal";
import { useEventBus } from "@/EventBus";
import { useCallback } from "react";
import axios from "axios";

function Home({ messages = null, selectedConversation = null, onlineUsers = {} }) {
    
const [messagesList, setMessagesList] = useState(messages?.data ? [...messages.data].reverse() : []);    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const { on } = useEventBus();
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    
    // Check if the selected user is online
    const isOnline = selectedConversation && !selectedConversation.is_group 
        ? !!onlineUsers[selectedConversation.id]
        : false;

    const scrollToBottom = useCallback(() => {
        if (messagesCtrRef.current) {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
        }
    }, []);

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setMessagesList((prevMessages) => {
                const newMessages = [...prevMessages, message];
                // Scroll to bottom after state update
                setTimeout(() => scrollToBottom(), 0);
                return newMessages;
            });
        }
        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setMessagesList((prevMessages) => {
                const newMessages = [...prevMessages, message];
                // Scroll to bottom after state update
                setTimeout(() => scrollToBottom(), 0);
                return newMessages;
            });
        }
    }
    const messageDeleted = ({message}) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setMessagesList((prevMessages) => {
                return prevMessages.filter((m) => m.id !== message.id);
            });
        }
        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setMessagesList((prevMessages) => {
                return prevMessages.filter((m) => m.id !== message.id);
            });
        }
    }

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }
        const firstMessage = messagesList[0];
        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }

                const scrollHeight = messagesCtrRef && messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                setScrollFromBottom(tmpScrollFromBottom);

                setMessagesList((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
                });
            })
    }, [messagesList, noMoreMessages]);

    const onAttachmentClick = (attachments, index) => {
        setPreviewAttachment({
            attachments,
            index
        });
        setShowAttachmentPreview(true);
    }

    // Add this effect to watch for new messages and scroll
    useEffect(() => {
        if (messagesList.length > 0) {
            const lastMessage = messagesList[messagesList.length - 1];
            // Check if this is a new message (you might need to adjust this logic)
            // For example, check if it was created recently or by current user
            scrollToBottom();
        }
    }, [messagesList.length]); // Watch only the length changes

    useEffect(() => {
        // Scroll to bottom when conversation changes
        setTimeout(() => {
            scrollToBottom();
        }, 100);
        
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);
        
        return () => {
            offDeleted();
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        const offCleared = on("conversation.cleared", ({ conversationId }) => {
            if (selectedConversation && selectedConversation.id === conversationId) {
                setMessagesList([]); // clear messages immediately
            }
        });

        return () => offCleared();
    }, [on, selectedConversation]);

    

    useEffect(() => {
        // Handle scroll position when loading older messages
        if (messagesCtrRef.current && scrollFromBottom > 0) {
            // Fixed calculation
            messagesCtrRef.current.scrollTop = 
                messagesCtrRef.current.scrollHeight - 
                messagesCtrRef.current.clientHeight - 
                scrollFromBottom;
        }
    }, [messagesList, scrollFromBottom]);

    useEffect(() => {
        if (noMoreMessages) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.isIntersecting && loadMoreMessages();
            })
        }, {
            rootMargin: "0px 0px 100px 0px"
        });
        
        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        }
    }, [messagesList, loadMoreMessages, noMoreMessages]);

    // Group messages by date for rendering
    const groupedMessages = groupMessagesByDate(messagesList);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 items-center justify-center text-center h-full px-8">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-600/50">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-400" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl"></div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Welcome to Ali Chat
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            Select a conversation from the sidebar to start messaging, or create a new chat to connect with others.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 mt-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div className="text-slate-300 font-medium">Real-time</div>
                            <div className="text-slate-400 text-sm">Messaging</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-slate-300 font-medium">Group</div>
                            <div className="text-slate-400 text-sm">Chats</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="text-slate-300 font-medium">Secure</div>
                            <div className="text-slate-400 text-sm">Encrypted</div>
                        </div>
                    </div>
                </div>
            )}
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                        online={isOnline}
                    />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900/50 to-slate-800/30 backdrop-blur-sm"
                    >
                        {messagesList.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-600/50">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-200 mb-3">
                                    Start the conversation
                                </h3>
                                <p className="text-slate-400 max-w-sm">
                                    Send your first message to begin your chat with {selectedConversation?.name}
                                </p>
                                <div className="mt-6 w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                            </div>
                        )}
                        {messagesList.length > 0 && (
                            <div className="flex-1 flex flex-col min-h-full">
                                <div ref={loadMoreIntersect} className="h-4"></div>
                                <div className="space-y-1 p-4">
                                    {groupedMessages.map((item) => {
                                        if (item.type === 'date') {
                                            return (
                                                <DateSeparator
                                                    key={item.id}
                                                    date={item.date}
                                                />
                                            );
                                        } else {
                                            return (
                                                <MessageItem
                                                    key={item.id}
                                                    message={item.message}
                                                    attachmentClick={onAttachmentClick}
                                                />
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}
            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.index}
                    show = {showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                />
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};
export default Home;