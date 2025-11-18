import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { route } from "ziggy-js";
import UserOptionsDropdown from "./UserOptionsDropdown";
import { UserGroupIcon, CheckIcon } from "@heroicons/react/24/outline";

/**
 * Smart time formatting for conversation list - WhatsApp style
 * - Today: shows time like "2:45 PM"
 * - Yesterday: shows "Yesterday"
 * - This week: shows day name like "Monday"
 * - Older: shows date like "1/15/24"
 */
function formatSmartTime(value) {
  try {
    if (!value) return "";
    const messageDate = new Date(value);
    if (isNaN(messageDate)) return String(value);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Today: show time
    if (msgDate.getTime() === today.getTime()) {
      return messageDate.toLocaleTimeString([], { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      });
    }
    
    // Yesterday
    if (msgDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }
    
    // Within last 7 days: show day name
    const daysDiff = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'long' });
    }
    
    // Older: show short date
    return messageDate.toLocaleDateString([], { 
      month: 'numeric', 
      day: 'numeric',
      year: messageDate.getFullYear() !== now.getFullYear() ? '2-digit' : undefined
    });
  } catch {
    return String(value);
  }
}

function extractLastMessageText(lastMsg) {
  if (!lastMsg) return "";
  if (typeof lastMsg === "string") return lastMsg;
  if (Array.isArray(lastMsg)) {
    // join array of messages or objects
    return lastMsg
      .map((m) => (typeof m === "string" ? m : m?.message ?? JSON.stringify(m)))
      .join(", ");
  }
  if (typeof lastMsg === "object") {
    return lastMsg.message ?? JSON.stringify(lastMsg);
  }
  return String(lastMsg);
}


export default function ConversationItem({
  conversation,
  online = null,
  selectedConversation = null,
}) {
  const page = usePage();
  const currentUser = page.props?.auth?.user ?? {};

  const isSelected = selectedConversation && 
    ((!selectedConversation.is_group && !conversation.is_group && selectedConversation.id === conversation.id) ||
     (selectedConversation.is_group && conversation.is_group && selectedConversation.id === conversation.id));

  const isBlocked = conversation.is_user && conversation.blocked_at;
  const hasUnread = conversation.unread_count > 0;

  const lastText = extractLastMessageText(conversation.last_message);
  const lastTime = conversation.last_message_time
    ? formatSmartTime(conversation.last_message_time)
    : conversation.last_message && conversation.last_message.created_at
    ? formatSmartTime(conversation.last_message.created_at)
    : "";

  return (
    <Link
      href={
        conversation.is_group
          ? route("chat.group", conversation)
          : route("chat.user", conversation)
      }
      preserveState
      className={`
        relative flex items-center gap-3 p-4 transition-all duration-300 group
        ${isSelected 
          ? 'bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-cyan-500/15 border-l-4 border-cyan-500 shadow-inner' 
          : 'hover:bg-slate-700/30 border-l-4 border-transparent'
        }
        ${isBlocked ? 'opacity-70 grayscale-20' : ''}
        ${hasUnread ? 'bg-slate-700/20' : ''}
      `}
    >
      {/* Unread Message Badge */}
      {hasUnread && !isSelected && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
      )}

      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        {conversation.is_user ? (
          <UserAvatar user={conversation} online={online} />
        ) : (
          <GroupAvatar group={conversation} />
        )}
        
        {/* Status Indicators */}
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
          {conversation.is_group ? (
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-lg">
              <UserGroupIcon className="w-2.5 h-2.5 text-white" />
            </div>
          ) : online ? (
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg animate-pulse"></div>
          ) : null}
        </div>
      </div>

      {/* Conversation Content */}
      <div className={`flex-1 min-w-0 ${isBlocked ? 'opacity-80' : ''}`}>
        <div className="flex justify-between items-start gap-2 mb-1.5">
          {/* Conversation Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className={`text-sm font-semibold truncate ${
              isSelected ? 'text-white' : hasUnread ? 'text-slate-100' : 'text-slate-200'
            }`}>
              {conversation.name}
            </h3>
            
            {/* Status Badges */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isBlocked && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded border border-red-500/30">
                  BLOCKED
                </span>
              )}
              
              {hasUnread && (
                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-medium rounded border border-cyan-500/30">
                  {conversation.unread_count} NEW
                </span>
              )}
            </div>
          </div>

          {/* Time */}
          {lastTime && (
            <span className={`text-xs flex-shrink-0 flex items-center gap-1 ${
              isSelected ? 'text-cyan-300' : hasUnread ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {hasUnread && <ClockIcon className="w-3 h-3" />}
              {lastTime}
            </span>
          )}
        </div>

        {/* Last Message Preview */}
        {lastText ? (
          <div className="flex items-center gap-2">
            <p className={`text-sm truncate ${
              isSelected ? 'text-cyan-100' : hasUnread ? 'text-slate-300' : 'text-slate-400'
            }`}>
              {lastText}
            </p>
          </div>
        ) : conversation.is_group ? (
          <p className="text-sm text-slate-400 flex items-center gap-1.5">
            <UserGroupIcon className="w-3 h-3" />
            {conversation.users?.length || 0} members • No messages yet
          </p>
        ) : (
          <p className="text-sm text-slate-400">Start a conversation...</p>
        )}
      </div>

      {/* User Options Dropdown */}
      {conversation.is_user && (
        <div className={`
          flex-shrink-0 transition-all duration-200
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <UserOptionsDropdown conversation={conversation} />
        </div>
      )}

      {/* Selection Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg pointer-events-none"></div>
      )}

      {/* Hover Effect */}
      {!isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
      )}
    </Link>
  );
}