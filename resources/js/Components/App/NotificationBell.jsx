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
              <Menu.Button className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-black-800 bg-blue-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Menu.Button>
            </div>

            <Transition as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-[360px] max-h-[480px] overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          markAllRead();
                          close();
                        }} 
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setNotifications([]);
                        close();
                      }} 
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">You're all caught up.</div>
                )}

                {notifications.map((n) => {
                  const { title, summary } = getNotificationText(n);
                  
                  return (
                    <Menu.Item key={n.id}>
                      {({ active, close: closeItem }) => (
                        <div className={`px-3 py-2 border-b last:border-none dark:border-gray-700 ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                          <div className="flex items-start gap-2">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => {
                                openConversationFromNotification(n);
                                closeItem();
                              }}
                            >
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {title}
                              </div>
                              {summary && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {summary}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {n.type === "ContactRequested" && (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      acceptContactRequest(n);
                                      closeItem();
                                    }} 
                                    className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      rejectContactRequest(n);
                                      closeItem();
                                    }} 
                                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {(n.type === "ContactAccepted" || n.type === "ContactRejected" || n.type === "MessageReceived") && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markRead(n.id);
                                    closeItem();
                                  }} 
                                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
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
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}