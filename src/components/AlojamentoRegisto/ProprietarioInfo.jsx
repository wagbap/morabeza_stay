// src/components/AlojamentoRegisto/ProprietarioInfo.jsx
import React, { useState } from 'react';
import { User, Mail, Phone, Globe, AlertCircle, Check, ChevronRight, Shield, Clock, MapPin, Building, Upload, Camera } from 'lucide-react';

const ProprietarioInfo = ({ 
  dados, 
  onDadosChange, 
  onNext,
  readOnly = false 
}) => {
  const [erros, setErros] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState(dados?.foto_perfil || '');
  const fileInputRef = React.useRef(null);

  // Handlers para atualizar os dados
  const handleChange = (campo, valor) => {
    onDadosChange({ ...dados, [campo]: valor });
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }));
    }
  };

  // Upload de foto de perfil
  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fotoUrl = reader.result;
        setFotoPerfil(fotoUrl);
        handleChange('foto_perfil', fotoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validação do formulário
  const validarFormulario = () => {
    const novosErros = {};

    if (!dados.nome || dados.nome.trim() === '') {
      novosErros.nome = 'O nome é obrigatório';
    } else if (dados.nome.length < 3) {
      novosErros.nome = 'O nome deve ter pelo menos 3 caracteres';
    }

    if (!dados.email || dados.email.trim() === '') {
      novosErros.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      novosErros.email = 'Email inválido';
    }

    if (dados.telefone && !/^[0-9+\-\s()]{8,20}$/.test(dados.telefone)) {
      novosErros.telefone = 'Telefone inválido';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = () => {
    if (validarFormulario() && onNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Foto de perfil */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div 
            className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 ${!readOnly ? 'border-[#006ce4] cursor-pointer' : 'border-gray-300'}`}
            onClick={() => !readOnly && fileInputRef.current?.click()}
          >
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          {!readOnly && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#006ce4] text-white p-1.5 rounded-full hover:bg-[#0053b3] transition-colors"
              >
                <Camera size={14} />
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Clique para adicionar foto</p>
      </div>

      {/* Nome completo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={dados.nome || ''}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Como deseja ser chamado pelos hóspedes"
            className={`w-full pl-10 pr-4 py-3 border ${erros.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors`}
            disabled={readOnly}
          />
        </div>
        {erros.nome && <p className="text-sm text-red-500 mt-1">{erros.nome}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={dados.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="seu@email.com"
            className={`w-full pl-10 pr-4 py-3 border ${erros.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors`}
            disabled={readOnly}
          />
        </div>
        {erros.email && <p className="text-sm text-red-500 mt-1">{erros.email}</p>}
        <p className="text-xs text-gray-400 mt-1">Usado para comunicação com os hóspedes</p>
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Telefone / WhatsApp
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            value={dados.telefone || ''}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="+238 991 11 11"
            className={`w-full pl-10 pr-4 py-3 border ${erros.telefone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors`}
            disabled={readOnly}
          />
        </div>
        {erros.telefone && <p className="text-sm text-red-500 mt-1">{erros.telefone}</p>}
        <p className="text-xs text-gray-400 mt-1">Inclua código do país (ex: +238)</p>
      </div>

      {/* Website / Redes sociais */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Website ou Redes sociais <span className="text-gray-400">(opcional)</span>
        </label>
        <div className="relative">
          <Globe size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={dados.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.suaempresa.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Tipo de conta */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de conta
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => !readOnly && handleChange('tipo_conta', 'hospede')}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              dados.tipo_conta === 'hospede'
                ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                : 'border-gray-200 hover:border-gray-300'
            } ${readOnly && 'cursor-default'}`}
            disabled={readOnly}
          >
            <User size={18} />
            <div className="text-left">
              <p className="text-sm font-medium">Hóspede</p>
              <p className="text-xs text-gray-400">Viajante ocasional</p>
            </div>
            {dados.tipo_conta === 'hospede' && <Check size={16} className="ml-auto" />}
          </button>
          
          <button
            type="button"
            onClick={() => !readOnly && handleChange('tipo_conta', 'proprietario')}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              dados.tipo_conta === 'proprietario'
                ? 'border-[#006ce4] bg-blue-50 text-[#006ce4]'
                : 'border-gray-200 hover:border-gray-300'
            } ${readOnly && 'cursor-default'}`}
            disabled={readOnly}
          >
            <Building size={18} />
            <div className="text-left">
              <p className="text-sm font-medium">Proprietário</p>
              <p className="text-xs text-gray-400">Anfitrião de propriedade</p>
            </div>
            {dados.tipo_conta === 'proprietario' && <Check size={16} className="ml-auto" />}
          </button>
        </div>
      </div>

      {/* Localização do proprietário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            País
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dados.pais || 'Cabo Verde'}
              onChange={(e) => handleChange('pais', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
              disabled={readOnly}
            >
              <option value="Cabo Verde">Cabo Verde</option>
              <option value="Portugal">Portugal</option>
              <option value="Angola">Angola</option>
              <option value="Brasil">Brasil</option>
              <option value="Moçambique">Moçambique</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cidade
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dados.cidade || ''}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="Sua cidade"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4]"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Sobre o proprietário */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sobre si <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          value={dados.sobre || ''}
          onChange={(e) => handleChange('sobre', e.target.value)}
          rows={4}
          placeholder="Conte um pouco sobre você, seus hobbies, o que o motiva a ser anfitrião..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] resize-none"
          disabled={readOnly}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400">Uma boa apresentação gera mais confiança nos hóspedes</p>
          <p className="text-xs text-gray-400">{(dados.sobre?.length || 0)}/500</p>
        </div>
      </div>

      {/* Idiomas falados */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Idiomas que fala
        </label>
        <div className="flex flex-wrap gap-2">
          {['Português', 'Inglês', 'Francês', 'Espanhol', 'Italiano', 'Alemão'].map(idioma => (
            <button
              key={idioma}
              type="button"
              onClick={() => {
                const atuais = dados.idiomas || [];
                const novos = atuais.includes(idioma)
                  ? atuais.filter(i => i !== idioma)
                  : [...atuais, idioma];
                handleChange('idiomas', novos);
              }}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                (dados.idiomas || []).includes(idioma)
                  ? 'bg-[#006ce4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${readOnly && 'cursor-default'}`}
              disabled={readOnly}
            >
              {idioma}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Selecione os idiomas que domina</p>
      </div>

      {/* Tempo de resposta */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tempo de resposta aos hóspedes
        </label>
        <div className="relative">
          <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={dados.tempo_resposta || 'Dentro de 1 hora'}
            onChange={(e) => handleChange('tempo_resposta', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#006ce4] bg-white"
            disabled={readOnly}
          >
            <option value="Dentro de 1 hora">⚡ Dentro de 1 hora</option>
            <option value="Dentro de 2 horas">📱 Dentro de 2 horas</option>
            <option value="Dentro de 6 horas">📧 Dentro de 6 horas</option>
            <option value="Dentro de 12 horas">📬 Dentro de 12 horas</option>
            <option value="Dentro de 24 horas">📅 Dentro de 24 horas</option>
            <option value="Dentro de 48 horas">🗓️ Dentro de 48 horas</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-1">Tempo médio que leva para responder aos hóspedes</p>
      </div>

      {/* Verificação de identidade */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <Shield size={20} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800 text-sm">Verificação de identidade</p>
          <p className="text-green-700 text-xs">
            Sua identidade será verificada pela nossa equipa para garantir a segurança de todos.
            Este processo é rápido e seguro.
          </p>
        </div>
        <Check size={18} className="text-green-600 ml-auto" />
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Dicas para anfitriões de sucesso:
        </h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• ✨ Responda rapidamente às mensagens dos hóspedes</li>
          <li>• 📸 Adicione uma foto de perfil amigável e profissional</li>
          <li>• 💬 Seja detalhista nas descrições da sua propriedade</li>
          <li>• ⭐ Mantenha uma boa comunicação para garantir avaliações positivas</li>
        </ul>
      </div>

      {/* Botão de avançar */}
      {!readOnly && onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#006ce4] text-white px-8 py-3 rounded-lg hover:bg-[#0053b3] transition-colors font-medium flex items-center gap-2"
          >
            Continuar <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Resumo para modo leitura */}
      {readOnly && dados && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} /> Informações do proprietário
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Nome:</span> <span className="font-medium">{dados.nome || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{dados.email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Telefone:</span> <span className="font-medium">{dados.telefone || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tipo de conta:</span> <span className="font-medium capitalize">{dados.tipo_conta || 'Hóspede'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Idiomas:</span> <span className="font-medium">{(dados.idiomas || []).join(', ') || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tempo de resposta:</span> <span className="font-medium">{dados.tempo_resposta || '-'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProprietarioInfo;