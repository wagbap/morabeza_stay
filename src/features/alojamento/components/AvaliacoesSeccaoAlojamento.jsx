import AvaliacoesServico from '../../../components/AvaliacoesServico';

export default function AvaliacoesSeccaoAlojamento({ alojamentoId, ...props }) {
  return <AvaliacoesServico key={alojamentoId} {...props} tipo="alojamento" itemId={alojamentoId} />;
}
