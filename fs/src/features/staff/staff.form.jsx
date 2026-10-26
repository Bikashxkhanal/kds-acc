import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/common/button.jsx';
import Card from '../../components/common/Card.jsx';
import { createStaff, getAStaffDetails, updateStaff } from '../../services/staff/staff.api.js';

const EMPTY = { name: '', phone_number: '', email: '', role: 'Other', assignedVehicle: 'None', address: '', dateOfJoining: '', salary: '', paymentType: 'Monthly', idProofType: '', idProofNumber: '', emergencyContactName: '', emergencyContactPhone: '', status: 'Active', notes: '' };
const roles = ['Tractor Driver', 'JCB Operator', 'Tipper Driver', 'Helper', 'Accountant', 'Manager', 'Other'];
const Field = ({ label, children }) => <label className="kds-label">{label}{children}</label>;
const Input = ({ className = '', ...props }) => <input className={`kds-input mt-1 ${className}`} {...props} />;

export default function StaffForm() {
  const { id } = useParams(); const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY); const [loading, setLoading] = useState(Boolean(id)); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    let live = true;
    getAStaffDetails(id).then((response) => {
      if (!live) return;
      const staff = response?.data || {};
      setValues({ ...EMPTY, ...staff, dateOfJoining: staff.dateOfJoining ? new Date(staff.dateOfJoining).toISOString().slice(0, 10) : staff.dob ? new Date(staff.dob).toISOString().slice(0, 10) : '' });
    }).catch((requestError) => live && setError(requestError?.message || 'Could not load staff profile')).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [id]);
  const update = (key, value) => setValues((old) => ({ ...old, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!/^\d{10}$/.test(values.phone_number.trim())) return setError('Phone number must contain exactly 10 digits');
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setError('Enter a valid email address');
    if (values.emergencyContactPhone && !/^\d{10}$/.test(values.emergencyContactPhone.trim())) return setError('Emergency phone must contain exactly 10 digits');
    if (Number(values.salary) <= 0) return setError('Salary or daily wage must be greater than zero');
    setSaving(true);
    try {
      const response = id ? await updateStaff(id, values) : await createStaff(values);
      toast.success(response?.message || (id ? 'Staff updated' : 'Staff added'));
      navigate(id ? '/staff/all' : `/staff/all?q=${encodeURIComponent(values.phone_number)}`, { replace: true });
    } catch (requestError) { setError(requestError?.message || 'Unable to save staff details'); }
    finally { setSaving(false); }
  };
  if (loading) return <main className="kds-page"><p role="status">Loading staff profile…</p></main>;
  return <main className="kds-page">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Human resources</p><h1 className="text-2xl font-bold text-[#12355b]">{id ? 'Edit Staff' : 'Add Staff'}</h1></div><Link className="text-sm text-blue-700 hover:underline" to="/staff/all">Back to staff list</Link></div>
    <form onSubmit={submit} className="space-y-5">
      <Card title="Personal details"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Full Name *"><Input required minLength="2" maxLength="100" value={values.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" /></Field>
        <Field label="Phone *"><Input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={values.phone_number} onChange={(e) => update('phone_number', e.target.value)} autoComplete="tel" /></Field>
        <Field label="Email"><Input type="email" value={values.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" /></Field>
        <Field label="Address"><Input maxLength="300" value={values.address} onChange={(e) => update('address', e.target.value)} /></Field>
        <Field label="Date of Joining *"><Input required type="date" value={values.dateOfJoining} onChange={(e) => update('dateOfJoining', e.target.value)} /></Field>
        <Field label="Status"><select className="kds-input mt-1" value={values.status} onChange={(e) => update('status', e.target.value)}><option>Active</option><option>Inactive</option></select></Field>
      </div></Card>
      <Card title="Role and compensation"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Role / Designation *"><select required className="kds-input mt-1" value={values.role} onChange={(e) => update('role', e.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></Field>
        <Field label="Assigned Vehicle"><select className="kds-input mt-1" value={values.assignedVehicle} onChange={(e) => update('assignedVehicle', e.target.value)}>{['Tractor', 'JCB', 'Tipper', 'None'].map((vehicle) => <option key={vehicle}>{vehicle}</option>)}</select></Field>
        <Field label="Salary / Daily Wage *"><Input required type="number" min="0.01" step="any" value={values.salary} onChange={(e) => update('salary', e.target.value)} /></Field>
        <Field label="Payment Type"><select className="kds-input mt-1" value={values.paymentType} onChange={(e) => update('paymentType', e.target.value)}><option>Monthly</option><option>Daily</option></select></Field>
      </div></Card>
      <Card title="Optional information"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="ID Proof Type"><select className="kds-input mt-1" value={values.idProofType} onChange={(e) => update('idProofType', e.target.value)}><option value="">Select proof</option>{['Citizenship', 'Passport', 'Driving License', 'National ID', 'Other'].map((type) => <option key={type}>{type}</option>)}</select></Field>
        <Field label="ID Proof Number"><Input maxLength="80" value={values.idProofNumber} onChange={(e) => update('idProofNumber', e.target.value)} /></Field>
        <Field label="Emergency Contact Name"><Input maxLength="100" value={values.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} /></Field>
        <Field label="Emergency Contact Phone"><Input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={values.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} /></Field>
        <Field label="Notes"><textarea className="kds-input mt-1 min-h-24" maxLength="1000" value={values.notes} onChange={(e) => update('notes', e.target.value)} /></Field>
      </div></Card>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm" to="/staff/all">Cancel</Link><Button type="submit" loading={saving}>{id ? 'Save Changes' : 'Add Staff'}</Button></div>
    </form>
  </main>;
}
