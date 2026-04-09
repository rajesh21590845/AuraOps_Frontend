import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Mail, Lock, User, ArrowRight, GitBranch } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useForm } from '../hooks/useForm'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
      name: (v) => v.length < 2 ? 'Name is too short' : null,
      email: (v) => !/\S+@\S+\.\S+/.test(v) ? 'Invalid email format' : null,
      password: (v) => v.length < 6 ? 'Password must be at least 6 characters' : null,
      confirmPassword: (v, all) => v !== all.password ? 'Passwords do not match' : null
    }
  )

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await signup(data)
    if (result.success) {
      toast.success('Account created! Welcome to AuraOps.')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
    setLoading(false)
  }

  const handleGithubAuth = () => {
    setGithubLoading(true)
    setTimeout(() => {
      setGithubLoading(false)
      toast.error('GitHub API keys not configured. Please use Email/Password.')
    }, 2000)
  }

  return (
    <div className="bg-grid min-h-screen" style={{ padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="card glass w-full max-w-md relative overflow-hidden mt-8"
        style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-accent-purple)' }}
      >
        <div className="flex flex-col items-center mb-8 text-center relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:scale-110 transition-transform">
            <div className="w-12 h-12 rounded bg-accent flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)' }}>
              <Zap size={24} color="white" fill="white" />
            </div>
          </Link>
          <h1 className="text-3xl font-black mb-1">Create Account</h1>
          <p className="text-secondary text-sm">Join thousands of developers using AuraOps</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col gap-4 relative z-10">
          <div className="w-full">
            <label className="label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="name"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="John Doe"
                value={values.name}
                onChange={handleChange('name')}
              />
            </div>
            {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="w-full">
            <label className="label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email"
                type="email"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="name@company.com"
                value={values.email}
                onChange={handleChange('email')}
              />
            </div>
            {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="w-full">
            <label className="label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="password"
                type="password"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange('password')}
              />
            </div>
            {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="w-full">
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="confirmPassword"
                type="password"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p className="text-red text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 text-base font-bold flex items-center justify-center gap-2 mt-4" 
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <><span style={{ marginRight: '4px' }}>Create Account</span> <ArrowRight size={18} /></>}
          </button>

          <p className="text-center text-sm text-secondary mt-6 mb-2">
            Already have an account? <Link to="/login" className="text-accent font-bold hover:underline">Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
