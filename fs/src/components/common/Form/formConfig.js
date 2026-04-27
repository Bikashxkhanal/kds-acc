

export const formConfig = {
    createWorkEntry : [
            {name : 'customer_id', type : 'readOnly' , required : true, readOnly : true},
            {name : 'vehicle_id', type : 'text' , required : true},
            {name : 'title', type : 'text' , required : true},
            {name : 'quantity', type : 'number' , required : true, min : 1, max : 20},
            {name : 'quanity_unit_notation', type : 'select' , options : ['tip', 'hours', 'cubemeter'], required : true},
            {name : 'rate', type : 'number', required : true, min : 1000},
            {name : 'work_date', type : 'date', required : true}

    ],

    addNewCustomer : [
            {name : 'name' , type : 'text' , required : true , min : 3}, 
            {name : 'phone_number', type :'text', required: true, min : 10 , max : 10}, 
            {name : 'address', type : 'text', required: false}
            
    ],


};

