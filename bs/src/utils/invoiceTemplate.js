import { amountToWords } from "./numberToWords.js";

const currency = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const statusColor = (status) => {
  if (status === "paid") return "#059669";
  if (status === "partial") return "#ea580c";
  return "#dc2626";
};

export const buildInvoiceHtml = (invoice = {}) => {
  const {
    invoiceNumber = "DRAFT",
    billNumber = "",
    company = {},
    customer = {},
    billDate,
    dueDate,
    remarks = "",
    items = [],
    totals = {},
    paymentStatus = "unpaid",
    creator = {},
    createdAt
  } = invoice;

  const itemRows = items.length
    ? items.map((item, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td>
            <strong>${escapeHtml(item.productName)}</strong>
            ${item.description ? `<br><small>${escapeHtml(item.description)}</small>` : ""}
          </td>
          <td class="center">${item.quantity}</td>
          <td class="center">${escapeHtml(item.unit)}</td>
          <td class="right">${currency.format(item.rate || 0)}</td>
          <td class="right">${currency.format(item.discount || 0)}</td>
          <td class="right"><strong>${currency.format(item.total || 0)}</strong></td>
        </tr>`).join("")
    : `<tr><td colspan="7" class="center muted">No items</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; }
    .invoice { max-width: 210mm; margin: 0 auto; }

    .header { background: #12355b; color: white; padding: 14px 18px; display: flex; justify-content: space-between; gap: 20px; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { font-size: 10px; opacity: 0.85; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-right .title { font-size: 20px; font-weight: bold; letter-spacing: 2px; }

    .parties { display: flex; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
    .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; text-transform: uppercase;
              color: white; background: ${statusColor(paymentStatus)}; }

    .items { padding: 10px 18px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 8px 6px; text-align: left; font-size: 9px; text-transform: uppercase;
         letter-spacing: 0.5px; color: #64748b; border: 1px solid #e2e8f0; }
    td { padding: 5px 6px; border: 1px solid #e2e8f0; vertical-align: top; }
    tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
    .center { text-align: center; }
    .right { text-align: right; }
    .muted { color: #94a3b8; }

    .summary { display: flex; justify-content: space-between; padding: 0 24px 16px; gap: 24px; }
    .summary-left { flex: 1; }
    .summary-right { width: 220px; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
    .summary-row.grand { border-top: 2px solid #12355b; margin-top: 6px; padding-top: 8px; font-weight: bold; font-size: 13px; color: #12355b; }
    .words { font-style: italic; color: #64748b; font-size: 10px; margin-top: 8px; }

    .signatures { display: flex; justify-content: space-between; padding: 20px 24px; border-top: 1px solid #e2e8f0; }
    .sig-block { width: 22%; }
    .sig-line { border-top: 1px solid #64748b; margin-top: 40px; padding-top: 4px; font-size: 10px; }
    .stamp { border: 1px dashed #cbd5e1; height: 50px; margin-top: 8px; border-radius: 4px; }

    .footer { background: #f8fafc; padding: 10px 24px; font-size: 9px; color: #94a3b8;
              display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>${escapeHtml(company.name || "Company Name")}</h1>
        ${company.pan ? `<p style="font-weight:700;color:#fff">PAN: ${escapeHtml(company.pan)}</p>` : ""}
        <p>${escapeHtml(company.address || "")}</p>
        <p>${[company.phone, company.email].filter(Boolean).map(escapeHtml).join(" · ")}</p>
      </div>
      <div class="header-right">
        <div class="title">INVOICE</div>
        <p style="margin-top:8px">Invoice #: <strong>${escapeHtml(invoiceNumber)}</strong></p>
        ${billNumber ? `<p>Bill #: <strong>${escapeHtml(billNumber)}</strong></p>` : ""}
        <p>Date: ${formatDate(billDate)}</p>
        ${dueDate ? `<p>Due: ${formatDate(dueDate)}</p>` : ""}
        <div style="border-top:1px solid rgba(255,255,255,.3);margin-top:8px;padding-top:8px">
          <p style="text-transform:uppercase;letter-spacing:1px;font-size:9px">Bill To</p>
          <p style="font-weight:700;color:#fff">${escapeHtml(customer.name || "")}</p>
          <p>${escapeHtml(customer.address || "")}</p>
          ${customer.phone ? `<p>Phone: ${escapeHtml(customer.phone)}</p>` : ""}
          <p style="margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-size:9px">Payment Status</p>
          <p style="font-weight:700;color:#fff;text-transform:capitalize">${escapeHtml(paymentStatus)}</p>
        </div>
      </div>
    </div>

    <div class="items">
      <table>
        <thead>
          <tr>
            <th style="width:4%">#</th>
            <th style="width:28%">Product / Service</th>
            <th style="width:8%" class="center">Qty</th>
            <th style="width:8%" class="center">Unit</th>
            <th style="width:12%" class="right">Rate</th>
            <th style="width:10%" class="right">Disc.</th>
            <th style="width:16%" class="right">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div class="summary">
      <div class="summary-left">
        ${remarks ? `<div class="label">Remarks</div><p style="margin-bottom:8px">${escapeHtml(remarks)}</p>` : ""}
        <p class="words">Amount in words: <strong>${amountToWords(totals.grandTotal || 0)}</strong></p>
      </div>
      <div class="summary-right">
        <div class="summary-row"><span>Subtotal</span><span>Rs. ${currency.format(totals.subtotal || 0)}</span></div>
        <div class="summary-row"><span>Discount</span><span>Rs. ${currency.format(totals.discount || 0)}</span></div>
        <div class="summary-row"><span>Taxable Amount</span><span>Rs. ${currency.format(totals.taxableAmount || 0)}</span></div>
        <div class="summary-row"><span>Tax Amount (${totals.taxRate || 0}%)</span><span>Rs. ${currency.format(totals.tax || 0)}</span></div>
        <div class="summary-row grand"><span>Grand Total</span><span>Rs. ${currency.format(totals.grandTotal || 0)}</span></div>
        <div class="summary-row"><span>Paid Amount</span><span>Rs. ${currency.format(totals.paidAmount || 0)}</span></div>
        <div class="summary-row"><span>Remaining</span><span>Rs. ${currency.format(totals.remainingAmount || 0)}</span></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="label">Prepared By</div>
        <div class="sig-line">${escapeHtml(creator.name || "—")}</div>
        <p class="muted">${formatDate(createdAt || billDate)}</p>
      </div>
      <div class="sig-block">
        <div class="label">Customer Signature</div>
        <div class="sig-line">&nbsp;</div>
      </div>
      <div class="sig-block">
        <div class="label">Authorized Signature</div>
        <div class="sig-line">&nbsp;</div>
      </div>
      <div class="sig-block">
        <div class="label">Company Stamp</div>
        <div class="stamp"></div>
      </div>
    </div>

    <div class="footer">
      <span>Generated by KDS Billing System</span>
      <span>${formatDate(new Date())}</span>
    </div>
  </div>
</body>
</html>`;
};
