import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Search, Settings2, Shield, MapPin } from 'lucide-react';
import HeaderGestao from './HeaderGestao';
import { extrairFotosCarro } from '../../features/carros/utils/fotosCarro';

export default function ListaCarrosUnidades({ carros, onUnidades, onCondicoes }) {
  const { t } = useTranslation();
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLocaleLowerCase();
  const filtrados = carros.filter(carro => [carro.titulo, carro.marca, carro.modelo, carro.ilha, carro.localizacao]
    .some(valor => String(valor || '').toLocaleLowerCase().includes(termo)));

  return (
    <div className="w-full max-w-7xl px-4 py-6 text-left text-gray-900 md:px-0">
      <HeaderGestao secao="unidades" className="mb-6" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">{t('gest_carros_unidades_meus', 'Meus carros')}</h2>
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></span>
          <input type="search" value={busca} onChange={event => setBusca(event.target.value)}
            aria-label={t('gest_carros_unidades_buscar', 'Pesquisar os meus carros')}
            placeholder={t('gest_carros_unidades_buscar', 'Pesquisar os meus carros')}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
        </div>
      </div>
      {filtrados.length === 0 ? (
        <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">{t('gest_carros_unidades_sem_resultados', 'Nenhum carro encontrado.')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map(carro => {
            const foto = extrairFotosCarro(carro)[0];
            return (
              <article key={carro.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-300">
                  {foto ? <img src={foto} alt={carro.titulo || ''} className="h-full w-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <Car size={44} strokeWidth={1.5} />}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-2 text-sm font-bold">{carro.titulo || [carro.marca, carro.modelo].filter(Boolean).join(' ')}</h3>
                  <div className="mb-5 flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="shrink-0 text-gray-400"><MapPin size={13} /></span>
                    <span>{[carro.ilha, carro.localizacao].filter(Boolean).join(' · ') || '—'}</span>
                  </div>
                  <div className="mt-auto grid gap-2">
                    <button type="button" onClick={() => onUnidades(carro)} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                      <Settings2 size={15} />{t('gest_carros_unidades_configurar', 'Configurar unidades')}
                    </button>
                    <button type="button" onClick={() => onCondicoes(carro)} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700">
                      <Shield size={15} />{t('gest_carros_unidades_condicoes', 'Condições do veículo')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
