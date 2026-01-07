// ApplyTailor Logo Component - Cat mascot

export function LogoIcon({ className = "w-10 h-10" }) {
  return (
    <img
      src="/logo.png"
      alt="ApplyTailor"
      className={`${className} object-contain`}
    />
  );
}

export function LogoFull({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo.png" alt="ApplyTailor" className="w-10 h-10 object-contain" />
      <span className="text-xl font-bold text-charcoal tracking-tight">ApplyTailor</span>
    </div>
  );
}

export function LogoSmall({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="ApplyTailor" className="w-7 h-7 object-contain" />
      <span className="text-sm font-medium text-charcoal">ApplyTailor</span>
    </div>
  );
}

export default LogoIcon;
