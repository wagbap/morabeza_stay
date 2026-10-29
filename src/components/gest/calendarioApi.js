import api from '../../api/api.js';

// Reject malformed payloads; concatenated PHP error objects are never valid data.
export async function fetchJsonBlindado(url, options = {}) {
  const response = await api.request({
    url, method: options.method || 'GET', data: options.body,
    headers: options.headers, signal: options.signal, timeout: 20000,
    responseType: 'text', transformResponse: [(value) => value],
    validateStatus: () => true,
  });
  let data = null;
  try { data = JSON.parse(response.data.replace(/^\uFEFF/, '').trim()); }
  catch { /* A malformed response remains a failure, including HTTP 200. */ }
  return {
    ok: response.status >= 200 && response.status < 300 && data !== null && !data.error && data.success !== false,
    status: response.status, data,
  };
}
