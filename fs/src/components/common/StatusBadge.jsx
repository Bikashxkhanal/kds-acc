import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function StatusBadge({ status = 'Active', className = '' }) {
  const { option } = useI18n();
  const isInactive = String(status).toLowerCase() === 'inactive';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isInactive
          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isInactive ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />
      {option(isInactive ? 'Inactive' : 'Active')}
    </span>
  );
}
