import { normalizarApiBaseUrl } from '../utils/apiBaseUrl';
import axios from 'axios';

const api = axios.create({
  baseURL: normalizarApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    'Content-Type': 'application/json',
  }
});

// ESTA LINHA É A QUE FALTA:
export default api;