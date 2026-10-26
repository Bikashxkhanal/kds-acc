import connectMongo from '../db/mongo.js';
import Supplier from '../models/supplier.model.js';
import Purchase from '../models/purchase.model.js';
import { getNextSequence } from '../utils/autoIncrement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { parseISODate } from '../utils/isoDate.js';

const summary = async (supplier) => {
  const purchases = await Purchase.find({ supplierId: supplier._id }).sort({ date: -1 }).lean();
  const purchased = purchases.reduce((sum, p) => sum + Number(p.totalValue || 0), 0);
  const purchasePayments = purchases.reduce((sum, purchase) => sum + (purchase.payments || []).reduce((paid, payment) => paid + Number(payment.amount || 0), 0), 0);
  const supplierPayments = (supplier.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paid = purchasePayments + supplierPayments;
  return { ...supplier, totalPurchased: purchased, totalPaid: paid, balance: purchased - paid, purchases };
};
export const listSuppliers = asyncHandler(async (_req, res) => {
  await connectMongo(); const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  const rows = await Promise.all(suppliers.map(summary));
  res.json(new ApiResponse(200, 'Suppliers loaded', rows));
});
export const createSupplier = asyncHandler(async (req, res) => {
  await connectMongo(); const name = String(req.body.name || '').trim();
  if (!name) throw new ApiError(400, 'Supplier name is required');
  const supplier = await Supplier.create({ name, phone: req.body.phone, address: req.body.address, notes: req.body.notes });
  res.status(201).json(new ApiResponse(201, 'Supplier saved', supplier));
});
export const getSupplier = asyncHandler(async (req, res) => {
  await connectMongo(); const supplier = await Supplier.findById(req.params.id).lean();
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json(new ApiResponse(200, 'Supplier loaded', await summary(supplier)));
});
export const deleteSupplier = asyncHandler(async (req, res) => {
  await connectMongo(); const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  const linked = await Purchase.exists({ supplierId: supplier._id });
  if (linked || supplier.payments.length) throw new ApiError(409, 'Supplier has linked purchases or payments and cannot be deleted. Keep the record to preserve its ledger.');
  await supplier.deleteOne(); res.json(new ApiResponse(200, 'Supplier deleted'));
});
export const addSupplierPayment = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount); const date = parseISODate(req.body.date, 'date');
  if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'Enter a valid payment amount');
  await connectMongo(); const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  const purchased = await Purchase.aggregate([{ $match: { supplierId: supplier._id } }, { $group: { _id: null, total: { $sum: '$totalValue' } } }]);
  const totalPaid = supplier.payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid + amount > (purchased[0]?.total || 0)) throw new ApiError(400, 'Payment exceeds the supplier balance');
  const seq = await getNextSequence('supplierReceipt'); const receiptNo = `SUP-${String(seq).padStart(6, '0')}`;
  supplier.payments.push({ receiptNo, amount, date, mode: req.body.mode || 'cash', notes: String(req.body.notes || '').trim() });
  await supplier.save(); res.status(201).json(new ApiResponse(201, 'Supplier payment recorded', supplier.payments.at(-1)));
});
