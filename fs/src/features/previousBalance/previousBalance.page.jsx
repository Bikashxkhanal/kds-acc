import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import SearchBar from '../../components/common/SearchBar.jsx';
import BSDateField from '../../components/common/BSDateField.jsx';
import { bsToday, bsToIso } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { searchCustomer } from '../../services/customer/customer.js';
import {
  createPreviousBalance,
  searchStaff,
  searchSuppliers
} from '../../services/previousBalance/previousBalance.api.js';
import GuidelinesModal from '../guidelines/GuidelinesModal.jsx';

const emptyForm = () => ({
  type: 'debit',
  amount: '',
  date: bsToday(),
  notes: ''
});

export default function PreviousBalancePage() {
  const { t } = useI18n();
  const [partyType, setPartyType] = useState('customer');
  const [party, setParty] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const searchFn = useMemo(() => {
    if (partyType === 'staff') return searchStaff;
    if (partyType === 'supplier') return searchSuppliers;
    return searchCustomer;
  }, [partyType]);

  const typeHint = t(`opening.hint.${partyType}.${form.type}`);

  const submit = async (event) => {
    event.preventDefault();
    if (!party) return toast.error(t('opening.selectParty'));
    const amount = Number(form.amount);
    const dateIso = bsToIso(form.date);
    if (!['credit', 'debit'].includes(form.type)) return toast.error(t('opening.typeRequired'));
    if (!Number.isFinite(amount) || amount <= 0) return toast.error(t('opening.amountInvalid'));
    if (!dateIso) return toast.error(t('opening.dateInvalid'));
    setLoading(true);
    try {
      const partyId = partyType === 'supplier' ? (party._id || party.id) : party.id;
      await createPreviousBalance({
        partyType,
        partyId,
        type: form.type,
        amount,
        date: dateIso,
        notes: form.notes
      });
      toast.success(t('opening.saved'));
      setForm(emptyForm());
      setParty(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || t('opening.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="kds-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">{t('opening.eyebrow')}</p>
          <h1 className="text-2xl font-bold text-[#12355b]">{t('opening.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t('opening.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setGuidelinesOpen(true)}
          className="rounded-lg border border-[#12355b]/20 bg-white px-3 py-2 text-sm font-semibold text-[#12355b] shadow-sm"
        >
          <i className="bi bi-info-circle mr-1" />
          {t('guidelines.button')}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {['customer', 'supplier', 'staff'].map((type) => (
          <button
            key={type}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${partyType === type ? 'bg-[#12355b] text-white' : 'bg-white text-slate-700'}`}
            onClick={() => { setPartyType(type); setParty(null); setForm((prev) => ({ ...prev, type: type === 'customer' ? 'debit' : 'credit' })); }}
          >
            {t(`opening.party.${type}`)}
          </button>
        ))}
      </div>

      <SearchBar
        key={partyType}
        className="kds-search"
        placeholder={t(`opening.search.${partyType}`)}
        searchQueryFn={searchFn}
        onSelect={setParty}
      />
      {party && (
        <p className="text-sm text-slate-600">
          {t('opening.selected')}: <strong>{party.name}</strong>
          {(party.phone_number || party.phone) && <> · {party.phone_number || party.phone}</>}
          <button type="button" className="ml-3 text-blue-700 underline" onClick={() => setParty(null)}>{t('common.clear')}</button>
        </p>
      )}

      <form onSubmit={submit} className="kds-card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <label className="kds-label md:col-span-2">
          {t('opening.type')}
          <select
            required
            className="kds-input mt-1"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="debit">{t('opening.debit')}</option>
            <option value="credit">{t('opening.credit')}</option>
          </select>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{typeHint}</span>
            <button type="button" className="font-semibold text-sky-700 underline" onClick={() => setGuidelinesOpen(true)}>
              {t('guidelines.button')}
            </button>
          </span>
        </label>

        <label className="kds-label">
          {t('opening.amount')}
          <input
            required
            min="0.01"
            step="any"
            type="number"
            className="kds-input mt-1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>

        <label className="kds-label">
          {t('opening.date')}
          <BSDateField
            required
            className="kds-input mt-1"
            value={form.date}
            onChange={(value) => setForm({ ...form, date: value })}
          />
        </label>

        <label className="kds-label md:col-span-2">
          {t('opening.notes')}
          <textarea
            className="kds-input mt-1"
            rows={2}
            maxLength={500}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={t('opening.notesPlaceholder')}
          />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button disabled={loading} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">
            {loading ? t('common.saving') : t('opening.save')}
          </button>
        </div>
      </form>

      <GuidelinesModal open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} />
    </main>
  );
}
