# AGENTS.md — Morabeza Stay

> Documentação de contexto para agentes de IA e colaboradores.  
> **Leia este arquivo antes de fazer qualquer alteração no projeto.**

---

## 1. Visão do Produto

**Morabeza Stay** é uma plataforma de turismo marketplace focada em Cabo Verde. Conecta viajantes a três verticais:

- **Alojamentos** (500+ listados)
- **Viaturas/Carros** (200+ listados)
- **Experiências** (150+ listadas)

Além do fluxo de descoberta → reserva → pagamento, há:
- Fluxo de onboarding para **anfitriões** (registar alojamento, experiência ou carro)
- **Painel administrativo** completo (`/admin`)
- **Área de gestão** para anfitriões (`/gest`)
- Suporte a **7 idiomas** (PT, EN, FR, ES, DE, IT, CV)

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | React 19 + Vite |
| CSS | Tailwind CSS 4 + PostCSS + Autoprefixer |
| Roteamento | React Router DOM v7 |
| HTTP Client | Axios |
| Estado Global | `useState` + `localStorage` (não usa Redux/Zustand) |
| Mapas | Google Maps API + Mapbox GL + react-map-gl |
| Pagamentos | Stripe (@stripe/react-stripe-js) + PayPal (@paypal/react-paypal-js) |
| Auth | JWT (jwt-decode) + Google OAuth (@react-oauth/google) |
| Internacionalização | i18next + react-i18next + i18next-browser-languagedetector |
| SEO | react-helmet-async |
| Charts | ApexCharts + Recharts |
| Sliders/Carousels | Swiper |
| Range Sliders | rc-slider |
| Ícones | lucide-react |

**Backend:** API externa hospedada em `https://welovepalop.com/api`.

---

## 3. Arquitetura de Pastas

O projeto usa **arquitetura feature-based**. Cada domínio de negócio encapsula seus próprios componentes e hooks.

```
src/
├── pages/              → Páginas estáticas e transversais
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Sobre.jsx
│   ├── Favoritos.jsx
│   ├── Pagamento.jsx
│   ├── Confirmacao.jsx
│   └── PayPalButton.jsx
│
├── features/           → Módulos de domínio (cada um: components + hooks)
│   ├── alojamento/
│   ├── carros/
│   └── experiencias/
│
├── components/         → Componentes globais + fluxos complexos
│   ├── admin/          → Painel administrativo completo
│   ├── AlojamentoRegisto/   → Wizard de registo de alojamento
│   ├── ExperienciaRegisto/  → Wizard de registo de experiência
│   ├── CarroRegisto/        → Wizard de registo de carro
│   ├── gest/           → Router de gestão para anfitriões
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── UserDropdown.jsx
│   └── ...
│
├── api/                → Instâncias axios
│   ├── api.js          → Base URL: https://welovepalop.com/api
│   └── api2.js         → Instância secundária (usar com cautela)
│
├── services/           → Serviços por domínio
│   ├── apiService.js
│   ├── carroApiService.js
│   └── experienciaApiService.js
│
├── hooks/              → Hooks globais reutilizáveis
│   ├── useFetchHomeData.js
│   ├── useFetchData.js
│   ├── useDetalhes.js
│   ├── useFavoritos.js
│   └── useFavoritosDB.js
│
├── locales/            → Traduções (1 arquivo .js por idioma)
│   ├── pt.js, en.js, fr.js, es.js, de.js, ir.js, cv.js
│
├── utils/              → Utilitários
├── assets/             → Imagens, SVGs, fonts
├── App.jsx             → Router principal + LayoutPrincipal
└── i18n.js             → Configuração i18next
```

### Regra de Ouro
> Se um componente/hook é usado por **uma única feature**, ele vive dentro de `src/features/<nome>/`.  
> Se é usado por **múltiplas features ou páginas**, vive em `src/components/` ou `src/hooks/`.

---

## 4. Convenções de Código

### 4.1 Nomenclatura

- **Componentes:** PascalCase (`InfoAlojamento.jsx`, `CheckoutCarro.jsx`)
- **Hooks:** camelCase com prefixo `use` (`useFetchHomeData.js`, `useReserva.js`)
- **Utilitários/Serviços:** camelCase (`apiService.js`, `polyfills.js`)
- **CSS:** Tailwind inline. Evitar arquivos `.css` por componente.
- **Traduções:** Chaves em `snake_case` com prefixo da página (`sobre_valores_titulo`, `alojamento_filtro_preco`)

### 4.2 Tailwind

- Usar **Tailwind CSS 4** (novo engine, sem `tailwind.config.js` tradicional — o arquivo existe mas é minimalista)
- Cores principais do projeto:
  - **Primária:** `blue-600` / `blue-700`
  - **Secundária:** `indigo-600` / `indigo-700`
  - **Background app:** `#f8f9fc` (`bg-[#f8f9fc]`)
  - **Texto:** `gray-900` (títulos), `gray-600` (corpo), `gray-100` (bordas)
- **Nunca** hardcode cor de ícone diretamente no SVG/Lucide. Sempre usar via wrapper CSS:
  ```jsx
  // ❌ Errado
  <Heart className="w-8 h-8 text-blue-600" />
  
  // ✅ Correto
  <div className="text-blue-600 group-hover:text-white transition-colors">
    <Heart className="w-8 h-8" />
  </div>
  ```
- Tokens de hover com `group-hover` são preferidos sobre pseudo-elementos CSS.

### 4.3 i18n (Traduções)

Toda string visível ao usuário **DEVE** usar `useTranslation()`:

```jsx
const { t } = useTranslation();

// Com fallback
<h2>{t('sobre_titulo', 'Sobre Nós')}</h2>
```

Após adicionar uma nova chave no JSX, **adicione-a nos 7 arquivos em `src/locales/`** — mesmo que temporariamente em inglês. Use `pt.js` como referência (idioma base).

### 4.4 Requisição de API

- Use a instância `api` de `src/api/api.js` (já configurada com baseURL):
  ```js
  import api from '../api/api';
  const { data } = await api.get('/alojamentos');
  ```
- Nunca crie instâncias axios soltas. Use `api.js` ou `api2.js` se houver necessidade real.

---

## 5. Fluxos Principais (Não Quebre!)

### 5.1 Fluxo Cliente — Descoberta → Checkout

```
/ → /alojamentos → /alojamentos/:slug → /checkout-alojamento → /pagamento → /confirmacao
/ → /carros      → /carros/:slug      → /checkout-carro      → /pagamento → /confirmacao
/ → /experiencias→ /experiencia/:slug → /checkout-experiancia → /pagamento → /confirmacao
```

**Regras:**
- Cada vertical tem **duas rotas de slug** (`/alojamentos/:slug` e `/alojamento/:slug`) por compatibilidade histórica/SEO. **Nunca remova uma sem redirecionar.**
- O checkout espera dados no `location.state` ou `localStorage`. Verificar `CheckoutAlojamento`, `CheckoutCarro`, `CheckoutExperiancia` antes de alterar.
- Pagamento aceita Stripe + PayPal. O componente `PagamentoWrapper.jsx` gerencia a lógica.

### 5.2 Fluxo Anfitrião — Registo

```
/alojamento-registro/*   → Wizard multi-step (AlojamentoRouter)
/experiencia-registo/*    → Wizard multi-step (ExperienciaRouter)
/carro-registo/*         → Wizard multi-step (CarroRouter)
```

**Regras:**
- Esses são **sub-routers** independentes. Não envolvam com `LayoutPrincipal` (sem Navbar/Footer padrão — têm UI própria).
- Não altere a estrutura de rotas sem verificar os componentes de registo.

### 5.3 Fluxo Admin

```
/admin/login → /admin/dashboard
/admin/reservas, /admin/propriedades, /admin/clientes, /admin/ganhos, etc.
```

**Regras:**
- Admin usa `AdminLayout` (sidebar + header admin). **Não envolva rotas admin com `LayoutPrincipal`.**
- Rotas internas do admin devem usar path **relativo** (ex: `path="dashboard"`), NUNCA absoluto com `/admin/` no meio do `<Route>` — isso quebra o aninhamento do React Router.
  ```jsx
  // ❌ Errado — quebra o AdminLayout
  <Route path="/admin/verificacoes" element={<EmailsVerificados />} />
  
  // ✅ Correto
  <Route path="verificacoes" element={<EmailsVerificados />} />
  ```
- `AdminLogin` é rota separada (sem layout).

### 5.4 Fluxo Gestão

```
/gest/* → GestaoRouter
```
- Área para anfitriões/gestores gerirem os seus anúncios. Tem layout próprio.

---

## 6. Navbar — Comportamento Especial

A `Navbar.jsx` tem **dois modos visuais**:

| Modo | Páginas | Classes CSS |
|------|---------|-------------|
| Transparente | `/`, `/experiencias`, `/alojamentos`, `/carros`, `/sobre` | `absolute top-0 bg-transparent text-white` |
| Sólida | Todas as outras | `relative bg-white shadow-md text-gray-900` |

**Regra:** Ao criar uma nova página pública com hero banner, adicione o pathname em `paginasComHero` no `Navbar.jsx`.

---

## 7. Auth & Segurança

- Auth baseada em **JWT armazenado no localStorage** (chave: `user`).
- Token decodificado via `jwt-decode`.
- **Não é o ideal do ponto de vista de segurança**, mas é o padrão atual. Não mude para cookies/httpOnly sem coordenação com backend.
- Logout: remove `user` do localStorage + reload.
- Google OAuth: `@react-oauth/google` — verificar `LoginGoogle.jsx` e `Login.jsx`.
- `ProtectedRoute.jsx` existe para rotas privadas.

---

## 8. Pagamentos

- **Stripe:** `@stripe/react-stripe-js` + `@stripe/stripe-js` — usado em `Pagamento.jsx` e wrappers.
- **PayPal:** `@paypal/react-paypal-js` — usado em `PayPalButton.jsx`.
- Ambos esperam dados da reserva (valor, moeda, descrição). Verifique os props antes de alterar.

---

## 9. Mapas

- **Google Maps:** `@react-google-maps/api` + `@googlemaps/js-api-loader`
- **Mapbox:** `mapbox-gl` + `react-map-gl`
- Usados em: listagens interativas (`PaginaMapa`, `MapaInterativoExperiencia`, `MapaInterativoCarros`) e páginas de detalhes (`MapLocation`, `MapLocationCarro`).
- Tokens de API provavelmente vêm do backend ou `.env`.

---

## 10. Checklist Antes de Commits

Antes de finalizar qualquer alteração, verifique:

- [ ] **i18n:** Todas as novas strings visíveis têm `t('chave', 'fallback')`?
- [ ] **Traduções:** Adicionou a chave nos 7 arquivos de `src/locales/`?
- [ ] **Tailwind:** Não hardcodeou cores em ícones SVG/Lucide? Usou wrapper CSS?
- [ ] **Roteamento:** Se criou nova rota pública com hero, adicionou em `paginasComHero` no Navbar?
- [ ] **Admin:** Se criou rota dentro de `/admin/*`, usou path **relativo** (sem `/admin/`)?
- [ ] **Layout:** A nova página usa `LayoutPrincipal` quando apropriado?
- [ ] **API:** Usou a instância `api` de `src/api/api.js`?
- [ ] **Scroll:** Ao navegar para nova página, o scroll volta ao topo? (Se não, adicione `window.scrollTo(0,0)` no useEffect da página)

---

## 11. Pontos Fracos Conhecidos (Cuidado!)

1. **Rotas duplicadas:** `/alojamentos/:slug` e `/alojamento/:slug`. Mantenha ambas ou redirecione.
2. **Scroll não reseta** ao trocar de página. Adicione `useEffect(() => window.scrollTo(0,0), [])` em páginas se necessário.
3. **Sem lazy loading / code splitting.** App.jsx carrega tudo de uma vez. Novos imports de página pesada (admin, mapas) aumentam o bundle.
4. **Sem Error Boundaries.** Um erro em qualquer componente derruba a aplicação inteira.
5. **Sem testes automatizados.** Qualquer regressão só é pega manualmente.
6. **BaseURL da API hardcoded.** `api.js` aponta direto para produção. Idealmente deveria vir de `import.meta.env.VITE_API_URL`.

---

## 12. Variáveis de Ambiente

O projeto usa Vite. Variáveis de ambiente devem usar o prefixo `VITE_`:

```env
VITE_API_URL=https://welovepalop.com/api
VITE_STRIPE_PUBLIC_KEY=pk_...
VITE_MAPBOX_TOKEN=...
VITE_GOOGLE_CLIENT_ID=...
```

Acesse via: `import.meta.env.VITE_API_URL`

---

## 13. Comandos Úteis

```bash
# Dev server
npm run dev

# Build produção
npm run build

# Preview build local
npm run preview

# Lint
npm run lint
```

---

## 14. Como Pedir Ajuda ao Agente

Ao pedir modificações, seja específico sobre:
1. **Qual página/componente** está afetado
2. **Qual fluxo** (cliente, admin, anfitrião, checkout)
3. **Se afeta mobile, desktop ou ambos**
4. **Se há nova tradução/string visível**

Exemplo de bom prompt:
> "Na página `/sobre`, seção 'Nossos Valores', o ícone some no hover porque a cor do ícone é a mesma do fundo. Ajuste para que o ícone fique branco no hover."

---

*Última atualização: Jul