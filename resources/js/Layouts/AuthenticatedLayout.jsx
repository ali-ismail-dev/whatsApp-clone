import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { useEventBus } from "@/EventBus";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Toast from "@/Components/App/Toast";
import NewMessageNotification from "@/Components/App/NewMessageNotification";
import NewContactModal from "@/Components/App/NewContactModal";
import NotificationBell from "@/Components/App/NotificationBell"; // <-- added

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const conversations = usePage().props.conversations;
    const currentConversation = usePage().props.conversation;
    const { emit, on } = useEventBus();

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
        emit("toast.show", `Group "${name}" has been permanently deleted.`, "success");
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
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col h-screen">
                <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route("dashboard")}
                                        active={route().current("dashboard")}
                                    >
                                        Dashboard
                                    </NavLink>
                                </div>
                            </div>

                            {/* RIGHT SIDE: notifications, add contact, user dropdown */}
                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                              <div className="flex items-center gap-3">
                                {/* Notification bell */}
                                <NotificationBell />

                                {/* user dropdown */}
                                <div className="flex relative ms-3">
                                  <Dropdown>
                                    <Dropdown.Trigger>
                                      <span className="inline-flex rounded-md">
                                        <button
                                          type="button"
                                          className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                          {user.name}
                                          <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                      <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
                                      <Dropdown.Link href={route("logout")} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
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

                    <div className={ (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden" }>
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink href={route("dashboard")} active={route().current("dashboard")}>
                                Dashboard
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route("profile.edit")}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route("logout")} as="button">
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow dark:bg-gray-800">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {children}
            </div>
            <Toast />
            <NewMessageNotification />
            <NewContactModal show={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
        </>
    );
}
