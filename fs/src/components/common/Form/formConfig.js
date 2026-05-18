

export const formConfig = {
    createWorkEntry : [
            {name : 'customer_id', type : 'readOnly' , required : true},
            {name : 'vehicle_id', type : 'text' , required : true, min : 1},
            {name : 'title', type : 'text' , required : true},
            {name : 'quantity', type : 'number' , required : true, min : 1, max : 20, watch : true},
            {name : 'quantity_unit_notation', type : 'select' , options : ['tip', 'hours', 'cubemeter'], required : true},
            {name : 'rate', type : 'number', required : true, min : 1000, watch : true},
            {name : 'work_date', type : 'date', required : true},
            //watched = true is taken to update the value of this input, from the watch value, 
            // based on the form configuration , the watched values are only numeric and used to calculate total, if need to do something else the form logic must be reconsidered
            {name : 'total', type : 'readOnly', required : true, watched :true}

    ],

    addNewCustomer : [
            {name : 'name' , type : 'text' , required : true , min : 3}, 
            {name : 'phone_number', type :'text', required: true, min : 10 , max : 10}, 
            {name : 'address', type : 'text', required: false}
            
    ],

    createCustomerPaymentEntry : [
        {name : 'customer_id', type : 'readOnly', required : true  },
        {name : 'pay_amount', type : 'number', required : true , min : 1 },
        {name : 'payment_mode', type : 'select', required : true , min : 1  , options : ['cash', 'mobile banking', 'cheque'] },
        {name : 'payers_name', type : 'text', required : false   },
        {name : 'payment_date', type : 'date', required : true },

    ], 
    addStaffRemunationDetails : [
        {name : 'staff_id', type: 'readOnly', required: 'true', watch : false}, 
        {name : 'title', type: 'select', options : ['salary', 'bhatta'], required: 'true', watch : false}, 
        {name : 'discription', type: 'text', required: 'true', watch : false}, 
        {name : 'amount', type: 'number', required: 'true', watch : false}


    ], 
    addStaffPaymentDetails : [
        {name : 'staff_id', type: 'readOnly', required: 'true', watch : false}, 
        {name : 'discription', type: 'text', required: 'true', watch : false}, 
        {name : 'amount', type: 'number', required: 'true', watch : false, watched : false}
    ]


};

