
import api from "../axios";



const loginSysUser = async ({loginData}) => {  
        
        try {
            const response = await api.post('/api/v1/sysuser/login', loginData);
            // console.log(response?.data);
            return response?.data;
            
        } catch (error) {
            
            throw  error.response?.data?.message;
            
        }
        
}

const verifyUser = async () => {
    try {
        const response = await api.get('/api/v1/sysuser/me');
        console.log(response?.data?.message);
        return response?.data;
    } catch (error) {
        console.log(error.response?.data?.message);
        throw error.response?.data?.message;
        
    }
}

export {
    loginSysUser,
    verifyUser
}