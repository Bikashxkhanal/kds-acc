import connectMongo from '../db/mongo.js';
import Customer from '../models/customer.model.js';
import CustomerPayment from '../models/customerPayment.model.js';
import Staff from '../models/staff.model.js';
import StaffPayment from '../models/staffPayment.model.js';
import Supplier from '../models/supplier.model.js';
import Company from '../models/company.model.js';
import puppeteer from 'puppeteer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { formatBS } from '../utils/bsDate.js';
import { amountToWords } from '../utils/numberToWords.js';

const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const downloadReceipt = asyncHandler(async (req,res) => {
  await connectMongo(); const { type,id }=req.params; let payment,person,name,amount,date,mode,notes,receiptNo;
  if(type==='customer'){ payment=await CustomerPayment.findOne({id:Number(id)}).lean(); person=payment&&await Customer.findOne({id:payment.customer_id}).lean(); name=payment?.payers_name&&payment.payers_name!=='self'?payment.payers_name:person?.name; amount=payment?.pay_amount; date=payment?.payment_date; mode=payment?.payment_mode; notes=payment?.notes; receiptNo=payment?.receiptNo; }
  else if(type==='staff'){ payment=await StaffPayment.findOne({id:Number(id)}).lean(); person=payment&&await Staff.findOne({id:payment.staff_id}).lean(); name=person?.name; amount=payment?.amount; date=payment?.date; mode=payment?.payment_mode; notes=payment?.discription; receiptNo=payment?.receiptNo; }
  else if(type==='supplier'){ const supplier=await Supplier.findOne({'payments._id':id}).lean(); payment=supplier?.payments.find(p=>String(p._id)===id); name=supplier?.name; amount=payment?.amount; date=payment?.date; mode=payment?.mode; notes=payment?.notes; receiptNo=payment?.receiptNo; }
  if(!payment) throw new ApiError(404,'Payment receipt not found');
  const company=await Company.findOne({isActive:true}).sort({createdAt:1}).lean();
  const html=`<!doctype html><html><head><meta charset="utf-8"><style>@page{size:5.5in 8.5in;margin:0}*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#1e293b;margin:0}.sheet{width:5.5in;height:8.5in;padding:.45in;border:1px solid #dbe3ee;position:relative}.brand{text-align:center;border-bottom:2px solid #12355b;padding-bottom:18px}.brand h1{font-size:24px;margin:0 0 6px;color:#12355b}.brand p{margin:3px;color:#64748b}.title{text-align:center;margin:24px 0;font-size:19px;letter-spacing:2px;font-weight:bold}.rows{border:1px solid #dbe3ee;border-radius:8px;overflow:hidden}.row{display:flex;justify-content:space-between;gap:12px;padding:12px;border-bottom:1px solid #e8edf3}.row:last-child{border:0}.label{color:#64748b}.amount{margin:16px 0;padding:16px;background:#f1f5f9;border-radius:8px;text-align:center}.amount strong{font-size:24px}.words{font-size:12px;margin-top:8px}.note{margin-top:18px;color:#475569}.sig{position:absolute;bottom:.55in;right:.45in;width:1.7in;border-top:1px solid #64748b;padding-top:8px;text-align:center;font-size:12px}.footer{position:absolute;bottom:.2in;left:.45in;color:#94a3b8;font-size:10px}</style></head><body><div class="sheet"><header class="brand"><h1>${esc(company?.name||'Business')}</h1><p>${esc(company?.address||'')}</p><p>${company?.phone?esc(company.phone):''}</p></header><div class="title">PAYMENT RECEIPT</div><div class="rows"><div class="row"><span class="label">Receipt number</span><strong>${esc(receiptNo||'—')}</strong></div><div class="row"><span class="label">Date</span><strong>${esc(formatBS(date,'long','en'))}</strong></div><div class="row"><span class="label">${type==='customer'?'Received from':'Paid to'}</span><strong>${esc(name||'—')}</strong></div><div class="row"><span class="label">Payment type</span><strong>${esc(type)}</strong></div><div class="row"><span class="label">Payment mode</span><strong>${esc(mode||'cash')}</strong></div></div><div class="amount"><strong>Rs. ${Number(amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</strong><div class="words">${esc(amountToWords(amount||0))}</div></div><p class="note"><b>Notes:</b> ${esc(notes||'—')}</p><div class="sig">Authorized Signature</div><div class="footer">Thank you. Keep this receipt for your records.</div></div></body></html>`;
  const browser=await puppeteer.launch({headless:true}); let pdf;
  try{const page=await browser.newPage();await page.setContent(html,{waitUntil:'networkidle0'});pdf=await page.pdf({width:'5.5in',height:'8.5in',printBackground:true,preferCSSPageSize:true,margin:{top:'0',right:'0',bottom:'0',left:'0'}});}finally{await browser.close();}
  res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="receipt-${receiptNo||id}.pdf"`});res.send(pdf);
});
