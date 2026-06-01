// src/components/AlojamentoRegisto/AlojamentoRouter.jsx (versão simplificada)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

// Componentes de Registo
import MeusAlojamentos from './MeusAlojamentos';
import EditarAlojamento from './EditarAlojamento';
import InfoAlojamento from './InfoAlojamento';
import NomePropriedade from './NomePropriedade';
import RegistarLocalizacao from './RegistarLocalizacao';
import FluxoRegisto from './FluxoRegisto';

// Layout com verificação de login
const LayoutRegisto = ({ children }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

const AlojamentoRouter = () => {
  return (
    <Routes>
      <Route path="meus" element={
        <LayoutRegisto>
          <MeusAlojamentos />
        </LayoutRegisto>
      } />
      <Route path="editar/:id" element={
        <LayoutRegisto>
          <EditarAlojamento />
        </LayoutRegisto>
      } />
      <Route path="detalhes/:id" element={
        <LayoutRegisto>
          <InfoAlojamento />
        </LayoutRegisto>
      } />
      <Route path="nome" element={
        <LayoutRegisto>
          <NomePropriedade />
        </LayoutRegisto>
      } />
      <Route path="localizacao" element={
        <LayoutRegisto>
          <RegistarLocalizacao />
        </LayoutRegisto>
      } />
      <Route path="fluxo" element={
        <LayoutRegisto>
          <FluxoRegisto />
        </LayoutRegisto>
      } />
    </Routes>
  );
};

export default AlojamentoRouter;