import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
export default function ChatLayout({ children }) {
    const page = usePage();
    const { conversations } = page.props;
    const selectedConversation = page.props.conversation || null;
    const [ onlineUsers, setOnlineUsers ] = useState({});
    const [ localConversation, setLocalConversation ] = useState(conversations || []);
    const [sortedConversations, setSortedConversations] = useState([]);
    const isOnline = (userId) => {
        return onlineUsers.hasOwnProperty(userId);
    };
    console.log("Selected Conversation:", selectedConversation);
    console.log("Conversations List:", conversations);

    useEffect(() => {
        setSortedConversations([...localConversation].sort((a, b) => {
            if (a.blocked_at && b.blocked_at) {
                return a.blocked_at > b.blocked_at ? 1 : -1;
            } else if (a.blocked_at) {
                return 1;
            } else if (b.blocked_at) {
                return -1;
            }
            if (a.last_message_date && b.last_message_date) {
                return b.last_message_date.localeCompare(a.last_message_date);
            } else if (a.last_message_date) {
                return -1;
            } else if (b.last_message_date) {
                return 1;
            }else {
                return 0;
            }
        }
        ));
    }, [localConversation]);

    useEffect(() => {
        if (conversations) {
            setLocalConversation(Array.isArray(conversations) ? conversations : []);
        }
    }, [conversations]);

    useEffect(() => {
        const echo = typeof window !== 'undefined' ? window.Echo : null;
        if (!echo || typeof echo.join !== 'function') {
            console.warn('Echo is not initialized or join is not available.');
            return;
        }

        const channel = echo.join('online')
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(users.map(user => [user.id, user]));
                setOnlineUsers(onlineUsersObj);
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
                console.log(user.name + ' joined the chat.');
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                }
                );
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
        </>
    )
}

        
