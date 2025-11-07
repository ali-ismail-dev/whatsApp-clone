import React from "react";

export const EventBusContext = React.createContext();

export function EventBusProvider({children}) {
    const [events, setEvents] = React.useState([]);
    const emit = (name, data) => {
        if (events[name]) {
            for (let cb of events[name]) {
                cb(data);
            }
        }
    };
    const on = (name, cb) => {
        if (events[name]) {
            events[name].push(cb);
        } else {
            events[name] = [];
        }
        return () => {
           events[name] = events[name].filter((c) => c !== cb);
        };
    };
    return (
        <EventBusContext.Provider value={{emit, on}}>
            {children}
        </EventBusContext.Provider>
    );
}

export function useEventBus() {
    return React.useContext(EventBusContext);
}