import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buscarCarro } from '../services/carroApiService';
import { buscarExperiencia } from '../services/experienciaApiService';

export default function RedirecionarDetalhesAnuncio({ tipo }) {
  const { id } = useParams();
  const { search, hash } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    async function abrir() {
      try {
        const result = await (tipo === 'carro' ? buscarCarro(id) : buscarExperiencia(id));
        if (!ativo) return;
        const slug = result?.data?.slug;
        if (!result?.success || typeof slug !== 'string' || !slug.trim()) throw new Error('Missing public listing slug');
        navigate(`/${tipo === 'carro' ? 'carros' : 'experiencia'}/${encodeURIComponent(slug.trim())}${search}${hash}`, { replace: true });
      } catch { if (ativo) setErro(true); }
    }
    abrir();
    return () => { ativo = false; };
  }, [id, tipo, navigate, search, hash, tentativa]);
  return <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center text-sm text-slate-600">
    <p role={erro ? 'alert' : 'status'}>{t(erro ? 'anuncio_erro_detalhes' : 'anuncio_abrir_detalhes')}</p>
    {erro && <div className="flex flex-wrap justify-center gap-3">
      <button type="button" onClick={() => navigate(`/${tipo}-registo/meus`)} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2">{t('crud_voltar')}</button>
      <button type="button" onClick={() => { setErro(false); setTentativa(value => value + 1); }} className="min-h-11 rounded-xl bg-blue-600 px-4 py-2 text-white">{t('calendario_tentar_novamente')}</button>
    </div>}
  </div>;
}
