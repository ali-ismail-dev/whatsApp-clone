import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import { route } from "ziggy-js";
import UserOptionsDropdown from "./UserOptionsDropdown";

function formatShortTime(value) {
  try {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    // show short time like "14:32" — adjust to your locale if desired
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // prefer explicit last_message_time, otherwise fallback to created_at inside last_message object
  const lastTime =
    conversation.last_message_time ||
    (conversation.last_message && conversation.last_message.created_at
      ? formatShortTime(conversation.last_message.created_at)
      : "");

  return (
    <Link
      href={
        conversation.is_group
          ? route("chat.group", conversation)
          : route("chat.user", conversation)
      }
      preserveState
      className={
        "conversation-item flex items-center gap-2 p-2 text-gray-300 transition-all cursor-pointer hover:bg-black/30" +
        classes +
        (conversation.is_user && conversation.is_admin ? " pr-2" : " pr-4")
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
        <UserOptionsDropdown conversation={conversation} />
      ) : (
        ""
      )}
    </Link>
  );
}
