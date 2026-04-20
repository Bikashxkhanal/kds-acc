import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getACustomer = asyncHandler(async (req, res) => {
    console.log("Customer get");
    
    const { customerId } = req.params;
      

    if (!customerId ) {
        throw new ApiError(400, "Customer Id is required");
    }

    if(typeof(customerId) !== 'int'){
        throw new ApiError(400, "Id must be valid");
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


    console.log(typeof(pageNum), typeof(limitNum));
    
    const offset = (pageNum-1 ) * limitNum;
    console.log(offset);
    

    const [rows] = await connectPool.execute(
        `SELECT * FROM customer_personal_details_tbh LIMIT ${limitNum} OFFSET ${offset}`
    )
   

    res.status(200).json(
        new ApiResponse(200, "All user fetched Successfully!", rows)
    )


})

const addACustomer = asyncHandler(async (req, res, next) => {
    console.log("Here");
    const {name, phone_number, address } = req?.body;

    if(name?.trim() === "" || phone_number.trim() === "" || address?.trim() === ""){
        throw new ApiError(400, "All data is requied");
    }

    const [result] = await connectPool.execute(
        `INSERT INTO customer_personal_details_tbh (name, phone_number, address) VALUES
        (?, ?, ?)`, [name, phone_number, address]
    )
    console.log(result);
    res.status(200).json(
        new ApiResponse(200, "Customer created successfully")
    )
    

})

const deactiveACustomerAccount = asyncHandler (async (req, res, next ) => {
    //must add a column status
})

const updateACustomerDetails = asyncHandler(async (req, res, next) => {
    //details to be updated
})

export {
    addACustomer,
    getACustomer,
    getAllCustomers,
    deactiveACustomerAccount,
    updateACustomerDetails
}