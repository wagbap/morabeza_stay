// src/components/ExperienciaRegisto/ImagensUpload.jsx

import React, { useState, useRef } from 'react';
import { Upload, X, Star, Trash2, Move, AlertCircle, Check, Plus, Loader } from 'lucide-react';
import { uploadImagemExperiencia, removerImagemExperiencia } from '../../services/experienciaApiService';

const ImagensUpload = ({ imagens = [], onChange, experienciaId = null, readOnly = false, maxFotos = 15 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [erro, setErro] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  
  const fotoPrincipalId = imagens.find(f => f.principal)?.id || imagens[0]?.id;
  
  const handleFileSelect = async (files) => {
    setErro('');
    const filesArray = Array.from(files);
    
    if (imagens.length + filesArray.length > maxFotos) {
      setErro(`Máximo de ${maxFotos} fotos permitidas. Você já tem ${imagens.length} fotos.`);
      return;
    }
    
    const arquivosInvalidos = filesArray.filter(file => {
      if (!file.type.startsWith('image/')) return true;
      if (file.size > 10 * 1024 * 1024) return true;
      return false;
    });
    
    if (arquivosInvalidos.length > 0) {
      setErro('Apenas imagens até 10MB são permitidas');
      return;
    }
    
    setUploading(true);
    
    try {
      const novasImagens = [];
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const ordem = imagens.length + i;
        
        try {
          const resultadoUpload = await uploadImagemExperiencia(file, experienciaId, ordem);
          
          const novaImagem = {
            id: resultadoUpload.id || Date.now() + Math.random(),
            caminho_url: resultadoUpload.url,
            url: resultadoUpload.url,
            principal: imagens.length === 0 && novasImagens.length === 0,
            ordem: ordem
          };
          
          novasImagens.push(novaImagem);
          
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
          setErro(`Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
        }
      }
      
      if (novasImagens.length > 0) {
        onChange([...imagens, ...novasImagens]);
      }
      
    } catch (error) {
      console.error('Erro:', error);
      setErro(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemoverImagem = async (id) => {
    const imagemRemover = imagens.find(i => i.id === id);
    
    if (imagemRemover?.id && !readOnly && experienciaId) {
      try {
        await removerImagemExperiencia(imagemRemover.id);
      } catch (error) {
        console.error('Erro ao remover imagem:', error);
      }
    }
    
    const novasImagens = imagens.filter(img => img.id !== id);
    
    if (fotoPrincipalId === id && novasImagens.length > 0) {
      novasImagens[0].principal = true;
    }
    
    onChange(novasImagens);
  };
  
  const handleDefinirPrincipal = (id) => {
    const novasImagens = imagens.map(img => ({
      ...img,
      principal: img.id === id
    }));
    onChange(novasImagens);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };
  
  return (
    <div className="space-y-6">
      {!readOnly && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging ? 'border-[#006ce4] bg-blue-50' : 'border-gray-300 hover:border-[#006ce4] hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
          />
          <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-[#006ce4]' : 'text-gray-400'}`} />
          <p className="text-gray-600 mb-1">
            {isDragging ? 'Solte para adicionar as fotos' : 'Arraste e solte as suas fotos aqui'}
          </p>
          <p className="text-sm text-gray-400">ou clique para selecionar do computador</p>
          <p className="text-xs text-gray-400 mt-3">
            Formatos: JPG, PNG, WEBP, GIF | Máx 10MB | Máx {maxFotos} fotos
          </p>
        </div>
      )}
      
      {uploading && (
        <div className="border-2 border-[#006ce4] bg-blue-50 rounded-xl p-6 text-center">
          <Loader className="w-8 h-8 mx-auto mb-3 text-[#006ce4] animate-spin" />
          <p className="text-gray-600">Fazendo upload das imagens...</p>
        </div>
      )}
      
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm text-red-600">{erro}</p>
          <button onClick={() => setErro('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
      
      {imagens.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Check size={18} className="text-green-500" />
            Suas fotos ({imagens.length}/{maxFotos})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagens.map((img, index) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border-2 border-gray-200">
                {img.principal && (
                  <div className="absolute top-2 left-2 bg-[#006ce4] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                    <Star size={10} fill="white" /> Principal
                  </div>
                )}
                <img src={img.caminho_url || img.url} alt="Foto" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!readOnly && !img.principal && (
                    <button onClick={() => handleDefinirPrincipal(img.id)} className="p-2 bg-white rounded-full hover:bg-[#006ce4] hover:text-white">
                      <Star size={16} />
                    </button>
                  )}
                  {!readOnly && (
                    <button onClick={() => handleRemoverImagem(img.id)} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!readOnly && imagens.length < 3 && !uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Recomendamos pelo menos <strong>3 fotos</strong> para atrair mais hóspedes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagensUpload;