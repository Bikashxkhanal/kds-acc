import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();
  const select = (value) => setLanguage(value);
  return <button
    type="button"
    role="switch"
    aria-label={t('language.switch')}
    aria-checked={language === 'np'}
    onClick={() => select(language === 'en' ? 'np' : 'en')}
    onKeyDown={(event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); select('en'); }
      if (event.key === 'ArrowRight') { event.preventDefault(); select('np'); }
    }}
    className="relative ml-auto inline-flex h-10 min-w-[126px] touch-manipulation items-center rounded-full border border-white/25 bg-slate-950/25 p-1 text-xs font-bold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12355b]"
  >
    <span aria-hidden="true" className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow transition-transform duration-200 ease-out ${language === 'np' ? 'translate-x-full' : 'translate-x-0'}`} />
    <span className={`relative z-10 flex-1 rounded-full px-3 py-1.5 text-center transition-colors ${language === 'en' ? 'text-[#12355b]' : 'text-white/80'}`}>EN</span>
    <span className={`relative z-10 flex-1 rounded-full px-3 py-1.5 text-center transition-colors ${language === 'np' ? 'text-[#12355b]' : 'text-white/80'}`}>नेपाली</span>
  </button>;
}
