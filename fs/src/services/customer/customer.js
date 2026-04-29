import api from "../axios";


const searchCustomer = async ({params , signal} = {} ) => {
        const res = await api.get('/api/v1/customer/search', {
            params: params,
            signal : signal
        })
       
        return res?.data;
}

const addWorkDetailsOfCustomer = async (data) => {

        try {
            const res = await api.post('/api/v1/customer/work-details', data);
            console.log("From Api", res?.data);
            
            return res?.data;
        } catch (error) {
           console.log(error?.response);  
            throw error?.response?.data;
        }
        
}

const addCustomerPaymentDetail = async (data) => {
    try {
        const res = await api.post('/api/v1/customer/payment', data);
        return res?.data;
    } catch (error) {
        throw error?.response?.data;
    }
}


export {
    searchCustomer,
    addWorkDetailsOfCustomer, 
    addCustomerPaymentDetail
}