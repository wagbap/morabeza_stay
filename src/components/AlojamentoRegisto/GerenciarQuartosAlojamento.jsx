import React, { useState, useEffect } from 'react';
import { Bed, Plus, Trash2, Camera, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const GerenciarQuartosAlojamento = ({ alojamentoId, precoBaseAlojamento }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const tiposQuartoPadrao = [
    { tipo_quarto_id: 1, nome: 'Quarto Casal', quantidade_disponivel: 1, preco_personalizado: '', ativo: 1, fotos: [''] },
    { tipo_quarto_id: 2, nome: 'Quarto Twin', quantidade_disponivel: 0, preco_personalizado: '', ativo: 0, fotos: [''] },
    { tipo_quarto_id: 3, nome: 'Quarto Solteiro', quantidade_disponivel: 0, preco_personalizado: '', ativo: 0, fotos: [''] },
    { tipo_quarto_id: 4, nome: 'Suíte Luxo', quantidade_disponivel: 0, preco_personalizado: '', ativo: 0, fotos: [''] }
  ];

  const [quartos, setQuartos] = useState(tiposQuartoPadrao);

  useEffect(() => {
    const carregarQuartos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://welovepalop.com/api/meus_alojamentos.php?id=${alojamentoId}`);
        const data = await res.json();

        if (data.success && data.data && data.data.quartos && data.data.quartos.length > 0) {
          const carregados = tiposQuartoPadrao.map(padrao => {
            const encontrado = data.data.quartos.find(q => q.tipo_quarto_id === padrao.tipo_quarto_id);
            if (encontrado) {
              return {
                ...padrao,
                quantidade_disponivel: encontrado.quantidade_disponivel || 0,
                preco_personalizado: encontrado.preco || '',
                ativo: 1,
                fotos: encontrado.fotos && encontrado.fotos.length > 0 ? encontrado.fotos : ['']
              };
            }
            return padrao;
          });
          setQuartos(carregados);
        }
      } catch (err) {
        console.error('Erro ao carregar quartos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (alojamentoId) carregarQuartos();
  }, [alojamentoId]);

  const handleCampoChange = (index, campo, valor) => {
    setQuartos(prev => {
      const novos = [...prev];
      novos[index][campo] = valor;
      return novos;
    });
  };

  const handleFotoChange = (quartoIdx, fotoIdx, valor) => {
    setQuartos(prev => {
      const novos = [...prev];
      novos[quartoIdx].fotos[fotoIdx] = valor;
      return novos;
    });
  };

  const AdicionarCampoFoto = (quartoIdx) => {
    setQuartos(prev => {
      const novos = [...prev];
      novos[quartoIdx].fotos.push('');
      return novos;
    });
  };

  const RemoverFoto = (quartoIdx, fotoIdx) => {
    setQuartos(prev => {
      const novos = [...prev];
      novos[quartoIdx].fotos = novos[quartoIdx].fotos.filter((_, i) => i !== fotoIdx);
      if (novos[quartoIdx].fotos.length === 0) novos[quartoIdx].fotos = [''];
      return novos;
    });
  };

  const handleSalvar = async () => {
    try {
      setSaving(true);
      setMensagem(null);

      const payload = {
        alojamento_id: alojamentoId,
        quartos: quartos.map(q => ({
          tipo_quarto_id: q.tipo_quarto_id,
          quantidade_disponivel: q.ativo ? Number(q.quantidade_disponivel) : 0,
          preco_personalizado: q.preco_personalizado !== '' ? Number(q.preco_personalizado) : null,
          ativo: q.ativo ? 1 : 0,
          fotos: q.fotos.filter(f => f.trim() !== '')
        }))
      };

      const res = await fetch('https://welovepalop.com/api/alojamento/salvar_quartos_alojamento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMensagem({ tipo: 'sucesso', texto: 'Configuração dos quartos guardada com sucesso!' });
      } else {
        throw new Error(data.message || 'Erro ao guardar quartos.');
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bed className="text-blue-600" size={20} /> Gestão de Tipos de Quartos & Inventário
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Defina o número de unidades disponíveis, o preço por noite (ou use o preço base de {precoBaseAlojamento || 1880} CVE) e fotos de cada tipo.
          </p>
        </div>

        <button
          onClick={handleSalvar}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar Quartos
        </button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 text-xs font-bold ${
          mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-6">
        {quartos.map((quarto, idx) => (
          <div 
            key={quarto.tipo_quarto_id}
            className={`p-5 rounded-2xl border transition-all ${
              quarto.ativo ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/50 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quarto.ativo === 1}
                  onChange={(e) => handleCampoChange(idx, 'ativo', e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-sm text-slate-900">{quarto.nome}</span>
              </label>

              {quarto.ativo === 1 && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md uppercase">
                  Ativo no anúncio
                </span>
              )}
            </div>

            {quarto.ativo === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantidade de quartos disponíveis (Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quarto.quantidade_disponivel}
                    onChange={(e) => handleCampoChange(idx, 'quantidade_disponivel', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preço personalizado (CVE / noite)
                  </label>
                  <input
                    type="number"
                    placeholder={`Padrão: ${precoBaseAlojamento || 1880} CVE`}
                    value={quarto.preco_personalizado}
                    onChange={(e) => handleCampoChange(idx, 'preco_personalizado', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Secção de Fotografias do Quarto */}
                <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Camera size={14} /> URLs das Fotos deste Quarto
                    </span>
                    <button
                      type="button"
                      onClick={() => AdicionarCampoFoto(idx)}
                      className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> Adicionar Foto
                    </button>
                  </div>

                  <div className="space-y-2">
                    {quarto.fotos.map((urlFoto, fotoIdx) => (
                      <div key={fotoIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="https://welovepalop.com/uploads/quarto.jpg"
                          value={urlFoto}
                          onChange={(e) => handleFotoChange(idx, fotoIdx, e.target.value)}
                          className="flex-1 text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {quarto.fotos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => RemoverFoto(idx, fotoIdx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GerenciarQuartosAlojamento;