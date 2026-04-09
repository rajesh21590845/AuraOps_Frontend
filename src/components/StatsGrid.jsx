import { motion } from 'framer-motion'
import { GitPullRequest, CheckCircle2, XCircle, Zap, Activity } from 'lucide-react'

function StatCard({ icon, label, value, loading }) {
  if (loading) {
    return (
      <div className="stat-card" style={{ animation: 'pulse 1.5s infinite' }}>
        <div style={{ height: '24px', width: '24px', background: 'var(--color-border)', borderRadius: '6px', marginBottom: '1rem' }} />
        <div style={{ height: '32px', width: '60%', background: 'var(--color-border)', borderRadius: '6px', marginBottom: '0.5rem' }} />
        <div style={{ height: '14px', width: '40%', background: 'var(--color-border)', borderRadius: '6px' }} />
      </div>
    )
  }

  return (
    <motion.div whileHover={{ y: -5 }} className="stat-card">
      <div className="flex justify-between items-start mb-4">
        <div className="badge badge-info" style={{ padding: '0.5rem', borderRadius: '8px' }}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold">{value ?? '—'}</h3>
      <p className="text-secondary text-sm font-medium uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  )
}

export default function StatsGrid({ stats, loading }) {
  const cards = [
    { icon: <GitPullRequest size={20} />, label: 'Total Runs',   value: stats?.totalRuns   },
    { icon: <CheckCircle2  size={20} />, label: 'Success Rate',  value: stats?.successRate != null ? `${stats.successRate}%` : null },
    { icon: <XCircle       size={20} />, label: 'Failed',        value: stats?.failed       },
    { icon: <Zap           size={20} />, label: 'Errors Fixed',  value: stats?.errorsFixed  },
    { icon: <Activity      size={20} />, label: 'Open PRs',      value: stats?.openPRs      },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
        >
          <StatCard {...card} loading={loading} />
        </motion.div>
      ))}
    </div>
  )
}
