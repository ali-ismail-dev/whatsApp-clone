import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextAreaInput(
    { className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <textarea
            {...props}
            className={
                `rounded-xl backdrop-blur-sm
                bg-gradient-to-br from-slate-800/80 to-slate-900/80
                border border-slate-600/50
                text-slate-200 placeholder-slate-400
                focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                transition-all duration-300
                shadow-sm focus:shadow-lg focus:shadow-cyan-500/10
                hover:border-slate-500/50
                dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200
                dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20
                resize-none
                ` + className
            }
            ref={localRef}
        ></textarea>
    );
});