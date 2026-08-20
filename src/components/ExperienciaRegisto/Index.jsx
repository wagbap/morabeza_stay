// src/components/ExperienciaRegisto/index.jsx

// ✅ DEFAULT EXPORT - necessário para o lazy loading
import ExperienciaRouter from './ExperienciaRouter';
export default ExperienciaRouter;

// ✅ NAMED EXPORTS - para uso em outros lugares
export { default as FluxoRegisto } from './FluxoRegisto';
export { default as MeusExperiencias } from './MeusExperiencias';
export { default as EditarExperiencia } from './EditarExperiencia';
export { default as InfoExperiencia } from './InfoExperiencia';

// Componentes de cada etapa
export { default as InformacoesBasicas } from './InformacoesBasicas';
export { default as Localizacao } from './Localizacao';
export { default as Categoria } from './Categoria';
export { default as Inclusoes } from './Inclusoes';
export { default as Requisitos } from './Requisitos';
export { default as Idiomas } from './Idiomas';
export { default as ImagensUpload } from './ImagensUpload';
export { default as Disponibilidade } from './Disponibilidade';