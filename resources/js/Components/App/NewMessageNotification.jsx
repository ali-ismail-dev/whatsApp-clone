import { useEventBus } from "@/EventBus";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import UserAvatar from "./UserAvatar";
import { Link } from "@inertiajs/react";

export default function NewMessageNotification({  }) {
    const { on } = useEventBus();
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        on("newMessageNotification", ({message, user, group_id}) => {
            const uuid = uuidv4();
            setToasts((prevToasts) => [...prevToasts, { id: uuid, message, user, group_id }]);
            setTimeout(() => {
                setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== uuid));
            }, 5000);
        });
    }, [on]);

    return (
        <div className="toast toast-center toast-top ">
            { toasts && toasts.map((toast) => (
                <div key={toast.id} className="alert alert-success shadow-lg"> 
                    <div>
                        <Link 
                            href={
                                toast.group_id ?
                                route('chat.group', toast.group_id) : 
                                route('chat.user', toast.user.id) }
                                className="flex items-center gap-2"
                                >
                            <UserAvatar user={toast.user} />
                        <span>{toast.message}</span>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    )
}