import axios from 'axios';

// Get backend URL from Vite environment or localStorage fallback
export const getBaseURL = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem('VITE_API_BASE_URL') || '').trim() : '';
  const chosen = envUrl || storedUrl;
  return chosen.endsWith('/') ? chosen.slice(0, -1) : chosen;
};

// Allow updating the backend URL at runtime without needing a frontend rebuild
export const setBaseURL = (url) => {
  const clean = (url || '').trim().replace(/\/+$/, '');
  if (clean) {
    localStorage.setItem('VITE_API_BASE_URL', clean);
  } else {
    localStorage.removeItem('VITE_API_BASE_URL');
  }
  API.defaults.baseURL = clean;
  return clean;
};

const API = axios.create({ baseURL: getBaseURL() });

API.interceptors.request.use((config) => {
  const currentBase = getBaseURL();
  if (currentBase) {
    config.baseURL = currentBase;
  } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn('[TrueVote] VITE_API_BASE_URL is not set on Vercel! Requests are going to Vercel domain instead of Render backend.');
  }
  const token = localStorage.getItem('admin_access') || localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[TrueVote API Error]', error.config?.method?.toUpperCase(), (error.config?.baseURL || '') + (error.config?.url || ''), error.message, error.response?.status);
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/login/') && !url.includes('/register/') && !url.includes('/admin-login/')) {
        localStorage.removeItem('access');
        localStorage.removeItem('admin_access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('voter');
      }
    }
    return Promise.reject(error);
  }
);

export const registerVoter = (data) => API.post('/api/users/register/', data);
export const sendOtp = (data) => API.post('/api/users/send-otp/', data);
export const verifyOtp = (data) => API.post('/api/users/verify-otp/', data);
export const completeRegistration = (data) => API.post('/api/users/complete-registration/', data);
export const sendLoginOtp = (data) => API.post('/api/users/send-login-otp/', data);
export const verifyLoginOtp = (data) => API.post('/api/users/verify-login-otp/', data);
export const getProfile = () => API.get('/api/users/profile/');
export const adminLogin = (data) => API.post('/api/users/admin-login/', data);
export const forgotPassword = (data) => API.post('/api/users/forgot-password/', data);
export const resetPassword = (data) => API.post('/api/users/reset-password/', data);

export const listVoters = (params = {}) => API.get('/api/users/voters/', { params });
export const updateVoter = (voterId, data) => API.patch(`/api/users/voters/${voterId}/`, data);
export const deleteVoter = (voterId) => API.delete(`/api/users/voters/${voterId}/delete/`);

export const registerFace = (data) => API.post('/api/face/register-face/', data);
export const saveFaceFrame = (data) => API.post('/api/face/save-frame/', data);
export const saveFaceFramesBatch = (data) => API.post('/api/face/save-frames-batch/', data);
export const faceLogin = () => API.get('/api/face/login-face/');
export const recognizeFrame = (data) => API.post('/api/face/recognize-frame/', data);

export const listElections = (params = {}) => API.get('/api/elections/election/', { params });
export const createElection = (data) => API.post('/api/elections/election/create/', data);
export const updateElection = (id, data) => API.patch(`/api/elections/election/${id}/update/`, data);
export const deleteElection = (id) => API.delete(`/api/elections/election/${id}/delete/`);

export const listCandidates = (electionId) => API.get('/api/elections/candidate/', { params: electionId ? { election: electionId } : {} });
export const registerCandidate = (data) => API.post('/api/elections/candidate/register/', data);
export const updateCandidate = (id, data) => API.patch(`/api/elections/candidate/${id}/update/`, data);
export const deleteCandidate = (id) => API.delete(`/api/elections/candidate/${id}/delete/`);

export const castVote = (data) => API.post('/api/votes/vote/', data);
export const getResults = (electionId) => API.get(`/api/votes/results/${electionId}/`);
export const getDashboard = () => API.get('/api/votes/dashboard/');
export const hasVoted = (electionId) => API.get(`/api/votes/has-voted/${electionId}/`);

export const getBlockchain = () => API.get('/blockchain/');
export const validateBlockchain = () => API.get('/blockchain/validate/');
