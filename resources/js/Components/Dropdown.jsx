import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative z-[9999]">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 scale-95 -translate-y-2"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-250"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-2"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-2xl overflow-hidden ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-2xl backdrop-blur-xl shadow-2xl shadow-blue-500/20 border border-slate-600/50 bg-gradient-to-br from-slate-800/95 to-slate-900/95 ` +
                            contentClasses
                        }
                    >
                        {/* Gradient accent line */}
                        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                `block w-full px-4 py-3 text-start text-sm leading-5 text-slate-200 transition-all duration-300 ease-in-out hover:bg-slate-700/50 hover:text-white focus:bg-slate-700/50 focus:text-white focus:outline-none border-b border-slate-600/50 last:border-b-0 hover:scale-[1.02] hover:shadow-md ` +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;