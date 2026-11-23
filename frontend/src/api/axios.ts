import axios from 'axios';
import { expireSession, getToken } from './authStorage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// intercept requests to automatically include jwt token
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// A 401 on a request that carried a token means the backend no longer accepts it (expired, or
// signed with a rotated secret), so end the session; ProtectedRoute then redirects to /login.
// Two cases are left alone:
// - no token was sent: a 401 from the login form is a wrong password, not an expired session;
// - the token sent is no longer the stored one: a slow request from before the user signed in
//   again must not sign them out of the new session.
api.interceptors.response.use(undefined, (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        const sent = error.config?.headers?.Authorization;
        const token = getToken();
        if (token && sent === `Bearer ${token}`) {
            expireSession();
        }
    }
    return Promise.reject(error);
});

export default api;
