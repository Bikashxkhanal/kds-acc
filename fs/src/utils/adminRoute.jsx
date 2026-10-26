import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider.jsx';

export default function AdminRoute({ children }) {
  const role = useSelector((state) => state.auth.user?.role);
  const { t } = useI18n();
  return role === 'admin' ? children : <main className="kds-page"><section className="kds-card mx-auto max-w-xl p-8 text-center"><h1 className="text-xl font-bold">{t('auth.notAuthorized')}</h1><p className="mt-2 text-slate-500">{t('auth.adminOnly')}</p><Link className="mt-4 inline-block text-blue-700 underline" to="/">{t('common.backHome')}</Link></section></main>;
}
