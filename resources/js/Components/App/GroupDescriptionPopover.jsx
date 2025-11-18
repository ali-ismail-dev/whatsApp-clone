import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

export default function GroupDescriptionPopover({ description }) {
    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`
                            ${open ? "text-cyan-400" : "text-slate-400"} 
                            group-hover:text-cyan-300 transition-all duration-300
                            hover:scale-110 transform
                        `}
                    >
                        <span className="sr-only">Open</span>
                        <InformationCircleIcon
                            className="h-6 w-6 drop-shadow-lg"
                            aria-hidden="true"
                        />
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
                        <Popover.Panel
                            static
                            className="absolute right-0 z-[9999] mt-3 w-screen max-w-sm px-4 sm:px-0 "
                        >
                            <div className="
                                overflow-hidden rounded-2xl 
                                shadow-2xl shadow-blue-500/20
                                border border-slate-600/50
                                backdrop-blur-xl bg-slate-800/95
                                bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            ">
                                <div className="relative p-6">
                                    {/* Gradient accent line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                                    
                                    <p className="text-sm text-slate-200 leading-relaxed">
                                        {description || "No description available for this group."}
                                    </p>
                                    
                                    {/* Decorative corner accents */}
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500/30 rounded-full"></div>
                                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-500/30 rounded-full"></div>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}