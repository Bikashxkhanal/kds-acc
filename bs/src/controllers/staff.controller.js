import connectPool from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const isStaffExists = async({phone_number, staff_id}) =>{
    if(phone_number === undefined) phone_number = null
    if(staff_id === undefined) staff_id = null

    const [staff] = await connectPool.execute(
        `SELECT 1 FROM staff WHERE id = ? OR phone_number = ? `, [staff_id, phone_number]
    )
    return staff;
}

const addAStaff = asyncHandler(async(req, res) => {
    const {name, phone_number, address, dob, salary} = req.body;

    if(name?.trim() == null || phone_number?.trim() == null || address?.trim() == null || dob?.trim() == null || !salary) throw new ApiError(400, "All details of staff is required")
    
    if(salary <= 0) throw new ApiError(400, "Salary Cannot be negative or Zero");

    const staff =await isStaffExists({phone_number})
    if(staff.length !== 0) throw new ApiError(400, "Phone number already exist")

    const [result] = await connectPool.execute(
        `INSERT INTO staff (name, phone_number, address, dob, salary) VALUES (?,?,?,?,?)`, [name, phone_number, address, dob, salary]
    )

    return res.status(200).json(
        new ApiResponse(200, "Staff addeed successfully", {lastInsertedId : result?.insertId})
    )
    
})

// const getAllStaffs = asyncHandler(async(req, res) => {})

const getAStaffPersonalDetails = asyncHandler(async(req, res) => {

    const {staff_id} = req?.params;

    if(!staff_id) throw new ApiError(400, "Staff id is required")
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")
    
    const staff = await isStaffExists({staff_id})
    if(staff.length == 0) throw new ApiError(400, "Staff with such id doesnot exist")
    
    const staffDetails = await connectPool.execute(
        `SELECT * FROM staff WHERE id = ? `, [staff_id]
    );
    
    return res.status(200).json(
        new ApiResponse(200, "Staff Details fetched successfully!", staffDetails?.[0])
    )

})

//add payment done to staff as well salary and other benfits (money)
const addAStaffStippendAndPayout = asyncHandler(async(req, res) => {
    // console.log('here');
    const {staff_id, title, discription, amount} = req?.body;

    if(!staff_id) throw new ApiError("Staff Id is required")

    if(title?.trim() == null | discription?.trim() == null | !amount) throw new ApiError(400, "All details of stippend or payout is required")
    
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    if(amount <= 0) throw new ApiError(400, "Invalid amount, must be greater than 0")
    
    const staff = await isStaffExists({staff_id})
    if(staff.length == 0) throw new ApiError(400, "No staff with such id exist")
    
    const [result] = await connectPool.execute(
        `INSERT INTO staff_credit_debit_tbh (staff_id, title, discription, amount) VALUES (?,?,?,?)`, [staff_id, title, discription, amount]
    )

    return res.status(200).json(
        new ApiResponse(200, "Staff Stippend or payout details added successfully!",{lastInsertedId : result.insertId})
    )

})

//add payment done to staff as well salary and other benfits (money)
const getAStaffStippendAndPayout = asyncHandler(async(req, res) => {
    const {staff_id} = req?.params;
    if(!staff_id) throw new ApiError(400, "Staff id is required")
    
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    const isStaff = await isStaffExists({staff_id})

    if(isStaff.length == 0) throw new ApiError(400, "No  staff exist with such id")
    
    const staffDetails = await connectPool.execute(
        `SELECT * FROM staff_credit_debit_tbh WHERE staff_id = ?`, [staff_id]
    );

    const stippendAndPyoutDetails = staffDetails?.[0]
    

    res.status(200).json(
        new ApiResponse(200, "Staff Stippend and payout details fetched successfully", {stippendAndPyoutDetails} )
    )

})

export{
    addAStaff,
    getAStaffPersonalDetails,
    addAStaffStippendAndPayout,
    getAStaffStippendAndPayout
}

