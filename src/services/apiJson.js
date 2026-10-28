import api from '../api/api.js';

// Never extract a fragment from a malformed response: it may be an error
// document followed by another JSON document, rather than valid API data.
export function parseApiJson(text) {
  return JSON.parse(String(text).replace(/^\uFEFF/, '').trim());
}

export async function requestApiJson(url, options = {}) {
  const { retries = options.method && options.method.toUpperCase() !== 'GET' ? 0 : 2, signal, ...config } = options;
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await api.request({
        timeout: 10000,
        ...config,
        url,
        signal,
        responseType: 'text',
        transformResponse: [(text) => text],
      });
      return parseApiJson(response.data);
    } catch (error) {
      const status = error.response?.status;
      const temporary = !status || status === 408 || status === 429 || status >= 500;
      if (signal?.aborted || error.code === 'ERR_CANCELED' || !temporary || attempt >= retries) {
        throw error;
      }
      await new Promise((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        }, 400 * (attempt + 1));
        signal?.addEventListener('abort', onAbort, { once: true });
        if (signal?.aborted) onAbort();
      });
    }
  }
}
