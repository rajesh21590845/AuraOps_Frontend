import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | AuraOps</title>
      </Helmet>

      <div className="bg-grid flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center card glass p-12 max-w-md w-full"
        >
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded bg-accent flex items-center justify-center">
              <Zap size={24} color="white" fill="white" />
            </div>
          </div>

          <p className="text-8xl font-black text-gradient" style={{ lineHeight: 1 }}>404</p>
          <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
          <p className="text-secondary mt-2 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex-col gap-4">
            <Link to="/dashboard" className="btn btn-primary">
              <Home size={16} /> Back to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
