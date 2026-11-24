import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, ChevronDown, MapPin, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icone from '../../../components/IconePesquisa';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';
const SUGESTOES = [
  { texto: 'Toyota', campo: 'marca', key: 'carro_pesquisa_marca' },
  { texto: 'Renault Clio', campo: 'modelo', key: 'carro_pesquisa_modelo' },
  { texto: 'SUV', campo: 'categoria', key: 'carro_pesquisa_categoria' },
  { texto: '7 lugares', campo: 'lugares', key: 'carro_pesquisa_categoria', label: 'carro_pesquisa_sete_lugares' },
];
const LOCAIS = ['', 'Praia', 'Aeroporto', 'Tarrafal', 'Assomada', 'Cidade Velha'];
const iso = d => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
const date = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? new Date(`${s}T00:00:00`) : null;
const Label = ({ children }) => <span className="block text-[10px] font-bold uppercase leading-5 tracking-[0.16em] text-slate-500">{children}</span>;

function FormularioPesquisaCarros({ onBuscar, className = '' }) {
  const { t, i18n } = useTranslation();
  const location = useLocation(), navigate = useNavigate();
  const p = new URLSearchParams(location.search);
  const [pesquisa, setPesquisa] = useState(p.get('search') || '');
  const [campo, setCampo] = useState(p.get('campo') || 'marca_modelo');
  const [ativo, setAtivo] = useState(-1);
  const sugestoesId = useId();
  const sugestoes = SUGESTOES.filter(s => !pesquisa.trim() || s.texto.toLowerCase().includes(pesquisa.toLowerCase().trim()));
  const escolher = s => { setPesquisa(s.texto); setCampo(s.campo); setAberto(null); setAtivo(-1); };
  const [local, setLocal] = useState(p.get('localizacao') || '');
  const [inicio, setInicio] = useState(date(p.get('data_levantamento')));
  const [fim, setFim] = useState(date(p.get('data_devolucao')));
  const [aberto, setAberto] = useState(null), [erro, setErro] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fechar = e => { if (!ref.current?.contains(e.target)) setAberto(null); };
    document.addEventListener('pointerdown', fechar);
    return () => document.removeEventListener('pointerdown', fechar);
  }, []);
  const buscar = e => {
    e.preventDefault();
    if (!!inicio !== !!fim) { setErro(true); setAberto('datas'); return; }
    const query = new URLSearchParams({ destino: 'Santiago' });
    if (pesquisa.trim()) { query.set('search', pesquisa.trim()); query.set('campo', campo); }
    if (local) query.set('localizacao', local);
    if (inicio && fim) { query.set('data_levantamento', iso(inicio)); query.set('data_devolucao', iso(fim)); }
    if (onBuscar) onBuscar(query.toString()); else navigate(`/carros?${query}`);
    setAberto(null); setErro(false);
  };
  const dataLabel = inicio ? `${inicio.toLocaleDateString(i18n.language, {day:'2-digit',month:'short'})}${fim ? ` – ${fim.toLocaleDateString(i18n.language, {day:'2-digit',month:'short'})}` : ' – …'}` : t('carro_pesquisa_datas');
  return <div ref={ref} data-car-search className={`relative z-50 mx-auto w-full max-w-7xl ${className}`} onKeyDown={e => { if (e.key === 'Escape') { setAberto(null); } }}>
    <form onSubmit={buscar} className="grid min-h-[80px] rounded-[22px] border border-slate-100 bg-white p-2.5 text-slate-900 shadow-xl md:grid-cols-2 lg:grid-cols-[1.1fr_.7fr_1.1fr_1.15fr_128px]">
      <div className="relative min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
        <div className={`flex min-h-14 items-center gap-2 rounded-2xl px-3 ${aberto === 'sugestoes' ? 'ring-2 ring-blue-600' : ''}`}>
          <Icone icon={Search} />
          <label className="min-w-0 flex-1"><Label>{t('home_pesquisa_servico')}</Label><input role="combobox" aria-label={t('carro_pesquisa_termo')} aria-expanded={aberto === 'sugestoes'} aria-controls={sugestoesId} aria-autocomplete="list" aria-activedescendant={aberto === 'sugestoes' && ativo >= 0 && sugestoes[ativo] ? `${sugestoesId}-${ativo}` : undefined} value={pesquisa} onFocus={() => setAberto('sugestoes')} onChange={e => { setPesquisa(e.target.value); setCampo('marca_modelo'); setAtivo(-1); setAberto('sugestoes'); }} onKeyDown={e => {
            if(e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setAberto('sugestoes'); if(sugestoes.length) setAtivo(v => e.key === 'ArrowDown' ? (v+1)%sugestoes.length : (v<=0?sugestoes.length-1:v-1)); }
            if(e.key === 'Enter' && aberto === 'sugestoes' && sugestoes[ativo]) { e.preventDefault(); escolher(sugestoes[ativo]); }
          }} placeholder={t('carro_pesquisa_placeholder')} className="w-full bg-transparent text-sm font-bold leading-7 outline-none placeholder:text-slate-500" /></label>
          <button type="button" aria-label={t('carro_pesquisa_sugestoes')} aria-expanded={aberto === 'sugestoes'} onClick={() => setAberto(aberto === 'sugestoes' ? null : 'sugestoes')} className="p-1"><ChevronDown size={20}/></button>
        </div>
        {aberto === 'sugestoes' && sugestoes.length > 0 && <div id={sugestoesId} role="listbox" aria-label={t('carro_pesquisa_sugestoes')} className="absolute right-0 top-full z-50 mt-2 w-full rounded-[15px] border border-[#dedee7] bg-white px-4 pb-2 pt-3 shadow-xl lg:w-[260px]">
          <p className="mb-1 text-sm font-bold uppercase text-slate-600">{t('carro_pesquisa_sugestoes')}</p>
          {sugestoes.map((s,i) => <button id={`${sugestoesId}-${i}`} type="button" role="option" aria-selected={ativo === i} key={s.texto} onPointerDown={e => e.preventDefault()} onClick={() => escolher(s)} className={`flex min-h-[43px] w-full items-center justify-between gap-2 border-b border-slate-100 text-left text-sm font-bold last:border-0 hover:bg-blue-50 ${ativo === i ? 'bg-blue-50' : ''}`}><span>{s.label ? t(s.label) : s.texto}</span><span className="rounded-lg bg-slate-100 px-2 py-1 text-[13px] font-medium">{t(s.key)}</span></button>)}
        </div>}
      </div>
      <label className="flex min-h-14 min-w-0 items-center gap-2 border-b border-slate-200 px-4 lg:border-b-0 lg:border-r"><Icone icon={MapPin} /><span className="min-w-0 flex-1"><Label>{t('exp_busca_ilha')}</Label><select aria-label={t('exp_busca_ilha')} defaultValue="Santiago" className="w-full bg-transparent py-0.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><option value="Santiago">Santiago</option></select></span></label>
      <label className="flex min-h-14 min-w-0 items-center gap-2 border-b border-slate-200 px-4 lg:border-b-0 lg:border-r"><Icone icon={MapPin} /><span className="min-w-0 flex-1"><Label>{t('carro_pesquisa_local')}</Label><select aria-label={t('carro_pesquisa_local')} value={local} onChange={e => setLocal(e.target.value)} className="w-full bg-transparent py-0.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{[...new Set([...LOCAIS,...(local ? [local] : [])])].map(v => <option key={v || 'todos'} value={v}>{v || t('todas_localizacoes')}</option>)}</select></span></label>
      <div className="relative min-w-0 border-b border-slate-200 md:border-r lg:border-b-0">
        <button type="button" aria-label={t('carro_pesquisa_periodo')} aria-expanded={aberto === 'datas'} aria-haspopup="dialog" onClick={() => setAberto(aberto === 'datas' ? null : 'datas')} className="flex min-h-14 w-full items-center gap-2 px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Icone icon={Calendar} /><span className="min-w-0"><Label>{t('carro_pesquisa_periodo')}</Label><span className="block truncate text-sm font-bold">{dataLabel}</span></span></button>
        {aberto === 'datas' && <div role="dialog" aria-label={t('carro_pesquisa_datas')} data-exp-calendar className="relative z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl lg:absolute lg:right-0 lg:top-full lg:w-[360px]"><CalendarioMorabeza onFechar={() => setAberto(null)} onLimpar={() => { setInicio(null); setFim(null); setErro(false); }} selectsRange startDate={inicio} endDate={fim} minDate={new Date()} locale={i18n.language} onChange={([a,b]) => {setInicio(a);setFim(b);setErro(false);if(a&&b)setAberto(null);}} /></div>}
      </div>
      <button type="submit" className="mt-3 flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 text-sm font-bold uppercase text-white transition hover:bg-blue-700 md:mt-0 lg:ml-2"><Search size={18} />{t('carro_pesquisa_buscar')}</button>
    </form>
    {erro && <p role="alert" className="mt-2 rounded-lg bg-white p-3 text-sm text-red-600">{t('aviso_datas_incompletas')}</p>}
  </div>;
}

export default function PesquisaCarros(props) {
  const location = useLocation();
  return <FormularioPesquisaCarros key={location.search} {...props} />;
}
