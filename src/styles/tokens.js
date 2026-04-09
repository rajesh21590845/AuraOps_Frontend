/**
 * AuraOps Design Tokens
 * Exported as JS for use in dynamic styles.
 */
export const colors = {
  bgPrimary:   '#030712',
  bgSecondary: '#0d1117',
  bgCard:      '#0f172a',
  accentPurple:'#7c3aed',
  accentBlue:  '#3b82f6',
  accentCyan:  '#06b6d4',
  accentGreen: '#10b981',
  accentRed:   '#ef4444',
  textPrimary: '#f8fafc',
  textSecondary:'#94a3b8',
  textMuted:   '#475569',
  border:      '#1e293b',
  borderLight: '#334155',
}

export const gradients = {
  primary:  'linear-gradient(135deg, #7c3aed, #3b82f6)',
  rainbow:  'linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)',
  glow:     '0 0 20px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.1)',
}

export const animations = {
  fast:    { duration: 0.15 },
  normal:  { duration: 0.25 },
  slow:    { duration: 0.45 },
  spring:  { type: 'spring', bounce: 0.3, duration: 0.5 },
  premium: { ease: [0.16, 1, 0.3, 1], duration: 0.45 },
}
