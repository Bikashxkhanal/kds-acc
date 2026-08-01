import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../components";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import InvoicePreview from "./components/InvoicePreview";
import { getBillDetails, deleteBill, duplicateBill, downloadBillPDF } from "../../services/billing/billings.api";
import { formatCurrency } from "../../utils/currency";
import Modal from "../../components/common/Modal";

const BillingDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBillDetails(id);
        setInvoice(res?.data);
        if (searchParams.get("print") === "1") {
          setTimeout(() => window.print(), 500);
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
      toast.success("Invoice deleted");
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
      toast.success(res?.message || "Invoice duplicated");
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
          title={`Invoice ${invoice.invoiceNumber}`}
          subtitle={`Bill #${invoice.billNumber} · ${invoice.company?.name}`}
          actions={
            <>
              <Badge status={invoice.paymentStatus}>{invoice.paymentStatus}</Badge>
              <Button varient="secondary" size="sm" onClick={() => navigate("/billings")}>
                <i className="bi bi-arrow-left" /> Back
              </Button>
              <Button varient="outline" size="sm" onClick={() => navigate(`/billings/${id}/edit`)}>
                <i className="bi bi-pencil" /> Edit
              </Button>
              <Button varient="outline" size="sm" onClick={() => window.print()}>
                <i className="bi bi-printer" /> Print
              </Button>
              <Button varient="outline" size="sm" onClick={async () => {
                try { await downloadBillPDF(id); toast.success("PDF downloaded"); }
                catch { toast.error("Failed to download PDF"); }
              }}>
                <i className="bi bi-download" /> PDF
              </Button>
              <Button varient="outline" size="sm" onClick={handleDuplicate}>
                <i className="bi bi-copy" /> Duplicate
              </Button>
              <Button varient="danger" size="sm" onClick={() => setShowDelete(true)}>
                <i className="bi bi-trash" /> Delete
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card title="Payment Summary" className="lg:col-span-1">
            <div className="space-y-2 text-sm">
              {[
                ["Grand Total", invoice.totals?.grandTotal],
                ["Paid", invoice.totals?.paidAmount],
                ["Remaining", invoice.totals?.remainingAmount]
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{formatCurrency(val)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Customer Details" className="lg:col-span-1">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-[#12355b]">{invoice.customer?.name}</p>
              <p className="text-slate-600">{invoice.customer?.address}</p>
              {invoice.customer?.phone && <p className="text-slate-600">Phone: {invoice.customer.phone}</p>}
              {invoice.customer?.pan && <p className="text-slate-600">PAN: {invoice.customer.pan}</p>}
            </div>
          </Card>

          <Card title="Creator & Timeline" className="lg:col-span-1">
            <div className="space-y-1 text-sm mb-4">
              <p><span className="text-slate-500">Created by:</span> {invoice.creator?.name || "—"}</p>
              <p><span className="text-slate-500">Created:</span> {new Date(invoice.createdAt).toLocaleString()}</p>
              <p><span className="text-slate-500">Last updated by:</span> {invoice.lastUpdatedBy?.name || "—"}</p>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2 max-h-40 overflow-y-auto">
              {(invoice.timeline || []).map((entry, idx) => (
                <div key={idx} className="text-xs border-l-2 border-[#12355b]/30 pl-3">
                  <p className="font-medium text-[#12355b]">{entry.action}</p>
                  <p className="text-slate-500">{entry.by} · {new Date(entry.at).toLocaleString()}</p>
                  {entry.note && <p className="text-slate-600">{entry.note}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="Invoice Preview">
        <InvoicePreview invoice={invoice} />
      </Card>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Invoice"
        footer={
          <>
            <Button varient="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button varient="danger" size="sm" onClick={handleDelete} loading={deleting}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete invoice <strong>{invoice.invoiceNumber}</strong>?
        </p>
      </Modal>
    </main>
  );
};

export default BillingDetail;
