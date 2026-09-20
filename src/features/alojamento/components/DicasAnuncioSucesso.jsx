// src/features/alojamento/components/DicasAnuncioSucesso.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  Eye,
} from 'lucide-react';

const DICAS = [
  {
    id: 'titulo',
    emoji: '✏️',
    titulo: 'Título claro e específico',
    descricao:
      'Use um nome curto que diga exatamente o que é. Ex: "Apartamento T2 vista mar — Mindelo" em vez de "Casa bonita".',
  },
  {
    id: 'fotos',
    emoji: '📸',
    titulo: 'Fotografias reais e completas',
    descricao:
      'Fotos bem iluminadas do espaço verdadeiro, de vários ângulos, incluindo quartos, casa de banho e vista. Evite imagens de banco de imagens.',
  },
  {
    id: 'preco',
    emoji: '💰',
    titulo: 'Preço competitivo para começar',
    descricao:
      'Compare com alojamentos semelhantes na mesma ilha antes de publicar. Um preço inicial ajustado ajuda a conseguir as primeiras reservas e avaliações.',
  },
  {
    id: 'comodidades',
    emoji: '🛎️',
    titulo: 'Comodidades corretas',
    descricao:
      'Marque apenas o que o espaço realmente oferece. Comodidades erradas geram cancelamentos e más avaliações.',
  },
  {
    id: 'localizacao',
    emoji: '📍',
    titulo: 'Descrição da localização',
    descricao:
      'Explique onde fica, o que há por perto (praia, mercado, transportes) e como chegar. Ajuda o hóspede a decidir.',
  },
  {
    id: 'calendario',
    emoji: '📅',
    titulo: 'Calendário sempre atualizado',
    descricao:
      'Bloqueie datas indisponíveis e mantenha o calendário em dia. Isto evita pedidos para datas que já não pode receber.',
  },
  {
    id: 'resposta',
    emoji: '⚡',
    titulo: 'Resposta rápida aos hóspedes',
    descricao:
      'Responder às mensagens em poucas horas transmite confiança e melhora a experiência de quem reserva.',
  },
  {
    id: 'visibilidade',
    emoji: '📈',
    titulo: 'Visibilidade na plataforma',
    descricao:
      'A Morabeza Stay pode dar maior destaque a anúncios com melhor qualidade, preço ajustado, disponibilidade atualizada, boas avaliações e histórico de reservas. Não é um destaque garantido — depende do desempenho real de cada anúncio.',
  },
];

const DicasAnuncioSucesso = ({ defaultOpen = false }) => {
  const { t } = useTranslation();
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <div className="border border-blue-100 bg-blue-50/50 rounded-2xl mb-6 text-left overflow-hidden">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-blue-50 transition-colors"
        aria-expanded={aberto}
        aria-controls="dicas-anuncio-content"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
            <Lightbulb className="text-white" size={18} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-blue-900 leading-tight">
              {t('dicas_anuncio_sucesso_titulo') || 'Dicas para um anúncio de sucesso'}
            </h3>
            <p className="text-[10px] text-blue-700 font-medium mt-0.5">
              {t('dicas_anuncio_sucesso_sub') ||
                'Orientações curtas para melhorar o seu anúncio'}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-blue-700">
          {aberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Conteúdo */}
      {aberto && (
        <div
          id="dicas-anuncio-content"
          className="border-t border-blue-100 px-4 pt-4 pb-5 bg-white/60"
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DICAS.map((d) => (
              <li
                key={d.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="text-lg shrink-0 leading-none mt-0.5">
                  {d.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {t(`dica_${d.id}_titulo`) || d.titulo}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug mt-1">
                    {t(`dica_${d.id}_descricao`) || d.descricao}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Nota honesta (critério de aceitação do item 21 + 22) */}
          <div className="mt-4 pt-3 border-t border-blue-100 flex items-start gap-2">
            <CheckCircle2
              className="text-blue-600 shrink-0 mt-0.5"
              size={14}
            />
            <p className="text-[10px] text-blue-800 leading-snug font-medium">
              {t('dicas_anuncio_nota') ||
                'Estas dicas ajudam a melhorar o anúncio. A Morabeza Stay não garante reservas nem destaque automático — o desempenho depende da qualidade real, do preço e do histórico de cada anúncio.'}
            </p>
          </div>

          {/* Rodapé informativo (não é promessa, é explicação) */}
          <div className="mt-3 flex items-start gap-2">
            <Eye className="text-slate-400 shrink-0 mt-0.5" size={14} />
            <p className="text-[10px] text-slate-500 leading-snug">
              {t('dicas_anuncio_transparencia') ||
                'Alguns anúncios podem receber maior visibilidade conforme a qualidade, o preço, a disponibilidade, as avaliações e o histórico de reservas. Estes fatores são avaliados pela plataforma de forma contínua.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicasAnuncioSucesso;