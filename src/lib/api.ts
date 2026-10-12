import axios from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE } from '@/lib/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expired — drop the token and go back to login.
// Only when we were logged in: a 401 from the login form itself is just "wrong password".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && Cookies.get(TOKEN_COOKIE)) {
      Cookies.remove(TOKEN_COOKIE);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Turns any thrown request error into a message that is safe to show the user
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (!error.response) return 'Cannot reach the server. Check that the API is running.';
  }
  return fallback;
}

export default api;
