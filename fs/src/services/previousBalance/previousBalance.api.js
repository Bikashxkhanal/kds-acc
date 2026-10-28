import api from '../axios.js';

export const listPreviousBalances = async (params = {}) => {
  const res = await api.get('/api/v1/previous-balances', { params });
  return res?.data;
};

export const getPreviousBalance = async (id) => {
  const res = await api.get(`/api/v1/previous-balances/${id}`);
  return res?.data;
};

export const createPreviousBalance = async (body) => {
  const res = await api.post('/api/v1/previous-balances', body);
  return res?.data;
};

export const updatePreviousBalance = async (id, body) => {
  const res = await api.put(`/api/v1/previous-balances/${id}`, body);
  return res?.data;
};

export const deletePreviousBalance = async (id) => {
  const res = await api.delete(`/api/v1/previous-balances/${id}`);
  return res?.data;
};

export const searchStaff = async ({ params, signal } = {}) => {
  const res = await api.get('/api/v1/staff', { params, signal });
  return res?.data;
};

export const searchSuppliers = async ({ params, signal } = {}) => {
  const res = await api.get('/api/v1/suppliers', { signal });
  const q = String(params?.q || '').trim().toLowerCase();
  const rows = (res?.data?.data || []).filter((s) => {
    if (!q) return true;
    return [s.name, s.phone, s.address].some((v) => String(v || '').toLowerCase().includes(q));
  }).map((s) => ({ ...s, id: s._id, name: s.name }));
  return { ...res?.data, data: rows };
};
