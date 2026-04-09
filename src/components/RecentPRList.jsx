import { motion } from 'framer-motion'
import { GitPullRequest, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from '../utils/date'

function PRRow({ pr, index }) {
  const statusStyles = {
    open:   { badge: 'badge-info',    icon: <GitPullRequest size={14} /> },
    merged: { badge: 'badge-success', icon: <CheckCircle2 size={14} /> },
    closed: { badge: 'badge-error',   icon: <XCircle size={14} /> },
  }
  const status = statusStyles[pr.status] || statusStyles.open

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div className="flex items-center gap-4 flex-1" style={{ minWidth: '200px' }}>
        <div className={`badge ${status.badge}`} style={{ padding: '0.5rem', borderRadius: '8px', flexShrink: 0 }}>
          {status.icon}
        </div>
        <div>
          <h4 className="font-medium text-sm">{pr.title || `Fix run #${pr.runId}`}</h4>
          <p className="text-xs text-muted mt-1">
            {formatDistanceToNow(pr.createdAt)} · {Math.round((pr.confidence || 0.9) * 100)}% confidence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`badge ${status.badge}`}>{pr.status || 'open'}</span>
        {pr.url && (
          <a href={pr.url} target="_blank" rel="noreferrer" className="text-secondary transition"
            style={{ ':hover': { color: '#fff' } }}>
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function RecentPRList({ prs = [], loading }) {
  if (loading) {
    return (
      <div className="flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '60px', width: '100%', background: 'var(--color-border)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    )
  }

  if (prs.length === 0) {
    return (
      <div className="p-8 text-center text-secondary">
        No recent activity detected yet. Connect a project to start.
      </div>
    )
  }

  return (
    <div className="flex-col">
      {prs.map((pr, i) => (
        <PRRow key={pr._id || i} pr={pr} index={i} />
      ))}
    </div>
  )
}
