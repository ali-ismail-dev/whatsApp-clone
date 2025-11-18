import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { useEventBus } from "@/EventBus";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Toast from "@/Components/App/Toast";
import NewMessageNotification from "@/Components/App/NewMessageNotification";
import NewContactModal from "@/Components/App/NewContactModal";
import NotificationBell from "@/Components/App/NotificationBell";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;
    const currentConversation = usePage().props.conversation;
    const { emit, on } = useEventBus();

    // Notifications state lifted up to parent component
    const initialNotifications = usePage().props.notifications || [];
    const [notifications, setNotifications] = useState(initialNotifications.slice(0, 20));
    const [unreadCount, setUnreadCount] = useState(notifications.length);

    // Update unreadCount when notifications change
    useEffect(() => {
        setUnreadCount(notifications.length);
    }, [notifications]);

    // Local state for conversations to enable real-time removal from sidebar
    const [localConversations, setLocalConversations] = useState(conversations);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showNewUserModal, setShowNewUserModal] = useState(false);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        const off = on("contact.request.accepted", (data) => {
            if (!data) return;
            router.visit(route("chat.user", { user: data.requester_id }));
        });
        return () => off();
    }, [on]);

    // Listen for live message notifications and update the shared state
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

    // Echo listener bindings (unchanged logic, kept as before)
    useEffect(() => {
        localConversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`;
            if (conversation.is_user) {
                channel = `message.user.${[
                    parseInt(user.id),
                    parseInt(conversation.id),
                ]
                    .sort((a, b) => a - b)
                    .join("-")}`;
            }

            Echo.private(channel)
                .error((error) => {
                    console.error("Echo Message Error:", error);
                })
                .listen("SocketMessage", (e) => {
                    const message = e.message;
                    emit("message.created", message);
                    if (message.sender_id === user.id) {
                        return;
                    }
                    emit("newMessageNotification", {
                        user: message.sender,
                        group_id: message.group_id,
                        message:
                            message.message ||
                            `Shared ${message.attachments?.length ?? 0} attachment(s)`,
                    });
                });

            if (conversation.is_group) {
                Echo.private(`group.deleted.${conversation.id}`)
                    .listen("GroupDeletedEvent", (e) => {
                        emit("group.deleted", { id: e.id, name: e.name });
                    })
                    .error((error) => {
                        console.error("Echo Group Delete Error:", error);
                    });
            }
        });

        return () => {
            localConversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;
                if (conversation.is_user) {
                    channel = `message.user.${[
                        parseInt(user.id),
                        parseInt(conversation.id),
                    ]
                        .sort((a, b) => a - b)
                        .join("-")}`;
                }
                Echo.leave(channel);
                if (conversation.is_group) {
                    Echo.leave(`group.deleted.${conversation.id}`);
                }
            });
        };
    }, [localConversations]);

    // Keep react-to-eventbus group.updated / created handlers (if present)
    useEffect(() => {
      const off = on("group.updated", (updated) => {
        if (!updated?.id) return;
        setLocalConversations((prev) =>
          prev ? prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)) : prev
        );
      });

      const offCreate = on("group.created", (created) => {
        if (!created?.id) return;
        setLocalConversations((prev) => (prev ? [created, ...prev] : [created]));
      });

      return () => {
        off();
        offCreate();
      };
    }, [on]);

    // Group deletion handler (keeps previous logic)
    useEffect(() => {
      const off = on("group.deleted", ({ id, name }) => {
        emit("toast.show", { message: `Group "${name}" deleted successfully`, type: "success", delay: 5000 });
        setLocalConversations((prev) => prev.filter((c) => c.id !== id));
        // If currently viewing deleted group, back to dashboard
        let propId = currentConversation?.id ?? null;
        let routeParamId = null;
        try {
          routeParamId =
            route()?.params && route().params.id ? parseInt(route().params.id) : null;
        } catch (e) {
          routeParamId = null;
        }
        let urlId = null;
        try {
          const parts = window.location.pathname.split("/").filter(Boolean);
          const last = parts[parts.length - 1];
          const maybe = parseInt(last);
          urlId = Number.isInteger(maybe) ? maybe : null;
        } catch (e) {
          urlId = null;
        }
        const currentId = propId ?? routeParamId ?? urlId;
        if (currentId !== null && currentId === id) {
          router.visit(route("dashboard"), { replace: true });
        }
      });

      return () => off();
    }, [currentConversation, on, emit, setLocalConversations]);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col h-screen">
                {/* Navigation Bar */}
                <nav className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 shadow-xl">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-[77px] justify-between items-center">
                            {/* Left Side - Logo Only */}
                            <div className="flex items-center">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/" className="group relative">
                                        <div className="relative transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                            <ApplicationLogo className="block h-[90px] w-auto transition-all duration-300" />
                                            {/* Enhanced Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 scale-150"></div>
                                            {/* Additional Pulse Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-all duration-700 scale-125 group-hover:scale-150"></div>
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                            Go to Home
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* RIGHT SIDE: notifications and user dropdown */}
                            <div className="hidden sm:flex sm:items-center">
                              <div className="flex items-center gap-4">
                                {/* Notification bell for desktop */}
                                <NotificationBell 
                                  notifications={notifications}
                                  setNotifications={setNotifications}
                                  unreadCount={unreadCount}
                                />

                                {/* User dropdown */}
                                <div className="flex relative">
                                  <Dropdown>
                                    <Dropdown.Trigger>
                                      <span className="inline-flex rounded-lg">
                                        <button
                                          type="button"
                                          className="inline-flex items-center rounded-lg bg-slate-700/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 border border-slate-600/50 hover:border-slate-500"
                                        >
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm mr-2">
                                            {user.name.charAt(0).toUpperCase()}
                                          </div>
                                          {user.name}
                                          <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl mt-2 py-2 min-w-[200px]">
                                      <Dropdown.Link 
                                        href={route("profile.edit")}
                                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors duration-150"
                                      >
                                        👤 Profile
                                      </Dropdown.Link>
                                      <Dropdown.Link 
                                        href={route("logout")} 
                                        method="post" 
                                        as="button"
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors duration-150"
                                      >
                                        🚪 Log Out
                                      </Dropdown.Link>
                                    </Dropdown.Content>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>

                            {/* MOBILE: Hamburger menu and notification bell */}
                            <div className="flex items-center sm:hidden">
                                {/* Notification bell for mobile */}
                                <div className="me-3">
                                    <NotificationBell 
                                      notifications={notifications}
                                      setNotifications={setNotifications}
                                      unreadCount={unreadCount}
                                    />
                                </div>
                                
                                {/* Mobile menu button */}
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-700/50 hover:text-slate-200 focus:bg-slate-700/50 focus:text-slate-200 focus:outline-none border border-slate-600/50"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={ !showingNavigationDropdown ? "inline-flex" : "hidden" }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={ showingNavigationDropdown ? "inline-flex" : "hidden" }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={ (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50" }>
                        <div className="border-t border-slate-700/50 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-slate-200 flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-sm font-normal text-slate-400">{user.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1 px-4">
                                <ResponsiveNavLink 
                                    href={route("profile.edit")}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    👤 Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink 
                                    method="post" 
                                    href={route("logout")} 
                                    as="button"
                                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-150"
                                >
                                    🚪 Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Header */}
                {header && (
                    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/30 shadow-sm">
                        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
            
            {/* Global Components */}
            <Toast />
            <NewMessageNotification />
            <NewContactModal show={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
        </>
    );
}