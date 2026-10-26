import { asyncHandler } from "../utils/asyncHandler.js";
import connectMongo from "../db/mongo.js";
import Customer from "../models/customer.model.js";
import CustomerPayment from "../models/customerPayment.model.js";
import CustomerWork from "../models/customerWork.model.js";
import { getNextSequence } from "../utils/autoIncrement.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import { formatBS } from '../utils/bsDate.js';
import { buildActivityDiff } from '../services/activityLog.js';

const normalizePhoneDigits = (value) => String(value || '').replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const customerTypes = { private: ['private', 'Private'], governmental: ['governmental', 'Governmental'], ngo: ['ngo', 'NGO'] };

const getCustomerPerDetails = async (customerId) => {
    await connectMongo();
    const customer = await Customer.findOne({ id: Number(customerId) }).lean();
    return customer ? [customer] : [];
}

const humanizeLabel = (value = "") => String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isCustomerExist = async ({ customer_id, phone_number }) => {
    await connectMongo();

    const conditions = [];
    if (customer_id != null) conditions.push({ id: Number(customer_id) });
    if (phone_number != null) conditions.push({ phone_number });

    if (!conditions.length) return [];

    const customer = await Customer.findOne({ $or: conditions }).select("id").lean();
    return customer ? [1] : [];
}

const searchCustomer = asyncHandler(async (req, res) => {
   const q = normalizePhoneDigits(req?.query?.q || '');

   if (!q?.trim()) {
    throw new ApiError("Search params connot be empty");
   }

   await connectMongo();
   const result = await Customer.find({
       $or: [{ name: { $regex: escapeRegex(q.trim()), $options: "i" } }, { phone_number: { $regex: escapeRegex(q.trim()), $options: "i" } }]
   }).select("id name phone_number").lean();

   return res.status(200).json(
        new ApiResponse(200, "Search successfull", result)
   )
})

const getACustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    if (!customerId) {
        throw new ApiError(400, "Customer Id is required");
    }

    if (isNaN(customerId)) {
        throw new ApiError(400, "Add valid customer Id");
    }

    const result = await getCustomerPerDetails(customerId);

    return res.status(200).json(
        new ApiResponse(200, "Customer Details fetched successfully", result)
    );
});

const getAllCustomers = asyncHandler(async (req, res) => {
    const { page, limit, customer_type, location = "" } = req?.query;
    const q = normalizePhoneDigits(req?.query?.q || '');

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 15;
    const offset = (pageNum - 1) * limitNum;

    await connectMongo();

    const query = {};
    if (q.trim()) query.$or = [{ name: { $regex: escapeRegex(q.trim()), $options: "i" } }, { phone_number: { $regex: escapeRegex(q.trim()), $options: "i" } }];
    const typeCode = String(customer_type || '').trim().toLowerCase();
    if (typeCode && typeCode !== 'all' && !customerTypes[typeCode]) throw new ApiError(400, 'Select a valid customer type filter');
    if (typeCode && customerTypes[typeCode]) {
        query.customer_type = typeCode === 'private'
            ? { $in: [...customerTypes[typeCode], null] }
            : { $in: customerTypes[typeCode] };
    }
    if (String(location).trim()) query.address = { $regex: escapeRegex(String(location).trim().slice(0, 100)), $options: "i" };
    const totalCustomers = await Customer.countDocuments(query);
    const metaData = [{ totalCustomers }];

    const rows = await Customer.aggregate([
        { $match: query },
        {
            $lookup: {
                from: "customerpayments",
                localField: "id",
                foreignField: "customer_id",
                as: "payments"
            }
        },
        {
            $lookup: {
                from: "customerworks",
                localField: "id",
                foreignField: "customer_id",
                as: "works"
            }
        },
        {
            $addFields: {
                Total_Paid_Amt: {
                    $ifNull: [{ $sum: "$payments.pay_amount" }, 0]
                },
                Total_Work_Amt: {
                    $ifNull: [{ $sum: "$works.total" }, 0]
                }
            }
        },
        {
            $addFields: {
                Payable: { $subtract: ["$Total_Work_Amt", "$Total_Paid_Amt"] }
            }
        },
        {
            $project: {
                id: 1,
                name: 1,
                phone_number: 1,
                address: 1,
                customer_type: { $switch: { branches: [
                    { case: { $in: ["$customer_type", ["private", "Private", null]] }, then: "private" },
                    { case: { $in: ["$customer_type", ["governmental", "Governmental"]] }, then: "governmental" },
                    { case: { $in: ["$customer_type", ["ngo", "NGO"]] }, then: "ngo" }
                ], default: "private" } },
                Total_Paid_Amt: 1,
                Total_Work_Amt: 1,
                Payable: 1
            }
        },
        { $skip: offset },
        { $limit: limitNum }
    ]);

    res.status(200).json(
        new ApiResponse(200, "All user fetched Successfully!", { rows, metaData })
    )
})

const addACustomer = asyncHandler(async (req, res) => {
    const { name, phone_number, address, customer_type = "private" } = req?.body;
    const normalizedType = String(customer_type).trim().toLowerCase();

    if (String(name || "").trim().length < 3) throw new ApiError(400, "Customer name must be at least 3 characters");

    if (!customerTypes[normalizedType]) throw new ApiError(400, "Select a valid customer type");
    if (!/^\d{10}$/.test(String(phone_number || ""))) throw new ApiError(400, "Phone number must contain 10 digits");
    await connectMongo();
    const id = await getNextSequence("customer");
    await Customer.create({ id, name, phone_number, address, customer_type: normalizedType });

    res.status(200).json(
        new ApiResponse(200, "Customer created successfully")
    )
})

const deactiveACustomerAccount = asyncHandler(async (req, res, next) => {
    //must add a column status
})

const updateACustomerDetails = asyncHandler(async (req, res, next) => {
    const customerId = Number(req.params.customerId);
    const { name, phone_number, address = "", customer_type = "private" } = req.body;
    const normalizedType = String(customer_type).trim().toLowerCase();
    if (!Number.isInteger(customerId) || String(name || "").trim().length < 3 || !/^\d{10}$/.test(String(phone_number || "")) || !customerTypes[normalizedType]) throw new ApiError(400, "Enter a valid name, 10 digit phone number, and customer type");
    await connectMongo();
    const before = await Customer.findOne({ id: customerId }).lean();
    const customer = await Customer.findOneAndUpdate({ id: customerId }, { name: name.trim(), phone_number, address, customer_type: normalizedType }, { new: true, runValidators: true });
    if (!customer) throw new ApiError(404, "Customer not found");
    req.activityDetails = { entityId: String(customerId), entityName: customer.name, diff: buildActivityDiff(before, customer.toObject()) };
    return res.status(200).json(new ApiResponse(200, "Customer updated successfully", customer));
})

const addCustomerPaymentDetail = asyncHandler(async (req, res) => {
    const { customer_id, pay_amount, payment_mode, payers_name, payment_date } = req?.body;

    if (!customer_id) throw new ApiError(400, "Customer is not selected")

    if (!pay_amount || pay_amount <= 0) {
        throw new ApiError(400, "Amount is required and must be greater than 0")
    }

    if (payment_mode?.trim() === "") throw new ApiError(400, "Payment mode is required")

    const customer = await isCustomerExist({ customer_id })

    if (customer.length === 0) {
        throw new ApiError(400, "Invalid customer id");
    }

    await connectMongo();
    const id = await getNextSequence("customerPayment");
    const result = await CustomerPayment.create({
        id,
        customer_id: Number(customer_id),
        pay_amount: Number(pay_amount),
        payment_mode,
        payers_name,
        payment_date: new Date(payment_date)
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Customer payment details added successfully!",
            { insertId: result.id, affectedRows: 1 }
        )
    )
})

const getACustomerPaymentDetails = asyncHandler(async (req, res) => {
    const { customer_id } = req?.params;

    if (!customer_id) throw new ApiError(400, "Customer Id is required")

    const customer = await isCustomerExist({ customer_id })

    if (customer.length === 0) {
        throw new ApiError(400, "Invalid customer id");
    }

    await connectMongo();
    const result = await CustomerPayment.find({ customer_id: Number(customer_id) }).lean();

    return res.status(200).json(
        new ApiResponse(
            200, "Customer payments data fetched successfully!",
            result
        )
    )
})

const addCustomerWorkDetails = asyncHandler(async (req, res) => {
    const { customer_id, vehicle_id, vehicle_type = "Tractor", description = "", title, quantity, quantity_unit_notation, rate, work_date, total } = req?.body;

    if (!customer_id) throw new ApiError(400, "Customer Id is required")
    if (!["Tractor", "JCB", "Tipper"].includes(vehicle_type)) throw new ApiError(400, "Select a valid vehicle type")

    const f_work_date = work_date ?? null;

    if (title == null || !quantity || quantity_unit_notation == null || !rate || !total) {
        throw new ApiError(400, "All work details of customer is required");
    }

    const customer = await isCustomerExist({ customer_id })
    if (customer.length == 0) throw new ApiError(400, "Invalid customer Id");

    if (quantity <= 0) throw new ApiError(400, "Quantity must be greater than 0")
    if (rate <= 0) throw new ApiError(400, "rate must be greater than 0")

    await connectMongo();
    const id = await getNextSequence("customerWork");
    await CustomerWork.create({
        id,
        customer_id: Number(customer_id),
        vehicle_id: vehicle_id ? Number(vehicle_id) : null,
        vehicle_type,
        description: String(description).trim().slice(0, 240),
        title,
        quantity: String(quantity),
        quantity_unit_notation,
        rate: Number(rate),
        work_date: new Date(f_work_date),
        total: Number(total)
    });

    return res.status(200).json(
        new ApiResponse(200, "Customer work details added successfully")
    )
})

const getCustomerWorkDetails = asyncHandler(async (req, res) => {
    const { customer_id } = req?.params;

    if (!customer_id) throw new ApiError(400, "Customer Id is requied")

    const customer = await isCustomerExist({ customer_id });
    if (customer.length == 0) throw new ApiError(400, "Invalid customer id")

    await connectMongo();
    const result = await CustomerWork.find({ customer_id: Number(customer_id) })
        .select("customer_id vehicle_id vehicle_type description title quantity quantity_unit_notation rate work_date")
        .lean();

    res.status(200).json(
       new ApiResponse(200, "Customer Work Details fetched successfully", result)
    )
})

const buildCustomerWorkPaymentRows = (payments = [], works = []) => {
    const paymentRows = payments.map((pd) => ({
        date: pd.payment_date,
        discription: `Payer: ${pd.payers_name} | Mode: ${pd.payment_mode}`,
        Credit: pd.pay_amount,
        Debit: 0
    }));

    const workRows = works.map((wd) => ({
        date: wd.work_date,
        discription: `${wd.title} | ${wd.vehicle_type || `Vehicle No: ${wd.vehicle_id}`} | ${wd.description ? `${wd.description} | ` : ""}Qty: ${wd.quantity} ${wd.quantity_unit_notation} | Rate: ${wd.rate}`,
        Credit: 0,
        Debit: wd.total
    }));

    return [...paymentRows, ...workRows].sort((a, b) => new Date(b.date) - new Date(a.date));
};

const getACustomerWorkAndPaymentDetails = asyncHandler(async (req, res) => {
     const { customer_id } = req?.params;
     if (!customer_id) throw new ApiError(400, "Customer Id is requied")

    const { page = 1, limit = 10 } = req?.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

try {
        const customer = await isCustomerExist({ customer_id });
        if (customer.length == 0) throw new ApiError(400, "Invalid customer id")

        await connectMongo();
        const cid = Number(customer_id);

        const [payments, works] = await Promise.all([
            CustomerPayment.find({ customer_id: cid }).lean(),
            CustomerWork.find({ customer_id: cid }).lean()
        ]);

        const allRows = buildCustomerWorkPaymentRows(payments, works);
        const metaData = [{ totalRows: allRows.length }];
        const workAndPaymentDetails = allRows.slice(offset, offset + limitNum);

        return res.json(
            new ApiResponse(
                200, "All work and payment details fetched successfully", { workAndPaymentDetails, metaData }
            )
        )
} catch (error) {
    throw new ApiError(500, error?.message);
}
})

const getACustomerWorkAndPaymentDetailsByDateRange = async ({ customer_id, startDate, endDate }) => {
    if (!customer_id?.toString().trim() || isNaN(customer_id)) throw new Error("Invalid customer Id");
    if (!startDate?.trim() && !endDate?.trim()) throw new Error("Data range must be selected");

    await connectMongo();
    const cid = Number(customer_id);
    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const [payments, works] = await Promise.all([
        CustomerPayment.find({
            customer_id: cid,
            payment_date: { $gte: from, $lte: to }
        }).lean(),
        CustomerWork.find({
            customer_id: cid,
            work_date: { $gte: from, $lte: to }
        }).lean()
    ]);

    return buildCustomerWorkPaymentRows(payments, works);
}

const getACustomerPreviewData = asyncHandler(async (req, res) => {
    const { customerId: customer_id } = req?.params;
    const { from: startDate, to: endDate } = req?.query;

    try {
        const response = await getACustomerWorkAndPaymentDetailsByDateRange({ customer_id, startDate, endDate })
        const customerData = await getCustomerPerDetails(customer_id);

        return res.status(200).json(
           new ApiResponse(200,
            "Preview Data fetched successfully",
            { metaData: customerData?.[0], tableData: response })
        )
    } catch (error) {
        throw new ApiError(400, error?.message)
    }
})

const downloadWorkAndPaymentDetailsInPDF = asyncHandler(async (req, res) => {
    const { customerId: customer_id } = req?.params;
    const { from: startDate, to: endDate } = req?.query;

    try {
        const data = await getACustomerWorkAndPaymentDetailsByDateRange({ customer_id, startDate, endDate })

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

        const customerData = await getCustomerPerDetails(customer_id);

        let tableHeaders = null;
        if(data?.length > 0){
            const calculatedTotalStepByStep = getFinalValue(data)
        data?.forEach((eachData, idx) => eachData.Total = calculatedTotalStepByStep[idx]);
         tableHeaders =  Object.keys(data?.[0]);
        }

        const htmlTemplate = `
                <html>
                <head>
                <style>
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
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                        }
                            th:nth-child(2), td:nth-child(2) { width: 35%; }
                            th:nth-child(1), td:nth-child(1) { width: 15%; }
                            th:nth-child(3), td:nth-child(3) { width: 16%; }
                            th:nth-child(4), td:nth-child(4) { width: 16%; }
                            th:nth-child(5), td:nth-child(5) { width: 18%; }
                        thead { background-color: #f2f2f2; display: table-header-group; }
                        thead th {
                            font-weight: bold;
                            text-align: left;
                            padding: 10px;
                            border: 1px solid #ccc;
                        }
                        tbody td {
                            padding: 8px 10px;
                            border: 1px solid #ccc;
                            word-wrap: break-word;
                        }
                        tbody tr:nth-child(even) { background-color: #fafafa; }
                        tr { page-break-inside: avoid; }
                </style>
                </head>
                    <body>
                    <header style="border-bottom:2px solid #12355b;padding-bottom:10px;margin-bottom:14px">
                      <h2 style="margin:0;color:#12355b">KHANAL DHUWANI SEWA</h2>
                      <p style="margin:4px 0">Customer Account Report</p>
                      <small>Selected Date Range: ${startDate} to ${endDate}</small>
                    </header>
                    <div class='customer-container' >
                    <div id='customer-name' > <span>${customerData?.[0]?.name?.toUpperCase()} </span> </div>
                    <div class='customer-oth-details' >
                    <span>Phone Number ${customerData?.[0]?.phone_number} </span>
                    <span>Address ${customerData?.[0]?.address} </span>
                    </div>
                    </div>
                    <p>From ${startDate} To ${endDate} </p>
                    ${data.length == 0 ? `<p>No data to show for selected range </p>` : `
                           <table>
                        <thead>
                                <tr>
                                    ${tableHeaders.map((header) => (`<th>${humanizeLabel(header)} </th> `)).join("")}
                                </tr>
                        </thead>
                        <tbody>
                       ${data?.map((eachData) => (
                                `<tr>
                                    <td>${ formatBS(eachData.date, 'long', 'en')}</td>
                                    <td class="discription" >${eachData.discription}</td>
                                    <td>${eachData.Credit ?? '-'}</td>
                                    <td>${eachData.Debit ?? '-'}</td>
                                    <td>${eachData.Total }</td>
                                </tr>`
                            )).join("")}
                         </tbody>
                    </table>
                        `}
                    <footer style="margin-top:16px;color:#64748b;font-size:10px;display:flex;justify-content:space-between">
                      <span>Generated Date: ${formatBS(new Date(), 'long', 'en')}</span>
                      <span>Generated By: ${req.user?.name || "System User"}</span>
                    </footer>
                    </body>
                </html>
        `

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
                    await page.setContent(htmlTemplate);

        const pdf = await page.pdf({
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
            "Content-Disposition" : "attachment; filename=customer_acc_details.pdf"
        })

        res.status(200).send(pdf);

        } catch (error) {
        throw new ApiError(400, error?.message)
    }
})

const WORK_TITLES = { Tractor: ["cultivation_rotavator", "cultivation_cultivator", "boulders", "gravel", "soil", "sand", "puddling", "paral", "dhan", "others", "Cultivation Rotavator", "Cultivation Cultivator", "Boulders", "Gravel", "Soil", "Sand", "Puddling", "Paral", "Dhan", "Others"], JCB: ["excavation", "Excavation"], Tipper: ["gravel", "soil", "sand", "Gravel", "Soil", "Sand"] };
const addCustomerWorkDetailsBatch = asyncHandler(async (req, res) => {
    const entries = req.body?.entries;
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 100) throw new ApiError(400, "Provide between 1 and 100 sales entries");
    await connectMongo();
    for (const entry of entries) {
        const qty = Number(entry.quantity), rate = Number(entry.rate), vehicle = entry.vehicle_type;
        if (!Number.isInteger(Number(entry.customer_id)) || !WORK_TITLES[vehicle]?.includes(entry.title) || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(rate) || rate <= 0 || !Number.isFinite(new Date(entry.work_date).getTime()) || !["tip", "hours", "cubemeter"].includes(entry.quantity_unit_notation)) throw new ApiError(400, "A sales entry has invalid customer, title, date, quantity, unit, or rate");
        if (!(await Customer.exists({ id: Number(entry.customer_id) }))) throw new ApiError(400, "A sales entry refers to an unknown customer");
    }
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const documents = [];
            for (const entry of entries) documents.push({ id: await getNextSequence("customerWork"), customer_id: Number(entry.customer_id), vehicle_type: entry.vehicle_type, title: entry.title, description: String(entry.description || "").trim().slice(0, 240), quantity: String(entry.quantity), quantity_unit_notation: entry.quantity_unit_notation, rate: Number(entry.rate), total: Number(entry.quantity) * Number(entry.rate), work_date: new Date(entry.work_date) });
            await CustomerWork.insertMany(documents, { session });
        });
    } finally { await session.endSession(); }
    return res.status(201).json(new ApiResponse(201, "All sales entries saved successfully", { count: entries.length }));
});

export {
    addACustomer,
    getACustomer,
    getAllCustomers,
    deactiveACustomerAccount,
    updateACustomerDetails,
    addCustomerPaymentDetail,
    getACustomerPaymentDetails,
    addCustomerWorkDetails,
    addCustomerWorkDetailsBatch,
    getCustomerWorkDetails,
    searchCustomer,
    getACustomerWorkAndPaymentDetails,
    downloadWorkAndPaymentDetailsInPDF,
    getACustomerPreviewData
}
