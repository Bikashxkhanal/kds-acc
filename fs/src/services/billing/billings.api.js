import api from "../axios";

const unwrap = (error) => {
  throw error?.response?.data || { message: error?.message || "Request failed" };
};

export const getBillings = async ({ page = 1, limit = 10, search, paymentStatus, companyName, from, to } = {}) => {
  try {
    const res = await api.get("/api/v1/billings", {
      params: { page, limit, search, paymentStatus, companyName, from, to }
    });
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const getBillDetails = async (billingId) => {
  try {
    const res = await api.get(`/api/v1/billings/${billingId}`);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const createBill = async (payload) => {
  try {
    const res = await api.post("/api/v1/billings", payload);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const updateBill = async (billingId, payload) => {
  try {
    const res = await api.put(`/api/v1/billings/${billingId}`, payload);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const deleteBill = async (billingId) => {
  try {
    const res = await api.delete(`/api/v1/billings/${billingId}`);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const duplicateBill = async (billingId) => {
  try {
    const res = await api.post(`/api/v1/billings/${billingId}/duplicate`);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const getCompanies = async () => {
  try {
    const res = await api.get("/api/v1/billings/companies");
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const createCompany = async (payload) => {
  try {
    const res = await api.post("/api/v1/billings/companies", payload);
    return res?.data;
  } catch (error) {
    unwrap(error);
  }
};

export const downloadBillPDF = async (billingId) => {
  try {
    const language = localStorage.getItem('kds-language') === 'np' ? 'np' : 'en';
    const res = await api.get(`/api/v1/billings/${billingId}/download?lang=${language}`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${billingId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    throw new Error("Failed to download PDF");
  }
};

export const printBillPDF = async (billingId) => {
  const popup = window.open('', '_blank');
  if (!popup) throw new Error('Allow pop-ups to print this invoice');
  try {
    const language = localStorage.getItem('kds-language') === 'np' ? 'np' : 'en';
    const res = await api.get(`/api/v1/billings/${billingId}/download?lang=${language}`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    popup.addEventListener('load', () => popup.print(), { once: true });
    popup.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    popup.close();
    throw error;
  }
};
