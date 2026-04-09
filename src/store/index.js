import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auraops-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export const useProjectStore = create((set) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setLoading: (loading) => set({ loading }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updated) => set((state) => ({
    projects: state.projects.map(p => p._id === id ? { ...p, ...updated } : p),
    selectedProject: state.selectedProject?._id === id ? { ...state.selectedProject, ...updated } : state.selectedProject,
  })),
}))
