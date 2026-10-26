import { useEffect, useId, useMemo, useState } from 'react';
import api from '../../services/axios.js';
import BSDateField from '../../components/common/BSDateField.jsx';
import { addDaysISO, bsToISO, defaultBSRange, formatBS, formatAmount, isISODate, isoToBS, parseBSInput } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';

const defaultRange = defaultBSRange;
const pad = (value) => String(value).padStart(2, '0');
const zeroSeries = (from, to, granularity) => {
  if (!isISODate(from) || !isISODate(to) || from > to) return [];
  const first = parseBSInput(isoToBS(from)); const last = parseBSInput(isoToBS(to));
  if (!first || !last) return [];
  const result = [];
  if (granularity === 'day') {
    const days = Math.min(366, Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1);
    for (let offset = 0; offset < days; offset += 1) {
      const iso = addDaysISO(from, offset);
      if (iso > to) break;
      const key = isoToBS(iso);
      result.push({ key, date: key, sales: 0, purchase: 0, difference: 0 });
    }
  } else if (granularity === 'month') {
    const firstIndex = first.year * 12 + first.month - 1;
    const lastIndex = last.year * 12 + last.month - 1;
    for (let index = firstIndex; index <= lastIndex && result.length < 240; index += 1) {
      const year = Math.floor(index / 12); const month = index % 12 + 1; const key = `${year}-${pad(month)}`;
      result.push({ key, period: key, sales: 0, purchase: 0, difference: 0 });
    }
  } else {
    for (let year = first.year; year <= last.year && result.length < 100; year += 1) result.push({ key: String(year), period: String(year), sales: 0, purchase: 0, difference: 0 });
  }
  return result;
};
const smoothPath = (points) => points.map((point, index) => {
  if (!index) return `M ${point.x} ${point.y}`;
  const previous = points[index - 1];
  const middle = (previous.x + point.x) / 2;
  return `C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
}).join(' ');

export default function SalesPurchaseChart() {
  const { language, t } = useI18n();
  const [granularity, setGranularity] = useState('day');
  const [range, setRange] = useState(() => defaultRange('day'));
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showSales, setShowSales] = useState(true);
  const [showPurchase, setShowPurchase] = useState(true);
  const [hovered, setHovered] = useState(null);
  const gradientId = useId().replaceAll(':', '');
  const rangeError = !isISODate(range.from) || !isISODate(range.to)
    ? t('chart.selectDates')
    : range.from > range.to ? t('chart.invalidRange') : '';
  const chartPoints = useMemo(() => points.length ? points : zeroSeries(range.from, range.to, granularity), [points, range.from, range.to, granularity]);

  useEffect(() => {
    if (rangeError) {
      setError('');
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true); setError(''); setHovered(null);
    api.get('/api/v1/business/dashboard/sales-vs-purchase', {
      params: { granularity, from: range.from, to: range.to }, signal: controller.signal
    }).then((response) => setPoints(Array.isArray(response.data?.data?.points) ? response.data.data.points : []))
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.response?.data?.message || 'Unable to load sales and purchase data');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [granularity, range.from, range.to, rangeError, retryCount]);

  const chart = useMemo(() => {
    const maxValue = Math.max(1, ...chartPoints.flatMap((point) => [point.sales, point.purchase]));
    const step = maxValue / 4;
    const ticks = Array.from({ length: 5 }, (_, index) => step * (4 - index));
    const width = Math.max(520, chartPoints.length * (granularity === 'day' ? 48 : 72));
    const height = 290, top = 18, bottom = 244, plotHeight = bottom - top;
    const coords = chartPoints.map((point, index) => ({
      point,
      x: chartPoints.length === 1 ? width / 2 : 18 + index * (width - 36) / (chartPoints.length - 1),
      salesY: bottom - point.sales / (step * 4 || 1) * plotHeight,
      purchaseY: bottom - point.purchase / (step * 4 || 1) * plotHeight
    }));
    const salesCoords = coords.map(({ x, salesY }) => ({ x, y: salesY }));
    const purchaseCoords = coords.map(({ x, purchaseY }) => ({ x, y: purchaseY }));
    const area = (path, lastX) => `${path} L ${lastX} ${bottom} L 0 ${bottom} Z`;
    return { maxValue, ticks, width, height, top, bottom, coords, salesPath: smoothPath(salesCoords), purchasePath: smoothPath(purchaseCoords), salesArea: area(smoothPath(salesCoords), salesCoords.at(-1)?.x || width), purchaseArea: area(smoothPath(purchaseCoords), purchaseCoords.at(-1)?.x || width) };
  }, [chartPoints, granularity]);

  const setGranularityAndRange = (value) => { setGranularity(value); setRange(defaultRange(value)); };
  const activePoint = hovered == null ? null : chart.coords[hovered]?.point;
  const tooltipDate = (point) => {
    if (!point) return '';
    const key = point.date || point.period || point.key;
    const isoKey = key.length === 7 ? `${key}-01` : key.length === 4 ? `${key}-01-01` : key;
    const iso = isISODate(isoKey) ? isoKey : bsToISO(isoKey);
    return formatBS(iso, granularity === 'day' ? 'long' : granularity, language);
  };
  const axisDate = (point) => {
    const key = point.date || point.period || point.key;
    const isoKey = key.length === 7 ? `${key}-01` : key.length === 4 ? `${key}-01-01` : key;
    const iso = isISODate(isoKey) ? isoKey : bsToISO(isoKey);
    return formatBS(iso, granularity === 'day' ? 'short' : granularity, language);
  };

  return <section className="kds-card overflow-hidden p-4 sm:p-6">
    <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><h2 className="font-semibold text-[#12355b]">{t('chart.title')}</h2><p className="mt-1 text-sm text-slate-500">{t('chart.subtitle')}</p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-600">{t('chart.granularity')}<select className="kds-input mt-1" value={granularity} onChange={(event) => setGranularityAndRange(event.target.value)}><option value="day">{t('chart.day')}</option><option value="month">{t('chart.month')}</option><option value="year">{t('chart.year')}</option></select></label>
        <label className="text-xs font-medium text-slate-600">{t('chart.from')}<BSDateField defaultToToday={false} className="kds-input mt-1" value={range.from} onChange={(value) => setRange((old) => ({ ...old, from: value }))} /></label>
        <label className="text-xs font-medium text-slate-600">{t('chart.to')}<BSDateField defaultToToday={false} className="kds-input mt-1" value={range.to} onChange={(value) => setRange((old) => ({ ...old, to: value }))} /></label>
      </div>
    </header>
    <div className="mb-4 flex flex-wrap gap-2">
      <button type="button" aria-pressed={showSales} onClick={() => setShowSales((value) => !value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${showSales ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-400'}`}><span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500" />{t('chart.sales')}</button>
      <button type="button" aria-pressed={showPurchase} onClick={() => setShowPurchase((value) => !value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${showPurchase ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-slate-200 bg-white text-slate-400'}`}><span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500" />{t('chart.purchase')}</button>
    </div>
    {rangeError && <p role="alert" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{rangeError}</p>}
    {error && <div role="alert" className="mb-3 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" className="ml-3 rounded border border-red-300 px-3 py-1 font-medium" onClick={() => setRetryCount((count) => count + 1)}>{t('common.retry')}</button></div>}
    {loading && <div className="mb-2 h-5 w-40 animate-pulse rounded bg-slate-200" aria-label={t('common.loading')} />}
    <div className="flex min-w-0 rounded-xl bg-gradient-to-b from-slate-50/80 to-white">
      <aside className="relative z-10 w-[74px] shrink-0 border-r border-slate-200 bg-white/90" aria-label="Amount axis">
        <span className="absolute left-0 top-1/2 -translate-x-[34%] -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs font-semibold tracking-wide text-slate-500">{t('chart.amount')}</span>
        <div className="absolute inset-y-[18px] right-1 flex flex-col justify-between text-[10px] text-slate-500">{chart.ticks.map((tick, index) => <span key={index} className="text-right">{formatAmount(tick, language)}</span>)}</div>
      </aside>
      <div className="min-w-0 flex-1 overflow-x-auto" onMouseLeave={() => setHovered(null)}>
        <div className="relative" style={{ width: chart.width }}>
          {activePoint && <div className="pointer-events-none absolute left-3 top-2 z-10 rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur" style={{ left: Math.min((chart.coords[hovered]?.x || 0) + 18, chart.width - 190) }}>
            <p className="mb-2 font-semibold text-slate-800">{tooltipDate(activePoint)}</p>
            <p className="text-blue-700">{t('chart.sales')}: {formatAmount(activePoint.sales, language)}</p><p className="text-orange-700">{t('chart.purchase')}: {formatAmount(activePoint.purchase, language)}</p>
            <p className={`mt-1 border-t pt-1 font-semibold ${activePoint.difference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{activePoint.difference >= 0 ? t('chart.profit') : t('chart.loss')}: {formatAmount(Math.abs(activePoint.difference), language)}</p>
          </div>}
          <svg key={`${granularity}-${range.from}-${range.to}`} viewBox={`0 0 ${chart.width} ${chart.height}`} width={chart.width} height={chart.height} className="block max-w-none" role="img" aria-label={`Daily, monthly, or yearly sales and purchase cost chart with ${points.length} time points`}>
            <defs>
              <linearGradient id={`${gradientId}-sales`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".20"/><stop offset="100%" stopColor="#3b82f6" stopOpacity=".015"/></linearGradient>
              <linearGradient id={`${gradientId}-purchase`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".18"/><stop offset="100%" stopColor="#f97316" stopOpacity=".01"/></linearGradient>
            </defs>
            {chart.ticks.map((tick, index) => { const y = chart.top + index * (chart.bottom - chart.top) / 4; return <line key={index} x1="0" x2={chart.width} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={index === 4 ? undefined : '3 5'} />; })}
            <line x1="0" x2="0" y1={chart.top} y2={chart.bottom} stroke="#94a3b8" strokeWidth="1.5"/><line x1="0" x2={chart.width} y1={chart.bottom} y2={chart.bottom} stroke="#94a3b8" strokeWidth="1.5"/>
            {showSales && points.length > 1 && <path d={chart.salesArea} fill={`url(#${gradientId}-sales)`} className="chart-area"/>}
            {showPurchase && points.length > 1 && <path d={chart.purchaseArea} fill={`url(#${gradientId}-purchase)`} className="chart-area"/>}
            {showSales && chart.salesPath && <path d={chart.salesPath} pathLength={1} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chart-line"/>}
            {showPurchase && chart.purchasePath && <path d={chart.purchasePath} pathLength={1} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chart-line chart-line-delay"/>}
            {hovered != null && chart.coords[hovered] && <line x1={chart.coords[hovered].x} x2={chart.coords[hovered].x} y1={chart.top} y2={chart.bottom} stroke="#64748b" strokeOpacity=".5" strokeDasharray="4 4"/>}
            {chart.coords.map(({ point, x, salesY, purchaseY }, index) => <g key={point.key || point.date || point.period} onMouseEnter={() => setHovered(index)} className="cursor-crosshair">
              <rect x={x - Math.max(20, chart.width / chartPoints.length / 2)} y={chart.top} width={Math.max(40, chart.width / chartPoints.length)} height={chart.bottom - chart.top} fill="transparent"/>
              {showSales && <circle cx={x} cy={salesY} r={hovered === index ? 6 : 3} fill="#2563eb" stroke="white" strokeWidth="2" className="chart-point"/>}
              {showPurchase && <circle cx={x} cy={purchaseY} r={hovered === index ? 6 : 3} fill="#ea580c" stroke="white" strokeWidth="2" className="chart-point"/>}
              {index % Math.max(1, Math.ceil(chartPoints.length / 12)) === 0 && <text x={x} y="267" textAnchor="middle" fontSize="10" fill="#64748b">{axisDate(point)}</text>}
              <title>{`${tooltipDate(point)} — ${t('chart.sales')} ${formatAmount(point.sales, language)}, ${t('chart.purchase')} ${formatAmount(point.purchase, language)}, ${t('chart.profit')}/${t('chart.loss')} ${formatAmount(point.difference, language)}`}</title>
            </g>)}
          </svg>
        </div>
      </div>
    </div>
    <p className="mt-2 pl-[74px] text-center text-xs font-semibold tracking-wide text-slate-500">{t('chart.time')}</p>
    {!loading && !error && !rangeError && (points.length === 0 || points.every((point) => !point.sales && !point.purchase)) && <p className="mt-3 text-center text-sm text-slate-500">{t('chart.empty')}</p>}
  </section>;
}
