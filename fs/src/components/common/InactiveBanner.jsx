import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function InactiveBanner({ status, className = '' }) {
  const { t, option } = useI18n();
  if (String(status).toLowerCase() !== 'inactive') return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm ${className}`}
    >
      <i className="bi bi-exclamation-octagon-fill text-xl text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-rose-900">
          <span className="mr-2 inline-flex items-center rounded bg-rose-200/80 px-2 py-0.5 text-xs font-bold text-rose-900">
            {option('Inactive')}
          </span>
          {t('account.inactiveBanner')}
        </p>
      </div>
    </div>
  );
}
