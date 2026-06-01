// src/components/gest/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  Calendar,
  MessageCircle,
  CircleDollarSign,
  Star,
  BarChart3,
  Settings,
  History ,
  LogOut,
  X // Importei o X para fechar no mobile
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  const linkClass = (path) => `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-colors ${
    isActive(path) 
      ? "bg-[#e8f6ed] text-[#064e3b]" 
      : "text-[#4b5563] hover:bg-gray-50"
  }`;

  const iconClass = (path) => `w-[22px] h-[22px] flex-shrink-0 ${
    isActive(path) ? "text-[#16a34a]" : "text-[#1e3a8a]"
  }`;

  return (
    <div className={`
      w-[260px] h-full bg-white border-r border-gray-100 flex flex-col flex-shrink-0
      fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      
      {/* Botão de Fechar no Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-50">
        <span className="font-bold text-[#0f172a]">Menu</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1.5">
          <Link to="/gest/dashboard" onClick={onClose} className={linkClass('/gest/dashboard')}>
            <Home className={iconClass('/gest/dashboard')} strokeWidth={2} />
            <span className="text-[15px] truncate">Dashboard</span>
          </Link>

          

          <Link to="/gest/reservas" onClick={onClose} className={linkClass('/gest/reservas')}>
            <CalendarCheck className={iconClass('/gest/reservas')} strokeWidth={2} />
            <span className="text-[15px] truncate">Reservas</span>
          </Link>

          <Link to="/gest/calendario" onClick={onClose} className={linkClass('/gest/calendario')}>
            <Calendar className={iconClass('/gest/calendario')} strokeWidth={2} />
            <span className="text-[15px] truncate">Calendário</span>
          </Link>

          <Link to="/gest/mensagens" onClick={onClose} className={linkClass('/gest/mensagens')}>
            <MessageCircle className={iconClass('/gest/mensagens')} strokeWidth={2} />
            <span className="text-[15px] truncate">Mensagens</span>
            <span className="ml-auto flex-shrink-0 bg-[#e0e7ff] text-[#3730a3] text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
              5
            </span>
          </Link>

          <Link to="/gest/financeiro" onClick={onClose} className={linkClass('/gest/financeiro')}>
            <CircleDollarSign className={iconClass('/gest/financeiro')} strokeWidth={2} />
            <span className="text-[15px] truncate">Financeiro</span>
          </Link>

          <Link to="/gest/relatorios" onClick={onClose} className={linkClass('/gest/relatorios')}>
            <BarChart3 className={iconClass('/gest/relatorios')} strokeWidth={2} />
            <span className="text-[15px] truncate">Relatórios</span>
          </Link>
        

          <Link to="/gest/historico" onClick={onClose} className={linkClass('/gest/historico')}>
            <History  className={iconClass('/gest/historico')} strokeWidth={2} />
            <span className="text-[15px] truncate">Histórico</span>
          </Link>


            <Link to="/gest/avaliacoes" onClick={onClose} className={linkClass('/gest/avaliacoes')}>
            <Star className={iconClass('/gest/avaliacoes')} strokeWidth={2} />
            <span className="text-[15px] truncate">Avaliações</span>
          </Link>

          <Link to="/gest/configuracoes" onClick={onClose} className={linkClass('/gest/configuracoes')}>
            <Settings className={iconClass('/gest/configuracoes')} strokeWidth={2} />
            <span className="text-[15px] truncate">Configurações</span>
          </Link>

          <button onClick={onClose} className="w-full flex items-center gap-3.5 px-4 py-3 text-[#4b5563] hover:bg-gray-50 rounded-xl font-medium transition-colors mt-1.5">
            <LogOut className="w-[22px] h-[22px] text-[#1e3a8a] flex-shrink-0" strokeWidth={2} />
            <span className="text-[15px] truncate">Sair</span>
          </button>
        </nav>
      </div>
    </div>
  );
}