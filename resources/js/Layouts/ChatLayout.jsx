import { usePage, router } from "@inertiajs/react";
import { useEffect, useState, cloneElement } from "react";
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
    const isOnChatRoute =
        currentRoute.includes("/user/") || currentRoute.includes("/group/");

    const isUserOnline = (userId) => onlineUsers[userId];

    // --- Search filter ---
    const onSearch = (e) => {
        const search = (e?.target?.value ?? "").toString().toLowerCase().trim();
        if (!search) {
            setLocalConversation(conversations || []);
            return;
        }
        setLocalConversation(
            (conversations || []).filter((conversation) => {
                const name = (conversation?.name ?? "").toLowerCase();
                const last = (conversation?.last_message ?? "").toString().toLowerCase();
                return name.includes(search) || last.includes(search);
            })
        );
    };

    const handleBackToContacts = () => router.visit(route("dashboard"));

    // --- Message events ---
    const messageCreated = (message) => {
        setLocalConversation((prev) =>
            prev.map((u) => {
                if (
                    message.receiver_id && !u.is_group &&
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
            prev.map((u) => {
                if (
                    prevMessages.receiver_id && !u.is_group &&
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

    // --- EventBus subscriptions ---
    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offModalShow = on("GroupModal.show", () => setShowGroupModal(true));
        const offGroupDeleted = on("group.deleted", ({ id, name }) => {
            setLocalConversation((prev) => prev.filter((c) => c.id !== id));
            emit("toast.show", `Group "${name}" deleted successfully`);
            if (!selectedConversation || (selectedConversation.is_group && selectedConversation.id == id)) {
                router.visit(route("dashboard"));
            }
        });

        return () => {
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDeleted();
        };
    }, [on, selectedConversation]);

    useEffect(() => {
        const offUpdate = on("group.updated", (updated) => {
            if (!updated?.id) return;
            setLocalConversation((prev) =>
                prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
            );
        });

        const offCreate = on("group.created", (created) => {
            if (!created?.id) return;
            setLocalConversation((prev) => [created, ...prev]);
        });

        return () => {
            offUpdate();
            offCreate();
        };
    }, [on]);

    // --- User blocked/unblocked ---
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

    // --- Sync server conversations without overwriting blocked ---
    useEffect(() => {
        if (!conversations) return;

        setLocalConversation((prev = []) =>
            (conversations || []).map((conv) => {
                const local = prev.find((c) => c.id === conv.id);
                return local ? { ...conv, blocked_at: local.blocked_at } : conv;
            })
        );
    }, [conversations]);

    // --- Online users ---
    useEffect(() => {
        const echo = typeof window !== "undefined" ? window.Echo : null;
        if (!echo?.join) return;

        const channel = echo
            .join("online")
            .here((users) => setOnlineUsers(Object.fromEntries(users.map((u) => [u.id, u]))))
            .joining((user) => setOnlineUsers((prev) => ({ ...prev, [user.id]: user })))
            .leaving((user) => setOnlineUsers((prev) => {
                const copy = { ...prev };
                delete copy[user.id];
                return copy;
            }))
            .error(console.error);

        return () => channel?.leave?.();
    }, []);

    // --- Clone children with onlineUsers prop ---
    const childrenWithProps = children?.type
        ? cloneElement(children, { ...children.props, onlineUsers })
        : children;

    // --- Render ---
    const active = localConversation.filter((c) => !c.blocked_at);
    const blocked = localConversation.filter((c) => c.blocked_at);

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Left panel */}
            <aside className={`bg-slate-800 flex flex-col overflow-hidden transition-all flex-shrink-0
                ${isOnChatRoute ? "hidden md:flex md:w-[320px]" : "flex w-full md:w-[320px]"}`}>
                <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
                    Chats
                    <button onClick={() => setShowGroupModal(true)} className="text-gray-400 hover:text-gray-200">
                        <PencilSquareIcon className="h-5 w-5 ml-2" />
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
                                    <ConversationListItem
                                        key={`blocked_${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                                        conversation={conversation}
                                        online={!!isUserOnline(conversation.id)}
                                        selectedConversation={selectedConversation}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Right panel */}
            <main className={`flex flex-col transition-all ${isOnChatRoute ? "flex w-full md:flex-1" : "hidden md:flex md:flex-1"}`}>
                {childrenWithProps}
            </main>

            <GroupModal onClose={() => setShowGroupModal(false)} show={showGroupModal} onlineUsers={onlineUsers} />
        </div>
    );
}
