import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check, AlertCircle, TrendingUp, Award, Zap } from 'lucide-react';

const FluxoNomePropriedade = ({ onNext, onUpdatePropertyData, propertyData }) => {
  const navigate = useNavigate();
  const [propertyName, setPropertyName] = useState(propertyData?.name || '');
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(propertyData?.name?.length || 0);
  const [showTips, setShowTips] = useState(true);

  const suggestions = [
    { text: "Villa do Mar", icon: "🌊", description: "Evoca praia e tranquilidade" },
    { text: "Casa do Campo", icon: "🌳", description: "Perfeito para área rural" },
    { text: "Downtown Loft", icon: "🏙️", description: "Moderno e urbano" },
    { text: "Sunset Paradise", icon: "🌅", description: "Vistas incríveis" }
  ];

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setPropertyName(value);
      setCharacterCount(value.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (propertyName.trim()) {
      onUpdatePropertyData({ ...propertyData, name: propertyName });
      if (onNext) onNext();
    }
  };

  const getValidationStatus = () => {
    if (propertyName.length === 0) return { color: 'gray', message: 'Digite um nome para sua propriedade' };
    if (propertyName.length < 10) return { color: 'yellow', icon: AlertCircle, message: 'Nome muito curto - tente algo mais descritivo' };
    if (propertyName.length > 40) return { color: 'yellow', icon: AlertCircle, message: 'Nome longo - pode ficar cortado em alguns dispositivos' };
    return { color: 'green', icon: Check, message: 'Ótimo nome! Pronto para continuar' };
  };

  const validation = getValidationStatus();
  const ValidationIcon = validation.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h2 className="text-white font-semibold">Crie um nome memorável</h2>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nome da propriedade
          </label>
          
          <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
            <input
              type="text"
              value={propertyName}
              onChange={handleNameChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-900 transition-all duration-200 focus:outline-none ${
                isFocused 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              placeholder="Ex: Villa do Mar, Casa da Praia..."
              autoFocus
            />
            
            {/* Character Counter */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {characterCount}/50
            </div>
          </div>

          {/* Validation Message */}
          <div className={`mt-2 flex items-center gap-2 text-sm ${
            validation.color === 'green' ? 'text-green-600' : 
            validation.color === 'yellow' ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {ValidationIcon && <ValidationIcon className="w-4 h-4" />}
            <span>{validation.message}</span>
          </div>
        </div>

        {/* Quick Tips Toggle */}
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dicas para um nome de sucesso</span>
          </div>
          <span className="text-gray-400">{showTips ? '▼' : '▶'}</span>
        </button>

        {/* Tips Content */}
        {showTips && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid gap-2">
              {[
                { icon: "🎯", text: "Seja específico: 'Vista Mar' é melhor que 'Casa Bonita'" },
                { icon: "📝", text: "Use 2-4 palavras para melhor impacto nos resultados" },
                { icon: "⭐", text: "Inclua características únicas da sua região" },
                { icon: "🔍", text: "Pense em palavras que os hóspedes usariam para pesquisar" }
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="text-sm">{tip.icon}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion Cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Sugestões populares
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPropertyName(suggestion.text)}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {suggestion.text}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{suggestion.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SEO Benefit Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                Benefício SEO
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                Um nome otimizado aumenta sua visibilidade em até 32% nos resultados de busca
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="submit"
            disabled={!propertyName.trim()}
            className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              propertyName.trim()
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuar
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FluxoNomePropriedade;