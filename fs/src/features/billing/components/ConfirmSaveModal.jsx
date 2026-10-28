import Modal from "../../../components/common/Modal";
import { Button } from "../../../components";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

const ConfirmSaveModal = ({ open, onClose, onConfirm, loading }) => {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('invoice.confirmSaveTitle')}
      footer={
        <>
          <Button varient="secondary" size="sm" onClick={onClose} disabled={loading}>{t('common.cancel')}</Button>
          <Button varient="outline" size="sm" onClick={onClose} disabled={loading}>{t('invoice.reviewAgain')}</Button>
          <Button varient="success" size="sm" onClick={onConfirm} loading={loading}>{t('invoice.confirmSaveBtn')}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-lg border border-sky-100">
          <i className="bi bi-info-circle text-sky-500 text-xl mt-0.5" />
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {t('invoice.confirmSaveMessage')}
            </p>
            <p className="text-sm font-medium text-[#12355b] mt-2">{t('invoice.continuePrompt')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmSaveModal;
