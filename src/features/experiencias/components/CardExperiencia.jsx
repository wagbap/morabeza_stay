import React, { useEffect, useState } from 'react';
import { Clock, Users, Tag, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CardOferta from '../../../components/CardOferta';
import { requestApiJson } from '../../../services/apiJson';

const CardExperiencia = (props) => {
  const { t } = useTranslation();
  const dados = props.experiencia || props;
  const [cadastro, setCadastro] = useState(null);
  useEffect(() => {
    if (!dados.id) return;
    const controller = new AbortController();
    requestApiJson('/experiencia/buscar.php', { params: { id: dados.id }, signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted && response?.success && String(response.data?.id) === String(dados.id)) {
          setCadastro(response.data);
        }
      }).catch(() => {});
    return () => controller.abort();
  }, [dados.id]);
  const confirmado = cadastro && String(cadastro.id) === String(dados.id) ? cadastro : null;
  const equipamento = confirmado?.modelo_reserva === 'por_equipamento';
  const participante = confirmado?.modelo_reserva === 'por_pessoa';
  const grupo = confirmado?.modelo_reserva === 'grupo_privado';
  // Equipment prices belong to duration configurations, not the legacy
  // per-person price (which is intentionally stored as zero).
  const preco = equipamento ? null : grupo ? dados.preco_grupo : confirmado?.preco ?? dados.preco ?? dados.preco_pessoa;
  return <CardOferta {...dados}
    basePath="/experiencia" tipoFavorito="experiencia" periodo={grupo ? 'experiencia_card_unidade_grupo' : 'por_pessoa'}
    precoSobConsulta={!confirmado || equipamento || preco == null}
    precoConsultaLabel={equipamento ? t('experiencia_card_ver_precos_duracoes', 'Ver preços e durações') : t('experiencia_card_consultar_precos', 'Consultar preços')}
    titulo={dados.titulo || t('experiencia')}
    tipo={dados.categoria_nome || t('experiencia')}
    localizacao={dados.localizacao || dados.ilha}
    imagem_url={dados.imagem_principal || dados.imagem_url}
    preco_noite={preco}
    preco_mostrar={preco}
    estrelas={dados.rating ?? dados.estrelas}
    total_avaliacoes={dados.total_reviews ?? dados.total_avaliacoes}
    facts={[
      { icon: Clock, text: dados.duracao || t('flexivel') },
      { icon: Users, text: dados.max_pessoas ? `${dados.max_pessoas} ${t('pessoas')}` : '\u2014' },
      { icon: Tag, text: dados.categoria_nome || t('experiencia') },
      ...((equipamento || participante || grupo) ? [{ icon: equipamento ? Waves : Users,
        text: equipamento ? t('experiencia_card_por_equipamento', 'Por equipamento e duração')
          : grupo ? t('experiencia_card_por_grupo', 'Por grupo')
            : t('experiencia_card_por_participante', 'Por participante') }] : []),
    ]}
  />;
};
export default CardExperiencia;
