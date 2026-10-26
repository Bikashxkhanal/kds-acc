import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PaginationBar from '../../components/common/Pagination/paginationbar.jsx';
import Table from '../../components/common/Table/table.jsx';
import { deleteStaff, getAllStaffs } from '../../services/staff/staff.api.js';

const PAGE_LIMIT = 12;
const roles = ['Tractor Driver', 'JCB Operator', 'Tipper Driver', 'Helper', 'Accountant', 'Manager', 'Other'];
export default function StaffList() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(() => ({ q: searchParams.get('q') || '', role: '', status: '' })); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let live = true; setLoading(true); setError('');
    getAllStaffs({ page, limit: PAGE_LIMIT, ...filters }).then((response) => {
      if (!live) return;
      const data = response?.data || {};
      setRows(data.staffDetails || []);
      setTotalPages(Math.max(1, Math.ceil(Number(data.metaData?.[0]?.staffCount || 0) / PAGE_LIMIT)));
    }).catch((requestError) => live && setError(requestError?.message || 'Could not load staff. Check your session and try again.'))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [page, filters, refresh]);
  const onFilter = (key, value) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  const removeStaff = useCallback(async (staff) => {
    if (!window.confirm(`Archive ${staff.name}? Their payment history will be preserved.`)) return;
    try { const result = await deleteStaff(staff.id); toast.success(result?.message || 'Staff archived'); setRefresh((n) => n + 1); }
    catch (requestError) { toast.error(requestError?.message || 'Unable to archive staff'); }
  }, []);
  const tableData = rows.map((staff) => ({
    Name: staff.name,
    Role: staff.role || staff.position || 'Other',
    Phone: staff.phone_number,
    'Assigned Vehicle': staff.assignedVehicle || 'None',
    Status: <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${staff.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>{staff.status || 'Active'}</span>,
    Actions: <div className="flex items-center gap-3"><Link to={`/staff/${staff.id}`} className="font-medium text-[#12355b] hover:underline">View</Link><Link to={`/staff/${staff.id}/edit`} className="font-medium text-blue-700 hover:underline">Edit</Link><button type="button" onClick={() => removeStaff(staff)} className="font-medium text-red-700 hover:underline">Delete</button></div>
  }));
  return <main className="kds-page">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Human resources</p><h1 className="text-2xl font-bold text-[#12355b]">Staff Directory</h1><p className="text-sm text-slate-500">Search, filter, and manage staff profiles.</p></div><Link className="rounded-lg bg-[#12355b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a4a7a]" to="/staff/new">Add Staff</Link></header>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="kds-label">Search name or phone<input className="kds-input mt-1" value={filters.q} onChange={(event) => onFilter('q', event.target.value)} placeholder="Search staff" /></label>
      <label className="kds-label">Role<select className="kds-input mt-1" value={filters.role} onChange={(event) => onFilter('role', event.target.value)}><option value="">All roles</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
      <label className="kds-label">Status<select className="kds-input mt-1" value={filters.status} onChange={(event) => onFilter('status', event.target.value)}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></label>
    </section>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status" className="rounded-xl bg-white p-10 text-center text-slate-500">Loading staff…</p> : error ? null : <Table tableData={tableData} />}
    {!loading && !error && rows.length === 0 && <p className="-mt-4 text-center text-sm text-slate-500">No staff match these filters.</p>}
    <PaginationBar current={page} total={totalPages} onPageChange={setPage} />
  </main>;
}
