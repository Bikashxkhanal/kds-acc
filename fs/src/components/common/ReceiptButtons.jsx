import api from '../../services/axios.js';

export default function ReceiptButtons({ type, id }) {
  const getPdf = async () => {
    const response = await api.get(`/api/v1/receipts/${type}/${id}/download`, { responseType: 'blob' });
    return URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  };
  const download = async () => {
    try { const url = await getPdf(); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `receipt-${id}.pdf`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { /* Legacy payment may not yet have a generated receipt record. */ }
  };
  const print = async () => {
    try { const url = await getPdf(); const popup = window.open(url, '_blank'); popup?.addEventListener('load', () => popup.print(), { once: true }); setTimeout(() => URL.revokeObjectURL(url), 60000); }
    catch { /* The account view remains usable if receipt printing fails. */ }
  };
  return <span className="inline-flex gap-2 whitespace-nowrap"><button type="button" className="text-blue-700 underline" onClick={download}>Download PDF</button><button type="button" className="text-blue-700 underline" onClick={print}>Print</button></span>;
}
