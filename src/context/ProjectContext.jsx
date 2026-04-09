import { createContext, useContext, useState, useCallback } from 'react';
import { getProjects, createProject as createProjectApi, getProjectStats } from '../services/api';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const addProject = async (projectData) => {
    setLoading(true);
    try {
      const response = await createProjectApi(projectData);
      setProjects((prev) => [...prev, response.data]);
      return { success: true };
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

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      selectedProject, 
      setSelectedProject, 
      stats, 
      loading, 
      error, 
      fetchProjects, 
      fetchProjectStats,
      addProject 
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
