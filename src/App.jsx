import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <- Importado o Navigate aqui
import { HelmetProvider } from 'react-helmet-async';
import './i18n'; // Importa a configuração do i18n

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
// --- IMPORTA O ROUTER DE GESTÃO ---
import GestaoRouter from './components/gest/GestaoRouter';



import EmailsVerificados from './components/admin/EmailsVerificados';
import Mensagens from './components/admin/Mensagens';
import Pagamentos from './components/admin/Pagamentos';
import Denuncias from './components/admin/Denuncias';
import Relatorios from './components/admin/Relatorios';
import Anfitrioes from './components/admin/Anfitrioes';
import DetalhesConteudo from './components/admin/DetalhesConteudo';

// Adicione as rotas:



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
        {/* APENAS UM BLOCO ROUTES PARA TODO O PROJETO */}
        <Routes>
          
          {/* =========================================================
              1. ROTAS DO PAINEL ADMINISTRATIVO (ADMIN)
             ========================================================= */}
          {/* Rota de Login Isolada (Ecrã inteiro, sem sidebar) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Rotas protegidas envolvidas pelo AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Se o admin aceder a '/admin', vai direto para o dashboard */}
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

          {/* =========================================================
              2. ROTAS DE REGISTO / PARCEIROS (ANÚNCIOS)
             ========================================================= */}
          <Route path="/alojamento-registro/*" element={<AlojamentoRouter />} />
          <Route path="/experiencia-registo/*" element={<ExperienciaRouter />} />
          <Route path="/carro-registo/*" element={<CarroRouter />} />

          {/* =========================================================
              3. ROTA DE LOGIN GERAL (CLIENTES/PARCEIROS)
             ========================================================= */}
          <Route path="/login" element={<Login />} />

          {/* =========================================================
              4. ROTAS DO LAYOUT PRINCIPAL (PORTAL CLIENTES)
             ========================================================= */}
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

          {/* =========================================================
              5. ROTAS DE GESTÃO DO ANFITRIÃO / PARCEIRO
             ========================================================= */}
          <Route path="/gest/*" element={<GestaoRouter />} />

          {/* Fallback de segurança: Se a rota não existir em lado nenhum, manda para a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;