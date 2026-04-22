import api from "../axios";
import {toast} from 'react-toastify'

const loginSysUser = async ({loginData}) => {
        
        
        try {
            const response = await api.post('/api/v1/sysuser/login', loginData);
            // console.log(response?.data);
            return response.data
            
        } catch (error) {
            throw  error.response?.data?.message;
            
            
        }
        
}

export {
    loginSysUser
}