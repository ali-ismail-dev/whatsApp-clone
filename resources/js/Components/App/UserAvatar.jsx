export default function UserAvatar({ user, online = null, profile = false }) {
    const sizeClass = profile ? "w-12 h-12" : "w-10 h-10";
    const indicatorClass = online === true ? "badge-success" : "";

    return (
        <div className="avatar-wrapper relative inline-block">
            <div className="avatar indicator">
                {online && (
                    <span className={`badge badge-xs indicator-item ${indicatorClass} scale-75 translate-y-2`}></span>
                )}
                {user.avatar_url ? (
                    <div className={`rounded-full ${sizeClass}`}>
                        <img src={user.avatar_url} alt={user.name} />
                    </div>
                ) : (
                    <div className={`placeholder rounded-full ${sizeClass} bg-gray-400 text-gray-800 flex items-center justify-center`}>
                        <span className="text-xl font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}