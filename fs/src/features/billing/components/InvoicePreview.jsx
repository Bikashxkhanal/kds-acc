import { formatCurrency, formatNumber } from "../../../utils/currency";
import { amountToWords } from "../../../utils/numberToWords";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const InvoicePreview = ({ invoice = {}, creatorName = "", compact = false }) => {
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
    creator,
    createdAt,
    updatedAt,
    lastUpdatedBy
  } = invoice;

  const displayCreator = creator?.name || creatorName || "—";

  return (
    <div className={`invoice-print-area bg-white text-slate-800 ${compact ? "text-xs" : "text-sm"}`}>
        <div className="invoice-shell border border-slate-300 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#12355b] text-white px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="h-12 mb-2 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <i className="bi bi-building text-xl" />
              </div>
            )}
            <h2 className="text-lg font-bold">{company.name || "Company Name"}</h2>
            {company.pan && <p className="font-semibold text-white mt-1">PAN: {company.pan}</p>}
            <p className="text-sky-200/90 mt-1 max-w-xs">{company.address || "Address"}</p>
            <p className="text-sky-200/80 mt-1">
              {[company.phone, company.email].filter(Boolean).join(" · ") || "Contact"}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-2xl font-bold tracking-wide">INVOICE</p>
            <p className="mt-2">Invoice Number: <strong>{invoiceNumber}</strong></p>
            {billNumber && <p>Bill Number: <strong>{billNumber}</strong></p>}
            <p className="mt-1">Invoice Date: {formatDate(billDate)}</p>
            {dueDate && <p>Due Date: {formatDate(dueDate)}</p>}
            <div className="mt-3 border-t border-white/20 pt-3 text-sm md:ml-auto md:max-w-xs">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Bill To</p>
              <p className="font-semibold">Customer Name: {customer.name || "Customer Name"}</p>
              <p className="text-sky-100/85">Customer Address: {customer.address || "Address"}</p>
              {customer.phone && <p className="text-sky-100/85">Phone Number: {customer.phone}</p>}
              {customer.pan && <p className="text-sky-100/85">PAN Number: {customer.pan}</p>}
              <p className="mt-2 text-sky-200 text-xs uppercase tracking-wider">Payment Status</p>
              <span className="font-semibold capitalize">{paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="px-5 py-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs uppercase tracking-wider">
                <th className="border border-slate-200 px-2 py-2 text-left w-8">#</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Product / Service</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">Qty</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">Unit</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-24">Rate</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-20">Disc.</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-200 px-4 py-6 text-center text-slate-400">
                    Add line items to preview invoice
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="border border-slate-200 px-2 py-1.5 text-center">{idx + 1}</td>
                    <td className="border border-slate-200 px-2 py-1.5">
                      <p className="font-medium">{item.productName || "—"}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-center">{item.quantity}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-center">{item.unit}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">{formatNumber(item.rate)}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right">{formatNumber(item.discount || 0)}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-right font-medium">{formatNumber(item.total || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-5 pb-3 flex flex-col md:flex-row gap-5">
          <div className="flex-1">
            {remarks && (
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Remarks</p>
                <p className="text-slate-600 mt-1">{remarks}</p>
              </div>
            )}
            <p className="text-xs text-slate-500 italic">
              Amount in words: <strong>{amountToWords(totals.grandTotal || 0)}</strong>
            </p>
          </div>
          <div className="w-full md:w-64 space-y-1 text-sm">
            {[
              ["Subtotal", totals.subtotal],
              ["Discount", totals.discount],
              ["Taxable Amount", totals.taxableAmount],
              [`Tax Amount (${totals.taxRate || 0}%)`, totals.tax],
              ["Grand Total", totals.grandTotal, true],
              ["Paid Amount", totals.paidAmount],
              ["Remaining", totals.remainingAmount]
            ].map(([label, value, bold]) => (
              <div key={label} className={`flex justify-between py-1 ${bold ? "border-t border-slate-300 pt-2 font-bold text-[#12355b]" : ""}`}>
                <span className="text-slate-600">{label}</span>
                <span>{formatCurrency(value || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div className="px-5 py-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">Prepared By</p>
            <div className="border-t border-slate-400 pt-1">{displayCreator}</div>
            <p className="text-slate-400 mt-1">{formatDate(createdAt || billDate)}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">Customer Signature</p>
            <div className="border-t border-slate-400 pt-1 h-6" />
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">Authorized Signature</p>
            <div className="border-t border-slate-400 pt-1 h-6" />
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">Company Stamp</p>
            <div className="border border-dashed border-slate-300 rounded h-12" />
          </div>
        </div>

        {/* Meta footer */}
        {!compact && (lastUpdatedBy?.name || updatedAt) && (
          <div className="px-6 py-3 bg-slate-50 text-xs text-slate-400 flex justify-between">
            <span>Created by {displayCreator}</span>
            {lastUpdatedBy?.name && <span>Last updated by {lastUpdatedBy.name}</span>}
            {updatedAt && <span>{formatDate(updatedAt)}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
