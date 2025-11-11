import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

export default function GroupDescriptionPopover({ description }) {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`${open ? "text-gray-900" : "text-gray-500"} group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-300`}
                    >
                        <span className="sr-only">Open</span>
                        <InformationCircleIcon
                            className="h-6 w-6"
                            aria-hidden="true"
                        />
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
                        <Popover.Panel
                            static
                            className="absolute right-0 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0"
                        >
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="bg-slate-600 p-4">
                                    <p className="text-sm text-gray-200">
                                        {description || "No description"}
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
