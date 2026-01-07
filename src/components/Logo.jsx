// ApplyTailor Logo Component
// A stylized "A" with a thread/needle accent representing tailoring

export function LogoIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stylized "A" */}
      <path
        d="M12 3L5 19H8.5L9.75 15.5H14.25L15.5 19H19L12 3Z"
        fill="currentColor"
      />
      <path
        d="M11 12L12 8L13 12H11Z"
        fill="white"
        opacity="0.3"
      />
      {/* Thread swoosh */}
      <path
        d="M3 10C5 10 7 8 10 8C13 8 15 12 18 12C20 12 21 11 21 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.6"
      />
    </svg>
  );
}

export function LogoFull({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
        <LogoIcon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-charcoal tracking-tight">ApplyTailor</span>
    </div>
  );
}

export function LogoSmall({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
        <LogoIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm font-medium text-charcoal">ApplyTailor</span>
    </div>
  );
}

export default LogoIcon;
