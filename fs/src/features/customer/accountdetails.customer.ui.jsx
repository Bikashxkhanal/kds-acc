import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BSDateField from "../../components/common/BSDateField.jsx";
import { bsToday, bsToIso, formatBS, formatAmount } from "../../utils/bsDate.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { toast } from "react-toastify";
import { getACustomerPersonalDetails, getACustomerWorkAndPaymentDetails, getACustomerWorkAndPaymentPreviewData, downLoadWorkAndPaymentDataPdf } from "../../services/customer/customer";
import PaginationBar from "../../components/common/Pagination/paginationbar";
import Button from "../../components/common/button";
import Card from "../../components/common/Card";
import { humanizeLabel } from "../../utils/labels";
import { getFinalCreditOrDebitValue } from "../../helpers/creditAndDebit.helper";

const PAGE_LIMIT = 10;

const Detail = ({ label, value, icon }) => (
  <div className="rounded-lg bg-slate-50 px-4 py-3">
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><i className={`bi ${icon}`} />{label}</p>
    <p className="mt-1 break-words font-medium text-slate-700">{value || "Not available"}</p>
  </div>
);

const AccountDetailsOfCustomer = () => {
  const { id: customerId } = useParams();
  const [customer, setCustomer] = useState({});
  const [entries, setEntries] = useState([]);
  const [totalRows, setTotalRows] = useState(1);
  const [page, setPage] = useState(1);
  const [dates, setDates] = useState({ startDate: bsToday(), endDate: bsToday() });
  const { language, option } = useI18n();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [personal, ledger] = await Promise.all([
          getACustomerPersonalDetails(customerId),
          getACustomerWorkAndPaymentDetails(customerId, { page, limit: PAGE_LIMIT })
        ]);
        setCustomer(personal?.[0] || {});
        const rows = ledger?.workAndPaymentDetails || [];
        const balances = getFinalCreditOrDebitValue(rows);
        setEntries(rows.map((row, index) => ({ ...row, Balance: balances[index] })));
        setTotalRows(Math.max(1, Math.ceil(Number(ledger?.metaData?.[0]?.totalRows || 0) / PAGE_LIMIT)));
      } catch (error) {
        toast.error(error?.message || "Unable to load customer details");
      } finally { setLoading(false); }
    })();
  }, [customerId, page]);

  const totals = useMemo(() => entries.reduce((summary, row) => ({
    credit: summary.credit + Number(row.Credit || 0), debit: summary.debit + Number(row.Debit || 0)
  }), { credit: 0, debit: 0 }), [entries]);
  const headers = entries.length ? Object.keys(entries[0]) : ["Date", "Description", "Credit", "Debit", "Balance"];

  const loadPreview = async () => {
    if (!bsToIso(dates.startDate) || !bsToIso(dates.endDate)) return toast.error("Select valid report dates");
    try {
      const response = await getACustomerWorkAndPaymentPreviewData(customerId, { from: bsToIso(dates.startDate), to: bsToIso(dates.endDate) });
      setPreview(response?.data || {});
    } catch (error) { toast.error(error?.message || "Unable to prepare report"); }
  };

  const download = async () => {
    try {
      await downLoadWorkAndPaymentDataPdf(customerId, { from: bsToIso(dates.startDate), to: bsToIso(dates.endDate) });
    } catch (error) { toast.error(error?.message || "Unable to download report"); }
  };

  return <main className="kds-page">
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Customer profile</p><h1 className="mt-1 text-2xl font-bold text-[#12355b]">{customer.name || "Customer Details"}</h1><p className="mt-1 text-sm text-slate-500">Account overview, activity, and billing history in one place.</p></div>
      <div className="flex flex-wrap items-center gap-2"><BSDateField value={dates.startDate} onChange={(startDate) => setDates((prev) => ({ ...prev, startDate }))} className="kds-input w-40" /><BSDateField value={dates.endDate} onChange={(endDate) => setDates((prev) => ({ ...prev, endDate }))} className="kds-input w-40" /><Button size="sm" varient="outline" onClick={loadPreview}><i className="bi bi-eye" /> Preview report</Button></div>
    </div>

    {preview && <Card className="customer-report-print" title="Customer Report" subtitle={`Selected period: ${formatBS(bsToIso(dates.startDate), 'long', language)} to ${formatBS(bsToIso(dates.endDate), 'long', language)}`}>
      <div className="mb-4 flex flex-wrap justify-end gap-2"><Button size="sm" varient="outline" onClick={() => window.print()}><i className="bi bi-printer" /> Print Customer Details</Button><Button size="sm" varient="primary" onClick={download}><i className="bi bi-download" /> Download PDF</Button></div>
      <p className="mb-3 text-sm text-slate-500">Generated {formatBS(new Date(), 'long', language)} for {preview?.metaData?.name || customer.name}.</p>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-4"><p><strong>Customer ID:</strong> {customer._id || "—"}</p><p><strong>Customer Name:</strong> {customer.name || "—"}</p><p><strong>Phone Number:</strong> {customer.phone_number || "—"}</p><p><strong>Address:</strong> {customer.address || "—"}</p></div>
      <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full text-sm"><thead className="bg-slate-100 text-slate-600"><tr>{(preview?.tableData?.length ? Object.keys(preview.tableData[0]) : ["Date", "Description", "Credit", "Debit"]).map((header) => <th key={header} className="px-3 py-2 text-left">{humanizeLabel(header)}</th>)}</tr></thead><tbody>{preview?.tableData?.length ? preview.tableData.map((row, index) => <tr key={index} className="border-t border-slate-100">{Object.keys(row).map((key) => <td key={key} className="px-3 py-2">{/date/i.test(key) && row[key] ? formatBS(row[key], 'long', language) : key.toLowerCase() === 'title' ? option(row[key]) : row[key] || "—"}</td>)}</tr>) : <tr><td colSpan="4" className="px-3 py-6 text-center text-slate-400">No records in this date range.</td></tr>}</tbody></table></div>
    </Card>}

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <Card title="Basic Information" className="xl:col-span-2"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Detail label="Customer Name" value={customer.name} icon="bi-person" /><Detail label="Customer ID" value={customer.id} icon="bi-fingerprint" /><Detail label="Customer Type" value={option(customer.customer_type || 'Private')} icon="bi-person-lines-fill" /><Detail label="Phone Number" value={customer.phone_number} icon="bi-telephone" /><Detail label="Address" value={customer.address} icon="bi-geo-alt" /></div></Card>
      <Card title="Account Summary"><div className="space-y-3"><Detail label="Total Payments" value={formatAmount(totals.credit, language)} icon="bi-arrow-down-circle" /><Detail label="Total Work" value={formatAmount(totals.debit, language)} icon="bi-arrow-up-circle" /><Detail label="Current Balance" value={formatAmount(totals.debit - totals.credit, language)} icon="bi-wallet2" /></div></Card>
    </div>

    <Card title="Payment History" subtitle="Work entries and payments are shown in newest-first order.">
      <div className="kds-table-scroll overflow-auto rounded-lg border border-slate-200"><table className="w-full text-sm"><thead className="kds-table-header"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 text-left font-semibold">{humanizeLabel(header)}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={headers.length} className="p-10 text-center text-slate-400">Loading account activity…</td></tr> : entries.length ? entries.map((row, index) => <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">{headers.map((header) => <td key={header} className="px-4 py-3 text-slate-700">{header.toLowerCase().includes('date') && row[header] ? formatBS(row[header], 'long', language) : header.toLowerCase() === 'title' ? option(row[header]) : row[header] || '—'}</td>)}</tr>) : <tr><td colSpan={headers.length} className="p-10 text-center text-slate-400">No account activity yet.</td></tr>}</tbody></table></div>
      <PaginationBar current={page} total={totalRows} onPageChange={setPage} />
    </Card>
  </main>;
};

export default AccountDetailsOfCustomer;
