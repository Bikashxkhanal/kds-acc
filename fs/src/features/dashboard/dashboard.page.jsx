import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios.js';
import SalesPurchaseChart from './SalesPurchaseChart.jsx';
import { formatBS, formatAmount, formatNumber } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function DashboardPage() {
  const { language, t } = useI18n();
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [showDue, setShowDue] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; setError(''); setLoading(true); api.get('/api/v1/business/dashboard').then((r) => live && setData(r.data.data)).catch((e) => live && setError(e.response?.data?.message || t('dashboard.loadError'))).finally(() => live && setLoading(false)); return () => { live = false; }; }, [t]);
  return <main className="kds-page"><header><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">{t('dashboard.overview')}</p><h1 className="text-2xl font-bold text-[#12355b]">{t('dashboard.title')}</h1></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <SalesPurchaseChart />
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[t('dashboard.revenue'),data?.summary?.revenue],[t('dashboard.cost'),data?.summary?.cost],[t('dashboard.recovered'),data?.summary?.recovered],[t('dashboard.due'),data?.summary?.due]].map(([title,value])=><article key={title} className="kds-card p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-[#12355b]">{loading ? t('dashboard.loading') : formatAmount(value, language)}</p></article>)}</section>
    <button onClick={()=>setShowDue(true)} className="kds-card flex w-full items-center justify-between p-5 text-left hover:border-red-300"><span><span className="block font-semibold text-[#12355b]">{t('dashboard.due90')}</span><span className="text-sm text-slate-500">{t('dashboard.overdueCustomers')}</span></span><strong className="text-xl text-red-700">{formatAmount((data?.dueCustomers||[]).reduce((s,c)=>s+c.amountDue,0), language)}　→</strong></button>
    {showDue&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={()=>setShowDue(false)}><section className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5" onClick={e=>e.stopPropagation()}><div className="mb-4 flex justify-between"><h2 className="text-xl font-semibold">{t('dashboard.dueList')}</h2><button onClick={()=>setShowDue(false)}>{t('common.close')}</button></div><table className="w-full text-sm"><thead><tr className="bg-slate-100 text-left">{[['dashboard.customer'],['dashboard.phone'],['dashboard.amountDue'],['dashboard.lastPayment'],['dashboard.daysOverdue']].map(([key])=><th className="p-2" key={key}>{t(key)}</th>)}</tr></thead><tbody>{data?.dueCustomers?.map(c=><tr key={c.id} className="border-t"><td className="p-2"><Link className="text-blue-700 underline" to={`/customers/${c.id}`} onClick={()=>setShowDue(false)}>{c.name}</Link></td><td>{c.phone}</td><td>{formatAmount(c.amountDue,language)}</td><td>{c.lastPaymentDate?formatBS(c.lastPaymentDate,'long',language):t('dashboard.never')}</td><td>{formatNumber(c.daysOverdue,language)}</td></tr>)}</tbody></table>{!data?.dueCustomers?.length&&<p className="p-6 text-center text-slate-500">{t('dashboard.noDue')}</p>}</section></div>}
  </main>;
}
