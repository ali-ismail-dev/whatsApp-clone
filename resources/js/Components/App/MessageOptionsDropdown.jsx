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
        <div className="relative inline-block text-left z-30">
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
                        <ChevronDownIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
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
                        absolute right-0 mt-2 w-48 
                        rounded-2xl overflow-hidden
                        backdrop-blur-xl bg-slate-800/95
                        bg-gradient-to-br from-slate-800/95 to-slate-900/95
                        shadow-2xl shadow-blue-500/20
                        border border-slate-600/50
                        focus:outline-none z-30
                    ">
                        {/* Gradient accent line */}
                        <div className="w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                        
                        <div className="py-2 px-2">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onMessageDelete}
                                        className={`
                                            group flex w-full items-center rounded-xl px-3 py-3 text-sm
                                            transition-all duration-300
                                            ${active 
                                                ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-white border border-red-500/30' 
                                                : 'text-slate-300'
                                            }
                                            hover:scale-[1.02] hover:shadow-md
                                        `}
                                    >
                                        <div className={`
                                            p-2 rounded-lg mr-3 transition-all duration-300
                                            ${active 
                                                ? 'bg-red-500/20 text-red-400' 
                                                : 'bg-slate-700/50 text-slate-400 group-hover:text-red-400 group-hover:bg-red-500/20'
                                            }
                                        `}>
                                            <TrashIcon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">Delete Message</span>
                                        
                                        {/* Animated dot on hover */}
                                        <div className={`
                                            ml-auto w-2 h-2 rounded-full bg-red-500
                                            transition-all duration-300
                                            ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                                        `}></div>
                                    </button>
                                )}
                            </Menu.Item>
                        </div>

                        {/* Decorative footer */}
                        <div className="px-3 py-2 border-t border-slate-600/50 bg-slate-900/50">
                            <p className="text-xs text-slate-500 text-center">
                                This action cannot be undone
                            </p>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}