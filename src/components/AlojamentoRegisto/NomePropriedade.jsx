// src/components/AlojamentoRegisto/NomePropriedade.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, HelpCircle, User } from 'lucide-react';
import PropMenu from './PropMenu';

const NomePropriedade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [propertyName, setPropertyName] = useState(location.state?.propertyName || '');
  const [newName, setNewName] = useState(propertyName);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Carregar nome salvo
  useEffect(() => {
    const savedName = localStorage.getItem('propertyName');
    if (savedName && !location.state?.propertyName) {
      setPropertyName(savedName);
      setNewName(savedName);
    }
  }, [location.state?.propertyName]);

  const handleSave = () => {
    if (!newName.trim()) {
      setError('O nome da propriedade é obrigatório');
      return;
    }
    
    localStorage.setItem('propertyName', newName.trim());
    setSuccess(true);
    
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditLocation = () => {
    navigate('/alojamento/localizacao', { state: { propertyName: newName, action: 'edit' } });
  };

  const handleEditName = () => {
    console.log('Editando nome');
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      
      <header className="bg-[#003580] text-white h-[60px] flex items-center justify-between px-6 shadow-sm">
        <div className="font-bold text-2xl tracking-tight">morabezastay.cv</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <PropMenu 
              nomePropriedade={newName || propertyName || 'Nova Propriedade'}
              onEditName={handleEditName}
              onEditLocation={handleEditLocation}
            />
            <div className="text-[10px] opacity-80">
              Editar nome da propriedade
            </div>
          </div>
          <div className="w-[1px] h-8 bg-blue-900"></div>
          <div className="cursor-pointer hover:underline">PT</div>
          <div className="flex items-center gap-2 cursor-pointer hover:underline">
            <span>Ajuda</span> <HelpCircle size={18} />
          </div>
          <User size={24} className="cursor-pointer" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Editar nome da propriedade
          </h1>
          <p className="text-gray-600 mb-8">
            Altere o nome da sua propriedade como será exibido na plataforma.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Check className="text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800">Nome atualizado com sucesso!</h3>
                  <p className="text-green-700 text-sm">Redirecionando...</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da propriedade *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError('');
                  }}
                  placeholder="Ex: Villa Sol, Mar Azul Apartments, Casa da Praia..."
                  className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors`}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Dica:</h4>
                <p className="text-blue-800 text-sm">
                  Escolha um nome claro e fácil de lembrar. Os hóspedes vão identificar sua propriedade por este nome.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#006ce4] text-white py-2.5 rounded-lg hover:bg-[#0053b3] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Salvar alterações
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <span className="font-semibold">Nome atual:</span>{' '}
                <span className="text-gray-500">{propertyName || 'Não definido'}</span>
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Novo nome:</span>{' '}
                <span className="text-[#006ce4] font-medium">{newName || '___'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NomePropriedade;