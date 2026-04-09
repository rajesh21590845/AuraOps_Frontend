import { motion } from 'framer-motion'

// ─── AuraOps Logo Mark ─────────────────────────────────
export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="AuraOps logo">
      <defs>
        <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="9" fill="url(#logoGradient)" />
      <circle cx="20" cy="20" r="14" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="20" cy="20" r="19" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="20" cy="6" r="2.5" fill="#06b6d4" />
      <circle cx="34" cy="28" r="2" fill="#7c3aed" />
      <circle cx="6" cy="28" r="1.5" fill="#3b82f6" />
    </svg>
  )
}

// ─── Wordmark ───────────────────────────────────────────
export function LogoFull({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5" role="img" aria-label="AuraOps">
      <Logo size={size} />
      <span className="font-bold tracking-tight" style={{ fontSize: size * 0.625 }}>
        <span className="text-gradient">Aura</span>
        <span className="text-slate-200">Ops</span>
      </span>
    </div>
  )
}

// ─── Animated AI Processing Indicator ──────────────────
export function AiProcessing({ label = 'AI Processing...' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center w-6 h-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-600 opacity-20"
          animate={{ scale: [1, 1.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <span className="text-sm font-medium text-purple-300">{label}</span>
    </div>
  )
}
