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
const verificarAutenticacao = () => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('morabeza_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsed = JSON.parse(jsonPayload);
      const userData = parsed.data || parsed;
      if (userData?.id) return true;
    }

    const chaves = ['user', 'morabeza_user', 'morabeza_admin'];
    for (const chave of chaves) {
      const raw = localStorage.getItem(chave);
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id || user?.sub || user?.user_id) return true;
      }
    }
  } catch (e) {
    console.error('Erro ao verificar autenticação no ExperienciaRouter:', e);
  }
  return false;
};

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