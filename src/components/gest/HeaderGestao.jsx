import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Calendar, CalendarCheck, CalendarDays, Car, CircleDollarSign, Compass, Contact, FileCheck, FileText, History, Home, KeyRound, MessageCircle, Settings2, ShieldCheck, Star, User, UserRoundPlus, Wallet } from 'lucide-react';

const icones = {
  dashboard: Home,
  reservas: CalendarCheck,
  calendario: Calendar,
  mensagens: MessageCircle,
  financeiro: CircleDollarSign,
  recebimento: Wallet,
  relatorios: BarChart3,
  historico: History,
  avaliacoes: Star,
  documentos: FileText,
  minhas_reservas: CalendarCheck,
  experiencias: Compass,
  unidades: KeyRound,
  pessoais: User,
  seguranca: ShieldCheck,
  contacto: Contact,
  funcoes: UserRoundPlus,
  servicos: Settings2,
  sessoes: CalendarDays,
  bloqueios: ShieldCheck,
  politicas: FileCheck,
  condicoes: Car,
  detalhes: CalendarCheck,
};

/** Shared section heading. Actions and dynamic subtitles retain their own behaviour. */
export default function HeaderGestao({ secao, titulo, descricao, acoes, className = 'mb-6' }) {
  const { t } = useTranslation();
  const Icon = icones[secao] || Home;
  return (
    <header className={`flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2.5">
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-blue-600"><Icon className="h-6 w-6" strokeWidth={1.8} /></span>
          <h1 className="min-w-0 break-words text-xl font-bold leading-tight tracking-tight text-[#0f172a] sm:text-2xl">{titulo ?? t(`gest_header_${secao}_titulo`)}</h1>
        </div>
        <div className="mt-1.5 text-sm leading-relaxed text-slate-500">{descricao ?? t(`gest_header_${secao}_descricao`)}</div>
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  );
}
