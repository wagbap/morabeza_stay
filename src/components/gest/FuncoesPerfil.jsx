import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home, Compass, Car, Shield, CheckCircle2, Trash2, Loader2, ArrowRight } from 'lucide-react';
import HeaderGestao from './HeaderGestao';

const funcoes = [
  { name: 'anfitrion', key: 'alojamento', Icon: Home, cor: 'bg-blue-100 text-blue-600' },
  { name: 'guia_experiencias', key: 'experiencia', Icon: Compass, cor: 'bg-purple-100 text-purple-600' },
  { name: 'proprietario_veiculos', key: 'carro', Icon: Car, cor: 'bg-green-100 text-green-600' },
];

export default function FuncoesPerfil({ roles, selecionado, aceite, loading, message, onSelecionar, onAceitar, onAtivar, onRemover }) {
  const { t } = useTranslation();
  const painelRef = useRef(null);
  useEffect(() => {
    if (!selecionado) return;
    const frame = requestAnimationFrame(() => painelRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest',
    }));
    return () => cancelAnimationFrame(frame);
  }, [selecionado]);

  return <section className="p-4 sm:p-6 md:p-8">
    <HeaderGestao secao="funcoes" />
    {message.text && <div role="status" className={`mb-5 rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
    <div className="space-y-4">
      {funcoes.map(funcao => {
        const { name, key, Icon, cor } = funcao;
        const ativo = roles.some(role => role?.name === name && role.status === 'approved');
        const aberto = selecionado === name;
        return <article key={name} className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${aberto ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-100' : 'border-gray-200 bg-white'}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cor}`}><Icon className="h-6 w-6" /></span>
              <div className="min-w-0"><h3 className="text-base font-bold leading-snug text-slate-950 sm:text-lg">{t(`perfil_funcao_${key}`)}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{t(`perfil_funcao_${key}_descricao`)}</p></div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              {ativo ? <>
                <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"><CheckCircle2 size={15} />{t('perfil_funcao_ativo')}</span>
                <button type="button" disabled={loading} onClick={() => onRemover(name)} aria-label={t('perfil_funcao_remover', { nome: t(`perfil_funcao_${key}`) })} className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={18} /></button>
              </> : <button type="button" disabled={loading} aria-expanded={aberto} aria-controls={`condicoes-${name}`} onClick={() => onSelecionar(aberto ? null : name)} className={`min-h-11 w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:w-auto ${aberto ? 'bg-slate-100 text-slate-700' : 'bg-blue-900 text-white hover:bg-blue-950'} disabled:opacity-50`}>{t(aberto ? 'perfil_funcao_cancelar' : 'perfil_funcao_ativar')}</button>}
            </div>
          </div>
          {aberto && <div id={`condicoes-${name}`} ref={painelRef} className="mt-4 scroll-mt-4 rounded-xl border border-blue-100 bg-white/70 p-4 sm:p-5">
            <h4 className="flex items-start gap-2 font-semibold text-blue-950"><span className="mt-0.5 shrink-0"><Shield size={19} /></span>{t('perfil_funcao_condicoes')}</h4>
            <div tabIndex={0} role="region" aria-label={t('perfil_funcao_condicoes')} className="mt-3 max-h-[35dvh] overflow-y-auto overscroll-contain pr-3 text-sm leading-relaxed text-slate-600 [scrollbar-width:thin] [scrollbar-color:#93c5fd_transparent] focus-visible:outline-2 focus-visible:outline-blue-600">
              <ul className="list-disc space-y-2 pl-5">
                <li>{t('perfil_funcao_imediata')}</li>
                <li>{t('perfil_funcao_analise')}</li>
                <li>{t('perfil_funcao_comissao')}</li>
                <li>{t('perfil_funcao_documentos')}</li>
                <li>{t('perfil_funcao_pausa')}</li>
              </ul>
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate-700">
              <input type="checkbox" checked={aceite} disabled={loading} onChange={event => onAceitar(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-blue-900" />
              <span>{t('perfil_funcao_aceito')} <Link to="/termos" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">{t('perfil_funcao_termos')}</Link> {t('perfil_funcao_e')} <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">{t('perfil_funcao_privacidade')}</Link>.</span>
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" disabled={loading || !aceite} onClick={() => onAtivar(name)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={17} className="animate-spin" />{t('perfil_funcao_a_ativar')}</> : <>{t('perfil_funcao_confirmar')}<ArrowRight size={18} /></>}</button>
              <button type="button" disabled={loading} onClick={() => onSelecionar(null)} className="min-h-12 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{t('perfil_funcao_cancelar')}</button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">{t('perfil_funcao_nota')}</p>
          </div>}
        </article>;
      })}
    </div>
  </section>;
}
