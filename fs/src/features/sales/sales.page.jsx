import { useState } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar.jsx';
import { searchCustomer, addCustomerPaymentDetail } from '../../services/customer/customer.js';
import api from '../../services/axios.js';

const TITLES = { Tractor: ['Cultivation Rotavator', 'Cultivation Cultivator', 'Boulders', 'Gravel', 'Soil', 'Sand', 'Puddling'], JCB: ['Excavation'], Tipper: ['Gravel', 'Soil', 'Sand'] };
const emptyEntry = () => ({ vehicle_type: 'Tractor', title: '', quantity: '', quantity_unit_notation: 'hours', rate: '', work_date: new Date().toISOString().slice(0, 10), description: '' });

export default function SalesPage() {
  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState(emptyEntry());
  const [pending, setPending] = useState([]);
  const [editing, setEditing] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('sales');
  const [payment, setPayment] = useState({ pay_amount: '', payment_mode: 'cash', payers_name: '', payment_date: new Date().toISOString().slice(0, 10) });
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const add = (event) => {
    event.preventDefault();
    if (!customer?.id) return toast.error('Select a customer first');
    const quantity = Number(form.quantity), rate = Number(form.rate);
    if (!form.title || !form.work_date || quantity <= 0 || rate <= 0) return toast.error('Choose a title and enter a valid date, quantity, and rate');
    const entry = { ...form, customer_id: Number(customer.id), quantity, rate, total: quantity * rate };
    setPending((old) => editing < 0 ? [...old, entry] : old.map((item, index) => index === editing ? entry : item));
    setEditing(-1); setForm(emptyEntry());
  };
  const edit = (index) => { const { customer_id, ...entry } = pending[index]; setForm(entry); setEditing(index); };
  const submit = async () => {
    if (!pending.length) return;
    setLoading(true);
    try {
      const response = await api.post('/api/v1/customer/work-details/batch', { entries: pending });
      toast.success(response.data?.message || 'Sales entries saved'); setPending([]);
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save sales entries'); }
    finally { setLoading(false); }
  };
  const submitPayment = async (event) => { event.preventDefault(); if (!customer?.id) return toast.error('Select a customer first'); if (Number(payment.pay_amount) <= 0) return toast.error('Payment amount must be greater than zero'); setLoading(true); try { const result = await addCustomerPaymentDetail({ ...payment, customer_id: customer.id }); toast.success(result?.message || 'Payment recorded'); setPayment({ ...payment, pay_amount: '', payers_name: '' }); } catch (error) { toast.error(error?.message || 'Unable to record payment'); } finally { setLoading(false); } };
  return <main className="kds-page"><header><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Sales</p><h1 className="text-2xl font-bold text-[#12355b]">Day-wise work entry</h1></header>
    <SearchBar className="kds-search" placeholder="Find customer by name or phone" searchQueryFn={searchCustomer} onSelect={setCustomer} />
    {customer && <p className="text-sm text-slate-600">Selected customer: <strong>{customer.name}</strong> · {customer.phone_number}</p>}
    <div className="flex gap-2"><button className={`rounded-lg px-4 py-2 text-sm ${mode==='sales'?'bg-[#12355b] text-white':'bg-white text-slate-700'}`} onClick={()=>setMode('sales')}>Work / sales entries</button><button className={`rounded-lg px-4 py-2 text-sm ${mode==='payment'?'bg-[#12355b] text-white':'bg-white text-slate-700'}`} onClick={()=>setMode('payment')}>Record customer payment</button></div>
    {mode==='payment'&&<form onSubmit={submitPayment} className="kds-card grid grid-cols-1 gap-3 p-5 md:grid-cols-4"><label className="kds-label">Amount<input required min="0.01" step="any" type="number" className="kds-input mt-1" value={payment.pay_amount} onChange={e=>setPayment({...payment,pay_amount:e.target.value})}/></label><label className="kds-label">Payment mode<select className="kds-input mt-1" value={payment.payment_mode} onChange={e=>setPayment({...payment,payment_mode:e.target.value})}>{['cash','mobile banking','cheque'].map(x=><option key={x}>{x}</option>)}</select></label><label className="kds-label">Payer name (optional)<input className="kds-input mt-1" value={payment.payers_name} onChange={e=>setPayment({...payment,payers_name:e.target.value})}/></label><label className="kds-label">Payment date<input required type="date" className="kds-input mt-1" value={payment.payment_date} onChange={e=>setPayment({...payment,payment_date:e.target.value})}/></label><div className="md:col-span-4 flex justify-end"><button disabled={loading} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white">{loading?'Saving…':'Record payment'}</button></div></form>}
    {mode==='sales'&&<>
    <form onSubmit={add} className="kds-card grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
      <label className="kds-label">Vehicle Type<select className="kds-input mt-1" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value, title: '' })}>{Object.keys(TITLES).map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="kds-label">Title<select required className="kds-input mt-1" value={form.title} onChange={(e) => update('title', e.target.value)}><option value="">Select title</option>{TITLES[form.vehicle_type].map((title) => <option key={title}>{title}</option>)}</select></label>
      <label className="kds-label">Description (optional)<input maxLength="240" className="kds-input mt-1" value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
      <label className="kds-label">Quantity<input required type="number" min="0.01" step="any" className="kds-input mt-1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} /></label>
      <label className="kds-label">Unit<select className="kds-input mt-1" value={form.quantity_unit_notation} onChange={(e) => update('quantity_unit_notation', e.target.value)}>{['tip', 'hours', 'cubemeter'].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label className="kds-label">Rate<input required type="number" min="0.01" step="any" className="kds-input mt-1" value={form.rate} onChange={(e) => update('rate', e.target.value)} /></label>
      <label className="kds-label">Date<input required type="date" className="kds-input mt-1" value={form.work_date} onChange={(e) => update('work_date', e.target.value)} /></label>
      <div className="flex items-end"><button className="rounded-lg bg-[#12355b] px-4 py-2 text-sm font-semibold text-white">{editing < 0 ? 'Add entry' : 'Save edit'}</button></div>
    </form>
    <section className="kds-card overflow-x-auto p-4"><h2 className="mb-3 font-semibold text-[#12355b]">Pending entries ({pending.length})</h2><table className="w-full text-left text-sm"><thead className="kds-table-header"><tr>{['Vehicle', 'Title', 'Description', 'Date', 'Qty', 'Amount', ''].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{pending.map((row, i) => <tr key={i} className="border-b"><td className="p-2">{row.vehicle_type}</td><td>{row.title}</td><td>{row.description || '—'}</td><td>{row.work_date}</td><td>{row.quantity} {row.quantity_unit_notation}</td><td>Rs. {row.total.toLocaleString()}</td><td className="whitespace-nowrap"><button className="mr-3 text-blue-700" onClick={() => edit(i)}>Edit</button><button className="text-red-700" onClick={() => setPending((old) => old.filter((_, index) => index !== i))}>Remove</button></td></tr>)}</tbody></table>
      {pending.length > 0 && <div className="mt-4 flex justify-end"><button disabled={loading} onClick={submit} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{loading ? 'Submitting…' : 'Submit All'}</button></div>}</section>
    </>}
  </main>;
}
