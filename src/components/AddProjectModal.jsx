import { useState } from 'react'
import { useForm } from '../hooks/useForm'
import { Modal } from './Modal'
import { useProjects } from '../context/ProjectContext'
import { FolderPlus, GitBranch, Key, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CONDITIONS = [
  { value: 'on_failure',   label: '🔴 On CI Failure (Auto-fix)' },
  { value: 'on_success',   label: '✅ On CI Success (Log only)' },
  { value: 'always',       label: '🔁 Always (All runs)' },
  { value: 'manual',       label: '⚙️ Manual Trigger Only' },
]

export default function AddProjectModal({ isOpen, onClose }) {
  const { addProject } = useProjects()
  const [loading, setLoading] = useState(false)

  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    { name: '', githubPat: '', condition: 'on_failure', repoUrl: '' },
    {
      name: (v) => v.trim().length < 2 ? 'Project name must be at least 2 characters' : null,
      githubPat: (v) => v.trim().length < 10 ? 'GitHub PAT is required' : null,
    }
  )

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await addProject(data)
    if (result.success) {
      toast.success('Project added successfully! 🎉')
      reset()
      onClose()
    } else {
      toast.error(result.message)
    }
    setLoading(false)
  }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Project">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-col gap-4">
          <div className="w-full">
            <label className="label" htmlFor="proj-name">Project Name</label>
            <div style={{ position: 'relative' }}>
              <FolderPlus size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="proj-name"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="my-awesome-repo"
                value={values.name}
                onChange={handleChange('name')}
              />
            </div>
            {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="w-full">
            <label className="label" htmlFor="proj-repo">GitHub Repository URL (optional)</label>
            <div style={{ position: 'relative' }}>
              <GitBranch size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="proj-repo"
                className="input"
                style={{ paddingLeft: '40px' }}
                placeholder="https://github.com/owner/repo"
                value={values.repoUrl}
                onChange={handleChange('repoUrl')}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="label" htmlFor="proj-pat">GitHub PAT</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="proj-pat"
                className="input"
                type="password"
                style={{ paddingLeft: '40px' }}
                placeholder="ghp_xxxxxxxxxxxx"
                value={values.githubPat}
                onChange={handleChange('githubPat')}
              />
            </div>
            {errors.githubPat && <p className="text-red text-sm mt-1">{errors.githubPat}</p>}
            <p className="text-xs text-muted mt-1">Needs repo, workflow, pull_request scopes</p>
          </div>

          <div className="w-full">
            <label className="label" htmlFor="proj-condition">Trigger Condition</label>
            <div style={{ position: 'relative' }}>
              <Settings2 size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                id="proj-condition"
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

          <div className="flex gap-4 mt-6">
            <button type="button" className="btn btn-secondary flex-1" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Add Project'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
