import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import { getAllCustomers, addNewCustomer, updateCustomer } from "../../services/customer/customer";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "../../components/common/Table/table";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import PaginationBar from "../../components/common/Pagination/paginationbar";
import { useI18n } from "../../i18n/I18nProvider.jsx";

const PAGE_VALUE_LIMIT = 15;

const CustomerMainUI = () => {
  const { option, t } = useI18n();
  const role = useSelector((state) => state.auth.user?.role || 'operator');
  const [isAddCustomerFrmOpen, setIsAddCustomerFrmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(1);
  const [matchingCount, setMatchingCount] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({ q: '', customer_type: '', location: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const makeRow = useCallback((row) => ({
    "Customer ID": row.id,
    ...row,
    Actions: <><Link to={`/customers/${row.id}`} className="mr-3 font-medium text-[#12355b] hover:text-sky-600 hover:underline">{t('customer.view')}</Link>{role === 'admin' && <button className="text-blue-700" onClick={() => setEditing({ id: row.id, name: row.name, phone_number: row.phone_number, address: row.address || '', customer_type: String(row.customer_type || 'private').toLowerCase() })}>{t('common.edit')}</button>}</>
  }), [role, t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setLoadError('');
    getAllCustomers({ page, limit: PAGE_VALUE_LIMIT, ...filters }).then((response) => {
      if (cancelled) return;
      const rows = response?.data?.rows || [];
      const count = Number(response?.data?.metaData?.[0]?.totalCustomers || 0);
      setMatchingCount(count);
      setTotalRows(Math.max(1, Math.ceil(count / PAGE_VALUE_LIMIT)));
      setTableData(rows.map(makeRow));
    }).catch((error) => {
      if (cancelled) return;
      const message = error?.message || t('common.loadError');
      setLoadError(message); toast.error(message);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, filters, makeRow, t]);

  const handleSubmit = async (data) => {
    try {
      const response = await addNewCustomer(data);
      toast.success(response?.message);
      setIsAddCustomerFrmOpen(false); setPage(1); setFilters((value) => ({ ...value }));
    } catch (error) { toast.error(error?.message || String(error)); }
  };

  const handleUpdate = async (data) => {
    try { const response = await updateCustomer(editing.id, data); toast.success(response?.message || t('customer.updated')); setEditing(null); setFilters((value) => ({ ...value })); }
    catch (error) { toast.error(error?.message || t('customer.updateError')); }
  };

  const updateFilter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  const clearFilters = () => { setPage(1); setFilters({ q: '', customer_type: '', location: '' }); };

  return <main className="kds-page">
    <div className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto]">
      <input aria-label={t('customer.search')} className="kds-input kds-search w-full" placeholder={t('customer.search')} value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} />
      <div className="flex justify-center sm:justify-end"><Button children={t('customer.add')} size="sm" onClick={() => setIsAddCustomerFrmOpen(true)} /></div>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="kds-label">{t('customer.typeLabel')}<select className="kds-input mt-1" value={filters.customer_type} onChange={(event) => updateFilter('customer_type', event.target.value)}><option value="">{t('customer.allTypes')}</option>{['private', 'governmental', 'ngo'].map((value) => <option key={value} value={value}>{option(value)}</option>)}</select></label>
      <label className="kds-label">{t('customer.location')}<input className="kds-input mt-1" placeholder={t('customer.filterLocation')} value={filters.location} onChange={(event) => updateFilter('location', event.target.value)} /></label>
      <div className="flex items-end"><Button size="sm" varient="outline" onClick={clearFilters}>{t('customer.clearFilters')}</Button></div>
    </div>
    {isAddCustomerFrmOpen && <Form useCase="addNewCustomer" handleFormSubmit={handleSubmit} />}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-4xl rounded-xl bg-white p-5"><div className="mb-3 flex justify-between"><h2 className="font-semibold">{t('customer.edit')}</h2><button onClick={() => setEditing(null)}>{t('customer.close')}</button></div><Form key={editing.id} useCase="addNewCustomer" datas={editing} handleFormSubmit={handleUpdate} /></section></div>}
    {loading && <p className="p-5 text-center text-slate-500">{t('common.loading')}</p>}
    {!loading && loadError && <p role="alert" className="kds-card p-5 text-center text-red-700">{loadError}</p>}
    {!loading && !loadError && matchingCount === 0 && <p className="kds-card p-8 text-center text-slate-500">{t('customer.noMatches')}</p>}
    {!loading && !loadError && matchingCount > 0 && <Table tableData={tableData} />}
    {!loading && matchingCount > 0 && <PaginationBar current={page} total={totalRows} onPageChange={setPage} />}
  </main>;
};

export default CustomerMainUI;
