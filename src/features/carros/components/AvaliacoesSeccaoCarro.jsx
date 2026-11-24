import AvaliacoesServico from '../../../components/AvaliacoesServico';

export default function AvaliacoesSeccaoCarro({ carroId, ...props }) {
  return <AvaliacoesServico key={carroId} {...props} tipo="carro" itemId={carroId} />;
}
