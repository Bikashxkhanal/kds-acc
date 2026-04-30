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

const getAllCustomers = async (params) => {
    try {
        const res = await api.get('/api/v1/customer', {
            params : {page : params?.page , limit : params?.limit}
        });

        console.log(res?.data);
        return res?.data;
        
    } catch (error) {
            throw error?.response?.data;
    }
}

const getACustomerWorkAndPaymentDetails = async(customerId, page = 1) => {
   
        try {
            const response = await api.get(`/api/v1/customer/${customerId}/work-pay-details`, {
                params : {
                    page : page,
                    limit :  10
                }
            })
            console.log(response?.data);
            return response?.data?.data;
        } catch (error) {
            throw error?.response?.data
        }
}   

const getACustomerPersonalDetails = async (customerId) => {
    try {
        const response = await api.get(`/api/v1/customer/${customerId}`);
        console.log(response?.data);
        return response?.data?.data;
        
    } catch (error) {
            throw error?.response?.data;
    }
}



export {
    searchCustomer,
    addWorkDetailsOfCustomer, 
    addCustomerPaymentDetail,
    getAllCustomers,
    getACustomerWorkAndPaymentDetails,
    getACustomerPersonalDetails

}