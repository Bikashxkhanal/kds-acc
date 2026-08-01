import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import connectMongo from "../db/mongo.js";
import Company from "../models/company.model.js";
import Invoice from "../models/invoice.model.js";
import puppeteer from "puppeteer";
import { buildInvoiceHtml } from "../utils/invoiceTemplate.js";

const currency = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const getUserSnapshot = (user = {}) => ({
    id: user?.id,
    name: user?.name || "System User"
});

const normalizeDate = (value, fieldName, required = false) => {
    if (!value && !required) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, `${fieldName} must be a valid date`);
    }
    return date;
};

const calculateItems = (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "At least one invoice item is required");
    }

    return items.map((item, index) => {
        const quantity = Number(item.quantity);
        const rate = Number(item.rate);
        const discount = Number(item.discount || 0);
        const tax = Number(item.tax || 0);

        if (!item.productName?.trim()) throw new ApiError(400, "Product / service name is required");
        if (!item.unit?.trim()) throw new ApiError(400, "Item unit is required");
        if (!Number.isFinite(quantity) || quantity <= 0) throw new ApiError(400, "Item quantity must be greater than zero");
        if (!Number.isFinite(rate) || rate < 0) throw new ApiError(400, "Item rate must be valid");

        const lineBase = quantity * rate;
        const total = Math.max(lineBase - discount + tax, 0);

        return {
            productName: item.productName.trim(),
            description: item.description?.trim() || "",
            quantity,
            unit: item.unit.trim(),
            rate,
            discount,
            tax,
            total,
            sortOrder: Number(item.sortOrder ?? index)
        };
    });
};

const calculateTotals = (items, paidAmount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const discount = items.reduce((sum, item) => sum + item.discount, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const grandTotal = Math.max(subtotal - discount + tax, 0);
    const paid = Math.min(Math.max(Number(paidAmount || 0), 0), grandTotal);
    const remainingAmount = Math.max(grandTotal - paid, 0);

    return {
        subtotal,
        discount,
        tax,
        grandTotal,
        paidAmount: paid,
        remainingAmount
    };
};

const getPaymentStatus = ({ grandTotal, paidAmount, remainingAmount }) => {
    if (grandTotal === 0 || remainingAmount === 0) return "paid";
    if (paidAmount > 0) return "partial";
    return "unpaid";
};

const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments({
        createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
        }
    });
    const next = String(count + 1).padStart(5, "0");
    return {
        invoiceNumber: `INV-${year}-${next}`,
        billNumber: `BILL-${year}-${next}`
    };
};

const buildInvoicePayload = async (body, user, existingInvoice) => {
    await connectMongo();

    const companyId = body.companyId || body.company?._id || body.company?.id;
    const company = companyId ? await Company.findById(companyId).lean() : null;
    const companyPayload = company || body.company;

    if (!companyPayload?.name?.trim()) throw new ApiError(400, "Company name is required");
    if (!body.customer?.name?.trim()) throw new ApiError(400, "Customer name is required");
    if (!body.customer?.address?.trim()) throw new ApiError(400, "Customer address is required");

    const items = calculateItems(body.items);
    const totals = calculateTotals(items, body.totals?.paidAmount ?? body.paidAmount);
    const actor = getUserSnapshot(user);

    return {
        ...(existingInvoice ? {} : await generateInvoiceNumber()),
        company: {
            id: company?._id,
            name: companyPayload.name.trim(),
            address: companyPayload.address?.trim() || "",
            phone: companyPayload.phone?.trim() || "",
            email: companyPayload.email?.trim() || "",
            pan: companyPayload.pan?.trim() || "",
            logoUrl: companyPayload.logoUrl?.trim() || ""
        },
        customer: {
            name: body.customer.name.trim(),
            address: body.customer.address.trim(),
            phone: body.customer.phone?.trim() || "",
            pan: body.customer.pan?.trim() || ""
        },
        billDate: normalizeDate(body.billDate, "Bill date", true),
        dueDate: normalizeDate(body.dueDate, "Due date"),
        section: body.section?.trim() || "",
        remarks: body.remarks?.trim() || "",
        items,
        totals,
        paymentStatus: getPaymentStatus(totals),
        signatureStatus: {
            customerSigned: Boolean(body.signatureStatus?.customerSigned),
            ownerSigned: Boolean(body.signatureStatus?.ownerSigned),
            stamped: Boolean(body.signatureStatus?.stamped)
        },
        ...(existingInvoice ? { lastUpdatedBy: actor } : { creator: actor, lastUpdatedBy: actor })
    };
};

const getCompanies = asyncHandler(async (_, res) => {
    await connectMongo();
    const companies = await Company.find({ isActive: true }).sort({ name: 1 }).lean();

    return res.status(200).json(
        new ApiResponse(200, "Companies fetched successfully", companies)
    );
});

const createCompany = asyncHandler(async (req, res) => {
    await connectMongo();
    const { name, address, phone, email, pan, logoUrl } = req.body;

    if (!name?.trim() || !address?.trim() || !pan?.trim()) {
        throw new ApiError(400, "Company name, address and PAN are required");
    }

    const company = await Company.create({
        name,
        address,
        phone,
        email,
        pan,
        logoUrl
    });

    return res.status(201).json(
        new ApiResponse(201, "Company created successfully", company)
    );
});

const createABill = asyncHandler(async (req, res) => {
    const payload = await buildInvoicePayload(req.body, req.user);
    const actor = getUserSnapshot(req.user);

    const invoice = await Invoice.create({
        ...payload,
        timeline: [{
            action: "created",
            by: actor.name,
            note: `Invoice created for Rs. ${currency.format(payload.totals.grandTotal)}`
        }]
    });

    return res.status(201).json(
        new ApiResponse(201, "Invoice saved successfully", invoice)
    );
});

const getBillings = asyncHandler(async (req, res) => {
    await connectMongo();

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.companyName) filter["company.name"] = new RegExp(req.query.companyName, "i");
    if (req.query.from || req.query.to) {
        filter.billDate = {};
        if (req.query.from) filter.billDate.$gte = normalizeDate(req.query.from, "From date");
        if (req.query.to) filter.billDate.$lte = normalizeDate(req.query.to, "To date");
    }
    if (req.query.search) {
        const search = new RegExp(req.query.search, "i");
        filter.$or = [
            { invoiceNumber: search },
            { billNumber: search },
            { "customer.name": search },
            { "customer.phone": search },
            { "customer.address": search },
            { "company.name": search }
        ];
    }

    const [invoices, total] = await Promise.all([
        Invoice.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Invoice.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Invoices fetched successfully", {
            invoices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    );
});

const getABillDetails = asyncHandler(async (req, res) => {
    await connectMongo();
    const { billing_id } = req.params;

    const invoice = await Invoice.findById(billing_id).lean();
    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(
        new ApiResponse(200, "Invoice details fetched successfully", invoice)
    );
});

const updateABill = asyncHandler(async (req, res) => {
    await connectMongo();
    const { billing_id } = req.params;
    const invoice = await Invoice.findById(billing_id);

    if (!invoice) throw new ApiError(404, "Invoice not found");

    const payload = await buildInvoicePayload(req.body, req.user, invoice);
    Object.assign(invoice, payload);
    invoice.timeline.push({
        action: "updated",
        by: getUserSnapshot(req.user).name,
        note: "Invoice details updated"
    });

    await invoice.save();

    return res.status(200).json(
        new ApiResponse(200, "Invoice updated successfully", invoice)
    );
});

const deleteABill = asyncHandler(async (req, res) => {
    await connectMongo();
    const { billing_id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(billing_id);

    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(
        new ApiResponse(200, "Invoice deleted successfully", { id: billing_id })
    );
});

const duplicateABill = asyncHandler(async (req, res) => {
    await connectMongo();
    const { billing_id } = req.params;
    const original = await Invoice.findById(billing_id).lean();

    if (!original) throw new ApiError(404, "Invoice not found");

    const numbers = await generateInvoiceNumber();
    const actor = getUserSnapshot(req.user);
    const duplicate = await Invoice.create({
        ...original,
        _id: undefined,
        ...numbers,
        paymentStatus: "unpaid",
        totals: {
            ...original.totals,
            paidAmount: 0,
            remainingAmount: original.totals.grandTotal
        },
        creator: actor,
        lastUpdatedBy: actor,
        timeline: [{
            action: "duplicated",
            by: actor.name,
            note: `Duplicated from ${original.invoiceNumber}`
        }],
        createdAt: undefined,
        updatedAt: undefined
    });

    return res.status(201).json(
        new ApiResponse(201, "Invoice duplicated successfully", duplicate)
    );
});

const downloadBillPDF = asyncHandler(async (req, res) => {
    await connectMongo();
    const { billing_id } = req.params;
    const invoice = await Invoice.findById(billing_id).lean();

    if (!invoice) throw new ApiError(404, "Invoice not found");

    const html = buildInvoiceHtml(invoice);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `<div style="width:100%;font-size:9px;text-align:center;color:#94a3b8;padding:0 10mm">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
        margin: { top: "8mm", bottom: "12mm", left: "10mm", right: "10mm" }
    });

    await browser.close();

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
    });
    res.status(200).send(pdf);
});

export {
    createABill,
    getBillings,
    getABillDetails,
    updateABill,
    deleteABill,
    duplicateABill,
    getCompanies,
    createCompany,
    downloadBillPDF
};
