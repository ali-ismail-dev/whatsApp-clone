import { useEventBus } from "@/EventBus";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function NewMessageNotification({ }) {
    const { on } = useEventBus();
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        on("newMessageNotification", (payload) => {
            // Destructure the payload after logging it
            const { message, user, group_id } = payload;
            const uuid = uuidv4();
            setToasts((prevToasts) => {
                return ([...prevToasts, { id: uuid, message, user, group_id, visible: true }]);
            });
            
            // Start fade out animation after 2.5 seconds
            setTimeout(() => {
                setToasts((prevToasts) => 
                    prevToasts.map(toast => 
                        toast.id === uuid ? { ...toast, visible: false } : toast
                    )
                );
            }, 2500);

            // Remove from state after 3 seconds (including fade out time)
            setTimeout(() => {
                setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== uuid));
            }, 3000);
        });
    }, [on]);

    const removeToast = (id) => {
        setToasts((prevToasts) => 
            prevToasts.map(toast => 
                toast.id === id ? { ...toast, visible: false } : toast
            )
        );
        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 300);
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
            {toasts.map((toast) => (
                <div 
                    key={toast.id} 
                    className={`
                        transform transition-all duration-300 ease-out
                        ${toast.visible 
                            ? 'translate-x-0 opacity-100 scale-100' 
                            : 'translate-x-full opacity-0 scale-95'
                        }
                    `}
                >
                    <div className="
                        relative rounded-2xl p-4
                        backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                        border border-slate-600/50 shadow-2xl shadow-blue-500/20
                        hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300
                    ">
                        {/* Gradient accent line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"></div>
                        
                        {/* Close button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="
                                absolute top-2 right-2 w-6 h-6
                                flex items-center justify-center
                                text-slate-400 hover:text-cyan-400
                                hover:bg-slate-700/50 rounded-lg
                                transition-all duration-300
                                backdrop-blur-sm
                            "
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>

                        <Link 
                            href={
                                toast.group_id ?
                                route('chat.group', toast.group_id) : 
                                route('chat.user', toast.user.id) 
                            }
                            className="flex items-center gap-3 group"
                        >
                            <div className="relative">
                                <UserAvatar user={toast.user} />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-slate-200 font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
                                        {toast.user?.name}
                                    </p>
                                    {toast.group_id && (
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                                            Group
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors">
                                    {toast.message}
                                </p>
                                
                                {/* Animated indicator */}
                                <div className="flex items-center gap-1 mt-2">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-slate-400">New message</span>
                                </div>
                            </div>

                            {/* Arrow indicator */}
                            <div className="
                                opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300
                                text-cyan-400 transform group-hover:translate-x-1
                            ">
                                →
                            </div>
                        </Link>

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700/50 rounded-b-2xl overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-2xl transition-all duration-3000 ease-linear"
                                style={{ 
                                    width: toast.visible ? '0%' : '100%',
                                    transition: toast.visible ? 'none' : 'width 0.5s ease-out'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}