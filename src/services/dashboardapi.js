import axios from 'axios';
import { getStoredAccessToken, logBackendRequest } from './api';

const API_BASE = 'http://localhost:8081/api/dashboard';

// ✅ create reusable axios instance (better for scaling)
const api = axios.create({
  baseURL: API_BASE,
});

// ✅ optional: attach token automatically (if you use auth)
api.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  logBackendRequest(config);
  return config;
});

// ✅ GET PROJECTS FOR USER
export const getUserProjects = async (userId) => {
  const res = await api.get(`/users/${userId}/projects`);
  return res.data;
};

// ✅ GET ALL USER PRs (optional, not used yet in context)
export const getUserPullRequests = async (userId) => {
  const res = await api.get(`/users/${userId}/pull-requests`);
  return res.data;
};

// ✅ GET USER SUMMARY
export const getUserSummary = async (userId) => {
  const res = await api.get(`/users/${userId}/summary`);
  return res.data;
};

// ✅ GET PRs FOR A PROJECT
export const getProjectPullRequests = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/pull-requests`);
  return res.data;
};
