import { usePage, router } from "@inertiajs/react";
import { useEffect, useState, cloneElement, Fragment } from "react";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationListItem from "@/Components/App/ConversationItme";
import { route } from "ziggy-js";
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";
import { Menu, Transition } from "@headlessui/react";
import NewUserModal from "@/Components/App/NewContactModal";

export default function ChatLayout({ children }) {
  const page = usePage();
  const { conversations } = page.props;
  const selectedConversation = page.props.conversation || null;
  const [onlineUsers, setOnlineUsers] = useState({});
  const [localConversation, setLocalConversation] = useState(conversations || []);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
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
    setLocalConversation((prev) =>
      (prev || []).map((u) => {
        if (message.receiver_id && !u.is_group && (u.id == message.sender_id || u.id == message.receiver_id)) {
          return {
            ...u,
            last_message: message.message,
            last_message_date: message.created_at,
            last_message_time: message.created_at,
          };
        }
        if (message.group_id && u.is_group && u.id == message.group_id) {
          return {
            ...u,
            last_message: message.message,
            last_message_date: message.created_at,
            last_message_time: message.created_at,
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
        if (prevMessages.receiver_id && !u.is_group && (u.id == prevMessages.sender_id || u.id == prevMessages.receiver_id)) {
          return {
            ...u,
            last_message: prevMessages.message,
            last_message_date: prevMessages.created_at,
            last_message_time: prevMessages.created_at,
          };
        }
        if (prevMessages.group_id && u.is_group && u.id == prevMessages.group_id) {
          return {
            ...u,
            last_message: prevMessages.message,
            last_message_date: prevMessages.created_at,
            last_message_time: prevMessages.created_at,
          };
        }
        return u;
      })
    );
  };

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

  useEffect(() => {
    if (conversations) {
      setLocalConversation(Array.isArray(conversations) ? conversations : []);
    }
  }, [conversations]);

  useEffect(() => {
    const echo = typeof window !== "undefined" ? window.Echo : null;
    if (!echo?.join) return;
    const channel = echo
      .join("online")
      .here((users) => setOnlineUsers(Object.fromEntries(users.map((u) => [u.id, u]))))
      .joining((user) => setOnlineUsers((prev) => ({ ...prev, [user.id]: user })))
      .leaving((user) => {
        setOnlineUsers((prev) => {
          const copy = { ...prev };
          delete copy[user.id];
          return copy;
        });
      })
      .error(console.error);

    return () => channel?.leave?.();
  }, []);

  const childrenWithProps = children?.type ? cloneElement(children, { ...children.props, onlineUsers }) : children;

  const active = (localConversation || []).filter((c) => !c.blocked_at);
  const blocked = (localConversation || []).filter((c) => c.blocked_at);

  return (
    <div className="flex w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside className={`bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col overflow-hidden transition-all flex-shrink-0
          ${isOnChatRoute ? "hidden md:flex md:w-[380px]" : "flex w-full md:w-[380px]"}`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-slate-700/50">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {active.length} {active.length === 1 ? 'conversation' : 'conversations'}
            </p>
          </div>
          
          {/* Create Menu */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 p-3 text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg">
              <PlusIcon className="h-5 w-5" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 origin-top-right mt-2 w-48 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl py-2 z-50">
                <div className="px-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowNewUserModal(true)}
                        className={`${
                          active ? "bg-slate-700/50 text-white" : "text-slate-200"
                        } group flex w-full items-center rounded-lg px-3 py-3 text-sm transition-colors duration-150`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                          <PlusIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Add Contact</div>
                          <div className="text-slate-400 text-xs">Start a new chat</div>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className={`${
                          active ? "bg-slate-700/50 text-white" : "text-slate-200"
                        } group flex w-full items-center rounded-lg px-3 py-3 text-sm transition-colors duration-150`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                          <PencilSquareIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">New Group</div>
                          <div className="text-slate-400 text-xs">Create group chat</div>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-700/30 border-b border-slate-700/30">
          <div className="relative">
            <TextInput 
              onChange={onSearch} 
              placeholder="Search conversations..." 
              className="w-full bg-slate-700/50 border-0 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:bg-slate-700/70 transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-auto">
          {/* Active Conversations */}
          <div className="py-2">
            {active.length > 0 ? (
              active.map((conversation) => (
                <ConversationListItem
                  key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                  conversation={conversation}
                  online={!!isUserOnline(conversation.id)}
                  selectedConversation={selectedConversation}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <PencilSquareIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-slate-300 font-medium mb-2">No conversations yet</h3>
                <p className="text-slate-400 text-sm">Start a new chat to begin messaging</p>
              </div>
            )}
          </div>

          {/* Blocked Users Section */}
          {blocked.length > 0 && (
            <div className="mt-4 border-t border-slate-700/50 pt-4">
              <div className="px-4 py-2">
                <div className="flex items-center text-slate-400 text-sm uppercase tracking-wider font-medium">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Blocked Contacts
                </div>
              </div>
              <div className="px-2">
                {blocked.map((conversation) => (
                  <div key={`blocked_${conversation.is_group ? "group_" : "user_"}${conversation.id}`} className="mb-2 opacity-60">
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

      {/* Main Content Area */}
      <main className={`flex flex-col transition-all bg-slate-900/50 backdrop-blur-sm ${isOnChatRoute ? "flex w-full md:flex-1" : "hidden md:flex md:flex-1"}`}>
        {childrenWithProps}
      </main>

      {/* Modals */}
      <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false)} onlineUsers={onlineUsers} />
      <NewUserModal show={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
    </div>
  );
}