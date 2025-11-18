import { ChevronLeftIcon, PencilSquareIcon, TrashIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import GroupAvatar from './GroupAvatar';
import UserAvatar from './UserAvatar';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import GroupDescriptionPopover from './GroupDescriptionPopover';
import GroupUsersPopover from './GroupUsersPopover';
import { useEventBus } from '@/EventBus';

export default function ConversationHeader({ selectedConversation, online = false }) {
    const { auth } = usePage().props;
    const { emit } = useEventBus();

    const onGroupDelete = () => {
        if (!window.confirm('Are you sure you want to delete this group? All messages and data will be permanently lost.')) return;

        // Show loading toast first
        const toastId = emit("toast.show", { message: "Deleting group...", type: "info", loading: true });

        axios.delete(route('group.destroy', selectedConversation.id))
            .then(response => {
                emit("toast.show", { message: response.data.message, type: "success", delay: 300 }); 
            })
            .catch(error => {
                console.error("There was an error!", error);
                const msg = error.response?.data?.message || "Failed to delete group";
                emit("toast.show", { message: msg, type: "error", delay: 100 }); 
            });
    };

    const getLastSeenTime = () => {
        // You would implement this based on your user model
        // For now, we'll just show offline status
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
                                    <GroupAvatar group={selectedConversation} />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                        <UserGroupIcon className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <UserAvatar user={selectedConversation} />
                                    
                                </div>
                            )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-slate-200 font-semibold text-lg truncate">
                                    {selectedConversation.name}
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
                            {/* Group Description */}
                            <div className="tooltip tooltip-bottom" data-tip="Group Info">
                                <GroupDescriptionPopover 
                                    description={selectedConversation.description} 
                                />
                            </div>
                            
                            {/* Group Members */}
                            <div className="tooltip tooltip-bottom" data-tip="Group Members">
                                <GroupUsersPopover 
                                    users={selectedConversation.users} 
                                    ownerId={selectedConversation.owner_id}
                                />
                            </div>

                            {/* Owner Actions */}
                            {selectedConversation.owner_id == auth.user.id && (
                                <div className="flex items-center gap-2 pl-3 border-l border-slate-700/50">
                                    {/* Edit Group Button */}
                                    <div className="tooltip tooltip-bottom" data-tip="Edit Group">
                                        <button
                                            onClick={() => emit("GroupModal.show", selectedConversation)}
                                            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all duration-200 transform hover:scale-105 group relative"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                        </button>
                                    </div>

                                    {/* Delete Group Button */}
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