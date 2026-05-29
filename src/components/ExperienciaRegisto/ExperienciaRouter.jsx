// src/components/ExperienciaRegisto/ExperienciaRouter.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FluxoRegisto from './FluxoRegisto';
import MeusExperiencias from './MeusExperiencias';
import EditarExperiencia from './EditarExperiencia';
import InfoExperiencia from './InfoExperiencia';

const LayoutRegisto = ({ children }) => (
  <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
    <Navbar />
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
);

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
    </Routes>
  );
};

export default ExperienciaRouter;