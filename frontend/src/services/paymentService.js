import api from './api';

const getAuthConfig = () => {
  const raw    = localStorage.getItem('userInfo');
  const parsed = raw ? JSON.parse(raw) : {};
  const token  = parsed?.firstLoginToken || parsed?.token || parsed?.accessToken ||
                 parsed?.user?.token || localStorage.getItem('token') || '';
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ── Landlord ──────────────────────────────────────────────────────────────────
export const getPayments = async () => {
  const response = await api.get('/payments/landlord/all', getAuthConfig());
  return response.data;
};

export const getPaymentStats = async () => {
  const response = await api.get('/payments/landlord/stats', getAuthConfig());
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`, getAuthConfig());
  return response.data;
};

// ── Tenant ────────────────────────────────────────────────────────────────────
export const getTenantPayments = async () => {
  const response = await api.get('/payments/tenant', getAuthConfig());
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments/tenant/pay', paymentData, getAuthConfig());
  return response.data;
};

// ── Flutterwave ───────────────────────────────────────────────────────────────

/**
 * Initialise a Flutterwave inline payment.
 * Returns the config object to pass to the useFlutterwave hook.
 *
 * @param {'rent'|'deposit'|'topup'} paymentFor
 * @param {number} [amount] - required only when paymentFor === 'topup'
 */
export const initFlutterwavePayment = async (paymentFor = 'rent', amount) => {
  const body = { paymentFor };
  if (paymentFor === 'topup' && amount) body.amount = amount;
  const response = await api.post('/payments/flutterwave/init', body, getAuthConfig());
  return response.data; // { success, config }
};

/**
 * Verify a Flutterwave transaction after the inline callback.
 *
 * @param {string|number} transaction_id  - Flutterwave transaction ID
 * @param {string}        tx_ref          - your tx_ref from initFlutterwavePayment
 */
export const verifyFlutterwavePayment = async (transaction_id, tx_ref) => {
  const response = await api.post(
    '/payments/flutterwave/verify',
    { transaction_id, tx_ref },
    getAuthConfig()
  );
  return response.data; // { success, payment }
};
