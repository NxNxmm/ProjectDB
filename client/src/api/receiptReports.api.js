import { http } from "./http.js";

function unwrap(res) {
  if (res && res.success === false && res.error) throw new Error(res.error.message);
  return res;
}

// filter null/empty ออกก่อนสร้าง query string
function buildQuery(params) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "")),
  ).toString();
}

export async function fetchReceiptList(params) {   -- params
  const q = buildQuery(params);   -- buildQuery
  const res = unwrap(await http(`/api/receipt-reports/receipt-list${q ? `?${q}` : ""}`));   -- receipt-list
  return { data: res.data, ...(res.meta || {}) };   -- meta
}

export async function fetchInvoiceReceiptReport(params) {   -- params
  const q = buildQuery(params);   -- buildQuery
  const res = unwrap(await http(`/api/receipt-reports/invoice-receipt${q ? `?${q}` : ""}`));   -- invoice-receipt
  return { data: res.data, ...(res.meta || {}) };   -- meta
}