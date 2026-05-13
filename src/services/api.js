import axios from 'axios';

const BASE_URL = 'https://neonatal-sepsis-api-3.onrender.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // ms

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — Render cold starts can take ~30s
  headers: { 'Content-Type': 'application/json' }
});

// ── Retry interceptor ────────────────────────────────────────────────────────
client.interceptors.response.use(
  res => res,
  async err => {
    const cfg = err.config;
    cfg._retryCount = cfg._retryCount || 0;

    const isNetworkErr = !err.response;
    const isServerErr  = err.response?.status >= 500;
    const isTimeout    = err.code === 'ECONNABORTED';

    if ((isNetworkErr || isServerErr || isTimeout) && cfg._retryCount < MAX_RETRIES) {
      cfg._retryCount++;
      const delay = RETRY_DELAY * cfg._retryCount;
      await new Promise(r => setTimeout(r, delay));
      return client(cfg);
    }
    return Promise.reject(err);
  }
);

// ── Health check ─────────────────────────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await client.get('/');
    return { online: true, data: res.data };
  } catch (e) {
    if (e.code === 'ECONNABORTED') return { online: false, reason: 'timeout' };
    if (!e.response)               return { online: false, reason: 'network' };
    return { online: false, reason: `HTTP ${e.response.status}` };
  }
}

// ── Predict ──────────────────────────────────────────────────────────────────
/**
 * @param {Object} payload - clinical fields
 * @param {Function} onColdStart - called if request takes > 5s (Render wake-up)
 * @returns {{ probability: number, risk_category: string, ...rest }}
 */
export async function predict(payload, onColdStart) {
  let coldStartTimer = null;
  if (onColdStart) {
    coldStartTimer = setTimeout(onColdStart, 5000);
  }

  try {
    const res = await client.post('/predict', payload);
    clearTimeout(coldStartTimer);
    return { ok: true, data: res.data };
  } catch (e) {
    clearTimeout(coldStartTimer);
    if (e.code === 'ECONNABORTED') {
      return { ok: false, error: 'Request timed out. The server may be waking up — please retry.' };
    }
    if (!e.response) {
      return { ok: false, error: 'Network error. Check your connection or try again.' };
    }
    const msg = e.response.data?.detail || e.response.data?.message || `Server error (${e.response.status})`;
    return { ok: false, error: msg };
  }
}

// ── Model metadata ───────────────────────────────────────────────────────────
export async function getModelInfo() {
  try {
    const res = await client.get('/model-info');
    return { ok: true, data: res.data };
  } catch {
    return { ok: false, data: null };
  }
}

// ── Risk classification (mirrors backend) ────────────────────────────────────
export function classifyRisk(prob) {
  if (prob < 0.20) return { label: 'Low',       color: 'green',  tier: 0 };
  if (prob < 0.50) return { label: 'Moderate',  color: 'yellow', tier: 1 };
  if (prob < 0.75) return { label: 'High',      color: 'orange', tier: 2 };
  return             { label: 'Very High',  color: 'red',    tier: 3 };
}

export const API_BASE = BASE_URL;
