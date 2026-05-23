import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

const AlojamentoRouter = () => {
  return (
    <Routes>
      <Route path="nome" element={<NomePropriedade />} />
      <Route path="localizacao" element={<RegistarLocalizacao />} />
      <Route path="fluxo" element={<FluxoRegisto />} />
    </Routes>
  );
};

export default AlojamentoRouter;