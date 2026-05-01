import api from "../axios";

const searchStaffByName = async({params , signal} = {}) => {
    try {
        const res = await api.get('/api/v1/staff', {
            params, 
            signal
        })

        console.log(res?.data);
        return res?.data;
        
    } catch (error) {
        throw error?.response?.data;
    }
}


export {
    searchStaffByName
}