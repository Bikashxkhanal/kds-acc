import connectMongo from '../db/mongo.js';
import Customer from '../models/customer.model.js';
import CustomerPayment from '../models/customerPayment.model.js';
import Staff from '../models/staff.model.js';
import StaffPayment from '../models/staffPayment.model.js';
import Supplier from '../models/supplier.model.js';
import Company from '../models/company.model.js';
import { launchPdfBrowser, logPdfError } from '../utils/pdf.js';
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
  const html=`<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 5.5in;margin:0}*{box-sizing:border-box}body{font:13px Arial,sans-serif;color:#1e293b;margin:0;overflow-wrap:anywhere}.sheet{width:8.5in;height:5.5in;padding:.3in;border:1px solid #dbe3ee;position:relative}.brand{text-align:center;border-bottom:2px solid #12355b;padding-bottom:8px}.brand img{display:block;max-height:42px;max-width:120px;object-fit:contain;margin:0 auto 4px}.brand h1{font-size:21px;margin:0 0 4px;color:#12355b}.brand p{margin:2px;color:#64748b}.title{text-align:center;margin:10px 0;font-size:17px;letter-spacing:2px;font-weight:bold}.rows{border:1px solid #dbe3ee;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr}.row{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid #e8edf3;min-width:0}.row strong{max-width:72%;text-align:right}.row:nth-child(odd){border-right:1px solid #e8edf3}.row:last-child{border-bottom:0}.label{color:#64748b}.amount{margin:10px 0;padding:10px;background:#f1f5f9;border-radius:8px;text-align:center}.amount strong{font-size:21px}.words{font-size:11px;margin-top:4px}.note{margin-top:8px;color:#475569;max-width:65%;overflow-wrap:anywhere}.sig{position:absolute;bottom:.42in;right:.3in;width:1.7in;border-top:1px solid #64748b;padding-top:6px;text-align:center;font-size:11px}.footer{position:absolute;bottom:.18in;left:.3in;color:#94a3b8;font-size:9px}</style></head><body><div class="sheet"><header class="brand">${company?.logoUrl?`<img src="${esc(company.logoUrl)}" alt="Logo">`:''}<h1>${esc(company?.name||'Business')}</h1><p>${esc(company?.address||'')}</p><p>${company?.phone?esc(company.phone):''}${company?.email?` · ${esc(company.email)}`:''}</p><p><b>PAN: ${esc(company?.pan||'N/A')}</b></p></header><div class="title">PAYMENT RECEIPT</div><div class="rows"><div class="row"><span class="label">Receipt number</span><strong>${esc(receiptNo||'—')}</strong></div><div class="row"><span class="label">Date</span><strong>${esc(formatBS(date,'long','en'))}</strong></div><div class="row"><span class="label">${type==='customer'?'Received from':'Paid to'}</span><strong>${esc(name||'—')}</strong></div><div class="row"><span class="label">Payment type</span><strong>${esc(type)}</strong></div><div class="row"><span class="label">Payment mode</span><strong>${esc(mode||'cash')}</strong></div></div><div class="amount"><strong>Rs. ${Number(amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</strong><div class="words">${esc(amountToWords(amount||0))}</div></div><p class="note"><b>Notes:</b> ${esc(notes||'—')}</p><div class="sig">Authorized Signature</div><div class="footer">Thank you. Keep this receipt for your records.</div></div></body></html>`;
  let browser; let pdf;
  try{browser=await launchPdfBrowser();const page=await browser.newPage();await page.setContent(html,{waitUntil:'networkidle0'});pdf=await page.pdf({width:'8.5in',height:'5.5in',printBackground:true,preferCSSPageSize:true,margin:{top:'0',right:'0',bottom:'0',left:'0'}});}
  catch(error){logPdfError(`receipt ${receiptNo||id}`,error);throw new ApiError(500,'Unable to generate payment receipt PDF. Please try again.');}
  finally{if(browser)await browser.close();}
  res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="receipt-${receiptNo||id}.pdf"`});res.send(pdf);
});
