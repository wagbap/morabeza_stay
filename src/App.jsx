import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
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


import ReactDOM from 'react-dom/client';
import './i18n'; // Importa a configuração do i18n

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import InfoAlojamento from './features/alojamento/components/InfoAlojamento';

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
           <Route path="/alojamentos/:slug" element={<InfoAlojamento />} />
           <Route path="/alojamento/:slug" element={<InfoAlojamento />} />

           {/* Carros */}
           <Route path="/carros" element={<Carros />} />
           <Route path="/carros/:slug" element={<CarrosDetalhes />} />
           <Route path="/carro/:slug" element={<CarrosDetalhes />} />

            {/* Experiências */}
            <Route path="/experiencias" element={<Experiencias />} />
            <Route path="/experiencia/:slug" element={<ExperienciaDetalhes />} />

            {/* Outros */}
            <Route path="/mapa" element={<PaginaMapa />} />
            <Route path="/mapa-experiencias" element={<MapaInterativoExperiencia />} />
            <Route path="/mapa-carros" element={<MapaInterativoCarros/>} />
            <Route path="/checkout-experiancia" element={<CheckoutExperiancia />} />
            <Route path="/checkout-alojamento" element={<CheckoutAlojamento />} />
            <Route path="/checkout-carro" element={<CheckoutCarro />} />
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