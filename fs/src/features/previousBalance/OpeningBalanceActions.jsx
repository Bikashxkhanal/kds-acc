import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/common/Modal.jsx';
import BSDateField from '../../components/common/BSDateField.jsx';
import { bsToIso, isoToBS } from '../../utils/bsDate.js';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { deletePreviousBalance, updatePreviousBalance, getPreviousBalance } from '../../services/previousBalance/previousBalance.api.js';
import GuidelinesModal from '../guidelines/GuidelinesModal.jsx';

export default function OpeningBalanceActions({ openingBalanceId, partyType, onChanged }) {
  const { t } = useI18n();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  if (!openingBalanceId) return null;

  const openEdit = async () => {
    try {
      setLoading(true);
      const res = await getPreviousBalance(openingBalanceId);
      const row = res?.data;
      if (!row) throw new Error('missing');
      setForm({
        type: row.type,
        amount: String(row.amount),
        date: isoToBS(row.date),
        notes: row.notes || '',
        partyId: row.partyId,
        partyType: row.partyType || partyType
      });
      setEditOpen(true);
    } catch {
      toast.error(t('opening.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    const dateIso = bsToIso(form.date);
    if (!Number.isFinite(amount) || amount <= 0 || !dateIso) return toast.error(t('opening.amountInvalid'));
    setLoading(true);
    try {
      await updatePreviousBalance(openingBalanceId, {
        partyType: form.partyType,
        partyId: form.partyId,
        type: form.type,
        amount,
        date: dateIso,
        notes: form.notes
      });
      toast.success(t('opening.updated'));
      setEditOpen(false);
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('opening.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await deletePreviousBalance(openingBalanceId);
      toast.success(t('opening.deleted'));
      setConfirmOpen(false);
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || t('opening.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span className="inline-flex gap-2 whitespace-nowrap">
        <button type="button" className="text-blue-700 underline" onClick={openEdit} disabled={loading}>{t('common.edit')}</button>
        <button type="button" className="text-red-700 underline" onClick={() => setConfirmOpen(true)} disabled={loading}>{t('common.delete')}</button>
      </span>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('opening.editTitle')} size="md" footer={
        <>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setEditOpen(false)}>{t('common.cancel')}</button>
          <button type="submit" form="opening-edit-form" disabled={loading} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">{loading ? t('common.saving') : t('common.save')}</button>
        </>
      }>
        {form && (
          <form id="opening-edit-form" onSubmit={save} className="grid gap-3">
            <label className="kds-label">
              {t('opening.type')}
              <select className="kds-input mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="debit">{t('opening.debit')}</option>
                <option value="credit">{t('opening.credit')}</option>
              </select>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{t(`opening.hint.${form.partyType}.${form.type}`)}</span>
                <button type="button" className="font-semibold text-sky-700 underline" onClick={() => setGuidelinesOpen(true)}>{t('guidelines.button')}</button>
              </span>
            </label>
            <label className="kds-label">{t('opening.amount')}<input required type="number" min="0.01" step="any" className="kds-input mt-1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
            <label className="kds-label">{t('opening.date')}<BSDateField required className="kds-input mt-1" value={form.date} onChange={(value) => setForm({ ...form, date: value })} /></label>
            <label className="kds-label">{t('opening.notes')}<textarea className="kds-input mt-1" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </form>
        )}
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('opening.confirmDeleteTitle')} size="sm" footer={
        <>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setConfirmOpen(false)}>{t('common.cancel')}</button>
          <button type="button" disabled={loading} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white" onClick={remove}>{loading ? t('common.saving') : t('common.delete')}</button>
        </>
      }>
        <p className="text-sm text-slate-600">{t('opening.confirmDeleteBody')}</p>
      </Modal>

      <GuidelinesModal open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} />
    </>
  );
}
