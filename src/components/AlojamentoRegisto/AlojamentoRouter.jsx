// src/components/AlojamentoRegisto/AlojamentoRouter.jsx (atualizado)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import InformacoesBasicas from './InformacoesBasicas';
import RegistarLocalizacao from './RegistarLocalizacao'; 
import NomePropriedade from './NomePropriedade'; 
import Comodidades from './Comodidades';  
import Regras from './Regras';
import ImagensUpload from './ImagensUpload';
import ProprietarioInfo from './ProprietarioInfo';
import PrecosDisponibilidade from './PrecosDisponibilidade';  
import ComodidadesLista from './ComodidadesLista';
import FluxoRegisto from './FluxoRegisto';           
import MeusAlojamentos from './MeusAlojamentos';
import EditarAlojamento from './EditarAlojamento';
import InfoAlojamento from './InfoAlojamento';

// Layout com Navbar e Footer para as rotas de registo
const LayoutRegisto = ({ children }) => (
  <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
    <Navbar />
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
);

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