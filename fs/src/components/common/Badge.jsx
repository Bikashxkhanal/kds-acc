const variants = {
  paid: "kds-badge kds-badge-paid",
  partial: "kds-badge kds-badge-partial",
  unpaid: "kds-badge kds-badge-unpaid",
  default: "kds-badge bg-slate-100 text-slate-700"
};

const Badge = ({ status, children, className = "" }) => {
  const { option } = useI18n();
  const variant = variants[status] || variants.default;
  return <span className={`${variant} ${className}`}>{option(children ?? status)}</span>;
};

export default Badge;
import { useI18n } from '../../i18n/I18nProvider.jsx';
