/**
 * API Service - Centralized API communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Auth API endpoints
 */
export const authAPI = {
  login: (email, password) =>
    apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (userData) =>
    apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  googleSignup: (userData) =>
    apiRequest('/api/google-signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};
/**
 * Sub-user API endpoints
 */
export const userAPI = {
  getAllUsers: () => apiRequest('/api/get-all-users'),
  updateUserStatus: (userId, data) => 
    apiRequest(`/api/update-user-status/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (userId) => 
    apiRequest(`/api/delete-user/${userId}`, {
      method: 'DELETE',
    }),
}


export const subUserAPI = {
  addSubUser: (data) =>
    apiRequest('/api/add-subuser', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSubUsers: (headUserId) =>
    apiRequest(`/api/get-subusers/${headUserId}`),

  updateSubUser: (subUserId, data) =>
    apiRequest(`/api/update-subuser/${subUserId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSubUser: (subUserId) =>
    apiRequest(`/api/delete-subuser/${subUserId}`, {
      method: 'DELETE',
    }),
};
/**
 * Design API endpoints
 */
export const designAPI = {
  generateDesign: (data) =>
    apiRequest('/api/generate-design', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDesigns: () =>
    apiRequest('/api/designs'),
};

/**
 * Product API endpoints
 */
export const productAPI = {
  addProduct: (formData) =>
    fetch(`${API_BASE_URL}/api/add-product`, {
      method: 'POST',
      body: formData, // FormData for file uploads
    }).then(res => res.json()),

  uploadImages: (formData) =>
    fetch(`${API_BASE_URL}/api/upload-images`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json()),

  getProducts: () =>
    apiRequest('/api/products'),
};

/**
 * Template API endpoints
 */
export const templateAPI = {
  getAll: () =>
    apiRequest('/api/templates'),

  create: (data) =>
    apiRequest('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/api/templates/${id}`, {
      method: 'DELETE',
    }),

  uploadMedia: (file, mediaType) => {
    const formData = new FormData();
    formData.append('file', file);
    if (mediaType) formData.append('mediaType', mediaType);
    return fetch(`${API_BASE_URL}/api/templates/upload-media`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  seed: () =>
    apiRequest('/api/templates/seed', { method: 'POST' }),
};

// NOTE: Use the correct backend endpoint with /api prefix
export const videoAdAPI = {
  // Enhance raw product details into a cinematic prompt via Gemini
  enhancePrompt: (productDetails) =>
    apiRequest('/api/enhance-prompt', {
      method: 'POST',
      body: JSON.stringify(productDetails),
    }),

  // Generate video via Veo 3.1 — accepts { prompt: "..." }
  // This call can take 2-5 minutes as Veo generates the video asynchronously
  generateVideo: (data) => {
    const url = `${API_BASE_URL}/api/generate-video`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(360000), // 6 minute timeout for Veo
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Video generation failed');
        }
        return result;
      })
      .catch((error) => {
        console.error('Video API Error:', error);
        throw error;
      });
  },
};

/**
 * Voice API endpoints
 */
export const voiceAPI = {
  // Generate voice via Eleven Labs — accepts { text: "...", voice_id: "..." }
  generateVoice: (data) =>
    apiRequest('/api/generate-voice', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Social Media API endpoints
 */
export const socialMediaAPI = {
  getAuthUrl: (platform, userId) =>
    apiRequest('/api/social-media/auth-url', {
      method: 'POST',
      body: JSON.stringify({ platform, user_id: userId }),
    }),

  publish: (platform, userId, contentUrl, contentType, caption) =>
    apiRequest('/api/social-media/publish', {
      method: 'POST',
      body: JSON.stringify({ platform, user_id: userId, content_url: contentUrl, content_type: contentType, caption }),
    }),

  getStatus: (userId) =>
    apiRequest(`/api/social-media/status?user_id=${userId}`),

  disconnect: (platform, userId) =>
    apiRequest('/api/social-media/disconnect', {
      method: 'POST',
      body: JSON.stringify({ platform, user_id: userId }),
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  subUser: subUserAPI,
  design: designAPI,
  product: productAPI,
  template: templateAPI,
  videoAd: videoAdAPI,
  voice: voiceAPI,
  socialMedia: socialMediaAPI,
};