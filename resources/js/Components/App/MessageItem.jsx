import React from 'react'
import ReactMarkdown from 'react-markdown';
import UserAvatar from './UserAvatar';
import { usePage } from '@inertiajs/react';
import { formatMessageDateLong } from '@/Helpers';

export default function MessageItem({ message }) {
    const { props } = usePage();
    const currentUserId = props.auth?.user?.id;
    if (!currentUserId) {
        console.error("Authenticated user data is missing!");
        return null; 
    }
    const isCurrentUserMessage = message.sender_id === currentUserId;
    return (
        <div className={"chat" + (isCurrentUserMessage ? " chat-end" : " chat-start")}>
            {<UserAvatar user={message.sender} />}
            <div className="chat-header">
                {isCurrentUserMessage ?"You" : message.sender.name}
                <time className="text-xs opacity-50 ml-2">{formatMessageDateLong(message.created_at)}</time>
            </div>
            <div className={"chat-bubble relative" + (isCurrentUserMessage ? " chat-bubble-info" : " chat-bubble-secondary")}>
                <div className="chat-message">
                    <div className="chat-message-content">
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                </div>
            
            </div>
        </div>
    )
            
    
}