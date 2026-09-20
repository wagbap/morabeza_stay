import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';

// Hooks (mantém import normal - são leves)
import { useFetchHomeData } from './hooks/useFetchHomeData';

// Componentes Globais (import normal - são usados em toda a app)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// === LAZY LOADING PARA PÁGINAS PESADAS ===
// Isso reduz o bundle inicial de 4.2MB para ~500KB

// Páginas principais (lazy)
const Home = lazy(() => import('./pages/Home'));
const Alojamentos = lazy(() => import('./features/alojamento/components/Alojamentos'));
const Carros = lazy(() => import('./features/carros/components/Carros'));
const Experiencias = lazy(() => import('./features/experiencias/components/Experiencias'));
const ExperienciaDetalhes = lazy(() => import('./features/experiencias/components/ExperienciaDetalhes'));
const CarrosDetalhes = lazy(() => import('./features/carros/components/CarrosDetalhes'));
const InfoAlojamento = lazy(() => import('./features/alojamento/components/InfoAlojamento'));
const Login = lazy(() => import('./pages/Login'));
const Favoritos = lazy(() => import('./pages/Favoritos'));
const SobrePage = lazy(() => import('./pages/Sobre'));
const PolicyCancellation = lazy(() => import('./components/PolicyCancellation'));
const TermsConditions = lazy(() => import('./components/TermsConditions'));
const Faq = lazy(() => import('./components/Faq'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

// Páginas de pagamento/checkout (lazy)
const CheckoutExperiancia = lazy(() => import('./features/experiencias/components/CheckoutExperiencia'));
const CheckoutAlojamento = lazy(() => import('./features/alojamento/components/CheckoutAlojamento'));
const CheckoutCarro = lazy(() => import('./features/carros/components/CheckoutCarro'));
const Pagamento = lazy(() => import('./pages/Pagamento'));
const Confirmacao = lazy(() => import('./pages/Confirmacao'));

// Páginas de mapa (lazy)
const PaginaMapa = lazy(() => import('./features/alojamento/components/MapaInterativoAlojamentos'));
const MapaInterativoExperiencia = lazy(() => import('./features/experiencias/components/MapaInterativoExperiencia'));
const MapaInterativoCarros = lazy(() => import('./features/carros/components/MapaInterativoCarros'));

// Rotas específicas (lazy)
const AlojamentoRouter = lazy(() => import('./components/AlojamentoRegisto'));
const ExperienciaRouter = lazy(() => import('./components/ExperienciaRegisto'));
const CarroRouter = lazy(() => import('./components/CarroRegisto'));
const GestaoRouter = lazy(() => import('./components/gest/GestaoRouter'));

// Admin (lazy)
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const PainelControleAdmin = lazy(() => import('./components/admin/PainelControleAdmin'));
const ReservasAdmin = lazy(() => import('./components/admin/ReservasAdmin'));
const PropriedadesAdmin = lazy(() => import('./components/admin/PropriedadesAdmin'));
const ClientesAdmin = lazy(() => import('./components/admin/ClientesAdmin'));
const GanhosAdmin = lazy(() => import('./components/admin/GanhosAdmin'));
const ConfiguracoesAdmin = lazy(() => import('./components/admin/ConfiguracoesAdmin'));
const ConfigRecebimento = lazy(() => import('./components/admin/ConfigRecebimento'));



const Mensagens = lazy(() => import('./components/admin/Mensagens'));
const Pagamentos = lazy(() => import('./components/admin/Pagamentos'));
const Denuncias = lazy(() => import('./components/admin/Denuncias'));
const Relatorios = lazy(() => import('./components/admin/Relatorios'));
const Anfitrioes = lazy(() => import('./components/admin/Anfitrioes'));
const DetalhesConteudo = lazy(() => import('./components/admin/DetalhesConteudo'));
const AdminAnaliseAnuncio = lazy(() => import('./components/admin/AdminAnaliseAnuncio'));
const RepassesAdmin = lazy(() => import('./components/admin/RepassesAdmin'));
const VerificacoesEmail = lazy(() => import('./components/admin/VerificacoesEmail'));
const VerificacoesDocumentos = lazy(() => import('./components/admin/VerificacoesDocumentos'));

// Componente de Loading (fallback)
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Layout Principal memoizado para evitar re-renders desnecessários
const LayoutPrincipal = React.memo(({ children }) => (
  <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
    <Navbar />
    <div className="flex-grow">{children}</div>
    <Footer />
  </div>
));

// Componente Wrapper com Suspense
const withSuspense = (Component) => (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
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
            <Route path="propriedades/:tipo/:id" element={<DetalhesConteudo />} />
            <Route path="analise-anuncio/:tipo/:id" element={<AdminAnaliseAnuncio />} />
            <Route path="clientes" element={<ClientesAdmin />} />
            <Route path="anfitrioes" element={<Anfitrioes />} />
            <Route path="ganhos" element={<GanhosAdmin />} />
            <Route path="repasses" element={<RepassesAdmin />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="/admin/verificacoes-email" element={<VerificacoesEmail />} />
            <Route path="/admin/verificacoes-documentos" element={<VerificacoesDocumentos />} />
            <Route path="mensagens" element={<Mensagens />} />
            <Route path="pagamentos" element={<Pagamentos />} />
            <Route path="denuncias" element={<Denuncias />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="/admin/recebimento" element={<ConfigRecebimento />} />

          </Route>

          {/* ROTAS DE REGISTO */}
          <Route path="/alojamento-registro/*" element={<AlojamentoRouter />} />
          <Route path="/experiencia-registo/*" element={<ExperienciaRouter />} />
          <Route path="/carro-registo/*" element={<CarroRouter />} />

          {/* ROTA DE LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* ROTA SOBRE */}
          <Route path="/sobre" element={
            <LayoutPrincipal>
              <SobrePage />
            </LayoutPrincipal>
          } />

          {/* ROTA POLITICA DE CANCELAMENTO */}
          <Route path="/cancelamento" element={
            <LayoutPrincipal>
              <PolicyCancellation />
            </LayoutPrincipal>
          } />

          {/* ROTA TERMOS DE CONDIÇÕES */}
          <Route path="/termos" element={
            <LayoutPrincipal>
              <TermsConditions />
            </LayoutPrincipal>
          } />

          {/* ROTA PERGUNTAS FREQUENTES */}
          <Route path="/faq" element={
            <LayoutPrincipal>
              <Faq />
            </LayoutPrincipal>
          } />

          {/* ROTA POLITICA DE PRIVACIDADE */}
          <Route path="/privacidade" element={
            <LayoutPrincipal>
              <PrivacyPolicy />
            </LayoutPrincipal>
          } />

          {/* ROTAS DO LAYOUT PRINCIPAL */}
          <Route path="/" element={
            <LayoutPrincipal>
              <Suspense fallback={<LoadingSpinner />}>
                <Home 
                  alojamentos={alojamentos} 
                  carros={carros} 
                  experiencias={experiencias} 
                  loading={loading} 
                />
              </Suspense>
            </LayoutPrincipal>
          } />

          <Route path="/alojamentos" element={
            <LayoutPrincipal>
              <Alojamentos />
            </LayoutPrincipal>
          } />
          
          <Route path="/alojamentos/:slug" element={
            <LayoutPrincipal>
              <InfoAlojamento />
            </LayoutPrincipal>
          } />
          
          <Route path="/alojamento/:slug" element={
            <LayoutPrincipal>
              <InfoAlojamento />
            </LayoutPrincipal>
          } />

          <Route path="/carros" element={
            <LayoutPrincipal>
              <Carros />
            </LayoutPrincipal>
          } />
          
          <Route path="/carros/:slug" element={
            <LayoutPrincipal>
              <CarrosDetalhes />
            </LayoutPrincipal>
          } />
          
          <Route path="/carro/:slug" element={
            <LayoutPrincipal>
              <CarrosDetalhes />
            </LayoutPrincipal>
          } />

          <Route path="/experiencias" element={
            <LayoutPrincipal>
              <Experiencias />
            </LayoutPrincipal>
          } />
          
          <Route path="/experiencia/:slug" element={
            <LayoutPrincipal>
              <ExperienciaDetalhes />
            </LayoutPrincipal>
          } />
          
          <Route path="/mapa" element={
            <LayoutPrincipal>
              <PaginaMapa />
            </LayoutPrincipal>
          } />
          
          <Route path="/mapa-experiencias" element={
            <LayoutPrincipal>
              <MapaInterativoExperiencia />
            </LayoutPrincipal>
          } />
          
          <Route path="/mapa-carros" element={
            <LayoutPrincipal>
              <MapaInterativoCarros />
            </LayoutPrincipal>
          } />
          
          <Route path="/checkout-experiancia" element={
            <LayoutPrincipal>
              <CheckoutExperiancia />
            </LayoutPrincipal>
          } />
          
          <Route path="/checkout-alojamento" element={
            <LayoutPrincipal>
              <CheckoutAlojamento />
            </LayoutPrincipal>
          } />
          
          <Route path="/checkout-carro" element={
            <LayoutPrincipal>
              <CheckoutCarro />
            </LayoutPrincipal>
          } />
          
          <Route path="/pagamento" element={
            <LayoutPrincipal>
              <Pagamento />
            </LayoutPrincipal>
          } />
          
          <Route path="/confirmacao" element={
            <LayoutPrincipal>
              <Confirmacao />
            </LayoutPrincipal>
          } />
          
          <Route path="/favoritos" element={
            <LayoutPrincipal>
              <Favoritos />
            </LayoutPrincipal>
          } />

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