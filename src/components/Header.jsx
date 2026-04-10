import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, HelpCircle, Zap, User } from 'lucide-react'
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg">
            <Zap size={18} color="white" />
          </div>
          <span className="text-lg font-bold text-gradient">AuraOps</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Icons */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white">
              <Bell size={18} />
            </button>

            <button className="p-2 rounded-lg hover:bg-white/10 transition text-white/70 hover:text-white">
              <HelpCircle size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* User */}
          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
              {initials}
            </div>

            {/* Name */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white/90">
                {displayName}
              </span>
              <span className="text-xs text-white/50">
                {user?.email || 'admin@auraops.dev'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 transition text-white/70 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}