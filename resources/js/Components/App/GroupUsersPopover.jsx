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
                    className={`${open ? "text-gray-900" : "text-gray-500"} group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-300`}
                >
                    <UsersIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
                <Transition
                    show={open}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel static className="absolute right-0 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="bg-slate-700 p-4">
                                    <div className="flex flex-col gap-2">
                                        {users.map((user) =>(
                                            <Link 
                                                href={route('chat.user', user.id)} 
                                                key={user.id} 
                                                className="flex items-center gap-2 hover:bg-slate-900 rounded-md p-2">
                                                <UserAvatar user={user} />
                                                {user.name}     
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            </Popover.Panel>
                            
                            
                        </Transition> 
            </>
            )}
        </Popover>

    )
}
