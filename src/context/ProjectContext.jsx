import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getProjects,
  getProject,
  getProjectStats,
  getDashboardPullRequests,
  getUserSummary,
  getUserIdFromToken,
  deleteProject as deleteProjectApi,
  createProject as createProjectApi,
} from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

const readStoredMeta = () => {
  try {
    const value = localStorage.getItem('auraops_meta');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const toArray = (value, keys = []) => {
  if (Array.isArray(value)) return value;

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  if (value?.data && value.data !== value) {
    return toArray(value.data, keys);
  }

  return [];
};

const normalizeProject = (project) => {
  if (!project) return null;

  const id = project._id || project.id || project.projectId;

  return {
    ...project,
    _id: id,
    id,
    repoUrl: project.repoUrl || project.repositoryUrl || '',
    repositoryUrl: project.repositoryUrl || project.repoUrl || '',
  };
};

const normalizeProjects = (value) =>
  toArray(value, ['projects', 'data'])
    .map(normalizeProject)
    .filter(Boolean);

const getMetaState = (meta) => {
  const projects = normalizeProjects(meta?.projects);
  const defaultProjectId = meta?.defaultProjectId;
  const selectedProject =
    projects.find((project) => project._id === defaultProjectId) ||
    normalizeProject(meta?.selectedProject) ||
    projects[0] ||
    null;

  return {
    projects,
    selectedProject,
    stats: meta?.stats || meta?.projectStats || null,
    summary: meta?.summary || null,
    recentPRs: toArray(meta?.recentPRs || meta?.stats?.recentPRs, ['pullRequests', 'prs', 'data']),
  };
};

export const ProjectProvider = ({ children }) => {
  const { meta, user } = useAuth();
  const storedMeta = readStoredMeta();
  const initialMetaState = getMetaState(storedMeta);

  const [projects, setProjects] = useState(initialMetaState.projects);
  const [selectedProject, setSelectedProject] = useState(initialMetaState.selectedProject);
  const [stats, setStats] = useState(initialMetaState.stats);
  const [summary, setSummary] = useState(initialMetaState.summary);
  const [recentPRs, setRecentPRs] = useState(initialMetaState.recentPRs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getActiveUserId = useCallback(() => {
    return user?.userId || user?.userID || user?.user_id || user?.id || user?._id || getUserIdFromToken();
  }, [user]);

  useEffect(() => {
    if (!meta) return;

    const nextMetaState = getMetaState(meta);
    setProjects(nextMetaState.projects);
    setSelectedProject((current) => {
      if (current?._id && nextMetaState.projects.some((project) => project._id === current._id)) {
        return current;
      }

      return nextMetaState.selectedProject;
    });
    setStats(nextMetaState.stats);
    setSummary(nextMetaState.summary);
    setRecentPRs(nextMetaState.recentPRs);
  }, [meta]);

  const fetchProjects = useCallback(async () => {
    const userId = getActiveUserId();
    if (!userId) {
      setProjects([]);
      setSelectedProject(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getProjects(userId);
      const nextProjects = normalizeProjects(response.data);
      setProjects(nextProjects);
      setSelectedProject((current) => {
        if (current?._id && nextProjects.some((project) => project._id === current._id)) {
          return current;
        }

        return nextProjects[0] || null;
      });
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getActiveUserId]);

  const fetchProjectStats = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await getProjectStats(id);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async () => {
    const userId = getActiveUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getUserSummary(userId);
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, [getActiveUserId]);

  const fetchDashboardPullRequests = useCallback(async () => {
    const userId = getActiveUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getDashboardPullRequests(userId);
      setRecentPRs(toArray(response.data, ['pullRequests', 'prs', 'data']));
    } catch (err) {
      console.error('Failed to fetch dashboard pull requests:', err);
    } finally {
      setLoading(false);
    }
  }, [getActiveUserId]);

  const addProject = async (projectData) => {
    setLoading(true);
    try {
      const response = await createProjectApi(projectData);
      const createdProjectId = response.data?.projectId;

      if (createdProjectId) {
        const createdProjectResponse = await getProject(createdProjectId);
        const createdProject = normalizeProject(createdProjectResponse.data);

        if (createdProject) {
          setProjects((prev) => {
            const exists = prev.some((project) => project._id === createdProject._id);
            if (exists) {
              return prev.map((project) =>
                project._id === createdProject._id ? createdProject : project
              );
            }
            return [...prev, createdProject];
          });
          setSelectedProject(createdProject);
        }
      }

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to add project:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to create project' 
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setLoading(true);
    try {
      await deleteProjectApi(id);
      setProjects((prev) => prev.filter(project => project._id !== id));
      if (selectedProject?._id === id) {
        setSelectedProject(null);
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to delete project:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete project' 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      selectedProject, 
      setSelectedProject, 
      stats, 
      summary,
      recentPRs,
      loading, 
      error, 
      fetchProjects, 
      fetchProjectStats,
      fetchDashboardSummary,
      fetchDashboardPullRequests,
      addProject,
      deleteProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
