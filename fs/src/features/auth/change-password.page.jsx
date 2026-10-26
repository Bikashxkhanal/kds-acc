import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { verifyMeSuccess } from '../../store/authSlice.js';

export default function ChangePasswordPage() {
  const { t } = useI18n(); const navigate = useNavigate(); const dispatch=useDispatch(); const user=useSelector(state=>state.auth.user);
  const [currentPassword,setCurrent]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async(event)=>{event.preventDefault();if(password!==confirm){toast.error(t('admin.passwordMismatch'));return;}setBusy(true);try{await api.post('/api/v1/sysuser/change-password',{currentPassword,password});dispatch(verifyMeSuccess({...user,forcePasswordChange:false}));toast.success(t('admin.passwordChanged'));navigate('/',{replace:true});}catch(error){toast.error(error.response?.data?.message||t('admin.passwordResetError'));}finally{setBusy(false);}};
  return <main className="kds-page"><form onSubmit={submit} className="kds-card mx-auto grid max-w-lg gap-4 p-6"><h1 className="text-xl font-bold text-[#12355b]">{t('admin.changePassword')}</h1><label className="kds-label">{t('admin.currentPassword')}<input required type="password" className="kds-input mt-1" value={currentPassword} onChange={e=>setCurrent(e.target.value)}/></label><label className="kds-label">{t('admin.newPassword')}<input required minLength="12" type="password" className="kds-input mt-1" value={password} onChange={e=>setPassword(e.target.value)}/><small>{t('admin.passwordRule')}</small></label><label className="kds-label">{t('admin.confirmPassword')}<input required type="password" className="kds-input mt-1" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button disabled={busy} className="rounded-lg bg-[#12355b] px-4 py-2 text-white">{t('admin.changePassword')}</button></form></main>;
}
