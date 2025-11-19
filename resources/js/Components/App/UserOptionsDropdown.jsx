import { LockOpenIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import axios from "axios";
import { useEventBus } from "@/EventBus";
import { TrashIcon } from "@heroicons/react/24/outline";
import EditContactNameModal from "./EditContactNameModal";

export default function UserOptionsDropdown({ conversation }) {
    const { emit } = useEventBus();
    const [showEditModal, setShowEditModal] = useState(false);

    const onBlockUser = (close) => {
        if (!conversation.is_user) {
            close();
            return;
        }

        axios
            .post(route("user.blockUnBlock", conversation.id))
            .then((response) => {
                emit("toast.show", {
                    message: response.data.message,
                    type: "success",
                    delay: 300,
                });

                if (response.data && response.data.conversation) {
                    emit("user.blocked", response.data.conversation);
                } else {
                    emit("user.blocked", {
                        id: conversation.id,
                        blocked_at: response.data.blocked_at ?? new Date().toISOString(),
                    });
                }
            })
            .catch((error) => {
                console.error("There was an error blocking/unblocking user!", error);
            })
            .finally(() => {
                close();
            });
    };

    const onClearMessages = async (close) => {
        emit("toast.show", { message: "Deleting messages...", type: "info" });

        try {
            await axios.post(route("conversation.clear", conversation.id), {
                type: conversation.is_group ? 'group' : 'user'
            });
            emit("conversation.cleared", { conversationId: conversation.id });

            emit("toast.show", {
                message: "Messages deleted successfully",
                type: "success",
                delay: 5000
            });
        } catch (error) {
            console.error("Failed to clear conversation:", error);
            emit("toast.show", {
                message: "Failed to clear messages",
                type: "error"
            });
        } finally {
            close();
        }
    };

    return (
        <>
            <div className="relative inline-block text-left">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="
                            flex justify-center items-center w-8 h-8 
                            rounded-xl hover:bg-slate-700/50 
                            backdrop-blur-sm border border-slate-600/50
                            transition-all duration-300 
                            hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20
                            text-slate-400 hover:text-cyan-400
                            group
                        ">
                            <EllipsisVerticalIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-300"
                        enterFrom="transform opacity-0 scale-95 -translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-250"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 -translate-y-2"
                    >
                        <Menu.Items className="
                            absolute right-6 top-1 mt-2 w-56 
                            rounded-2xl overflow-hidden
                            backdrop-blur-xl bg-slate-800/95
                            bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            shadow-2xl shadow-blue-500/20
                            border border-slate-600/50
                            focus:outline-none z-30
                        ">
                            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                            
                            <div className="py-2 px-2">
                                {/* Edit Contact Name - Only for users */}
                                {conversation.is_user && (
                                    <Menu.Item>
                                        {({ active, close }) => (
                                            <button
                                                onClick={() => {
                                                    setShowEditModal(true);
                                                    close();
                                                }}
                                                className={`
                                                    group flex w-full items-center rounded-xl px-3 py-3 text-sm
                                                    transition-all duration-300
                                                    ${active 
                                                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30' 
                                                        : 'text-slate-300'
                                                    }
                                                    hover:scale-[1.02] hover:shadow-md
                                                `}
                                            >
                                                <div className={`
                                                    p-2 rounded-lg mr-3 transition-all duration-300
                                                    ${active 
                                                        ? 'bg-blue-500/20 text-blue-400' 
                                                        : 'bg-slate-700/50 text-blue-400 group-hover:text-blue-400 group-hover:bg-blue-500/20'
                                                    }
                                                `}>
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">Edit Name</span>
                                                
                                                <div className={`
                                                    ml-auto w-2 h-2 rounded-full bg-blue-500
                                                    transition-all duration-300
                                                    ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                                                `}></div>
                                            </button>
                                        )}
                                    </Menu.Item>
                                )}

                                {/* Block/Unblock User */}
                                <Menu.Item>
                                    {({ active, close }) => (
                                        <button
                                            onClick={() => onBlockUser(close)}
                                            className={`
                                                group flex w-full items-center rounded-xl px-3 py-3 text-sm
                                                transition-all duration-300
                                                ${active 
                                                    ? conversation.blocked_at
                                                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border border-green-500/30' 
                                                        : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border border-red-500/30'
                                                    : 'text-slate-300'
                                                }
                                                hover:scale-[1.02] hover:shadow-md
                                                ${conversation.is_user ? 'mt-1' : ''}
                                            `}
                                        >
                                            <div className={`
                                                p-2 rounded-lg mr-3 transition-all duration-300
                                                ${active 
                                                    ? conversation.blocked_at
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-red-500/20 text-red-400'
                                                    : conversation.blocked_at
                                                        ? 'bg-slate-700/50 text-green-400 group-hover:text-green-400 group-hover:bg-green-500/20'
                                                        : 'bg-slate-700/50 text-red-400 group-hover:text-red-400 group-hover:bg-red-500/20'
                                                }
                                            `}>
                                                {conversation.blocked_at ? (
                                                    <LockOpenIcon className="w-4 h-4" />
                                                ) : (
                                                    <LockClosedIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className="font-medium">
                                                {conversation.blocked_at ? "Unblock User" : "Block User"}
                                            </span>
                                            
                                            <div className={`
                                                ml-auto w-2 h-2 rounded-full
                                                transition-all duration-300
                                                ${active 
                                                    ? conversation.blocked_at
                                                        ? 'bg-green-500 opacity-100 scale-100'
                                                        : 'bg-red-500 opacity-100 scale-100'
                                                    : 'opacity-0 scale-50'
                                                }
                                            `}></div>
                                        </button>
                                    )}
                                </Menu.Item>

                                {/* Clear Messages */}
                                <Menu.Item>
                                    {({ active, close }) => (
                                        <button
                                            onClick={() => onClearMessages(close)}
                                            className={`
                                                group flex w-full items-center rounded-xl px-3 py-3 text-sm
                                                transition-all duration-300
                                                ${active 
                                                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-white border border-orange-500/30' 
                                                    : 'text-slate-300'
                                                }
                                                hover:scale-[1.02] hover:shadow-md
                                                mt-1
                                            `}
                                        >
                                            <div className={`
                                                p-2 rounded-lg mr-3 transition-all duration-300
                                                ${active 
                                                    ? 'bg-orange-500/20 text-orange-400' 
                                                    : 'bg-slate-700/50 text-orange-400 group-hover:text-orange-400 group-hover:bg-orange-500/20'
                                                }
                                            `}>
                                                <TrashIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">Clear All Messages</span>
                                            
                                            <div className={`
                                                ml-auto w-2 h-2 rounded-full bg-orange-500
                                                transition-all duration-300
                                                ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                                            `}></div>
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="px-3 py-2 border-t border-slate-600/50 bg-slate-900/50">
                                <p className="text-xs text-slate-500 text-center">
                                    {conversation.blocked_at 
                                        ? "Unblocking will allow messages from this user"
                                        : "These actions cannot be undone"
                                    }
                                </p>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            {/* Edit Contact Name Modal */}
            <EditContactNameModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                conversation={conversation}
            />
        </>
    );
}