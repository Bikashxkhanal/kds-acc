import api from '../../services/axios.js';
import { toast } from 'react-toastify';
import { useI18n } from '../../i18n/I18nProvider.jsx';

export default function ReceiptButtons({ type, id }) {
  const { language, t } = useI18n();

  const getPdf = async () => {
    const response = await api.get(`/api/v1/receipts/${type}/${id}/download?lang=${language}`, { responseType: 'blob' });
    return URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  };
  const reportPdfError = async (action, error) => {
    const response = error?.response;
    let body = response?.data;
    if (body instanceof Blob) {
      try { body = await body.text(); } catch { body = '[unable to read error response body]'; }
    }
    console.error(`[receipt-pdf] ${action} failed`, {
      type, id,
      message: error?.message || String(error),
      stack: error?.stack,
      status: response?.status,
      responseBody: body,
      code: error?.code
    });
    return body?.message || (typeof body === 'string' ? body : null) || error?.message || t('receipt.error');
  };
  const download = async () => {
    try { const url = await getPdf(); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `receipt-${id}.pdf`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (error) { toast.error(await reportPdfError('download', error)); }
  };
  const print = async () => {
    const popup = window.open('', '_blank');
    if (!popup) { toast.error(t('receipt.allowPopups')); return; }
    try { const url = await getPdf(); popup.addEventListener('load', () => popup.print(), { once: true }); popup.location.href = url; setTimeout(() => URL.revokeObjectURL(url), 60000); }
    catch (error) { popup.close(); toast.error(await reportPdfError('print', error)); }
  };
  return <span className="inline-flex gap-2 whitespace-nowrap"><button type="button" className="text-blue-700 underline" onClick={download}>{t('receipt.downloadPdf')}</button><button type="button" className="text-blue-700 underline" onClick={print}>{t('receipt.print')}</button></span>;
}
