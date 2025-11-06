import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import GroupAvatar from './GroupAvatar';
import UserAvatar from './UserAvatar';

export default function ConversationHeader({ selectedConversation }) {
    return (
        <>
            {selectedConversation && (
                <div className="p-3 flex items-center justify-between border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-block sm:hidden"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </Link>
                        
                        {/* --- AVATAR RENDERING LOGIC --- */}
                        
                        {/* 1. Render Group Avatar if it's a group */}
                        {selectedConversation.is_group && <GroupAvatar group={selectedConversation} />}
                        
                        {/* 2. Render User Avatar if it's NOT a group */}
                        {!selectedConversation.is_group && (
                             // The 'selectedConversation' object itself acts as the user object 
                             // for the header in a 1-on-1 chat, as it holds the other user's data.
                             // We are passing 'null' for the online prop since we don't have it here.
                            <UserAvatar user={selectedConversation} />
                        )}

                        {/* --- END AVATAR LOGIC --- */}
                        
                        <div>
                            {/* The name of the conversation/user */}
                            <h3 className="text-gray-200">{selectedConversation.name}</h3>
                            
                            {/* Member count for groups */}
                            {selectedConversation.is_group && (
                                <p className="text-xs text-gray-400">{selectedConversation.users.length} members</p>
                            )}
                        </div>
                    </div> 
                    {/* Add any options/settings icons here */}
                </div>
            )}
        </>
    );
}