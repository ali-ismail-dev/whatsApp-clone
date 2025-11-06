import { UsersIcon } from '@heroicons/react/24/solid';

export default function GroupAvatar({ profile = false }) {
    // 1. Adopt the same size classes as UserAvatar
    const sizeClass = profile ? "w-12 h-12" : "w-10 h-10"; 
    
    // 2. Adjust icon size based on the avatar size (h-5 and w-5 for w-10/w-12 container)
    const iconSizeClass = profile ? "w-6 h-6" : "w-5 h-5"; 

    return (
        // The outer div with 'avatar-wrapper' is not strictly necessary for groups 
        // unless you plan to add a badge, but we'll stick to the core avatar structure.
        <div className="avatar-wrapper relative inline-block">
            <div className={`avatar placeholder`}>
                {/* 3. Apply the dynamic sizeClass to the inner div */}
                <div className={`bg-gray-400 text-gray-800 rounded-full flex items-center justify-center ${sizeClass}`}> 
                    <span className="text-xl">
                        {/* 4. Apply the dynamic icon size */}
                        <UsersIcon className={iconSizeClass} />
                    </span>
                </div>
            </div>
        </div>
    );
}