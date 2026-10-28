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
  getBillings, deleteBill, duplicateBill, downloadBillPDF, printBillPDF
} from "../../services/billing/billings.api";
import { formatCurrency } from "../../utils/currency";
import { formatBS } from "../../utils/bsDate.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { useSelector } from 'react-redux';

const PAGE_LIMIT = 10;

const BillingsList = () => {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const isAdmin = useSelector((state) => state.auth.user?.role === 'admin');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [tableData, setTableData] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePrint = async (id) => {
    try {
      await printBillPDF(id);
    } catch (error) {
      toast.error(error?.message || t('receipt.error'));
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadBillPDF(id);
      toast.success(t('receipt.downloadPdf'));
    } catch {
      toast.error(t('receipt.error'));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateBill(id);
      toast.success(res?.message || t('invoice.duplicate'));
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
        [t('invoice.number')]: inv.invoiceNumber,
        [t('nav.customers')]: inv.customer?.name || "—",
        [t('field.phone_number')]: inv.customer?.phone || "—",
        [t('invoice.selectCompany')]: inv.company?.name || "—",
        [t('invoice.date')]: inv.billDate ? formatBS(inv.billDate, 'long', language) : "—",
        [t('invoice.total')]: formatCurrency(inv.totals?.grandTotal),
        [t('invoice.paid')]: formatCurrency(inv.totals?.paidAmount),
        [t('invoice.remaining')]: formatCurrency(inv.totals?.remainingAmount),
        [t('invoice.status')]: (
          <Badge status={inv.paymentStatus}>
            {t(`purchase.status.${inv.paymentStatus === 'partial' ? 'partial' : inv.paymentStatus}`)}
          </Badge>
        ),
        [t('common.edit')]: (
          <div className="flex gap-1 flex-wrap">
            <Link to={`/billings/${inv._id}`} className="text-[#12355b] hover:underline text-xs">
              {t('customer.view')}
            </Link>
            {isAdmin && (
              <Link to={`/billings/${inv._id}/edit`} className="text-sky-600 hover:underline text-xs">
                {t('common.edit')}
              </Link>
            )}
            <button
              type="button"
              className="text-slate-600 hover:underline text-xs cursor-pointer"
              onClick={() => handlePrint(inv._id)}
            >
              {t('receipt.print')}
            </button>
            <button
              type="button"
              className="text-emerald-600 hover:underline text-xs cursor-pointer"
              onClick={() => handleDownload(inv._id)}
            >
              PDF
            </button>
            {isAdmin && (
              <button
                type="button"
                className="text-orange-600 hover:underline text-xs cursor-pointer"
                onClick={() => handleDuplicate(inv._id)}
              >
                {t('invoice.duplicate')}
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className="text-red-500 hover:underline text-xs cursor-pointer"
                onClick={() => setDeleteTarget(inv)}
              >
                {t('common.delete')}
              </button>
            )}
          </div>
        )
      }));
      setTableData(rows);
    } catch (error) {
      toast.error(error?.message || t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, search, paymentFilter, navigate, isAdmin, language, t]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await deleteBill(deleteTarget._id);
      toast.success(res?.message || t('common.save'));
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
        title={t('nav.billing')}
        subtitle={t('invoice.manageSubtitle')}
        actions={
          <Button varient="primary" size="sm" onClick={() => navigate("/billings/new")}>
            <i className="bi bi-plus-lg" /> {t('invoice.createBill')}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="kds-input pl-9"
            placeholder={t('invoice.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="kds-input w-full sm:w-48"
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('invoice.allStatus')}</option>
          <option value="paid">{t('purchase.status.paid')}</option>
          <option value="partial">{t('purchase.status.partial')}</option>
          <option value="unpaid">{t('purchase.status.unpaid')}</option>
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
        title={t('invoice.deleteInvoice')}
        footer={
          <>
            <Button varient="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button varient="danger" size="sm" onClick={handleDelete} loading={actionLoading}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t('invoice.deleteConfirm', { invoiceNumber: deleteTarget?.invoiceNumber })}
        </p>
      </Modal>
    </main>
  );
};

export default BillingsList;
