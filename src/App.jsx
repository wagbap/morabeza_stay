import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';

// Hooks
import { useFetchHomeData } from './hooks/useFetchHomeData';

// Componentes Globais
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Alojamentos from './features/alojamento/components/Alojamentos';
import Carros from './features/carros/components/Carros';
import Experiencias from './features/experiencias/components/Experiencias';
import ExperienciaDetalhes from './features/experiencias/components/ExperienciaDetalhes';
import CarrosDetalhes from './features/carros/components/CarrosDetalhes';
import PaginaMapa from './features/alojamento/components/MapaInterativoAlojamentos';
import MapaInterativoExperiencia from './features/experiencias/components/MapaInterativoExperiencia';
import MapaInterativoCarros from './features/carros/components/MapaInterativoCarros';
import CheckoutExperiancia from './features/experiencias/components/CheckoutExperiencia';
import CheckoutAlojamento from './features/alojamento/components/CheckoutAlojamento';
import CheckoutCarro from './features/carros/components/CheckoutCarro';
import Pagamento from './pages/Pagamento';
import Confirmacao from './pages/Confirmacao';
import Favoritos from './pages/Favoritos';
import InfoAlojamento from './features/alojamento/components/InfoAlojamento';
import Login from './pages/Login';

// Routers Específicos
import { AlojamentoRouter } from './components/AlojamentoRegisto';
import { ExperienciaRouter } from './components/ExperienciaRegisto';
import { CarroRouter } from './components/CarroRegisto';

import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import PainelControleAdmin from './components/admin/PainelControleAdmin';
import ReservasAdmin from './components/admin/ReservasAdmin';
import PropriedadesAdmin from './components/admin/PropriedadesAdmin';
import ClientesAdmin from './components/admin/ClientesAdmin';
import GanhosAdmin from './components/admin/GanhosAdmin';
import ConfiguracoesAdmin from './components/admin/ConfiguracoesAdmin';
import GestaoRouter from './components/gest/GestaoRouter';

import EmailsVerificados from './components/admin/EmailsVerificados';
import Mensagens from './components/admin/Mensagens';
import Pagamentos from './components/admin/Pagamentos';
import Denuncias from './components/admin/Denuncias';
import Relatorios from './components/admin/Relatorios';
import Anfitrioes from './components/admin/Anfitrioes';
import DetalhesConteudo from './components/admin/DetalhesConteudo';

// PÁGINA SOBRE - IMPORTE AQUI
import SobrePage from './pages/Sobre'; // Vamos criar essa página
import PolicyCancellation from './components/PolicyCancellation';
import TermsConditions from './components/TermsConditions';
import Faq from './components/Faq';
import PrivacyPolicy from './components/PrivacyPolicy';

// Layout Principal (Clientes)
const LayoutPrincipal = ({ children }) => (
  <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
    <Navbar />
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
);

function App() {
  const { alojamentos, carros, experiencias, loading } = useFetchHomeData();

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          
          {/* ROTAS DO PAINEL ADMINISTRATIVO */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PainelControleAdmin />} />
            <Route path="reservas" element={<ReservasAdmin />} />
            <Route path="propriedades" element={<PropriedadesAdmin />} />
            <Route path="clientes" element={<Anfitrioes />} />
            <Route path="ganhos" element={<GanhosAdmin />} />
            <Route path="propriedades/:tipo/:id" element={<DetalhesConteudo />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="/admin/verificacoes" element={<EmailsVerificados />} />
            <Route path="/admin/mensagens" element={<Mensagens />} />
            <Route path="/admin/pagamentos" element={<Pagamentos />} />
            <Route path="/admin/denuncias" element={<Denuncias />} />
            <Route path="/admin/relatorios" element={<Relatorios />} />
            <Route path="/admin/anfitrioes" element={<ClientesAdmin />} />
          </Route>

          {/* ROTAS DE REGISTO */}
          <Route path="/alojamento-registro/*" element={<AlojamentoRouter />} />
          <Route path="/experiencia-registo/*" element={<ExperienciaRouter />} />
          <Route path="/carro-registo/*" element={<CarroRouter />} />

          {/* ROTA DE LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* ROTA SOBRE - ADICIONADA AQUI */}
          <Route path="/sobre" element={
            <LayoutPrincipal>
              <SobrePage />
            </LayoutPrincipal>
          } />


             {/* ROTA POLITICA DE CANCELAMENTO - ADICIONADA AQUI */}
          <Route path="/cancelamento" element={
            <LayoutPrincipal>
              <PolicyCancellation />
            </LayoutPrincipal>
          } />



          {/* ROTA TEMROS DE CONDIÇÕES - ADICIONADA AQUI */}
          <Route path="/termos" element={
            <LayoutPrincipal>
              <TermsConditions />
            </LayoutPrincipal>
          } />

          
          {/* ROTA PERGUNAS FREQUENTES - ADICIONADA AQUI */}
          <Route path="/faq" element={
            <LayoutPrincipal>
              <Faq />
            </LayoutPrincipal>
          } />


          {/* ROTA  POLITICA DE PRIVACIDADE - ADICIONADA AQUI */}
          <Route path="privacidade" element={
            <LayoutPrincipal>
              <PrivacyPolicy />
            </LayoutPrincipal>
          } />
          
          

          {/* ROTAS DO LAYOUT PRINCIPAL */}
          <Route path="/" element={
            <LayoutPrincipal>
              <Home 
                alojamentos={alojamentos} 
                carros={carros} 
                experiencias={experiencias} 
                loading={loading} 
              />
            </LayoutPrincipal>
          } />

          <Route path="/alojamentos" element={<LayoutPrincipal><Alojamentos /></LayoutPrincipal>} />
          <Route path="/alojamentos/:slug" element={<LayoutPrincipal><InfoAlojamento /></LayoutPrincipal>} />
          <Route path="/alojamento/:slug" element={<LayoutPrincipal><InfoAlojamento /></LayoutPrincipal>} />

          <Route path="/carros" element={<LayoutPrincipal><Carros /></LayoutPrincipal>} />
          <Route path="/carros/:slug" element={<LayoutPrincipal><CarrosDetalhes /></LayoutPrincipal>} />
          <Route path="/carro/:slug" element={<LayoutPrincipal><CarrosDetalhes /></LayoutPrincipal>} />

          <Route path="/experiencias" element={<LayoutPrincipal><Experiencias /></LayoutPrincipal>} />
          <Route path="/experiencia/:slug" element={<LayoutPrincipal><ExperienciaDetalhes /></LayoutPrincipal>} />
          
          <Route path="/mapa" element={<LayoutPrincipal><PaginaMapa /></LayoutPrincipal>} />
          <Route path="/mapa-experiencias" element={<LayoutPrincipal><MapaInterativoExperiencia /></LayoutPrincipal>} />
          <Route path="/mapa-carros" element={<LayoutPrincipal><MapaInterativoCarros /></LayoutPrincipal>} />
          <Route path="/checkout-experiancia" element={<LayoutPrincipal><CheckoutExperiancia /></LayoutPrincipal>} />
          <Route path="/checkout-alojamento" element={<LayoutPrincipal><CheckoutAlojamento /></LayoutPrincipal>} />
          <Route path="/checkout-carro" element={<LayoutPrincipal><CheckoutCarro /></LayoutPrincipal>} />
          <Route path="/pagamento" element={<LayoutPrincipal><Pagamento /></LayoutPrincipal>} />
          <Route path="/confirmacao" element={<LayoutPrincipal><Confirmacao /></LayoutPrincipal>} />
          <Route path="/favoritos" element={<LayoutPrincipal><Favoritos /></LayoutPrincipal>} />

          {/* ROTAS DE GESTÃO */}
          <Route path="/gest/*" element={<GestaoRouter />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;