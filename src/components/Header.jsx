import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User')
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'AU'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(18px)',
        background: 'rgba(3, 7, 18, 0.7)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 flex items-center justify-between"
        style={{ minHeight: '4.25rem', gap: '1rem' }}
      >

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg">
            <Zap size={18} color="white" />
          </div>
          <span className="text-lg font-bold text-gradient">AuraOps</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User */}
          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div
              className="w-9 h-9 flex items-center justify-center text-sm font-bold text-white"
              style={{
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {initials}
            </div>

            {/* Name */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {displayName}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.52)' }}>
                {user?.email || 'admin@auraops.dev'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{
                padding: '0.55rem 0.85rem',
                borderColor: 'rgba(148, 163, 184, 0.18)',
                background: 'rgba(15, 23, 42, 0.58)',
                color: 'rgba(255,255,255,0.86)',
              }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
