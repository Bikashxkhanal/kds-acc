import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../components";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table/table";
import PaginationBar from "../../components/common/Pagination/paginationbar";
import Modal from "../../components/common/Modal";
import {
  getBillings, deleteBill, duplicateBill, downloadBillPDF
} from "../../services/billing/billings.api";
import { formatCurrency } from "../../utils/currency";

const PAGE_LIMIT = 10;

const BillingsList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [tableData, setTableData] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePrint = (id) => {
    window.open(`/billings/${id}?print=1`, "_blank");
  };

  const handleDownload = async (id) => {
    try {
      await downloadBillPDF(id);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateBill(id);
      toast.success(res?.message || "Invoice duplicated");
      navigate(`/billings/${res?.data?._id}/edit`);
    } catch (error) {
      toast.error(error?.message || "Failed to duplicate");
    }
  };

  const fetchBillings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBillings({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        paymentStatus: paymentFilter || undefined
      });
      const invoices = res?.data?.invoices || [];
      setTotalPages(Math.max(1, res?.data?.pagination?.totalPages || 1));

      const rows = invoices.map((inv) => ({
        "Invoice #": inv.invoiceNumber,
        Customer: inv.customer?.name || "—",
        Phone: inv.customer?.phone || "—",
        Company: inv.company?.name || "—",
        "Bill Date": inv.billDate ? new Date(inv.billDate).toLocaleDateString() : "—",
        Total: formatCurrency(inv.totals?.grandTotal),
        Paid: formatCurrency(inv.totals?.paidAmount),
        Remaining: formatCurrency(inv.totals?.remainingAmount),
        Status: <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>,
        "Created By": inv.creator?.name || "—",
        Actions: (
          <div className="flex gap-1 flex-wrap">
            <Link to={`/billings/${inv._id}`} className="text-[#12355b] hover:underline text-xs">View</Link>
            <Link to={`/billings/${inv._id}/edit`} className="text-sky-600 hover:underline text-xs">Edit</Link>
            <button type="button" className="text-slate-600 hover:underline text-xs cursor-pointer"
              onClick={() => handlePrint(inv._id)}>Print</button>
            <button type="button" className="text-emerald-600 hover:underline text-xs cursor-pointer"
              onClick={() => handleDownload(inv._id)}>PDF</button>
            <button type="button" className="text-orange-600 hover:underline text-xs cursor-pointer"
              onClick={() => handleDuplicate(inv._id)}>Duplicate</button>
            <button type="button" className="text-red-500 hover:underline text-xs cursor-pointer"
              onClick={() => setDeleteTarget(inv)}>Delete</button>
          </div>
        )
      }));
      setTableData(rows);
    } catch (error) {
      toast.error(error?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search, paymentFilter, navigate]);

  useEffect(() => { fetchBillings(); }, [fetchBillings]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await deleteBill(deleteTarget._id);
      toast.success(res?.message || "Invoice deleted");
      setDeleteTarget(null);
      fetchBillings();
    } catch (error) {
      toast.error(error?.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="kds-page">
      <PageHeader
        title="Billing"
        subtitle="Manage invoices, payments, and billing history"
        actions={
          <Button varient="primary" size="sm" onClick={() => navigate("/billings/new")}>
            <i className="bi bi-plus-lg" /> Create Bill
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="kds-input pl-9"
            placeholder="Search by invoice, customer, phone, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="kds-input w-full sm:w-48"
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="size-8 border-3 border-[#12355b] border-t-transparent rounded-full animate-spin" viewBox="0 0 24 24" />
        </div>
      ) : (
        <Table tableData={tableData} />
      )}

      <PaginationBar current={page} total={totalPages} onPageChange={setPage} />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invoice"
        footer={
          <>
            <Button varient="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button varient="danger" size="sm" onClick={handleDelete} loading={actionLoading}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete invoice <strong>{deleteTarget?.invoiceNumber}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </main>
  );
};

export default BillingsList;
