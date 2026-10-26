import { useEffect, useMemo, useState } from 'react';
import api from '../../services/axios.js';
import { formatAmount } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';

const colors = { Tractor: '#2563eb', JCB: '#f97316', Tipper: '#059669' };
const labels = { day: 'Day', week: 'Week', month: 'Month' };

export default function VehicleRevenueChart() {
  const { language } = useI18n();
  const [granularity, setGranularity] = useState('day');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    api.get('/api/v1/business/dashboard/vehicle-revenue', { params: { granularity }, signal: controller.signal })
      .then((response) => setData(response.data?.data || null))
      .catch((requestError) => { if (requestError.code !== 'ERR_CANCELED') setError(requestError.response?.data?.message || 'Unable to load vehicle revenue'); });
    return () => controller.abort();
  }, [granularity]);
  const view = useMemo(() => {
    const points = data?.points || [];
    const max = Math.max(1, ...points.flatMap((point) => Object.values(point.revenues || {})));
    const width = Math.max(760, points.length * (granularity === 'day' ? 28 : 56));
    const todayIndex = points.findIndex((point) => point.key === data?.today);
    const xAt = (index) => points.length < 2 ? width / 2 : 24 + index * (width - 48) / (points.length - 1);
    const series = (vehicle) => points.map((point, index) => `${index ? 'L' : 'M'} ${xAt(index)} ${220 - (point.revenues?.[vehicle] || 0) / max * 190}`).join(' ');
    return { points, max, width, todayX: todayIndex < 0 ? width / 2 : xAt(todayIndex), series };
  }, [data, granularity]);
  return <section className="kds-card overflow-hidden p-4 sm:p-6">
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-[#12355b]">Vehicle revenue</h2><p className="text-sm text-slate-500">Revenue by vehicle around today</p></div><div className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Revenue interval">{Object.entries(labels).map(([key, label]) => <button key={key} type="button" aria-pressed={granularity === key} onClick={() => setGranularity(key)} className={`rounded-md px-3 py-1.5 text-sm ${granularity === key ? 'bg-white font-semibold text-[#12355b] shadow-sm' : 'text-slate-500'}`}>{label}</button>)}</div></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!error && <div className="overflow-x-auto"><svg viewBox={`0 0 ${view.width} 270`} width={view.width} height="270" role="img" aria-label={`${granularity} vehicle revenue chart with Today marker`}>
      {[30, 77, 125, 172, 220].map((y) => <line key={y} x1="0" x2={view.width} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 5" />)}
      <line x1={view.todayX} x2={view.todayX} y1="18" y2="225" stroke="#0f172a" strokeDasharray="5 4" strokeWidth="2"/><rect x={view.todayX - 27} y="2" width="54" height="20" rx="10" fill="#12355b"/><text x={view.todayX} y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Today</text>
      {['Tractor', 'JCB', 'Tipper'].map((vehicle) => <g key={vehicle}><path d={view.series(vehicle)} fill="none" stroke={colors[vehicle]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{view.points.map((point, i) => <circle key={`${vehicle}-${point.key}`} cx={view.points.length < 2 ? view.width / 2 : 24 + i * (view.width - 48) / (view.points.length - 1)} cy={220 - (point.revenues?.[vehicle] || 0) / view.max * 190} r="2.5" fill={colors[vehicle]} />)}</g>)}
      {view.points.map((point, i) => (i % Math.max(1, Math.ceil(view.points.length / 12)) === 0 || point.key === data?.today) && <text key={point.key} x={view.points.length < 2 ? view.width / 2 : 24 + i * (view.width - 48) / (view.points.length - 1)} y="246" textAnchor="middle" fill="#64748b" fontSize="10">{point.key}</text>)}
    </svg></div>}
    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">{Object.entries(colors).map(([vehicle, color]) => <span key={vehicle} className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{vehicle}</span>)}</div>
    {!!view.points.length && <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">{['Tractor', 'JCB', 'Tipper'].map((vehicle) => <p key={vehicle} className="rounded-lg bg-slate-50 p-2"><strong style={{ color: colors[vehicle] }}>{vehicle}</strong> today: {formatAmount(view.points.find((point) => point.key === data?.today)?.revenues?.[vehicle] || 0, language)}</p>)}</div>}
  </section>;
}
