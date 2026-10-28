import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/axios.js';
import SalesPurchaseChart from './SalesPurchaseChart.jsx';
import { formatBS, formatAmount, formatNumber } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import VehicleRevenueChart from './VehicleRevenueChart.jsx';

export default function DashboardPage() {
  const { language, t, option } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showDue, setShowDue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setError('');
    setLoading(true);
    api.get(`/api/v1/business/dashboard?_ts=${Date.now()}`)
      .then((r) => { if (live) setData(r.data?.data); })
      .catch((e) => { if (live) setError(e.response?.data?.message || t('dashboard.loadError')); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [t]);

  const yearly = data?.yearlyPurchases || {
    year: data?.summary?.year,
    purchaseCost: 0,
    amountPaid: 0,
    amountToBePaid: 0,
    paidRatio: 0
  };

  const allTime = data?.allTimeSummary || {
    totalRevenue: data?.summary?.revenue || 0,
    totalCost: data?.summary?.cost || 0,
    amountToBeRecovered: data?.summary?.due || 0,
    amountPaid: 0,
    amountToBePaid: 0
  };

  const paidRatioPercent = Math.min(100, Math.round((yearly.paidRatio || 0) * 100));

  return (
    <main className="kds-page space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">{t('dashboard.overview')}</p>
        <h1 className="text-2xl font-bold text-[#12355b]">{t('dashboard.title')}</h1>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

      {/* 4 Top Yearly Summary Cards */}
      <section className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {[
          [`${t('dashboard.revenue')} (${formatNumber(data?.summary?.year, language)} BS)`, data?.summary?.revenue, 'bi-graph-up-arrow', 'from-emerald-500 to-teal-500', null],
          [`${t('dashboard.cost')} (${formatNumber(data?.summary?.year, language)} BS)`, data?.summary?.cost, 'bi-wallet2', 'from-amber-500 to-orange-500', null],
          [t('dashboard.recovered'), data?.summary?.recovered, 'bi-cash-coin', 'from-blue-500 to-cyan-500', `BS ${formatNumber(data?.summary?.year, language)}`],
          [t('dashboard.due'), data?.summary?.due, 'bi-hourglass-split', 'from-rose-500 to-pink-500', t('common.allTime')]
        ].map(([title, value, icon, color, period]) => (
          <article key={title} className="kds-card group relative flex min-h-36 flex-col justify-between overflow-hidden p-3 sm:p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
                {period && <p className="mt-1 text-xs text-slate-400">{period}</p>}
              </div>
              <span className={`hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-lg text-white shadow-md`}>
                <i className={`bi ${icon}`} />
              </span>
            </div>
            <p className="mt-4 text-sm font-bold tracking-tight text-[#12355b] sm:text-2xl">
              {loading ? t('dashboard.loading') : formatAmount(value, language)}
            </p>
          </article>
        ))}
      </section>

      {/* Task 5: Yearly Purchases Card & Task 6: All-Time Summary Cards */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Task 5: Yearly Purchases Card */}
        <article className="kds-card flex flex-col justify-between p-5 border-t-4 border-t-indigo-600 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-[#12355b] text-lg">{t('dashboard.yearlyPurchasesTitle')}</h2>
                <p className="text-xs text-slate-500">{formatNumber(yearly.year, language)} BS</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {t('dashboard.paidPercent', { percent: formatNumber(paidRatioPercent, language) })}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:text-left">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">{t('dashboard.purchaseCost')}</p>
                <p className="mt-1 font-bold text-slate-800 text-sm sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(yearly.purchaseCost, language)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-700">{t('dashboard.amountPaid')}</p>
                <p className="mt-1 font-bold text-emerald-900 text-sm sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(yearly.amountPaid, language)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-700">{t('dashboard.amountToBePaid')}</p>
                <p className="mt-1 font-bold text-amber-900 text-sm sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(yearly.amountToBePaid, language)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{t('dashboard.paidRatio')}</span>
              <span>{formatAmount(yearly.amountPaid, language)} / {formatAmount(yearly.purchaseCost, language)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${paidRatioPercent}%` }}
              />
            </div>
          </div>
        </article>

        {/* Task 6: All-Time Summary Card */}
        <article className="kds-card p-5 border-t-4 border-t-sky-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-[#12355b] text-lg">{t('dashboard.allTimeSummaryTitle')}</h2>
              <p className="text-xs text-slate-500">{t('dashboard.allTimeSubtitle')}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-emerald-50/60 p-2.5">
                <p className="text-xs font-medium text-emerald-800">{t('dashboard.totalRevenue')}</p>
                <p className="mt-1 text-sm font-bold text-emerald-950 sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(allTime.totalRevenue, language)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50/60 p-2.5">
                <p className="text-xs font-medium text-amber-800">{t('dashboard.totalCost')}</p>
                <p className="mt-1 text-sm font-bold text-amber-950 sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(allTime.totalCost, language)}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50/60 p-2.5">
                <p className="text-xs font-medium text-rose-800">{t('dashboard.allTimeRecovered')}</p>
                <p className="mt-1 text-sm font-bold text-rose-950 sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(allTime.amountToBeRecovered, language)}
                </p>
              </div>
              <div className="rounded-lg bg-sky-50/60 p-2.5 sm:col-span-1">
                <p className="text-xs font-medium text-sky-800">{t('dashboard.amountPaidTillDate')}</p>
                <p className="mt-1 text-sm font-bold text-sky-950 sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(allTime.amountPaid, language)}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50/60 p-2.5 sm:col-span-2">
                <p className="text-xs font-medium text-orange-800">{t('dashboard.allTimeToBePaid')}</p>
                <p className="mt-1 text-sm font-bold text-orange-950 sm:text-base">
                  {loading ? t('dashboard.loading') : formatAmount(allTime.amountToBePaid, language)}
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <SalesPurchaseChart />
      <VehicleRevenueChart />

      {data?.vehicleAnalytics && (
        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <article className="kds-card p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-[#12355b]">{t('dashboard.vehiclePerformance')}</h2>
              <p className="text-sm text-slate-500">{t('dashboard.vehiclePerformanceSubtitle')}</p>
            </div>
            <div className="space-y-4">
              {data.vehicleAnalytics.map((v) => {
                const scale = Math.max(1, ...data.vehicleAnalytics.flatMap((x) => [x.revenue, x.cost, x.due]));
                return (
                  <div key={v.vehicle}>
                    <div className="mb-1 flex justify-between text-sm">
                      <strong className="text-slate-700">{option(v.vehicle)}</strong>
                      <span className="text-xs text-slate-500">
                        {t('dashboard.revenue')} {formatAmount(v.revenue, language)} · {t('dashboard.cost')} {formatAmount(v.cost, language)} · {t('dashboard.due')} {formatAmount(v.due, language)}
                      </span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <span title={t('dashboard.revenue')} className="bg-emerald-500" style={{ width: `${(v.revenue / scale) * 100}%` }} />
                      <span title={t('dashboard.paidCost')} className="bg-amber-500" style={{ width: `${(v.cost / scale) * 100}%` }} />
                      <span title={t('dashboard.due')} className="bg-rose-400" style={{ width: `${(v.due / scale) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              {[
                ['bg-emerald-500', t('dashboard.revenue')],
                ['bg-amber-500', t('dashboard.paidCost')],
                ['bg-rose-400', t('dashboard.due')]
              ].map(([c, l]) => (
                <span key={l}>
                  <i className={`mr-1 inline-block h-2 w-2 rounded-full ${c}`} />
                  {l}
                </span>
              ))}
            </div>
          </article>

          <article className="kds-card p-5">
            <h2 className="font-semibold text-[#12355b]">{t('dashboard.efficiencyRatios')}</h2>
            <p className="mb-4 text-sm text-slate-500">{t('dashboard.efficiencySubtitle')}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-slate-500">
                    <th className="py-2">{t('sales.vehicle')}</th>
                    <th className="py-2">{t('dashboard.revenueFuel')}</th>
                    <th className="py-2">{t('dashboard.revenueCost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehicleAnalytics.map((v) => (
                    <tr className="border-b last:border-0" key={v.vehicle}>
                      <td className="py-3 font-medium">{option(v.vehicle)}</td>
                      <td className={`py-3 font-semibold ${(v.revenueFuelRatio || 0) >= 3 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {v.revenueFuelRatio == null ? '—' : `${formatNumber(v.revenueFuelRatio.toFixed(2), language)}×`}
                      </td>
                      <td className={`py-3 font-semibold ${(v.revenueCostRatio || 0) >= 1 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {v.revenueCostRatio == null ? '—' : `${formatNumber(v.revenueCostRatio.toFixed(2), language)}×`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {/* Overdue button */}
      <button
        onClick={() => setShowDue(true)}
        className="kds-card flex w-full items-center justify-between p-5 text-left hover:border-red-300"
      >
        <span>
          <span className="block font-semibold text-[#12355b]">{t('dashboard.due90')}</span>
          <span className="text-sm text-slate-500">{t('dashboard.overdueCustomers')}</span>
        </span>
        <strong className="text-xl text-red-700">
          {formatAmount((data?.dueCustomers || []).reduce((s, c) => s + c.amountDue, 0), language)} →
        </strong>
      </button>

      {/* Overdue modal */}
      {showDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowDue(false)}>
          <section className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-semibold text-[#12355b]">{t('dashboard.dueList')}</h2>
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-700" onClick={() => setShowDue(false)}>
                {t('common.close')}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  {[['dashboard.customer'], ['dashboard.phone'], ['dashboard.amountDue'], ['dashboard.lastPayment'], ['dashboard.daysOverdue']].map(([key]) => (
                    <th className="p-2" key={key}>{t(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.dueCustomers?.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">
                      <Link className="text-blue-700 underline" to={`/customers/${c.id}`} onClick={() => setShowDue(false)}>
                        {c.name}
                      </Link>
                    </td>
                    <td>{c.phone}</td>
                    <td>{formatAmount(c.amountDue, language)}</td>
                    <td>{c.lastPaymentDate ? formatBS(c.lastPaymentDate, 'long', language) : t('dashboard.never')}</td>
                    <td>{formatNumber(c.daysOverdue, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.dueCustomers?.length && (
              <p className="p-6 text-center text-slate-500">{t('dashboard.noDue')}</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
