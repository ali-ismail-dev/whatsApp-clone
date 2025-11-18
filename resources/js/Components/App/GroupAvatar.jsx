import { UsersIcon } from '@heroicons/react/24/solid';

export default function GroupAvatar({ profile = false }) {
    const sizeClass = profile ? "w-12 h-12" : "w-10 h-10"; 
    const iconSizeClass = profile ? "w-6 h-6" : "w-5 h-5"; 

    return (
        <div className="avatar-wrapper relative inline-block">
            <div className={`avatar placeholder`}>
                {/* Updated background with gradient and glass morphism effect */}
                <div className={`
                    bg-gradient-to-br from-blue-500/20 to-cyan-500/20 
                    backdrop-blur-sm border border-slate-700/50
                    text-blue-300 rounded-full flex items-center justify-center 
                    transition-all duration-300 hover:from-blue-500/30 hover:to-cyan-500/30
                    hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20
                    ${sizeClass}
                `}> 
                    <span className="text-xl">
                        {/* Updated icon with gradient text */}
                        <UsersIcon className={`${iconSizeClass} bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent`} />
                    </span>
                </div>
            </div>
        </div>
    );
}