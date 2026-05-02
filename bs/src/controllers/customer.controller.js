import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isVehicleExists } from "./vehicle.controller.js";

import puppeteer from 'puppeteer';


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
    
    const [metaData] = await connectPool.execute(
        `
        SELECT COUNT(*) AS totalCustomers FROM customer_personal_details_tbh
        `
    );

    const [rows] = await connectPool.execute(
        `SELECT 
            pr.id,
            pr.name,
            pr.phone_number,
            pr.address,
            COALESCE(py.Total_Paid_Amt, 0) AS Total_Paid_Amt,
            COALESCE(pw.Total_Work_Amt, 0) AS Total_Work_Amt,
            COALESCE(pw.Total_Work_Amt, 0) - COALESCE(py.Total_Paid_Amt, 0) AS Payable
        FROM customer_personal_details_tbh pr

        LEFT JOIN (
            SELECT customer_id, SUM(pay_amount) AS Total_Paid_Amt
            FROM customer_payment_details_tbh
            GROUP BY customer_id
        ) py ON pr.id = py.customer_id

        LEFT JOIN (
            SELECT customer_id, SUM(total) AS Total_Work_Amt
            FROM customer_work_details_tbh
            GROUP BY customer_id
        ) pw ON pr.id = pw.customer_id
                LIMIT ${limitNum} OFFSET ${offset}`
            )
        

    res.status(200).json(
        new ApiResponse(200, "All user fetched Successfully!", {rows, metaData})
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

const getACustomerWorkAndPaymentDetails = asyncHandler(async (req, res) => {

     const {customer_id} = req?.params;
     if(!customer_id) throw new ApiError(400, "Customer Id is requied")

    const { page = 1, limit = 10} = req?.query;
    
    // console.log("age" ,page);
    
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) ||10;
      

    const offset = (pageNum-1 ) * limitNum;


    const customer =await isCustomerExist({customer_id});
    if(customer.length ==0) throw new ApiError(400, "Invalid customer id")

    const [metaData] = await connectPool.execute(
        `
        SELECT COUNT(*) AS totalRows FROM 
       (SELECT 
            pd.payment_date AS date,
            CONCAT('payers name: ', pd.payers_name, ' payment mode: ', pd.payment_mode) AS discription,  pd.pay_amount AS Credit, NULL AS Debit
        FROM 
            customer_payment_details_tbh pd  
        WHERE 
            pd.customer_id = ?
        UNION ALL 

        SELECT 
            work_date AS Date,
            CONCAT( wd.title,' vehicle No: ', wd.vehicle_id,' quantity: ', wd.quantity, wd.quantity_unit_notation,' @ ', wd.rate) AS discription, 
             wd.total AS Debit,
             NULL AS Credit
        FROM 
            customer_work_details_tbh wd 
        WHERE 
            wd.customer_id = ?
) AS work_pay_tbh

        `, [customer_id, customer_id]
    )

    console.log(metaData);
    
    const [workAndPaymentDetails] = await connectPool.execute(`
        SELECT 
            pd.payment_date AS date,
            CONCAT('payers name: ', pd.payers_name, ' payment mode: ', pd.payment_mode) AS discription,  pd.pay_amount AS Credit, NULL AS Debit
        FROM 
            customer_payment_details_tbh pd  
        WHERE 
            pd.customer_id = ?
        UNION ALL 

        SELECT 
            work_date AS Date,
            CONCAT( wd.title,' vehicle No: ', wd.vehicle_id,' quantity: ', wd.quantity, wd.quantity_unit_notation,' @ ', wd.rate) AS discription, 
             wd.total AS Debit,
             NULL AS Credit
        FROM 
            customer_work_details_tbh wd 
        WHERE 
            wd.customer_id = ?

        ORDER BY date DESC
        LIMIT ${limit} OFFSET ${offset} 

        `, [customer_id, customer_id]);

    return res.json(
        new ApiResponse(
            200, "All work and payment details fetched successfully", {workAndPaymentDetails, metaData}
        )
    )
    
})

const getACustomerWorkAndPaymentDetailsByDateRange = async({customer_id, startDate, endDate}) => {
    
    if(!customer_id?.trim() || isNaN(customer_id)) throw new Error("Invalid customer Id");
    
    if(!startDate?.trim() && !endDate?.trim()) throw new Error("Data range must be selected");
    console.log(startDate, endDate);
    

    const query = `
        SELECT 
            pd.payment_date AS date,
            CONCAT('payers name: ', pd.payers_name, ' payment mode: ', pd.payment_mode) AS discription,  pd.pay_amount AS Credit, NULL AS Debit
        FROM 
            customer_payment_details_tbh pd  
        WHERE 
            pd.customer_id = ? AND pd.payment_date BETWEEN ? AND ?
        UNION ALL 

        SELECT 
            work_date AS Date,
            CONCAT( wd.title,' vehicle No: ', wd.vehicle_id,' quantity: ', wd.quantity, wd.quantity_unit_notation,' @ ', wd.rate) AS discription, 
             wd.total AS Debit,
             NULL AS Credit
        FROM 
            customer_work_details_tbh wd 
        WHERE 
            wd.customer_id = ? AND wd.work_date BETWEEN ? AND ?
        ORDER BY date DESC
    `
    try {
        const [result] = await connectPool.execute(query, [customer_id,startDate, endDate, customer_id, startDate, endDate])
        return result;
    } catch (error) {
        throw new Error(error?.message);
    }
    
}

const getACustomerPreviewData = asyncHandler(async(req, res) => {
    const {customerId : customer_id} = req?.params;
    const {from : startDate, to : endDate} = req?.query;

    try {
        const response = await getACustomerWorkAndPaymentDetailsByDateRange({customerId :customer_id, startDate : startDate ,endDate : endDate})

        return res.status(200).json(
            200,
            "Preview Data fetched successfully", 
            response
        )
    } catch (error) {
        throw new ApiError(400, error?.message)
    }
})


const downloadWorkAndPaymentDetailsInPDF = asyncHandler(async (req, res) => {
    const {customerId : customer_id} = req?.params;
    const {from : startDate , to : endDate} = req?.query;

    // console.log(startDate, endDate);
    

    try {
        const data = await getACustomerWorkAndPaymentDetailsByDateRange({customer_id :customer_id, startDate :startDate,endDate: endDate})
        // console.log(data);
        

        const htmlTemplate = `
                <html>
                    <body>
                    <h1>Report</h1>
                    <p>From ${startDate} To ${endDate} </p>
                   
                    <table>
                        
                        ${data.length > 0 ? 
                            data?.map((eachData) => (
                                `<tr>
                                    <td>${eachData.date}</td>
                                    <td>${eachData.discription}</td>
                                    <td>${eachData.Credit}</td>
                                    <td>${eachData.Debit}</td>
                                </tr>`
                            )) : '<p>No data to show for selected range </p>'
                        } 
                    
                    </table>
                    </body>
                
                </html>

        `

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
             await page.setContent(htmlTemplate);

        const pdf = await page.pdf();

        await browser.close();


        res.set({
            "Content-Type" : "application/pdf",
            "Content-Disposition" : "attachment : filename=customer_acc_details.pdf"
        })

        res.send(pdf);

        } catch (error) {
        throw new ApiError(400, error?.message)
    }
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
    searchCustomer,
    getACustomerWorkAndPaymentDetails, 
    downloadWorkAndPaymentDetailsInPDF,
    getACustomerPreviewData
}