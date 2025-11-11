import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEventBus } from "@/EventBus";

export default function MessageOptionsDropdown({ message }) {
   
const { emit } = useEventBus();
    const onMessageDelete = () => {
        axios.delete(route('messages.destroy', message.id))
            .then(response => {
                emit('message.deleted', {message, prevMessage:response.data.message});
                console.log(response.data);
            })
            .catch(error => {
                console.error("There was an error!", error);
            });
    };

    return (
        <div className="relative inline-block text-left z-10">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-slate-600">
                        <ChevronDownIcon className="w-5 h-5 text-gray-400 z-20" />
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
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1 px-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onMessageDelete}
                                        className={`${
                                            active ? 'bg-gray-700 text-white' : 'text-gray-300'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        <TrashIcon className="w-5 h-5 mr-2" />
                                        Delete
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


                                            