import { useEffect, useId, useRef, useState } from 'react';
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs';
import '@sbmdkl/nepali-datepicker-reactjs/dist/index.css';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { validateBSInput, bsToISO, formatBS, isoToBS, isISODate, parseBSInput, todayISO } from '../../utils/bsDate.js';

export default function BSDateField({
  value = '', onChange, onBlur, label, required = false, min, max,
  defaultToToday = true, disabled = false, error = '', className = 'kds-input',
  placeholder
}) {
  const { language, t } = useI18n();
  const generatedId = useId();
  const inputId = `bs-date-${generatedId.replaceAll(':', '')}`;
  const inputRef = useRef(null);
  const calendarHostRef = useRef(null);
  const changeRef = useRef(onChange);
  const defaultSetRef = useRef(false);
  const [draft, setDraft] = useState(() => isISODate(value) ? formatBS(value, 'input', language) : '');
  const [internalError, setInternalError] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => { changeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    if (value && isISODate(value)) {
      setDraft(formatBS(value, 'input', language));
      inputRef.current?.setCustomValidity('');
      if (internalError && !draft) setInternalError('');
      return;
    }
    if (!value && !internalError) setDraft('');
  }, [value, language]); // preserve an active typed draft until blur/commit

  useEffect(() => {
    if (!defaultToToday || value || defaultSetRef.current || disabled) return;
    defaultSetRef.current = true;
    const today = todayISO();
    if (today) changeRef.current?.(today);
    else setInternalError(t('date.range'));
  }, [defaultToToday, value, disabled, t]);

  const commit = () => {
    const raw = draft.trim();
    if (!raw) {
      const message = required ? t('date.required') : '';
      setInternalError(message);
      inputRef.current?.setCustomValidity(message);
      if (!required) changeRef.current?.('');
      onBlur?.();
      return false;
    }
    const reason = validateBSInput(raw, { required: true, min, max });
    const parts = parseBSInput(raw);
    const iso = parts ? bsToISO(parts) : null;
    if (reason || !iso) {
      const message = t(`date.${reason || 'invalid'}`);
      setInternalError(message);
      setDraft(isISODate(value) ? formatBS(value, 'input', language) : '');
      inputRef.current?.setCustomValidity(message);
      onBlur?.();
      return false;
    }
    setInternalError('');
    inputRef.current?.setCustomValidity('');
    setDraft(formatBS(iso, 'input', language));
    changeRef.current?.(iso);
    onBlur?.();
    return true;
  };

  const openCalendar = () => {
    if (disabled) return;
    const pickerInput = calendarHostRef.current?.querySelector('input[readonly]');
    pickerInput?.click();
    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const pickerInput = calendarHostRef.current?.querySelector('input[readonly]');
        pickerInput?.click();
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const minBS = min ? isoToBS(min) || min : undefined;
  const maxBS = max ? isoToBS(max) || max : undefined;
  const shownError = internalError || (error ? t(error) : '');

  const field = <div className="relative min-w-0">
    <input
      ref={inputRef}
      id={inputId}
      type="text"
      inputMode="text"
      autoComplete="off"
      className={`${className} w-full pr-11`}
      value={draft}
      placeholder={placeholder || t('date.placeholder')}
      aria-label={label || t('date.label')}
      aria-required={required}
      aria-invalid={Boolean(shownError)}
      aria-describedby={shownError ? `${inputId}-error` : undefined}
      disabled={disabled}
      onChange={(event) => {
        setInternalError('');
        inputRef.current?.setCustomValidity('');
        setDraft(event.target.value);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') { event.preventDefault(); commit(); }
      }}
    />
    <button
      type="button"
      className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={t('date.openPicker')}
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={disabled}
      onClick={openCalendar}
    ><i className="bi bi-calendar3" aria-hidden="true" /></button>
    <div ref={calendarHostRef} className="absolute right-1 top-0 z-30 h-10 w-9">
      <DatePicker
        key={`${value || 'bs-date-empty'}-${language}`}
        onChange={(selection) => {
          const iso = bsToISO(selection?.bsDate);
          if (!iso) {
            const message = t('date.invalid');
            setInternalError(message);
            inputRef.current?.setCustomValidity(message);
            return;
          }
          setInternalError('');
          inputRef.current?.setCustomValidity('');
          setDraft(formatBS(iso, 'input', language));
          changeRef.current?.(iso);
          setOpen(false);
          inputRef.current?.focus();
        }}
        className="!h-10 !w-9 !cursor-pointer !pointer-events-none !opacity-0"
        placeholder=""
        language={language === 'np' ? 'NE' : 'EN'}
        dateFormat="YYYY-MM-DD"
        defaultDate={isISODate(value) ? formatBS(value, 'input', 'en') : formatBS(todayISO(), 'input', 'en')}
        hideDefaultValue
        minDate={minBS}
        maxDate={maxBS}
      />
    </div>
  </div>;

  return <div className="min-w-0">
    {label ? <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}</label> : null}
    {field}
    {shownError ? <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">{shownError}</p> : null}
  </div>;
}
