// src/components/CarroRegisto/index.jsx

// ✅ Exportação PADRÃO (default) para o lazy loading
import CarroRouter from './CarroRouter';
export default CarroRouter;

// ✅ Ou simplesmente:
// export { default } from './CarroRouter';

// ✅ Todas as outras exportações NAMED
export { default as FluxoRegisto } from './FluxoRegisto';
export { default as MeusCarros } from './MeusCarros';
export { default as EditarCarro } from './EditarCarro';
export { default as InfoCarro } from './InfoCarro';
export { default as InformacoesBasicas } from './InformacoesBasicas';
export { default as Especificacoes } from './Especificacoes';
export { default as Localizacao } from './Localizacao';
export { default as Caracteristicas } from './Caracteristicas';
export { default as ImagensUpload } from './ImagensUpload';