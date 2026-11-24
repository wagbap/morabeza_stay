import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, CarFront, ChevronDown, Compass, MapPin, Search, Ship, Waves } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icone from '../../../components/IconePesquisa';
import { dataLocalDeISO } from '../../../components/Calendario/dataLocal';
import CalendarioMorabeza from '../../../components/Calendario/CalendarioMorabeza';

const TIPOS = [
  { value: 'jet-ski', icon: Waves, key: 'exp_busca_jet_ski' },
  { value: 'quad', icon: CarFront, key: 'exp_busca_quad' },
  { value: 'barco', icon: Ship, key: 'exp_busca_barco' },
  { value: 'visita-guiada', icon: Compass, key: 'exp_busca_guiadas' },
];
const ILHAS = ['Santiago'];
const iso = d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
const date = dataLocalDeISO;
const IconeCampo = ({ icon }) => <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200"><Icone icon={icon} size={18} /></span>;
const Label = ({ children }) => <span className="block text-[10px] font-black uppercase leading-normal tracking-wider text-gray-400">{children}</span>;

function FormularioPesquisa({ onBuscar, zonas = [] }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [tipo, setTipo] = useState(params.get('tipo_experiencia') || '');
  const [ilha, setIlha] = useState('Santiago');
  const [zona, setZona] = useState(params.get('localizacao') || '');
  const [inicio, setInicio] = useState(date(params.get('data') || params.get('data_inicio')));
  const [aberto, setAberto] = useState(null);
  const ref = useRef(null), tipoRef = useRef(null), optionsRef = useRef([]);
  const id = useId();
  useEffect(() => {
    const fechar = e => { if (!ref.current?.contains(e.target)) setAberto(null); };
    document.addEventListener('pointerdown', fechar);
    return () => document.removeEventListener('pointerdown', fechar);
  }, []);
  const buscar = e => {
    e.preventDefault();
    const p = new URLSearchParams({ destino: ilha });
    if (params.get('nome')) p.set('nome',params.get('nome'));
    if (zona) p.set('localizacao', zona);
    if (tipo) p.set('tipo_experiencia', tipo);
    if (inicio) p.set('data', iso(inicio));
    if (onBuscar) onBuscar(p.toString()); else navigate(`/experiencias?${p}`);
    setAberto(null);
  };
  const abrirTipos = () => {
    setAberto('tipo');
    requestAnimationFrame(() => optionsRef.current[Math.max(0, TIPOS.findIndex(s => s.value === tipo))]?.focus());
  };
  const dataLabel = inicio ? inicio.toLocaleDateString(i18n.language === 'cv' ? 'pt' : i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }) : t('exp_busca_data');
  const opcoesZona = [...new Set(zonas.filter(z => !z.ilha || z.ilha === ilha).map(z => z.localizacao).filter(Boolean))];
  const campo = 'flex min-h-[60px] min-w-0 items-center gap-3 rounded-xl border-b border-gray-100 px-3 lg:border-b-0 lg:border-r lg:px-3';
  const select = 'w-full appearance-none truncate bg-transparent py-0.5 pr-5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
  return <div ref={ref} data-exp-search className="relative z-50 mx-auto w-full max-w-7xl" onKeyDown={e => { if (e.key === 'Escape') { setAberto(null); tipoRef.current?.focus(); } }}>
    <form onSubmit={buscar} className="grid min-h-[76px] rounded-2xl border border-slate-100 bg-white p-2 text-gray-900 shadow-xl md:grid-cols-2 lg:grid-cols-[1.25fr_.85fr_1fr_1.1fr_128px]">
      <div className="relative min-w-0 border-b border-gray-100 md:border-r lg:border-b-0" onBlur={e => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget) && aberto === 'tipo') setAberto(null); }}>
        <button ref={tipoRef} type="button" aria-label={t('home_pesquisa_servico')} aria-haspopup="listbox" aria-expanded={aberto === 'tipo'} aria-controls={id} onClick={() => aberto === 'tipo' ? setAberto(null) : abrirTipos()} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); abrirTipos(); } }} className="flex min-h-[60px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          <IconeCampo icon={Compass} /><span className="min-w-0 flex-1"><Label>{t('home_pesquisa_servico')}</Label><span className="block truncate text-sm font-bold leading-5">{tipo ? t(TIPOS.find(s => s.value === tipo)?.key || 'exp_busca_placeholder') : t('exp_busca_placeholder')}</span></span><span className="text-gray-400"><ChevronDown size={14} /></span>
        </button>
        {aberto === 'tipo' && <div id={id} role="listbox" aria-label={t('exp_busca_tipos')} className="absolute left-0 top-full z-50 mt-2 w-full rounded-[20px] border border-blue-100 bg-white px-3 pb-2 pt-4 shadow-[0_16px_50px_#0f172a26]" onKeyDown={e => {
          const index = optionsRef.current.indexOf(document.activeElement);
          let next;
          if (e.key === 'ArrowDown') next = (index + 1) % 4;
          if (e.key === 'ArrowUp') next = (index + 3) % 4;
          if (e.key === 'Home') next = 0;
          if (e.key === 'End') next = 3;
          if (next !== undefined) { e.preventDefault(); optionsRef.current[next]?.focus(); }
        }}>
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{t('exp_busca_tipos')}</p>
          {TIPOS.map((s, i) => <button ref={el => { optionsRef.current[i] = el; }} role="option" aria-selected={tipo === s.value} type="button" key={s.value} onClick={() => { setTipo(s.value); setAberto(null); tipoRef.current?.focus(); }} className="flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold outline-none hover:bg-blue-50 focus-visible:bg-blue-50"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50"><Icone icon={s.icon} size={18} /></span>{t(s.key)}</button>)}
          {tipo && <button type="button" onClick={() => { setTipo(''); setAberto(null); tipoRef.current?.focus(); }} className="px-3 py-2 text-sm text-blue-600">{t('limpar')}</button>}
        </div>}
      </div>
      <label className={campo}><IconeCampo icon={MapPin} /><span className="min-w-0 flex-1"><Label>{t('exp_busca_ilha')}</Label><span className="relative block"><select aria-label={t('exp_busca_ilha')} value={ilha} onChange={e => { setIlha(e.target.value); setZona(''); }} className={select}>{ILHAS.map(v => <option key={v}>{v}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDown size={14} /></span></span></span></label>
      <label className={`${campo} md:border-r`}><IconeCampo icon={MapPin} /><span className="min-w-0 flex-1"><Label>{t('exp_busca_zona')}</Label><span className="relative block"><select aria-label={t('exp_busca_zona')} value={zona} onChange={e => setZona(e.target.value)} className={select}><option value="">{t('exp_busca_todas_zonas')}</option>{[...new Set([...opcoesZona, ...(zona ? [zona] : [])])].map(v => <option key={v}>{v}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"><ChevronDown size={14} /></span></span></span></label>
      <div className="relative min-w-0 border-b border-gray-100 lg:border-b-0 lg:border-r">
        <button type="button" aria-label={t('exp_pesquisa_data_unica')} aria-expanded={aberto === 'datas'} aria-haspopup="dialog" onClick={() => setAberto(aberto === 'datas' ? null : 'datas')} className="flex min-h-[60px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><IconeCampo icon={Calendar} /><span className="min-w-0"><Label>{t('exp_pesquisa_data_unica')}</Label><span className="block truncate text-sm font-bold">{dataLabel}</span></span></button>
        {aberto === 'datas' && <div role="dialog" aria-label={t('exp_busca_data')} data-exp-calendar className="relative z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-xl lg:absolute lg:right-0 lg:top-full lg:w-[360px]"><CalendarioMorabeza onFechar={() => setAberto(null)} onLimpar={() => setInicio(null)} selected={inicio} minDate={new Date()} locale={i18n.language} onChange={data => { setInicio(data); setAberto(null); }} /></div>}
      </div>
      <button type="submit" className="mt-2 flex min-h-12 self-center items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs leading-4 font-black uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-95 md:col-span-2 lg:col-span-1 lg:ml-2 lg:mt-0"><Search size={16} strokeWidth={3} />{t('buscar')}</button>
    </form>
  </div>;
}

export default function PesquisaExperiencias(props) {
  const location = useLocation();
  return <FormularioPesquisa key={location.search} {...props} />;
}
