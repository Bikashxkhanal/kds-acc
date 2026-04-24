import api from "../axios";


const searchCustomer = async ({params , signal} = {} ) => {
        const res = await api.get('/api/v1/customer/search', {
            params: params,
            signal : signal
        })
        console.log(res?.data);
        

        return res?.data;
}


export {
    searchCustomer
}