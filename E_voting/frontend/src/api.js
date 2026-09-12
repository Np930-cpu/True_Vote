import axios from 'axios';

// Use VITE_API_BASE_URL in production (e.g. on Vercel/Netlify pointing to Render backend)
// In local development, leave unset so Vite dev server proxies /api and /blockchain to Django
const API = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/login/') && !url.includes('/register/')) {
        localStorage.removeItem('access');
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

export const registerFace = (data) => API.post('/api/face/register-face/', data);
export const saveFaceFrame = (data) => API.post('/api/face/save-frame/', data);
export const saveFaceFramesBatch = (data) => API.post('/api/face/save-frames-batch/', data);
export const faceLogin = () => API.get('/api/face/login-face/');
export const recognizeFrame = (data) => API.post('/api/face/recognize-frame/', data);

export const listElections = () => API.get('/api/elections/election/');
export const createElection = (data) => API.post('/api/elections/election/create/', data);
export const listCandidates = () => API.get('/api/elections/candidate/');
export const registerCandidate = (data) => API.post('/api/elections/candidate/register/', data);

export const castVote = (data) => API.post('/api/votes/vote/', data);
export const getResults = (electionId) => API.get(`/api/votes/results/${electionId}/`);
export const getDashboard = () => API.get('/api/votes/dashboard/');
export const hasVoted = (electionId) => API.get(`/api/votes/has-voted/${electionId}/`);

export const getBlockchain = () => API.get('/blockchain/');
export const validateBlockchain = () => API.get('/blockchain/validate/');
