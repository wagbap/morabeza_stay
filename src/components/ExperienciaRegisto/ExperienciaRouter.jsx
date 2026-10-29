import { obterUtilizadorRegisto } from '../../utils/registoSession';
// src/components/ExperienciaRegisto/ExperienciaRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FluxoRegisto from './FluxoRegisto';
import MeusExperiencias from './MeusExperiencias';
import EditarExperiencia from './EditarExperiencia';
import InfoExperiencia from './InfoExperiencia';

// Função auxiliar para verificar autenticação com JWT e LocalStorage
const verificarAutenticacao = () => Boolean(obterUtilizadorRegisto(localStorage));

// Layout com verificação de login segura
const LayoutRegisto = ({ children }) => {
  const estaAutenticado = verificarAutenticacao();
  
  // Se não estiver autenticado, redireciona para o login
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

const ExperienciaRouter = () => {
  return (
    <Routes>
      <Route path="meus" element={
        <LayoutRegisto>
          <MeusExperiencias />
        </LayoutRegisto>
      } />
      <Route path="editar/:id" element={
        <LayoutRegisto>
          <EditarExperiencia />
        </LayoutRegisto>
      } />
      <Route path="detalhes/:id" element={
        <LayoutRegisto>
          <InfoExperiencia />
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

export default ExperienciaRouter;