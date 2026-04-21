import { asyncHandler } from "../utils/asyncHandler.js";
import connectPool from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isCompanyExist = async({company_id}) => {
    const [result] = await connectPool.execute(
        `SELECT 1 FROM company_info WHERE id = ?`, [company_id]
    )

    return result;
}

const isBillExists = async({bill_id}) => {
    const [result] = await connectPool.execute(
        `SELECT 1 FROM billings WHERE id = ?`, [bill_id]
    )
    return result;
}

const createABill = asyncHandler(async (req, res) => {
    //general details of bill
    const {bill_issuing_company_id, customer_name, address, bill_created_date, work_completed_date } = req?.body;

    //particulars and its detail of the bill, will be array of obj [{}, {}, {}]
    const bill_info = req?.body?.bill_info;


    const new_work_completed_date = null;
    if(work_completed_date !== undefined) {
        new_work_completed_date = work_completed_date;
    }

    // must be added to add creator of the bill
    // const user = req?.user;
    // console.log(req?.body);
    
    if(!bill_issuing_company_id || customer_name?.trim() == null || address?.trim() == null || bill_created_date?.trim() == null) throw new ApiError(400, "All meta data of billings are required")

    //check for all the datas 
  bill_info?.forEach(bill => {
    if (
        !bill?.discription?.trim() || 
        !bill?.quantity || 
        !bill?.quantity_unit_notation?.trim() || 
        !bill?.rate
    ) {
        throw new ApiError(400, "Must contain all the particular details of the bill");
    }
});

    const company = await isCompanyExist({company_id : bill_issuing_company_id})
    if(company.length == 0) throw new ApiError(400 , "Invalid company id");

    const bill_info_data = []
    bill_info?.forEach(bill => {
        bill_info_data.push(Object.values(bill));
    })

    //insert into billings first 
  const connection = await connectPool.getConnection()
  try {
    await connection.beginTransaction()
    console.log("here");
    

    const [billingInsertion] = await connection.execute(`INSERT INTO billings (bill_issuing_company_id, customer_name, address, bill_created_date, work_completed_data) VALUES (?,?,?,?,?)`, [bill_issuing_company_id, customer_name, address, bill_created_date, new_work_completed_date]);

    console.log(billingInsertion?.insertId);
    
    if(billingInsertion?.insertId){
        bill_info_data.forEach((bill) => {
            if(Array.isArray(bill)){
                    bill?.unshift(billingInsertion?.insertId)
            }
            
        })
    }
    console.log(bill_info_data);
    

    await connection.query(
        `INSERT INTO bill_info (billing_id, discription, quantity, quantity_unit_notation, rate) VALUES ?`, [bill_info_data]
    );

    await connection.commit()

    return res.status(200).json(
    new ApiResponse(
        200, "Bill Created Successfully"
    )
  )

  } catch (error) {
    
        console.log(error);
      await connection.rollback()
      throw error
        
  } finally{
    connection.release()
  }


}) 


const getABillDetails = asyncHandler(async (req, res) => {
        const {billing_id} = req?.params;
        if(!billing_id) throw new ApiError(400 , "Bill id is required")

        if(isNaN(billing_id)) throw new ApiError(400, "Bill id must be a number")

        const isBill = await isBillExists({bill_id : billing_id});

        if(isBill.length == 0) throw new ApiError(400, "Invalid bill id");

         const connection = await connectPool.getConnection()

        try {

           await connection.beginTransaction()

          const [bill] = await  connection.execute(`SELECT bill_issuing_company_id, customer_name, address, bill_created_date, work_completed_data FROM billings WHERE id = ? `, [billing_id]);
          console.log(bill);
          

         const [companyInfo] = await connection.execute(
                `SELECT name, address, pan FROM company_info WHERE id  = ? `, [bill?.[0]?.bill_issuing_company_id]
         );

         console.log(companyInfo);
         

         const [bill_details] = await connection.execute(
            `SELECT * FROM bill_info WHERE billing_id = ?`, [billing_id]
            );
        console.log(bill_details);
        
        connection.commit();

         return res.status(200).json(
            new ApiResponse(200, "Bill details fetched successfully", {
                companyInfo, bill, bill_details
            })
        )

        } catch (error) {
            connection.rollback();
            throw error;
            
        }finally{
            connection.release()
        }


        
})

export {
    createABill,
    getABillDetails
}