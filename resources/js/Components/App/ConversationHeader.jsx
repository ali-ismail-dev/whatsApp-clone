import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import GroupAvatar from './GroupAvatar';
import UserAvatar from './UserAvatar';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import GroupDescriptionPopover from './GroupDescriptionPopover';
import GroupUsersPopover from './GroupUsersPopover';
import {TrashIcon} from '@heroicons/react/24/outline';
import { useEventBus } from '@/EventBus';



export default function ConversationHeader({ selectedConversation, online = false }) {
    const { auth } = usePage().props;
    const {emit} = useEventBus();

    const onGroupDelete = () => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        axios.delete(route('group.destroy', selectedConversation.id))
            .then(response => {
                emit("toast.show", response.data.message);
                console.log(response.data);
            })
            .catch(error => {
                console.error("There was an error!", error);
            });
    };
    return (
        <>
            {selectedConversation && (
                <div className="p-3 flex items-center justify-between border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-block md:hidden"
                        >
                            <ChevronLeftIcon className="text-gray-300 w-5 h-5" />
                        </Link>
                        
                        {/* --- AVATAR RENDERING LOGIC --- */}
                        
                        {/* 1. Render Group Avatar if it's a group */}
                        {selectedConversation.is_group && (
                            <GroupAvatar group={selectedConversation} />
                        )}
                        
                        {/* 2. Render User Avatar if it's NOT a group */}
                        {!selectedConversation.is_group && (
                            <UserAvatar user={selectedConversation} />
                        )}

                        {/* --- END AVATAR LOGIC --- */}
                        
                        <div>
                            {/* The name of the conversation/user */}
                            <h3 className="text-gray-200">{selectedConversation.name}</h3>
                            
                            {/* Status text below name */}
                            {selectedConversation.is_group ? (
                                // Show member count for groups
                                <p className="text-xs text-gray-400">
                                    {selectedConversation.users.length} members
                                </p>
                            ) : (
                                // Show online status for 1-on-1 chats
                                <p className="text-xs text-gray-400">
                                    {online ? 'Online' : ''}
                                </p>
                            )}
                        </div>
                    </div> 
                    {selectedConversation.is_group && (
                        <div className='flex gap-4 mt-1'>
                            <GroupDescriptionPopover description={selectedConversation.description} />
                            <GroupUsersPopover users={selectedConversation.users} />
                            {selectedConversation.owner_id == auth.user.id && (
                                <>
                                    <div 
                                        className='tooltip tooltip-left'
                                        data-tip="Edit Group"
                                    >
                                        <button
                                         onClick={(ev)=> 
                                            emit(
                                                "GroupModal.show", selectedConversation
                                            )
                                         }
                                         className='text-gray-400 hover:text-gray-200'>
                                            <PencilSquareIcon className="w-5 h-5" />
                                         </button>
                                         </div>
                                         <div 
                                        className='tooltip tooltip-left'
                                        data-tip="Delete group"
                                    >
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