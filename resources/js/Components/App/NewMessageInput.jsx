import { useEffect, useRef } from "react";


export default function NewMessageInput({ value , onChange , onSend}) {
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
        }
    const adjustHeight = () => {
        setTimeout(() => {
            input.current.style.height = 'auto';
            input.current.style.height = `${input.current.scrollHeight}px`;
        } , 100);
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            row = "1"
            placeholder="Type a message"
            onKeyDown={onInputKeyDown}
            onChange={(e) => onChangeInput(e)}
            className="input input-bordered w-full rounded-r-none resize-none overflow-y-auto max-h-40"
        />
    )
}


