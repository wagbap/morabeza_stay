import api from '../api/api';
import { criarReservadorVagas } from '../utils/retencaoExperiencia';

export const reservarVagasExperiencia = criarReservadorVagas(payload =>
  api.post('/reservar_temporariamente.php', payload, {
    timeout: 20000,
    responseType: 'text',
    transformResponse: [value => value],
  }).then(({ data }) => data)
);
