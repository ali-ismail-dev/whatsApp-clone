import { usePage, router } from "@inertiajs/react";
import { useEffect, useState, cloneElement } from "react";
import { PencilSquareIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationListItem from "@/Components/App/ConversationItme";
import { route } from "ziggy-js";
import { useEventBus } from "@/EventBus";

export default function ChatLayout({ children }) {
  const page = usePage();
  const { conversations } = page.props;
  const selectedConversation = page.props.conversation || null;
  const [onlineUsers, setOnlineUsers] = useState({});
  const [localConversation, setLocalConversation] = useState(conversations || []);
  const [sortedConversations, setSortedConversations] = useState([]);
  const { on } = useEventBus();  
  
  // Check if we're on a specific chat route (user or group)
  const currentRoute = page.url;
  const isOnChatRoute = currentRoute.includes('/user/') || currentRoute.includes('/group/');

  const isUserOnline = (userId) => onlineUsers[userId];

  const onSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setLocalConversation(
      conversations.filter((conversation) => {
        return (
          conversation.name.toLowerCase().includes(search) ||
          conversation.last_message.toLowerCase().includes(search)
        );
      })
    );
  };

  const handleBackToContacts = () => {
    // Navigate back to the dashboard (main chat page)
    router.visit(route('dashboard'));
  };

  const messageCreated = (message) =>{
    setLocalConversation((oldUsers) => {
      return oldUsers.map((u)=>{
        if (
          message.receiver_id &&
          !u.is_group &&
          (u.id == message.sender_id || u.id == message.receiver_id)
        ) {
            u.last_message = message.message;
            u.last_message_date = message.created_at;
            u.last_message_time = message.created_at;
            u.last_message_sender_id = message.sender_id;
            u.last_message_receiver_id = message.receiver_id;
            return u
          }
          if (
            message.group_id &&
            u.is_group &&
            u.id == message.group_id
          ) {
            u.last_message = message.message;
            u.last_message_date = message.created_at;
            u.last_message_time = message.created_at;
            u.last_message_sender_id = message.sender_id;
            u.last_message_receiver_id = message.receiver_id;
            return u 
          }
          return u;
      })
    })
  }
  
  useEffect(() => {
    const offCreated = on("message.created", messageCreated);
    return () => {
      offCreated();
    }
  }, [on]);

  useEffect(() => {
    setSortedConversations(
      [...localConversation].sort((a, b) => {
        if (a.blocked_at && b.blocked_at) {
          return a.blocked_at > b.blocked_at ? 1 : -1;
        } else if (a.blocked_at) {
          return 1;
        } else if (b.blocked_at) {
          return -1;
        }
        if (a.last_message_date && b.last_message_date) {
          return b.last_message_date.localeCompare(a.last_message_date);
        } else if (a.last_message_date) {
          return -1;
        } else if (b.last_message_date) {
          return 1;
        } else {
          return 0;
        }
      })
    );
  }, [localConversation]);

  useEffect(() => {
    if (conversations) {
      setLocalConversation(Array.isArray(conversations) ? conversations : []);
    }
  }, [conversations]);

  useEffect(() => {
    const echo = typeof window !== "undefined" ? window.Echo : null;
    if (!echo || typeof echo.join !== "function") {
      console.warn("Echo is not initialized or join is not available.");
      return;
    }

    const channel = echo
      .join("online")
      .here((users) => {
        const onlineUsersObj = Object.fromEntries(
          users.map((user) => [user.id, user])
        );
        setOnlineUsers(onlineUsersObj);
      })
      .joining((user) => {
        setOnlineUsers((prevOnlineUsers) => {
          const updatedUsers = { ...prevOnlineUsers };
          updatedUsers[user.id] = user;
          return updatedUsers;
        });
        console.log(user.name + " joined the chat.");
      })
      .leaving((user) => {
        setOnlineUsers((prevOnlineUsers) => {
          const updatedUsers = { ...prevOnlineUsers };
          delete updatedUsers[user.id];
          return updatedUsers;
        });
        console.log(user.name + " left the chat.");
      })
      .error((error) => {
        console.error("Error in presence channel:", error);
      });

    return () => {
      try {
        if (channel && typeof channel.leave === "function") {
          channel.leave();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Clone children and pass onlineUsers prop
  const childrenWithProps = children?.type 
  ? cloneElement(children, { 
      ...children.props,
      onlineUsers 
    })
  : children;
    console.log('=== ChatLayout Debug ===');
console.log('onlineUsers in ChatLayout:', onlineUsers);
console.log('children:', children);
console.log('=======================');

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left panel: conversations */}
      <aside
        className={`bg-slate-800 flex flex-col overflow-hidden transition-all flex-shrink-0
          ${isOnChatRoute ? "hidden md:flex md:w-[320px]" : "flex w-full md:w-[320px]"}`}
      >
        <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
          Chats
          <div className="tooltip tooltip-left" data-tip="Create new Group">
            <button className="text-gray-400 hover:text-gray-200">
              <PencilSquareIcon className="h-5 w-5 inline-block ml-2 " />
            </button>
          </div>
        </div>

        <div className="p-3">
          <TextInput
            onKeyUp={onSearch}
            placeholder="Search or start new chat"
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {sortedConversations &&
            sortedConversations.map((conversation) => (
              <ConversationListItem
                key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                conversation={conversation}
                online={!!isUserOnline(conversation.id)}
                selectedConversation={selectedConversation}
              />
            ))}
        </div>
      </aside>

      {/* Right panel: chat content */}
      <main
        className={`flex flex-col transition-all
          ${isOnChatRoute ? "flex w-full md:flex-1" : "hidden md:flex md:flex-1"}`}
      >
        
        {childrenWithProps}
      </main>
    </div>
  );
}