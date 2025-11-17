import { usePage, router } from "@inertiajs/react";
import { useEffect, useState, cloneElement, Fragment } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationListItem from "@/Components/App/ConversationItme";
import { route } from "ziggy-js";
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";

export default function ChatLayout({ children }) {
  const page = usePage();
  const { conversations } = page.props;
  const selectedConversation = page.props.conversation || null;
  const [onlineUsers, setOnlineUsers] = useState({});
  const [localConversation, setLocalConversation] = useState(conversations || []);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { on, emit } = useEventBus();

  const currentRoute = page.url;
  const isOnChatRoute = currentRoute.includes("/user/") || currentRoute.includes("/group/");
  const isUserOnline = (userId) => onlineUsers[userId];

  const onSearch = (e) => {
    const search = (e?.target?.value ?? "").toString().toLowerCase().trim();
    if (!search) {
      setLocalConversation(Array.isArray(conversations) ? conversations : []);
      return;
    }
    setLocalConversation(
      (Array.isArray(conversations) ? conversations : []).filter((conversation) => {
        const name = (conversation?.name ?? "").toString().toLowerCase();
        const last = (conversation?.last_message ?? "").toString().toLowerCase();
        return name.includes(search) || last.includes(search);
      })
    );
  };

  const messageCreated = (message) => {
    setLocalConversation((oldUsers) => {
      return oldUsers.map((u) => {
        if (message.receiver_id && !u.is_group && (u.id == message.sender_id || u.id == message.receiver_id)) {
          u.last_message = message.message;
          u.last_message_date = message.created_at;
          u.last_message_time = message.created_at;
          return u;
        }
        if (message.group_id && u.is_group && u.id == message.group_id) {
          u.last_message = message.message;
          u.last_message_date = message.created_at;
          u.last_message_time = message.created_at;
          return u;
        }
        return u;
      });
    });
  };

  useEffect(() => {
    const offCreated = on("message.created", messageCreated);
    const offModalShow = on("GroupModal.show", () => setShowGroupModal(true));
    return () => {
      offCreated();
      offModalShow();
    };
  }, [on]);

  useEffect(() => {
    if (conversations) {
      console.log('🔍 Conversations from backend:', conversations);
      setLocalConversation(Array.isArray(conversations) ? conversations : []);
    }
  }, [conversations]);

  useEffect(() => {
    const echo = typeof window !== "undefined" ? window.Echo : null;
    if (!echo || typeof echo.join !== "function") return;

    const channel = echo
      .join("online")
      .here((users) => setOnlineUsers(Object.fromEntries(users.map((user) => [user.id, user]))))
      .joining((user) => setOnlineUsers((prev) => ({ ...prev, [user.id]: user })))
      .leaving((user) => {
        setOnlineUsers((prev) => {
          const updated = { ...prev };
          delete updated[user.id];
          return updated;
        });
      })
      .error(console.error);

    return () => channel?.leave?.();
  }, []);

  const childrenWithProps = children?.type ? cloneElement(children, { ...children.props, onlineUsers }) : children;

  const active = (localConversation || []).filter((c) => !c.blocked_at);
  const blocked = (localConversation || []).filter((c) => c.blocked_at);

  return (
    <div className="flex w-full h-full overflow-hidden">
      <aside className={`bg-slate-800 flex flex-col overflow-hidden transition-all flex-shrink-0
          ${isOnChatRoute ? "hidden md:flex md:w-[320px]" : "flex w-full md:w-[320px]"}`}>
        <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
          Chats
          <button onClick={() => setShowGroupModal(true)} className="text-gray-400 hover:text-gray-200">
            <PencilSquareIcon className="h-5 w-5 inline-block ml-2" />
          </button>
        </div>

        <div className="p-3">
          <TextInput onChange={onSearch} placeholder="Search or start new chat" className="w-full" />
        </div>

        <div className="flex-1 overflow-auto">
          {active.map((conversation) => (
            <ConversationListItem
              key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
              conversation={conversation}
              online={!!isUserOnline(conversation.id)}
              selectedConversation={selectedConversation}
            />
          ))}

          {blocked.length > 0 && (
            <div className="mt-4">
              <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wide">Blocked</div>
              <div className="bg-black/10 rounded-md px-2 py-2">
                {blocked.map((conversation) => (
                  <div key={`blocked_${conversation.is_group ? "group_" : "user_"}${conversation.id}`} className="mb-2">
                    <ConversationListItem conversation={conversation} online={!!isUserOnline(conversation.id)} selectedConversation={selectedConversation} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={`flex flex-col transition-all ${isOnChatRoute ? "flex w-full md:flex-1" : "hidden md:flex md:flex-1"}`}>
        {childrenWithProps}
      </main>

      <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false)} onlineUsers={onlineUsers} />
    </div>
  );
}

