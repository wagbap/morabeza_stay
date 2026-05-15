import axios from 'axios';

const api = axios.create({
  baseURL: 'https://welovepalop.com/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// ESTA LINHA É A QUE FALTA:
export default api;