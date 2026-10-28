import connectMongo from "../db/mongo.js";
import Staff from "../models/staff.model.js";
import StaffRemuneration from "../models/staffRemuneration.model.js";
import StaffPayment from "../models/staffPayment.model.js";
import PreviousAccountBalance from "../models/previousAccountBalance.model.js";
import { getNextSequence } from "../utils/autoIncrement.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import puppeteer from "puppeteer";
import { formatBS } from '../utils/bsDate.js';
import { buildActivityDiff } from '../services/activityLog.js';
import { parseISODate } from '../utils/isoDate.js';
import { staffOpeningRows } from '../utils/previousBalance.js';

const getAStaffPersonalDtls = async (staff_id) => {
    await connectMongo();
    const details = await Staff.findOne({ id: Number(staff_id), deletedAt: { $exists: false } }).lean();
    return details || null;
}

const buildStaffLedgerRows = (remunerations = [], payments = [], openings = []) => {
    const remuRows = remunerations.map((sr) => ({
        PaymentId: null,
        OpeningBalanceId: null,
        kind: 'remuneration',
        Receipt: '',
        Date: sr.date,
        Discription: `${sr.title} ${sr.discription || ""}`.trim(),
        Credit: null,
        Debit: sr.amount
    }));

    const payRows = payments.map((sp) => ({
        PaymentId: sp.id,
        OpeningBalanceId: null,
        kind: 'payment',
        Receipt: sp.receiptNo || '',
        Date: sp.date,
        Discription: sp.discription,
        Credit: sp.amount,
        Debit: null
    }));

    const openingRows = staffOpeningRows(openings);

    return [...remuRows, ...payRows, ...openingRows].sort((a, b) => new Date(b.Date) - new Date(a.Date));
};

const getAStaffStippendAndPaymentDetailsAndTotalRowCount = async (staff_id, { limit, offset, startDate, endDate } = {}) => {
    await connectMongo();
    const sid = Number(staff_id);

    const dateFilter = (field) => {
        if (startDate && endDate) {
            const from = parseISODate(startDate, 'startDate');
            const to = parseISODate(endDate, 'endDate');
            if (from > to) throw new ApiError(400, 'Date range is reversed', [{ field: 'endDate', code: 'date_order' }]);
            return { [field]: { $gte: from, $lt: new Date(to.getTime() + 86400000) } };
        }
        return {};
    };

    const openingDateFilter = startDate && endDate
        ? { date: { $gte: parseISODate(startDate, 'startDate'), $lt: new Date(parseISODate(endDate, 'endDate').getTime() + 86400000) } }
        : {};

    const [remunerations, payments, openings] = await Promise.all([
        StaffRemuneration.find({ staff_id: sid, ...dateFilter("date") }).lean(),
        StaffPayment.find({ staff_id: sid, ...dateFilter("date") }).lean(),
        PreviousAccountBalance.find({ partyType: 'staff', partyId: String(sid), ...openingDateFilter }).lean()
    ]);

    const allRows = buildStaffLedgerRows(remunerations, payments, openings);
    const totalRows = allRows.length;

    let result = allRows;
    if (limit != null && offset != null) {
        result = allRows.slice(offset, offset + limit);
    }

    return { result, totalRows };
}

const isStaffExists = async ({ phone_number, staff_id } = {}) => {
    await connectMongo();

    const conditions = [];
    if (staff_id != null) conditions.push({ id: Number(staff_id) });
    if (phone_number != null) conditions.push({ phone_number });

    if (!conditions.length) throw new ApiError(400, "Staff Id is required");

    const staff = await Staff.findOne({ $and: [{ $or: conditions }, { deletedAt: { $exists: false } }] }).select("id").lean();
    return Boolean(staff);
}

const addAStaff = asyncHandler(async (req, res) => {
    const staffData = validateStaffInput(req.body);
    await connectMongo();
    if (await Staff.exists({ phone_number: staffData.phone_number })) throw new ApiError(409, "Phone number already exists");
    const id = await getNextSequence("staff");
    await Staff.create({ id, ...staffData });

    return res.status(200).json(
        new ApiResponse(200, "Staff addeed successfully", { lastInsertedId: id })
    )
})

const STAFF_ROLES = ["Tractor Driver", "JCB Operator", "Tipper Driver", "Helper", "Accountant", "Manager", "Other"];
const STAFF_VEHICLES = ["Tractor", "JCB", "Tipper", "None"];
const validateStaffInput = (body = {}) => {
    const name = String(body.name || "").trim();
    const phone_number = String(body.phone_number || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const role = body.role || "Other";
    const assignedVehicle = body.assignedVehicle || "None";
    const dateOfJoining = parseISODate(body.dateOfJoining || body.dob, 'dateOfJoining');
    const noSalary = Boolean(body.noSalary);
    const salary = noSalary ? 0 : Number(body.salary);
    const paymentType = body.paymentType || "Monthly";
    const status = body.status || "Active";
    if (name.length < 2 || name.length > 100) throw new ApiError(400, "Full name must be between 2 and 100 characters");
    if (!/^\d{10}$/.test(phone_number)) throw new ApiError(400, "Phone number must contain exactly 10 digits");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Enter a valid email address");
    if (!STAFF_ROLES.includes(role) || !STAFF_VEHICLES.includes(assignedVehicle)) throw new ApiError(400, "Select a valid role and assigned vehicle");
    if (!noSalary && (!Number.isFinite(salary) || salary <= 0)) throw new ApiError(400, "Salary or daily wage must be greater than zero");
    if (!["Monthly", "Daily"].includes(paymentType) || !["Active", "Inactive"].includes(status)) throw new ApiError(400, "Select a valid payment type and status");
    const emergencyContactPhone = String(body.emergencyContactPhone || "").trim();
    if (emergencyContactPhone && !/^\d{10}$/.test(emergencyContactPhone)) throw new ApiError(400, "Emergency contact phone must contain exactly 10 digits");
    return {
        name, phone_number, email, role, assignedVehicle, address: String(body.address || "").trim().slice(0, 300),
        dob: dateOfJoining, dateOfJoining, salary, noSalary, paymentType,
        idProofType: String(body.idProofType || "").trim().slice(0, 40), idProofNumber: String(body.idProofNumber || "").trim().slice(0, 80),
        emergencyContactName: String(body.emergencyContactName || "").trim().slice(0, 100), emergencyContactPhone,
        status, notes: String(body.notes || "").trim().slice(0, 1000)
    };
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const updateAStaff = asyncHandler(async (req, res) => {
    const staffId = Number(req.params.staff_id);
    if (!Number.isInteger(staffId) || staffId <= 0) throw new ApiError(400, "Invalid staff ID");
    const staffData = validateStaffInput(req.body);
    await connectMongo();
    if (await Staff.exists({ phone_number: staffData.phone_number, id: { $ne: staffId } })) throw new ApiError(409, "Phone number already exists");
    const before = await Staff.findOne({ id: staffId, deletedAt: { $exists: false } }).lean();
    const updated = await Staff.findOneAndUpdate({ id: staffId, deletedAt: { $exists: false } }, staffData, { new: true, runValidators: true });
    if (!updated) throw new ApiError(404, "Staff member not found");
    req.activityDetails = { entityId: String(staffId), entityName: updated.name, diff: buildActivityDiff(before, updated.toObject()) };
    res.json(new ApiResponse(200, "Staff updated successfully", updated));
});

const deleteAStaff = asyncHandler(async (req, res) => {
    const staffId = Number(req.params.staff_id);
    if (!Number.isInteger(staffId) || staffId <= 0) throw new ApiError(400, "Invalid staff ID");
    await connectMongo();
    const before = await Staff.findOne({ id: staffId, deletedAt: { $exists: false } }).lean();
    const deleted = await Staff.findOneAndUpdate({ id: staffId, deletedAt: { $exists: false } }, { status: "Inactive", deletedAt: new Date() }, { new: true });
    if (!deleted) throw new ApiError(404, "Staff member not found");
    req.activityDetails = { entityId: String(staffId), entityName: deleted.name, snapshot: before };
    res.json(new ApiResponse(200, "Staff archived successfully; payment history was preserved"));
});

const getAStaffPersonalDetails = asyncHandler(async (req, res) => {
    const { staff_id } = req?.params;

    if (!staff_id) throw new ApiError(400, "Staff id is required")
    if (isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    const isExists = await isStaffExists({ staff_id })
    if (isExists == false) throw new ApiError(400, "Staff with such id doesnot exist")

    const staffDetails = await getAStaffPersonalDtls(staff_id);

    return res.status(200).json(
        new ApiResponse(200, "Staff Details fetched successfully!", staffDetails)
    )
})

const addAStaffRemunationDetails = asyncHandler(async (req, res) => {
    const { staff_id, title, discription, amount, date } = req?.body;

    if (!staff_id) throw new ApiError("Staff Id is required")

    if (title?.trim() == null || discription?.trim() == null || !amount) {
        throw new ApiError(400, "All details of stippend or payout is required")
    }

    if (isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")
    if (amount <= 0) throw new ApiError(400, "Invalid amount, must be greater than 0")

    const isExists = await isStaffExists({ staff_id })
    if (isExists == false) throw new ApiError(400, "No staff with such id exist")

    await connectMongo();
    const id = await getNextSequence("staffRemuneration");
    await StaffRemuneration.create({
        id,
        staff_id: Number(staff_id),
        title,
        discription,
        amount: Number(amount),
        date: date ? new Date(date) : new Date()
    });

    return res.status(200).json(
        new ApiResponse(200, "Staff Stippend details added successfully!", { lastInsertedId: id })
    )
})

const addAStaffPayoutDetails = asyncHandler(async (req, res) => {
    const { staff_id, discription, amount, date } = req?.body;

    if (!staff_id) throw new ApiError("Staff Id is required")

    if (discription?.trim() == null || !amount) {
        throw new ApiError(400, "All details of stippend or payout is required")
    }

    if (isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")
    if (amount <= 0) throw new ApiError(400, "Invalid amount, must be greater than 0")

    const staff = await isStaffExists({ staff_id })
    if (staff == false) throw new ApiError(400, "No staff with such id exist")

    await connectMongo();
    const id = await getNextSequence("staffPayment");
    const receiptNo = `STAFF-${String(id).padStart(6, '0')}`;
    const payment = await StaffPayment.create({
        id,
        staff_id: Number(staff_id),
        discription,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(), receiptNo, payment_mode: req.body.payment_mode || 'cash'
    });

    return res.status(200).json(
        new ApiResponse(200, "Staff payout details added successfully!", { lastInsertedId: id, receiptNo: payment.receiptNo, payment })
    )
})

const getAStaffStippendAndPayout = asyncHandler(async (req, res) => {
    const { staff_id } = req?.params;
    const { page = 1, limit = 10 } = req?.query;

    if (isNaN(page) || isNaN(limit)) throw new ApiError(400, "Invalid request, query must be integer");

    const finalLimit = Number(limit);
    const offset = (Number(page) - 1) * finalLimit

    if (!staff_id) throw new ApiError(400, "Staff id is required")
    if (isNaN(staff_id)) throw new ApiError(400, "Invalid staff id type")

    try {
        const isStaff = await isStaffExists({ staff_id })

        if (isStaff == false) throw new ApiError(400, "No staff exist with such id")

        const { result, totalRows } = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(staff_id, {
            limit: finalLimit,
            offset
        });

        res.status(200).json(
            new ApiResponse(200, "Staff Stippend and payout details fetched successfully", { result, totalRows })
        )
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

const getSearchedStaffs = asyncHandler(async (req, res) => {
    const { q = '' } = req?.query;
    if (!String(q).trim() || String(q).length > 100) throw new ApiError(400, "Search must be between 1 and 100 characters");
    const search = escapeRegExp(String(q).trim());

    await connectMongo();
    const response = await Staff.find({
        $and: [
            { $or: [{ name: { $regex: search, $options: "i" } }, { phone_number: { $regex: search, $options: "i" } }] },
            { deletedAt: { $exists: false } }
        ]
    }).select("id name phone_number role assignedVehicle status").lean();

    return res.status(200).json(
        new ApiResponse(200, "Staff Fetched successfully", response)
    )
})

const getAllStaffs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, q = "", role, status } = req?.query;

    if (!/^\d+$/.test(String(page)) || !/^\d+$/.test(String(limit)) || Number(page) < 1 || Number(limit) < 1 || Number(limit) > 100) throw new ApiError(400, "Page and limit must be valid positive numbers");

    const offset = (Number(page) - 1) * Number(limit)
    const finalLimit = Number(limit);
    if (String(q).length > 100) throw new ApiError(400, "Search query cannot exceed 100 characters");
    if (role && !STAFF_ROLES.includes(role)) throw new ApiError(400, "Invalid staff role filter");
    if (status && !["Active", "Inactive"].includes(status)) throw new ApiError(400, "Invalid staff status filter");

    await connectMongo();
    const filter = { deletedAt: { $exists: false } };
    if (String(q).trim()) {
        const search = escapeRegExp(String(q).trim());
        filter.$or = [{ name: { $regex: search, $options: "i" } }, { phone_number: { $regex: search, $options: "i" } }];
    }
    if (role === "Other") filter.$and = [{ $or: [{ role: "Other" }, { role: { $exists: false } }] }];
    else if (role) filter.role = role;
    if (status === "Inactive") filter.status = "Inactive";
    if (status === "Active") filter.$and = [...(filter.$and || []), { $or: [{ status: "Active" }, { status: { $exists: false } }] }];

    const [staffDetails, staffCount] = await Promise.all([
        Staff.find(filter)
            .select("id name phone_number address role assignedVehicle status email salary paymentType dateOfJoining")
            .sort({ name: 1 })
            .skip(offset)
            .limit(finalLimit)
            .lean(),
        Staff.countDocuments(filter)
    ]);
    const normalizedStaff = staffDetails.map((staff) => ({ ...staff, role: staff.role || "Other", assignedVehicle: staff.assignedVehicle || "None", status: staff.status || "Active" }));

    const metaData = [{ staffCount }];

    return res.status(200).json(
        new ApiResponse(200, "Staff Details fetched successfully", { staffDetails: normalizedStaff, metaData })
    )
})

const getAStaffDownloadPreviewDetails = asyncHandler(async (req, res) => {
    try {
        const { staff_id } = req?.params;
        const { startDate, endDate } = req?.query;

        if (!startDate?.trim() || !endDate?.trim()) {
            throw new ApiError(400, "date range must be selected")
        }

        const staffDetails = await getAStaffPersonalDtls(staff_id);
        const { result } = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(staff_id, { startDate, endDate });

        return res.status(200).json(
            new ApiResponse(
                200, "preview data fetched successfully",
                { metaData: staffDetails, tableData: result }
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

const downlaodAStaffStippendAndPayoutDetailsPDF = asyncHandler(async (req, res) => {
    const { staff_id } = req?.params;
    const { from, to } = req?.query;

    if (!staff_id?.trim() || staff_id?.trim() === ':staff_id') throw new ApiError(400, "Staff must be selected");
    if (!from?.trim() || !to?.trim()) throw new ApiError(400, "Both start and end date are required");

    try {
        const isExists = await isStaffExists({ staff_id });
        if (isExists == false) throw new ApiError(400, "Invalid staff ID")

        const staffDetails = await getAStaffPersonalDtls(staff_id);
        const { result: staffWorkAndPayoutDetails } = await getAStaffStippendAndPaymentDetailsAndTotalRowCount(
            staff_id,
            { startDate: from, endDate: to }
        )

        function getFinalValue(data){
            const values = []
            for (let i = 0; i< data.length ; i++){
                let sum = 0;
            for(let j = i ; j < data.length; j++){
                    sum += (data[j].Credit || 0) - (data[j].Debit || 0)
            }
            values.push(sum);
            }
            return values
        }

        let tableHeaders = null;
        if (staffWorkAndPayoutDetails?.length > 0) {
            const calculatedTotalStepByStep = getFinalValue(staffWorkAndPayoutDetails)
        staffWorkAndPayoutDetails?.forEach((eachData, idx) => eachData.Total = calculatedTotalStepByStep[idx]);
         tableHeaders = Object.keys(staffWorkAndPayoutDetails?.[0]);
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
                    <h1>KDS BUSINESS MANAGEMENT</h1>
                    <h2>Staff Payment & Remuneration Report</h2>
                    <div class='customer-container' >
                    <div id='customer-name' > <span>${staffDetails?.name?.toUpperCase()} </span> </div>
                    <div class='customer-oth-details' >
                    <div>
                    <span>Phone Number ${staffDetails?.phone_number} </span>
                    <span>Address ${staffDetails?.address} </span>
                    </div>
                    <div>
                    <span>DOB ${ staffDetails?.dob ? formatBS(staffDetails.dob, 'long', 'en') : ""} </span>
                    <span>Salary ${staffDetails?.salary} </span>
                    </div>
                    </div>
                    </div>
                    <p>Selected Date Range: ${from} To ${to}</p>
                    <p>Generated Date: ${formatBS(new Date(), 'long', 'en')} | Generated By: ${req.user?.name || "System User"}</p>
                    ${staffWorkAndPayoutDetails?.length == 0 ? `<p>No data to show for selected range </p>` : `
                           <table>
                        <thead>
                                <tr>
                                    ${tableHeaders.map((header) => (`<th>${header} </th> `)).join("")}
                                </tr>
                        </thead>
                        <tbody>
                       ${staffWorkAndPayoutDetails?.map((eachData) => (
                                `<tr>
                                    <td>${ formatBS(eachData.Date, 'long', 'en')}</td>
                                    <td class="discription" >${eachData.Discription}</td>
                                    <td>${eachData.Credit ?? '-'}</td>
                                    <td>${eachData.Debit ?? '-'}</td>
                                    <td>${eachData.Total }</td>
                                </tr>`
                            )).join("")}
                         </tbody>
                    </table>
                        `}
                    </body>
                </html>
        `

        const browser = await puppeteer.launch();
        const page = await browser.newPage()
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
            "Content-Disposition" : "attachment; filename=staff_account_details.pdf"
        })

        res.status(200).send(pdf);

    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

export {
    addAStaff,
    updateAStaff,
    deleteAStaff,
    getAStaffPersonalDetails,
    addAStaffRemunationDetails,
    getAStaffStippendAndPayout,
    getSearchedStaffs,
    addAStaffPayoutDetails,
    getAllStaffs,
    getAStaffDownloadPreviewDetails,
    downlaodAStaffStippendAndPayoutDetailsPDF
}
