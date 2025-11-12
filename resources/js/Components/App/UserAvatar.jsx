export default function UserAvatar({ user, online = null, profile = false }) {
  // sizes: profile = larger; otherwise small (used in lists)
  const sizeClass = profile ? "w-32 h-32" : "w-10 h-10";
  const innerSizeClass = profile ? "p-1" : "";
  const indicatorClass = online === true ? "badge-success" : "";

  // Choose how the image should fit:
  // - profile: use object-contain so the entire image is visible (no cropping).
  //   we add a tiny padding so non-square images don't touch the circular edge.
  // - non-profile (contacts): use object-cover so the avatar fills the small circle.
  const imgObjectClass = profile ? "object-contain" : "object-cover";

  return (
    <div className="avatar-wrapper relative inline-block">
      <div className="avatar indicator">
        {online && (
          <span
            className={`badge badge-xs indicator-item ${indicatorClass} scale-75 translate-y-2`}
          />
        )}

        {user?.avatar_url ? (
          // outer wrapper creates the circular mask and fixed size
          <div className={`rounded-full overflow-hidden ${sizeClass} bg-gray-100`}>
            {/* inner padding for profile to avoid cut; the img fills the padded box */}
            <div className={`${innerSizeClass} w-full h-full`}>
              <img
                src={user.avatar_url}
                alt={user.name}
                className={`w-full h-full ${imgObjectClass}`}
                style={{ display: "block" }}
              />
            </div>
          </div>
        ) : (
          <div
            className={`placeholder rounded-full ${sizeClass} bg-gray-400 text-gray-800 flex items-center justify-center`}
          >
            <span className="text-xl font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
