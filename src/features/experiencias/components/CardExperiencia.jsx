import React from 'react';
import { Clock, Users, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CardOferta from '../../../components/CardOferta';

const CardExperiencia = (props) => {
  const { t } = useTranslation();
  const dados = props.experiencia || props;
  return <CardOferta {...dados}
    basePath="/experiencia" tipoFavorito="experiencia" periodo="por_pessoa"
    titulo={dados.titulo || t('experiencia')}
    tipo={dados.categoria_nome || t('experiencia')}
    localizacao={dados.localizacao || dados.ilha}
    imagem_url={dados.imagem_principal || dados.imagem_url}
    preco_noite={dados.preco ?? dados.preco_pessoa}
    estrelas={dados.rating ?? dados.estrelas}
    total_avaliacoes={dados.total_reviews ?? dados.total_avaliacoes}
    facts={[
      { icon: Clock, text: dados.duracao || t('flexivel') },
      { icon: Users, text: dados.max_pessoas ? `${dados.max_pessoas} ${t('pessoas')}` : '\u2014' },
      { icon: Tag, text: dados.categoria_nome || t('experiencia') },
    ]}
  />;
};
export default CardExperiencia;
