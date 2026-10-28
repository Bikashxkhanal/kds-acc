import connectMongo from '../db/mongo.js';
import PreviousAccountBalance from '../models/previousAccountBalance.model.js';
import Customer from '../models/customer.model.js';
import Staff from '../models/staff.model.js';
import Supplier from '../models/supplier.model.js';
import { getNextSequence } from '../utils/autoIncrement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { parseISODate } from '../utils/isoDate.js';

const PARTY_TYPES = ['customer', 'supplier', 'staff'];

const assertPartyExists = async (partyType, partyId) => {
  if (partyType === 'customer') {
    const id = Number(partyId);
    if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid customer id');
    const customer = await Customer.findOne({ id }).select('id name').lean();
    if (!customer) throw new ApiError(404, 'Customer not found');
    return { partyId: String(customer.id), partyName: customer.name };
  }
  if (partyType === 'staff') {
    const id = Number(partyId);
    if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid staff id');
    const staff = await Staff.findOne({ id, deletedAt: { $exists: false } }).select('id name').lean();
    if (!staff) throw new ApiError(404, 'Staff not found');
    return { partyId: String(staff.id), partyName: staff.name };
  }
  const supplier = await Supplier.findById(partyId).select('_id name').lean();
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  return { partyId: String(supplier._id), partyName: supplier.name };
};

const validateBody = (body = {}, { partial = false } = {}) => {
  const data = {};
  if (!partial || body.partyType != null) {
    const partyType = String(body.partyType || '').toLowerCase();
    if (!PARTY_TYPES.includes(partyType)) throw new ApiError(400, 'Party type must be customer, supplier, or staff');
    data.partyType = partyType;
  }
  if (!partial || body.partyId != null) {
    const partyId = String(body.partyId || '').trim();
    if (!partyId) throw new ApiError(400, 'Select a customer, supplier, or staff member');
    data.partyId = partyId;
  }
  if (!partial || body.type != null) {
    const type = String(body.type || '').toLowerCase();
    if (!['credit', 'debit'].includes(type)) throw new ApiError(400, 'Type must be Credit or Debit');
    data.type = type;
  }
  if (!partial || body.amount != null) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'Amount must be greater than zero');
    data.amount = amount;
  }
  if (!partial || body.date != null) {
    data.date = parseISODate(body.date, 'date');
  }
  if (!partial || body.notes != null) {
    data.notes = String(body.notes || '').trim().slice(0, 500);
  }
  return data;
};

export const listPreviousBalances = asyncHandler(async (req, res) => {
  const partyType = String(req.query.partyType || '').toLowerCase();
  const partyId = String(req.query.partyId || '').trim();
  await connectMongo();
  const filter = {};
  if (PARTY_TYPES.includes(partyType)) filter.partyType = partyType;
  if (partyId) filter.partyId = partyId;
  const rows = await PreviousAccountBalance.find(filter).sort({ date: -1, id: -1 }).lean();
  res.json(new ApiResponse(200, 'Previous account balances loaded', rows));
});

export const createPreviousBalance = asyncHandler(async (req, res) => {
  const input = validateBody(req.body);
  await connectMongo();
  const party = await assertPartyExists(input.partyType, input.partyId);
  const id = await getNextSequence('previousAccountBalance');
  const doc = await PreviousAccountBalance.create({
    id,
    partyType: input.partyType,
    partyId: party.partyId,
    type: input.type,
    amount: input.amount,
    date: input.date,
    notes: input.notes || ''
  });
  res.status(201).json(new ApiResponse(201, 'Previous account balance saved', { ...doc.toObject(), partyName: party.partyName }));
});

export const updatePreviousBalance = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid entry id');
  const input = validateBody(req.body, { partial: true });
  await connectMongo();
  const existing = await PreviousAccountBalance.findOne({ id });
  if (!existing) throw new ApiError(404, 'Previous account balance not found');

  const nextPartyType = input.partyType || existing.partyType;
  const nextPartyId = input.partyId || existing.partyId;
  const party = await assertPartyExists(nextPartyType, nextPartyId);

  if (input.partyType) existing.partyType = input.partyType;
  existing.partyId = party.partyId;
  if (input.type) existing.type = input.type;
  if (input.amount != null) existing.amount = input.amount;
  if (input.date) existing.date = input.date;
  if (input.notes != null) existing.notes = input.notes;
  await existing.save();
  res.json(new ApiResponse(200, 'Previous account balance updated', { ...existing.toObject(), partyName: party.partyName }));
});

export const deletePreviousBalance = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid entry id');
  await connectMongo();
  const existing = await PreviousAccountBalance.findOneAndDelete({ id });
  if (!existing) throw new ApiError(404, 'Previous account balance not found');
  res.json(new ApiResponse(200, 'Previous account balance deleted', { id }));
});

export const getPreviousBalance = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new ApiError(400, 'Invalid entry id');
  await connectMongo();
  const row = await PreviousAccountBalance.findOne({ id }).lean();
  if (!row) throw new ApiError(404, 'Previous account balance not found');
  res.json(new ApiResponse(200, 'Previous account balance loaded', row));
});
