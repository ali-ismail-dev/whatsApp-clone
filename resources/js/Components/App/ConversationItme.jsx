import { Link, usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import UserOptionsDropdown from "./UserOptionsDropdown";

export default function ConversationItem({ conversation, online = null, selectedConversation = null }) {
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = " border-transparent";
    if (selectedConversation) {
        if (!selectedConversation.is_group && !conversation.is_group && selectedConversation.id === conversation.id) {
            classes = " bg-black/20 border-blue-500";
        } else if (selectedConversation.is_group && conversation.is_group && selectedConversation.id === conversation.id) {
            classes = " bg-black/20 border-blue-500";
        }
    }

    return (
        <Link href={conversation.is_group ? route('chat.group', conversation) : route('chat.user', conversation)} preserveState className={"conversation-item flex items-center gap-2 p-2 text-gray-300 transition-all cursor-pointer hover:bg-black/30" + classes + (conversation.is_user && conversation.is_admin ? "pr-2" : "pr-4")}>
            {conversation.is_user && (
                <UserAvatar user={conversation} online={online} />
            )}
            {conversation.is_group && (
                <GroupAvatar group={conversation} />
            )}
            <div className={`flex-1 max-w-full overflow-hidden`+ (conversation.is_user && conversation.blocked_at ? " opacity-50" : "")}>
                <div className="flex gap-1 justify-between items-center">
                    <h3 className="text-sm font-semibold overflow-hidden text-ellipsis text-nowrap">{conversation.name}</h3>
                    {conversation.last_message_time && (
                        <span className="text-nowrap">{conversation.last_message_time}</span>
                    )}
                </div>
                {conversation.last_message && (
                    <p className="text-xs text-gray-400 overflow-hidden text-ellipsis text-nowrap">{conversation.last_message}</p>
                )}
            </div>
            {currentUser.is_admin ? conversation.is_user && (
                <UserOptionsDropdown conversation={conversation} />
            ): ""}
        </Link>
        
    );
}
