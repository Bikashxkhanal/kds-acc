

export const formConfig = {
    createWorkEntry : [
            {name : 'customer_id', type : 'readOnly' , required : true, readOnly : true},
            {name : 'vehicle_id', type : 'text' , required : true, min : 1},
            {name : 'title', type : 'text' , required : true},
            {name : 'quantity', type : 'number' , required : true, min : 1, max : 20},
            {name : 'quantity_unit_notation', type : 'select' , options : ['tip', 'hours', 'cubemeter'], required : true},
            {name : 'rate', type : 'number', required : true, min : 1000},
            {name : 'work_date', type : 'date', required : true}

    ],

    addNewCustomer : [
            {name : 'name' , type : 'text' , required : true , min : 3}, 
            {name : 'phone_number', type :'text', required: true, min : 10 , max : 10}, 
            {name : 'address', type : 'text', required: false}
            
    ],

    createCustomerPaymentEntry : [
        {name : 'customer_id', type : 'readOnly', required : true,  },
        {name : 'pay_amount', type : 'number', required : true , min : 1 },
        {name : 'payment_mode', type : 'select', required : true , min : 1  , options : ['cash', 'mobile banking', 'cheque'] },
        {name : 'payers_name', type : 'text', required : false   },
        {name : 'payment_date', type : 'date', required : true },

    ], 
    addStaffRemunationDetails : [
        {name : 'staff_id', type: 'readOnly', required: 'true'}, 
        {name : 'title', type: 'select', options : ['salary', 'bhatta'], required: 'true'}, 
        {name : 'discription', type: 'text', required: 'true'}, 
        {name : 'amount', type: 'number', required: 'true'}


    ], 
    addStaffPaymentDetails : [
        {name : 'staff_id', type: 'readOnly', required: 'true'}, 
        {name : 'discription', type: 'text', required: 'true'}, 
        {name : 'amount', type: 'number', required: 'true'}
    ]


};

