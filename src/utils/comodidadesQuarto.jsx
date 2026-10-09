// src/utils/comodidadesQuarto.jsx
import React from 'react';
import {
  Snowflake, Flame, Fan, Wifi, Tv, Lock, Refrigerator, Wine, Microwave,
  Coffee, Shirt, Wind, Bed, Package, BookOpen, Moon, Shield, Baby, Zap,
  Sun, DoorOpen, Utensils, Waves, Building, Mountain, Bath, ShowerHead,
  Droplets, Sparkles, Scroll, Users, Check,
} from 'lucide-react';

// ============================================================
// LISTA OFICIAL DE COMODIDADES DE QUARTO
// ============================================================
export const COMODIDADES_QUARTO = [
  { id: 'ar_condicionado',     nome: 'Ar condicionado',                icone: 'snowflake',    categoria: 'Climatização' },
  { id: 'aquecimento',         nome: 'Aquecimento',                    icone: 'flame',        categoria: 'Climatização' },
  { id: 'ventilador',          nome: 'Ventilador',                     icone: 'fan',          categoria: 'Climatização' },

  { id: 'wifi',                nome: 'Wi-Fi',                          icone: 'wifi',         categoria: 'Internet e tecnologia' },
  { id: 'tv',                  nome: 'TV',                             icone: 'tv',           categoria: 'Internet e tecnologia' },
  { id: 'tv_cabo',             nome: 'TV por cabo',                    icone: 'tv',           categoria: 'Internet e tecnologia' },
  { id: 'tomadas_cama',        nome: 'Tomadas próximas da cama',       icone: 'zap',          categoria: 'Internet e tecnologia' },

  { id: 'cofre',               nome: 'Cofre',                          icone: 'lock',         categoria: 'Segurança' },

  { id: 'frigorifico',         nome: 'Frigorífico',                    icone: 'refrigerator', categoria: 'Cozinha' },
  { id: 'mini_bar',            nome: 'Mini-bar',                       icone: 'wine',         categoria: 'Cozinha' },
  { id: 'microondas',          nome: 'Micro-ondas',                    icone: 'microwave',    categoria: 'Cozinha' },
  { id: 'maquina_cafe',        nome: 'Máquina de café',                icone: 'coffee',       categoria: 'Cozinha' },
  { id: 'chaleira',            nome: 'Chaleira elétrica',              icone: 'coffee',       categoria: 'Cozinha' },
  { id: 'cozinha_privativa',   nome: 'Cozinha privativa',              icone: 'utensils',     categoria: 'Cozinha' },
  { id: 'kitchenette',         nome: 'Kitchenette',                    icone: 'utensils',     categoria: 'Cozinha' },

  { id: 'ferro_engomar',       nome: 'Ferro de engomar',               icone: 'flame',        categoria: 'Utilidades' },
  { id: 'tabua_engomar',       nome: 'Tábua de engomar',               icone: 'shirt',        categoria: 'Utilidades' },
  { id: 'maq_lavar_roupa',     nome: 'Máquina de lavar roupa',         icone: 'shirt',        categoria: 'Utilidades' },
  { id: 'secador',             nome: 'Secador de cabelo',              icone: 'wind',         categoria: 'Utilidades' },

  { id: 'toalhas_roupa',       nome: 'Toalhas e roupa de cama',        icone: 'bed',          categoria: 'Roupa de cama e quarto' },
  { id: 'armario',             nome: 'Armário',                        icone: 'package',      categoria: 'Roupa de cama e quarto' },
  { id: 'cabides',             nome: 'Cabides',                        icone: 'shirt',        categoria: 'Roupa de cama e quarto' },
  { id: 'secretaria',          nome: 'Secretária',                     icone: 'bookOpen',     categoria: 'Roupa de cama e quarto' },
  { id: 'cortinas_blackout',   nome: 'Cortinas blackout',              icone: 'moon',         categoria: 'Roupa de cama e quarto' },
  { id: 'mosquiteiro',         nome: 'Mosquiteiro',                    icone: 'shield',       categoria: 'Roupa de cama e quarto' },

  { id: 'berco',               nome: 'Berço',                          icone: 'baby',         categoria: 'Família' },
  { id: 'cama_extra',          nome: 'Cama extra',                     icone: 'bed',          categoria: 'Família' },

  { id: 'varanda_privada',     nome: 'Varanda privada',                icone: 'sun',          categoria: 'Espaço exterior' },
  { id: 'terraco_privado',     nome: 'Terraço privado',                icone: 'sun',          categoria: 'Espaço exterior' },
  { id: 'entrada_privada',     nome: 'Entrada privada',                icone: 'doorOpen',     categoria: 'Espaço exterior' },

  { id: 'vista_mar',           nome: 'Vista para o mar',               icone: 'waves',        categoria: 'Vistas' },
  { id: 'vista_cidade',        nome: 'Vista para a cidade',            icone: 'building',     categoria: 'Vistas' },
  { id: 'vista_montanha',      nome: 'Vista para a montanha',          icone: 'mountain',     categoria: 'Vistas' },

  { id: 'wc_privativa',        nome: 'Casa de banho privativa',        icone: 'bath',         categoria: 'Casa de banho' },
  { id: 'wc_no_quarto',        nome: 'Casa de banho dentro do quarto', icone: 'bath',         categoria: 'Casa de banho' },
  { id: 'wc_partilhada',       nome: 'Casa de banho partilhada',       icone: 'users',        categoria: 'Casa de banho' },
  { id: 'duche',               nome: 'Duche',                          icone: 'showerHead',   categoria: 'Casa de banho' },
  { id: 'banheira',            nome: 'Banheira',                       icone: 'bath',         categoria: 'Casa de banho' },
  { id: 'agua_quente',         nome: 'Água quente',                    icone: 'droplets',     categoria: 'Casa de banho' },
  { id: 'produtos_higiene',    nome: 'Produtos de higiene',            icone: 'sparkles',     categoria: 'Casa de banho' },
  { id: 'papel_higienico',     nome: 'Papel higiénico',                icone: 'scroll',       categoria: 'Casa de banho' },
];

// ============================================================
// MAPA DE ÍCONES
// ============================================================
const ICONES = {
  snowflake:    <Snowflake size={18} />,
  flame:        <Flame size={18} />,
  fan:          <Fan size={18} />,
  wifi:         <Wifi size={18} />,
  tv:           <Tv size={18} />,
  lock:         <Lock size={18} />,
  refrigerator: <Refrigerator size={18} />,
  wine:         <Wine size={18} />,
  microwave:    <Microwave size={18} />,
  coffee:       <Coffee size={18} />,
  zap:          <Zap size={18} />,
  shirt:        <Shirt size={18} />,
  wind:         <Wind size={18} />,
  bed:          <Bed size={18} />,
  package:      <Package size={18} />,
  bookOpen:     <BookOpen size={18} />,
  moon:         <Moon size={18} />,
  shield:       <Shield size={18} />,
  baby:         <Baby size={18} />,
  sun:          <Sun size={18} />,
  doorOpen:     <DoorOpen size={18} />,
  utensils:     <Utensils size={18} />,
  waves:        <Waves size={18} />,
  building:     <Building size={18} />,
  mountain:     <Mountain size={18} />,
  bath:         <Bath size={18} />,
  users:        <Users size={18} />,
  showerHead:   <ShowerHead size={18} />,
  droplets:     <Droplets size={18} />,
  sparkles:     <Sparkles size={18} />,
  scroll:       <Scroll size={18} />,
};

// ============================================================
// HELPER: normalizar strings (tira acentos e maiúsculas)
// ============================================================
const normalizar = (str) =>
  String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// ============================================================
// FUNÇÃO PÚBLICA — devolve o ícone para qualquer comodidade
// ============================================================
export const getIconeComodidade = (nome, size = 18) => {
  const n = normalizar(nome);

  // 1) Procura na lista oficial (por nome ou por id)
  const encontrada = COMODIDADES_QUARTO.find(
    (c) => normalizar(c.nome) === n || normalizar(c.id) === n
  );
  if (encontrada) {
    const Icone = ICONES[encontrada.icone];
    if (Icone) return React.cloneElement(Icone, { size });
  }

  // 2) Fallback por palavras-chave
  const mapa = [
    [/wifi|wi-fi|internet/,             'wifi'],
    [/ar[- ]?condicionado/,             'snowflake'],
    [/aquecimento/,                     'flame'],
    [/ventilador/,                      'fan'],
    [/tv|televis/,                      'tv'],
    [/cofre|seguranca/,                 'lock'],
    [/frigorifico|geladeira/,           'refrigerator'],
    [/mini[- ]?bar/,                    'wine'],
    [/micro[- ]?ondas/,                 'microwave'],
    [/maquina de cafe|cafe/,            'coffee'],
    [/chaleira/,                        'coffee'],
    [/cozinha|kitchenette/,             'utensils'],
    [/ferro/,                           'flame'],
    [/tabua/,                           'shirt'],
    [/lavar roupa/,                     'shirt'],
    [/secador/,                         'wind'],
    [/toalha|roupa de cama/,            'bed'],
    [/armario/,                         'package'],
    [/cabide/,                          'shirt'],
    [/secretaria/,                      'bookOpen'],
    [/cortina|blackout/,                'moon'],
    [/mosquiteiro/,                     'shield'],
    [/berco/,                           'baby'],
    [/cama extra/,                      'bed'],
    [/varanda|terraco/,                 'sun'],
    [/entrada privada/,                 'doorOpen'],
    [/vista.*mar/,                      'waves'],
    [/vista.*cidade/,                   'building'],
    [/vista.*montanha/,                 'mountain'],
    [/banheira/,                        'bath'],
    [/duche/,                           'showerHead'],
    [/agua quente/,                     'droplets'],
    [/produtos de higiene/,             'sparkles'],
    [/papel higienico/,                 'scroll'],
    [/casa de banho|wc|banheiro/,       'bath'],
    [/partilhada/,                      'users'],
    [/cama/,                            'bed'],
  ];

  for (const [regex, iconeKey] of mapa) {
    if (regex.test(n)) {
      const Icone = ICONES[iconeKey];
      if (Icone) return React.cloneElement(Icone, { size });
    }
  }

  return <Check size={size} />;
};

// ============================================================
// CATEGORIAS (ordem de apresentação)
// ============================================================
export const CATEGORIAS_COMODIDADES = [
  'Climatização',
  'Internet e tecnologia',
  'Segurança',
  'Cozinha',
  'Utilidades',
  'Roupa de cama e quarto',
  'Família',
  'Espaço exterior',
  'Vistas',
  'Casa de banho',
];