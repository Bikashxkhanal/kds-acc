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
const addAStaffRemunationDetails = asyncHandler(async(req, res) => {
    // console.log('here');
    const {staff_id, title, discription, amount} = req?.body;

    if(!staff_id) throw new ApiError("Staff Id is required")

    if(title?.trim() == null | discription?.trim() == null | !amount) throw new ApiError(400, "All details of stippend or payout is required")
    
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    if(amount <= 0) throw new ApiError(400, "Invalid amount, must be greater than 0")
    
    const staff = await isStaffExists({staff_id})
    if(staff.length == 0) throw new ApiError(400, "No staff with such id exist")
    
    const [result] = await connectPool.execute(
        `INSERT INTO staff_remunation_tbh (staff_id, title, discription, amount) VALUES (?,?,?,?)`, [staff_id, title, discription, amount]
    )

    return res.status(200).json(
        new ApiResponse(200, "Staff Stippend details added successfully!",{lastInsertedId : result.insertId})
    )

})

const addAStaffPayoutDetails = asyncHandler(async(req, res) => {
    // console.log('here');
    const {staff_id, discription, amount} = req?.body;

    if(!staff_id) throw new ApiError("Staff Id is required")

    if(discription?.trim() == null || !amount) throw new ApiError(400, "All details of stippend or payout is required")
    
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    if(amount <= 0) throw new ApiError(400, "Invalid amount, must be greater than 0")
    
    const staff = await isStaffExists({staff_id})
    if(staff.length == 0) throw new ApiError(400, "No staff with such id exist")
    
    const [result] = await connectPool.execute(
        `INSERT INTO staff_payment_tbh (staff_id, discription, amount) VALUES (?,?,?)`, [staff_id, discription, amount]
    )

    return res.status(200).json(
        new ApiResponse(200, "Staff payout details added successfully!",{lastInsertedId : result.insertId})
    )

})

//add payment done to staff as well salary and other benfits (money)
const getAStaffStippendAndPayout = asyncHandler(async(req, res) => {
    const {staff_id} = req?.params;

    const {page = 1, limit = 10} = req?.query;

    if(isNaN(page) || isNaN(limit)) throw new ApiError(400, "Invalid request, query must be integer");

    const finalLimit = Number(limit);
    // console.log(page);
    
    const offset =  (Number(page) -1) * finalLimit

    if(!staff_id) throw new ApiError(400, "Staff id is required")
    
    if(isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    try {
        const isStaff = await isStaffExists({staff_id})
    
        if(isStaff.length == 0) throw new ApiError(400, "No  staff exist with such id")
        
        const query = `
                        SELECT 
                            sr.date AS Date,
                            CONCAT(sr.title,' ' , sr.discription) AS Discription, 
                            NULL AS Credit, 
                            sr.amount AS Debit
                        FROM 
                            staff_remunation_tbh sr
                        WHERE 
                            sr.staff_id = ?
                        UNION ALL
                        SELECT 
                            sp.date AS Date,
                            sp.discription AS Discription,
                            sp.amount AS Credit,
                            NULL AS Debit
                        FROM 
                            staff_payment_tbh sp
                        WHERE
                            sp.staff_id = ?
                        ORDER BY date DESC 
                        LIMIT ${finalLimit} OFFSET ${offset}
                        
                    `

        const [rowsCount] = await connectPool.execute(`SELECT COUNT(*) AS rowsCount FROM (
            ${query} )AS stippendAndPayout`, [staff_id, staff_id])

        const totalRows = rowsCount?.[0]?.rowsCount;
        

        const [result] = await connectPool.execute(
            query, [staff_id, staff_id]
        )
    
        res.status(200).json(
            new ApiResponse(200, "Staff Stippend and payout details fetched successfully", {result, totalRows} )
        )
    } catch (error) {
        throw new ApiError(500, error?.message)
    }

})

 //will be returning name and id only
const getSearchedStaffs = asyncHandler(async (req, res) => {

    const { q = ''} = req?.query;
    if(!q?.trim()){
         throw new ApiError(400, "Must have search query");
    }
    // console.log("Before db call");

    const searchQuery = `SELECT id, name FROM staff WHERE LOWER(name) LIKE LOWER(?)`

    try {
        const [response] = await connectPool.execute(
                    searchQuery, [`%${q}%`]
        );
       
        return res.status(200).json(
        new ApiResponse(
            200, 
            "Staff Fetched successfully", response
        )
    )

    } catch (error) {
        console.log(error?.message); 
        throw new ApiError(500, error?.message)
    }

})

const getAllStaffs = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req?.query;

    if(isNaN(page) || isNaN(limit))  throw new ApiError(401, "Invalid request, page and limit must be a number");
    
    const offset = (Number(page) - 1) * Number(limit)
    const finalLimit = Number(limit);

    const staffDetailQuery = `SELECT id, name, 
                            phone_number,address FROM staff LIMIT ${finalLimit} OFFSET ${offset}`

    const metaDataQuery = `SELECT COUNT(*) AS staffCount FROM staff`

    try {
        
        
        const [staffDetails] = await connectPool.execute(
            staffDetailQuery
        );
        console.log("Here");
        
        
        const [metaData]  = await connectPool.execute(metaDataQuery)

        return res.status(200).json(
            new ApiResponse(
                200, 
                "Staff Details fetched successfully", 
                {
                    staffDetails, 
                    metaData
                }
            )
        )

    } catch (error) {
        throw new ApiError(500, error?.message)
    }
    
})

export{
    addAStaff,
    getAStaffPersonalDetails,
    addAStaffRemunationDetails,
    getAStaffStippendAndPayout,
    getSearchedStaffs, 
    addAStaffPayoutDetails, 
    getAllStaffs
}

