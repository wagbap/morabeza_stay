// src/components/gest/PoliticasReserva.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowLeft, Save, Calendar, RefreshCw, AlertCircle,
  Clock, DollarSign, Ban, Check, X, Info
} from 'lucide-react';

const API_URL = 'https://welovepalop.com';

export default function PoliticasReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [politicas, setPoliticas] = useState({
    politica_cancelamento_horas: 48,
    politica_cancelamento_reembolso_pct: 100,
    politica_cancelamento_taxa: 0,
    politica_reagendamento_horas: 24,
    politica_reagendamento_max_vezes: 1,
    politica_reagendamento_custo: 0,
    politica_reagendamento_permitido: 1,
    politica_anfitriao_oferece_reagendar: 1,
    politica_anfitriao_reembolso_total: 1
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const fetchPoliticas = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/get_politicas.php?experiencia_id=${id}`);
        const data = await res.json();
        if (data.success) {
          setPoliticas(data.politicas);
          setExperiencia(data.experiencia);
        } else {
          showToast(data.error || 'Erro ao carregar', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro de conexão', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPoliticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/guardar_politicas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiencia_id: parseInt(id), ...politicas })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Políticas guardadas!', 'success');
      } else {
        showToast(data.error || 'Erro ao guardar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro de conexão', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="text-left max-w-3xl">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/gest/minhas-experiencias')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Políticas de Reserva</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {experiencia?.titulo || 'Experiência'}
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-6">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900">Como funcionam as políticas</p>
          <p className="text-xs text-blue-700 mt-1">
            Estas regras definem quando o cliente pode cancelar ou reagendar a reserva, 
            e quanto reembolso recebe. As regras são aplicadas automaticamente em todas as reservas.
          </p>
        </div>
      </div>

      {/* SECÇÃO 1: CANCELAMENTO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Ban className="text-red-500" size={18} />
          <h2 className="text-base font-bold text-slate-900">Cancelamento</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Janela mínima para cancelar (horas)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="168"
                step="6"
                value={politicas.politica_cancelamento_horas}
                onChange={(e) => setPoliticas(p => ({ ...p, politica_cancelamento_horas: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-slate-900 w-16 text-right">
                {politicas.politica_cancelamento_horas}h
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Cliente só pode cancelar se faltarem pelo menos estas horas para o passeio.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Reembolso ao cliente
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={politicas.politica_cancelamento_reembolso_pct}
                onChange={(e) => setPoliticas(p => ({ ...p, politica_cancelamento_reembolso_pct: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-slate-900 w-16 text-right">
                {politicas.politica_cancelamento_reembolso_pct}%
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Taxa fixa de cancelamento (CVE)
            </label>
            <div className="flex items-center gap-3">
              <DollarSign size={14} className="text-slate-400" />
              <input
                type="number"
                min="0"
                step="100"
                value={politicas.politica_cancelamento_taxa}
                onChange={(e) => setPoliticas(p => ({ ...p, politica_cancelamento_taxa: parseFloat(e.target.value) || 0 }))}
                className="flex-1 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECÇÃO 2: REAGENDAMENTO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-blue-500" size={18} />
            <h2 className="text-base font-bold text-slate-900">Reagendamento</h2>
          </div>
          <button
            type="button"
            onClick={() => setPoliticas(p => ({ ...p, politica_reagendamento_permitido: p.politica_reagendamento_permitido ? 0 : 1 }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              politicas.politica_reagendamento_permitido
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {politicas.politica_reagendamento_permitido ? '✅ Permitido' : '❌ Não permitido'}
          </button>
        </div>

        {politicas.politica_reagendamento_permitido === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Janela mínima para reagendar (horas)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="168"
                  step="6"
                  value={politicas.politica_reagendamento_horas}
                  onChange={(e) => setPoliticas(p => ({ ...p, politica_reagendamento_horas: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-slate-900 w-16 text-right">
                  {politicas.politica_reagendamento_horas}h
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Nº máximo de vezes
                </label>
                <select
                  value={politicas.politica_reagendamento_max_vezes}
                  onChange={(e) => setPoliticas(p => ({ ...p, politica_reagendamento_max_vezes: parseInt(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="1">1 vez</option>
                  <option value="2">2 vezes</option>
                  <option value="3">3 vezes</option>
                  <option value="99">Ilimitado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Custo (CVE)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={politicas.politica_reagendamento_custo}
                  onChange={(e) => setPoliticas(p => ({ ...p, politica_reagendamento_custo: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECÇÃO 3: CANCELAMENTO PELO ANFITRIÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-orange-500" size={18} />
          <h2 className="text-base font-bold text-slate-900">Quando o anfitrião cancela</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-700">Oferecer reagendamento</p>
              <p className="text-[10px] text-slate-400">Cliente escolhe nova data ou reembolso</p>
            </div>
            <input
              type="checkbox"
              checked={politicas.politica_anfitriao_oferece_reagendar === 1}
              onChange={(e) => setPoliticas(p => ({ ...p, politica_anfitriao_oferece_reagendar: e.target.checked ? 1 : 0 }))}
              className="w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-700">Reembolso total automático</p>
              <p className="text-[10px] text-slate-400">Se o cliente recusar reagendar</p>
            </div>
            <input
              type="checkbox"
              checked={politicas.politica_anfitriao_reembolso_total === 1}
              onChange={(e) => setPoliticas(p => ({ ...p, politica_anfitriao_reembolso_total: e.target.checked ? 1 : 0 }))}
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* BOTÃO GUARDAR */}
      <button
        onClick={guardar}
        disabled={guardando}
        className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {guardando ? (
          <><Loader2 size={16} className="animate-spin" /> A guardar...</>
        ) : (
          <><Save size={16} /> Guardar Políticas</>
        )}
      </button>
    </div>
  );
}