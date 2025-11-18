// resources/js/Layouts/ChatLayout.jsx  (replace your current ChatLayout.jsx with this)
import { usePage, router } from "@inertiajs/react";
import { useEffect, useState, cloneElement, Fragment } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationListItem from "@/Components/App/ConversationItme";
import { route } from "ziggy-js";
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";
import { Menu, Transition } from "@headlessui/react";
import NewUserModal from "@/Components/App/NewContactModal";

/**
 * ChatLayout - shows ONLY accepted contacts (from props.contacts) + groups
 */

export default function ChatLayout({ children }) {
  const page = usePage();
  // prefer contacts prop (server should provide accepted contacts), fallback to conversations prop
  const serverContacts = page.props.contacts ?? null;
  const serverConversations = page.props.conversations ?? [];
  const selectedConversation = page.props.conversation || null;

  const [onlineUsers, setOnlineUsers] = useState({});
  const [localConversation, setLocalConversation] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const { on, emit } = useEventBus();

  // route checks
  const currentRoute = page.url;
  const isOnChatRoute = currentRoute.includes("/user/") || currentRoute.includes("/group/");
  const isUserOnline = (userId) => onlineUsers[userId];

  // Helper: normalize contact -> conversation-like object expected by UI
  const mapContactToConversation = (c) => {
    // c is a Contact record with loaded 'user' (the other user), or structure returned by ContactController@index
    // Ensure safe access for both shapes:
    const otherUser = c.user ?? c.requested ?? c.requester ?? null;
    const id = otherUser?.id ?? c.id;
    const name = c.name ?? otherUser?.name ?? otherUser?.email ?? "Unknown";
    const avatar_url = otherUser?.avatar ? (otherUser.avatar_url ?? null) : (otherUser?.avatar_url ?? null);

    return {
      is_user: true,
      is_group: false,
      id,
      name,
      avatar_url,
      // keep some metadata for later (contact record id, who added, etc)
      contact_record_id: c.contact_record_id ?? c.id ?? null,
      added_by_me: c.added_by_me ?? !!(c.requester_id && page.props.auth?.user?.id === c.requester_id),
      // blocked flag preserved if present on user object
      blocked_at: otherUser?.blocked_at ?? c.blocked_at ?? null,
      // last message fields (if provided by backend)
      last_message: c.last_message ?? null,
      last_message_date: c.last_message_date ?? null,
      is_admin: otherUser?.is_admin ?? false,
      created_at: otherUser?.created_at ?? null,
      updated_at: otherUser?.updated_at ?? null,
    };
  };

  // Build initial localConversation from server props:
  useEffect(() => {
    // If backend provided contacts, use them (preferred)
    if (serverContacts) {
      // serverContacts could be an array of contact records (ContactController@index returns mapped objects)
      const contactsList = (Array.isArray(serverContacts) ? serverContacts : serverContacts || [])
        .map((c) => mapContactToConversation(c));

      // also keep groups from serverConversations
      const groupList = (Array.isArray(serverConversations) ? serverConversations : serverConversations || [])
        .filter((c) => c.is_group);

      // combine: contacts first, groups afterward
      setLocalConversation([...contactsList, ...groupList]);
      return;
    }

    // fallback (legacy): serverConversations already contains users+groups — keep old behavior
    setLocalConversation(Array.isArray(serverConversations) ? serverConversations : []);
  }, [serverContacts, serverConversations]);

  // Search
  const onSearch = (e) => {
    const search = (e?.target?.value ?? "").toString().toLowerCase().trim();
    if (!search) {
      // Rebuild from server props (so search won't permanently remove items)
      if (serverContacts) {
        const contactsList = (Array.isArray(serverContacts) ? serverContacts : serverContacts || [])
          .map((c) => mapContactToConversation(c));
        const groupList = (Array.isArray(serverConversations) ? serverConversations : serverConversations || []).filter((c) => c.is_group);
        setLocalConversation([...contactsList, ...groupList]);
      } else {
        setLocalConversation(Array.isArray(serverConversations) ? serverConversations : []);
      }
      return;
    }

    setLocalConversation((prev) =>
      (prev || []).filter((conversation) => {
        const name = (conversation?.name ?? "").toString().toLowerCase();
        const last = (conversation?.last_message ?? "").toString().toLowerCase();
        return name.includes(search) || last.includes(search);
      })
    );
  };

  // Message and group handlers (kept from your file, updated to use safe set)
  const messageCreated = (message) => {
    setLocalConversation((prev) =>
      (prev || []).map((u) => {
        if (
          message.receiver_id &&
          !u.is_group &&
          (u.id == message.sender_id || u.id == message.receiver_id)
        ) {
          return {
            ...u,
            last_message: message.message,
            last_message_date: message.created_at,
            last_message_time: message.created_at,
            last_message_sender_id: message.sender_id,
            last_message_receiver_id: message.receiver_id,
          };
        }
        if (message.group_id && u.is_group && u.id == message.group_id) {
          return {
            ...u,
            last_message: message.message,
            last_message_date: message.created_at,
            last_message_time: message.created_at,
            last_message_sender_id: message.sender_id,
            last_message_receiver_id: message.receiver_id,
          };
        }
        return u;
      })
    );
  };

  const messageDeleted = ({ prevMessages }) => {
    if (!prevMessages) return;
    setLocalConversation((prev) =>
      (prev || []).map((u) => {
        if (
          prevMessages.receiver_id &&
          !u.is_group &&
          (u.id == prevMessages.sender_id || u.id == prevMessages.receiver_id)
        ) {
          return {
            ...u,
            last_message: prevMessages.message,
            last_message_date: prevMessages.created_at,
            last_message_time: prevMessages.created_at,
            last_message_sender_id: prevMessages.sender_id,
            last_message_receiver_id: prevMessages.receiver_id,
          };
        }
        if (prevMessages.group_id && u.is_group && u.id == prevMessages.group_id) {
          return {
            ...u,
            last_message: prevMessages.message,
            last_message_date: prevMessages.created_at,
            last_message_time: prevMessages.created_at,
            last_message_sender_id: prevMessages.sender_id,
            last_message_receiver_id: prevMessages.receiver_id,
          };
        }
        return u;
      })
    );
  };

  // Event subscriptions
  useEffect(() => {
    const offCreated = on("message.created", messageCreated);
    const offDeleted = on("message.deleted", messageDeleted);
    const offModalShow = on("GroupModal.show", () => setShowGroupModal(true));
   

    return () => {
      offCreated();
      offDeleted();
      offModalShow();
    };
  }, [on, selectedConversation]);

  useEffect(() => {
    const offUpdate = on("group.updated", (updated) => {
      if (!updated?.id) return;
      setLocalConversation((prev) => (prev || []).map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    });

    const offCreate = on("group.created", (created) => {
      if (!created?.id) return;
      setLocalConversation((prev) => [created, ...(prev || [])]);
    });

    return () => {
      offUpdate();
      offCreate();
    };
  }, [on]);

  // user.blocked event
  useEffect(() => {
    const off = on("user.blocked", (payload) => {
      if (!payload?.id) return;
      setLocalConversation((prev = []) => {
        const next = prev.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
        const active = next.filter((c) => !c.blocked_at);
        const blocked = next.filter((c) => c.blocked_at);
        return [...active, ...blocked];
      });
    });
    return () => off();
  }, [on]);

  // contact.created — if backend emits contact.created with mapped contact object, prepend it
  useEffect(() => {
    const off = on("contact.created", (contact) => {
      if (!contact || !contact.id) return;
      const conv = mapContactToConversation(contact);
      setLocalConversation((prev = []) => {
        if (prev.find((c) => c.id === conv.id)) return prev;
        return [conv, ...(prev || [])];
      });
    });
    return () => off();
  }, [on]);

  // Presence / Echo
  useEffect(() => {
    const echo = typeof window !== "undefined" ? window.Echo : null;
    if (!echo?.join) return;
    const channel = echo
      .join("online")
      .here((users) => setOnlineUsers(Object.fromEntries(users.map((u) => [u.id, u]))))
      .joining((user) => setOnlineUsers((prev) => ({ ...prev, [user.id]: user })))
      .leaving((user) =>
        setOnlineUsers((prev) => {
          const copy = { ...prev };
          delete copy[user.id];
          return copy;
        }),
      )
      .error(console.error);

    return () => channel?.leave?.();
  }, []);

  // clone children
  const childrenWithProps = children?.type ? cloneElement(children, { ...children.props, onlineUsers }) : children;

  // computed lists
  const active = (localConversation || []).filter((c) => !c.blocked_at);
  const blocked = (localConversation || []).filter((c) => c.blocked_at);

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left panel: conversations */}
      <aside className={`bg-slate-800 flex flex-col overflow-hidden transition-all flex-shrink-0
          ${isOnChatRoute ? "hidden md:flex md:w-[320px]" : "flex w-full md:w-[320px]"}`}>
        <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
          <div className="flex items-center gap-2">
            <span>Chats</span>
          </div>

          {/* Pencil dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-gray-500 hover:text-gray-200 inline-flex items-center justify-center rounded p-1">
              <PencilSquareIcon className="h-5 w-5" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 origin-top-right mt-2 w-40 rounded-md bg-gray-600 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowNewUserModal(true)}
                        className={`${active ? "bg-gray-800 text-white" : "text-gray-300"} w-full text-left px-3 py-2 text-sm`}
                      >
                        Add Contact
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className={`${active ? "bg-gray-800 text-white" : "text-gray-300"} w-full text-left px-3 py-2 text-sm`}
                      >
                        New Group
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <div className="p-3 bg-black/15">
          <TextInput onChange={onSearch} placeholder="Search or start new chat" className="w-full" />
        </div>

        <div className="flex-1 overflow-auto mt-2">
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
                    <ConversationListItem
                      conversation={conversation}
                      online={!!isUserOnline(conversation.id)}
                      selectedConversation={selectedConversation}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right panel: chat content */}
      <main className={`flex flex-col transition-all ${isOnChatRoute ? "flex w-full md:flex-1" : "hidden md:flex md:flex-1"}`}>
        {childrenWithProps}
      </main>

      {/* Modals */}
      <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false)} />
      <NewUserModal show={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
    </div>
  );
}