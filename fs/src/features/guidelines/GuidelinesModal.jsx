import Modal from '../../components/common/Modal.jsx';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function GuidelinesModal({ open, onClose }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t('guidelines.title')} size="xl" footer={
      <button type="button" className="rounded-lg bg-[#12355b] px-4 py-2 text-sm font-semibold text-white" onClick={onClose}>{t('common.close')}</button>
    }>
      <div className="max-h-[70vh] space-y-5 overflow-y-auto text-sm text-slate-700">
        <section>
          <h3 className="mb-1 font-semibold text-[#12355b]">{t('guidelines.perspectiveTitle')}</h3>
          <p>{t('guidelines.perspectiveBody')}</p>
          <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sky-900">{t('guidelines.quickRule')}</p>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-[#12355b]">{t('guidelines.tableTitle')}</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2">{t('guidelines.party')}</th>
                  <th className="p-2">{t('guidelines.debit')}</th>
                  <th className="p-2">{t('guidelines.credit')}</th>
                </tr>
              </thead>
              <tbody>
                {['customer', 'supplier', 'staff'].map((party) => (
                  <tr key={party} className="border-t border-slate-100 align-top">
                    <td className="p-2 font-medium">{t(`guidelines.${party}`)}</td>
                    <td className="p-2">{t(`guidelines.${party}Debit`)}</td>
                    <td className="p-2">{t(`guidelines.${party}Credit`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-[#12355b]">{t('guidelines.examplesTitle')}</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t('guidelines.exampleCustomer')}</li>
            <li>{t('guidelines.exampleSupplier')}</li>
            <li>{t('guidelines.exampleStaffCredit')}</li>
            <li>{t('guidelines.exampleStaffDebit')}</li>
          </ul>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-[#12355b]">{t('guidelines.previousTitle')}</h3>
          <p>{t('guidelines.previousBody')}</p>
          <p className="mt-2">{t('guidelines.previousEffect')}</p>
        </section>
      </div>
    </Modal>
  );
}
