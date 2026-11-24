import '@fontsource-variable/inter';
import ConfirmarExclusao from '../ConfirmarExclusao';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CarFront, SlidersHorizontal, Shield, Layers, CircleCheck, TriangleAlert, Info } from 'lucide-react';
import ListaAnunciosGestao, { CartaoAnuncioGestao, GrelhaAnunciosGestao, IconeGestao as Icone } from './ListaAnunciosGestao';
import api from '../../api/api';
import { excluirCarro } from '../../services/carroApiService';
import { chaveErroExclusao } from '../../utils/erroExclusao';
import { extrairFotosCarro } from '../../features/carros/utils/fotosCarro';

export default function ListaCarrosUnidades({ carros, usuarioId, onUnidades, onCondicoes, onDeleted }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [fotos, setFotos] = useState({});
  const [contagens, setContagens] = useState({});
  const [aApagar, setAApagar] = useState(null);
  const [erro, setErro] = useState('');
  const [exclusao, setExclusao] = useState(null);
  const deleting = useRef(false);
  const termo = busca.trim().toLocaleLowerCase();
  const filtrados = carros.filter(carro => [carro.titulo, carro.marca, carro.modelo, carro.ilha, carro.localizacao]
    .some(valor => String(valor || '').toLocaleLowerCase().includes(termo)) && (filtro === 'todos' || carro.status === filtro));

  useEffect(() => {
    if (!usuarioId) return;
    const controller = new AbortController();
    Promise.allSettled(carros.filter(carro => !extrairFotosCarro(carro)[0]).map(async carro => {
      try { const { data } = await api.get('/carro/buscar.php', { params: { id: carro.id }, signal: controller.signal });
        if (data.success && String(data.data?.id) === String(carro.id) && !controller.signal.aborted) setFotos(v => ({ ...v, [carro.id]: extrairFotosCarro(data.data)[0] }));
      } catch { /* A missing preview keeps the vehicle icon visible. */ }
    }));
    Promise.allSettled(carros.map(async carro => {
      try {
        const { data } = await api.get('/carro/unidades_listar.php', {
          params: { carro_id: carro.id, usuario_id: usuarioId }, signal: controller.signal,
        });
        if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid units response');
        if (!controller.signal.aborted) setContagens(prev => ({ ...prev, [carro.id]: data.data.length }));
      } catch {
        if (!controller.signal.aborted) setContagens(prev => ({ ...prev, [carro.id]: null }));
      }
    }));
    return () => controller.abort();
  }, [carros, usuarioId]);

  const eliminar = async carro => {
    if (deleting.current) return;
    deleting.current = true; setAApagar(carro.id); setErro('');
    try {
      const data = await excluirCarro(carro.id);
      if (data?.success) { setExclusao(null); onDeleted?.(carro.id); }
      else setErro(chaveErroExclusao(data));
    } catch (err) { setErro(chaveErroExclusao(err.response?.data, err.response?.status)); }
    finally { deleting.current = false; setAApagar(null); }
  };
  return <>

    <ConfirmarExclusao aberto={!!exclusao} nome={exclusao?.titulo} loading={aApagar !== null} erro={erro}
      tituloKey="carro_exclusao_titulo" confirmarKey="carro_exclusao_titulo"
      onClose={() => { if (!deleting.current) setExclusao(null); }} onConfirm={() => { if (exclusao) void eliminar(exclusao); }} />
    <ListaAnunciosGestao icon={CarFront} titulo={t('gest_frota_titulo')} descricao={t('gest_frota_descricao')} subtitulo={t('gest_carros_unidades_meus')} adicionar={t('gest_frota_adicionar')} onAdicionar={() => navigate('/carro-registo/fluxo')} busca={busca} onBusca={setBusca} pesquisa={t('gest_carros_unidades_buscar')} filtro={filtro} onFiltro={setFiltro} filtros={['todos', 'disponivel', 'indisponivel', 'manutencao'].map(value => ({ value, label: t(`gest_lista_estado_${value}`) }))}>
      {!filtrados.length ? <p className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">{t('gest_carros_unidades_sem_resultados')}</p> : <GrelhaAnunciosGestao>{filtrados.map(carro => {
        const quantidade = contagens[carro.id];const incompleto = quantidade === 0;
        const ativo = quantidade > 0 && carro.status === 'disponivel' && carro.status_carro === 'aprovado';
        const titulo = carro.titulo || [carro.marca, carro.modelo].filter(Boolean).join(' ');
        return <CartaoAnuncioGestao key={carro.id} icon={CarFront} imagem={extrairFotosCarro(carro)[0] || fotos[carro.id]} titulo={titulo} localizacao={[carro.ilha, carro.localizacao].filter(Boolean).join(' · ')} preco={`${Number(carro.preco_dia || 0).toLocaleString('pt-PT')} CVE / ${t('dia')}`}
          estado={incompleto || ativo ? { icon: incompleto ? TriangleAlert : CircleCheck, texto: t(incompleto ? 'gest_frota_incompleta' : 'gest_frota_ativo'), cor: incompleto ? 'bg-[#ffe187] text-[#302609]' : 'bg-[#b5f6b5] text-[#164c20]' } : null}
          resumo={<span className="flex items-center gap-2"><Icone icon={Layers} size={22} />{quantidade === undefined ? t('gest_frota_carregar_unidades') : quantidade === null ? t('gest_frota_verificar_unidades') : t('gest_frota_unidades', { count: quantidade })}</span>}
          nota={t(incompleto ? 'gest_frota_adicionar_unidade' : 'gest_frota_consultar_disponibilidade')}
          acoes={[{ label: t('gest_carros_unidades_configurar'), icon: SlidersHorizontal, onClick: () => onUnidades(carro) }, { label: t('gest_carros_unidades_condicoes'), icon: Shield, onClick: () => onCondicoes(carro) }]}
          onVer={() => navigate(carro.slug ? `/carros/${encodeURIComponent(carro.slug)}` : `/carro-registo/detalhes/${carro.id}`)} onEditar={() => navigate(`/carro-registo/editar/${carro.id}`)} onEliminar={() => { setErro('');setExclusao(carro); }} eliminando={aApagar === carro.id} bloquearExclusao={aApagar !== null} />;
      })}</GrelhaAnunciosGestao>}
      <p className="mt-7 flex items-start gap-2.5 text-sm"><Icone icon={Info} size={19} className="text-[#686b84]" />{t('gest_frota_nota_disponibilidade')}</p>
    </ListaAnunciosGestao>
  </>;
}
