import React from "react";

export const EventBusContext = React.createContext();

export function EventBusProvider({ children }) {
  // use a ref to hold the listeners map (stable across renders)
  const listenersRef = React.useRef({});

  // 🛑 FIX: Use spread operator (...args) to capture and pass ALL arguments 
  // following the event 'name'. This ensures the message AND the type are passed.
  const emit = (name, ...args) => {
    const arr = listenersRef.current[name];
    if (!arr || arr.length === 0) return;
    
    // call listeners in a safe copy in case someone unsubscribes during emit
    [...arr].forEach((cb) => {
      try {
        // Pass all captured arguments to the callback
        cb(...args);
      } catch (e) {
        // don't let one listener break others
        console.error("EventBus listener error", e);
      }
    });
  };

  const on = (name, cb) => {
    if (!listenersRef.current[name]) listenersRef.current[name] = [];
    listenersRef.current[name].push(cb);

    // return unsubscribe function
    return () => {
      listenersRef.current[name] = listenersRef.current[name].filter(
        (c) => c !== cb
      );
      // cleanup empty arrays
      if (listenersRef.current[name].length === 0) {
        delete listenersRef.current[name];
      }
    };
  };

  return (
    <EventBusContext.Provider value={{ emit, on }}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  return React.useContext(EventBusContext);
}