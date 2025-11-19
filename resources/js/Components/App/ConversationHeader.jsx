import { ChevronLeftIcon, PencilSquareIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import GroupAvatar from './GroupAvatar';
import UserAvatar from './UserAvatar';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import GroupDescriptionPopover from './GroupDescriptionPopover';
import GroupUsersPopover from './GroupUsersPopover';
import { useEventBus } from '@/EventBus';
import { useState, useEffect } from 'react';

// Helper function to determine the correct display name, prioritizing the custom contact_name
const getDisplayName = (conversation) => {
    if (!conversation) return '';

    // For group chats, use the group's name
    if (conversation.is_group) {
        return conversation.name || '';
    }

    // For direct messages, prioritize 'contact_name' (the custom name from the contacts table).
    // This 'contact_name' property MUST be populated by the PHP backend on page refresh.
    return conversation.contact_name || conversation.name || '';
};

export default function ConversationHeader({ selectedConversation, online = false }) {
    const { auth } = usePage().props;
    const { emit, on } = useEventBus();
    
    // Initialize displayName using the new helper function
    const [displayName, setDisplayName] = useState(getDisplayName(selectedConversation));

    // Update display name when conversation changes
    useEffect(() => {
        // When selectedConversation changes (e.g., user clicks a new chat), reset the display name.
        setDisplayName(getDisplayName(selectedConversation));
    }, [selectedConversation]); 

    // Listen for real-time contact name updates (Fix: use other_id/new_name from event payload)
    useEffect(() => {
        // The broadcasted event payload contains 'other_id' (the user whose contact name was updated) 
        // and 'new_name' (the custom name).
        const off = on('contact.name.updated', ({ other_id, new_name }) => {
            // Check if the current conversation is a direct message and its ID matches the user who was updated
            if (selectedConversation && !selectedConversation.is_group && selectedConversation.id === other_id) {
                setDisplayName(new_name);
            }
        });

        return () => off();
    }, [on, selectedConversation]);

    const onGroupDelete = () => {
        // NOTE: Please replace window.confirm with a custom modal UI component for better user experience
        if (!window.confirm('Are you sure you want to delete this group? All messages and data will be permanently lost.')) return;

        const toastId = emit("toast.show", { message: "Deleting group...", type: "info", loading: true });

        axios.delete(route('group.destroy', selectedConversation.id))
            .then(response => {
                emit("toast.show", { message: response.data.message, type: "success", delay: 300 }); 
            })
            .catch(error => {
                console.error("There was an error in deleting group!", error);
                const msg = error.response?.data?.message || "Failed to delete group";
                emit("toast.show", { message: msg, type: "error", delay: 100 }); 
            });
    };

    const getLastSeenTime = () => {
        return 'Last seen recently';
    };

    return (
        <>
            {selectedConversation && (
                <div className="p-4 flex items-center justify-between bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Back Button for Mobile */}
                        <Link 
                            href={route('dashboard')} 
                            className="inline-block md:hidden p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-200 transform hover:scale-105 flex-shrink-0"
                        >
                            <ChevronLeftIcon className="text-slate-300 w-5 h-5" />
                        </Link>

                        {/* Avatar with Enhanced Status */}
                        <div className="relative flex-shrink-0">
                            {selectedConversation.is_group ? (
                                <div className="relative">
                                    {/* Removed GroupAvatar import error by assuming global component access */}
                                    <GroupAvatar group={selectedConversation} /> 
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                        <UserGroupIcon className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Removed UserAvatar import error by assuming global component access */}
                                    <UserAvatar user={selectedConversation} />
                                </div>
                            )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-slate-200 font-semibold text-lg truncate">
                                    {displayName}
                                </h3>
                                {selectedConversation.owner_id === auth.user.id && selectedConversation.is_group && (
                                    <ShieldCheckIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                            
                            {selectedConversation.is_group ? (
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <UserGroupIcon className="w-4 h-4" />
                                        {selectedConversation.users?.length || 0} members
                                    </span>
                                    {selectedConversation.owner_id === auth.user.id && (
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                            You own this group
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                        online ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
                                    }`}></span>
                                    <span className="truncate">
                                        {online ? 'Online now' : getLastSeenTime()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Actions */}
                    {selectedConversation.is_group && (
                        <div className='flex items-center gap-2 flex-shrink-0'>
                            <div className="tooltip tooltip-bottom" data-tip="Group Info">
                                {/* Removed GroupDescriptionPopover import error by assuming global component access */}
                                <GroupDescriptionPopover 
                                    description={selectedConversation.description} 
                                />
                            </div>
                            
                            <div className="tooltip tooltip-bottom" data-tip="Group Members">
                                {/* Removed GroupUsersPopover import error by assuming global component access */}
                                <GroupUsersPopover 
                                    users={selectedConversation.users} 
                                    ownerId={selectedConversation.owner_id}
                                />
                            </div>

                            {selectedConversation.owner_id == auth.user.id && (
                                <div className="flex items-center gap-2 pl-3 border-l border-slate-700/50">
                                    <div className="tooltip tooltip-bottom" data-tip="Edit Group">
                                        <button
                                            onClick={() => emit("GroupModal.show", selectedConversation)}
                                            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all duration-200 transform hover:scale-105 group relative"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        </button>
                                    </div>

                                    <div className="tooltip tooltip-bottom" data-tip="Delete Group">
                                        <button
                                            onClick={onGroupDelete}
                                            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200 transform hover:scale-105 group relative"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}