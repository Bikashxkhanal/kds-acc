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
    section = "",
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
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#12355b] text-white px-6 py-5 flex justify-between items-start">
          <div>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="Logo" className="h-12 mb-2 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <i className="bi bi-building text-xl" />
              </div>
            )}
            <h2 className="text-lg font-bold">{company.name || "Company Name"}</h2>
            <p className="text-sky-200/90 mt-1 max-w-xs">{company.address || "Address"}</p>
            <p className="text-sky-200/80 mt-1">
              {[company.phone, company.email].filter(Boolean).join(" · ") || "Contact"}
            </p>
            {company.pan && <p className="text-sky-200/80">PAN: {company.pan}</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-wide">INVOICE</p>
            <p className="mt-2">Invoice #: <strong>{invoiceNumber}</strong></p>
            {billNumber && <p>Bill #: <strong>{billNumber}</strong></p>}
            <p className="mt-1">Date: {formatDate(billDate)}</p>
            {dueDate && <p>Due: {formatDate(dueDate)}</p>}
            {section && <p>Section: {section}</p>}
          </div>
        </div>

        {/* Customer */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Bill To</p>
            <p className="font-semibold text-[#12355b]">{customer.name || "Customer Name"}</p>
            <p className="text-slate-600 mt-1">{customer.address || "Address"}</p>
            {customer.phone && <p className="text-slate-600">Phone: {customer.phone}</p>}
            {customer.pan && <p className="text-slate-600">PAN: {customer.pan}</p>}
          </div>
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Payment Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
              paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800"
              : paymentStatus === "partial" ? "bg-orange-100 text-orange-800"
              : "bg-red-100 text-red-800"
            }`}>
              {paymentStatus}
            </span>
          </div>
        </div>

        {/* Items table */}
        <div className="px-6 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs uppercase tracking-wider">
                <th className="border border-slate-200 px-2 py-2 text-left w-8">#</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Product / Service</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">Qty</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">Unit</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-24">Rate</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-20">Disc.</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-20">Tax</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-slate-200 px-4 py-6 text-center text-slate-400">
                    Add line items to preview invoice
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="border border-slate-200 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      <p className="font-medium">{item.productName || "—"}</p>
                      {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                    </td>
                    <td className="border border-slate-200 px-2 py-2 text-center">{item.quantity}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center">{item.unit}</td>
                    <td className="border border-slate-200 px-2 py-2 text-right">{formatNumber(item.rate)}</td>
                    <td className="border border-slate-200 px-2 py-2 text-right">{formatNumber(item.discount || 0)}</td>
                    <td className="border border-slate-200 px-2 py-2 text-right">{formatNumber(item.tax || 0)}</td>
                    <td className="border border-slate-200 px-2 py-2 text-right font-medium">{formatNumber(item.total || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 pb-4 flex flex-col md:flex-row gap-6">
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
              ["Tax", totals.tax],
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
        <div className="px-6 py-5 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
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
