import axios from 'axios'


const api = axios.create({
    baseURL : import.meta.env.VITE_LOCAL_BASE_URL_NETWORK,
    withCredentials : true,
    timeout : 100000,
    headers : {"Content-Type" : 'application/json'} 
});

export default api;