import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { UsersIcon } from "@heroicons/react/20/solid";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";

export default function GroupUsersPopover({ users = [] }) {
    return (
        <Popover className="relative mr-3">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`
                            ${open ? "text-cyan-400 scale-110" : "text-slate-400"} 
                            group-hover:text-cyan-300 transition-all duration-300
                            hover:scale-110 transform backdrop-blur-sm
                            p-1 rounded-lg hover:bg-slate-700/50
                        `}
                    >
                        <UsersIcon className="h-6 w-6 drop-shadow-lg" aria-hidden="true" />
                    </Popover.Button>
                    <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 translate-y-2 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-250"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-2 scale-95"
                    >
                        <Popover.Panel static className="absolute right-0 z-20 mt-3 w-screen max-w-sm px-4 sm:px-0">
                            <div className="
                                overflow-hidden rounded-2xl 
                                shadow-2xl shadow-blue-500/20
                                border border-slate-600/50
                                backdrop-blur-xl bg-slate-800/95
                                bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            ">
                                {/* Gradient header */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 border-b border-slate-600/50">
                                    <h3 className="text-sm font-semibold text-slate-200 flex items-center">
                                        <UsersIcon className="h-4 w-4 mr-2 text-cyan-400" />
                                        Group Members ({users.length})
                                    </h3>
                                </div>
                                
                                <div className="max-h-64 overflow-y-auto">
                                    <div className="p-3">
                                        <div className="flex flex-col gap-2">
                                            {users.map((user) => (
                                                <Link 
                                                    href={route('chat.user', user.id)} 
                                                    key={user.id} 
                                                    className="
                                                        flex items-center gap-3 
                                                        hover:bg-slate-700/50 
                                                        rounded-xl p-3
                                                        transition-all duration-300
                                                        hover:scale-[1.02] hover:shadow-md
                                                        border border-transparent hover:border-slate-600/50
                                                        group
                                                    "
                                                >
                                                    <div className="relative">
                                                        <UserAvatar user={user} />
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-200 font-medium truncate group-hover:text-cyan-100 transition-colors">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            Online
                                                        </p>
                                                    </div>
                                                    <div className="
                                                        opacity-0 group-hover:opacity-100 
                                                        transition-opacity duration-300
                                                        text-cyan-400 transform group-hover:translate-x-1
                                                    ">
                                                        →
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer with decorative elements */}
                                <div className="p-3 border-t border-slate-600/50 bg-slate-900/50">
                                    <p className="text-xs text-slate-400 text-center">
                                        Click any member to start a private chat
                                    </p>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}