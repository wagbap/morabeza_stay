// src/components/AlojamentoRegisto/Regras.jsx
import React, { useState } from 'react';
import { Clock, Ban, Moon, Baby, Volume2, Users, Car, AlertCircle, Check, X } from 'lucide-react';

// Regras da casa pré-definidas
export const REGRAS_PADRAO = [
  { 
    id: 1, 
    titulo: 'Check-in flexível', 
    descricao: 'Check-in: 15:00 - 22:00', 
    icone: 'clock', 
    ativo: true, 
    obrigatorio: true,
    detalhes: 'O hóspede pode fazer check-in entre as 15:00 e as 22:00'
  },
  { 
    id: 2, 
    titulo: 'Check-out', 
    descricao: 'Check-out: até às 11:00', 
    icone: 'clock', 
    ativo: true, 
    obrigatorio: true,
    detalhes: 'A saída deve ser feita até as 11:00'
  },
  { 
    id: 3, 
    titulo: 'Proibido fumar', 
    descricao: 'Não é permitido fumar no interior da propriedade', 
    icone: 'ban', 
    ativo: true, 
    obrigatorio: false,
    detalhes: 'É permitido fumar apenas nas áreas externas'
  },
  { 
    id: 4, 
    titulo: 'Proibido festas', 
    descricao: 'Não são permitidas festas ou eventos', 
    icone: 'volume2', 
    ativo: true, 
    obrigatorio: false,
    detalhes: 'Eventos com mais de 10 pessoas não são permitidos'
  },
  { 
    id: 5, 
    titulo: 'Animais de estimação', 
    descricao: 'Animais de estimação são permitidos', 
    icone: 'baby', 
    ativo: false, 
    obrigatorio: false,
    detalhes: 'É permitido animais de pequeno porte, mediante acordo'
  },
  { 
    id: 6, 
    titulo: 'Horário de silêncio', 
    descricao: 'Silêncio após as 22:00', 
    icone: 'moon', 
    ativo: true, 
    obrigatorio: false,
    detalhes: 'Manter o silêncio entre 22:00 e 08:00'
  },
  { 
    id: 7, 
    titulo: 'Crianças e camas extra', 
    descricao: 'Crianças de todas as idades são bem-vindas', 
    icone: 'users', 
    ativo: true, 
    obrigatorio: false,
    detalhes: 'Berço disponível mediante solicitação'
  },
  { 
    id: 8, 
    titulo: 'Estacionamento', 
    descricao: 'Estacionamento gratuito no local', 
    icone: 'car', 
    ativo: true, 
    obrigatorio: false,
    detalhes: 'Estacionamento privado e gratuito'
  },
  { 
    id: 9, 
    titulo: 'Self check-in', 
    descricao: 'Check-in autónomo com cofre de chaves', 
    icone: 'clock', 
    ativo: false, 
    obrigatorio: false,
    detalhes: 'Instruções enviadas 24h antes'
  },
  { 
    id: 10, 
    titulo: 'Permite estadias longas', 
    descricao: 'Aceita estadias superiores a 28 dias', 
    icone: 'calendar', 
    ativo: false, 
    obrigatorio: false,
    detalhes: 'Desconto especial para estadias longas'
  },
];

const getRegraIcone = (iconeNome) => {
  const icons = {
    clock: <Clock size={20} />,
    ban: <Ban size={20} />,
    moon: <Moon size={20} />,
    baby: <Baby size={20} />,
    volume2: <Volume2 size={20} />,
    users: <Users size={20} />,
    car: <Car size={20} />,
    calendar: <Clock size={20} />,
  };
  return icons[iconeNome] || <AlertCircle size={20} />;
};

const Regras = ({ 
  regrasSelecionadas, 
  onRegraToggle, 
  regrasAdicionais = '', 
  onRegrasAdicionaisChange,
  readOnly = false 
}) => {
  const [busca, setBusca] = useState('');
  const [expandirDetalhes, setExpandirDetalhes] = useState({});
  
  const regrasFiltradas = regrasSelecionadas.filter(regra => {
    if (busca && !regra.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });
  
  const isSelecionada = (id) => regrasSelecionadas.some(r => r.id === id && r.ativo);
  
  const toggleDetalhes = (id) => {
    setExpandirDetalhes(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  return (
    <div className="space-y-6">
      {/* Barra de pesquisa */}
      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar regras..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          disabled={readOnly}
        />
        <AlertCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* Lista de regras */}
      <div className="space-y-3">
        {regrasFiltradas.map(regra => (
          <div
            key={regra.id}
            className={`border rounded-lg transition-all ${
              isSelecionada(regra.id) 
                ? 'border-[#006ce4] bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            } ${readOnly ? 'cursor-default' : ''}`}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`${isSelecionada(regra.id) ? 'text-[#006ce4]' : 'text-gray-500'}`}>
                  {getRegraIcone(regra.icone)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{regra.titulo}</p>
                    {regra.obrigatorio && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Obrigatório</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{regra.descricao}</p>
                  
                  {/* Detalhes adicionais */}
                  {expandirDetalhes[regra.id] && regra.detalhes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <span className="font-medium">📋 Detalhes:</span> {regra.detalhes}
                    </div>
                  )}
                  
                  {regra.detalhes && (
                    <button
                      type="button"
                      onClick={() => toggleDetalhes(regra.id)}
                      className="mt-1 text-xs text-[#006ce4] hover:underline"
                    >
                      {expandirDetalhes[regra.id] ? 'Ver menos' : 'Ver detalhes'}
                    </button>
                  )}
                </div>
              </div>
              
              {!readOnly && !regra.obrigatorio && (
                <button
                  type="button"
                  onClick={() => onRegraToggle(regra.id)}
                  className={`ml-4 px-4 py-2 rounded-lg transition-colors text-sm ${
                    isSelecionada(regra.id) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {isSelecionada(regra.id) ? 'Ativa' : 'Inativa'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Regras adicionais personalizadas */}
      {!readOnly && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regras adicionais personalizadas
          </label>
          <textarea
            value={regrasAdicionais}
            onChange={(e) => onRegrasAdicionaisChange && onRegrasAdicionaisChange(e.target.value)}
            rows={4}
            placeholder="Ex: 
• Não é permitido usar o terraço após as 22h
• Por favor, recicle o lixo nas lixeiras apropriadas
• A piscina está disponível das 08h às 20h"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006ce4] focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Adicione regras específicas da sua propriedade
          </p>
        </div>
      )}
      
      {/* Contagem e resumo */}
      {regrasSelecionadas.filter(r => r.ativo).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            Regras ativas ({regrasSelecionadas.filter(r => r.ativo).length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {regrasSelecionadas.filter(r => r.ativo).map(regra => (
              <span key={regra.id} className="px-3 py-1 bg-white border rounded-full text-sm flex items-center gap-1">
                {getRegraIcone(regra.icone)}
                {regra.titulo}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para visualização resumida das regras
export const RegrasResumo = ({ regras, regrasAdicionais, className = "" }) => {
  const regrasAtivas = regras.filter(r => r.ativo);
  
  if (regrasAtivas.length === 0 && !regrasAdicionais) {
    return <p className="text-gray-400 text-sm">Nenhuma regra definida</p>;
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {regrasAtivas.map(regra => (
        <div key={regra.id} className="flex items-start gap-3">
          <div className="text-gray-500 mt-0.5">{getRegraIcone(regra.icone)}</div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{regra.titulo}</p>
            <p className="text-xs text-gray-500">{regra.descricao}</p>
          </div>
        </div>
      ))}
      
      {regrasAdicionais && (
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-0.5"><AlertCircle size={16} /></div>
          <div>
            <p className="font-medium text-gray-800 text-sm">Regras adicionais</p>
            <p className="text-xs text-gray-500 whitespace-pre-line">{regrasAdicionais}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regras;