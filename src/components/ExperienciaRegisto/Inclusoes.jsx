// src/components/ExperienciaRegisto/Inclusoes.jsx
// COMPONENTE PARA EXPERIÊNCIA - LISTA DE ITENS INCLUÍDOS

import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Coffee, Wifi, Car, Utensils, Camera, Smartphone, Shield, Gift, Music, Bike, Umbrella, Compass } from 'lucide-react';

// Ícones disponíveis para as inclusões
const ICONES_DISPONIVEIS = [
  { nome: 'Check', icone: <Check size={18} /> },
  { nome: 'Coffee', icone: <Coffee size={18} /> },
  { nome: 'Wifi', icone: <Wifi size={18} /> },
  { nome: 'Car', icone: <Car size={18} /> },
  { nome: 'Utensils', icone: <Utensils size={18} /> },
  { nome: 'Camera', icone: <Camera size={18} /> },
  { nome: 'Smartphone', icone: <Smartphone size={18} /> },
  { nome: 'Shield', icone: <Shield size={18} /> },
  { nome: 'Gift', icone: <Gift size={18} /> },
  { nome: 'Music', icone: <Music size={18} /> },
  { nome: 'Bike', icone: <Bike size={18} /> },
  { nome: 'Umbrella', icone: <Umbrella size={18} /> },
  { nome: 'Compass', icone: <Compass size={18} /> }
];

// Sugestões de inclusões comuns
const SUGESTOES_INCLUSOES = [
  'Guia profissional certificado',
  'Equipamento de segurança',
  'Transporte ida e volta',
  'Refeição típica',
  'Bebidas incluídas',
  'Seguro de acidentes',
  'Fotografias digitais',
  'Material de apoio',
  'Água potável',
  'Snacks',
  'Equipamento especializado',
  'Entrada em monumentos'
];

const Inclusoes = ({ items = [], onChange, readOnly = false }) => {
  const [novoItem, setNovoItem] = useState('');
  const [novoIcone, setNovoIcone] = useState('Check');
  const [mostrarForm, setMostrarForm] = useState(false);
  
  const adicionarItem = () => {
    if (!novoItem.trim()) return;
    
    // Verificar se já existe item similar
    if (items.some(item => item.item.toLowerCase() === novoItem.trim().toLowerCase())) {
      alert('Este item já foi adicionado!');
      return;
    }
    
    const novo = {
      id: Date.now(),
      item: novoItem.trim(),
      icone: novoIcone.toLowerCase(),
      incluido: 1,
      ordem: items.length
    };
    
    onChange([...items, novo]);
    setNovoItem('');
    setNovoIcone('Check');
    setMostrarForm(false);
  };
  
  const removerItem = (id) => {
    onChange(items.filter(item => item.id !== id));
  };
  
  const toggleIncluido = (id) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, incluido: item.incluido === 1 ? 0 : 1 } : item
    ));
  };
  
  const adicionarSugestao = (sugestao) => {
    if (items.some(item => item.item.toLowerCase() === sugestao.toLowerCase())) {
      alert('Este item já foi adicionado!');
      return;
    }
    
    const novo = {
      id: Date.now(),
      item: sugestao,
      icone: 'check',
      incluido: 1,
      ordem: items.length
    };
    
    onChange([...items, novo]);
  };
  
  const getIcone = (iconeNome) => {
    const icone = ICONES_DISPONIVEIS.find(i => i.nome.toLowerCase() === iconeNome?.toLowerCase());
    return icone ? icone.icone : <Check size={18} />;
  };
  
  return (
    <div className="space-y-4">
      {/* Sugestões rápidas */}
      {!readOnly && items.length === 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">💡 Sugestões de inclusões:</p>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_INCLUSOES.slice(0, 6).map(sug => (
              <button
                key={sug}
                type="button"
                onClick={() => adicionarSugestao(sug)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista de inclusões */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Itens incluídos:</p>
          {items.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              item.incluido === 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 opacity-60'
            }`}>
              <div className={`${item.incluido === 1 ? 'text-green-600' : 'text-gray-400'}`}>
                {getIcone(item.icone)}
              </div>
              <span className={`flex-1 text-sm ${item.incluido === 0 ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.item}
              </span>
              {!readOnly && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleIncluido(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.incluido === 1 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={item.incluido === 1 ? 'Marcar como não incluído' : 'Marcar como incluído'}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removerItem(item.id)}
                    className="p-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-lg transition-colors"
                    title="Remover item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Botão adicionar */}
      {!readOnly && (
        <>
          {mostrarForm ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 mt-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Item</label>
                  <input
                    type="text"
                    value={novoItem}
                    onChange={(e) => setNovoItem(e.target.value)}
                    placeholder="Ex: Equipamento de mergulho, Transporte, Refeição..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
                    autoFocus
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-500 mb-1">Ícone</label>
                  <select
                    value={novoIcone}
                    onChange={(e) => setNovoIcone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#006ce4]"
                  >
                    {ICONES_DISPONIVEIS.map(icone => (
                      <option key={icone.nome} value={icone.nome}>{icone.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={adicionarItem}
                  disabled={!novoItem.trim()}
                  className="flex-1 px-4 py-2 bg-[#006ce4] text-white rounded-lg hover:bg-[#0053b3] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 text-[#006ce4] hover:text-[#0053b3] transition-colors mt-2"
            >
              <Plus size={18} /> Adicionar inclusão
            </button>
          )}
        </>
      )}
      
      {/* Mensagem quando não há itens */}
      {items.length === 0 && !readOnly && !mostrarForm && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Gift size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-400 text-sm">
            Nenhuma inclusão adicionada ainda
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Clique no botão acima para adicionar o que está incluído na experiência
          </p>
        </div>
      )}
      
      {items.length === 0 && readOnly && (
        <p className="text-gray-400 text-center py-4">Nenhuma inclusão listada</p>
      )}
      
      {/* Resumo */}
      {items.length > 0 && !readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
          <p className="text-xs text-blue-700">
            ✅ Total de {items.length} {items.length === 1 ? 'item incluído' : 'itens incluídos'}
            {items.filter(i => i.incluido === 0).length > 0 && 
              ` (${items.filter(i => i.incluido === 0).length} não incluído)`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Inclusoes;