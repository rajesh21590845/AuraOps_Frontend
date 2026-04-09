import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useForm } from '../hooks/useForm'
import toast from 'react-hot-toast'
import { forgotPassword, resetPassword } from '../services/api'
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login', 'forgot-email', 'forgot-otp'
  
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpModeData, setOtpModeData] = useState({ otp: '', newPassword: '' })

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    {
      email: (v) => !v.includes('@') ? 'Please enter a valid email address' : null,
      password: (v) => v.length < 6 ? 'Password must be at least 6 characters' : null,
    }
  )

  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await login(data)
    if (result.success) {
      toast.success('Welcome back to AuraOps! 👋')
      navigate(from, { replace: true })
    } else {
      toast.error(result.message)
    }
    setLoading(false)
  }

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault()
    if (!forgotEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    try {
      const res = await forgotPassword({ email: forgotEmail })
      toast.success(res.data?.message || 'OTP sent to your email.')
      setMode('forgot-otp')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account found with that email.')
    }
    setLoading(false)
  }

  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault()
    if (otpModeData.otp.length < 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    if (otpModeData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await resetPassword({ email: forgotEmail, ...otpModeData })
      toast.success(res.data?.message || 'Password successfully reset!')
      
      // Instantly log them in silently with their new password!
      const loginResult = await login({ email: forgotEmail, password: otpModeData.newPassword })
      if (loginResult.success) {
        toast.success('Automatically signed in!')
        navigate(from, { replace: true })
      } else {
        setMode('login')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP or expired.')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Sign In — AuraOps</title></Helmet>

      <div className="flex items-center justify-center bg-grid min-h-screen" style={{ padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="card glass p-8 mt-8" style={{ borderTop: '4px solid var(--color-accent-purple)' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white">
                {mode === 'login' ? 'Welcome Back' : mode === 'forgot-email' ? 'Forgot Password' : 'Reset Password'}
              </h1>
              <p className="text-secondary mt-2 text-sm">
                {mode === 'login' ? 'Sign in to manage your AI automation' : mode === 'forgot-email' ? 'Enter your email to receive an OTP' : `Enter OTP sent to ${forgotEmail}`}
              </p>
            </div>

            {mode === 'forgot-email' && (
              <form onSubmit={handleForgotEmailSubmit}>
                <div className="flex-col gap-4 relative z-10">
                  <div className="w-full">
                    <label className="label" htmlFor="forgot-email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="forgot-email"
                        type="email"
                        className="input"
                        style={{ paddingLeft: '40px' }}
                        placeholder="admin@auraops.ai"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading} style={{ paddingBlock: '12px' }}>
                    {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Send OTP'}
                  </button>

                  <button type="button" onClick={() => setMode('login')} className="btn w-full mt-3 glass text-secondary border-none" style={{ background: 'transparent' }}>
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {mode === 'forgot-otp' && (
              <form onSubmit={handleForgotOtpSubmit}>
                <div className="flex-col gap-4 relative z-10">
                  <div className="w-full mb-4">
                    <label className="label" htmlFor="otp">6-Digit OTP</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="otp"
                        type="text"
                        className="input"
                        style={{ paddingLeft: '40px', letterSpacing: '8px', fontWeight: 'bold' }}
                        placeholder="123456"
                        maxLength={6}
                        value={otpModeData.otp}
                        onChange={(e) => setOtpModeData(prev => ({...prev, otp: e.target.value}))}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="label" htmlFor="new-password">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="new-password"
                        type={showPwd ? 'text' : 'password'}
                        className="input"
                        style={{ paddingLeft: '40px', paddingRight: '40px' }}
                        placeholder="••••••••"
                        value={otpModeData.newPassword}
                        onChange={(e) => setOtpModeData(prev => ({...prev, newPassword: e.target.value}))}
                        required
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading} style={{ paddingBlock: '12px' }}>
                    {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Reset Password'}
                  </button>

                  <button type="button" onClick={() => setMode('login')} className="btn w-full mt-3 glass text-secondary border-none" style={{ background: 'transparent' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {mode === 'login' && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex-col gap-4 relative z-10">
                  {/* Email */}
                  <div className="w-full">
                    <label className="label" htmlFor="login-email">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="login-email"
                        type="email"
                        className="input"
                        style={{ paddingLeft: '40px' }}
                        placeholder="admin@auraops.ai"
                        value={values.email}
                        onChange={handleChange('email')}
                      />
                    </div>
                    {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="w-full mt-4">
                    <div className="flex items-center justify-between">
                      <label className="label" htmlFor="login-password">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot-email')} 
                        className="text-xs text-accent font-bold hover:underline bg-transparent border-none p-0 mb-1"
                        style={{ cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        id="login-password"
                        type={showPwd ? 'text' : 'password'}
                        className="input"
                        style={{ paddingLeft: '40px', paddingRight: '40px' }}
                        placeholder="••••••••"
                        value={values.password}
                        onChange={handleChange('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
                  </div>

                  <button
                    id="login-submit"
                    type="submit"
                    className="btn btn-primary w-full mt-6 flex justify-center items-center gap-2 font-bold"
                    disabled={loading}
                    style={{ paddingBlock: '12px' }}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: '16px', height: '16px' }} />
                      : <><span>Sign In</span><ArrowRight size={16} /></>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-secondary mt-6">
            Need an account?{' '}
            <Link to="/signup" className="text-accent" style={{ fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
