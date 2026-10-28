import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/axios.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/button.jsx';
import BSDateField from '../../components/common/BSDateField.jsx';
import Modal from '../../components/common/Modal.jsx';
import { bsToday, bsToIso, isoToBS, formatBS, formatAmount } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';

const blank = {
  billNo: '',
  description: '',
  totalValue: '',
  paidAmount: '0',
  quantity: '',
  rate: '',
  supplierId: '',
  title: 'Fuel',
  customTitle: '',
  date: bsToday(),
  usedBy: 'Tractor'
};

const titles = ['Fuel', 'Mobil (oil)', 'Parts', 'Others'];
const statusClass = (s) => s === 'Paid' ? 'bg-emerald-100 text-emerald-800' : s === 'Partially Paid' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';

export default function PurchasesPage() {
  const { language, option, t } = useI18n();
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [purchase, setPurchase] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [payment, setPayment] = useState({ amount: '', date: bsToday(), note: '' });
  const [loading, setLoading] = useState(false);

  const money = (n) => formatAmount(n || 0, language);

  const load = useCallback(async () => {
    try {
      const r = id ? await api.get(`/api/v1/business/purchases/${id}`) : await api.get('/api/v1/business/purchases');
      if (id) setPurchase(r.data.data);
      else setRows(r.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || t('purchase.loadError'));
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/api/v1/suppliers').then(r => setSuppliers(r.data.data || [])).catch(() => {});
  }, []);

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({
      billNo: row.billNo || '',
      description: row.description || '',
      totalValue: String(row.totalValue || ''),
      paidAmount: String(row.paidAmount || '0'),
      quantity: row.quantity == null ? '' : String(row.quantity),
      rate: row.rate == null ? '' : String(row.rate),
      supplierId: row.supplierId || '',
      title: row.title || 'Others',
      customTitle: row.customTitle || '',
      date: isoToBS(row.date) || bsToday(),
      usedBy: row.usedBy || 'Tractor'
    });
    setSupplierQuery(row.supplier || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(blank);
    setSupplierQuery('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const total = Number(form.totalValue);
    const paid = Number(form.paidAmount);
    if (!form.supplierId) return toast.error(t('purchase.selectSupplier'));
    if (!form.description.trim() || !bsToIso(form.date) || !Number.isFinite(total) || total <= 0 || (!editingId && (!Number.isFinite(paid) || paid < 0 || paid > total)) || !['Tractor', 'JCB', 'Tipper'].includes(form.usedBy)) {
      return toast.error(t('purchase.invalidDetails'));
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/v1/business/purchases/${editingId}`, {
          ...form,
          totalValue: total,
          date: bsToIso(form.date)
        });
        toast.success(t('purchase.updated'));
        setEditingId(null);
      } else {
        await api.post('/api/v1/business/purchases', {
          ...form,
          totalValue: total,
          paidAmount: paid,
          date: bsToIso(form.date)
        });
        toast.success(t('purchase.saved'));
      }
      setForm({ ...blank, supplierId: form.supplierId, date: bsToday() });
      setSupplierQuery(suppliers.find(s => s._id === form.supplierId)?.name || '');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('purchase.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const removePurchase = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await api.delete(`/api/v1/business/purchases/${deleteTarget._id}`);
      toast.success(t('purchase.deleted'));
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const pay = async (e) => {
    e.preventDefault();
    const amount = Number(payment.amount);
    if (!bsToIso(payment.date) || !Number.isFinite(amount) || amount <= 0 || amount > Number(purchase?.balance || 0)) {
      return toast.error(t('purchase.invalidPayment'));
    }
    setLoading(true);
    try {
      await api.post(`/api/v1/business/purchases/${id}/payments`, {
        ...payment,
        amount,
        date: bsToIso(payment.date)
      });
      toast.success(t('purchase.paymentRecorded'));
      setPayment({ ...payment, amount: '', note: '', date: bsToday() });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('purchase.paymentError'));
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    return (
      <main className="kds-page space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#12355b]">{t('purchase.details')}</h1>
          <Link to="/purchases" className="text-blue-700 hover:underline">{t('purchase.back')}</Link>
        </div>
        {purchase && (
          <>
            <Card title={purchase.description} subtitle={`${purchase.supplier} · ${purchase.billNo || t('purchase.noBillNo')} · ${t('purchase.usedBy')} ${option(purchase.usedBy)}`}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <p>{t('purchase.total')} <b>{money(purchase.totalValue)}</b></p>
                <p>{t('purchase.paid')} <b>{money(purchase.paidAmount)}</b></p>
                <p>{t('purchase.balance')} <b>{money(purchase.balance)}</b></p>
                <p>{t('purchase.status')} <b>{option(purchase.status)}</b></p>
              </div>
            </Card>

            <Card title={t('purchase.ledger')}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="kds-table-header">
                    <tr>
                      {['purchase.date', 'purchase.description', 'purchase.debit', 'purchase.credit', 'purchase.balance'].map(x => (
                        <th className="p-2 text-left" key={x}>{t(x)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let balance = 0;
                      const entries = [
                        { date: purchase.date, description: t('purchase.purchaseValue'), debit: purchase.totalValue, credit: 0 },
                        ...(purchase.payments || []).map(p => ({ date: p.date, description: p.note || t('purchase.payment'), debit: 0, credit: p.amount }))
                      ].sort((a, b) => new Date(a.date) - new Date(b.date));
                      return entries.map((entry, i) => {
                        balance += entry.debit - entry.credit;
                        return (
                          <tr key={i} className="border-b">
                            <td className="p-2">{formatBS(entry.date, 'long', language)}</td>
                            <td>{entry.description}</td>
                            <td>{entry.debit ? money(entry.debit) : '—'}</td>
                            <td>{entry.credit ? money(entry.credit) : '—'}</td>
                            <td>{money(balance)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>

            {purchase.balance > 0 && (
              <form onSubmit={pay} className="kds-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
                <label className="kds-label">
                  {t('purchase.paymentAmount')}
                  <input required type="number" min="0.01" max={purchase.balance} step="any" className="kds-input mt-1" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} />
                </label>
                <label className="kds-label">
                  {t('purchase.date')}
                  <BSDateField className="kds-input mt-1" value={payment.date} onChange={date => setPayment({ ...payment, date })} />
                </label>
                <label className="kds-label">
                  {t('purchase.note')}
                  <input className="kds-input mt-1" value={payment.note} onChange={e => setPayment({ ...payment, note: e.target.value })} />
                </label>
                <div className="flex items-end">
                  <Button type="submit" loading={loading}>{t('purchase.recordPayment')}</Button>
                </div>
              </form>
            )}
          </>
        )}
      </main>
    );
  }

  return (
    <main className="kds-page space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">{t('purchase.costs')}</p>
        <h1 className="text-2xl font-bold text-[#12355b]">{editingId ? t('purchase.editPurchase') : t('nav.purchases')}</h1>
      </header>

      <form onSubmit={submit} className="kds-card grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        <div className="relative">
          <label className="kds-label">
            {t('purchase.supplier')}
            {form.supplierId ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="kds-input flex-1 truncate">
                  {suppliers.find(s => s._id === form.supplierId)?.name || supplierQuery}
                  {suppliers.find(s => s._id === form.supplierId)?.phone && (
                    <span className="ml-2 text-slate-500">· {suppliers.find(s => s._id === form.supplierId).phone}</span>
                  )}
                </span>
                <button
                  type="button"
                  className="shrink-0 text-sm text-blue-700 underline"
                  onClick={() => { setForm({ ...form, supplierId: '' }); setSupplierQuery(''); }}
                >
                  {t('common.clear')}
                </button>
              </div>
            ) : (
              <input
                className="kds-input mt-1"
                autoComplete="off"
                value={supplierQuery}
                placeholder={t('common.search')}
                onChange={e => { setSupplierQuery(e.target.value); setForm({ ...form, supplierId: '' }); }}
              />
            )}
          </label>
          {!form.supplierId && supplierQuery.trim() && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {suppliers.filter(s => (s.name || '').toLowerCase().includes(supplierQuery.trim().toLowerCase())).map(s => (
                <button
                  type="button"
                  key={s._id}
                  className="block w-full px-3 py-2 text-left hover:bg-slate-50"
                  onClick={() => { setForm({ ...form, supplierId: s._id }); setSupplierQuery(s.name); }}
                >
                  {s.name}{s.phone && <span className="ml-2 text-slate-500">· {s.phone}</span>}
                </button>
              ))}
              {!suppliers.some(s => (s.name || '').toLowerCase().includes(supplierQuery.trim().toLowerCase())) && (
                <p className="px-3 py-2 text-sm text-slate-500">{t('purchase.noSupplierFound')}</p>
              )}
            </div>
          )}
        </div>

        <label className="kds-label">
          {t('purchase.billNo')} ({t('invoice.optionalPlaceholder')})
          <input
            disabled={!form.supplierId}
            type="text"
            className="kds-input mt-1"
            value={form.billNo}
            onChange={e => setForm({ ...form, billNo: e.target.value })}
          />
        </label>

        <label className="kds-label">
          {t('purchase.description')}
          <input
            disabled={!form.supplierId}
            required
            type="text"
            className="kds-input mt-1"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label className="kds-label">
          {t('purchase.quantity')}
          <input
            disabled={!form.supplierId}
            type="number"
            min="0"
            step="any"
            className="kds-input mt-1"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
          />
        </label>

        <label className="kds-label">
          {t('purchase.rate')}
          <input
            disabled={!form.supplierId}
            type="number"
            min="0"
            step="any"
            className="kds-input mt-1"
            value={form.rate}
            onChange={e => setForm({ ...form, rate: e.target.value })}
          />
        </label>

        <label className="kds-label">
          {t('purchase.totalValue')}
          <input
            disabled={!form.supplierId}
            required
            type="number"
            min="0.01"
            step="any"
            className="kds-input mt-1"
            value={form.totalValue}
            onChange={e => setForm({ ...form, totalValue: e.target.value })}
          />
        </label>

        {!editingId && (
          <label className="kds-label">
            {t('purchase.paidAmount')}
            <input
              disabled={!form.supplierId}
              type="number"
              min="0"
              step="any"
              className="kds-input mt-1"
              value={form.paidAmount}
              onChange={e => setForm({ ...form, paidAmount: e.target.value })}
            />
          </label>
        )}

        <label className="kds-label">
          {t('purchase.titleLabel')}
          <select
            disabled={!form.supplierId}
            className="kds-input mt-1"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          >
            {titles.map(v => (
              <option key={v} value={v}>{option(v)}</option>
            ))}
          </select>
        </label>

        {form.title === 'Others' && (
          <label className="kds-label">
            {t('purchase.customTitle')}
            <input
              disabled={!form.supplierId}
              required
              className="kds-input mt-1"
              value={form.customTitle}
              onChange={e => setForm({ ...form, customTitle: e.target.value })}
            />
          </label>
        )}

        <label className="kds-label">
          {t('purchase.date')}
          <BSDateField
            disabled={!form.supplierId}
            className="kds-input mt-1"
            value={form.date}
            onChange={date => setForm({ ...form, date })}
          />
        </label>

        <label className="kds-label">
          {t('purchase.usedBy')}
          <select
            disabled={!form.supplierId}
            className="kds-input mt-1"
            value={form.usedBy}
            onChange={e => setForm({ ...form, usedBy: e.target.value })}
          >
            {['Tractor', 'JCB', 'Tipper'].map(v => (
              <option key={v} value={v}>{option(v)}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <Button type="submit" loading={loading}>
            {editingId ? t('common.save') : t('purchase.add')}
          </Button>
          {editingId && (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              onClick={cancelEdit}
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>

      <Card title={t('purchase.bills')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="kds-table-header">
              <tr>
                {['purchase.billNo', 'purchase.description', 'purchase.supplier', 'purchase.date', 'purchase.total', 'purchase.paid', 'purchase.balance', 'purchase.status', ''].map(x => (
                  <th key={x} className="p-2 text-left">{x ? t(x) : ''}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr className="border-b" key={p._id}>
                  <td className="p-2">{p.billNo || '—'}</td>
                  <td>{p.description}</td>
                  <td>{p.supplier}</td>
                  <td>{formatBS(p.date, 'long', language)}</td>
                  <td>{money(p.totalValue)}</td>
                  <td>{money(p.paidAmount)}</td>
                  <td>{money(p.balance)}</td>
                  <td>
                    <span className={`rounded-full px-2 py-1 text-xs ${statusClass(p.status)}`}>
                      {option(p.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap space-x-2 text-right p-2">
                    <Link className="text-blue-700 hover:underline" to={`/purchases/${p._id}`}>
                      {t('purchase.view')}
                    </Link>
                    <button
                      type="button"
                      className="text-sky-600 hover:underline cursor-pointer"
                      onClick={() => startEdit(p)}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline cursor-pointer"
                      onClick={() => setDeleteTarget(p)}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="p-6 text-center text-slate-500">{t('purchase.empty')}</p>}
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('purchase.delete')}
        footer={
          <>
            <Button varient="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button varient="danger" size="sm" onClick={removePurchase} loading={loading}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {t('purchase.deleteConfirm')}
        </p>
      </Modal>
    </main>
  );
}
