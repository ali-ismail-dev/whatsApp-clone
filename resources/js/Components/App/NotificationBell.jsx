import { Menu, Transition } from "@headlessui/react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { useEventBus } from "@/EventBus";

export default function NotificationBell({ notifications, setNotifications, unreadCount }) {
  const { emit } = useEventBus();

  const removeLocal = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Mark a single notification read
  const markRead = async (id) => {
    if (String(id).startsWith("live-")) {
        removeLocal(id);
        return; 
    }

    try {
        await axios.post(route("notifications.read", id));
        removeLocal(id);
    } catch (e) {
        console.error("Failed to mark notification read:", e);
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await axios.post(route("notifications.readAll"));
      setNotifications([]);
    } catch (e) {
      console.error("Failed to mark all notifications read:", e);
    }
  };

  // Accept a contact request
  const acceptContactRequest = async (notification) => {
    const requestId = notification.data?.request_id;
    
    if (!requestId) {
        console.error("Failed to accept contact request: Missing 'request_id'", notification);
        markRead(notification.id);
        return; 
    }

    try {
        await axios.post(route("contacts.accept", requestId));
        removeLocal(notification.id);
        emit("contact.request.accepted", notification.data);
        emit("toast.show", "Contact request accepted!");
    } catch (e) {
        console.error("Failed to accept contact request:", e);
        emit("toast.show", { message: "Failed to accept request", type: "error" });
    }
  };

  // Reject a contact request
  const rejectContactRequest = async (notification) => {
    const requestId = notification.data?.request_id;

    if (!requestId) {
        console.error("Failed to reject contact request: Missing 'request_id'", notification);
        markRead(notification.id);
        return;
    }

    try {
        await axios.post(route("contacts.reject", requestId));
        removeLocal(notification.id);
        emit("contact.request.rejected", notification.data);
        emit("toast.show", "Contact request rejected");
    } catch (e) {
        console.error("Failed to reject contact request:", e);
        emit("toast.show", { message: "Failed to reject request", type: "error" });
    }
  };

  // Open conversation for message notification
  const openConversationFromNotification = async (n) => {
    try {
      if (n.type === "MessageReceived") {
        const convType = n.data.conversation_type;
        const convId = n.data.conversation_id;

        await markRead(n.id);

        if (convType === "group") {
          router.visit(route("chat.group", { group: convId }), { preserveState: false });
        } else {
          router.visit(route("chat.user", { user: convId }), { preserveState: false });
        }
      } else {
        await markRead(n.id);
      }
    } catch (e) {
      console.error("Failed to open conversation:", e);
    }
  };

  // Helper to get notification display text
  const getNotificationText = (n) => {
    switch(n.type) {
      case "ContactRequested":
        return {
          title: `${n.data.requester_name} sent you a contact request`,
          summary: n.data.name_proposed ? `They want to be added as "${n.data.name_proposed}"` : ''
        };
      case "ContactAccepted":
        return {
          title: `${n.data.requester_name} accepted your contact request`,
          summary: "You can now chat with them!"
        };
      case "ContactRejected":
        return {
          title: `${n.data.rejector_name} rejected your contact request`,
          summary: ''
        };
      case "MessageReceived":
        return {
          title: `Message from ${n.data.sender?.name ?? "Unknown"}`,
          summary: n.data.message_preview ?? ''
        };
      default:
        return {
          title: n.data.title ?? "Notification",
          summary: n.data.summary ?? n.data.message ?? ''
        };
    }
  };

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        {({ open, close }) => (
          <>
            <div>
              <Menu.Button className="
                relative p-3 rounded-xl 
                text-slate-400 hover:text-cyan-400 
                transition-all duration-300 
                hover:bg-slate-700/50 backdrop-blur-sm
                border border-transparent hover:border-slate-600/50
                hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20
                group
              ">
                <BellIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="
                    absolute -top-1 -right-1 
                    inline-flex items-center justify-center 
                    px-2 py-1 text-xs font-bold 
                    leading-none text-white
                    bg-gradient-to-r from-red-500 to-pink-500 
                    rounded-full min-w-[20px] h-5
                    shadow-lg shadow-red-500/30
                    animate-pulse
                  ">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Menu.Button>
            </div>

            <Transition as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="transform opacity-0 scale-95 -translate-y-2"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-250"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 -translate-y-2"
            >
              <Menu.Items className="
                absolute right-0 mt-3 w-96 max-h-96 overflow-auto 
                rounded-2xl backdrop-blur-xl
                bg-gradient-to-br from-slate-800/95 to-slate-900/95
                shadow-2xl shadow-blue-500/20
                border border-slate-600/50 z-50
                overflow-hidden
              ">
                {/* Gradient header */}
                <div className="
                  flex items-center justify-between p-4 
                  border-b border-slate-600/50
                  bg-gradient-to-r from-blue-500/10 to-cyan-500/10
                ">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm">
                      <BellIcon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">Notifications</div>
                    {unreadCount > 0 && (
                      <span className="
                        px-2 py-1 text-xs font-medium
                        bg-gradient-to-r from-blue-500 to-cyan-500
                        text-white rounded-full
                      ">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          markAllRead();
                          close();
                        }} 
                        className="
                          text-xs px-3 py-1 rounded-lg
                          bg-slate-700/50 text-slate-300 
                          hover:bg-slate-600/50 hover:text-white
                          transition-all duration-300 backdrop-blur-sm
                          border border-slate-600/50
                          hover:scale-105
                        "
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setNotifications([]);
                        close();
                      }} 
                      className="
                        p-1.5 rounded-lg
                        text-slate-400 hover:text-cyan-400
                        hover:bg-slate-700/50 transition-all duration-300
                        backdrop-blur-sm border border-transparent
                        hover:border-slate-600/50 hover:scale-110
                      "
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="
                        p-3 mx-auto w-12 h-12 
                        bg-slate-700/50 rounded-xl 
                        backdrop-blur-sm mb-3
                      ">
                        <BellIcon className="h-6 w-6 text-slate-400 mx-auto" />
                      </div>
                      <div className="text-sm text-slate-400">You're all caught up.</div>
                      <div className="text-xs text-slate-500 mt-1">No new notifications</div>
                    </div>
                  )}

                  {notifications.map((n) => {
                    const { title, summary } = getNotificationText(n);
                    
                    return (
                      <Menu.Item key={n.id}>
                        {({ active, close: closeItem }) => (
                          <div className={`
                            p-4 border-b last:border-none 
                            border-slate-600/30 transition-all duration-300
                            ${active ? 'bg-slate-700/30 backdrop-blur-sm' : ''}
                            hover:bg-slate-700/40
                          `}>
                            <div className="flex items-start gap-3">
                              {/* Notification indicator */}
                              <div className="
                                w-2 h-2 mt-2 rounded-full
                                bg-gradient-to-r from-cyan-500 to-blue-500
                                animate-pulse flex-shrink-0
                              "></div>

                              <div 
                                className="flex-1 cursor-pointer min-w-0" 
                                onClick={() => {
                                  openConversationFromNotification(n);
                                  closeItem();
                                }}
                              >
                                <div className="text-sm font-medium text-slate-200 leading-relaxed">
                                  {title}
                                </div>
                                {summary && (
                                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    {summary}
                                  </div>
                                )}
                                <div className="text-xs text-slate-500 mt-2">
                                  {new Date(n.created_at).toLocaleString()}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {n.type === "ContactRequested" && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        acceptContactRequest(n);
                                        closeItem();
                                      }} 
                                      className="
                                        text-xs px-3 py-1.5 rounded-lg
                                        bg-gradient-to-r from-green-500 to-emerald-500
                                        text-white hover:from-green-600 hover:to-emerald-600
                                        transition-all duration-300 hover:scale-105
                                        shadow-lg shadow-green-500/20
                                        backdrop-blur-sm border border-green-400/30
                                      "
                                    >
                                      Accept
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        rejectContactRequest(n);
                                        closeItem();
                                      }} 
                                      className="
                                        text-xs px-3 py-1.5 rounded-lg
                                        bg-slate-700/50 text-slate-300 
                                        hover:bg-red-500/20 hover:text-red-300
                                        transition-all duration-300 hover:scale-105
                                        backdrop-blur-sm border border-slate-600/50
                                        hover:border-red-500/30
                                      "
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {(n.type === "ContactAccepted" || n.type === "ContactRejected" || n.type === "MessageReceived") && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markRead(n.id);
                                      closeItem();
                                    }} 
                                    className="
                                      text-xs px-3 py-1.5 rounded-lg
                                      bg-slate-700/50 text-slate-300 
                                      hover:bg-slate-600/50 hover:text-white
                                      transition-all duration-300 hover:scale-105
                                      backdrop-blur-sm border border-slate-600/50
                                    "
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Menu.Item>
                    );
                  })}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-slate-600/50 bg-slate-900/50">
                    <p className="text-xs text-slate-500 text-center">
                      {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}