import React from "react";
import ReactMarkdown from "react-markdown";
import UserAvatar from "./UserAvatar";
import { usePage } from "@inertiajs/react";
import MessageAttachment from "./MessageAttachment";
import MessageOptionsDropdown from "./MessageOptionsDropDown";

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

export default function MessageItem({ message, attachmentClick }) {
  const { props } = usePage();
  const currentUserId = props.auth?.user?.id;

  if (!currentUserId) {
    console.error("Authenticated user data is missing!");
    return null;
  }

  const isCurrentUserMessage = message.sender_id === currentUserId;

  // Get attachments (handle both 'attachment' and 'attachments' keys)
  const attachments = message.attachment || message.attachments || [];
  const hasAttachments = attachments && attachments.length > 0;
  
  // Only show text if message exists and is not null
  const hasText = message.message !== null && message.message !== undefined && message.message !== '';

  const bubbleClasses = `
    relative max-w-xl min-w-[80px] break-words 
    rounded-3xl p-4 backdrop-blur-sm border
    transition-all duration-300 transform hover:scale-[1.01]
    ${isCurrentUserMessage 
      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-400/30 shadow-lg shadow-blue-500/20 ml-12" 
      : "bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-100 border-slate-600/50 shadow-lg shadow-slate-500/10 mr-12"
    }
  `;

  const timePositionClass = isCurrentUserMessage 
    ? "right-4 bottom-2 text-xs opacity-70" 
    : "left-4 bottom-2 text-xs opacity-70";

  return (
    <div className={`group relative mb-6 ${isCurrentUserMessage ? "flex justify-end" : "flex justify-start"}`}>
      
      {/* Message Options Dropdown - Only show on hover for current user's messages */}
      {isCurrentUserMessage && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <MessageOptionsDropdown message={message} />
        </div>
      )}

      <div className={`flex items-end gap-3 ${isCurrentUserMessage ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar with enhanced styling */}
        <div className="flex flex-col items-center">
          <div className={`
            transition-all duration-300 transform
            ${isCurrentUserMessage ? "hover:scale-110" : "hover:scale-110"}
          `}>
            <UserAvatar user={message.sender} profile={false} />
          </div>
          {/* Online status indicator */}
          {message.sender?.is_online && (
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse border border-slate-800"></div>
          )}
        </div>

        {/* Message bubble with enhanced styling */}
        <div className={bubbleClasses}>
          {/* Sender name for group messages (not current user) */}
          {!isCurrentUserMessage && message.conversation?.is_group && (
            <div className="text-xs font-semibold mb-1 opacity-90 text-cyan-300">
              {message.sender?.name}
            </div>
          )}
          
          {/* Message text with enhanced styling */}
          {hasText && (
            <div className="mb-3 prose-sm max-w-none">
              <ReactMarkdown 
                components={{
                  p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                  em: ({children}) => <em className="italic">{children}</em>,
                  code: ({children}) => <code className="bg-black/20 px-1 py-0.5 rounded text-sm">{children}</code>,
                  pre: ({children}) => <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto my-2 text-sm">{children}</pre>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-cyan-500/50 pl-3 my-2 opacity-90">{children}</blockquote>
                }}
              >
                {message.message}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Attachments */}
          {hasAttachments && (
            <div className="mb-3">
              <MessageAttachment
                attachments={attachments}
                attachmentClick={attachmentClick}
              />
            </div>
          )}

          {/* Time stamp with enhanced styling */}
          <time className={`absolute ${timePositionClass} text-white/80 font-medium`}>
            {formatMessageTime(message.created_at)}
          </time>

          {/* Decorative elements */}
          {isCurrentUserMessage && (
            <>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400/30 rounded-full"></div>
            </>
          )}
          {!isCurrentUserMessage && (
            <>
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-600/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-500/30 rounded-full"></div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}