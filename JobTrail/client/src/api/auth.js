
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobtrail_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Login user
export const loginUser = async (email, password) => {
  const { data } = await api.post('/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  const result = data.data ?? data;

  return {
    user: result.user,
    token: result.token,
  };
};

// Register user
export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const { data } = await api.post('/register', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  const result = data.data ?? data;

  return {
    user: result.user,
    token: result.token,
  };
};

// Get logged-in user's profile
export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data.data ?? data;
};

// Update logged-in user's profile
export const updateProfile = async (profileData) => {
  const { data } = await api.patch('/profile', profileData);
  return data.data ?? data;
};

// Export API instance if needed elsewhere
export default api;