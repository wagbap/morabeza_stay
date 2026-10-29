import { obterUtilizadorRegisto } from '../../utils/registoSession';
// src/components/CarroRegisto/CarroRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FluxoRegisto from './FluxoRegisto';
import MeusCarros from './MeusCarros';
import EditarCarro from './EditarCarro';
import InfoCarro from './InfoCarro';

// Função auxiliar robusta para verificar autenticação (JWT + LocalStorage)
const verificarAutenticacao = () => Boolean(obterUtilizadorRegisto(localStorage));

// Layout com verificação de login segura
const LayoutRegisto = ({ children }) => {
  const estaAutenticado = verificarAutenticacao();
  
  // Se não estiver autenticado de nenhuma forma, manda pro login
  if (!estaAutenticado) {
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

const CarroRouter = () => {
  return (
    <Routes>
      <Route path="meus" element={
        <LayoutRegisto>
          <MeusCarros />
        </LayoutRegisto>
      } />
      <Route path="editar/:id" element={
        <LayoutRegisto>
          <EditarCarro />
        </LayoutRegisto>
      } />
      <Route path="detalhes/:id" element={
        <LayoutRegisto>
          <InfoCarro />
        </LayoutRegisto>
      } />
      <Route path="fluxo" element={
        <LayoutRegisto>
          <FluxoRegisto />
        </LayoutRegisto>
      } />
      <Route path="" element={<Navigate to="meus" replace />} />
    </Routes>
  );
};

export default CarroRouter;