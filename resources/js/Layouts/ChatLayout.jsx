import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationListItem from "@/Components/App/ConversationItme";

export default function ChatLayout({ children }) {
  const page = usePage();
  const { conversations } = page.props;
  const selectedConversation = page.props.conversation || null;
  const [onlineUsers, setOnlineUsers] = useState({});
  const [localConversation, setLocalConversation] = useState(conversations || []);
  const [sortedConversations, setSortedConversations] = useState([]);

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

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Left panel: conversations */}
      {/* - On small screens: show this when NO conversation is selected (block). If a conversation is selected, hide it (hidden). */}
      {/* - On sm+ screens: always show as a column with fixed width */}
      <aside
        className={`bg-slate-800 flex flex-col overflow-hidden transition-all
          ${selectedConversation ? "hidden xsm:flex" : "flex xsm:flex"}
          w-full xsm:w-[320px] flex-shrink-0`}
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
      {/* - On small screens: show this only when a conversation is selected (block). Otherwise hide it (hidden). */}
      {/* - On sm+ screens: always show and take remaining space */}
      <main
        className={`flex flex-col transition-all
          ${selectedConversation ? "flex w-full" : "hidden sm:flex flex-1"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
