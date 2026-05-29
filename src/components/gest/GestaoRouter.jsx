// src/components/gest/GestaoRouter.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';

import Navbar from '../Navbar'; 
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Calendario from './Calendario';
import Reservas from './Reservas';
import Mensagens from './Mensagens';
import Financeiro from './Financeiro';
import Avaliacoes from './Avaliacoes';
import Relatorios from './Relatorios';
import Configuracoes from './Configuracoes';

const LayoutGestao = ({ children }) => {
  // Estado para controlar a Sidebar no mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fc] overflow-hidden relative">
      
      {/* A TUA NAVBAR INTACTA (onde está o gmail) */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Passamos o estado e a função para fechar a barra lateral */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Overlay escuro de fundo quando o menu está aberto no mobile */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden fixed inset-0 bg-black/40 z-30" 
          />
        )}

        {/* Área Principal de Conteúdo */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* BARRA MOBILE: Hamburger no topo (logo abaixo da tua Navbar) */}
          <div className="lg:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100 shadow-sm z-20">
            <span className="font-bold text-[#0f172a] text-[15px]">Menu do Anfitrião</span>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="bg-[#f8fafc] border border-gray-100 hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
            >
              <Menu className="w-6 h-6 text-[#0f172a]" strokeWidth={2} />
            </button>
          </div>

          {/* Onde as páginas carregam */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

const GestaoRouter = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<LayoutGestao><Dashboard /></LayoutGestao>} />
      <Route path="calendario" element={<LayoutGestao><Calendario /></LayoutGestao>} />
      <Route path="reservas" element={<LayoutGestao><Reservas /></LayoutGestao>} />
      <Route path="mensagens" element={<LayoutGestao><Mensagens /></LayoutGestao>} />
      <Route path="financeiro" element={<LayoutGestao><Financeiro /></LayoutGestao>} />
      <Route path="avaliacoes" element={<LayoutGestao><Avaliacoes /></LayoutGestao>} />
      <Route path="relatorios" element={<LayoutGestao><Relatorios /></LayoutGestao>} />
      <Route path="configuracoes" element={<LayoutGestao><Configuracoes /></LayoutGestao>} />
    </Routes>
  );
};

export default GestaoRouter;