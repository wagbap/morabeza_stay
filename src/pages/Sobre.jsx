import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Users, Heart, Award, Globe, MapPin, Coffee, Shield, Star } from 'lucide-react';

const SobrePage = () => {
  const { t } = useTranslation();

  // Valores da empresa
  const valores = [
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: t('sobre_valor1_titulo', 'Paixão por Cabo Verde'),
      description: t('sobre_valor1_desc', 'Amamos partilhar as belezas e cultura das ilhas com cada visitante.')
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: t('sobre_valor2_titulo', 'Confiança e Segurança'),
      description: t('sobre_valor2_desc', 'Todas as nossas propriedades e serviços são verificados e garantidos.')
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: t('sobre_valor3_titulo', 'Experiência Local'),
      description: t('sobre_valor3_desc', 'Trabalhamos com anfitriões locais para oferecer autenticidade.')
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: t('sobre_valor4_titulo', 'Qualidade Garantida'),
      description: t('sobre_valor4_desc', 'Selecionamos cuidadosamente cada experiência e alojamento.')
    }
  ];

  // Estatísticas
  const estatisticas = [
    { numero: '500+', label: t('sobre_stats_alojamentos', 'Alojamentos') },
    { numero: '200+', label: t('sobre_stats_carros', 'Viaturas') },
    { numero: '150+', label: t('sobre_stats_experiencias', 'Experiências') },
    { numero: '10K+', label: t('sobre_stats_clientes', 'Clientes Satisfeitos') }
  ];

  return (
    <>
      <Helmet>
        <title>{t('sobre_titulo', 'Sobre Nós')} | Morabeza Stay</title>
        <meta name="description" content={t('sobre_descricao', 'Conheça a Morabeza Stay, a sua plataforma de turismo em Cabo Verde.')} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
              {t('sobre_hero_titulo', 'Sobre a Morabeza Stay')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('sobre_hero_desc', 'A tua porta de entrada para experiências inesquecíveis em Cabo Verde')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-blue-200">
                <MapPin size={20} />
                <span>{t('sobre_hero_local', 'Praia, Cabo Verde')}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Coffee size={20} />
                <span>{t('sobre_hero_cultura', 'Cultura & Hospitalidade')}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Globe size={20} />
                <span>{t('sobre_hero_impacto', 'Impacto Local')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm font-black text-blue-600 uppercase tracking-wider">
                {t('sobre_historia_tag', 'Nossa História')}
              </span>
              <h2 className="text-4xl font-bold mt-3 mb-6 text-gray-900">
                {t('sobre_historia_titulo', 'Uma História de Hospitalidade Cabo-verdiana')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t('sobre_historia_p1', 'A Morabeza Stay nasceu do amor por Cabo Verde e do desejo de conectar viajantes a experiências autênticas nas ilhas. Fundada em 2023, a nossa plataforma cresceu rapidamente, tornando-se referência no turismo local.')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('sobre_historia_p2', 'Acreditamos que cada viagem deve ser única, e por isso trabalhamos com anfitriões locais que partilham a verdadeira essência da morabeza - a hospitalidade calorosa que caracteriza o povo cabo-verdiano.')}
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4">🏝️</div>
                  <p className="text-2xl font-black text-gray-800">Morabeza Stay</p>
                  <p className="text-gray-600">{t('sobre_historia_legenda', 'O coração de Cabo Verde')}</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                <Heart size={32} />
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-sm font-black text-blue-600 uppercase tracking-wider">
                {t('sobre_valores_tag', 'Nossos Valores')}
              </span>
              <h2 className="text-4xl font-bold mt-3 text-gray-900">
                {t('sobre_valores_titulo', 'O Que Nos Move')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                {t('sobre_valores_desc', 'Princípios que guiam cada decisão e interação na Morabeza Stay.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valores.map((valor, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <div className="group-hover:text-white transition-colors duration-300">
                      {valor.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {valor.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {valor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {estatisticas.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-black mb-2">
                    {stat.numero}
                  </div>
                  <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Missão e Visão */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {t('sobre_missao', 'Nossa Missão')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('sobre_missao_desc', 'Transformar a experiência turística em Cabo Verde, oferecendo uma plataforma segura e confiável que conecta viajantes a anfitriões locais, promovendo o desenvolvimento sustentável das comunidades.')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {t('sobre_visao', 'Nossa Visão')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('sobre_visao_desc', 'Ser a principal plataforma de turismo em Cabo Verde, reconhecida pela qualidade dos serviços, autenticidade das experiências e impacto positivo na economia local.')}
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('sobre_cta_titulo', 'Pronto para Descobrir Cabo Verde?')}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {t('sobre_cta_desc', 'Explore os melhores alojamentos, viaturas e experiências que as ilhas têm para oferecer.')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/alojamentos" 
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 hover:shadow-xl"
              >
                {t('sobre_cta_btn1', 'Ver Alojamentos')}
              </a>
              <a 
                href="/experiencias" 
                className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-lg shadow-gray-100 hover:shadow-xl"
              >
                {t('sobre_cta_btn2', 'Explorar Experiências')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SobrePage;