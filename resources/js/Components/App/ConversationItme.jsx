import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { route } from "ziggy-js";
import UserOptionsDropdown from "./UserOptionsDropdown";

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

  let classes = " border-transparent";
  if (selectedConversation) {
    if (
      !selectedConversation.is_group &&
      !conversation.is_group &&
      selectedConversation.id === conversation.id
    ) {
      classes = " bg-black/20 border-blue-500";
    } else if (
      selectedConversation.is_group &&
      conversation.is_group &&
      selectedConversation.id === conversation.id
    ) {
      classes = " bg-black/20 border-blue-500";
    }
  }

  const lastText = extractLastMessageText(conversation.last_message);

  // Use smart time formatting
  const lastTime =
    conversation.last_message_time
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
  className={
    "conversation-item flex items-center gap-2 p-2 text-gray-300 transition-all cursor-pointer hover:bg-black/20" +
    classes +
    (conversation.is_user && conversation.blocked_at
      ? " bg-black/30 cursor-not-allowed" // dark background and disabled cursor
      : "")
  }
>
  {conversation.is_user && <UserAvatar user={conversation} online={online} />}
  {conversation.is_group && <GroupAvatar group={conversation} />}

  <div
    className={
      "flex-1 max-w-full overflow-hidden" +
      (conversation.is_user && conversation.blocked_at ? " opacity-50" : "")
    }
  >
    <div className="flex gap-1 justify-between items-center">
      <h3 className="text-sm font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
        {conversation.name}
        {conversation.blocked_at && (
          <span className="ml-1 text-[10px] text-red-400 uppercase font-bold">
            Blocked
          </span>
        )}
      </h3>

      {lastTime && <span className="text-xs text-gray-400">{lastTime}</span>}
    </div>

    {lastText && (
      <p className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
        {lastText}
      </p>
    )}
  </div>

  {currentUser.is_admin && conversation.is_user ? (
    <div className="w-8 flex-shrink-0 flex justify-center">
    <UserOptionsDropdown conversation={conversation} />
  </div>
  ) : (
    ""
  )}
</Link>

  );
}