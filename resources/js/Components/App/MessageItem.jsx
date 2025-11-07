import React from "react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { usePage } from "@inertiajs/react";
import { formatMessageDateLong } from "@/Helpers";

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

  const bubbleClasses = `pb-6 chat-bubble relative max-w-xl break-words ${
    isCurrentUserMessage ? "bg-gray-700 text-white" : "chat-bubble-info text-black"
  }`;

  const timePositionClass = isCurrentUserMessage ? "right-2 bottom-1 text-[10px] opacity-60" : "left-2 bottom-1 text-[10px] opacity-60";

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

          {/* Date/time inside the bubble (absolute positioned) */}
          <time className={`absolute ${timePositionClass}`}>
            {formatMessageDateLong(message.created_at)}
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