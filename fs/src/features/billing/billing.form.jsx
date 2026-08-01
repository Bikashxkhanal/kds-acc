import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Button, InputBox } from "../../components";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import ConfirmSaveModal from "./components/ConfirmSaveModal";
import InvoicePreview from "./components/InvoicePreview";
import LineItemsEditor from "./components/LineItemsEditor";
import TotalsSummary from "./components/TotalsSummary";
import {
  createBill, updateBill, getBillDetails, getCompanies, createCompany
} from "../../services/billing/billings.api";
import { emptyLineItem, calculateInvoiceTotals } from "../../utils/invoiceCalculations";

const BillingForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", address: "", phone: "", email: "", pan: "" });

  const [companyId, setCompanyId] = useState("");
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", pan: "" });
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([emptyLineItem()]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [existingMeta, setExistingMeta] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await getCompanies();
        setCompanies(res?.data || []);
      } catch (error) {
        toast.error(error?.message || "Failed to load companies");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getBillDetails(id);
        const inv = res?.data;
        setCompanyId(inv?.company?.id || "");
        setCustomer(inv?.customer || {});
        setBillDate(inv?.billDate ? new Date(inv.billDate).toISOString().split("T")[0] : "");
        setDueDate(inv?.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "");
        setRemarks(inv?.remarks || "");
        setItems(inv?.items?.length ? inv.items : [emptyLineItem()]);
        setPaidAmount(inv?.totals?.paidAmount || 0);
        setExistingMeta({
          invoiceNumber: inv?.invoiceNumber,
          billNumber: inv?.billNumber,
          creator: inv?.creator,
          createdAt: inv?.createdAt,
          updatedAt: inv?.updatedAt,
          lastUpdatedBy: inv?.lastUpdatedBy,
          paymentStatus: inv?.paymentStatus
        });
      } catch (error) {
        toast.error(error?.message || "Failed to load invoice");
        navigate("/billings");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const selectedCompany = useMemo(() => {
    const found = companies.find((c) => c._id === companyId);
    return found || {};
  }, [companies, companyId]);

  const { items: calcItems, totals, paymentStatus } = useMemo(
    () => calculateInvoiceTotals(items, paidAmount),
    [items, paidAmount]
  );

  const previewInvoice = useMemo(() => ({
    ...existingMeta,
    company: selectedCompany.name ? {
      id: selectedCompany._id,
      name: selectedCompany.name,
      address: selectedCompany.address,
      phone: selectedCompany.phone,
      email: selectedCompany.email,
      pan: selectedCompany.pan,
      logoUrl: selectedCompany.logoUrl
    } : {},
    customer,
    billDate,
    dueDate,
    remarks,
    items: calcItems,
    totals,
    paymentStatus
  }), [existingMeta, selectedCompany, customer, billDate, dueDate, remarks, calcItems, totals, paymentStatus]);

  const validate = () => {
    if (!companyId) { toast.error("Please select a company"); return false; }
    if (!customer.name?.trim()) { toast.error("Customer name is required"); return false; }
    if (!customer.address?.trim()) { toast.error("Customer address is required"); return false; }
    if (!billDate) { toast.error("Bill date is required"); return false; }
    if (calcItems.some((i) => !i.productName?.trim())) { toast.error("All line items need a product name"); return false; }
    return true;
  };

  const buildPayload = () => ({
    companyId,
    customer,
    billDate,
    dueDate: dueDate || undefined,
    remarks,
    items: calcItems.map((item, index) => ({ ...item, sortOrder: index })),
    paidAmount: totals.paidAmount
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      const res = isEdit
        ? await updateBill(id, payload)
        : await createBill(payload);
      toast.success(res?.message || "Invoice saved successfully");
      navigate(`/billings/${res?.data?._id || id}`);
    } catch (error) {
      toast.error(error?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      const res = await createCompany(newCompany);
      toast.success(res?.message || "Company created");
      setCompanies((prev) => [...prev, res.data]);
      setCompanyId(res.data._id);
      setShowCompanyForm(false);
      setNewCompany({ name: "", address: "", phone: "", email: "", pan: "" });
    } catch (error) {
      toast.error(error?.message || "Failed to create company");
    }
  };

  if (loading) {
    return (
      <main className="kds-page items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="size-8 border-3 border-[#12355b] border-t-transparent rounded-full animate-spin" viewBox="0 0 24 24" />
          <p>Loading invoice...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="kds-page">
      <PageHeader
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        subtitle="Fill in bill details and review the live preview before saving"
        actions={
          <>
            <Button varient="secondary" size="sm" onClick={() => navigate("/billings")}>Cancel</Button>
            <Button varient="primary" size="sm" onClick={() => { if (validate()) setShowConfirm(true); }}>
              <i className="bi bi-check-lg" /> Save Invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form column */}
        <div className="space-y-5 no-print">
          <Card title="Bill Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="kds-label">Company <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select className="kds-input flex-1" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <Button varient="outline" size="sm" onClick={() => setShowCompanyForm((p) => !p)}>
                    <i className="bi bi-plus-lg" />
                  </Button>
                </div>
              </div>

              {showCompanyForm && (
                <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                  <p className="text-sm font-medium text-[#12355b]">Add New Company</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InputBox label="Company Name" required value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} />
                    <InputBox label="PAN" required value={newCompany.pan}
                      onChange={(e) => setNewCompany({ ...newCompany, pan: e.target.value })} />
                    <InputBox label="Address" required className="md:col-span-2" value={newCompany.address}
                      onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })} />
                    <InputBox label="Phone" value={newCompany.phone}
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })} />
                    <InputBox label="Email" value={newCompany.email}
                      onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })} />
                  </div>
                  <Button varient="primary" size="sm" onClick={handleAddCompany}>Save Company</Button>
                </div>
              )}

              <InputBox label="Customer Name" required icon="bi-person" value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              <InputBox label="Phone Number" icon="bi-telephone" value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              <InputBox label="Customer Address" required icon="bi-geo-alt" className="md:col-span-2"
                value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              <InputBox label="Customer PAN" icon="bi-card-text" value={customer.pan}
                onChange={(e) => setCustomer({ ...customer, pan: e.target.value })} />
              <InputBox label="Bill Date" type="date" required value={billDate}
                onChange={(e) => setBillDate(e.target.value)} />
              <InputBox label="Due Date" type="date" value={dueDate}
                onChange={(e) => setDueDate(e.target.value)} />
              <InputBox label="Remarks / Notes" value={remarks}
                onChange={(e) => setRemarks(e.target.value)} />

              {isEdit && (
                <>
                  <InputBox label="Invoice Number" readOnly value={existingMeta.invoiceNumber || ""} />
                  <InputBox label="Bill Number" readOnly value={existingMeta.billNumber || ""} />
                </>
              )}
            </div>
          </Card>

          <Card title="Products / Services">
            <LineItemsEditor items={items} onChange={setItems} />
          </Card>

          <Card title="Payment Summary">
            <TotalsSummary totals={totals} paidAmount={paidAmount} onPaidAmountChange={setPaidAmount} />
          </Card>

          {user?.name && (
            <Card title="Creator Information">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Creator:</span> <strong>{user.name}</strong></div>
                <div><span className="text-slate-500">Date:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </Card>
          )}
        </div>

        {/* Preview column */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <Card title="Live Preview" subtitle="Updates automatically as you edit">
            <InvoicePreview invoice={previewInvoice} creatorName={user?.name} />
          </Card>
        </div>
      </div>

      <ConfirmSaveModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        loading={saving}
      />
    </main>
  );
};

export default BillingForm;
