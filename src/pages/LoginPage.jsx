import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useForm } from '../hooks/useForm'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, verifyOtp, otpRequired, pendingUser } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpValue, setOtpValue] = useState('')

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    {
      email: (v) => !v.includes('@') ? 'Please enter a valid email address' : null,
      password: (v) => v.length < 6 ? 'Password must be at least 6 characters' : null,
    }
  )

  const from = location.state?.from?.pathname || '/dashboard'

  // ---------------- LOGIN ----------------
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      })
      if (result.success) {
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      }
    } catch (err) {
      const message = err.response?.data?.message || ''
      if (err.response?.status === 403 || message.toLowerCase().includes('verify')) {
        toast.error('Please verify your account first. Check your email for the OTP.')
      } else {
        toast.error(message || 'Login failed')
      }
    }
    setLoading(false)
  }

  // ---------------- OTP VERIFICATION ----------------
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (otpValue.length < 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const result = await verifyOtp(otpValue)
      if (result.success) {
        toast.success(result.message)
        navigate(from, { replace: true })
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error('OTP verification failed.')
    } finally {
      setLoading(false)
    }
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
                {otpRequired ? 'Verify OTP' : 'Welcome Back'}
              </h1>
              <p className="text-secondary mt-2 text-sm">
                {otpRequired
                  ? `Enter the OTP sent to ${pendingUser?.email || 'your email'}`
                  : 'Sign in to manage your AI automation'}
              </p>
            </div>

            {otpRequired ? (
              <form onSubmit={handleOtpSubmit}>
                <div className="flex-col gap-4 relative z-10">
                  <div className="w-full">
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
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-6"
                    disabled={loading}
                    style={{ paddingBlock: '12px' }}
                  >
                    {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Verify OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email & Password */}
                <div className="flex-col gap-4 relative z-10">
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

                  <div className="w-full mt-4">
                    <label className="label" htmlFor="login-password">Password</label>
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

            <p className="text-center text-sm text-secondary mt-6">
              Need an account?{' '}
              <Link to="/signup" className="text-accent" style={{ fontWeight: 600 }}>
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
