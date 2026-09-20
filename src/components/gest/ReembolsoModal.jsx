import React, { useState } from 'react';
import { X, Loader2, AlertCircle, DollarSign, ShieldCheck, UploadCloud } from 'lucide-react';

const API_BASE = 'https://welovepalop.com';

const ReembolsoModal = ({ reserva, onClose, onSuccess }) => {
  const parseValorOriginal = (val) => {
    if (!val) return 0;
    const str = String(val).replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const valorMaximo = parseValorOriginal(reserva?.valor_bruto || reserva?.valor || 0);

  const [valor, setValor] = useState(valorMaximo ? valorMaximo.toString() : '');
  const [estado, setEstado] = useState('Solicitado');
  const [referenciaOperador, setReferenciaOperador] = useState('');
  const [comprovativoFile, setComprovativoFile] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [politicaAceite, setPoliticaAceite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    const valorNum = parseFloat(valor);
    if (!valorNum || valorNum <= 0) {
      setErro('Por favor, insira um valor de reembolso válido.');
      return;
    }

    if (valorNum > valorMaximo) {
      setErro(`O valor não pode exceder o montante pago original (CVE ${valorMaximo.toLocaleString('pt-CV', { minimumFractionDigits: 0 })}).`);
      return;
    }

    if (!motivo.trim()) {
      setErro('O motivo do reembolso é obrigatório.');
      return;
    }

    if (!politicaAceite) {
      setErro('Deve confirmar a aceitação da política de reembolso para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      // Uso de FormData para enviar ficheiro e campos em simultâneo
      const formData = new FormData();
      formData.append('reserva_id', reserva.id);
      formData.append('tipo_reserva', reserva.tipo || reserva.tipo_reserva);
      formData.append('valor', valorNum);
      formData.append('estado', estado);
      formData.append('referencia_operador', referenciaOperador.trim());
      formData.append('motivo', motivo.trim());
      if (comprovativoFile) {
        formData.append('comprovativo', comprovativoFile);
      }

      const response = await fetch(`${API_BASE}/api/admin/processar_reembolso.php`, {
        method: 'POST',
        body: formData
      });

      const rawText = await response.text();
      let data;

      try {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}') + 1;
        data = JSON.parse(jsonStart !== -1 && jsonEnd !== -1 ? rawText.slice(jsonStart, jsonEnd) : rawText);
      } catch (parseError) {
        setErro('Erro de leitura na resposta do servidor.');
        setLoading(false);
        return;
      }

      if (data && data.success) {
        if (onSuccess) onSuccess(data.message);
        onClose();
      } else {
        setErro(data?.message || 'Erro ao processar o reembolso.');
      }
    } catch (err) {
      setErro('Erro de conexão ao tentar processar o reembolso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Largo e Horizontal (max-w-4xl) */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Processar Reembolso</h3>
              <p className="text-xs text-slate-500 font-mono">Reserva #{reserva?.codigo || reserva?.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Layout Horizontal: 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              
              {/* Valor Máximo Alerta */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Valor Máximo Permitido:</span>
                <span className="font-bold text-slate-900 font-mono">CVE {valorMaximo.toLocaleString('pt-CV', { minimumFractionDigits: 0 })}</span>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Valor a Reembolsar (CVE) *
                </label>
                <input
                  type="number"
                  step="any"
                  max={valorMaximo}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-medium text-slate-900"
                  placeholder="0"
                  required
                />
              </div>

              {/* Estado do Reembolso */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Estado do Reembolso *
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-900"
                >
                  <option value="Solicitado">Solicitado</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Em processamento">Em processamento</option>
                  <option value="Reembolsado">Reembolsado</option>
                  <option value="Falhou">Falhou (Retomar depois)</option>
                </select>
              </div>

              {/* Referência do Operador */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Referência do Operador / Transação
                </label>
                <input
                  type="text"
                  value={referenciaOperador}
                  onChange={(e) => setReferenciaOperador(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-900"
                  placeholder="Ex: TXN-9847583920"
                />
              </div>

            </div>

            {/* Coluna Direita */}
            <div className="space-y-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Upload de Comprovativo Ficheiro */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Comprovativo de Reembolso (Ficheiro)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4 px-4 text-center">
                      <UploadCloud size={24} className="text-slate-400 mb-1" />
                      <p className="text-xs text-slate-600 font-medium">
                        {comprovativoFile ? comprovativoFile.name : 'Clique para carregar PDF ou Imagem'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG (Máx. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,image/*"
                      onChange={(e) => setComprovativoFile(e.target.files[0])}
                    />
                  </label>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Motivo do Reembolso *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none text-slate-900"
                    placeholder="Justifique a razão do reembolso..."
                    required
                  />
                </div>
              </div>

              {/* Política Aceite OBRIGATÓRIA */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="politicaAceite"
                  checked={politicaAceite}
                  onChange={(e) => setPoliticaAceite(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="politicaAceite" className="text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  Confirmo a conformidade e política aceite para esta transação.
                </label>
              </div>

            </div>

          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !politicaAceite}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'A processar...' : 'Confirmar Reembolso'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReembolsoModal;