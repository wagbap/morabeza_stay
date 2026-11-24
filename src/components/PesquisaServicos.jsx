import SeletorPesquisa from './SeletorPesquisa';
import { useEffect, useId, useRef, useState } from 'react';
import Icone from './IconePesquisa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BedDouble, CarFront, Compass, MapPin, Search, ChevronDown, Check } from 'lucide-react';

const servicos = [
  { id: 'alojamentos', icon: BedDouble, label: 'nav_alojamentos', descricao: 'nav_alojamentos_sub' },
  { id: 'carros', icon: CarFront, label: 'nav_carros', descricao: 'nav_carros_sub' },
  { id: 'experiencias', icon: Compass, label: 'nav_experiencias', descricao: 'nav_experiencias_sub' },
];
const ilhas = ['Santiago'];

export default function PesquisaServicos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [destino, setDestino] = useState('Santiago');
  const [servico, setServico] = useState('');
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const ref = useRef(null);
  const trigger = useRef(null);
  const opcoes = useRef([]);
  const id = useId();
  const selecionado = servicos.find(s => s.id === servico);

  useEffect(() => {
    if (!aberto) return;
    const fechar = event => { if (!ref.current?.contains(event.target)) setAberto(false); };
    document.addEventListener('pointerdown', fechar);
    return () => document.removeEventListener('pointerdown', fechar);
  }, [aberto]);

  const abrir = (ultimo = false) => {
    setAberto(true);
    requestAnimationFrame(() => opcoes.current[ultimo ? servicos.length - 1 : Math.max(0, servicos.findIndex(s => s.id === servico))]?.focus());
  };
  const pesquisar = event => {
    event.preventDefault();
    if (!servico) { setAviso(true); abrir(); return; }
    navigate(`/${servico}?${new URLSearchParams({ destino })}`);
    window.scrollTo(0, 0);
  };

  return <div data-pesquisa-servicos className="relative mx-auto max-w-7xl text-left">
    <form onSubmit={pesquisar} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-xl md:flex-row md:items-center">
      <label className="flex min-w-0 flex-1 min-h-[60px] items-center gap-3 rounded-xl px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200"><Icone icon={MapPin} size={18} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">{t('label_destino')}</span><SeletorPesquisa aria-label={t('label_destino')} value={destino} onChange={e => setDestino(e.target.value)} className="w-full cursor-pointer bg-transparent py-0.5 text-sm font-bold text-gray-900 outline-none focus-visible:outline-none focus-visible:ring-0">{ilhas.map(ilha => <option key={ilha} value={ilha}>{ilha}</option>)}</SeletorPesquisa></span>
      </label>
      <div ref={ref} className="relative min-w-0 flex-1 border-y border-slate-200 md:border-x md:border-y-0" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setAberto(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setAberto(false); trigger.current?.focus(); } }}>
        <button ref={trigger} type="button" aria-expanded={aberto} aria-controls={id} aria-haspopup="listbox" aria-label={t('home_pesquisa_servico')} onClick={() => aberto ? setAberto(false) : abrir()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); abrir(event.key === 'ArrowUp'); } }} className="flex min-h-[60px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left outline-none hover:bg-blue-50/50 focus-visible:ring-2 focus-visible:ring-blue-600">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200"><Icone icon={selecionado?.icon || Compass} size={18} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">{t('home_pesquisa_servico')}</span><span className="block py-0.5 text-sm font-bold text-gray-900">{selecionado ? t(selecionado.label) : t('home_pesquisa_selecionar')}</span></span><span className="text-slate-600"><ChevronDown size={14} className={aberto ? 'rotate-180' : ''} /></span>
        </button>
        {aberto && <div id={id} role="listbox" aria-label={t('home_pesquisa_servico')} className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_50px_#0f172a26]" onKeyDown={event => {
          const index = opcoes.current.indexOf(document.activeElement);
          let next;
          if (event.key === 'ArrowDown') next = (index + 1) % servicos.length;
          if (event.key === 'ArrowUp') next = (index + servicos.length - 1) % servicos.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = servicos.length - 1;
          if (next !== undefined) { event.preventDefault(); opcoes.current[next]?.focus(); }
        }}>{servicos.map((s, index) => <button ref={el => { opcoes.current[index] = el; }} key={s.id} type="button" role="option" aria-selected={servico === s.id} onClick={() => { setServico(s.id); if (['carros', 'experiencias'].includes(s.id)) setDestino('Santiago'); setAberto(false); setAviso(false); trigger.current?.focus(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none ${servico === s.id ? 'bg-blue-50' : ''}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50"><Icone icon={s.icon} size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-900">{t(s.label)}</span><span className="block text-[10px] text-slate-500">{t(s.descricao)}</span></span>{servico === s.id && <Icone icon={Check} size={18} />}
        </button>)}</div>}
      </div>
      <button type="submit" className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-xs font-black uppercase text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:ml-2 md:mt-0"><span aria-hidden="true"><Search size={16} strokeWidth={3} /></span>{t('buscar')}</button>
    </form>
    {aviso && <p role="alert" className="mt-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-700">{t('home_pesquisa_escolha')}</p>}
  </div>;
}
