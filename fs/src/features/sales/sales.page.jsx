import { useState } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar.jsx';
import BSDatePicker from '../../components/common/BSDatePicker.jsx';
import { bsToday, bsToIso, formatBS, formatAmount } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { searchCustomer, addCustomerPaymentDetail } from '../../services/customer/customer.js';
import api from '../../services/axios.js';

const TITLES = { Tractor: ['cultivation_rotavator', 'cultivation_cultivator', 'boulders', 'gravel', 'soil', 'sand', 'puddling', 'paral', 'dhan', 'others'], JCB: ['excavation'], Tipper: ['gravel', 'soil', 'sand'] };
const titleLabelKey = { cultivation_rotavator: 'sales.cultivationRotavator', cultivation_cultivator: 'sales.cultivationCultivator', boulders: 'sales.boulders', gravel: 'sales.gravel', soil: 'sales.soil', sand: 'sales.sand', puddling: 'sales.puddling', excavation: 'sales.excavation', paral: 'sales.paral', dhan: 'sales.dhan', others: 'sales.others' };
const legacyTitle = { 'Cultivation Rotavator': 'cultivation_rotavator', 'Cultivation Cultivator': 'cultivation_cultivator', Boulders: 'boulders', Gravel: 'gravel', Soil: 'soil', Sand: 'sand', Puddling: 'puddling', Excavation: 'excavation', Paral: 'paral', Dhan: 'dhan', Others: 'others' };
const emptyEntry = () => ({ vehicle_type: 'Tractor', title: '', quantity: '', quantity_unit_notation: 'hours', rate: '', work_date: bsToday(), description: '' });

export default function SalesPage() {
  const { language, t, option } = useI18n();
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState(emptyEntry());
  const [pending, setPending] = useState([]);
  const [editing, setEditing] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('sales');
  const [payment, setPayment] = useState({ pay_amount: '', payment_mode: 'cash', payers_name: '', payment_date: bsToday() });
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const add = (event) => {
    event.preventDefault();
    if (!customer?.id) return toast.error('Select a customer first');
    const quantity = Number(form.quantity), rate = Number(form.rate);
    if (!form.title || !bsToIso(form.work_date) || quantity <= 0 || rate <= 0) return toast.error('Choose a title and enter a valid date, quantity, and rate');
    const entry = { ...form, customer_id: Number(customer.id), quantity, rate, total: quantity * rate };
    setPending((old) => editing < 0 ? [...old, entry] : old.map((item, index) => index === editing ? entry : item));
    setEditing(-1); setForm(emptyEntry());
  };
  const edit = (index) => { const { customer_id, ...entry } = pending[index]; setForm(entry); setEditing(index); };
  const submit = async () => {
    if (!pending.length) return;
    setLoading(true);
    try {
      const response = await api.post('/api/v1/customer/work-details/batch', { entries: pending.map((entry) => ({ ...entry, title: legacyTitle[entry.title] || entry.title, work_date: bsToIso(entry.work_date) })) });
      toast.success(response.data?.message || 'Sales entries saved'); setPending([]);
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save sales entries'); }
    finally { setLoading(false); }
  };
  const submitPayment = async (event) => { event.preventDefault(); if (!customer?.id) return toast.error('Select a customer first'); if (Number(payment.pay_amount) <= 0 || !bsToIso(payment.payment_date)) return toast.error(t('sales.paymentAmountDateInvalid')); setLoading(true); try { const result = await addCustomerPaymentDetail({ ...payment, payment_date: bsToIso(payment.payment_date), customer_id: customer.id }); toast.success(result?.message || 'Payment recorded'); setPayment({ ...payment, pay_amount: '', payers_name: '' }); } catch (error) { toast.error(error?.message || 'Unable to record payment'); } finally { setLoading(false); } };
  return <main className="kds-page"><header><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Sales</p><h1 className="text-2xl font-bold text-[#12355b]">{t('sales.entryTitle')}</h1></header>
    <SearchBar className="kds-search" placeholder={t('sales.searchCustomer')} searchQueryFn={searchCustomer} onSelect={setCustomer} />
    {customer && <p className="text-sm text-slate-600">{t('sales.selectedCustomer')}: <strong>{customer.name}</strong> · {customer.phone_number}</p>}
    <div className="flex gap-2"><button className={`rounded-lg px-4 py-2 text-sm ${mode==='sales'?'bg-[#12355b] text-white':'bg-white text-slate-700'}`} onClick={()=>setMode('sales')}>{t('sales.workEntries')}</button><button className={`rounded-lg px-4 py-2 text-sm ${mode==='payment'?'bg-[#12355b] text-white':'bg-white text-slate-700'}`} onClick={()=>setMode('payment')}>{t('sales.recordPayment')}</button></div>
    {mode==='payment'&&<form onSubmit={submitPayment} className="kds-card grid grid-cols-1 gap-3 p-5 md:grid-cols-4"><label className="kds-label">{t('sales.paymentAmount')}<input required min="0.01" step="any" type="number" className="kds-input mt-1" value={payment.pay_amount} onChange={e=>setPayment({...payment,pay_amount:e.target.value})}/></label><label className="kds-label">{t('sales.paymentMode')}<select className="kds-input mt-1" value={payment.payment_mode} onChange={e=>setPayment({...payment,payment_mode:e.target.value})}>{['cash','mobile banking','cheque'].map(x=><option key={x} value={x}>{option(x)}</option>)}</select></label><label className="kds-label">{t('sales.payerName')}<input className="kds-input mt-1" value={payment.payers_name} onChange={e=>setPayment({...payment,payers_name:e.target.value})}/></label><label className="kds-label">{t('sales.paymentDate')}<BSDatePicker className="kds-input mt-1" value={payment.payment_date} onChange={value=>setPayment({...payment,payment_date:value})}/></label><div className="md:col-span-4 flex justify-end"><button disabled={loading} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white">{loading?t('sales.saving'):t('sales.recordPayment')}</button></div></form>}
    {mode==='sales'&&<>
    <form onSubmit={add} className="kds-card grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
      <label className="kds-label">{t('sales.vehicle')}<select className="kds-input mt-1" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value, title: '' })}>{Object.keys(TITLES).map((v) => <option key={v} value={v}>{t(`vehicle.${v.toLowerCase()}`)}</option>)}</select></label>
      <label className="kds-label">{t('sales.workTitle')}<select required className="kds-input mt-1" value={form.title} onChange={(e) => update('title', e.target.value)}><option value="">Select title</option>{TITLES[form.vehicle_type].map((title) => <option key={title} value={title}>{t(titleLabelKey[title])}</option>)}</select></label>
      <label className="kds-label">{t('sales.description')} (optional)<input maxLength="240" placeholder={form.title === 'others' ? t('sales.describeWork') : ''} className="kds-input mt-1" value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
      <label className="kds-label">{t('sales.quantity')}<input required type="number" min="0.01" step="any" className="kds-input mt-1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} /></label>
      <label className="kds-label">{t('sales.unit')}<select className="kds-input mt-1" value={form.quantity_unit_notation} onChange={(e) => update('quantity_unit_notation', e.target.value)}>{['tip', 'hours', 'cubemeter'].map((v) => <option key={v} value={v}>{option(v)}</option>)}</select></label>
      <label className="kds-label">{t('sales.rate')}<input required type="number" min="0.01" step="any" className="kds-input mt-1" value={form.rate} onChange={(e) => update('rate', e.target.value)} /></label>
      <label className="kds-label">{t('sales.date')}<BSDatePicker className="kds-input mt-1" value={form.work_date} onChange={(value) => update('work_date', value)} /></label>
      <div className="flex items-end"><button className="rounded-lg bg-[#12355b] px-4 py-2 text-sm font-semibold text-white">{editing < 0 ? t('sales.addEntry') : t('sales.saveEdit')}</button></div>
    </form>
    <section className="kds-card overflow-x-auto p-4"><h2 className="mb-3 font-semibold text-[#12355b]">{t('sales.pending')} ({pending.length})</h2><table className="w-full text-left text-sm"><thead className="kds-table-header"><tr>{[t('sales.vehicleCol'), t('sales.workTitle'), t('sales.descriptionCol'), t('sales.dateCol'), t('sales.qtyCol'), t('sales.amountCol'), ''].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{pending.map((row, i) => <tr key={i} className="border-b"><td className="p-2">{option(row.vehicle_type)}</td><td>{t(titleLabelKey[legacyTitle[row.title] || row.title])}</td><td>{row.description || '—'}</td><td>{formatBS(bsToIso(row.work_date), 'long', language)}</td><td>{row.quantity} {option(row.quantity_unit_notation)}</td><td>{formatAmount(row.total, language)}</td><td className="whitespace-nowrap"><button className="mr-3 text-blue-700" onClick={() => edit(i)}>{t('common.edit')}</button><button className="text-red-700" onClick={() => setPending((old) => old.filter((_, index) => index !== i))}>{t('sales.remove')}</button></td></tr>)}</tbody></table>
      {pending.length > 0 && <div className="mt-4 flex justify-end"><button disabled={loading} onClick={submit} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{loading ? t('sales.submitting') : t('sales.submitAll')}</button></div>}</section>
    </>}
  </main>;
}
