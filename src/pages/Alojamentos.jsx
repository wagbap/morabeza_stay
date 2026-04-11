import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Importação dos componentes necessários
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import CategoryBar from '../components/CategoryBar';
import CardAlojamento from '../components/CardAlojamento';

const Alojamentos = () => {
  const { t } = useTranslation();
  const [alojamentos, setAlojamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        // URL da tua API
        const response = await axios.get('https://welovepalop.com/api/get_alojamentos.php');
        setAlojamentos(response.data);
      } catch (error) {
        console.error("Erro ao carregar alojamentos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Helmet>
        <title>MorabezaStay | {t('menu_alojamentos', 'Alojamentos')}</title>
      </Helmet>

      {/* Hero Section */}
      <div className="bg-white pb-12">
        <Hero />
        <div className="px-4 -mt-8 relative z-10">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Barra de Categorias */}
        <CategoryBar />

        {/* Listagem */}
        <div className="mt-12 text-left">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
              {t('explorar', 'Explorar Estadias')}
            </h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {alojamentos.length} {t('alojamentos_encontrados', 'alojamentos encontrados')}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20">
              <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
              <p className="font-black uppercase tracking-widest text-[10px]">Sincronizando com a base de dados...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {alojamentos.length > 0 ? (
                alojamentos.map(casa => (
                  <CardAlojamento key={casa.id} {...casa} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Nenhum alojamento encontrado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ESTA LINHA É A MAIS IMPORTANTE: Resolve o erro "does not provide an export named default"
export default Alojamentos;