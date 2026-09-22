/**
 * API Service - Centralized API communication
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (userData) =>
    apiRequest('/api/signup', { method: 'POST', body: JSON.stringify(userData) }),
  googleSignup: (userData) =>
    apiRequest('/api/google-signup', { method: 'POST', body: JSON.stringify(userData) })
};

// User API
export const userAPI = {
  getAllUsers: () => apiRequest('/api/get-all-users')
};

// Sub-user API
export const subUserAPI = {
  addSubUser: (data) => apiRequest('/api/add-subuser', { method: 'POST', body: JSON.stringify(data) }),
  getSubUsers: (headUserId) => apiRequest(`/api/get-subusers/${headUserId}`),
  updateSubUser: (subUserId, data) => apiRequest(`/api/update-subuser/${subUserId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubUser: (subUserId) => apiRequest(`/api/delete-subuser/${subUserId}`, { method: 'DELETE' })
};

// Design API
export const designAPI = {
  generateDesign: (data) => apiRequest('/api/generate-design', { method: 'POST', body: JSON.stringify(data) }),
  getDesigns: () => apiRequest('/api/designs')
};

// Product API
export const productAPI = {
  addProduct: (formData) => fetch(`${API_BASE_URL}/api/add-product`, { method: 'POST', body: formData }).then(res => res.json()),
  uploadImages: (formData) => fetch(`${API_BASE_URL}/api/upload-images`, { method: 'POST', body: formData }).then(res => res.json()),
  getProducts: () => apiRequest('/api/products')
};

// Template API
export const templateAPI = {
  getAll: () => apiRequest('/api/templates'),
  create: (data) => apiRequest('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/api/templates/${id}`, { method: 'DELETE' }),
  uploadMedia: (file, mediaType) => {
    const formData = new FormData();
    formData.append('file', file);
    if (mediaType) formData.append('mediaType', mediaType);
    return fetch(`${API_BASE_URL}/api/templates/upload-media`, { method: 'POST', body: formData }).then(res => res.json());
  },
  seed: () => apiRequest('/api/templates/seed', { method: 'POST' })
};

// Default export
export default {
  auth: authAPI,
  user: userAPI,
  subUser: subUserAPI,
  design: designAPI,
  product: productAPI,
  template: templateAPI
};