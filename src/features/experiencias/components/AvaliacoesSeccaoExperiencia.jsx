import AvaliacoesServico from '../../../components/AvaliacoesServico';

export default function AvaliacoesSeccaoExperiencia({ experienciaId, ...props }) {
  return <AvaliacoesServico key={experienciaId} {...props} tipo="experiencia" itemId={experienciaId} />;
}
