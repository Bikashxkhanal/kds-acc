import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isVehicleExists } from "./vehicle.controller.js";


const isCustomerExist = async ({customer_id, phone_number}) => {
    //returns array of [1 => 1] if exist , retuns empty array if not

    //undefined should be handled
    if(customer_id === undefined){
        customer_id = null
    }

    if(phone_number === undefined){
        phone_number = null
    }

    const [result] =  await connectPool.execute(
        `SELECT 1 FROM customer_personal_details_tbh WHERE id = ? OR phone_number = ?` , [customer_id, phone_number]
    );
    // console.log(result);
    return result
    
}

const searchCustomer = asyncHandler(async (req, res) => {
   const {q = ""} = req?.query;
   const query = q;

   if(!query?.trim()){
    throw new ApiError("Search params connot be empty");
   }

   const searchQuery = `SELECT id, name FROM customer_personal_details_tbh WHERE LOWER(name) LIKE LOWER(?)`;

   try {
    const [result] = await connectPool.execute(searchQuery, [`%${query}%`]);
      
    return res.status(200).json(
        new ApiResponse(200, "Search successfull", result)
    )
    
   } catch (error) {
     throw new ApiError(500, error?.message);
   }
    
})

const getACustomer = asyncHandler(async (req, res) => {
    // console.log("Customer get");
    
    const { customerId } = req.params;
      

    if (!customerId ) {
        throw new ApiError(400, "Customer Id is required");
    }

    if(isNaN(customerId)){
        throw new ApiError(400, "Add valid customer Id");
    }

    const [result] = await connectPool.execute(
        `SELECT * FROM customer_personal_details_tbh WHERE id = ?`,
        [customerId]
    );

    return res.status(200).json(
        new ApiResponse(200, "Customer Details fetched successfully", result)
    );
});

const getAllCustomers = asyncHandler(async (req, res, next) => {
    const {page , limit } = req?.query;
   
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) ||15;


    // console.log(typeof(pageNum), typeof(limitNum));
    
    const offset = (pageNum-1 ) * limitNum;
    // console.log(offset);
    

    const [rows] = await connectPool.execute(
        `SELECT * FROM customer_personal_details_tbh LIMIT ${limitNum} OFFSET ${offset}`
    )
   

    res.status(200).json(
        new ApiResponse(200, "All user fetched Successfully!", rows)
    )


})

const addACustomer = asyncHandler(async (req, res, next) => {
    // console.log("Here");
    const {name, phone_number, address } = req?.body;

    if(name?.trim() === "" || phone_number.trim() === "" || address?.trim() === ""){
        throw new ApiError(400, "All data is requied");
    }


    const [result] = await connectPool.execute(
        `INSERT INTO customer_personal_details_tbh (name, phone_number, address) VALUES
        (?, ?, ?)`, [name, phone_number, address]
    )
    // console.log(result);
    res.status(200).json(
        new ApiResponse(200, "Customer created successfully")
    )
    

})

const deactiveACustomerAccount = asyncHandler (async (req, res, next ) => {
    //must add a column status
})

const updateACustomerDetails = asyncHandler(async (req, res, next) => {
    //details to be updated should be taken
})

const addCustomerPaymentDetail = asyncHandler(async(req, res) => {
    const {customer_id, pay_amount, payment_mode, payers_name, payment_date } = req?.body;

    if(!customer_id)throw new ApiError(400, "Customer is not selected")

    if(!pay_amount || pay_amount <= 0){
        throw new ApiError(400, "Amount is required and must be greater than 0")
    }

    if(payment_mode?.trim() === "") throw new ApiError(400, "Payment mode is required")
    

    const customer = isCustomerExist({ customer_id})

    if(customer.length === 0 ){
        throw new ApiError(400, "Invalid customer id");
    }
    console.log(customer);

    const [result] = await connectPool.execute(
        `INSERT INTO customer_payment_details_tbh (customer_id, pay_amount, payment_mode, payers_name, payment_date) VALUES (?, ?, ?, ?, ?)` , [customer_id, pay_amount, payment_mode, payers_name, payment_date]
    )
    
    console.log(result);

    return res.status(200).json(
        new ApiResponse(
            200,  
            "Customer payment details added successfully!",
            result
        )
    )
    
})

const getACustomerPaymentDetails = asyncHandler(async(req, res) => {
    const {customer_id} = req?.params;

    if(!customer_id) throw new ApiError(400, "Customer Id is required")

    const customer = isCustomerExist({customer_id : customer_id})

    if(customer.length === 0 ){
        throw new ApiError(400, "Invalid customer id");
    }
    
    const [result] = await connectPool.execute(
        `SELECT * FROM customer_payment_details_tbh WHERE customer_id = ?`, [customer_id]
    )

    return res.status(200).json(
        new ApiResponse(
            200, "Customer payments data fetched successfully!", 
            result
        )

    )

})

const addCustomerWorkDetails = asyncHandler(async(req, res) => {
    //update it for multiple insertion at once
    const {customer_id, vehicle_id, title, quantity, quantity_unit_notation, rate, work_date} = req?.body;

    if(!customer_id) throw new ApiError(400, "Customer Id is required")
    
    if(!vehicle_id) throw new ApiError(400, "Vehicle Id is required")
    
    const f_work_date = work_date ?? null;

    console.log(customer_id, vehicle_id, title, quantity, quantity_unit_notation, rate, typeof f_work_date);

    if(title == null || !quantity || quantity_unit_notation == null || !rate ) throw new ApiError(400, "All work details of customer is required");

    

    const customer = await isCustomerExist({customer_id})

    if(customer.length == 0) throw new ApiError(400, "Invalid customer Id");

    // console.log("here");
    

    const vehicle =await isVehicleExists({vehicle_id});
    
    
    // console.log(vehicle);
    
    if(vehicle.length == 0) throw new ApiError(400, "Invalid Vehicle Id")
    

    if(quantity <= 0) throw new ApiError(400, "Quantity must be greater than 0")

    if(rate <= 0) throw new ApiError(400, "rate must be greater than 0")
    
    const [result]  = await connectPool.execute(
        `INSERT INTO customer_work_details_tbh (customer_id, vehicle_id, title, quantity, quantity_unit_notation, rate, work_date) VALUES (?,?,?,?,?,?,?)`, [customer_id, vehicle_id, title, quantity, quantity_unit_notation, rate, f_work_date]
    );

    return res.status(200).json(
        new ApiResponse(200, "Customer work details added successfully")
    )
    
})

const getCustomerWorkDetails = asyncHandler(async(req, res) => {
    const {customer_id} = req?.params;

    if(!customer_id) throw new ApiError(400, "Customer Id is requied")

    const customer =await isCustomerExist({customer_id});
    if(customer.length ==0) throw new ApiError(400, "Invalid customer id")
    
    const [result] = await connectPool.execute(
        `SELECT customer_id, vehicle_id, title, quantity,
        quantity_unit_notation, rate, work_date FROM customer_work_details_tbh
        WHERE customer_id = ?`, [customer_id]
    );

    console.log(result);

    res.status(200).json(
       new ApiResponse(200, "Customer Work Details fetched successfully", result)

    )
    

})

export {
    addACustomer,
    getACustomer,
    getAllCustomers,
    deactiveACustomerAccount,
    updateACustomerDetails,
    addCustomerPaymentDetail,
    getACustomerPaymentDetails,
    addCustomerWorkDetails,
    getCustomerWorkDetails,
    searchCustomer
}