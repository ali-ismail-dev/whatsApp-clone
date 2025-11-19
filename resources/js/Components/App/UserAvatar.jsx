export default function UserAvatar({ user, online = null, profile = false }) {
  // sizes: profile = larger; otherwise small (used in lists)
  const sizeClass = profile ? "w-32 h-32" : "w-12 h-12";
  const innerSizeClass = profile ? "p-1" : "";
  const textSizeClass = profile ? "text-4xl" : "text-sm";

  // Choose how the image should fit:
  // - profile: use object-contain so the entire image is visible (no cropping).
  //   we add a tiny padding so non-square images don't touch the circular edge.
  // - non-profile (contacts): use object-cover so the avatar fills the small circle.
  const imgObjectClass = profile ? "object-contain" : "object-cover";

  return (
    <div className="avatar-wrapper relative inline-block">
      <div className="avatar indicator">
        {online !== null && (
          <span
            className={`
              absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800
              transform transition-all duration-300
              ${online === true 
                ? "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/30" 
                : "bg-gradient-to-r from-slate-500 to-slate-600"
              }
              ${profile ? "w-4 h-4 -bottom-1 -right-1" : "w-3 h-3"}
              z-10
            `}
          />
        )}

        {user?.avatar_url ? (
          // outer wrapper creates the circular mask and fixed size
          <div className={`
            rounded-full overflow-hidden ${sizeClass} 
            bg-gradient-to-br from-slate-700 to-slate-800
            backdrop-blur-sm border border-slate-600/50
            shadow-lg shadow-blue-500/10
            transition-all duration-300 hover:shadow-cyan-500/20
            hover:scale-105
          `}>
            {/* inner padding for profile to avoid cut; the img fills the padded box */}
            <div className={`${innerSizeClass} w-full h-full`}>
              <img
                src={user.avatar_url}
                alt={user.name}
                className={`w-full h-full ${imgObjectClass} transition-transform duration-300 hover:scale-110`}
                style={{ display: "block" }}
              />
            </div>
          </div>
        ) : (
          <div
            className={`
              rounded-full ${sizeClass} 
              bg-gradient-to-br from-blue-500/20 to-cyan-500/20
              backdrop-blur-sm border border-slate-600/50
              text-cyan-300 flex items-center justify-center
              shadow-lg shadow-blue-500/10
              transition-all duration-300 hover:shadow-cyan-500/20
              hover:scale-105 hover:from-blue-500/30 hover:to-cyan-500/30
            `}
          >
            <span className={`font-semibold ${textSizeClass} bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}