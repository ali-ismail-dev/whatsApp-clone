import React from "react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { usePage } from "@inertiajs/react";

// Helper function to format just the time (no date)
function formatMessageTime(value) {
  try {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    // Show only time like "2:45 PM"
    return d.toLocaleTimeString([], { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  } catch {
    return String(value);
  }
}

export default function MessageItem({ message }) {
  const { props } = usePage();
  const currentUserId = props.auth?.user?.id;

  if (!currentUserId) {
    console.error("Authenticated user data is missing!");
    return null;
  }

  const isCurrentUserMessage = message.sender_id === currentUserId;

  // Safety check: ensure message.message is a string
  const messageContent = typeof message.message === 'string' 
    ? message.message 
    : JSON.stringify(message.message);

  const bubbleClasses = `pb-6 chat-bubble relative max-w-xl min-w-[60px] break-words ${
    isCurrentUserMessage ? "bg-gray-700 text-white" : "chat-bubble-info text-black"
  }`;

  const timePositionClass = isCurrentUserMessage 
    ? "right-2 bottom-1 text-[10px] opacity-60" 
    : "left-2 bottom-1 text-[10px] opacity-60";

  return (
    <div className={`chat ${isCurrentUserMessage ? "chat-end" : "chat-start"} mb-4`}>
      <div className="flex items-end gap-3">
        {/* Incoming: avatar on left; Bubble next; Outgoing: bubble first; avatar on right */}
        {!isCurrentUserMessage && (
          <div className="flex flex-col items-center">
            <UserAvatar user={message.sender} profile={false} />
          </div>
        )}

        {/* Message bubble */}
        <div className={bubbleClasses}>
          <div className="prose-sm">
            <ReactMarkdown>{messageContent}</ReactMarkdown>
          </div>

          {/* Time only (no date) inside the bubble */}
          <time className={`absolute ${timePositionClass}`}>
            {formatMessageTime(message.created_at)}
          </time>
        </div>

        {isCurrentUserMessage && (
          <div className="flex flex-col items-center">
            <UserAvatar user={message.sender} profile={false} />
          </div>
        )}
      </div>
    </div>
  );
}