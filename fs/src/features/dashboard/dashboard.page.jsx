import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios.js';
import SalesPurchaseChart from './SalesPurchaseChart.jsx';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;
export default function DashboardPage() {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [showDue, setShowDue] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; setError(''); setLoading(true); api.get('/api/v1/business/dashboard').then((r) => live && setData(r.data.data)).catch((e) => live && setError(e.response?.data?.message || 'Unable to load dashboard')).finally(() => live && setLoading(false)); return () => { live = false; }; }, []);
  return <main className="kds-page"><header><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Overview</p><h1 className="text-2xl font-bold text-[#12355b]">Dashboard</h1></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <SalesPurchaseChart />
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Last-month revenue',data?.summary?.revenue],['Last-month cost',data?.summary?.cost],['Amount recovered',data?.summary?.recovered],['Amount due',data?.summary?.due]].map(([title,value])=><article key={title} className="kds-card p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-[#12355b]">{loading ? 'Loading…' : money(value)}</p></article>)}</section>
    <button onClick={()=>setShowDue(true)} className="kds-card flex w-full items-center justify-between p-5 text-left hover:border-red-300"><span><span className="block font-semibold text-[#12355b]">Due over 90 days</span><span className="text-sm text-slate-500">Customers with overdue balances</span></span><strong className="text-xl text-red-700">{money((data?.dueCustomers||[]).reduce((s,c)=>s+c.amountDue,0))}　→</strong></button>
    {showDue&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={()=>setShowDue(false)}><section className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="mb-4 flex justify-between"><h2 className="text-xl font-semibold">Customers due over 90 days</h2><button onClick={()=>setShowDue(false)}>Close</button></div><table className="w-full text-sm"><thead><tr className="bg-slate-100 text-left">{['Customer','Phone','Amount due','Last payment','Days overdue'].map(x=><th className="p-2" key={x}>{x}</th>)}</tr></thead><tbody>{data?.dueCustomers?.map(c=><tr key={c.id} className="border-t"><td className="p-2"><Link className="text-blue-700 underline" to={`/customers/${c.id}`} onClick={()=>setShowDue(false)}>{c.name}</Link></td><td>{c.phone}</td><td>{money(c.amountDue)}</td><td>{c.lastPaymentDate?new Date(c.lastPaymentDate).toLocaleDateString():'Never'}</td><td>{c.daysOverdue}</td></tr>)}</tbody></table>{!data?.dueCustomers?.length&&<p className="p-6 text-center text-slate-500">No customers currently meet this criteria.</p>}</section></div>}
  </main>;
}
