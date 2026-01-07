// Color palettes for company logos - sophisticated, varied gradients
const LOGO_PALETTES = [
  { from: 'from-violet-500', to: 'to-purple-600', accent: 'bg-violet-400' },
  { from: 'from-blue-500', to: 'to-indigo-600', accent: 'bg-blue-400' },
  { from: 'from-emerald-500', to: 'to-teal-600', accent: 'bg-emerald-400' },
  { from: 'from-amber-500', to: 'to-orange-600', accent: 'bg-amber-400' },
  { from: 'from-rose-500', to: 'to-pink-600', accent: 'bg-rose-400' },
  { from: 'from-cyan-500', to: 'to-blue-600', accent: 'bg-cyan-400' },
  { from: 'from-fuchsia-500', to: 'to-purple-600', accent: 'bg-fuchsia-400' },
  { from: 'from-lime-500', to: 'to-green-600', accent: 'bg-lime-400' },
  { from: 'from-sky-500', to: 'to-indigo-600', accent: 'bg-sky-400' },
  { from: 'from-red-500', to: 'to-rose-600', accent: 'bg-red-400' },
];

// Generate consistent color palette from company name
function getCompanyPalette(company) {
  if (!company) return LOGO_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = ((hash << 5) - hash) + company.charCodeAt(i);
    hash = hash & hash;
  }
  return LOGO_PALETTES[Math.abs(hash) % LOGO_PALETTES.length];
}

// Company Logo Component
export default function CompanyLogo({ company, size = 'md' }) {
  const palette = getCompanyPalette(company);
  const initial = company?.[0]?.toUpperCase() || '?';

  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-14 h-14 text-xl',
  }[size] || 'w-12 h-12 text-lg';

  return (
    <div className={`${sizeClasses} relative rounded-xl overflow-hidden shadow-sm`}>
      {/* Main gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.from} ${palette.to}`} />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute -top-2 -right-2 w-8 h-8 ${palette.accent} rounded-full blur-md`} />
        <div className={`absolute -bottom-1 -left-1 w-6 h-6 ${palette.accent} rounded-full blur-sm`} />
      </div>

      {/* Letter */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-sm">
        {initial}
      </div>
    </div>
  );
}
