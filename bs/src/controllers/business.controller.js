import connectMongo from '../db/mongo.js';
import Purchase from '../models/purchase.model.js';
import Customer from '../models/customer.model.js';
import CustomerPayment from '../models/customerPayment.model.js';
import CustomerWork from '../models/customerWork.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const purchaseView = (p) => { const paidAmount = (p.payments || []).reduce((s, x) => s + Number(x.amount), 0); return { ...p, paidAmount, balance: Math.max(0, p.totalValue - paidAmount), status: paidAmount >= p.totalValue ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Unpaid' }; };
export const getPurchases = asyncHandler(async (_req, res) => { await connectMongo(); const purchases = await Purchase.find().sort({ date: -1 }).lean(); res.json(new ApiResponse(200, 'Purchases loaded', purchases.map(purchaseView))); });
export const createPurchase = asyncHandler(async (req, res) => {
  const { billNo = '', description, totalValue, paidAmount = 0, supplier, date, usedBy } = req.body;
  if (!String(description || '').trim() || !String(supplier || '').trim() || !Number.isFinite(Number(totalValue)) || Number(totalValue) <= 0 || !Number.isFinite(Number(paidAmount)) || Number(paidAmount) < 0 || Number(paidAmount) > Number(totalValue) || !Number.isFinite(new Date(date).getTime()) || !['Tractor', 'JCB', 'Tipper'].includes(usedBy)) throw new ApiError(400, 'Enter valid purchase details; paid amount must be between zero and total value');
  await connectMongo(); const purchase = await Purchase.create({ billNo, description: description.trim(), totalValue: Number(totalValue), supplier: supplier.trim(), date: new Date(date), usedBy, payments: Number(paidAmount) ? [{ amount: Number(paidAmount), date: new Date(date), note: 'Initial payment' }] : [] });
  res.status(201).json(new ApiResponse(201, 'Purchase saved', purchaseView(purchase.toObject())));
});
export const getPurchase = asyncHandler(async (req, res) => { await connectMongo(); const p = await Purchase.findById(req.params.id).lean(); if (!p) throw new ApiError(404, 'Purchase not found'); res.json(new ApiResponse(200, 'Purchase loaded', purchaseView(p))); });
export const addPurchasePayment = asyncHandler(async (req, res) => { const amount = Number(req.body.amount), date = new Date(req.body.date || Date.now()); if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(date.getTime())) throw new ApiError(400, 'Enter a valid payment amount and date'); await connectMongo(); const p = await Purchase.findById(req.params.id); if (!p) throw new ApiError(404, 'Purchase not found'); const paid = p.payments.reduce((s, x) => s + x.amount, 0); if (paid + amount > p.totalValue) throw new ApiError(400, 'Payment exceeds remaining balance'); p.payments.push({ amount, date, note: String(req.body.note || '').trim() }); await p.save(); res.json(new ApiResponse(200, 'Payment recorded', purchaseView(p.toObject()))); });

const chartDateKey = (date, granularity) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return granularity === 'year' ? `${year}` : granularity === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`;
};

const chartLabel = (key, granularity) => {
  if (granularity === 'year') return key;
  const date = new Date(`${key}${granularity === 'month' ? '-01' : ''}T00:00:00Z`);
  return date.toLocaleDateString('en-GB', granularity === 'month'
    ? { month: 'short', year: 'numeric', timeZone: 'UTC' }
    : { day: '2-digit', month: 'short', timeZone: 'UTC' });
};

export const getSalesVsPurchase = asyncHandler(async (req, res) => {
  const granularity = String(req.query.granularity || 'day').toLowerCase();
  if (!['day', 'month', 'year'].includes(granularity)) throw new ApiError(400, 'Granularity must be day, month, or year');
  const now = new Date();
  let from, to;
  if (req.query.from || req.query.to) {
    if (!req.query.from || !req.query.to || !/^\d{4}-\d{2}-\d{2}$/.test(req.query.from) || !/^\d{4}-\d{2}-\d{2}$/.test(req.query.to)) throw new ApiError(400, 'Provide valid from and to dates');
    from = new Date(`${req.query.from}T00:00:00Z`);
    to = new Date(`${req.query.to}T00:00:00Z`);
  } else {
    to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    from = new Date(to);
    if (granularity === 'day') from.setUTCDate(from.getUTCDate() - 29);
    else if (granularity === 'month') from.setUTCMonth(from.getUTCMonth() - 11, 1);
    else from.setUTCFullYear(from.getUTCFullYear() - 9, 0, 1);
  }
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) throw new ApiError(400, 'Date range is invalid');
  const maxBuckets = granularity === 'day' ? 366 : granularity === 'month' ? 240 : 100;
  const normalizedFrom = new Date(Date.UTC(from.getUTCFullYear(), granularity === 'year' ? 0 : granularity === 'month' ? from.getUTCMonth() : from.getUTCMonth(), granularity === 'day' ? from.getUTCDate() : 1));
  const normalizedTo = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1));
  const bucketCount = granularity === 'day'
    ? Math.ceil((normalizedTo - normalizedFrom) / 86400000)
    : granularity === 'month'
      ? (to.getUTCFullYear() - normalizedFrom.getUTCFullYear()) * 12 + to.getUTCMonth() - normalizedFrom.getUTCMonth() + 1
      : to.getUTCFullYear() - normalizedFrom.getUTCFullYear() + 1;
  if (bucketCount > maxBuckets) throw new ApiError(400, `Date range is too large for ${granularity} view`);
  const dateFormat = granularity === 'year' ? '%Y' : granularity === 'month' ? '%Y-%m' : '%Y-%m-%d';
  await connectMongo();
  const [sales, costs] = await Promise.all([
    CustomerWork.aggregate([{ $match: { work_date: { $gte: normalizedFrom, $lt: normalizedTo } } }, { $group: { _id: { $dateToString: { format: dateFormat, date: '$work_date', timezone: 'UTC' } }, amount: { $sum: '$total' } } }]),
    Purchase.aggregate([{ $match: { date: { $gte: normalizedFrom, $lt: normalizedTo } } }, { $group: { _id: { $dateToString: { format: dateFormat, date: '$date', timezone: 'UTC' } }, amount: { $sum: '$totalValue' } } }])
  ]);
  const salesByKey = new Map(sales.map((row) => [row._id, Number(row.amount || 0)]));
  const costByKey = new Map(costs.map((row) => [row._id, Number(row.amount || 0)]));
  const points = [];
  const cursor = new Date(normalizedFrom);
  while (cursor < normalizedTo && points.length <= maxBuckets) {
    const key = chartDateKey(cursor, granularity);
    const sale = salesByKey.get(key) || 0;
    const purchase = costByKey.get(key) || 0;
    points.push({ key, label: chartLabel(key, granularity), sales: sale, purchase, difference: sale - purchase });
    if (granularity === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1);
    else if (granularity === 'month') cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    else cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
  }
  if (points.length > maxBuckets) throw new ApiError(400, `Date range is too large for ${granularity} view`);
  res.json(new ApiResponse(200, 'Sales and purchase chart loaded', { granularity, from: normalizedFrom.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), points }));
});

export const getDashboard = asyncHandler(async (req, res) => {
  await connectMongo(); const now = new Date(); const start = new Date(now); start.setMonth(start.getMonth() - Math.min(60, Math.max(1, Number(req.query.months) || 12))); start.setDate(1); start.setHours(0,0,0,0);
  const [works, purchases, payments, customers] = await Promise.all([CustomerWork.find({ work_date: { $gte: start } }).lean(), Purchase.find({ date: { $gte: start } }).lean(), CustomerPayment.find().lean(), Customer.find().lean()]);
  const chart = new Map(); const keyOf = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`; };
  for (const w of works) { const k = keyOf(w.work_date); const row = chart.get(k) || { month: k, sales: 0, cost: 0 }; row.sales += Number(w.total || 0); chart.set(k, row); }
  for (const p of purchases) { const k = keyOf(p.date); const row = chart.get(k) || { month: k, sales: 0, cost: 0 }; row.cost += Number(p.totalValue || 0); chart.set(k, row); }
  const monthKey = keyOf(now), monthStart = new Date(now.getFullYear(), now.getMonth(), 1), monthWork = await CustomerWork.aggregate([{ $match: { work_date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
  const monthCost = purchases.filter(p => new Date(p.date) >= monthStart).reduce((s,p) => s + p.totalValue,0);
  const recovered = payments.filter(p => new Date(p.payment_date) >= monthStart).reduce((s,p) => s + p.pay_amount,0);
  const [allWorks, allPays] = await Promise.all([CustomerWork.aggregate([{ $group: { _id: '$customer_id', total: { $sum: '$total' }, oldest: { $min: '$work_date' } } }]), CustomerPayment.aggregate([{ $group: { _id: '$customer_id', total: { $sum: '$pay_amount' }, last: { $max: '$payment_date' } } }])]);
  const payMap = new Map(allPays.map(p => [p._id, p])); const customerMap = new Map(customers.map(c => [c.id,c])); const cutoff = new Date(now.getTime() - 90*86400000);
  const dueCustomers = allWorks.map(w => { const paid = payMap.get(w._id); const due = Math.max(0,w.total-(paid?.total||0)); const refDate = paid?.last || w.oldest; const days = Math.floor((now-new Date(refDate))/86400000); return { customer: customerMap.get(w._id), due, lastPaymentDate: paid?.last || null, daysOverdue: days }; }).filter(x => x.customer && x.due > 0 && new Date(x.lastPaymentDate || allWorks.find(w => w._id === x.customer.id)?.oldest || now) < cutoff).map(x => ({ id:x.customer.id, name:x.customer.name, phone:x.customer.phone_number, amountDue:x.due, lastPaymentDate:x.lastPaymentDate, daysOverdue:x.daysOverdue }));
  const lastMonth = new Date(now.getFullYear(), now.getMonth()-1,1), nextMonth = new Date(now.getFullYear(),now.getMonth(),1);
  const lastMonthRevenue = await CustomerWork.aggregate([{ $match: { work_date: { $gte:lastMonth,$lt:nextMonth } } },{ $group:{_id:null,total:{$sum:'$total'}}}]);
  const lastMonthCost = purchases.filter(p=>new Date(p.date)>=lastMonth&&new Date(p.date)<nextMonth).reduce((s,p)=>s+p.totalValue,0);
  const lastMonthRecovered = payments.filter(p=>new Date(p.payment_date)>=lastMonth&&new Date(p.payment_date)<nextMonth).reduce((s,p)=>s+p.pay_amount,0);
  res.json(new ApiResponse(200,'Dashboard data loaded',{ chart:[...chart.values()].sort((a,b)=>a.month.localeCompare(b.month)), summary:{revenue:lastMonthRevenue[0]?.total||0,cost:lastMonthCost,recovered:lastMonthRecovered,due:Math.max(0,(lastMonthRevenue[0]?.total||0)-lastMonthRecovered)},dueCustomers,monthKey }));
});
