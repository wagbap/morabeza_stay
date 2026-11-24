import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api/api';
import { obterTokenValidacao } from '../../../utils/tokenValidacaoReserva';

export default function DocumentosCondutorPrivados({ reservaId, contexto = 'host' }) {
  const { t } = useTranslation();const [docs, setDocs] = useState([]);const [erro, setErro] = useState(false);const [ocupado, setOcupado] = useState(false);
  const token = obterTokenValidacao(localStorage, contexto);
  useEffect(() => {
    const c = new AbortController();setDocs([]);setErro(false);
    api.post('/documentos_condutor.php', { acao: 'listar', reserva_id: Number(reservaId), contexto }, { signal: c.signal, timeout: 15000, headers: { Authorization: `Bearer ${token || ''}` } })
      .then(({ data }) => { if (!data.success || !Array.isArray(data.documentos)) throw new Error('Invalid documents');setDocs(data.documentos); })
      .catch(() => { if (!c.signal.aborted) setErro(true); });
    return () => c.abort();
  }, [reservaId, contexto, token]);
  const descarregar = async doc => {
    setOcupado(true);setErro(false);
    try {
      const { data } = await api.post('/documentos_condutor.php', { acao: 'descarregar', reserva_id: Number(reservaId), contexto, documento_id: doc.id }, { responseType: 'blob', timeout: 60000, headers: { Authorization: `Bearer ${token || ''}` } });
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(data.type)) throw new Error('Invalid document');
      const url = URL.createObjectURL(data);const a = document.createElement('a');a.href = url;
      a.download = `${doc.tipo}.${{ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[data.type]}`;
      a.click();setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setErro(true); } finally { setOcupado(false); }
  };
  return <section className="my-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
    <h3 className="text-sm font-bold text-gray-900">{t('carro_docs_titulo')}</h3>
    <p className="text-xs text-gray-600">{t('carro_docs_acesso_nota')}</p>
    {erro ? <p role="alert" className="text-xs text-red-700">{t('carro_docs_acesso_erro')}</p> : !docs.length ? <p className="text-xs text-gray-500">{t('carro_docs_sem_documentos')}</p> : docs.map(doc =>
      <button type="button" key={doc.id} disabled={ocupado} onClick={() => descarregar(doc)} className="block rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 disabled:opacity-50">{t('carro_docs_descarregar', { tipo: t(`carro_docs_${doc.tipo}`) })}</button>)}
  </section>;
}
