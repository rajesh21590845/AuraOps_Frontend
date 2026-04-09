import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Settings, User, HelpCircle, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="nav px-4">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
            <Zap size={18} color="white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gradient">AuraOps</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <button className="text-secondary hover:text-white transition" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="text-secondary hover:text-white transition" aria-label="Help">
              <HelpCircle size={20} />
            </button>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>

          <div className="flex items-center gap-3">
            <div className="flex-col items-end hidden md:flex">
              <span className="text-sm font-medium">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-muted">{user?.email || 'admin@auraops.dev'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline p-2"
              title="Logout"
            >
              <LogOut size={18} className="text-red" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
