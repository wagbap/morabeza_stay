// src/components/CarroRegisto/Especificacoes.jsx

import React from 'react';
import { Calendar, Users, Car, Gauge, Fuel, Palette, Settings, Route } from 'lucide-react';

const ANOS = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
const TRANSMISSOES = ['Manual', 'Automático'];
const COMBUSTIVEIS = ['Gasolina', 'Diesel', 'Elétrico', 'Híbrido', 'GPL'];

const Especificacoes = ({ dados = {}, onChange, readOnly = false }) => {
  const handleChange = (campo, valor) => {
    onChange({ ...dados, [campo]: valor });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ano do Veículo
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.ano || ''}
              onChange={(e) => handleChange('ano', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              <option value="">Selecione o ano</option>
              {ANOS.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Número de Passageiros
          </label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.passageiros || 5}
              onChange={(e) => handleChange('passageiros', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'pessoa' : 'pessoas'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Número de Portas
          </label>
          <div className="relative">
            <Car size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.portas || 4}
              onChange={(e) => handleChange('portas', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {[2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} portas</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transmissão
          </label>
          <div className="relative">
            <Gauge size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.transmissao || 'Manual'}
              onChange={(e) => handleChange('transmissao', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {TRANSMISSOES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Combustível
          </label>
          <div className="relative">
            <Fuel size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.combustivel || 'Gasolina'}
              onChange={(e) => handleChange('combustivel', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              {COMBUSTIVEIS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Consumo (km/l)
          </label>
          <div className="relative">
            <Route size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dados.consumo || ''}
              onChange={(e) => handleChange('consumo', e.target.value)}
              placeholder="Ex: 12 km/l"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cor
          </label>
          <div className="relative">
            <Palette size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dados.cor || ''}
              onChange={(e) => handleChange('cor', e.target.value)}
              placeholder="Ex: Preto, Branco, Prata"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quilometragem (km)
          </label>
          <div className="relative">
            <Settings size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={dados.quilometragem || 0}
              onChange={(e) => handleChange('quilometragem', parseInt(e.target.value))}
              placeholder="Ex: 25000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Quilometragem atual do veículo</p>
        </div>
      </div>
    </div>
  );
};

export default Especificacoes;