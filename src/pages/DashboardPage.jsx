import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Copy,
  FolderOpen,
  GitPullRequest,
  KeyRound,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Workflow,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectContext'
import Header from '../components/Header'
import StatsGrid from '../components/StatsGrid'
import RecentPRList from '../components/RecentPRList'
import AddProjectModal from '../components/AddProjectModal'
import { Modal } from '../components/Modal'
import { formatDate } from '../utils/date'
import toast from 'react-hot-toast'

const formatCondition = (condition) => {
  const labels = {
    on_failure: 'Auto-fix on CI failure',
    on_success: 'Log successful runs',
    always: 'Run on every pipeline',
    manual: 'Manual trigger only',
  }

  return labels[condition] || 'Trigger not configured'
}

export default function DashboardPage() {
  const {
    projects,
    selectedProject,
    setSelectedProject,
    stats,
    summary,
    recentPRs,
    loading,
    fetchProjects,
    fetchProjectStats,
    fetchDashboardSummary,
    fetchDashboardPullRequests,
    deleteProject,
  } = useProjects()
  const { meta, user } = useAuth()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [projectSetupData, setProjectSetupData] = useState(null)
  const [activeWorkspace, setActiveWorkspace] = useState('dashboard')

  useEffect(() => {
    const metaHasProjects = Array.isArray(meta?.projects)
    const metaHasSummary = Boolean(meta?.summary)
    const metaHasRecentPRs = Array.isArray(meta?.recentPRs)

    if (!metaHasProjects && !projects.length) {
      fetchProjects()
    }

    if (!metaHasSummary && !summary) {
      fetchDashboardSummary()
    }

    if (!metaHasRecentPRs && !recentPRs.length) {
      fetchDashboardPullRequests()
    }
  }, [
    fetchProjects,
    fetchDashboardSummary,
    fetchDashboardPullRequests,
    meta,
    projects.length,
    recentPRs.length,
    summary,
  ])

  useEffect(() => {
    if (selectedProject?._id && !stats) {
      fetchProjectStats(selectedProject._id)
    }
  }, [selectedProject, stats, fetchProjectStats])

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject, setSelectedProject])

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Operator')
  const totalProjects = projects.length
  const apiKeyCount = totalProjects
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', meta: 'Home' },
    { id: 'projects', icon: <FolderOpen size={16} />, label: 'Projects', meta: `${totalProjects} total` },
    { id: 'account', icon: <UserCircle2 size={16} />, label: 'Account', meta: user?.email || 'Signed in' },
  ]

  const focusCards = useMemo(() => {
    return [
      {
        icon: <FolderOpen size={18} />,
        label: 'Projects',
        value: summary?.projectCount ?? totalProjects,
        note: 'Each project gets its own API key and agent workflow.',
      },
      {
        icon: <KeyRound size={18} />,
        label: 'API Keys',
        value: apiKeyCount,
        note: 'One key per project keeps access scoped and easier to rotate.',
      },
      {
        icon: <GitPullRequest size={18} />,
        label: 'Pull Requests',
        value: summary?.pullRequestCount ?? recentPRs.length,
        note: 'Resolved failures and agent proposals show up here.',
      },
    ]
  }, [summary, totalProjects, apiKeyCount, recentPRs.length])

  const handleProjectCreated = (responseData) => {
    setProjectSetupData(responseData)
  }

  const handleCopyApiKey = async () => {
    if (!projectSetupData?.apiKey) return

    try {
      await navigator.clipboard.writeText(projectSetupData.apiKey)
      toast.success('API key copied')
    } catch {
      toast.error('Unable to copy API key')
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    const confirmed = window.confirm(`Delete "${projectName}"?`)
    if (!confirmed) return

    const result = await deleteProject(projectId)
    if (result.success) {
      toast.success('Project removed')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <>
      <Helmet>
        <title>Dashboard — AuraOps</title>
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 28%), radial-gradient(circle at top right, rgba(124,58,237,0.14), transparent 32%), var(--color-bg-primary)',
        }}
      >
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 py-8"
        >
          <div className="dashboard-shell">
            <aside className="dashboard-sidebar">
              <div className="card glass" style={{ padding: '1.25rem' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '12px',
                      background: 'rgba(124, 58, 237, 0.18)',
                      border: '1px solid rgba(124, 58, 237, 0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#c4b5fd',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="text-sm text-secondary">Signed in as</div>
                    <div className="text-lg font-bold" style={{ overflowWrap: 'anywhere' }}>
                      {displayName}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-secondary" style={{ overflowWrap: 'anywhere' }}>
                  {user?.email || 'No email available'}
                </div>
              </div>

              <div className="card glass" style={{ padding: '1rem' }}>
                <div className="text-sm font-bold" style={{ marginBottom: '0.75rem' }}>
                  Workspace
                </div>
                <div className="flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = activeWorkspace === item.id

                    return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveWorkspace(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.875rem 0.9rem',
                        borderRadius: '10px',
                        border: isActive ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(148,163,184,0.12)',
                        background: isActive ? 'rgba(124,58,237,0.14)' : 'rgba(15,23,42,0.55)',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                        <span style={{ color: isActive ? '#c4b5fd' : 'var(--color-text-secondary)' }}>
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs text-secondary" style={{ textAlign: 'right' }}>
                        {item.meta}
                      </span>
                    </button>
                    )
                  })}
                </div>
              </div>

              <div className="card glass" style={{ padding: '1rem' }}>
                <div className="text-sm font-bold" style={{ marginBottom: '0.75rem' }}>
                  Ready for your agent
                </div>
                <div className="flex-col gap-3">
                  <div className="dashboard-mini-stat">
                    <span className="text-secondary">Projects</span>
                    <strong>{totalProjects}</strong>
                  </div>
                  <div className="dashboard-mini-stat">
                    <span className="text-secondary">Scoped keys</span>
                    <strong>{apiKeyCount}</strong>
                  </div>
                  <div className="dashboard-mini-stat">
                    <span className="text-secondary">Recent PRs</span>
                    <strong>{summary?.pullRequestCount ?? recentPRs.length ?? 0}</strong>
                  </div>
                </div>
              </div>
            </aside>

            <section className="dashboard-main">
              {activeWorkspace === 'dashboard' ? (
                <>
              <div className="card glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="dashboard-hero-grid">
                  <div>
                    <div className="badge badge-info" style={{ marginBottom: '0.9rem' }}>
                      Dashboard Home
                    </div>
                    <h1 className="text-3xl font-bold" style={{ marginBottom: '0.75rem' }}>
                      Welcome back, {displayName}
                    </h1>
                    <p className="text-secondary" style={{ maxWidth: '42rem' }}>
                      This can be the main landing page after sign in: a quick view of your account,
                      project portfolio, and the agent actions that matter most when builds fail or a
                      pull request needs to be opened.
                    </p>
                  </div>

                  <div className="dashboard-hero-actions">
                    <button className="btn btn-outline" onClick={fetchProjects} disabled={loading}>
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                      <Plus size={16} />
                      Add Project
                    </button>
                  </div>
                </div>
              </div>

              <div className="dashboard-card-grid" style={{ marginBottom: '1.5rem' }}>
                {focusCards.map((item) => (
                  <div key={item.label} className="card glass" style={{ padding: '1.25rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '10px',
                        background: 'rgba(59,130,246,0.14)',
                        color: '#93c5fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="text-sm text-secondary">{item.label}</div>
                    <div className="text-3xl font-bold" style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>
                      {item.value ?? '—'}
                    </div>
                    <div className="text-sm text-secondary">{item.note}</div>
                  </div>
                ))}
              </div>

              {!projects.length && !loading ? (
                <div className="dashboard-two-column">
                  <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '12px',
                        background: 'rgba(59,130,246,0.14)',
                        color: '#93c5fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <FolderOpen size={22} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ marginBottom: '0.75rem' }}>
                      Start with your first project
                    </h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                      Add a repository, choose how the agent should react to CI events, and AuraOps
                      can take over the repetitive recovery loop.
                    </p>
                    <div className="flex-col gap-3" style={{ marginBottom: '1.5rem' }}>
                      {[
                        'Create a project and generate a dedicated API key.',
                        'Connect the repository and choose the trigger condition.',
                        'Let the agent investigate failures and prepare pull requests.',
                      ].map((step) => (
                        <div key={step} className="dashboard-step">
                          <span className="dashboard-step-dot" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                      <Plus size={16} />
                      Create Your First Project
                    </button>
                  </div>

                  <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h2 className="text-xl font-bold" style={{ marginBottom: '1rem' }}>
                      What belongs here next
                    </h2>
                    <div className="flex-col gap-3">
                      <div className="dashboard-insight-card">
                        <Workflow size={18} />
                        <div>
                          <div className="font-medium">Agent run health</div>
                          <div className="text-sm text-secondary">
                            Good place for run counts, failure trends, or queue state once the data is ready.
                          </div>
                        </div>
                      </div>
                      <div className="dashboard-insight-card">
                        <GitPullRequest size={18} />
                        <div>
                          <div className="font-medium">PR outcomes</div>
                          <div className="text-sm text-secondary">
                            Merge rate, open recommendations, and last auto-fix attempt would fit naturally here.
                          </div>
                        </div>
                      </div>
                      <div className="dashboard-insight-card">
                        <KeyRound size={18} />
                        <div>
                          <div className="font-medium">Key lifecycle</div>
                          <div className="text-sm text-secondary">
                            Rotation reminders or per-project key usage could become a helpful admin surface.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!!projects.length && (
                <>
                  <div className="dashboard-two-column" style={{ marginBottom: '1.5rem' }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '1rem', gap: '1rem' }}>
                        <div>
                          <h2 className="text-xl font-bold">Projects</h2>
                          <div className="text-sm text-secondary">Choose a project to inspect or configure.</div>
                        </div>
                        <button className="btn btn-outline" onClick={() => setAddModalOpen(true)}>
                          <Plus size={16} />
                          Add
                        </button>
                      </div>

                      <div className="flex-col gap-3">
                        {projects.map((project) => {
                          const isActive = selectedProject?._id === project._id

                          return (
                            <div
                              key={project._id}
                              onClick={() => setSelectedProject(project)}
                              style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                border: isActive ? '1px solid rgba(124,58,237,0.45)' : '1px solid rgba(148,163,184,0.12)',
                                background: isActive ? 'rgba(124,58,237,0.12)' : 'rgba(15,23,42,0.5)',
                                cursor: 'pointer',
                              }}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div style={{ minWidth: 0 }}>
                                  <div className="font-medium" style={{ overflowWrap: 'anywhere' }}>
                                    {project.name}
                                  </div>
                                  <div className="text-sm text-secondary" style={{ marginTop: '0.35rem' }}>
                                    {project.repoUrl || 'Repository not added yet'}
                                  </div>
                                </div>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleDeleteProject(project._id, project.name)
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '0.45rem 0.6rem' }}
                                  title="Delete project"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2" style={{ marginTop: '0.85rem' }}>
                                <span className="badge badge-info">{project.environment || 'project'}</span>
                                <span className="badge" style={{ background: 'rgba(148,163,184,0.12)', color: 'var(--color-text-secondary)' }}>
                                  {formatCondition(project.condition)}
                                </span>
                              </div>

                              <div className="text-xs text-secondary" style={{ marginTop: '0.85rem' }}>
                                Created {formatDate(project.createdAt)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="card glass" style={{ padding: '1.5rem' }}>
                      <div className="flex justify-between items-start gap-3" style={{ marginBottom: '1rem' }}>
                        <div>
                          <h2 className="text-xl font-bold">
                            {selectedProject?.name || 'Selected project'}
                          </h2>
                          <div className="text-sm text-secondary">
                            Project-level API key access and agent behavior live here.
                          </div>
                        </div>
                        {selectedProject?._id ? (
                          <Link to={`/projects/${selectedProject._id}`} className="btn btn-outline">
                            <Settings2 size={16} />
                            Configure
                          </Link>
                        ) : null}
                      </div>

                      {selectedProject ? (
                        <div className="flex-col gap-4">
                          <div className="dashboard-selected-project">
                            <div>
                              <div className="text-sm text-secondary">Repository</div>
                              <div className="font-medium" style={{ marginTop: '0.35rem', overflowWrap: 'anywhere' }}>
                                {selectedProject.repoUrl || 'Not linked yet'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-secondary">Trigger</div>
                              <div className="font-medium" style={{ marginTop: '0.35rem' }}>
                                {formatCondition(selectedProject.condition)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-secondary">Environment</div>
                              <div className="font-medium" style={{ marginTop: '0.35rem' }}>
                                {selectedProject.environment || 'production'}
                              </div>
                            </div>
                          </div>

                          <div className="dashboard-highlight">
                            <KeyRound size={18} />
                            <div>
                              <div className="font-medium">Project-scoped API key</div>
                              <div className="text-sm text-secondary">
                                New projects already surface the generated key in a modal, which fits your
                                “one key per project” model nicely.
                              </div>
                            </div>
                          </div>

                          <div className="dashboard-highlight">
                            <Workflow size={18} />
                            <div>
                              <div className="font-medium">Agent actions</div>
                              <div className="text-sm text-secondary">
                                This area is a good home for manual run, retry build, or open-fix-PR actions
                                once those endpoints are ready.
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Link to={`/projects/${selectedProject._id}`} className="btn btn-primary">
                              <Settings2 size={16} />
                              Open Project
                            </Link>
                            <button className="btn btn-outline" onClick={() => setAddModalOpen(true)}>
                              <Plus size={16} />
                              Add Another Project
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-secondary">Select a project to view its workspace.</div>
                      )}
                    </div>
                  </div>

                  <div className="card glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem', gap: '1rem' }}>
                      <div>
                        <h2 className="text-xl font-bold">Agent performance</h2>
                        <div className="text-sm text-secondary">
                          Current stats for {selectedProject?.name || 'your selected project'}.
                        </div>
                      </div>
                    </div>
                    <StatsGrid stats={stats} loading={loading} />
                  </div>

                  <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem', gap: '1rem' }}>
                      <div>
                        <h2 className="text-xl font-bold">Recent pull request activity</h2>
                        <div className="text-sm text-secondary">
                          Recent fixes and proposals created by the agent across your workspace.
                        </div>
                      </div>
                      <span className="badge badge-info">
                        {summary?.projectPullRequestCount ?? recentPRs.length ?? 0} tracked
                      </span>
                    </div>
                    <RecentPRList prs={recentPRs} loading={loading} />
                  </div>
                </>
              )}

                </>
              ) : null}

              {activeWorkspace === 'projects' ? (
                <div className="card glass" style={{ padding: '1.5rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem', gap: '1rem' }}>
                    <div>
                      <div className="badge badge-info" style={{ marginBottom: '0.75rem' }}>
                        Projects
                      </div>
                      <h1 className="text-3xl font-bold">All projects</h1>
                    </div>
                    <div className="dashboard-hero-actions">
                      <button className="btn btn-outline" onClick={fetchProjects} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                      </button>
                      <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                        <Plus size={16} />
                        Add Project
                      </button>
                    </div>
                  </div>

                  {!projects.length && !loading ? (
                    <div className="dashboard-selected-project">
                      <div className="font-medium">No projects yet</div>
                      <div className="text-sm text-secondary" style={{ marginTop: '0.35rem' }}>
                        Create your first project to generate an API key and connect a repository.
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                          <Plus size={16} />
                          Create Project
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-col gap-3">
                      {projects.map((project) => (
                        <div
                          key={project._id}
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(148,163,184,0.12)',
                            background: 'rgba(15,23,42,0.5)',
                          }}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div style={{ minWidth: 0 }}>
                              <div className="font-medium" style={{ overflowWrap: 'anywhere' }}>
                                {project.name}
                              </div>
                              <div className="text-sm text-secondary" style={{ marginTop: '0.35rem', overflowWrap: 'anywhere' }}>
                                {project.repoUrl || 'Repository not added yet'}
                              </div>
                            </div>
                            <div className="flex gap-2" style={{ flexShrink: 0 }}>
                              <Link to={`/projects/${project._id}`} className="btn btn-outline" style={{ padding: '0.45rem 0.6rem' }}>
                                <Settings2 size={14} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProject(project._id, project.name)}
                                className="btn btn-outline"
                                style={{ padding: '0.45rem 0.6rem' }}
                                title="Delete project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2" style={{ marginTop: '0.85rem' }}>
                            <span className="badge badge-info">{project.environment || 'project'}</span>
                            <span className="badge" style={{ background: 'rgba(148,163,184,0.12)', color: 'var(--color-text-secondary)' }}>
                              {formatCondition(project.condition)}
                            </span>
                            <span className="badge" style={{ background: 'rgba(148,163,184,0.12)', color: 'var(--color-text-secondary)' }}>
                              Created {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {activeWorkspace === 'account' ? (
                <div className="card glass" style={{ padding: '1.5rem' }}>
                  <div className="badge badge-info" style={{ marginBottom: '0.75rem' }}>
                    Account
                  </div>
                  <h1 className="text-3xl font-bold" style={{ marginBottom: '0.75rem' }}>
                    {displayName}
                  </h1>
                  <div className="dashboard-selected-project">
                    <div>
                      <div className="text-sm text-secondary">Email</div>
                      <div className="font-medium" style={{ marginTop: '0.35rem', overflowWrap: 'anywhere' }}>
                        {user?.email || 'No email available'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </motion.main>
      </div>

      <AddProjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleProjectCreated}
      />

      <Modal isOpen={Boolean(projectSetupData)} onClose={() => setProjectSetupData(null)} title="Save Your API Key">
        <div className="flex-col gap-4">
          <p className="text-sm text-secondary">Copy and store this API key securely.</p>

          <input className="input" value={projectSetupData?.apiKey || ''} readOnly />

          <button onClick={handleCopyApiKey} className="btn btn-primary w-full">
            <Copy size={14} />
            Copy API Key
          </button>

          <button onClick={() => setProjectSetupData(null)} className="btn btn-outline w-full">
            Done
          </button>
        </div>
      </Modal>
    </>
  )
}
