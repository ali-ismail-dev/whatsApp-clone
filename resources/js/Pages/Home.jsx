import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";
import MessageInput from "@/Components/App/MessageInput";
import { useEventBus } from "@/EventBus";
import { useCallback } from "react";
import axios from "axios";

function Home({ messages = null, selectedConversation = null }) {
    const [messagesList, setMessagesList] = useState([]);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const { on } = useEventBus();

    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);

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

                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                console.log("tmpScrollFromBottom", tmpScrollFromBottom);
                setScrollFromBottom(tmpScrollFromBottom);

                setMessagesList((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
                });
            })
    }, [messagesList, noMoreMessages]);

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
        setScrollFromBottom(0);
        setNoMoreMessages(false);
        
        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        // Scroll to bottom when messages are initially loaded
        setTimeout(() => {
            scrollToBottom();
        }, 100);
        
        const data = messages?.data || [];
        if (Array.isArray(data)) {
            setMessagesList([...data].reverse());
        } else {
            setMessagesList([]);
        }
    }, [messages]);

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

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 items-center justify-center text-center h-full opacity-35">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        Please select a conversation to start messaging
                    </h1>
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-800 dark:text-gray-200" />
                </div>
            )}
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-2"
                    >
                        {messagesList.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages yet
                                </div>
                            </div>
                        )}
                        {messagesList.length > 0 && (
                            <div className="flex-1 flex flex-col gap-2">
                                <div ref={loadMoreIntersect}></div>
                                {messagesList.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
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