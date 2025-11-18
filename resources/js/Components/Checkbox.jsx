export default function Checkbox({ className = '', ...props }) {
    return (
        <div className="relative inline-flex items-center">
            <input
                {...props}
                type="checkbox"
                className={
                    'appearance-none w-5 h-5 rounded border-2 border-slate-600 bg-slate-700/50 ' +
                    'checked:bg-gradient-to-r checked:from-blue-500 checked:to-cyan-500 checked:border-transparent ' +
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 ' +
                    'hover:border-cyan-400 hover:bg-slate-600/50 transition-all duration-200 ' +
                    'dark:border-slate-500 dark:bg-slate-800/50 dark:checked:from-blue-600 dark:checked:to-cyan-600 ' +
                    'dark:focus:ring-cyan-400 dark:focus:ring-offset-slate-900 ' +
                    'transform hover:scale-105 active:scale-95 ' +
                    className
                }
            />
            {/* Animated checkmark */}
            <svg 
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none transition-all duration-200"
                viewBox="0 0 12 10"
                fill="none"
                style={{ 
                    opacity: props.checked ? 1 : 0,
                    transform: props.checked 
                        ? 'translate(-50%, -50%) scale(1)' 
                        : 'translate(-50%, -50%) scale(0.5)'
                }}
            >
                <path
                    d="M1 5L4 8L11 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}