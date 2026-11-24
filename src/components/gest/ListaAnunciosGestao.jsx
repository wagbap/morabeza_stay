import { obterImagemIndisponivel, substituirImagemIndisponivel } from '../../utils/imagemIndisponivel';
import '@fontsource-variable/inter';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MapPin, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
export function IconeGestao({ icon, size = 20, className = '' }) {
  return <span className={`inline-flex shrink-0 ${className}`} aria-hidden="true">{createElement(icon, { size, strokeWidth: 1.85 })}</span>;
}

export default function ListaAnunciosGestao({ icon, titulo, descricao, subtitulo, adicionar, onAdicionar, busca, onBusca, pesquisa, filtro, onFiltro, filtros = [], children }) {
  const { t } = useTranslation();
  return <section data-gest-list className="w-full min-w-0 pb-8 text-left text-[#101127] [font-family:'Inter_Variable',Arial,sans-serif]">
    <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
      <div className="min-w-0"><div className="flex items-center gap-3.5"><IconeGestao icon={icon} size={34} className="text-blue-600" /><h1 className="text-[28px] font-bold leading-tight tracking-[-1.1px] lg:text-[34px]">{titulo}</h1></div><p className="mt-1 text-[15px] leading-relaxed lg:text-[18px]">{descricao}</p></div>
      <button type="button" onClick={onAdicionar} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-blue-700 lg:text-lg"><IconeGestao icon={Plus} size={23} />{adicionar}</button>
    </header>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h2 className="text-[22px] font-bold tracking-[-0.6px]">{subtitulo}</h2>
      <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-[560px] sm:flex-row">
        <div className="relative min-w-0 flex-1"><IconeGestao icon={Search} size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85879c]" /><input type="search" value={busca} onChange={e => onBusca(e.target.value)} aria-label={pesquisa} placeholder={pesquisa} className="h-11 w-full rounded-[14px] border border-[#d1d5e2] bg-white/50 pl-12 pr-4 text-sm placeholder:text-[#272742] focus:outline-none focus:ring-2 focus:ring-blue-600" /></div>
        {filtros.length > 0 && <select aria-label={t('gest_lista_filtrar_estado')} value={filtro} onChange={e => onFiltro(e.target.value)} className="h-11 max-w-full rounded-[14px] border border-[#d1d5e2] bg-white/50 px-3 text-sm">{filtros.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>}
      </div>
    </div>
    {children}
  </section>;
}

export function GrelhaAnunciosGestao({ children }) {
  return <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function CartaoAnuncioGestao({ icon, imagem, titulo, localizacao, preco, estado, resumo, nota, acoes = [], onVer, onEditar, onEliminar, eliminando, bloquearExclusao }) {
  const { t, i18n } = useTranslation();
  const fallback = obterImagemIndisponivel(i18n.language);
  return <article data-gest-card aria-label={titulo} className="flex min-w-0 flex-col rounded-[22px] border border-[#dfe2eb] bg-white/80 p-2.5 shadow-[0_1px_3px_#11182718]">
    <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[15px] bg-slate-100 text-slate-300">
      <IconeGestao icon={icon} size={48} /><img src={imagem || fallback} data-fallback={fallback} alt={imagem ? titulo : t('imagem_sem_foto')} className="absolute inset-0 h-full w-full object-cover" onError={substituirImagemIndisponivel} />
      {estado && <span className={`absolute right-2.5 top-2.5 inline-flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${estado.cor}`}><IconeGestao icon={estado.icon} size={17} />{estado.texto}</span>}
    </div>
    <div className="flex min-w-0 flex-1 flex-col px-1.5 pb-1 pt-2 [overflow-wrap:anywhere]">
      <h3 className="text-xl font-bold leading-tight tracking-[-0.7px]">{titulo}</h3>
      <p className="mt-1 flex items-start gap-2 text-sm leading-snug"><IconeGestao icon={MapPin} size={17} className="mt-0.5" /><span>{localizacao || '—'}</span></p>
      <p className="mt-2 text-[21px] font-bold tracking-[-0.6px] text-blue-600">{preco}</p>
      {(resumo || nota) && <div className="mb-4 mt-2.5">{resumo && <div className="text-[17px] font-bold leading-tight tracking-[-0.4px]">{resumo}</div>}{nota && <p className={`${resumo ? 'mt-1 ' : ''}text-[13px] leading-snug`}>{nota}</p>}</div>}
      <div className="mt-auto grid gap-2">{acoes.map((acao, index) => <button key={acao.label} type="button" onClick={acao.onClick} className={`flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 py-2 text-[15px] font-semibold text-white transition ${index === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#6000ed] hover:bg-violet-800'}`}><IconeGestao icon={acao.icon} size={20} />{acao.label}</button>)}</div>
      <div className="mt-2.5 grid min-h-11 grid-cols-3 overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_#1118270d]">
        <button type="button" onClick={onVer} className="my-2 flex items-center justify-center gap-2 border-r border-gray-200 text-sm font-semibold hover:text-blue-600"><IconeGestao icon={Eye} size={20} />{t('gest_frota_ver')}</button>
        <button type="button" onClick={onEditar} className="my-2 flex items-center justify-center gap-2 border-r border-gray-200 text-sm font-semibold hover:text-blue-600"><IconeGestao icon={Pencil} size={20} />{t('gest_frota_editar')}</button>
        <button type="button" disabled={bloquearExclusao} onClick={onEliminar} className="flex items-center justify-center gap-2 bg-[#fff0f2] text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"><IconeGestao icon={eliminando ? Loader2 : Trash2} size={20} className={eliminando ? 'animate-spin' : ''} />{t('gest_frota_eliminar')}</button>
      </div>
    </div>
  </article>;
}
