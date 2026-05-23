import connectPool from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import puppeteer from "puppeteer";

const getAStaffPersonalDtls = async (staff_id) => {
    try {
       const [details] = await connectPool.execute(
        `SELECT * FROM staff WHERE id = ? `, [staff_id]
    );

  return details?.[0]
    
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
}

// this function will return stippend and payment details as well as total row count of the stippend and payment of a customer
const getAStaffStippendAndPaymentDetailsAndTotalRowCount = async (staff_id, {limit , offset, startDate, endDate}) => {
    try {

        let query = `
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
    
                    `
        if(startDate && endDate){
            query += ` AND date BETWEEN ${startDate} AND ${endDate} ORDER BY date DESC`
        }
        if(limit && offset && startDate && endDate){
            query += ` LIMIT ${limit} OFFSET ${offset}`
        }

        if(limit && offset && (!startDate && !endDate)){
            query += `ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`
        }

        const [rowsCount] = await connectPool.execute(`SELECT COUNT(*) AS rowsCount FROM (
            ${query} )AS stippendAndPayout`, [staff_id, staff_id])

        const totalRows = rowsCount?.[0]?.rowsCount;
        
        const [result] = await connectPool.execute(
            query, [staff_id, staff_id]
        )

        return {result, totalRows}
        
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
}



const isStaffExists = async({phone_number, staff_id} = {}) =>{
    if(phone_number === undefined) phone_number = null
    if(staff_id === undefined) staff_id = null
    
    
    if(phone_number === null && staff_id === null) throw new ApiError(400, "Staff Id is required")

    const [staff] = await connectPool.execute(
        `SELECT 1 FROM staff WHERE id = ? OR phone_number = ? `, [staff_id, phone_number]
    )
   
   return staff?.length == 0 ? false : true
}

const addAStaff = asyncHandler(async(req, res) => {
    const {name, phone_number, address, dob, salary} = req.body;

    if(name?.trim() == null || phone_number?.trim() == null || address?.trim() == null || dob?.trim() == null || !salary) throw new ApiError(400, "All details of staff is required")
    
    if(salary <= 0) throw new ApiError(400, "Salary Cannot be negative or Zero");

    const isExists = await isStaffExists({phone_number})
    if(isExists ==  false) throw new ApiError(400, "Phone number already exist")

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
    
    const isExists = await isStaffExists({staff_id})
    if(isExists == false) throw new ApiError(400, "Staff with such id doesnot exist")
    
    const staffDetails = await getAStaffPersonalDtls(staff_id);
    // console.log(staffDetails);
    
    return res.status(200).json(
        new ApiResponse(200, "Staff Details fetched successfully!", staffDetails)
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
    
    const isExists = await isStaffExists({staff_id})
    if(isExists == false) throw new ApiError(400, "No staff with such id exist")
    
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
        
        const {result, totalRows} = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(staff_id, {limit: finalLimit , offset : offset});
    
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

const getAStaffDownloadPreviewDetails = asyncHandler(async (req, res) => {
    try {
        const {staff_id} = req?.params;
        const {startDate , endDate} = req?.query;

        if(!startDate?.trim() || !endDate?.trim()){
            throw new ApiError(400, "date range must be selected")
        }

        // console.log(startDate);
        
        const staffDetails = await getAStaffPersonalDtls(staff_id); 
        
        
        const {result, rowsCount} = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(staff_id, {startDate: startDate, endDate : endDate});

        return res.status(200).json(
            new ApiResponse(
                200, "preview data fetched successfully", 
                {metaData : staffDetails, tableData : result}
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

const downlaodAStaffStippendAndPayoutDetailsPDF  = asyncHandler(async (req, res) => {

    const {staff_id} = req?.params;
    console.log("Inside download");
    
    
    // console.log(req?.params);
    
    const { from,  to} = req?.query;
    console.log(req?.query);
    

    if(!staff_id?.trim() || staff_id?.trim() === ':staff_id') throw new ApiError(400, "Staff must be selected");

    if(!from?.trim() || !to?.trim()) throw new ApiError(400, "Both start and end date are required");

    try {

        const isExists = await isStaffExists({staff_id : staff_id});
        // console.log(isExists);
        
        if(isExists == false) throw new ApiError(400, "Invalid staff ID")

        const staffDetails = await getAStaffPersonalDtls(staff_id);

        console.log(staffDetails);
        

        const {result : staffWorkAndPayoutDetails, totalRows} = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(staff_id , {startDate : from , endDate : to})


        function getFinalValue(data){
            const values = []
            for (let i = 0; i< data.length ; i++){
                let sum = 0;
            for(let j = i ; j < data.length; j++){
                    sum += data[j].Credit - data[j].Debit
            } 
            values.push(sum);
            }
            return values
        }

        let tableHeaders = null;
        if(staffWorkAndPayoutDetails?.length > 0){
            const calculatedTotalStepByStep = getFinalValue(staffWorkAndPayoutDetails)
            // console.log(calculatedTotalStepByStep);
        
        staffWorkAndPayoutDetails?.forEach((eachData, idx) =>eachData.Total = calculatedTotalStepByStep[idx]);
         tableHeaders =  Object.keys(staffWorkAndPayoutDetails?.[0]);
        }

          const htmlTemplate = `
                <html>
                <head>
                <style>
                    /* General page styling for PDF */
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            color: #333;
                            margin: 20px;
                            text-align : center
                            
                        }

                        .customer-container{
                            width: 100%;
                            display : flex;
                            flex-direction : column;
                            gap : 3px;
                        }

                        #customer-name{
                            font-size : 16px;
                            font-weight : bold;
                        }
                        
                        .customer-oth-details {
                               width: 100%;
                                text-align: center;
                                display: flex;
                                flex-direction: row;
                                justify-content: around;
                                
                               
                            }

                        .customer-oth-details span{
                            width : 100%;
                            margin-top : 5px;
                        }


                        /* Table container */
                        .table-container {
                            width: 100%;
                            margin-top: 20px;
                        }

                        /* Table styling */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed; /* important for PDF */
                        }

                   
                            th:nth-child(2),
                            td:nth-child(2) {
                                width: 35%;
                            }

                           
                            th:nth-child(1),
                            td:nth-child(1) {
                                width: 15%;
                            }

                            th:nth-child(3),
                            td:nth-child(3) {
                                width: 16%;
                            }

                            th:nth-child(4),
                            td:nth-child(4) {
                                width: 16%;
                            }
                            th:nth-child(5),
                            td:nth-child(5) {
                                width: 18%;
                            }

                        /* Table header */
                        thead {
                            background-color: #f2f2f2;
                        }

                        thead th {
                            font-weight: bold;
                            text-align: left;
                            padding: 10px;
                            border: 1px solid #ccc;
                        }

                        /* Table body */
                        tbody td {
                            padding: 8px 10px;
                            border: 1px solid #ccc;
                            word-wrap: break-word; /* prevent overflow */
                        }

                        /* Alternate row shading */
                        tbody tr:nth-child(even) {
                            background-color: #fafafa;
                        }

                        /* Footer (if needed) */
                        tfoot td {
                            font-weight: bold;
                            padding: 10px;
                            border: 1px solid #ccc;
                            background-color: #f9f9f9;
                        }

                        /* Alignment helpers */
                        .text-center {
                            text-align: center;
                        }

                        .text-right {
                            text-align: right;
                        }

                        /* Prevent page break inside rows */
                        tr {
                            page-break-inside: avoid;
                        }

                        /* Optional: Header repeat on new pages */
                        thead {
                            display: table-header-group;
                        }

                        tfoot {
                            display: table-footer-group;
                        }
                </style>
                
                </head>
                    <body>
                    <h1>REPORT</h1>
                    <div class='customer-container' >
                    <div id='customer-name' > <span>${staffDetails?.name?.toUpperCase()} </span> </div>
                    <div class='customer-oth-details' >
                    <div>
                    <span>Phone Number ${staffDetails?.phone_number} </span> 
                    <span>Address ${staffDetails?.address} </span> 
                    </div>
                    <div>

                    <span>DOB ${ staffDetails?.dob} </span> 
                    <span>Salary ${staffDetails?.salary} </span> 
                    </div>
                    </div>
                    </div>
                    <p>From ${from} To ${to} </p>
                   
                    ${staffWorkAndPayoutDetails?.length == 0 ? `<p>No data to show for selected range </p>` : `
                           <table>
                        <thead>
                                <tr>
                                    ${
                                    tableHeaders.map((header) => (
                                        `<th>${header} </th> `
                                    ))
                                    }
                                
                                </tr>
                        
                        </thead>
                        
                        <tbody>
                            
                       ${
                            staffWorkAndPayoutDetails?.map((eachData) => (
                                `<tr>
                                    <td>${ new Date(eachData.date).toLocaleDateString("en-NP")}</td>
                                    <td class="discription" >${eachData.Discription}</td>
                                    <td>${eachData.Credit ?? '-'}</td>
                                    <td>${eachData.Debit ?? '-'}</td>
                                    <td>${eachData.Total }</td>
                                </tr>`
                            ))
                        } 

                         </tbody>
                    
                    </table>
                        
                        
                        `}
                 
                    </body>
                
                </html>

        `

        const browser = await puppeteer.launch();
        const page = await browser.newPage()
                    await page.setContent(htmlTemplate);
        
                    const pdf = await page.pdf(
            {
                format: 'A4',
                printBackground: true,
                displayHeaderFooter : true,
                 footerTemplate: `
                        <div style="
                        width: 100%;
                        font-size: 10px;
                        padding: 0 10px;
                        text-align: center;
                        ">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                        </div>
                    `,
                margin: {
                    top: '5mm',
                    bottom: '10mm',
                    left: '10mm',
                    right: '10mm'
                }
        });

        await browser.close();
        res.set({
            "Content-Type" : "application/pdf",
            "Content-Disposition" : "attachment; filename=staff_account_details.pdf"
        })

        res.status(200).send(pdf);

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
    getAllStaffs,
    getAStaffDownloadPreviewDetails,
    downlaodAStaffStippendAndPayoutDetailsPDF
}

