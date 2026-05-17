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

const addStaffRemunation = async(details) => {
    try {
        const response = await api.post('/api/v1/staff/remunation' ,details );
        // console.log(response?.data);
        return response?.data;
        
    } catch (error) {
        throw error?.response?.data;
    }
}

const addStaffPayout = async (details) => {
        try {
            const response = await api.post('/api/v1/staff/payout', details)
            return response?.data;
        } catch (error) {
                throw error?.response?.data;
        }
    
}

const getAllStaffs = async({page = 1, limit = 10} = {}) => {
    try {
        const response = await api.get('api/v1/staff/all', {
            params : {
                page , 
                limit
            }
        })

        return response?.data;
    } catch (error) {
        throw error?.response?.data;
    }
}

const getAStaffDetails = async (staff_id) => {
    try {
        const response = await api.get(`/api/v1/staff/${staff_id}`);
        return response?.data;
    } catch (error) {
        throw error?.response?.data;   
    }
}

const getAStaffRemunationAndPayoutDetails = async(staff_id, {page= 1, limit = 10}) => {
    try {
        const response = await api.get(`/api/v1/staff/${staff_id}/remu-payout-details`, 
            {
                params : {
                page : page,
                limit : limit
            }}
        )
        return response?.data;
    } catch (error) {
        throw error?.response?.data;
    }
} 

const getAStaffPreviewDetails = async(staff_id, {startDate , endDate}) => {
    try {
        const res = await api.get(`/api/v1/staff/${staff_id}/preview`,{
            params : {
                startDate : startDate, 
                endDate : endDate
            }
        } )

        console.log(res?.data);
        return res?.data;
        
    } catch (error) {
        throw error?.response?.data
    }
}

const downloadStaffDetailsPDF = async (staff_id, {startDate, endDate}) => {
        try {
            const res = await api.get(`/api/v1/staff/${staff_id}/download`, {
                params : {
                    from : startDate, 
                    to : endDate
                }, 
                responseType : 'blob'
            })
           const blob = new Blob(
            [res?.data], 
           { type : 'application/pdf'}
           )
           
           const fileUrl = URL.createObjectURL(blob);
           window.open(fileUrl);
           

        } catch (error) {
            throw new Error("Failed to download pdf");
        }
}

export {
    searchStaffByName,
    addStaffRemunation, 
    addStaffPayout, 
    getAllStaffs,
    getAStaffDetails, 
    getAStaffRemunationAndPayoutDetails, 
    getAStaffPreviewDetails, 
    downloadStaffDetailsPDF
}