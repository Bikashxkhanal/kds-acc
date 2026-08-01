import axios from 'axios'


const api = axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    withCredentials : true,
    timeout : 100000,
    headers : {"Content-Type" : 'application/json'} 
});

export default api;