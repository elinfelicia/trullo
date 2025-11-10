import axios from 'axios';

// Get API URL from environment variable
// If VITE_API_URL is set, use it (should already include /api)
// Otherwise default to localhost
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Ensure the URL ends with /api if it doesn't already
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.endsWith('/') 
    ? `${API_BASE_URL}api` 
    : `${API_BASE_URL}/api`;
}

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (!error.response) {
      console.error('Network Error:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Full URL:', error.config?.baseURL + error.config?.url);
      console.error('Is the backend running?');
    } else {
      console.error('API Error:', error.response.status, error.response.statusText);
      console.error('Request URL:', error.config?.url);
      console.error('Response:', error.response.data);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users', userData),
  login: (credentials) => api.post('/users/login', credentials),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addTask: (projectId, taskId) => api.post(`/projects/${projectId}/tasks`, { taskId }),
  removeTask: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks`, { 
    data: { taskId },
    headers: { 'Content-Type': 'application/json' }
  }),
};

export default api;

