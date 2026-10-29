// src/components/gest/Sidebar.jsx
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useSidebarSession from "./useSidebarSession";
import { SESSION_KEYS } from "./sidebarSession";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  QrCode,
  Calendar,
  MessageCircle,
  CircleDollarSign,
  Star,
  BarChart3,
  History,
  LogOut,
  X,
  Heart,
  User,
  Car,
  Compass,
  FileText,
  Wallet,
  KeyRound,
  Settings2
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { userRoles, user, loading, error, retry } = useSidebarSession();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = event => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const linkClass = (path) => `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-colors ${
    isActive(path)
      ? "bg-[#e8f6ed] text-[#064e3b]"
      : "text-[#4b5563] hover:bg-gray-50"
  }`;

  const iconClass = (path) => `w-[22px] h-[22px] flex-shrink-0 ${
    isActive(path) ? "text-[#16a34a]" : "text-[#1e3a8a]"
  }`;

  // Verificar se tem pelo menos uma role de gestão
  const hasManagementRole = userRoles.anfitrion || userRoles.guia || userRoles.proprietarioVeiculos;

  const nomeExibicao = [user?.nome, user?.name].find(value => typeof value === 'string' && value.trim()) || t('sidebar_utilizador');
  const emailExibicao = typeof user?.email === 'string' ? user.email : '';

  return (
    <div className={`
      w-[260px] max-w-[calc(100vw-2rem)] h-full min-h-0 bg-white border-r border-gray-100 flex flex-col flex-shrink-0
      fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0 visible" : "-translate-x-full invisible lg:visible"}
    `}>

      {/* Botão de Fechar no Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-50">
        <span className="font-bold text-[#0f172a]">{t('sidebar_menu')}</span>
        <button type="button" aria-label={t('sidebar_fechar')} onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      {loading && <p role="status" className="px-4 py-3 text-xs text-slate-500">{t('sidebar_a_carregar')}</p>}
      {error && <div role="alert" className="m-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        <p>{t('sidebar_erro')}</p>
        <button type="button" onClick={retry} className="mt-1 min-h-11 font-semibold underline">{t('sidebar_tentar')}</button>
      </div>}

      {/* Header com informações do usuário */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003580] to-[#6b82c6] flex items-center justify-center text-white font-bold flex-shrink-0">
            {nomeExibicao.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{nomeExibicao}</p>
            <p className="text-xs text-gray-400 truncate">{emailExibicao}</p>
          </div>
        </div>

        {/* Badge de roles */}
        <div className="flex flex-wrap gap-1 mt-3">
          {userRoles.anfitrion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
              <Home size={10} /> {t('sidebar_alojamentos')}
            </span>
          )}
          {userRoles.proprietarioVeiculos && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
              <Car size={10} /> {t('sidebar_veiculos')}
            </span>
          )}
          {userRoles.guia && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full">
              <Compass size={10} /> {t('sidebar_guia')}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 px-4">
        <nav aria-label={t('sidebar_menu')} className="space-y-1.5">
          {hasManagementRole && (
            <>
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('sidebar_gestao')}</p>
              </div>

              <Link to="/gest/dashboard" onClick={onClose} className={linkClass('/gest/dashboard')} aria-current={isActive('/gest/dashboard') ? 'page' : undefined}>
                <span className={iconClass('/gest/dashboard')}><Home className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_dashboard')}</span>
              </Link>

              <Link to="/gest/reservas" onClick={onClose} className={linkClass('/gest/reservas')} aria-current={isActive('/gest/reservas') ? 'page' : undefined}>
                <span className={iconClass('/gest/reservas')}><CalendarCheck className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_reservas')}</span>
              </Link>

              <Link to="/gest/validar-reservas" onClick={onClose} className={linkClass('/gest/validar-reservas')} aria-current={isActive('/gest/validar-reservas') ? 'page' : undefined}>
                <span className={iconClass('/gest/validar-reservas')}><QrCode className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_validar_reservas')}</span>
              </Link>

              <Link to="/gest/calendario" onClick={onClose} className={linkClass('/gest/calendario')} aria-current={isActive('/gest/calendario') ? 'page' : undefined}>
                <span className={iconClass('/gest/calendario')}><Calendar className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_calendario')}</span>
              </Link>

              <Link to="/gest/mensagens" onClick={onClose} className={linkClass('/gest/mensagens')} aria-current={isActive('/gest/mensagens') ? 'page' : undefined}>
                <span className={iconClass('/gest/mensagens')}><MessageCircle className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_mensagens')}</span>
              </Link>

              <Link to="/gest/financeiro" onClick={onClose} className={linkClass('/gest/financeiro')} aria-current={isActive('/gest/financeiro') ? 'page' : undefined}>
                <span className={iconClass('/gest/financeiro')}><CircleDollarSign className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_financeiro')}</span>
              </Link>

              <Link to="/gest/dados-recebimento" onClick={onClose} className={linkClass('/gest/dados-recebimento')} aria-current={isActive('/gest/dados-recebimento') ? 'page' : undefined}>
                <span className={iconClass('/gest/dados-recebimento')}><Wallet className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_recebimento')}</span>
              </Link>

              <Link to="/gest/relatorios" onClick={onClose} className={linkClass('/gest/relatorios')} aria-current={isActive('/gest/relatorios') ? 'page' : undefined}>
                <span className={iconClass('/gest/relatorios')}><BarChart3 className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_relatorios')}</span>
              </Link>

              <Link to="/gest/historico" onClick={onClose} className={linkClass('/gest/historico')} aria-current={isActive('/gest/historico') ? 'page' : undefined}>
                <span className={iconClass('/gest/historico')}><History className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_historico')}</span>
              </Link>

              <Link to="/gest/avaliacoes" onClick={onClose} className={linkClass('/gest/avaliacoes')} aria-current={isActive('/gest/avaliacoes') ? 'page' : undefined}>
                <span className={iconClass('/gest/avaliacoes')}><Star className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_avaliacoes')}</span>
              </Link>

              <Link to="/gest/documentos-solicitados" onClick={onClose} className={linkClass('/gest/documentos-solicitados')} aria-current={isActive('/gest/documentos-solicitados') ? 'page' : undefined}>
                <span className={iconClass('/gest/documentos-solicitados')}><FileText className="h-full w-full" strokeWidth={2} /></span>
                <span className="text-[15px] truncate">{t('sidebar_documentos')}</span>
              </Link>

              {/* 🔥 NOVO: Link para configurar sessões das experiências */}
              {userRoles.guia && (
                <Link
                  to="/gest/minhas-experiencias"
                  onClick={onClose}
                  className={linkClass('/gest/minhas-experiencias')} aria-current={isActive('/gest/minhas-experiencias') ? 'page' : undefined}
                >
                  <span className={iconClass('/gest/minhas-experiencias')}><Settings2 className="h-full w-full" strokeWidth={2} /></span>
                  <span className="text-[15px] truncate">{t('sidebar_experiencias')}</span>
                </Link>
              )}

              {userRoles.proprietarioVeiculos && (
                <Link
                  to="/gest/unidades-veiculos"
                  onClick={onClose}
                  className={linkClass('/gest/unidades-veiculos')} aria-current={isActive('/gest/unidades-veiculos') ? 'page' : undefined}
                >
                  <span className={iconClass('/gest/unidades-veiculos')}><KeyRound className="h-full w-full" strokeWidth={2} /></span>
                  <span className="text-[15px] truncate">{t('sidebar_unidades')}</span>
                </Link>
              )}
            </>
          )}

          <div className="pt-2">
            <div className="px-4 py-2 mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('sidebar_conta')}</p>
            </div>

            <Link to="/gest/configuracoes" onClick={onClose} className={linkClass('/gest/configuracoes')} aria-current={isActive('/gest/configuracoes') ? 'page' : undefined}>
              <span className={iconClass('/gest/configuracoes')}><User className="h-full w-full" strokeWidth={2} /></span>
              <span className="text-[15px] truncate">{t('sidebar_perfil')}</span>
            </Link>

            <Link to="/gest/minhas-reservas" onClick={onClose} className={linkClass('/gest/minhas-reservas')} aria-current={isActive('/gest/minhas-reservas') ? 'page' : undefined}>
              <span className={iconClass('/gest/minhas-reservas')}><CalendarCheck className="h-full w-full" strokeWidth={2} /></span>
              <span className="text-[15px] truncate">{t('sidebar_minhas_reservas')}</span>
            </Link>

            <Link to="/favoritos" onClick={onClose} className={linkClass('/favoritos')} aria-current={isActive('/favoritos') ? 'page' : undefined}>
              <span className={iconClass('/favoritos')}><Heart className="h-full w-full" strokeWidth={2} /></span>
              <span className="text-[15px] truncate">{t('sidebar_favoritos')}</span>
            </Link>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={() => {
                for (const key of SESSION_KEYS) {
                  try { localStorage.removeItem(key); } catch { /* Continue logout if storage is unavailable. */ }
                }
                window.dispatchEvent(new Event('userUpdated'));
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-[22px] h-[22px] flex-shrink-0" strokeWidth={2} />
              <span className="text-[15px] truncate">{t('sidebar_sair')}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}