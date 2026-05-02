import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2, GitBranch, Key, Settings2 } from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { getProject, updateProject, deleteProject } from '../services/api'
import { useForm } from '../hooks/useForm'
import { formatDate } from '../utils/date'
import toast from 'react-hot-toast'

const CONDITIONS = [
  { value: 'on_failure', label: '🔴 On CI Failure (Auto-fix)' },
  { value: 'on_success', label: '✅ On CI Success (Log only)' },
  { value: 'always',     label: '🔁 Always (All runs)' },
  { value: 'manual',     label: '⚙️ Manual Trigger Only' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { values, handleChange, handleSubmit, errors, setValues } = useForm(
    { name: '', githubPat: '', condition: 'on_failure', repoUrl: '' },
    {
      name: (v) => v.trim().length < 2 ? 'Name must be at least 2 characters' : null,
    }
  )

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const res = await getProject(id)
        const p = res.data
        setValues({
          name: p.name || '',
          githubPat: '', // Don't show the PAT
          condition: p.condition || 'on_failure',
          repoUrl: p.repoUrl || p.repositoryUrl || '',
        })
        setLoading(false)
      } catch (err) {
        toast.error('Failed to load project')
        navigate('/dashboard')
      }
    }
    fetchProj()
  }, [id, navigate, setValues])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = { ...data }
      if (!payload.githubPat) delete payload.githubPat
      await updateProject(id, payload)
      toast.success('Project updated!')
    } catch (err) {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        toast.success('Project deleted')
        navigate('/dashboard')
      } catch (err) {
        toast.error('Failed to delete project')
      }
    }
  }

  if (loading) return <div className="loader-container"><div className="spinner large"></div></div>

  return (
    <>
      <Helmet>
        <title>Project Details | AuraOps</title>
      </Helmet>

      <div className="bg-grid" style={{ minHeight: '100vh' }}>
        <Header />

        <motion.main 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto px-4 py-8"
        >
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary mb-6">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="card glass p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">{values.name}</h1>
                <p className="text-secondary mt-1">Project configuration and settings</p>
              </div>
              <button onClick={handleDelete} className="btn btn-outline text-red">
                <Trash2 size={16} /> Delete
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex-col gap-6">
                <div className="w-full">
                  <label className="label">Project Name</label>
                  <input
                    className="input"
                    value={values.name}
                    onChange={handleChange('name')}
                  />
                  {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="w-full">
                  <label className="label">Repository URL</label>
                  <div style={{ position: 'relative' }}>
                    <GitBranch size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      className="input"
                      style={{ paddingLeft: '40px' }}
                      value={values.repoUrl}
                      onChange={handleChange('repoUrl')}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="label">GitHub PAT (leave blank to keep current)</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      className="input"
                      type="password"
                      style={{ paddingLeft: '40px' }}
                      value={values.githubPat}
                      onChange={handleChange('githubPat')}
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="label">Trigger Condition</label>
                  <div style={{ position: 'relative' }}>
                    <Settings2 size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                      className="input"
                      style={{ paddingLeft: '40px' }}
                      value={values.condition}
                      onChange={handleChange('condition')}
                    >
                      {CONDITIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </motion.main>
      </div>
    </>
  )
}
