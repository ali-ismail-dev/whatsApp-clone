import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageItem from "@/Components/App/MessageItem";



function Home({ messages = null, selectedConversation = null }) {
    const [messagesList, setMessagesList] = useState([]);
    const messagesCtrRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);        
    }, [selectedConversation]);

    useEffect(() => {
        // --- FIX HERE ---
        // Safely access messages.data, defaulting to an empty array if anything is missing.
        const data = messages?.data || []; 

        if (Array.isArray(data)) {
            // Only set if it's an array
            setMessagesList([...data].reverse());
        } else {
            // Handle unexpected data structure gracefully
            setMessagesList([]);
        }
        // --- END FIX ---
    }, [messages]);

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
                    <ConversationHeader selectedConversation={selectedConversation} />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-5"
                    >
                        {messagesList.length === 0 &&
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages yet
                                </div>
                            </div>
                        }
                        {messagesList.length > 0 &&
                            <div className="flex-1 flex flex-col gap-2">
                                {messagesList.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>

                                }

                    </div>
                    {/* <MessageInput conversation = {selectedConversation} /> */}
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
