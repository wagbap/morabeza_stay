import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './i18n'; // Configuração de tradução

// Componentes
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CategoryBar from './components/CategoryBar';
import Hero from './components/Hero';
import CardAlojamento from './components/CardAlojamento';

// Páginas
import Alojamentos from './pages/Alojamentos';
import PaginaDetalhes from './pages/PaginaDetalhes'; // Adicionado

// --- COMPONENTE HOME ---
const HomeOriginal = ({ alojamentos, loading }) => {
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
            {t('menu_alojamentos')}
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-2"></div>
        </div>
        
        {loading ? (
          <div className="py-20 text-center opacity-30 font-black uppercase tracking-widest text-xs">
            Carregando alojamentos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {alojamentos.length > 0 ? (
              alojamentos.slice(0, 6).map((item) => (
                <CardAlojamento key={item.id} {...item} />
              ))
            ) : (
              <p className="text-gray-400 italic">Nenhum alojamento encontrado.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
};

// --- ESTRUTURA PRINCIPAL ---
function App() {
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('https://welovepalop.com/api/get_alojamentos.php')
      .then(res => {
        setAlojamentos(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Erro na API:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Navbar />

          <Routes>
            {/* Rota Home */}
            <Route path="/" element={<HomeOriginal alojamentos={alojamentos} loading={loading} />} />

            {/* Rota Listagem Completa */}
            <Route path="/alojamentos" element={<Alojamentos />} />

            {/* Rota Detalhes (IMPORTANTE) */}
            <Route path="/alojamento/:id" element={<PaginaDetalhes />} />
          </Routes>

          <footer className="bg-gray-900 text-white py-16 mt-20">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">
                © 2026 MorabezaStay • Cabo Verde Digital
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;