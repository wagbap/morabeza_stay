import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// --- IMPORTA O ROUTER DE GESTÃO ---
import GestaoRouter from './components/gest/GestaoRouter';

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
          {/* ROTAS DE REGISTO (Anúncios) */}
          <Route path="/alojamento-registro/*" element={<AlojamentoRouter />} />
          <Route path="/experiencia-registo/*" element={<ExperienciaRouter />} />
          <Route path="/carro-registo/*" element={<CarroRouter />} />
          
          {/* 1. ROTA DE LOGIN: Totalmente isolada */}
          <Route path="/login" element={<Login />} />

          {/* 2. ROTAS COM LAYOUT COMPLETO (Clientes) */}
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

          {/* 3. ROTAS DE GESTÃO DO ANFITRIÃO (Delega tudo para o GestaoRouter) */}
          <Route path="/gest/*" element={<GestaoRouter />} />

        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;