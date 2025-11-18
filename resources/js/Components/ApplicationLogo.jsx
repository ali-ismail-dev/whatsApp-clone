export default function ApplicationLogo(props) {
    return (
        <svg {...props} viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="85" fill="#1e293b" />

            <circle cx="80" cy="80" r="25" fill="#3b82f6" opacity="0.8" />
            <circle cx="120" cy="70" r="20" fill="#06b6d4" opacity="0.9" />
            <rect
                x="60"
                y="110"
                width="60"
                height="40"
                rx="15"
                fill="#3b82f6"
            />

            <text
                x="100"
                y="115"
                // FIX: Changed 'text-anchor' to 'textAnchor'
                textAnchor="middle" 
                fill="white"
                // FIX: Changed 'font-family' to 'fontFamily'
                fontFamily="Arial, sans-serif"
                // FIX: Changed 'font-size' to 'fontSize'
                fontSize="48"
                // FIX: Changed 'font-weight' to 'fontWeight'
                fontWeight="bold"
            >
                A
            </text>
        </svg>
    );
}