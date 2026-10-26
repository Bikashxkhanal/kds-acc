import axios from 'axios'
import { toast } from 'react-toastify'


const api = axios.create({
    // Use Vite's same-origin proxy in development so LAN clients do not
    // accidentally call their own localhost:8000.
    baseURL : import.meta.env.DEV ? '' : import.meta.env.VITE_BASE_URL,
    withCredentials : true,
    timeout : 100000,
    headers : {"Content-Type" : 'application/json'} 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.hadAccessToken = true;
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let redirectingForExpiredSession = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || '';
        if (status === 403) {
            toast.error(error?.response?.data?.message || 'You are not authorized to perform this action.');
        } else if (status === 401 && error?.config?.hadAccessToken && !requestUrl.includes('/sysuser/login') && !requestUrl.includes('/sysuser/logout') && !redirectingForExpiredSession) {
            redirectingForExpiredSession = true;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            toast.error('Your session expired. Please log in again.');
            if (window.location.pathname !== '/login') window.location.assign('/login?session=expired');
            else redirectingForExpiredSession = false;
        }
        return Promise.reject(error);
    }
);

export default api;
