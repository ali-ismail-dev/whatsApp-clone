import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
export default function ChatLayout({ children }) {
    const page = usePage();
    const conversation = page.props.conversation;
    const selectedConversation = conversation ? conversation : null;
    console.log("Selected Conversation:", selectedConversation);
    console.log("conversation prop:", conversation);

    useEffect(() => {
        const echo = typeof window !== 'undefined' ? window.Echo : null;
        if (!echo || typeof echo.join !== 'function') {
            console.warn('Echo is not initialized or join is not available.');
            return;
        }

        const channel = echo.join('online')
            .here((users) => {
                console.log('Online users:', users);
            })
            .joining((user) => {
                console.log(user.name + ' joined the chat.');
            })
            .leaving((user) => {
                console.log(user.name + ' left the chat.');
            })
            .error((error) => {
                console.error('Error in presence channel:', error);
            });

        return () => {
            try {
                // Leave the presence channel when component unmounts
                if (channel && typeof channel.leave === 'function') {
                    channel.leave();
                }
            } catch (e) {
                // ignore
            }
        };
    }, []);
    return (
        <>
            ChatLayout
            {children}
        </>
    )
}

        
