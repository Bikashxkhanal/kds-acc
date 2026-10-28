import mongoose from 'mongoose';
import connectMongo from '../db/mongo.js';
import Supplier from '../models/supplier.model.js';
import Purchase from '../models/purchase.model.js';
import PreviousAccountBalance from '../models/previousAccountBalance.model.js';
import { getNextSequence } from '../utils/autoIncrement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { parseISODate } from '../utils/isoDate.js';
import { calculateSupplierTotals } from '../utils/supplierTotals.js';
import { netOpeningEffect, supplierOpeningLedgerEntries } from '../utils/previousBalance.js';
import { recordActivity } from '../services/activityLog.js';

const summary = async (supplier) => {
  const [purchases, openings] = await Promise.all([
    Purchase.find({ supplierId: supplier._id }).sort({ date: -1 }).lean(),
    PreviousAccountBalance.find({ partyType: 'supplier', partyId: String(supplier._id) }).lean()
  ]);
  const totals = calculateSupplierTotals(purchases, supplier.payments || []);
  const openingNet = netOpeningEffect(openings, 'supplier');
  const balance = totals.balance + openingNet;
  const ledger = [
    ...purchases.map((purchase) => ({ _id: `purchase-${purchase._id}`, date: purchase.date, description: purchase.description, debit: Number(purchase.totalValue || 0), credit: 0, kind: 'purchase', sortId: String(purchase._id) })),
    ...(supplier.payments || []).map((payment) => ({ _id: `payment-${payment._id}`, date: payment.date, description: payment.notes || payment.receiptNo || 'Supplier payment', debit: 0, credit: Number(payment.amount || 0), kind: 'payment', sortId: String(payment._id) })),
    ...supplierOpeningLedgerEntries(openings)
  ].sort((a, b) => new Date(a.date) - new Date(b.date) || a.sortId.localeCompare(b.sortId));
  let running = 0;
  for (const entry of ledger) { running += entry.debit - entry.credit; entry.balance = running; }
  return { ...supplier, status: supplier.status || 'Active', ...totals, openingNet, balance, purchases, ledger };
};

export const listSuppliers = asyncHandler(async (req, res) => {
  await connectMongo();
  const statusCode = String(req.query?.status || '').trim().toLowerCase();
  const filter = {};
  if (statusCode === 'inactive') {
    filter.status = 'Inactive';
  } else if (statusCode === 'all') {
    // no status filter
  } else {
    filter.status = { $ne: 'Inactive' };
  }
  const suppliers = await Supplier.find(filter).sort({ name: 1 }).lean();
  const rows = await Promise.all(suppliers.map(summary));
  res.json(new ApiResponse(200, 'Suppliers loaded', rows));
});

export const createSupplier = asyncHandler(async (req, res) => {
  await connectMongo(); const name = String(req.body.name || '').trim();
  if (!name) throw new ApiError(400, 'Supplier name is required');
  const supplier = await Supplier.create({ name, phone: req.body.phone, address: req.body.address, notes: req.body.notes, status: 'Active' });
  res.status(201).json(new ApiResponse(201, 'Supplier saved', supplier));
});

export const getSupplier = asyncHandler(async (req, res) => {
  await connectMongo(); const supplier = await Supplier.findById(req.params.id).lean();
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json(new ApiResponse(200, 'Supplier loaded', await summary(supplier)));
});

export const updateSupplierStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['Active', 'Inactive'].includes(status)) throw new ApiError(400, 'Status must be Active or Inactive');
  await connectMongo();
  const supplier = await Supplier.findById(id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const previousStatus = supplier.status || 'Active';
  supplier.status = status;
  supplier.statusChangedBy = req.user?.name || 'Admin';
  supplier.statusChangedAt = new Date();
  await supplier.save();

  await recordActivity({
    userId: req.user?.id,
    username: req.user?.name,
    role: req.user?.role,
    action: status === 'Active' ? 'activate' : 'deactivate',
    module: 'supplier',
    entityId: String(supplier._id),
    entityName: supplier.name,
    description: `Supplier ${supplier.name} status changed from ${previousStatus} to ${status}`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  req.activityLogged = true;

  res.json(new ApiResponse(200, `Supplier ${status === 'Active' ? 'activated' : 'deactivated'} successfully`, supplier));
});

export const getSupplierDeletePreview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await connectMongo();
  const supplier = await Supplier.findById(id).lean();
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const [purchasesCount, openingsCount] = await Promise.all([
    Purchase.countDocuments({ supplierId: supplier._id }),
    PreviousAccountBalance.countDocuments({ partyType: 'supplier', partyId: String(supplier._id) })
  ]);
  const paymentsCount = supplier.payments?.length || 0;
  const receiptsCount = (supplier.payments || []).filter((p) => p.receiptNo).length;

  res.json(new ApiResponse(200, 'Supplier delete preview loaded', {
    supplierName: supplier.name,
    counts: {
      purchases: purchasesCount,
      payments: paymentsCount,
      receipts: receiptsCount,
      openings: openingsCount
    }
  }));
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  await connectMongo();
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const [purchasesCount, openingsCount] = await Promise.all([
    Purchase.countDocuments({ supplierId: supplier._id }),
    PreviousAccountBalance.countDocuments({ partyType: 'supplier', partyId: String(supplier._id) })
  ]);
  const paymentsCount = supplier.payments?.length || 0;
  const receiptsCount = (supplier.payments || []).filter((p) => p.receiptNo).length;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Purchase.deleteMany({ supplierId: supplier._id }, { session });
      await PreviousAccountBalance.deleteMany({ partyType: 'supplier', partyId: String(supplier._id) }, { session });
      await Supplier.deleteOne({ _id: supplier._id }, { session });
    });
  } catch (err) {
    await recordActivity({
      userId: req.user?.id,
      username: req.user?.name,
      role: req.user?.role,
      action: 'delete_failed',
      module: 'supplier',
      entityId: String(supplier._id),
      entityName: supplier.name,
      description: `Failed to delete supplier ${supplier.name}: ${err.message}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    throw new ApiError(500, `Failed to delete supplier: ${err.message}`);
  } finally {
    await session.endSession();
  }

  const summaryStr = `${purchasesCount} purchases, ${paymentsCount} payments, ${receiptsCount} receipts, ${openingsCount} previous balance entries`;
  await recordActivity({
    userId: req.user?.id,
    username: req.user?.name,
    role: req.user?.role,
    action: 'delete',
    module: 'supplier',
    entityId: String(supplier._id),
    entityName: supplier.name,
    description: `Permanently deleted supplier ${supplier.name} and removed ${summaryStr}`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  req.activityLogged = true;

  res.json(new ApiResponse(200, 'Supplier and all associated records deleted successfully', {
    removed: {
      purchases: purchasesCount,
      payments: paymentsCount,
      receipts: receiptsCount,
      openings: openingsCount
    }
  }));
});

export const addSupplierPayment = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount); const date = parseISODate(req.body.date, 'date');
  if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'Enter a valid payment amount');
  await connectMongo(); const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  if (supplier.status === 'Inactive') throw new ApiError(409, 'Supplier account is inactive. No new payments can be added.');
  const purchased = await Purchase.aggregate([{ $match: { supplierId: supplier._id } }, { $group: { _id: null, total: { $sum: '$totalValue' } } }]);
  const openings = await PreviousAccountBalance.find({ partyType: 'supplier', partyId: String(supplier._id) }).lean();
  const openingNet = netOpeningEffect(openings, 'supplier');
  const totalPaid = calculateSupplierTotals([], supplier.payments).totalPaid;
  const maxPayable = (purchased[0]?.total || 0) + openingNet;
  if (totalPaid + amount > maxPayable) throw new ApiError(400, 'Payment exceeds the supplier balance');
  const seq = await getNextSequence('supplierReceipt'); const receiptNo = `SUP-${String(seq).padStart(6, '0')}`;
  supplier.payments.push({ receiptNo, amount, date, mode: req.body.mode || 'cash', notes: String(req.body.notes || '').trim() });
  await supplier.save(); res.status(201).json(new ApiResponse(201, 'Supplier payment recorded', supplier.payments.at(-1)));
});
