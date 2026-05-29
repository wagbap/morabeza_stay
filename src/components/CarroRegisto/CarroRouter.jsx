// src/components/CarroRegisto/CarroRouter.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FluxoRegisto from './FluxoRegisto';
import MeusCarros from './MeusCarros';
import EditarCarro from './EditarCarro';
import InfoCarro from './InfoCarro';

const LayoutRegisto = ({ children }) => (
  <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
    <Navbar />
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
);

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