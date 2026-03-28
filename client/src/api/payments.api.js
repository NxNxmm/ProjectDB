import { http } from "./http";

export async function listPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    // Removed "/list" to match your backend route
    const res = await http(`/api/payments${query ? `?${query}` : ""}`);
    return res;
}