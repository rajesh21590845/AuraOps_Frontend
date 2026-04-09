import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, FolderOpen, GitPullRequest, Zap, LogOut, Trash2 } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import StatsGrid from '../components/StatsGrid'
import RecentPRList from '../components/RecentPRList'
import AddProjectModal from '../components/AddProjectModal'
import { formatDate } from '../utils/date'

export default function DashboardPage() {
  const { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    stats, 
    loading, 
    fetchProjects, 
    fetchProjectStats,
    deleteProject 
  } = useProjects()
  
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (selectedProject?._id) {
      fetchProjectStats(selectedProject._id)
    }
  }, [selectedProject, fetchProjectStats])

  // Select first project by default if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject, setSelectedProject])

  return (
    <>
      <Helmet>
        <title>Dashboard — AuraOps</title>
      </Helmet>

      <div className="bg-grid" style={{ minHeight: '100vh' }}>
        <Header />

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 py-8"
        >
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-secondary">Manage your projects and monitor AI performance</p>
            </div>
            <div className="flex gap-3">
              <button 
                className="btn btn-secondary" 
                onClick={() => fetchProjects()}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus size={16} /> Add Project
              </button>
            </div>
          </div>

          {!selectedProject && !loading ? (
            <div className="card text-center py-12 glass">
              <FolderOpen size={48} className="text-muted mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No projects found</h2>
              <p className="text-secondary mb-6">Connect your first repository to start automating your CI workflow</p>
              <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                Connect Repository
              </button>
            </div>
          ) : (
            <div className="flex-col gap-8">
              {/* Stats Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-accent" />
                  <h2 className="text-lg font-bold uppercase tracking-wider text-secondary">
                    Real-time Statistics {selectedProject && `— ${selectedProject.name}`}
                  </h2>
                </div>
                <StatsGrid stats={stats} loading={loading} />
              </section>

              {/* Recent Activities & Project Selection */}
              <div className="grid grid-cols-3 gap-8 mt-8">
                {/* Main Content: Recent PRs */}
                <div className="col-span-2 flex-col gap-6">
                  <div className="card glass">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <GitPullRequest size={20} className="text-accent" />
                        <h2 className="text-lg font-bold">Recent Pull Requests</h2>
                      </div>
                      <button className="text-accent text-sm font-medium hover:underline">View All</button>
                    </div>
                    <RecentPRList prs={stats?.recentPRs || []} loading={loading} />
                  </div>
                </div>

                {/* Sidebar: Projects List */}
                <div className="flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-2">Your Projects</h3>
                  <div className="flex-col gap-2">
                    {projects.map(project => (
                      <div 
                        key={project._id}
                        onClick={() => setSelectedProject(project)}
                        className={`card p-4 pointer ${selectedProject?._id === project._id ? 'glow-purple border-accent' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{project.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${project.condition === 'on_failure' ? 'badge-error' : 'badge-success'}`}>
                              {project.condition === 'on_failure' ? 'Auto' : 'Active'}
                            </span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                deleteProject(project._id); 
                              }}
                              className="text-muted hover:text-error transition-colors"
                              title="Delete project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted mt-1">{formatDate(project.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>

      <AddProjectModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
