import Modal from "../../../components/common/Modal";
import { Button } from "../../../components";

const ConfirmSaveModal = ({ open, onClose, onConfirm, loading }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Confirm Invoice Save"
    footer={
      <>
        <Button varient="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button varient="outline" size="sm" onClick={onClose} disabled={loading}>Review Again</Button>
        <Button varient="success" size="sm" onClick={onConfirm} loading={loading}>Confirm & Save</Button>
      </>
    }
  >
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-lg border border-sky-100">
        <i className="bi bi-info-circle text-sky-500 text-xl mt-0.5" />
        <div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Please review the invoice carefully. Once confirmed, the invoice will be saved
            and become part of the billing history.
          </p>
          <p className="text-sm font-medium text-[#12355b] mt-2">Do you want to continue?</p>
        </div>
      </div>
    </div>
  </Modal>
);

export default ConfirmSaveModal;
