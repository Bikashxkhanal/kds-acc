import connectMongo from '../db/mongo.js';
import Customer from '../models/customer.model.js';
import CustomerPayment from '../models/customerPayment.model.js';
import Staff from '../models/staff.model.js';
import StaffPayment from '../models/staffPayment.model.js';
import Supplier from '../models/supplier.model.js';
import Company from '../models/company.model.js';
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';
import { launchPdfBrowser, logPdfError, logPdfStage } from '../utils/pdf.js';
import { ApiError } from '../utils/ApiError.js';
import { formatBS } from '../utils/bsDate.js';
import { amountToWords } from '../utils/numberToWords.js';

const devanagariFont = readFileSync(new URL('../../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', import.meta.url)).toString('base64');

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const display = (value, fallback = '—') => value == null || value === '' ? fallback : String(value);
const numericAmount = value => {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const downloadReceipt = async (req, res) => {
  const { type, id } = req.params;
  const lang = req.query.lang === 'np' ? 'np' : 'en';
  const context = `receipt type=${type} id=${id} lang=${lang}`;
  let stage = 'route received';
  let browser;
  try {
    logPdfStage(context, stage, { type, id, lang });
    if (!['customer', 'staff', 'supplier'].includes(type)) throw new ApiError(404, 'Receipt type not found');
    if (!id || (type === 'supplier' && !mongoose.isValidObjectId(id)) || (type !== 'supplier' && (!Number.isSafeInteger(Number(id)) || Number(id) <= 0))) {
      throw new ApiError(422, 'Invalid receipt ID');
    }

    stage = 'connecting to database';
    await connectMongo();
    let payment;
    let related;
    let name;
    let amount;
    let date;
    let mode;
    let notes;
    let receiptNo;

    stage = 'loading receipt record and related data';
    if (type === 'customer') {
      payment = await CustomerPayment.findOne({ id: Number(id) }).lean();
      if (payment) related = await Customer.findOne({ id: payment.customer_id }).lean();
      name = payment?.payers_name && payment.payers_name !== 'self' ? payment.payers_name : related?.name;
      amount = payment?.pay_amount;
      date = payment?.payment_date;
      mode = payment?.payment_mode;
      notes = payment?.notes;
      receiptNo = payment?.receiptNo;
    } else if (type === 'staff') {
      payment = await StaffPayment.findOne({ id: Number(id) }).lean();
      if (payment) related = await Staff.findOne({ id: payment.staff_id }).lean();
      name = related?.name;
      amount = payment?.amount;
      date = payment?.date;
      mode = payment?.payment_mode;
      notes = payment?.discription;
      receiptNo = payment?.receiptNo;
    } else {
      const supplier = await Supplier.findOne({ 'payments._id': id }).lean();
      payment = supplier?.payments?.find(item => String(item._id) === id);
      related = supplier;
      name = supplier?.name;
      amount = payment?.amount;
      date = payment?.date;
      mode = payment?.mode;
      notes = payment?.notes;
      receiptNo = payment?.receiptNo;
    }
    logPdfStage(context, 'receipt and related data loaded', {
      found: !!payment,
      relatedRecordFound: !!related,
      receiptNo: receiptNo || null
    });
    if (!payment) throw new ApiError(404, 'Payment receipt not found');

    const value = numericAmount(amount);
    if (value == null) throw new ApiError(422, 'Receipt amount is missing or invalid');

    stage = 'loading company data';
    const company = await Company.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
    logPdfStage(context, 'company data loaded', { found: !!company });

    stage = 'converting date to Nepali BS';
    const bsDate = formatBS(date, 'long', lang);
    logPdfStage(context, 'Nepali BS date conversion done', { hasDate: !!date, result: bsDate });

    const rLabels = lang === 'np' ? {
      title: 'भुक्तानी रसिद',
      receiptNo: 'रसिद नं.',
      date: 'मिति',
      partyCol: type === 'customer' ? 'रकम बुझाउने' : 'रकम पाउने',
      paymentType: 'भुक्तानी प्रकार',
      paymentMode: 'भुक्तानी माध्यम',
      customer: 'ग्राहक',
      supplier: 'सप्लायर',
      staff: 'कर्मचारी',
      cash: 'नगद',
      cheque: 'चेक',
      mobileBanking: 'मोबाइल बैंकिङ',
      bankTransfer: 'बैंक ट्रान्सफर',
      notes: 'कैफियत',
      sig: 'अधिकृत हस्ताक्षर',
      pan: 'स्थायी लेखा नं. (PAN)',
      footer: 'धन्यवाद। यो रसिद सुरक्षित राख्नुहोला।'
    } : {
      title: 'PAYMENT RECEIPT',
      receiptNo: 'Receipt number',
      date: 'Date',
      partyCol: type === 'customer' ? 'Received from' : 'Paid to',
      paymentType: 'Payment type',
      paymentMode: 'Payment mode',
      customer: 'Customer',
      supplier: 'Supplier',
      staff: 'Staff',
      cash: 'Cash',
      cheque: 'Cheque',
      mobileBanking: 'Mobile Banking',
      bankTransfer: 'Bank Transfer',
      notes: 'Notes',
      sig: 'Authorized Signature',
      pan: 'PAN',
      footer: 'Thank you. Keep this receipt for your records.'
    };

    const typeDisplay = rLabels[type] || type;
    const modeKey = String(mode || 'cash').toLowerCase().replace(/\s+/g, '');
    const modeDisplay = modeKey === 'mobilebanking' ? rLabels.mobileBanking : modeKey === 'cheque' ? rLabels.cheque : modeKey === 'banktransfer' ? rLabels.bankTransfer : rLabels.cash;

    const formattedAmount = lang === 'np'
      ? `रु. ${new Intl.NumberFormat('ne-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`.replace(/\d/g, d => '०१२३४५६७८९'[d])
      : `Rs. ${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    stage = 'building HTML';
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 5.5in;margin:0}*{box-sizing:border-box}@font-face{font-family:'Noto Sans Devanagari';src:url(data:font/woff2;base64,${devanagariFont}) format('woff2');font-weight:400}html,body{background:#fff}body{font:12px 'Noto Sans Devanagari',Arial,sans-serif;color:#1e293b;margin:0;overflow-wrap:anywhere;line-height:1.4}.sheet{width:8.5in;height:5.5in;padding:.3in;border:1px solid #dbe3ee;position:relative}.brand{text-align:center;border-bottom:2px solid #12355b;padding-bottom:8px}.brand img{display:block;max-height:42px;max-width:120px;object-fit:contain;margin:0 auto 4px}.brand h1{font-size:20px;margin:0 0 4px;color:#12355b}.brand p{margin:2px;color:#64748b;font-size:11px}.title{text-align:center;margin:10px 0;font-size:16px;letter-spacing:1px;font-weight:bold;color:#12355b}.rows{border:1px solid #dbe3ee;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr}.row{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-bottom:1px solid #e8edf3;min-width:0}.row strong{max-width:72%;text-align:right}.row:nth-child(odd){border-right:1px solid #e8edf3}.row:last-child{border-bottom:0}.label{color:#64748b}.amount{margin:10px 0;padding:10px;background:#f1f5f9;border-radius:8px;text-align:center}.amount strong{font-size:20px;color:#12355b}.words{font-size:11px;margin-top:4px;color:#334155}.note{margin-top:8px;color:#475569;max-width:65%;overflow-wrap:anywhere;font-size:11px}.sig{position:absolute;bottom:.42in;right:.3in;width:1.7in;border-top:1px solid #64748b;padding-top:6px;text-align:center;font-size:11px}.footer{position:absolute;bottom:.18in;left:.3in;color:#94a3b8;font-size:9px}</style></head><body><div class="sheet"><header class="brand">${company?.logoUrl ? `<img src="${esc(company.logoUrl)}" alt="Logo">` : ''}<h1>${esc(company?.name || 'Business')}</h1><p>${esc(company?.address || '')}</p><p>${company?.phone ? esc(company.phone) : ''}${company?.email ? ` · ${esc(company.email)}` : ''}</p><p><b>${rLabels.pan}: ${esc(company?.pan || 'N/A')}</b></p></header><div class="title">${rLabels.title}</div><div class="rows"><div class="row"><span class="label">${rLabels.receiptNo}</span><strong>${esc(display(receiptNo))}</strong></div><div class="row"><span class="label">${rLabels.date}</span><strong>${esc(bsDate)}</strong></div><div class="row"><span class="label">${rLabels.partyCol}</span><strong>${esc(display(name))}</strong></div><div class="row"><span class="label">${rLabels.paymentType}</span><strong>${esc(typeDisplay)}</strong></div><div class="row"><span class="label">${rLabels.paymentMode}</span><strong>${esc(modeDisplay)}</strong></div></div><div class="amount"><strong>${formattedAmount}</strong><div class="words">${esc(amountToWords(value, lang))}</div></div><p class="note"><b>${rLabels.notes}:</b> ${esc(display(notes))}</p><div class="sig">${rLabels.sig}</div><div class="footer">${rLabels.footer}</div></div></body></html>`;
    logPdfStage(context, 'HTML built', { htmlLength: html.length });

    stage = 'launching PDF browser';
    logPdfStage(context, stage);
    browser = await launchPdfBrowser();
    const page = await browser.newPage();
    stage = 'setting PDF page content';
    logPdfStage(context, stage);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    stage = 'rendering PDF';
    logPdfStage(context, stage);
    const pdf = await page.pdf({ width: '8.5in', height: '5.5in', printBackground: true, preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    logPdfStage(context, 'PDF buffer produced', { bytes: pdf.length });

    stage = 'sending PDF response';
    const filename = String(receiptNo || id).replace(/[^\w.-]/g, '_');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="receipt-${filename}.pdf"` });
    res.send(pdf);
    logPdfStage(context, 'response sent', { status: 200, bytes: pdf.length });
  } catch (error) {
    logPdfError(context, error, stage);
    if (res.headersSent) return;
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    const message = status >= 500 ? 'Unable to generate this receipt PDF. Please retry; if it continues, contact support.' : error.message;
    const body = { success: false, message };
    if (process.env.NODE_ENV !== 'production') Object.assign(body, { stage, error: error?.message || String(error) });
    res.status(status).json(body);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (error) { logPdfError(context, error, 'closing PDF browser'); }
    }
  }
};
