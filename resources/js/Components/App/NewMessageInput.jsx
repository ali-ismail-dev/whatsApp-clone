import { useEffect, useRef } from "react";

export default function NewMessageInput({ value, onChange, onSend }) {
    const input = useRef();
    
    const onInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };
    
    const onChangeInput = (e) => {
        setTimeout(() => {
            adjustHeight();
        }, 10);
        onChange(e.target.value);
    };
    
    const adjustHeight = () => {
        setTimeout(() => {
            if (input.current) {
                input.current.style.height = 'auto';
                input.current.style.height = `${input.current.scrollHeight}px`;
            }
        }, 100);
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows="1"
            placeholder="Type a message..."
            onKeyDown={onInputKeyDown}
            onChange={onChangeInput}
            className="
                w-full resize-none overflow-y-auto max-h-40
                bg-gradient-to-br from-slate-800/80 to-slate-900/80
                border border-slate-600/50 backdrop-blur-sm
                text-slate-200 placeholder-slate-400
                focus:border-cyan-500 focus:ring-cyan-500/20
                transition-all duration-300
                rounded-2xl p-4
                focus:outline-none focus:shadow-lg focus:shadow-cyan-500/10
                hover:border-slate-500/50
            "
        />
    );
}