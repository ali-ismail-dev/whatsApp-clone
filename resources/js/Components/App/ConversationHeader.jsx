import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function ConversationHeader({ selectedConversation }) {
    return (
        <>
            {selectedConversation && (
                <div className="p-3 flex items-center justify-between  border-b border-gray-600">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-block sm:hidden"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </Link>
                        {selectedConversation.is_group && <GroupAvatar group={selectedConversation} />}
                        <div>
                            <h3>{selectedConversation.name}</h3>
                            {selectedConversation.is_group && (
                                <p className="text-xs text-gray-400">{selectedConversation.users.length} members</p>

                            )}
                        </div>
                        </div> 
                </div>
            )}

        </>
    );
}