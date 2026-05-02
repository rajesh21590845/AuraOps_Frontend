import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useForm } from '../hooks/useForm'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup, verifyOtp, otpRequired, loading } = useAuth()
  const navigate = useNavigate()

  const [otp, setOtp] = useState('')

  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
      name: (v) => !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      email: (v) => !v.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Please enter a valid email address' : null,
      password: (v) => !v ? 'Password is required' : v.length < 8 ? 'Password must be at least 8 characters' : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) ? 'Password must contain at least one uppercase letter, one lowercase letter, and one number' : null,
      confirmPassword: (v, all) => !v ? 'Please confirm your password' : v !== all.password ? 'Passwords do not match' : null,
    }
  )

  const handleSignup = async (data) => {
    const res = await signup(data)
    if (res.success) {
      toast.success('OTP sent to your email')
    } else {
      toast.error(res.message)
    }
  }

  // STEP 2 → VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    const res = await verifyOtp(otp)
    if (res.success) {
      if (res.metaError) {
        toast.success('Signup successful!')
        toast.error(res.metaError)
      } else {
        toast.success('Signup successful!')
      }
      navigate('/dashboard')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      {!otpRequired ? (
        // ---------------- FORM ----------------
        <div className="w-96 p-6 shadow rounded">
          <h2 className="text-xl mb-4">Create Account</h2>

          <form onSubmit={handleSubmit(handleSignup)}>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={values.name}
                  onChange={handleChange('name')}
                  className="input"
                />
                {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="john@example.com"
                  value={values.email}
                  onChange={handleChange('email')}
                  className="input"
                />
                {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange('password')}
                  className="input"
                />
                {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="label" htmlFor="signup-confirm-password">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={values.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className="input"
                />
                {errors.confirmPassword && <p className="text-red text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending OTP...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // ---------------- OTP ----------------
        <div className="w-96 p-6 shadow rounded">
          <h2 className="text-xl mb-4">Verify OTP</h2>

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="signup-otp">Enter 6-digit OTP</label>
              <input
                id="signup-otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="input text-center text-lg font-mono tracking-widest"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
