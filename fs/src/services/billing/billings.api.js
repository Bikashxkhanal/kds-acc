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
    const res = await api.get(`/api/v1/billings/${billingId}/download`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${billingId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    throw new Error("Failed to download PDF");
  }
};
