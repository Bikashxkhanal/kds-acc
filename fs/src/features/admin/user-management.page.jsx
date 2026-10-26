import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/axios.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function UserManagementPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '', email: '', address: '', password: '', role: 'operator' });
  const load = useCallback(async () => { setLoading(true); try { const res = await api.get('/api/v1/sysuser/users'); setUsers(res.data?.data || []); } catch (error) { toast.error(error.response?.data?.message || t('common.loadError')); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const create = async (event) => { event.preventDefault(); setBusy(true); try { await api.post('/api/v1/sysuser/users', form); toast.success(t('admin.userCreated')); setForm({ name: '', phone_number: '', email: '', address: '', password: '', role: 'operator' }); await load(); } catch (error) { toast.error(error.response?.data?.message || t('admin.userCreateError')); } finally { setBusy(false); } };
  const update = async (user, patch) => { setBusy(true); try { await api.patch(`/api/v1/sysuser/users/${user.id}`, patch); toast.success(t('admin.userUpdated')); await load(); } catch (error) { toast.error(error.response?.data?.message || t('admin.userUpdateError')); } finally { setBusy(false); } };
  const resetPassword = async (user) => { const password = window.prompt(t('admin.newStrongPassword')); if (!password) return; setBusy(true); try { await api.post(`/api/v1/sysuser/users/${user.id}/reset-password`, { password, forcePasswordChange: true }); toast.success(t('admin.passwordReset')); } catch (error) { toast.error(error.response?.data?.message || t('admin.passwordResetError')); } finally { setBusy(false); } };
  return <main className="kds-page space-y-5"><header><h1 className="text-2xl font-bold text-[#12355b]">{t('nav.users')}</h1></header>
    <form onSubmit={create} className="kds-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="kds-label">{t('admin.name')}<input required minLength="2" className="kds-input mt-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label className="kds-label">{t('admin.phone')}<input required pattern="[0-9]{10}" className="kds-input mt-1" value={form.phone_number} onChange={e=>setForm({...form,phone_number:e.target.value})}/></label>
      <label className="kds-label">{t('admin.email')}<input required type="email" className="kds-input mt-1" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="kds-label">{t('admin.address')}<input className="kds-input mt-1" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <label className="kds-label">{t('admin.password')}<input required type="password" minLength="12" className="kds-input mt-1" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><small>{t('admin.passwordRule')}</small></label>
      <label className="kds-label">{t('admin.role')}<select className="kds-input mt-1" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="operator">{t('admin.operator')}</option><option value="admin">{t('admin.admin')}</option></select></label>
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end"><button disabled={busy} className="rounded-lg bg-[#12355b] px-4 py-2 text-white disabled:opacity-50">{t('admin.createUser')}</button></div>
    </form>
    {loading ? <p className="kds-card p-6 text-center">{t('common.loading')}</p> : <div className="kds-card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="kds-table-header"><tr>{['admin.name','admin.phone','admin.email','admin.role','admin.status','admin.actions'].map(k=><th className="p-3" key={k}>{t(k)}</th>)}</tr></thead><tbody>{users.map(user=><tr className="border-t" key={user.id}><td className="p-3">{user.name}</td><td>{user.phone_number}</td><td>{user.email}</td><td><select disabled={busy} className="kds-input" value={user.role} onChange={e=>update(user,{role:e.target.value})}><option value="admin">{t('admin.admin')}</option><option value="operator">{t('admin.operator')}</option></select></td><td>{user.isActive === false ? t('admin.inactive') : t('admin.active')}</td><td className="space-x-2 whitespace-nowrap"><button disabled={busy} className="text-blue-700 underline" onClick={()=>update(user,{isActive:user.isActive === false})}>{user.isActive === false ? t('admin.activate') : t('admin.deactivate')}</button><button disabled={busy} className="text-blue-700 underline" onClick={()=>resetPassword(user)}>{t('admin.resetPassword')}</button></td></tr>)}</tbody></table>{users.length===0&&<p className="p-6 text-center">{t('admin.noUsers')}</p>}</div>}
  </main>;
}
