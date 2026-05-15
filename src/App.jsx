import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PaginaDetalhes from './features/alojamento/components/PaginaDetalhesAlojamnetos1';
import ExperienciaDetalhes from './features/experiencias/components/ExperienciaDetalhes';
import PaginaMapa from './features/alojamento/components/MapaInterativoAlojamentos';
import Checkout from './features/experiencias/components/CheckoutExperiencia';
import Pagamento from './pages/Pagamento';
import Confirmacao from './pages/Confirmacao';

function App() {
  const { alojamentos, carros, experiencias, loading } = useFetchHomeData();

  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#f8f9fc]">
          <Navbar />

          <Routes>
            {/* Home recebe os dados do Hook */}
            <Route path="/" element={
              <Home 
                alojamentos={alojamentos} 
                carros={carros} 
                experiencias={experiencias} 
                loading={loading} 
              />
            } />

            {/* Alojamentos */}
            <Route path="/alojamentos" element={<Alojamentos />} />
            <Route path="/alojamento/:id" element={<PaginaDetalhes />} />

            {/* Experiências */}
            <Route path="/experiencias" element={<Experiencias />} />
            <Route path="/experiencia/:slug" element={<ExperienciaDetalhes />} />

            {/* Outros */}
            <Route path="/carros" element={<Carros />} />
            <Route path="/mapa" element={<PaginaMapa />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pagamento" element={<Pagamento />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;