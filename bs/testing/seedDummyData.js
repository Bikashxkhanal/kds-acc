import { ensureDummySeedEnvironment } from './dummySeedSafety.js';
import connectMongo from '../src/db/mongo.js';
import Customer from '../src/models/customer.model.js';
import CustomerWork from '../src/models/customerWork.model.js';
import CustomerPayment from '../src/models/customerPayment.model.js';
import Staff from '../src/models/staff.model.js';
import StaffRemuneration from '../src/models/staffRemuneration.model.js';
import StaffPayment from '../src/models/staffPayment.model.js';
import Purchase from '../src/models/purchase.model.js';
import Invoice from '../src/models/invoice.model.js';
import SysUser from '../src/models/sysUser.model.js';
import bcrypt from 'bcrypt';
import { getNextSequence } from '../src/utils/autoIncrement.js';

ensureDummySeedEnvironment();
await connectMongo();

const modelsToClear = [Invoice, Purchase, StaffPayment, StaffRemuneration, CustomerPayment, CustomerWork, Staff, Customer, SysUser];
await Promise.all(modelsToClear.map((Model) => Model.deleteMany({ isDummy: true })));
await SysUser.create({ id: await getNextSequence('sysUser'), name: 'Demo Operator', phone_number: '9899990000', email: 'demo.operator@example.test', address: 'Demo account', hashed_password: await bcrypt.hash('DemoOnly2026!', 10), isDummy: true });
const shiftDays = (daysAgo) => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - daysAgo); return d; };
const customerNames = ['Aarav Construction', 'Sita Suppliers', 'Himalayan Agro', 'Green Valley NGO', 'Dudhauli Municipality', 'Janajyoti School', 'Rural Roads Group', 'Maya Thapa', 'Everest Builders', 'Community Forest Group', 'Sunrise Farm', 'Sajilo Housing', 'Koshi Contractors', 'Nawa Jeevan NGO', 'Om Works', 'Shree Ganesh Traders', 'B.P. Community Campus', 'Pragati Infrastructure'];
const locations = ['Dudhauli', 'Sindhuli', 'Kathmandu', 'Kamalamai', 'Hetauda', 'Janakpur'];
const customers = [];
for (let index = 0; index < customerNames.length; index += 1) {
  const id = await getNextSequence('customer');
  customers.push(await Customer.create({ id, name: customerNames[index], phone_number: String(9800001000 + index), address: `${locations[index % locations.length]}, Nepal`, customer_type: ['Private', 'Governmental', 'NGO'][index % 3], isDummy: true }));
}

const titleByVehicle = {
  Tractor: ['Cultivation Rotavator', 'Cultivation Cultivator', 'Boulders', 'Gravel', 'Soil', 'Sand', 'Puddling'],
  JCB: ['Excavation'],
  Tipper: ['Gravel', 'Soil', 'Sand']
};
const vehicles = Object.keys(titleByVehicle);
const totalsByCustomer = new Map(customers.map((customer) => [customer.id, 0]));
for (let day = 0; day < 90; day += 1) {
  const customer = customers[(day * 7 + 3) % customers.length];
  const vehicle_type = vehicles[day % vehicles.length];
  const quantity = 1 + (day % 4);
  const rate = 2200 + (day % 8) * 375;
  const total = quantity * rate;
  const id = await getNextSequence('customerWork');
  await CustomerWork.create({ id, customer_id: customer.id, vehicle_type, title: titleByVehicle[vehicle_type][day % titleByVehicle[vehicle_type].length], description: `Dummy work entry ${day + 1}`, quantity: String(quantity), quantity_unit_notation: ['hours', 'tip', 'cubemeter'][day % 3], rate, total, work_date: shiftDays(day), isDummy: true });
  totalsByCustomer.set(customer.id, totalsByCustomer.get(customer.id) + total);
}
// Keep a clearly overdue unpaid work record for the aged-dues dashboard.
const agedCustomer = customers[2];
const agedId = await getNextSequence('customerWork');
const agedTotal = 18500;
await CustomerWork.create({ id: agedId, customer_id: agedCustomer.id, vehicle_type: 'JCB', title: 'Excavation', description: 'Dummy overdue work', quantity: '5', quantity_unit_notation: 'hours', rate: 3700, total: agedTotal, work_date: shiftDays(105), isDummy: true });
totalsByCustomer.set(agedCustomer.id, totalsByCustomer.get(agedCustomer.id) + agedTotal);

for (let index = 0; index < customers.length; index += 1) {
  const customer = customers[index]; const total = totalsByCustomer.get(customer.id);
  if (index === 2) continue;
  const paidRatio = index === 0 || index === 4 || index === 7 ? 1 : index === 1 ? 0.4 : index === 3 ? 0.25 : index % 2 ? 0.6 : 0.85;
  const amount = Math.round(total * paidRatio);
  const id = await getNextSequence('customerPayment');
  await CustomerPayment.create({ id, customer_id: customer.id, pay_amount: amount, payment_mode: ['cash', 'mobile banking', 'cheque'][index % 3], payers_name: `${customer.name} accounts`, payment_date: shiftDays(index === 3 ? 100 : (index * 5) % 75), isDummy: true });
}

const roles = ['Tractor Driver', 'JCB Operator', 'Tipper Driver', 'Helper', 'Accountant', 'Manager', 'Other', 'Tractor Driver', 'JCB Operator'];
const staffList = [];
for (let index = 0; index < roles.length; index += 1) {
  const id = await getNextSequence('staff');
  staffList.push(await Staff.create({ id, name: ['Ramesh Karki', 'Laxmi Rai', 'Bikram Tamang', 'Sanjay Magar', 'Anita Shrestha', 'Prakash Ale', 'Mina Lama', 'Hari Bahadur', 'Sushil Thapa'][index], phone_number: String(9811112000 + index), email: index % 3 ? `staff${index + 1}@example.test` : '', role: roles[index], assignedVehicle: ['Tractor', 'JCB', 'Tipper', 'None'][index % 4], address: `${locations[index % locations.length]}, Nepal`, dob: shiftDays(9000 + index * 120), dateOfJoining: shiftDays(1000 + index * 45), salary: 18000 + index * 2500, paymentType: index % 4 === 3 ? 'Daily' : 'Monthly', idProofType: index % 2 ? 'Citizenship' : 'Driving License', idProofNumber: `DUMMY-ID-${index + 1}`, emergencyContactName: `Emergency Contact ${index + 1}`, emergencyContactPhone: String(9822223000 + index), status: index === 8 ? 'Inactive' : 'Active', notes: 'Dummy staff profile', isDummy: true }));
  const remunerationId = await getNextSequence('staffRemuneration');
  await StaffRemuneration.create({ id: remunerationId, staff_id: id, title: 'salary', discription: 'Dummy monthly remuneration', amount: 18000 + index * 2500, date: shiftDays(20), isDummy: true });
  const paymentId = await getNextSequence('staffPayment');
  await StaffPayment.create({ id: paymentId, staff_id: id, discription: 'Dummy salary payment', amount: 15000 + index * 2000, date: shiftDays(10), isDummy: true });
}

for (let index = 0; index < 24; index += 1) {
  const totalValue = 8500 + index * 2150;
  const status = index % 3;
  const paidAmount = status === 0 ? 0 : status === 1 ? Math.round(totalValue * 0.45) : totalValue;
  await Purchase.create({ billNo: `DUMMY-P-${String(index + 1).padStart(3, '0')}`, description: ['Fuel and lubricants', 'Spare parts', 'Equipment service', 'Tires and tubes'][index % 4], totalValue, supplier: ['Sindhuli Auto Parts', 'Koshi Fuel Centre', 'Himalayan Machinery'][index % 3], date: shiftDays((index * 3) % 88), usedBy: vehicles[index % 3], payments: paidAmount ? [{ amount: paidAmount, date: shiftDays((index * 3) % 88), note: 'Dummy initial payment' }] : [], isDummy: true });
}

const company = { name: 'KDS Demo Transport', address: 'Dudhauli, Sindhuli, Nepal', phone: '9800000000', pan: 'DUMMY-PAN' };
for (let index = 0; index < 6; index += 1) {
  const customer = customers[index * 2]; const subtotal = 24000 + index * 5500; const taxRate = 13; const tax = subtotal * taxRate / 100; const grandTotal = subtotal + tax;
  const paidAmount = index % 3 === 0 ? grandTotal : index % 3 === 1 ? grandTotal * 0.4 : 0;
  const remainingAmount = grandTotal - paidAmount;
  const serial = `${Date.now()}-${index + 1}`;
  await Invoice.create({ invoiceNumber: `DUMMY-INV-${serial}`, billNumber: `DUMMY-BILL-${serial}`, company, customer: { name: customer.name, address: customer.address, phone: customer.phone_number }, billDate: shiftDays(index * 7), dueDate: shiftDays(index * 7 - 30), remarks: 'Sample invoice generated by the dummy data seed.', items: [{ productName: 'Vehicle work and transport', description: 'Dummy invoice item', quantity: 1, unit: 'Trips', rate: subtotal, discount: 0, total: subtotal }], totals: { subtotal, discount: 0, taxableAmount: subtotal, taxRate, tax, grandTotal, paidAmount, remainingAmount }, paymentStatus: remainingAmount === 0 ? 'paid' : paidAmount ? 'partial' : 'unpaid', creator: { name: 'Demo User' }, lastUpdatedBy: { name: 'Demo User' }, isDummy: true });
}

console.log(`Dummy data seeded in ${process.env.DUMMY_DB_NAME}: demo login plus ${customers.length} customers, ${staffList.length} staff, 91 sales, 24 purchases, and 6 invoices.`);
await Customer.db.close();
