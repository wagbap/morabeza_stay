import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Users, ChevronLeft, ChevronRight, 
  Check, ShieldCheck, Info, Camera, Calendar, Minus, Plus, 
  Headphones, Heart, Sunset, Share2, Sun 
} from 'lucide-react';

const ExperienciaDetalhes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Estados dinâmicos da API
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para a imagem principal
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  
  // Estados para o formulário de reserva
  const [quantidadePessoas, setQuantidadePessoas] = useState(1);
  const [dataPasseio, setDataPasseio] = useState(new Date().toISOString().split('T')[0]);
  const [periodo, setPeriodo] = useState("Manhã");
  const [horario, setHorario] = useState("");

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://welovepalop.com/api/get_experiencias.php?slug=${slug}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const dados = Array.isArray(result.data) ? result.data[0] : result.data;
          
          if (dados) {
            setExperiencia(dados);
            // Define a imagem principal como a primeira imagem ou imagem_principal
            const imagemInicial = dados.imagem_principal || (dados.imagens && dados.imagens[0]?.caminho_url);
            setImagemPrincipal(imagemInicial);
          } else {
            setExperiencia(null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        setExperiencia(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, [slug]);


  const handleReservarAgora = () => {
  // Verifica se o user logado existe
  const userLogado = localStorage.getItem('user');
  
  if (!userLogado) {
    alert("Por favor, faça login com o Google primeiro.");
    return;
  }

  // Envia os dados da seleção para o Checkout
  navigate('/checkout', { 
    state: { 
      reservaData: {
        titulo: experiencia.titulo,
        imagem: experiencia.imagem_principal,
        localizacao: experiencia.ilha,
        entrada: dataPasseio,
        saida: dataPasseio, // ou check-out para alojamento
        precoTotal: subtotalDinamico
      }
    } 
  });
};


  // Definição dos períodos visuais e cálculo dinâmico do range vindo do horários_json
  const periodosUI = [
    { label: 'Manhã', range: [8, 11], Icon: Sun, color: 'text-yellow-500' },
    { label: 'Meio dia', range: [12, 14], Icon: Sun, color: 'text-orange-500' },
    { label: 'Tarde', range: [15, 17], Icon: Sunset, color: 'text-red-400' }
  ].map(p => {
    // Extrai horários do JSON para criar o label (ex: 08:00 - 10:00)
    let timeRange = "Indisponível";
    let temHorarios = false;

    if (experiencia?.horarios_json) {
      try {
        const todosHorarios = JSON.parse(experiencia.horarios_json);
        const horasNoPeriodo = todosHorarios.filter(h => {
          const hora = parseInt(h.split(':')[0], 10);
          return hora >= p.range[0] && hora <= p.range[1];
        }).sort();

        if (horasNoPeriodo.length > 0) {
          timeRange = `${horasNoPeriodo[0]} - ${horasNoPeriodo[horasNoPeriodo.length - 1]}`;
          temHorarios = true;
        }
      } catch (e) {
        console.error("Erro ao processar JSON para labels", e);
      }
    }

    return { ...p, timeRange, temHorarios };
  });

  // Lógica de Filtragem de Horários específicos para os botões inferiores
  const getHorariosFiltrados = () => {
    if (!experiencia || !experiencia.horarios_json) return [];
    
    try {
      const todosHorarios = JSON.parse(experiencia.horarios_json);
      const configPeriodo = periodosUI.find(p => p.label === periodo);
      
      return todosHorarios.filter(h => {
        const horaNum = parseInt(h.split(':')[0], 10);
        return horaNum >= configPeriodo.range[0] && horaNum <= configPeriodo.range[1];
      });
    } catch (e) {
      return [];
    }
  };

  const horariosDisponiveis = getHorariosFiltrados();

  // Seleciona o primeiro horário disponível automaticamente ao trocar período
  useEffect(() => {
    if (horariosDisponiveis.length > 0) {
      setHorario(horariosDisponiveis[0]);
    } else {
      setHorario("");
    }
  }, [periodo, experiencia, horariosDisponiveis.length]);

  // Função para trocar a imagem principal
  const trocarImagemPrincipal = (novaImagem) => {
    setImagemPrincipal(novaImagem);
  };

  if (loading) return <div className="p-20 text-center font-bold text-[#1a2b6d]">Carregando detalhes...</div>;
  if (!experiencia) return <div className="p-20 text-center font-bold text-red-500">Experiência não encontrada.</div>;

  // LÓGICA DE PREÇO E DISPONIBILIDADE
  const precoBase = parseFloat(experiencia.preco) || 0;

  const getPrecoAtual = () => {
    if (!experiencia.regras_disponibilidade) return precoBase;
    const regra = experiencia.regras_disponibilidade.find(r => 
      r.data_especifica === dataPasseio && r.periodo === periodo
    );
    return regra && regra.preco_especial ? parseFloat(regra.preco_especial) : precoBase;
  };

  const verificarDisponibilidade = () => {
    if (horariosDisponiveis.length === 0) return "Indisponível neste período";
    const regra = experiencia.regras_disponibilidade?.find(r => 
      r.data_especifica === dataPasseio && r.periodo === periodo
    );
    if (regra) {
      if (parseInt(regra.disponivel) === 0 || parseInt(regra.vagas_disponiveis) === 0) return "Esgotado";
      if (quantidadePessoas > parseInt(regra.vagas_disponiveis)) return `Apenas ${regra.vagas_disponiveis} vagas`;
    }
    return "Disponível";
  };

  const precoVigente = getPrecoAtual();
  const subtotalDinamico = precoVigente * quantidadePessoas;
  const statusVagas = verificarDisponibilidade();

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans text-[#1a2b6d]">
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Início</span> <ChevronRight size={10} />
        <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/experiencias')}>Experiências</span> <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold">{experiencia.titulo}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-2">
          <div className="space-y-3 mb-6">
            <div className="relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden group">
              <img 
                src={imagemPrincipal} 
                className="w-full h-full object-cover" 
                alt={experiencia.titulo} 
              />
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                <ChevronLeft size={18}/>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                <ChevronRight size={18}/>
              </button>
              <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
                <Users size={12}/> {experiencia.categoria_nome || 'Aventura'}
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 h-20">
              {experiencia.imagens?.slice(0, 4).map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => trocarImagemPrincipal(img.caminho_url)}
                  className="rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all cursor-pointer"
                >
                  <img src={img.caminho_url} className="w-full h-full object-cover" alt={`Thumbnail ${i}`} />
                </div>
              ))}
              <div className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                <Camera size={16}/>
                <span className="text-[9px] font-black uppercase tracking-tighter">{experiencia.imagens?.length || 0} fotos</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{experiencia.titulo}</h1>
            <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-orange-400 text-orange-400"/> 
                {experiencia.rating_formatado} ({experiencia.reviews_recentes?.length || 0} avaliações)
              </div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><MapPin size={14}/> {experiencia.ilha}, {experiencia.localizacao}</div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><Clock size={14}/> {experiencia.duracao}</div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><Users size={14}/> Máx: {experiencia.max_pessoas}</div>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{experiencia.descricao_curta}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 py-6 border-y border-slate-100">
            {experiencia.inclusoes?.map((inc, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                <Check size={18} className="text-blue-500"/> {inc.item}
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h3 className="font-black text-lg mb-4 text-[#1a2b6d]">Sobre a experiência</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{experiencia.descricao_longa || experiencia.descricao_curta}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <Calendar className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Confirmação imediata</h4><p className="text-[10px] text-slate-400">Após o pagamento</p></div>
            </div>
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <ShieldCheck className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Cancelamento grátis</h4><p className="text-[10px] text-slate-400">Até 24h antes</p></div>
            </div>
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <Headphones className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Suporte Local</h4><p className="text-[10px] text-slate-400">Guias Certificados</p></div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - SIDEBAR DE RESERVA */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 rounded-[2rem] p-8">
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-bold">{precoVigente.toLocaleString()} CVE</span>
              <span className="text-xs font-semibold text-slate-400">/ pessoa</span>
              {precoVigente !== precoBase && (
                <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">Preço Especial</span>
              )}
            </div>

            <div className="space-y-6">
              {/* DATA */}
              <div>
                <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Data do passeio</label>
                <input 
                  type="date" 
                  value={dataPasseio} 
                  onChange={(e) => setDataPasseio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-[#1a2b6d]" 
                />
              </div>

              {/* PERÍODO (VISUAL DA IMAGEM) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Período</label>
                <div className="grid grid-cols-3 gap-3">
                  {periodosUI.map((p) => {
                    const isSelected = periodo === p.label;
                    return (
                      <button 
                        key={p.label}
                        disabled={!p.temHorarios}
                        onClick={() => setPeriodo(p.label)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-1 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 shadow-sm' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        } ${!p.temHorarios ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                      >
                        <p.Icon size={18} className={isSelected ? p.color : 'text-slate-300'} fill="currentColor" fillOpacity={0.15}/>
                        <span className={`text-[12px] font-black mt-1 ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{p.label}</span>
                        <span className={`text-[9px] font-medium ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>{p.timeRange}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HORÁRIOS ESPECÍFICOS */}
              <div>
                <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Horário no período</label>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest">
                  {horariosDisponiveis.length > 0 ? (
                    horariosDisponiveis.map(h => (
                      <button 
                        key={h}
                        onClick={() => setHorario(h)}
                        className={`py-3 rounded-xl border transition-all ${horario === h ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-100 text-slate-800 hover:border-slate-300'}`}
                      >
                        {h}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-3 text-[9px] text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed">Indisponível</div>
                  )}
                </div>
              </div>

              {/* Info de preço adicional (conforme imagem) */}
              <div className="w-full py-3 px-4 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                <p className="text-[12px] font-bold text-slate-500 tracking-tight">
                  Cada pessoa adicional: <span className="text-[#1a2b6d]">8 000 CVE</span>
                </p>
              </div>
              {/* PESSOAS */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3 uppercase">Número de pessoas</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setQuantidadePessoas(Math.max(1, quantidadePessoas - 1))}
                    className="w-12 h-12 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>
                  <div className="flex-1 h-12 flex items-center justify-center border border-slate-100 rounded-xl bg-white">
                    <span className="text-[13px] font-bold text-[#1a2b6d]">{quantidadePessoas} {quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}</span>
                  </div>
                  <button 
                    onClick={() => setQuantidadePessoas(Math.min(experiencia.max_pessoas || 10, quantidadePessoas + 1))}
                    className="w-12 h-12 flex items-center justify-center border border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* STATUS */}
              <div className="w-full py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[11px] font-bold text-slate-500 tracking-tight">
                  Disponibilidade: <span className={statusVagas === "Disponível" ? "text-green-600" : "text-red-500"}>{statusVagas}</span>
                </p>
              </div>
            </div>

           
            {/* SECÇÃO DE TOTAIS */}
            <div className="pt-6 border-t border-slate-100 space-y-3 mt-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                <span>Preço por pessoa</span> 
                <span>{precoVigente.toLocaleString()} CVE</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                <span>Subtotal ({quantidadePessoas} p.)</span> 
                <span>{subtotalDinamico.toLocaleString()} CVE</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                <span>Taxa de serviço</span> 
                <span className="text-green-600 text-[10px] bg-green-50 px-2 py-0.5 rounded">GRÁTIS</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-lg font-black tracking-tighter uppercase text-[#1a2b6d]">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">{subtotalDinamico.toLocaleString()} CVE</span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Impostos incluídos</p>
                </div>
              </div>



     <button 
              disabled={statusVagas !== "Disponível"}
              onClick={handleReservarAgora} // <--- ADICIONE ESTA LINHA
              className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] mt-4
                ${statusVagas === "Disponível" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
            >
              <Calendar size={18}/> {statusVagas === "Disponível" ? "Reservar agora" : statusVagas}
            </button>
           
          
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperienciaDetalhes;