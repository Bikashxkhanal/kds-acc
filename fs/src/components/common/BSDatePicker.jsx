import DatePicker from '@sbmdkl/nepali-datepicker-reactjs';
import '@sbmdkl/nepali-datepicker-reactjs/dist/index.css';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { fromBS, normalizeDigits } from '../../utils/bsDate.js';

export default function BSDatePicker({ value, onChange, className = 'kds-input', placeholder, min, max, required = false }) {
  const { language } = useI18n();
  return <DatePicker
    value={value || ''}
    onChange={(selection) => {
      const bsDate = normalizeDigits(selection?.bsDate || '');
      if (bsDate && fromBS(bsDate)) onChange?.(bsDate);
    }}
    className={className}
    placeholder={placeholder}
    language={language}
    dateFormat="YYYY-MM-DD"
    minDate={min}
    maxDate={max}
    required={required}
  />;
}
