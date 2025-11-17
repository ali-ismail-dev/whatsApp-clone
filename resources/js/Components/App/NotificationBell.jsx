import { Menu, Transition } from "@headlessui/react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState, useMemo, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { useEventBus } from "@/EventBus";

export default function NotificationBell() {
  const { on, emit } = useEventBus();
  const { props } = usePage();
  const initialNotifications = props.notifications || [];

  // local copy for UI updates
  const [notifications, setNotifications] = useState(initialNotifications.slice(0, 20));

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const removeLocal = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Mark a single notification read
const markRead = async (id) => {
    // 1. Check for synthetic (live) IDs
    if (String(id).startsWith("live-")) {
        // If it's a live-only notification, just remove it locally
        removeLocal(id);
        return; 
    }

    // 2. If it's a real database ID, send the request to the backend
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
    const requestId = notification.data?.request_id; // Get request ID safely
    
    // --- SAFETY CHECK (Kept from previous fix) ---
    if (!requestId) {
        console.error("Failed to accept contact request: Missing 'request_id' in notification data.", notification);
        markRead(notification.id);
        return; 
    }
    // -------------------------------------

    try {
        // FIX: Changed parameter key from { request: requestId } to { contact: requestId }
        await axios.post(route("contacts.accept", { contact: requestId })); 
        await axios.post(route("notifications.read", notification.id));
        removeLocal(notification.id);
        emit("contact.request.accepted", notification.data);
    } catch (e) {
        console.error("Failed to accept contact request:", e);
    }
};

// Reject a contact request
const rejectContactRequest = async (notification) => {
    const requestId = notification.data?.request_id; // Get request ID safely

    // Add similar safety check for reject
    if (!requestId) {
        console.error("Failed to reject contact request: Missing 'request_id' in notification data.", notification);
        markRead(notification.id);
        return;
    }

    try {
        // FIX: Changed parameter key from { request: requestId } to { contact: requestId }
        await axios.post(route("contacts.reject", { contact: requestId })); 
        await axios.post(route("notifications.read", notification.id));
        removeLocal(notification.id);
        emit("contact.request.rejected", notification.data);
    } catch (e) {
        console.error("Failed to reject contact request:", e);
    }
};
  // Open conversation for message notification
const openConversationFromNotification = async (n) => {
  try {
    if (n.type === "MessageReceived") {
      const convType = n.data.conversation_type; // "group" or "user"
      const convId = n.data.conversation_id;
      const routeName = convType === "group" ? "chat.group" : "chat.user";
      
      await axios.post(route("notifications.read", n.id));
      removeLocal(n.id);
      
      // Use the correct parameter names based on your routes
      if (convType === "group") {
        router.visit(route("chat.group", { group: convId }), { preserveState: false });
      } else {
        router.visit(route("chat.user", { user: convId }), { preserveState: false });
      }
    } else {
      await axios.post(route("notifications.read", n.id));
      removeLocal(n.id);
    }
  } catch (e) {
    console.error("Failed to open conversation:", e);
  }
};

  // Listen for live message notifications
  useEffect(() => {
    const off = on("newMessageNotification", (payload) => {
      const item = {
        id: `live-${Date.now()}`,
        type: "MessageReceived",
        data: {
          conversation_type: payload.group_id ? "group" : "user",
          conversation_id: payload.group_id || payload.user?.id,
          message_preview: payload.message,
          sender: payload.user,
        },
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [item, ...prev].slice(0, 20));
    });
    return () => off();
  }, [on]);

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
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
                  <button onClick={markAllRead} className="text-xs text-gray-500 hover:underline">Mark all read</button>
                )}
                <button onClick={() => setNotifications([])} className="text-xs text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 && (
              <div className="p-4 text-sm text-gray-500">You're all caught up.</div>
            )}

            {notifications.map((n) => (
              <div key={n.id} className="px-3 py-2 border-b last:border-none dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <div className="flex-1 cursor-pointer" onClick={() => openConversationFromNotification(n)}>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {n.type === "ContactRequested" ? `${n.data.requester_name} sent you a contact request` :
                        n.type === "MessageReceived" ? `Message from ${n.data.sender?.name ?? "Unknown"}` :
                        n.data.title ?? "Notification"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {n.data.summary ?? n.data.message ?? n.data.message_preview ?? ''}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {n.type === "ContactRequested" && (
                      <>
                        <button onClick={() => acceptContactRequest(n)} className="text-xs px-2 py-1 rounded bg-green-600 text-white">Accept</button>
                        <button onClick={() => rejectContactRequest(n)} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Reject</button>
                      </>
                    )}
                    {n.type === "MessageReceived" && (
                      <button onClick={() => markRead(n.id)} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Mark read</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}