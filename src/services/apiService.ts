import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las peticiones
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

// Interceptor para manejar errores de respuesta (ej. token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido, redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const auth = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateMe: (userData: any) => api.put('/auth/me', userData),
  changePassword: (passwords: any) => api.put('/auth/change-password', passwords),
};

// Funciones de clientes
export const clients = {
  getClients: (params?: any) => api.get('/clients', { params }),
  getClientById: (clientId: string) => api.get(`/clients/${clientId}`),
  getTrainerClients: () => api.get('/clients'),
  assignClient: (clientId: string) => api.post(`/clients/${clientId}/assign`),
  unassignClient: (clientId: string) => api.delete(`/clients/${clientId}/assign`),
  getClientsStats: () => api.get('/clients/stats'),
};

// Funciones de planes
export const plans = {
  getDietPlan: (userId: string) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/plans/${userId}/diet`);
  },
  updateDietPlan: (userId: string, planData: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.put(`/plans/${userId}/diet`, planData);
  },
  getWorkoutPlan: (userId: string) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/plans/${userId}/workout`);
  },
  updateWorkoutPlan: (userId: string, planData: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.put(`/plans/${userId}/workout`, planData);
  },
  getPlansHistory: (userId: string, params?: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/plans/${userId}/history`, { params });
  },
  deactivatePlan: (userId: string, type: 'diet' | 'workout') => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.post(`/plans/${userId}/deactivate`, { type });
  },
};

// Funciones de progreso
export const progress = {
  getProgressLogs: (userId: string, params?: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/progress/${userId}`, { params });
  },
  createProgressLog: (userId: string, logData: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.post(`/progress/${userId}`, logData);
  },
  updateProgressLog: (userId: string, logId: string, logData: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.put(`/progress/${userId}/${logId}`, logData);
  },
  deleteProgressLog: (userId: string, logId: string) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.delete(`/progress/${userId}/${logId}`);
  },
  getProgressSummary: (userId: string, params?: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/progress/${userId}/summary`, { params });
  },
  getProgressStats: (userId: string, params?: any) => {
    if (!userId) {
      return Promise.reject(new Error('userId es requerido'));
    }
    return api.get(`/progress/${userId}/stats`, { params });
  },
};

// Funciones de chat
export const chat = {
  getConversations: (params?: any) => api.get('/chat/conversations', { params }),
  getUnreadCount: () => api.get('/chat/unread'),
  getMessages: (partnerId: string, params?: any) => api.get(`/chat/${partnerId}`, { params }),
  sendMessage: (partnerId: string, messageData: any) => api.post(`/chat/${partnerId}`, messageData),
  markAsRead: (partnerId: string) => api.put(`/chat/${partnerId}/read`),
  searchMessages: (partnerId: string, params?: any) => api.get(`/chat/${partnerId}/search`, { params }),
  deleteMessage: (messageId: string) => api.delete(`/chat/message/${messageId}`),
};

// Funciones de subida de archivos
export const upload = {
  getUploadInfo: () => api.get('/upload/info'),
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post('/upload/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadProgressImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('progressImages', file));
    return api.post('/upload/progress', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadChatFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('chatFiles', file));
    return api.post('/upload/chat', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteImage: (imageUrl: string) => api.delete('/upload/image', { data: { imageUrl } }),
  cleanupOrphanedFiles: () => api.post('/upload/cleanup'),
};

export default api;

