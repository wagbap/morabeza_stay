// src/components/AlojamentoRegisto/PropMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Pencil, MapPin, ChevronDown, Wifi, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PropMenu = ({ 
  nomePropriedade, 
  alojamentoId,
  onEditName, 
  onEditLocation, 
  onEditComodidades, 
  onEditRegras 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Para pegar o ID quando estiver na rota de edição

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Função para obter o ID correto (prioriza o prop alojamentoId, depois o param da URL)
  const obterId = () => {
    return alojamentoId || id;
  };

  const handleEditName = () => {
    setIsOpen(false);
    if (onEditName) {
      onEditName();
    } else {
      const idAtual = obterId();
      if (idAtual) {
        navigate(`/alojamento-registro/editar/${idAtual}?step=nome`);
      } else {
        console.warn('Não foi possível editar nome: ID do alojamento não encontrado');
      }
    }
  };

  const handleEditLocation = () => {
    setIsOpen(false);
    if (onEditLocation) {
      onEditLocation();
    } else {
      const idAtual = obterId();
      if (idAtual) {
        navigate(`/alojamento-registro/editar/${idAtual}?step=localizacao`);
      } else {
        console.warn('Não foi possível editar localização: ID do alojamento não encontrado');
      }
    }
  };

  const handleEditComodidades = () => {
    setIsOpen(false);
    if (onEditComodidades) {
      onEditComodidades();
    } else {
      const idAtual = obterId();
      if (idAtual) {
        navigate(`/alojamento-registro/editar/${idAtual}?step=comodidades`);
      } else {
        console.warn('Não foi possível editar comodidades: ID do alojamento não encontrado');
      }
    }
  };

  const handleEditRegras = () => {
    setIsOpen(false);
    if (onEditRegras) {
      onEditRegras();
    } else {
      const idAtual = obterId();
      if (idAtual) {
        navigate(`/alojamento-registro/editar/${idAtual}?step=regras`);
      } else {
        console.warn('Não foi possível editar regras: ID do alojamento não encontrado');
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="font-bold flex items-center gap-1 cursor-pointer hover:underline focus:outline-none"
      >
        {nomePropriedade || "Propriedade"} 
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-900 shadow-lg border border-gray-200 rounded-md z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div 
            onClick={handleEditName} 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm transition-colors duration-150"
          >
            <Pencil size={18} className="text-gray-500" /> 
            <span>Alterar nome da propriedade</span>
          </div>
          <div 
            onClick={handleEditLocation} 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm transition-colors duration-150 border-t border-gray-100"
          >
            <MapPin size={18} className="text-gray-500" /> 
            <span>Alterar morada</span>
          </div>
          <div 
            onClick={handleEditComodidades} 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm transition-colors duration-150 border-t border-gray-100"
          >
            <Wifi size={18} className="text-gray-500" /> 
            <span>Alterar comodidades</span>
          </div>
          <div 
            onClick={handleEditRegras} 
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm transition-colors duration-150 border-t border-gray-100"
          >
            <Shield size={18} className="text-gray-500" /> 
            <span>Alterar regras da casa</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropMenu;