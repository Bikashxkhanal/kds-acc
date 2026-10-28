import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/axios.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/button.jsx';
import BSDateField from '../../components/common/BSDateField.jsx';
import { bsToday, bsToIso, formatBS, formatAmount } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import ReceiptButtons from '../../components/common/ReceiptButtons.jsx';
import OpeningBalanceActions from '../previousBalance/OpeningBalanceActions.jsx';

const blank = { name: '', phone: '', address: '', notes: '' };

export default function SuppliersPage() {
  const { id } = useParams();
  const { language, t } = useI18n();
  const [rows, setRows] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [form, setForm] = useState(blank);
  const [payment, setPayment] = useState({ amount: '', date: bsToday(), mode: 'cash', notes: '' });
  const [newReceipt, setNewReceipt] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(id ? `/api/v1/suppliers/${id}` : '/api/v1/suppliers');
      id ? setSupplier(r.data.data) : setRows(r.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || t('supplier.loadError'));
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/suppliers', form);
      setForm(blank);
      toast.success(t('supplier.added'));
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || t('supplier.saveError'));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(t('supplier.deleteConfirm', { name: row.name }))) return;
    try {
      await api.delete(`/api/v1/suppliers/${row._id}`);
      toast.success(t('supplier.deleted'));
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || t('supplier.deleteError'));
    }
  };

  const pay = async (e) => {
    e.preventDefault();
    try {
      const result = await api.post(`/api/v1/suppliers/${id}/payments`, {
        ...payment,
        amount: Number(payment.amount),
        date: bsToIso(payment.date)
      });
      toast.success(t('supplier.paymentRecorded'));
      setNewReceipt(result.data.data?._id);
      setPayment({ amount: '', date: bsToday(), mode: 'cash', notes: '' });
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || t('supplier.paymentError'));
    }
  };

  const money = (n) => formatAmount(n || 0, language);

  const paymentModes = [
    { value: 'cash', label: t('option.cash') },
    { value: 'cheque', label: t('option.cheque') },
    { value: 'mobile banking', label: t('option.mobileBanking') },
    { value: 'bank transfer', label: t('option.bankTransfer') }
  ];

  if (id) {
    return (
      <main className="kds-page">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
              {t('supplier.ledger')}
            </p>
            <h1 className="text-2xl font-bold text-[#12355b]">
              {supplier?.name || t('supplier.details')}
            </h1>
          </div>
          <Link to="/suppliers" className="text-blue-700 hover:underline">
            {t('supplier.back')}
          </Link>
        </header>

        {supplier && (
          <>
            <Card title={t('supplier.contactDetails')}>
              <p>
                {supplier.phone || '—'} · {supplier.address || '—'}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <p>
                  {t('supplier.totalPurchased')} <b>{money(supplier.totalPurchased)}</b>
                </p>
                <p>
                  {t('supplier.totalPaid')} <b>{money(supplier.totalPaid)}</b>
                </p>
                <p>
                  {t('supplier.balanceDue')} <b>{money(supplier.balance)}</b>
                </p>
              </div>
            </Card>

            <Card title={t('supplier.ledger')}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="kds-table-header">
                    <tr>
                      <th className="p-2 text-left">{t('purchase.date')}</th>
                      <th className="p-2 text-left">{t('supplier.entry')}</th>
                      <th className="p-2 text-left">{t('supplier.debitCol')}</th>
                      <th className="p-2 text-left">{t('supplier.creditCol')}</th>
                      <th className="p-2 text-left">{t('supplier.runningBalance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.ledger?.map((entry) => (
                      <tr
                        key={entry._id}
                        className={`border-b ${
                          entry.kind === 'purchase'
                            ? 'bg-amber-50 text-amber-950'
                            : entry.kind === 'opening'
                            ? 'bg-sky-50 text-sky-950'
                            : 'bg-emerald-50 text-emerald-950'
                        }`}
                      >
                        <td className="p-2">{formatBS(entry.date, 'long', language)}</td>
                        <td>
                          <span className="mr-2 rounded-full px-2 py-1 text-xs font-semibold">
                            {entry.kind === 'purchase'
                              ? t('supplier.purchase')
                              : entry.kind === 'opening'
                              ? t('opening.title')
                              : t('supplier.payment')}
                          </span>
                          {entry.description}
                          {entry.OpeningBalanceId && (
                            <span className="ml-2">
                              <OpeningBalanceActions
                                openingBalanceId={entry.OpeningBalanceId}
                                partyType="supplier"
                                onChanged={load}
                              />
                            </span>
                          )}
                        </td>
                        <td>{entry.debit ? money(entry.debit) : '—'}</td>
                        <td>{entry.credit ? money(entry.credit) : '—'}</td>
                        <td className="font-semibold">{money(entry.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!supplier.ledger?.length && (
                  <p className="p-4 text-center text-slate-500">{t('supplier.noLedger')}</p>
                )}
              </div>
            </Card>

            <Card title={t('supplier.itemsPurchased')}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="kds-table-header">
                    <tr>
                      <th className="p-2 text-left">{t('purchase.date')}</th>
                      <th className="p-2 text-left">{t('field.title')}</th>
                      <th className="p-2 text-left">{t('purchase.quantity')}</th>
                      <th className="p-2 text-left">{t('purchase.rate')}</th>
                      <th className="p-2 text-left">{t('field.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.purchases?.map((p) => {
                      const itemTitle =
                        p.title === 'Fuel'
                          ? t('purchase.title.fuel')
                          : p.title === 'Mobil'
                          ? t('purchase.title.mobil')
                          : p.title === 'Parts'
                          ? t('purchase.title.parts')
                          : p.title === 'Others'
                          ? p.customTitle || p.description || t('purchase.title.others')
                          : p.title;
                      return (
                        <tr className="border-b" key={p._id}>
                          <td className="p-2">{formatBS(p.date, 'long', language)}</td>
                          <td>{itemTitle}</td>
                          <td>{p.quantity ?? '—'}</td>
                          <td>{p.rate == null ? '—' : money(p.rate)}</td>
                          <td>{money(p.totalValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!supplier.purchases?.length && (
                  <p className="p-4 text-center text-slate-500">{t('supplier.noPurchases')}</p>
                )}
              </div>
            </Card>

            <Card title={t('supplier.paymentHistory')}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="kds-table-header">
                    <tr>
                      <th className="p-2 text-left">{t('purchase.date')}</th>
                      <th className="p-2 text-left">{t('invoice.billNumber')}</th>
                      <th className="p-2 text-left">{t('supplier.paymentMode')}</th>
                      <th className="p-2 text-left">{t('purchase.note')}</th>
                      <th className="p-2 text-left">{t('field.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplier.payments?.map((p, i) => (
                      <tr className="border-b" key={p._id || i}>
                        <td className="p-2">{formatBS(p.date, 'long', language)}</td>
                        <td className="whitespace-nowrap">
                          <span className="mr-2">{p.receiptNo}</span>
                          <ReceiptButtons type="supplier" id={p._id} />
                        </td>
                        <td>{t(`option.${p.mode === 'bank transfer' ? 'bankTransfer' : p.mode === 'mobile banking' ? 'mobileBanking' : p.mode}`, p.mode)}</td>
                        <td>{p.notes || '—'}</td>
                        <td>{money(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!supplier.payments?.length && (
                  <p className="p-4 text-center text-slate-500">{t('supplier.noPayments')}</p>
                )}
              </div>
            </Card>

            {supplier.balance > 0 && (
              <form onSubmit={pay} className="kds-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="kds-label">
                  {t('purchase.date')}
                  <BSDateField
                    className="kds-input mt-1"
                    value={payment.date}
                    onChange={(date) => setPayment({ ...payment, date })}
                  />
                </label>
                <label className="kds-label">
                  {t('field.amount')}
                  <input
                    required
                    type="number"
                    min="0.01"
                    max={supplier.balance}
                    step="any"
                    className="kds-input mt-1"
                    value={payment.amount}
                    onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                  />
                </label>
                <label className="kds-label">
                  {t('supplier.paymentMode')}
                  <select
                    className="kds-input mt-1"
                    value={payment.mode}
                    onChange={(e) => setPayment({ ...payment, mode: e.target.value })}
                  >
                    {paymentModes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="kds-label">
                  {t('purchase.note')}
                  <input
                    className="kds-input mt-1"
                    value={payment.notes}
                    onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                  />
                </label>
                <div className="flex items-end">
                  <Button type="submit">{t('supplier.recordPayment')}</Button>
                </div>
              </form>
            )}
          </>
        )}

        {newReceipt && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
            role="dialog"
            aria-modal="true"
          >
            <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-[#12355b]">{t('supplier.paymentSaved')}</h2>
              <p className="mt-2 text-sm text-slate-500">{t('supplier.receiptReady')}</p>
              <div className="mt-5 flex items-center justify-between">
                <ReceiptButtons type="supplier" id={newReceipt} />
                <button
                  className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-100"
                  onClick={() => setNewReceipt(null)}
                >
                  {t('common.close')}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  const fields = [
    { label: t('field.name'), key: 'name', required: true },
    { label: t('field.phone_number'), key: 'phone', required: false },
    { label: t('field.address'), key: 'address', required: false },
    { label: t('purchase.note'), key: 'notes', required: false }
  ];

  return (
    <main className="kds-page">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
          {t('supplier.accountsPayable')}
        </p>
        <h1 className="text-2xl font-bold text-[#12355b]">{t('nav.suppliers')}</h1>
      </header>

      <form onSubmit={add} className="kds-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map(({ label, key, required }) => (
          <label className="kds-label" key={key}>
            {label}
            {key === 'notes' ? (
              <textarea
                className="kds-input mt-1"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <input
                required={required}
                className="kds-input mt-1"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </label>
        ))}
        <div className="flex items-end">
          <Button type="submit">{t('supplier.add')}</Button>
        </div>
      </form>

      <Card title={t('supplier.balances')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="kds-table-header">
              <tr>
                <th className="p-2 text-left">{t('field.name')}</th>
                <th className="p-2 text-left">{t('supplier.contact')}</th>
                <th className="p-2 text-left">{t('supplier.totalPurchased')}</th>
                <th className="p-2 text-left">{t('supplier.totalPaid')}</th>
                <th className="p-2 text-left">{t('supplier.balanceDue')}</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-b" key={r._id}>
                  <td className="p-2">
                    <Link to={`/suppliers/${r._id}`} className="text-blue-700 underline font-medium">
                      {r.name}
                    </Link>
                  </td>
                  <td>{r.phone || '—'}</td>
                  <td>{money(r.totalPurchased)}</td>
                  <td>{money(r.totalPaid)}</td>
                  <td className="font-semibold">{money(r.balance)}</td>
                  <td>
                    <button
                      className="text-red-700 hover:underline"
                      onClick={() => remove(r)}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-6 text-center text-slate-500">{t('supplier.empty')}</p>
          )}
        </div>
      </Card>
    </main>
  );
}
