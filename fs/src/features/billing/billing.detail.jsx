import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../components";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import InvoicePreview from "./components/InvoicePreview";
import { getBillDetails, deleteBill, duplicateBill, downloadBillPDF, printBillPDF } from "../../services/billing/billings.api";
import { formatBS } from "../../utils/bsDate.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { formatCurrency } from "../../utils/currency";
import Modal from "../../components/common/Modal";
import { useSelector } from 'react-redux';
import api from '../../services/axios.js';

const BillingDetail = () => {
  const { language, t } = useI18n();
  const isAdmin = useSelector((state) => state.auth.user?.role === 'admin');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const printInvoice = async () => {
    try {
      await printBillPDF(id);
    } catch (error) {
      toast.error(error?.message || t('receipt.error'));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getBillDetails(id);
        setInvoice(res?.data);
        if (searchParams.get("print") === "1") {
          api.post('/api/logs/event', { action: 'print', entityId: id }).catch(() => {});
          printInvoice();
        }
      } catch (error) {
        toast.error(error?.message || "Failed to load invoice");
        navigate("/billings");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, searchParams]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBill(id);
      toast.success(t('common.save'));
      navigate("/billings");
    } catch (error) {
      toast.error(error?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await duplicateBill(id);
      toast.success(res?.message || t('invoice.duplicate'));
      navigate(`/billings/${res?.data?._id}/edit`);
    } catch (error) {
      toast.error(error?.message || "Failed to duplicate");
    }
  };

  if (loading) {
    return (
      <main className="kds-page items-center justify-center">
        <svg className="size-8 border-3 border-[#12355b] border-t-transparent rounded-full animate-spin" viewBox="0 0 24 24" />
      </main>
    );
  }

  if (!invoice) return null;

  return (
    <main className="kds-page">
      <div className="no-print">
        <PageHeader
          title={`${t('invoice.title')} ${invoice.invoiceNumber}`}
          subtitle={`${t('invoice.billNumber')}: ${invoice.billNumber || '—'} · ${invoice.company?.name || ''}`}
          actions={
            <>
              <Badge status={invoice.paymentStatus}>
                {t(`purchase.status.${invoice.paymentStatus === 'partial' ? 'partial' : invoice.paymentStatus}`)}
              </Badge>
              <Button varient="secondary" size="sm" onClick={() => navigate("/billings")}>
                <i className="bi bi-arrow-left" /> {t('supplier.back')}
              </Button>
              {isAdmin && (
                <Button varient="outline" size="sm" onClick={() => navigate(`/billings/${id}/edit`)}>
                  <i className="bi bi-pencil" /> {t('common.edit')}
                </Button>
              )}
              <Button
                varient="outline"
                size="sm"
                onClick={() => {
                  api.post('/api/logs/event', { action: 'print', entityId: id }).catch(() => {});
                  printInvoice();
                }}
              >
                <i className="bi bi-printer" /> {t('receipt.print')}
              </Button>
              <Button
                varient="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await downloadBillPDF(id);
                    toast.success(t('receipt.downloadPdf'));
                  } catch {
                    toast.error(t('receipt.error'));
                  }
                }}
              >
                <i className="bi bi-download" /> PDF
              </Button>
              {isAdmin && (
                <Button varient="outline" size="sm" onClick={handleDuplicate}>
                  <i className="bi bi-copy" /> {t('invoice.duplicate')}
                </Button>
              )}
              {isAdmin && (
                <Button varient="danger" size="sm" onClick={() => setShowDelete(true)}>
                  <i className="bi bi-trash" /> {t('common.delete')}
                </Button>
              )}
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card title={t('invoice.paymentSummary')} className="lg:col-span-1">
            <div className="space-y-2 text-sm">
              {[
                [t('invoice.grandTotal'), invoice.totals?.grandTotal],
                [t('invoice.paid'), invoice.totals?.paidAmount],
                [t('invoice.remaining'), invoice.totals?.remainingAmount]
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{formatCurrency(val)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t('invoice.customerDetails')} className="lg:col-span-1">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-[#12355b]">{invoice.customer?.name}</p>
              <p className="text-slate-600">{invoice.customer?.address}</p>
              {invoice.customer?.phone && (
                <p className="text-slate-600">{t('field.phone_number')}: {invoice.customer.phone}</p>
              )}
              {invoice.customer?.pan && (
                <p className="text-slate-600">{t('invoice.panNumber')}: {invoice.customer.pan}</p>
              )}
            </div>
          </Card>

          <Card title={t('invoice.creatorTimeline')} className="lg:col-span-1">
            <div className="space-y-1 text-sm mb-4">
              <p>
                <span className="text-slate-500">{language === 'np' ? 'सिर्जनाकर्ता:' : 'Created by:'}</span>{' '}
                {invoice.creator?.name || "—"}
              </p>
              <p>
                <span className="text-slate-500">{language === 'np' ? 'सिर्जना मिति:' : 'Created:'}</span>{' '}
                {formatBS(invoice.createdAt, 'long', language)}
              </p>
              <p>
                <span className="text-slate-500">{language === 'np' ? 'पछिल्लो परिमार्जन:' : 'Last updated by:'}</span>{' '}
                {invoice.lastUpdatedBy?.name || "—"}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2 max-h-40 overflow-y-auto">
              {(invoice.timeline || []).map((entry, idx) => (
                <div key={idx} className="text-xs border-l-2 border-[#12355b]/30 pl-3">
                  <p className="font-medium text-[#12355b]">{entry.action}</p>
                  <p className="text-slate-500">{entry.by} · {formatBS(entry.at, 'long', language)}</p>
                  {entry.note && <p className="text-slate-600">{entry.note}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title={t('invoice.title')}>
        <InvoicePreview invoice={invoice} />
      </Card>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={t('invoice.deleteInvoice')}
        footer={
          <>
            <Button varient="secondary" size="sm" onClick={() => setShowDelete(false)}>
              {t('common.cancel')}
            </Button>
            <Button varient="danger" size="sm" onClick={handleDelete} loading={deleting}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t('invoice.deleteConfirm', { invoiceNumber: invoice.invoiceNumber })}
        </p>
      </Modal>
    </main>
  );
};

export default BillingDetail;
