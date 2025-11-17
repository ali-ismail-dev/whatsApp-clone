import { ChevronLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
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
        if (!window.confirm('Are you sure you want to delete this group?')) return;

        // Show loading toast first
        const toastId = emit("toast.show", { message: "Deleting group...", type: "info", loading: true });

        axios.delete(route('group.destroy', selectedConversation.id))
            .then(response => {
                // Remove the loading toast
                emit("toast.show", { message: response.data.message, type: "success", delay: 300 }); 
            })
            .catch(error => {
                console.error("There was an error!", error);
                const msg = error.response?.data?.message || "Failed to delete group";
                emit("toast.show", { message: msg, type: "error", delay: 100 }); 
            });
    };

    return (
        <>
            {selectedConversation && (
                <div className="p-3 flex items-center justify-between border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <Link href={route('dashboard')} className="inline-block md:hidden">
                            <ChevronLeftIcon className="text-gray-300 w-5 h-5" />
                        </Link>

                        {selectedConversation.is_group ? (
                            <GroupAvatar group={selectedConversation} />
                        ) : (
                            <UserAvatar user={selectedConversation} />
                        )}

                        <div>
                            <h3 className="text-gray-200">{selectedConversation.name}</h3>
                            {selectedConversation.is_group ? (
                                <p className="text-xs text-gray-400">{selectedConversation.users.length} members</p>
                            ) : (
                                <p className="text-xs text-gray-400">{online ? 'Online' : ''}</p>
                            )}
                        </div>
                    </div>

                    {selectedConversation.is_group && (
                        <div className='flex gap-4 mt-1'>
                            <GroupDescriptionPopover description={selectedConversation.description} />
                            <GroupUsersPopover users={selectedConversation.users} />
                            {selectedConversation.owner_id == auth.user.id && (
                                <>
                                    <div className='tooltip tooltip-left' data-tip="Edit Group">
                                        <button
                                            onClick={() => emit("GroupModal.show", selectedConversation)}
                                            className='text-gray-400 hover:text-gray-200'>
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className='tooltip tooltip-left' data-tip="Delete group">
                                        <button
                                            onClick={onGroupDelete}
                                            className='text-gray-400 hover:text-gray-200'>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
