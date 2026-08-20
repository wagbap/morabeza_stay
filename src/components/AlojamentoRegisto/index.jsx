// src/components/AlojamentoRegisto/index.jsx

// ✅ Exportação PADRÃO (default) para o lazy
import AlojamentoRouter from './AlojamentoRouter';
export default AlojamentoRouter;

// ✅ Ou exporte direto:
// export { default } from './AlojamentoRouter';

// ✅ Todas as outras exportações NAMED
export { default as FluxoRegisto } from './FluxoRegisto';
export { default as PropMenu } from './PropMenu';
export { default as SideBar } from './SideBar';
export { default as InformacoesBasicas } from './InformacoesBasicas';
export { default as RegistarLocalizacao } from './RegistarLocalizacao';
export { default as NomePropriedade } from './NomePropriedade';
export { default as Comodidades } from './Comodidades';
export { default as Regras, RegrasResumo } from './Regras';
export { default as ImagensUpload } from './ImagensUpload';
export { default as ProprietarioInfo } from './ProprietarioInfo';
export { default as PrecosDisponibilidade } from './PrecosDisponibilidade';
export { default as ComodidadesLista } from './ComodidadesLista';