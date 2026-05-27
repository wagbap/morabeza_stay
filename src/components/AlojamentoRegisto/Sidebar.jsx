import React from "react";
import {
  Home,
  Calendar,
  Calendar as Reservations,
  MessageCircle,
  Users,
  DollarSign,
  Star,
  Gift,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Home className="w-5 h-5 text-[#006ce4]" />
            <span className="font-medium">Dashboard</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium"
          >
            <Home className="w-5 h-5 text-[#006ce4]" />
            <span>Meus Imóveis</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Calendar className="w-5 h-5 text-[#006ce4]" />
            <span>Calendário</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Reservations className="w-5 h-5 text-[#006ce4]" />
            <span>Reservas</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl relative"
          >
            <MessageCircle className="w-5 h-5 text-[#006ce4]" />
            <span>Mensagens</span>
            <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              5
            </span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Users className="w-5 h-5 text-[#006ce4]" />
            <span>Hóspedes</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <DollarSign className="w-5 h-5 text-[#006ce4]" />
            <span>Financeiro</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Star className="w-5 h-5 text-[#006ce4]" />
            <span>Avaliações</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Gift className="w-5 h-5 text-[#006ce4]" />
            <span>Promoções</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <BarChart3 className="w-5 h-5 text-[#006ce4]" />
            <span>Relatórios</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <Settings className="w-5 h-5 text-[#006ce4]" />
            <span>Configurações</span>
          </a>
        </nav>
      </div>

      {/* Logout + Help Box - Movidos mais para baixo */}
      <div className="mt-auto">
        {/* Sair */}
        <div className="p-4 border-t border-gray-200">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            <LogOut className="w-5 h-5 text-[#006ce4]" />
            <span>Sair</span>
          </a>
        </div>

        {/* Precisa de ajuda */}
        <div className="mx-4 mb-6 bg-emerald-50 rounded-2xl p-5">
          <div className="flex justify-center mb-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2920/2920318.png"
              alt="help"
              className="w-16 h-16"
            />
          </div>
          <p className="text-center font-medium text-gray-800 mb-1">
            Precisa de ajuda?
          </p>
          <p className="text-center text-sm text-gray-600 mb-4">
            A nossa equipa está disponível para ajudar.
          </p>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
            <span>Falar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}