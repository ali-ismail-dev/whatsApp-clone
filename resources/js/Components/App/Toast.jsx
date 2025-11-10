import { useEventBus } from "@/EventBus";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Toast({  }) {
    const { on } = useEventBus();
    const [toasts, setToasts] = useState(null);

    useEffect(() => {
        on("toast.show", (message) => {
            const uuid = uuidv4();
            setToasts((prevToasts) => [...prevToasts, { id: uuid, message }]);
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
                        <span>{toast.message}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}