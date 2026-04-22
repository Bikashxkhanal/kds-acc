import axios from 'axios'

console.log(import.meta.env.VITE_LOCAL_BASE_URL);

const api = axios.create({
    baseURL : import.meta.env.VITE_LOCAL_BASE_URL,
    withCredentials : true,
    timeout : 10000,
    headers : {"Content-Type" : 'application/json'} 
});

export default api;