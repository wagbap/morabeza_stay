// src/components/CarroRegisto/ImagensUpload.jsx
// Mesma lógica do alojamento: upload direto via XHR + progresso + reordenar + foto principal

import React, { useState, useRef } from 'react';
import { Upload, X, Image, Star, Trash2, Move, AlertCircle, Check, Plus, Loader } from 'lucide-react';

const API_URL = 'https://welovepalop.com';

const ImagensUpload = ({
  // Nomes usados no alojamento:
  fotos,
  onFotosChange,
  onFotoPrincipalChange,
  // Compatibilidade com o FluxoRegisto de carros:
  imagens,
  onChange,
  veiculoId = null,

  maxFotos = 20,
  readOnly = false,
}) => {
  // Aceita ambos os nomes (fotos/onFotosChange OU imagens/onChange)
  const list = fotos ?? imagens ?? [];
  const setList = onFotosChange ?? onChange ?? (() => {});
  const isCarro = veiculoId !== undefined;

  const [isDragging, setIsDragging] = useState(false);
  const [erro, setErro] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);

  const fotoPrincipalId = list.find((f) => f.principal)?.id || list[0]?.id;

  // ---------------------------------------------------------------------
  // Upload (XHR para mostrar progresso)
  // ---------------------------------------------------------------------
  const uploadImagemParaServidor = (file, ordem) => {
    const formData = new FormData();
    formData.append('imagem', file);
    formData.append('ordem', ordem);

    // Backend do carro espera "carro_id"
    if (isCarro && veiculoId && veiculoId !== 'temp' && veiculoId !== null) {
      formData.append('carro_id', veiculoId);
    }

    const fileId = Date.now() + Math.random();
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [fileId]: percent }));
        }
      });

      xhr.onload = () => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });

        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Erro no upload'));
            }
          } catch (e) {
            reject(new Error('Erro ao processar resposta do servidor'));
          }
        } else {
          reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
        reject(new Error('Erro de conexão com o servidor'));
      };

      // Endpoint do CARRO
      xhr.open('POST', `${API_URL}/api/carro/upload_imagem.php`);
      xhr.send(formData);
    });
  };

  // ---------------------------------------------------------------------
  // Seleção de ficheiros
  // ---------------------------------------------------------------------
  const handleFileSelect = async (files) => {
    setErro('');
    const filesArray = Array.from(files);

    if (list.length + filesArray.length > maxFotos) {
      setErro(`Máximo de ${maxFotos} fotos permitidas. Já tens ${list.length}.`);
      return;
    }

    const invalidos = filesArray.filter((f) => {
      if (!f.type.startsWith('image/')) return true;
      if (f.size > 10 * 1024 * 1024) return true;
      return false;
    });

    if (invalidos.length > 0) {
      setErro('Apenas imagens até 10MB são permitidas');
      return;
    }

    setUploading(true);

    try {
      const novasFotos = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const ordem = list.length + i;

        try {
          const resultado = await uploadImagemParaServidor(file, ordem);

          novasFotos.push({
            id: resultado.id || Date.now() + Math.random(),
            url: resultado.url || resultado.caminho_url,
            caminho_url: resultado.caminho_url || resultado.url,
            path: resultado.path || resultado.caminho_url,
            nome: file.name,
            tamanho: file.size,
            principal: list.length === 0 && novasFotos.length === 0,
            ordem,
            uploadCompleto: true,
          });
        } catch (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          setErro(`Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
        }
      }

      if (novasFotos.length > 0) {
        const atualizadas = [...list, ...novasFotos];
        setList(atualizadas);

        if (!fotoPrincipalId && atualizadas.length > 0) {
          onFotoPrincipalChange?.(atualizadas[0].id);
        }
      }
    } catch (error) {
      console.error('Erro no processo de upload:', error);
      setErro(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------
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
    if (files.length > 0) handleFileSelect(files);
  };

  // ---------------------------------------------------------------------
  // Remover
  // ---------------------------------------------------------------------
  const handleRemoverFoto = async (id) => {
    const fotoRemover = list.find((f) => f.id === id);

    if (fotoRemover?.id && !readOnly && !fotoRemover.pendingUpload) {
      try {
        await fetch(`${API_URL}/api/carro/remover_imagem.php?id=${fotoRemover.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Erro ao remover imagem do servidor:', error);
      }
    }

    const atualizadas = list.filter((f) => f.id !== id);

    if (fotoPrincipalId === id && atualizadas.length > 0) {
      const novaPrincipal = atualizadas[0];
      onFotoPrincipalChange?.(novaPrincipal.id);
      atualizadas[0].principal = true;
    }

    setList(atualizadas);
  };

  // ---------------------------------------------------------------------
  // Definir principal
  // ---------------------------------------------------------------------
  const handleDefinirPrincipal = async (id) => {
    const atualizadas = list.map((f) => ({
      ...f,
      principal: f.id === id,
    }));
    setList(atualizadas);
    onFotoPrincipalChange?.(id);

    // Se o backend tiver endpoint (opcional), tenta atualizar
    if (veiculoId && veiculoId !== 'temp') {
      try {
        await fetch(`${API_URL}/api/carro/definir_principal.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carro_id: veiculoId,
            imagem_id: id,
          }),
        });
      } catch {
        // silencioso — nem todos os projetos têm este endpoint
      }
    }
  };

  // ---------------------------------------------------------------------
  // Reordenar (drag)
  // ---------------------------------------------------------------------
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragIndex(index);
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    if (dragIndex === null) return;

    if (dragIndex !== index) {
      const reordenadas = [...list];
      const [item] = reordenadas.splice(dragIndex, 1);
      reordenadas.splice(index, 0, item);

      reordenadas.forEach((foto, idx) => {
        foto.ordem = idx;
      });

      setList(reordenadas);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // ---------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasUploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-6">
      {/* Área de upload */}
      {!readOnly && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#006ce4] bg-blue-50'
              : 'border-gray-300 hover:border-[#006ce4] hover:bg-gray-50'
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
            Formatos: JPG, PNG, WEBP, GIF | Máx 10MB por foto | Máx {maxFotos} fotos
          </p>
        </div>
      )}

      {/* Indicador de upload */}
      {uploading && (
        <div className="border-2 border-[#006ce4] bg-blue-50 rounded-xl p-6 text-center">
          <Loader className="w-8 h-8 mx-auto mb-3 text-[#006ce4] animate-spin" />
          <p className="text-gray-600">Fazendo upload das imagens...</p>
          {hasUploading && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#006ce4] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Object.values(uploadProgress)[0] || 0}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm text-red-600">{erro}</p>
          <button onClick={() => setErro('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Galeria */}
      {list.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Image size={18} />
              Fotos do veículo ({list.length}/{maxFotos})
            </h3>
            {!readOnly && !uploading && list.length < maxFotos && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-[#006ce4] hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar mais
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((foto, index) => {
              const imageUrl =
                foto.caminho_url || foto.url || foto.path || '';
              const fullUrl =
                imageUrl.startsWith('http') || imageUrl.startsWith('data:')
                  ? imageUrl
                  : `${API_URL}${imageUrl}`;

              return (
                <div
                  key={foto.id}
                  draggable={!readOnly && !uploading}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOverItem(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                    fotoPrincipalId === foto.id
                      ? 'border-[#006ce4] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!readOnly ? 'cursor-move' : ''}`}
                >
                  {fotoPrincipalId === foto.id && (
                    <div className="absolute top-2 left-2 bg-[#006ce4] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                      <Star size={10} fill="white" /> Principal
                    </div>
                  )}

                  {foto.pendingUpload && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                      Pendente
                    </div>
                  )}

                  <img
                    src={fullUrl}
                    alt={foto.nome || 'Foto'}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Erro+ao+carregar';
                    }}
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!readOnly && !uploading && fotoPrincipalId !== foto.id && (
                      <button
                        onClick={() => handleDefinirPrincipal(foto.id)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-[#006ce4] hover:text-white transition-colors"
                        title="Definir como principal"
                      >
                        <Star size={16} />
                      </button>
                    )}

                    {!readOnly && !uploading && (
                      <button
                        onClick={() => handleRemoverFoto(foto.id)}
                        className="p-2 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remover foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {!readOnly && !uploading && (
                      <div
                        className="p-2 bg-white rounded-full text-gray-400 cursor-move"
                        title="Arrastar para reordenar"
                      >
                        <Move size={16} />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 px-2">
                    <span className="truncate block">{foto.nome || 'imagem'}</span>
                    <span className="text-gray-300 text-[10px]">
                      {formatFileSize(foto.tamanho)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dicas */}
      {!readOnly && list.length === 0 && !uploading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 text-sm flex items-center gap-2">
            <Image size={16} /> Dicas para fotos de sucesso:
          </h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 📸 Tire fotos com boa iluminação natural</li>
            <li>• 🚗 Mostre o exterior por vários ângulos</li>
            <li>• 🪑 Inclua fotos do interior e do painel</li>
            <li>• 🧳 Mostre a bagageira se for relevante</li>
            <li>• 📱 Use a câmara na horizontal para melhores resultados</li>
          </ul>
        </div>
      )}

      {/* Resumo */}
      {list.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            Resumo das fotos
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Total de fotos:</span>{' '}
              <span className="font-medium">{list.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Foto principal:</span>{' '}
              <span className="font-medium text-[#006ce4]">
                {list.find((f) => f.id === fotoPrincipalId)?.nome || 'Definida'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Tamanho total:</span>{' '}
              <span className="font-medium">
                {formatFileSize(list.reduce((acc, f) => acc + (f.tamanho || 0), 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Ordem:</span>{' '}
              <span className="font-medium">Arraste para reordenar</span>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de fotos insuficientes */}
      {!readOnly && list.length < 3 && !uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Recomendamos pelo menos <strong>3 fotos</strong> para atrair mais clientes.
            Anúncios com mais fotos recebem até 40% mais reservas!
          </p>
        </div>
      )}

      {/* Modo leitura vazio */}
      {readOnly && list.length === 0 && (
        <p className="text-gray-400 text-center py-8">Nenhuma foto adicionada</p>
      )}
    </div>
  );
};

export default ImagensUpload;