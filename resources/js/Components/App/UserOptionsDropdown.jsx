import { LockOpenIcon } from "@heroicons/react/24/solid";
import {
    LockClosedIcon,
    ShieldCheckIcon,
    UserIcon,
} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { useEventBus } from "@/EventBus";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function UserOptionsDropdown({ conversation }) {
    const { emit } = useEventBus();

    const onBlockUser = (close) => {
        if (!conversation.is_user) {
            close(); // Close even if not a user conversation
            return;
        }

        axios
            .post(route("user.blockUnBlock", conversation.id))
            .then((response) => {
                console.log("🧪 Block response:", response.data);
                console.log(
                    "🧪 Conversation from response:",
                    response.data.conversation,
                );
                emit("toast.show", response.data.message);

                // If the server returns the updated conversation, emit an event so layouts can update
                if (response.data && response.data.conversation) {
                    emit("user.blocked", response.data.conversation);
                } else {
                    // fallback: emit minimal payload so the listener can react
                    emit("user.blocked", {
                        id: conversation.id,
                        blocked_at:
                            response.data.blocked_at ??
                            new Date().toISOString(),
                    });
                }
            })
            .catch((error) => {
                console.error(
                    "There was an error blocking/unblocking user!",
                    error,
                );
            })
            .finally(() => {
                close(); // Close dropdown after operation completes
            });
    };

    const onClearMessages = async (close) => {
        // Show loading toast
        emit("toast.show", "Deleting messages...");

        try {
            await axios.post(route("conversation.clear", conversation.id));
            emit("conversation.cleared", { conversationId: conversation.id });

            // Show success toast
            emit("toast.show", "Messages deleted successfully!");
        } catch (error) {
            console.error("Failed to clear conversation:", error);
            emit("toast.show", "Failed to delete messages");
        } finally {
            close(); // Close dropdown regardless of success/error
        }
    };

    return (
        <div className="relative inline-block text-left">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-slate-600">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1 px-1">
                            <Menu.Item>
                                {({ active, close }) => (
                                    <button
                                        onClick={() => onBlockUser(close)}
                                        className={`${
                                            active
                                                ? "bg-gray-700 text-white"
                                                : "text-gray-300"
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        {conversation.blocked_at && (
                                            <>
                                                <LockOpenIcon className="w-5 h-5 mr-2" />
                                                Unblock User
                                            </>
                                        )}
                                        {!conversation.blocked_at && (
                                            <>
                                                <LockClosedIcon className="w-5 h-5 mr-2" />
                                                Block User
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-2">
                            <Menu.Item>
                                {({ active, close }) => (
                                    <button
                                        onClick={() => onClearMessages(close)}
                                        className={`${active ? "bg-gray-700 text-white" : "text-gray-300"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <TrashIcon className="w-5 h-5 mr-2" />
                                        Clear all messages
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}