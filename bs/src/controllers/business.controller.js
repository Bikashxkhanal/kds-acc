import mongoose from 'mongoose';
import connectMongo from '../db/mongo.js';
import Purchase from '../models/purchase.model.js';
import Supplier from '../models/supplier.model.js';
import Customer from '../models/customer.model.js';
import CustomerPayment from '../models/customerPayment.model.js';
import CustomerWork from '../models/customerWork.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import NepaliDateModule from 'nepali-date-converter';
const NepaliDate = NepaliDateModule.default || NepaliDateModule;
import { parseBS, formatBS, bsKey } from '../utils/bsDate.js';
import { parseISODate } from '../utils/isoDate.js';
import Staff from '../models/staff.model.js';
import StaffRemuneration from '../models/staffRemuneration.model.js';

const purchaseView = (p) => { const paidAmount = (p.payments || []).reduce((s, x) => s + Number(x.amount), 0); return { ...p, paidAmount, balance: Math.max(0, p.totalValue - paidAmount), status: paidAmount >= p.totalValue ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Unpaid' }; };
export const getPurchases = asyncHandler(async (_req, res) => { await connectMongo(); const purchases = await Purchase.find().sort({ date: -1 }).lean(); res.json(new ApiResponse(200, 'Purchases loaded', purchases.map(purchaseView))); });
export const createPurchase = asyncHandler(async (req, res) => {
  const { billNo = '', description, totalValue, paidAmount = 0, supplierId, title = 'Others', customTitle = '', date, usedBy } = req.body;
  const purchaseDate = parseISODate(date, 'date');
  if (!supplierId) throw new ApiError(400, 'Please select a supplier');
  if (!String(description || '').trim() || !Number.isFinite(Number(totalValue)) || Number(totalValue) <= 0 || !Number.isFinite(Number(paidAmount)) || Number(paidAmount) < 0 || Number(paidAmount) > Number(totalValue) || !['Tractor', 'JCB', 'Tipper'].includes(usedBy)) throw new ApiError(400, 'Enter valid purchase details; paid amount must be between zero and total value');
  if (!['Fuel', 'Mobil (oil)', 'Parts', 'Others'].includes(title) || (title === 'Others' && !String(customTitle || description).trim())) throw new ApiError(400, 'Select a valid purchase title');
  await connectMongo();
  if (!mongoose.isValidObjectId(supplierId)) throw new ApiError(400, 'Please select a valid supplier');
  const selectedSupplier = await Supplier.findById(supplierId).select('name');
  if (!selectedSupplier) throw new ApiError(400, 'Please select a valid supplier');
  const purchase = await Purchase.create({ billNo, description: description.trim(), title, customTitle: title === 'Others' ? String(customTitle || description).trim() : '', supplierId: selectedSupplier._id, totalValue: Number(totalValue), supplier: selectedSupplier.name, date: purchaseDate, usedBy, payments: Number(paidAmount) ? [{ amount: Number(paidAmount), date: purchaseDate, note: 'Initial payment' }] : [] });
  res.status(201).json(new ApiResponse(201, 'Purchase saved', purchaseView(purchase.toObject())));
});
export const getPurchase = asyncHandler(async (req, res) => { await connectMongo(); const p = await Purchase.findById(req.params.id).lean(); if (!p) throw new ApiError(404, 'Purchase not found'); res.json(new ApiResponse(200, 'Purchase loaded', purchaseView(p))); });
export const addPurchasePayment = asyncHandler(async (req, res) => { const amount = Number(req.body.amount), date = parseISODate(req.body.date, 'date'); if (!Number.isFinite(amount) || amount <= 0) throw new ApiError(400, 'Enter a valid payment amount and date'); await connectMongo(); const p = await Purchase.findById(req.params.id); if (!p) throw new ApiError(404, 'Purchase not found'); const paid = p.payments.reduce((s, x) => s + x.amount, 0); if (paid + amount > p.totalValue) throw new ApiError(400, 'Payment exceeds remaining balance'); p.payments.push({ amount, date, note: String(req.body.note || '').trim() }); await p.save(); res.json(new ApiResponse(200, 'Payment recorded', purchaseView(p.toObject()))); });

const bsGranularityKey = (date, granularity) => {
  const bs = new NepaliDate(date); const fields = bs.getBS();
  return granularity === 'year' ? String(fields.year) : granularity === 'month' ? `${fields.year}-${String(fields.month + 1).padStart(2, '0')}` : bs.format('YYYY-MM-DD');
};
const bsStartOf = (value, granularity) => {
  const fields = new NepaliDate(value).getBS();
  return parseBS(`${fields.year}-${String(granularity === 'year' ? 1 : fields.month + 1).padStart(2, '0')}-01`);
};

export const getSalesVsPurchase = asyncHandler(async (req, res) => {
  const granularity = String(req.query.granularity || 'day').toLowerCase();
  if (!['day', 'month', 'year'].includes(granularity)) throw new ApiError(400, 'Granularity must be day, month, or year');
  const now = new Date();
  let fromBS, toBS;
  if (req.query.from || req.query.to) {
    const fromISO = parseISODate(req.query.from, 'from'); const toISO = parseISODate(req.query.to, 'to');
    const toBSString = (date) => new NepaliDate(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12)).format('YYYY-MM-DD');
    fromBS = toBSString(fromISO); toBS = toBSString(toISO);
  } else {
    const current = new NepaliDate(now); toBS = current.format('YYYY-MM-DD');
    if (granularity === 'day') { current.setDate(current.getDate() - 29); fromBS = current.format('YYYY-MM-DD'); }
    else if (granularity === 'month') { current.setDate(1); current.setMonth(current.getMonth() - 11); fromBS = current.format('YYYY-MM-DD'); }
    else { current.setMonth(0); current.setDate(1); current.setYear(current.getYear() - 9); fromBS = current.format('YYYY-MM-DD'); }
  }
  const from = parseBS(fromBS), to = parseBS(toBS);
  if (!from || !to || from > to) throw new ApiError(400, 'Date range is invalid or outside the supported Bikram Sambat range');
  const maxBuckets = granularity === 'day' ? 366 : granularity === 'month' ? 240 : 100;
  const normalizedFrom = granularity === 'day' ? from : bsStartOf(from, granularity);
  const endStart = granularity === 'day' ? to : bsStartOf(to, granularity);
  const endPeriod = new NepaliDate(endStart);
  if (granularity === 'day') endPeriod.setDate(endPeriod.getDate() + 1);
  else if (granularity === 'month') { endPeriod.setDate(1); endPeriod.setMonth(endPeriod.getMonth() + 1); }
  else { endPeriod.setMonth(0); endPeriod.setDate(1); endPeriod.setYear(endPeriod.getYear() + 1); }
  const normalizedTo = parseBS(endPeriod.format('YYYY-MM-DD'));
  const dailyCount = Math.floor((normalizedTo - normalizedFrom) / 86400000);
  if (granularity === 'day' && dailyCount > maxBuckets) throw new ApiError(400, `Date range is too large for ${granularity} view`);
  await connectMongo();
  const [sales, costs] = await Promise.all([
    CustomerWork.aggregate([{ $match: { work_date: { $gte: normalizedFrom, $lt: normalizedTo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$work_date', timezone: 'UTC' } }, amount: { $sum: '$total' } } }]),
    Purchase.aggregate([{ $match: { date: { $gte: normalizedFrom, $lt: normalizedTo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } }, amount: { $sum: '$totalValue' } } }])
  ]);
  const groupRows = (rows) => {
    const grouped = new Map();
    rows.forEach((row) => { const key = bsGranularityKey(new Date(`${row._id}T00:00:00Z`), granularity); grouped.set(key, (grouped.get(key) || 0) + Number(row.amount || 0)); });
    return grouped;
  };
  const salesByKey = groupRows(sales); const costByKey = groupRows(costs);
  const points = [];
  const cursor = new NepaliDate(bsKey(normalizedFrom));
  const lastKey = bsGranularityKey(to, granularity);
  while (bsGranularityKey(cursor.toJsDate(), granularity) <= lastKey && points.length <= maxBuckets) {
    const key = bsGranularityKey(cursor.toJsDate(), granularity);
    const sale = salesByKey.get(key) || 0;
    const purchase = costByKey.get(key) || 0;
    const display = new NepaliDate(cursor.toJsDate());
    points.push({ key, label: granularity === 'year' ? key : display.format(granularity === 'month' ? 'MMM YYYY' : 'DD MMM'), sales: sale, purchase, difference: sale - purchase });
    if (granularity === 'day') cursor.setDate(cursor.getDate() + 1);
    else if (granularity === 'month') { cursor.setDate(1); cursor.setMonth(cursor.getMonth() + 1); }
    else { cursor.setMonth(0); cursor.setDate(1); cursor.setYear(cursor.getYear() + 1); }
  }
  if (points.length > maxBuckets) throw new ApiError(400, `Date range is too large for ${granularity} view`);
  res.json(new ApiResponse(200, 'Sales and purchase chart loaded', { granularity, from: fromBS, to: toBS, points }));
});

export const getVehicleRevenue = asyncHandler(async (req, res) => {
  const granularity = String(req.query.granularity || 'day').toLowerCase();
  if (!['day', 'week', 'month'].includes(granularity)) throw new ApiError(400, 'Granularity must be day, week, or month');
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  if (granularity === 'day') start.setDate(start.getDate() - 15);
  else if (granularity === 'week') start.setDate(start.getDate() - 7 * 8);
  else start.setMonth(start.getMonth() - 6);
  const end = new Date(today);
  if (granularity === 'day') end.setDate(end.getDate() + 15);
  else if (granularity === 'week') end.setDate(end.getDate() + 7 * 8);
  else end.setMonth(end.getMonth() + 6);
  const bucket = (date) => {
    const d = new Date(date); d.setHours(12, 0, 0, 0);
    const bs = new NepaliDate(d); const fields = bs.getBS();
    const month = String(fields.month + 1).padStart(2, '0');
    if (granularity === 'month') return `${fields.year}-${month}`;
    if (granularity === 'week') return `${fields.year}-${month}-W${Math.ceil(fields.date / 7)}`;
    return bs.format('YYYY-MM-DD');
  };
  await connectMongo();
  const rows = await CustomerWork.aggregate([
    { $match: { work_date: { $gte: start, $lte: end } } },
    { $group: { _id: { vehicle: '$vehicle_type', date: '$work_date' }, revenue: { $sum: '$total' } } }
  ]);
  const totals = new Map();
  rows.forEach(({ _id, revenue }) => {
    const key = `${_id.vehicle}|${bucket(_id.date)}`;
    totals.set(key, (totals.get(key) || 0) + Number(revenue || 0));
  });
  const vehicles = ['Tractor', 'JCB', 'Tipper'];
  const points = [];
  const cursor = new Date(start);
  while (cursor <= end && points.length < 400) {
    const key = bucket(cursor);
    if (!points.length || points.at(-1).key !== key) points.push({ key, date: key, revenues: Object.fromEntries(vehicles.map((vehicle) => [vehicle, totals.get(`${vehicle}|${key}`) || 0])) });
    cursor.setDate(cursor.getDate() + (granularity === 'week' ? 7 : 1));
  }
  res.json(new ApiResponse(200, 'Vehicle revenue loaded', { granularity, today: bucket(today), vehicles, points }));
});

export const getDashboard = asyncHandler(async (req, res) => {
  await connectMongo(); const now = new Date(); const start = new Date(now); start.setMonth(start.getMonth() - Math.min(60, Math.max(1, Number(req.query.months) || 12))); start.setDate(1); start.setHours(0,0,0,0);
  const [works, purchases, allPurchases, payments, customers] = await Promise.all([CustomerWork.find({ work_date: { $gte: start } }).lean(), Purchase.find({ date: { $gte: start } }).lean(), Purchase.find().lean(), CustomerPayment.find().lean(), Customer.find().lean()]);
  const chart = new Map(); const keyOf = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`; };
  for (const w of works) { const k = keyOf(w.work_date); const row = chart.get(k) || { month: k, sales: 0, cost: 0 }; row.sales += Number(w.total || 0); chart.set(k, row); }
  for (const p of purchases) { const k = keyOf(p.date); const row = chart.get(k) || { month: k, sales: 0, cost: 0 }; row.cost += Number(p.totalValue || 0); chart.set(k, row); }
  const nowBS = new NepaliDate(now); const currentMonthStart = parseBS(`${nowBS.getYear()}-${String(nowBS.getMonth() + 1).padStart(2, '0')}-01`);
  const priorMonthBS = new NepaliDate(now); priorMonthBS.setDate(1); priorMonthBS.setMonth(priorMonthBS.getMonth() - 1);
  const lastMonth = parseBS(`${priorMonthBS.getYear()}-${String(priorMonthBS.getMonth() + 1).padStart(2, '0')}-01`), nextMonth = currentMonthStart;
  const monthKey = `${nowBS.getYear()}-${String(nowBS.getMonth() + 1).padStart(2, '0')}`, monthStart = currentMonthStart, monthWork = await CustomerWork.aggregate([{ $match: { work_date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
  const monthCost = purchases.filter(p => new Date(p.date) >= monthStart).reduce((s,p) => s + p.totalValue,0);
  const recovered = payments.filter(p => new Date(p.payment_date) >= monthStart).reduce((s,p) => s + p.pay_amount,0);
  const [allWorks, allPays] = await Promise.all([CustomerWork.aggregate([{ $group: { _id: '$customer_id', total: { $sum: '$total' }, oldest: { $min: '$work_date' } } }]), CustomerPayment.aggregate([{ $group: { _id: '$customer_id', total: { $sum: '$pay_amount' }, last: { $max: '$payment_date' } } }])]);
  const payMap = new Map(allPays.map(p => [p._id, p])); const customerMap = new Map(customers.map(c => [c.id,c])); const cutoff = new Date(now.getTime() - 90*86400000);
  const dueCustomers = allWorks.map(w => { const paid = payMap.get(w._id); const due = Math.max(0,w.total-(paid?.total||0)); const refDate = paid?.last || w.oldest; const days = Math.floor((now-new Date(refDate))/86400000); return { customer: customerMap.get(w._id), due, lastPaymentDate: paid?.last || null, daysOverdue: days }; }).filter(x => x.customer && x.due > 0 && new Date(x.lastPaymentDate || allWorks.find(w => w._id === x.customer.id)?.oldest || now) < cutoff).map(x => ({ id:x.customer.id, name:x.customer.name, phone:x.customer.phone_number, amountDue:x.due, lastPaymentDate:x.lastPaymentDate, daysOverdue:x.daysOverdue }));
  const lastMonthRevenue = await CustomerWork.aggregate([{ $match: { work_date: { $gte:lastMonth,$lt:nextMonth } } },{ $group:{_id:null,total:{$sum:'$total'}}}]);
  const lastMonthCost = purchases.filter(p=>new Date(p.date)>=lastMonth&&new Date(p.date)<nextMonth).reduce((s,p)=>s+p.totalValue,0);
  const lastMonthRecovered = payments.filter(p=>new Date(p.payment_date)>=lastMonth&&new Date(p.payment_date)<nextMonth).reduce((s,p)=>s+p.pay_amount,0);
  const bsYear = nowBS.getYear();
  const yearStart = parseBS(`${bsYear}-01-01`);
  const [yearWorks, allYearPayments, remunerations, allStaff] = await Promise.all([
    CustomerWork.find({ work_date: { $gte: yearStart, $lte: now } }).lean(),
    CustomerPayment.find({ payment_date: { $gte: yearStart, $lte: now } }).lean(),
    StaffRemuneration.find({ date: { $gte: yearStart, $lte: now } }).lean(),
    Staff.find({ deletedAt: { $exists: false } }).lean()
  ]);
  const summaryRevenue = yearWorks.reduce((s, w) => s + Number(w.total || 0), 0);
  const summaryRecovered = allYearPayments.reduce((s, p) => s + Number(p.pay_amount || 0), 0);
  const allTimeRevenue = await CustomerWork.aggregate([{ $match: { work_date: { $lte: now } } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
  const allTimeRecovered = await CustomerPayment.aggregate([{ $match: { payment_date: { $lte: now } } }, { $group: { _id: null, total: { $sum: '$pay_amount' } } }]);
  const noSalaryIds = new Set(allStaff.filter(s=>s.noSalary).map(s=>s.id));
  const costThisYear = purchases.filter(p => new Date(p.date) >= yearStart && new Date(p.date) <= now).reduce((s,p) => s + (p.payments || []).filter(x => new Date(x.date) >= yearStart && new Date(x.date) <= now).reduce((a,x)=>a+Number(x.amount||0),0),0) + remunerations.filter(r=>!noSalaryIds.has(r.staff_id)).reduce((s,r)=>s+Number(r.amount||0),0);
  const totals = Object.fromEntries(['Tractor','JCB','Tipper','Unallocated / General'].map(v=>[v,{vehicle:v,revenue:0,cost:0,fuel:0,due:0}]));
  const workTotals = await CustomerWork.aggregate([{ $match: { work_date: { $lte: now } } },{ $group: { _id: '$vehicle_type', revenue: { $sum: '$total' }, total: { $sum: '$total' } } }]);
  const payTotals = await CustomerPayment.aggregate([{ $match: { payment_date: { $lte: now } } },{ $group: { _id: '$customer_id', total: { $sum: '$pay_amount' } } }]);
  const recoveredByCustomer = new Map(payTotals.map(x=>[x._id,x.total]));
  for (const w of workTotals) if (totals[w._id]) totals[w._id].revenue = w.revenue;
  const dueByCustomer = await CustomerWork.aggregate([{ $match: { work_date: { $lte: now } } },{ $group: { _id: '$customer_id', total: { $sum: '$total' } } }]);
  for (const w of dueByCustomer) totals['Unallocated / General'].due += Math.max(0,w.total-(recoveredByCustomer.get(w._id)||0));
  for (const p of allPurchases) { const bucket=totals[p.usedBy]||totals['Unallocated / General']; const paid=(p.payments||[]).filter(x=>new Date(x.date)<=now).reduce((s,x)=>s+Number(x.amount||0),0); bucket.cost+=paid; if(['Fuel','Mobil (oil)'].includes(p.title)) bucket.fuel+=paid; }
  for (const rem of remunerations) { const person=allStaff.find(s=>s.id===rem.staff_id); if (person?.noSalary) continue; const key=person?.assignedVehicle && person.assignedVehicle!=='None' ? person.assignedVehicle : 'Unallocated / General'; totals[key].cost+=Number(rem.amount||0); }
  const vehicleAnalytics=Object.values(totals).map(x=>({...x,revenueFuelRatio:x.fuel?x.revenue/x.fuel:null,revenueCostRatio:x.cost?x.revenue/x.cost:null}));
  const yearCostsByTitle = purchases.filter(p=>new Date(p.date)>=yearStart&&new Date(p.date)<=now).reduce((acc,p)=>{acc[p.title]=(acc[p.title]||0)+(p.payments||[]).filter(x=>new Date(x.date)>=yearStart&&new Date(x.date)<=now).reduce((s,x)=>s+Number(x.amount||0),0);return acc;},{});
  res.json(new ApiResponse(200,'Dashboard data loaded',{ chart:[...chart.values()].sort((a,b)=>a.month.localeCompare(b.month)), summary:{revenue:summaryRevenue,cost:costThisYear,recovered:summaryRecovered,due:Math.max(0,(allTimeRevenue[0]?.total||0)-(allTimeRecovered[0]?.total||0)),year:bsYear}, vehicleAnalytics, yearCostsByTitle, dueCustomers,monthKey }));
});
