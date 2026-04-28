import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './i18n';

// Componentes
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CategoryBar from './components/CategoryBar';
import Hero from './components/Hero';
import CardAlojamento from './components/CardAlojamento';
import PaginaMapa from './pages/PaginaMapa.jsx';
import Experiencias from './pages/Experiencias';
import Alojamentos from './pages/Alojamentos';
import Carros from './pages/Carros'; // Verifique se o ficheiro Carros.jsx existe nesta pasta
import PaginaDetalhes from './pages/PaginaDetalhes';
import ExperienciaDetalhes from './pages/ExperienciaDetalhes';
import TabsComponent from './components/TabsComponent';
import CardGridItem from './components/CardGridItem';
import CardPromocionalBanner from './components/CardPromocionalBanner';
import Footer from './components/Footer';
import Checkout from './pages/Checkout';

// --- COMPONENTE HOME CORRIGIDO ---
const HomeOriginal = ({ alojamentos, carros, experiencias, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <Hero />
      <div className="relative -mt-12 z-40 px-4">
        <SearchBar />
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <CategoryBar />
      </div>

      <main className="max-w-7xl mx-auto py-20 px-6 text-left">
        <div className="flex flex-col mb-12">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
            {t('menu_alojamentos') || 'Alojamentos'}
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
        </div>

        {/* Tabs Component com todos os dados */}
        <TabsComponent 
          alojamentos={alojamentos}
          carros={carros}
          experiencias={experiencias}
        />

        {/* SECÇÃO: ADICIONE AINDA MAIS CONFORTO */}
        <section className="mb-24">
          <div className="flex flex-col mb-8 text-left">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
              Adicione ainda mais conforto à sua estadia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* CARD 1: CARRO */}
            {carros.length > 0 ? (
              <CardGridItem item={carros[0]} />
            ) : (
              <div className="h-[450px] bg-gray-100 animate-pulse rounded-[2.5rem]"></div>
            )}

            {/* CARD 2: EXPERIÊNCIA */}
            {experiencias.length > 0 ? (
              <CardGridItem item={experiencias[0]} />
            ) : (
              <div className="h-[450px] bg-gray-100 animate-pulse rounded-[2.5rem]"></div>
            )}

            {/* CARD 3: BANNER PROMOCIONAL */}
            <CardPromocionalBanner />
          </div>
        </section>

        {/* SECÇÃO 3: BANNER CTA FINAL */}
        <div className="relative rounded-[2.5rem] overflow-hidden h-[300px] flex items-center shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Footer Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"></div>
          <div className="relative z-10 p-12 max-w-lg text-left">
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tighter uppercase italic">
              Encontre o lugar perfeito para se hospedar
            </h2>
            <p className="text-gray-600 mb-8 font-medium">
              Alugue uma casa e tenha uma estadia inesquecível.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2">
              Buscar Alojamentos <span>→</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center opacity-30 font-black uppercase tracking-widest text-xs">
            Carregando dados...
          </div>
        )}
      </main>
    </>
  );
};

// --- ESTRUTURA PRINCIPAL ---
function App() {
  const [alojamentos, setAlojamentos] = useState([]);
  const [carros, setCarros] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Buscar alojamentos
        const alojamentosRes = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        setAlojamentos(Array.isArray(alojamentosRes.data) ? alojamentosRes.data : alojamentosRes.data?.data || []);

        // Buscar carros
        const carrosRes = await axios.get('https://welovepalop.com/api/get_carro.php');
        setCarros(Array.isArray(carrosRes.data) ? carrosRes.data : carrosRes.data?.data || []);

        // Buscar experiências
        const experienciasRes = await axios.get('https://welovepalop.com/api/get_experiencias.php');
        setExperiencias(Array.isArray(experienciasRes.data) ? experienciasRes.data : experienciasRes.data?.data || []);
        
      } catch (err) {
        console.error("Erro na API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#f8f9fc]">
          <Navbar />

          <Routes>
            {/* Rota Home */}
            <Route 
              path="/" 
              element={
                <HomeOriginal 
                  alojamentos={alojamentos}
                  carros={carros}
                  experiencias={experiencias}
                  loading={loading} 
                />
              } 
            />

            <Route path="/checkout" element={<Checkout />} />


            {/* Rotas de Alojamentos */}
            <Route path="/alojamentos" element={<Alojamentos />} />
            <Route path="/alojamento/:id" element={<PaginaDetalhes />} />

            {/* Rotas de Experiências */}
            <Route path="/experiencias" element={<Experiencias />} />
            <Route path="/experiencia/:slug" element={<ExperienciaDetalhes />} />

            {/* Rota de Carros ✨ */}
            <Route path="/carros" element={<Carros />} />

            {/* Rota Mapa */}
            <Route path="/mapa" element={<PaginaMapa />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;