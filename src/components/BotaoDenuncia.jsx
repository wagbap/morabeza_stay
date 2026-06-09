// components/BotaoDenuncia.jsx
import React, { useState, useEffect } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';

const motivosDenuncia = [
    { id: 'impropio', label: 'Conteúdo impróprio ou ofensivo', icon: '🚫' },
    { id: 'falso', label: 'Informação falsa ou enganosa', icon: '❌' },
    { id: 'spam', label: 'Spam ou publicidade excessiva', icon: '📢' },
    { id: 'direitos', label: 'Violação de direitos autorais', icon: '©️' },
    { id: 'seguranca', label: 'Problema com segurança ou localização', icon: '⚠️' },
    { id: 'outro', label: 'Outro motivo', icon: '📝' }
];

const BotaoDenuncia = ({ tipo, itemId, itemTitulo, onDenunciaEnviada }) => {
    const [modalAberto, setModalAberto] = useState(false);
    const [motivoSelecionado, setMotivoSelecionado] = useState('');
    const [descricao, setDescricao] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        // Tentar diferentes chaves no localStorage
        const userData = localStorage.getItem('morabeza_user') || 
                        localStorage.getItem('user') || 
                        localStorage.getItem('morabeza_admin');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUsuarioId(user.id || user.user_id);
            } catch (e) {
                console.error('Erro ao fazer parse do usuário:', e);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!usuarioId) {
            alert('Faça login para denunciar este conteúdo');
            return;
        }

        setEnviando(true);
        try {
            const response = await fetch('/api/denunciar.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    usuario_id: usuarioId,
                    tipo: tipo,
                    item_id: itemId,
                    motivo: motivoSelecionado,
                    descricao: descricao,
                    item_titulo: itemTitulo
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert('✅ Denúncia enviada com sucesso! A nossa equipa irá analisar.');
                setModalAberto(false);
                setMotivoSelecionado('');
                setDescricao('');
                if (onDenunciaEnviada) onDenunciaEnviada();
            } else {
                alert('❌ Erro ao enviar denúncia: ' + (data.message || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro detalhado:', error);
            alert('❌ Erro de conexão: ' + error.message);
        } finally {
            setEnviando(false);
        }
    };

    const getTipoLabel = () => {
        switch(tipo) {
            case 'alojamento': return 'Alojamento';
            case 'carro': return 'Veículo';
            case 'experiencia': return 'Experiência';
            case 'comentario': return 'Comentário';
            default: return 'Conteúdo';
        }
    };

    return (
        <>
            <button 
                onClick={() => setModalAberto(true)} 
                className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                title="Denunciar este conteúdo"
            >
                <Flag size={16} /> Denunciar
            </button>

            {modalAberto && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
                        <div className="border-b p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Denunciar {getTipoLabel()}</h3>
                            </div>
                            <button 
                                onClick={() => setModalAberto(false)} 
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Item:</span> {itemTitulo}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-semibold">Tipo:</span> {getTipoLabel()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo da Denúncia *
                                </label>
                                <select 
                                    required 
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" 
                                    value={motivoSelecionado} 
                                    onChange={(e) => setMotivoSelecionado(e.target.value)}
                                >
                                    <option value="">Selecione um motivo</option>
                                    {motivosDenuncia.map(m => (
                                        <option key={m.id} value={m.label}>
                                            {m.icon} {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição (opcional)
                                </label>
                                <textarea 
                                    rows="4" 
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20" 
                                    value={descricao} 
                                    onChange={(e) => setDescricao(e.target.value)} 
                                    placeholder="Explique com mais detalhes o motivo da denúncia..."
                                />
                            </div>

                            <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-xs text-red-600">
                                    ⚠️ A sua denúncia será analisada pela nossa equipa. 
                                    Denúncias falsas podem resultar em penalizações na sua conta.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setModalAberto(false)} 
                                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={enviando || !motivoSelecionado} 
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {enviando ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Enviando...
                                        </div>
                                    ) : (
                                        'Confirmar Denúncia'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default BotaoDenuncia;