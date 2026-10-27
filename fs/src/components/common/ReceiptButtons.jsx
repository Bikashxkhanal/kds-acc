import api from '../../services/axios.js';
import { toast } from 'react-toastify';

export default function ReceiptButtons({ type, id }) {
  const getPdf = async () => {
    const response = await api.get(`/api/v1/receipts/${type}/${id}/download`, { responseType: 'blob' });
    return URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  };
  const download = async () => {
    try { const url = await getPdf(); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `receipt-${id}.pdf`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { toast.error('Unable to generate payment receipt PDF. Please try again.'); }
  };
  const print = async () => {
    const popup = window.open('', '_blank');
    if (!popup) { toast.error('Allow pop-ups to print this receipt.'); return; }
    try { const url = await getPdf(); popup.addEventListener('load', () => popup.print(), { once: true }); popup.location.href = url; setTimeout(() => URL.revokeObjectURL(url), 60000); }
    catch { popup.close(); toast.error('Unable to prepare payment receipt for printing. Please try again.'); }
  };
  return <span className="inline-flex gap-2 whitespace-nowrap"><button type="button" className="text-blue-700 underline" onClick={download}>Download PDF</button><button type="button" className="text-blue-700 underline" onClick={print}>Print</button></span>;
}
