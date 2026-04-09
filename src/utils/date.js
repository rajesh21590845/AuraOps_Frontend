/**
 * Format a date to a relative "time ago" string.
 * Works without external dependencies.
 */
export function formatDistanceToNow(date) {
  if (!date) return 'unknown'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d)) return 'unknown'

  const now = Date.now()
  const diff = now - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  if (days < 7)    return `${days}d ago`
  if (weeks < 4)   return `${weeks}w ago`
  return `${months}mo ago`
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date, options = {}) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', ...options,
    })
  } catch {
    return '—'
  }
}
