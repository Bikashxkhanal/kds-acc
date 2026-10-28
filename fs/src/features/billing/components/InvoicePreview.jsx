import { formatCurrency, formatNumber } from "../../../utils/currency";
import { amountToWords } from "../../../utils/numberToWords";
import { formatBS } from "../../../utils/bsDate.js";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

const InvoicePreview = ({ invoice = {}, creatorName = "", compact = false }) => {
  const { language, t, option } = useI18n();

  const formatDate = (value) => {
    if (!value) return "—";
    return formatBS(value, 'long', language);
  };

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
            <p className="font-semibold text-white mt-1">PAN: {company.pan || "N/A"}</p>
            <p className="text-sky-200/90 mt-1 max-w-xs">{company.address || "Address"}</p>
            <p className="text-sky-200/80 mt-1">
              {[company.phone, company.email].filter(Boolean).join(" · ") || "Contact"}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-2xl font-bold tracking-wide">{t('invoice.title')}</p>
            <p className="mt-2">{t('invoice.number')}: <strong>{invoiceNumber}</strong></p>
            {billNumber && <p>{t('invoice.billNumber')}: <strong>{billNumber}</strong></p>}
            <p className="mt-1">{t('invoice.date')}: {formatDate(billDate)}</p>
            {dueDate && <p>{t('invoice.due')}: {formatDate(dueDate)}</p>}
            <div className="mt-3 border-t border-white/20 pt-3 text-sm md:ml-auto md:max-w-xs">
              <p className="text-sky-200 text-xs uppercase tracking-wider">{t('invoice.billTo')}</p>
              <p className="font-semibold">{t('invoice.customerName')}: {customer.name || "—"}</p>
              <p className="text-sky-100/85">{t('invoice.customerAddress')}: {customer.address || "—"}</p>
              {customer.phone && <p className="text-sky-100/85">{t('invoice.phoneNumber')}: {customer.phone}</p>}
              <p className="text-sky-100/85">{t('invoice.panNumber')}: {customer.pan || "N/A"}</p>
              <p className="mt-2 text-sky-200 text-xs uppercase tracking-wider">{t('invoice.status')}</p>
              <span className="font-semibold capitalize">{t(`purchase.status.${paymentStatus === 'partial' ? 'partial' : paymentStatus}`)}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="px-5 py-3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs uppercase tracking-wider">
                <th className="border border-slate-200 px-2 py-2 text-left w-8">#</th>
                <th className="border border-slate-200 px-2 py-2 text-left">{t('invoice.product')}</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">{t('invoice.quantity')}</th>
                <th className="border border-slate-200 px-2 py-2 text-center w-16">{t('invoice.unit')}</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-24">{t('invoice.rate')}</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-20">{t('invoice.discount')}</th>
                <th className="border border-slate-200 px-2 py-2 text-right w-28">{t('invoice.total')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-200 px-4 py-6 text-center text-slate-400">
                    {t('invoice.addLineItems')}
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
                    <td className="border border-slate-200 px-2 py-1.5 text-center">{item.unit ? option(item.unit) : ""}</td>
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
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{t('invoice.remarks')}</p>
                <p className="text-slate-600 mt-1">{remarks}</p>
              </div>
            )}
            <p className="text-xs text-slate-500 italic">
              {t('invoice.amountWords')}: <strong>{amountToWords(totals.grandTotal || 0, language)}</strong>
            </p>
          </div>
          <div className="w-full md:w-64 space-y-1 text-sm">
            {[
              [t('invoice.subtotal'), totals.subtotal],
              [t('invoice.discount'), totals.discount],
              [t('invoice.taxable'), totals.taxableAmount],
              [`${t('invoice.tax')} (${totals.taxRate || 0}%)`, totals.tax],
              [t('invoice.grandTotal'), totals.grandTotal, true],
              [t('invoice.paid'), totals.paidAmount],
              [t('invoice.remaining'), totals.remainingAmount]
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
            <p className="text-slate-400 uppercase tracking-wider mb-6">
              {language === 'np' ? 'तयार गर्ने' : 'Prepared By'}
            </p>
            <div className="border-t border-slate-400 pt-1">{displayCreator}</div>
            <p className="text-slate-400 mt-1">{formatDate(createdAt || billDate)}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">
              {language === 'np' ? 'ग्राहकको हस्ताक्षर' : 'Customer Signature'}
            </p>
            <div className="border-t border-slate-400 pt-1 h-6" />
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">
              {language === 'np' ? 'अधिकृत हस्ताक्षर' : 'Authorized Signature'}
            </p>
            <div className="border-t border-slate-400 pt-1 h-6" />
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider mb-6">
              {language === 'np' ? 'कम्पनी छाप' : 'Company Stamp'}
            </p>
            <div className="border border-dashed border-slate-300 rounded h-12" />
          </div>
        </div>

        {/* Meta footer */}
        {!compact && (lastUpdatedBy?.name || updatedAt) && (
          <div className="px-6 py-3 bg-slate-50 text-xs text-slate-400 flex justify-between">
            <span>
              {language === 'np' ? `सिर्जनाकर्ता: ${displayCreator}` : `Created by ${displayCreator}`}
            </span>
            {lastUpdatedBy?.name && (
              <span>
                {language === 'np' ? `पछिल्लो परिमार्जन: ${lastUpdatedBy.name}` : `Last updated by ${lastUpdatedBy.name}`}
              </span>
            )}
            {updatedAt && <span>{formatDate(updatedAt)}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;
