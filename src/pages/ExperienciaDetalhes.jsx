import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Users, ChevronLeft, ChevronRight, 
  Check, ShieldCheck, Info, Camera, Calendar, Minus, Plus, 
  Headphones, Heart, Sunset, Share2, Sun // <--- ADICIONA O SUN AQUI
} from 'lucide-react';

const ExperienciaDetalhes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [experiencia, setExperiencia] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário de reserva
  const [quantidadePessoas, setQuantidadePessoas] = useState(2);
  const [dataPasseio, setDataPasseio] = useState("2024-05-24");
  const [periodo, setPeriodo] = useState("Manhã");
  const [horario, setHorario] = useState("09:00");

  useEffect(() => {
    // Simulação de fetch da API com base no slug
    const fetchDados = async () => {
      setLoading(true);
      // Aqui entraria sua chamada fetch(apiUrl)
      setLoading(false);
    };
    fetchDados();
  }, [slug]);

  if (loading) return <div className="p-20 text-center font-bold">Carregando detalhes...</div>;

  const precoPorPessoa = 8000;
  const subtotal = precoPorPessoa * quantidadePessoas;


const periodos = [
  { label: 'Manhã', time: '08:00 - 10:00', Icon: Sun, color: 'text-yellow-500' },
  { label: 'Meio dia', time: '12:00 - 14:00', Icon: Sun, color: 'text-orange-500' },
  { label: 'Tarde', time: '15:00 - 17:00', Icon: Sunset, color: 'text-red-400' }
];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans text-[#1a2b6d]">
      {/* Breadcrumbs - Exatamente como na imagem */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span>Início</span> <ChevronRight size={10} />
        <span>Experiências</span> <ChevronRight size={10} />
        <span className="text-slate-500 font-semibold">Moto de Água em Santiago</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - CONTEÚDO */}
        <div className="lg:col-span-2">
          
          {/* Galeria de Imagens */}
        {/* Galeria de Imagens */}
<div className="space-y-3 mb-6">
  {/* Imagem Principal - Alterado de aspect-video (16:9) para uma proporção mais fina */}
  <div className="relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden group">
    <img 
      src="https://images.unsplash.com/photo-1559131397-f94da358f7ca?q=80&w=1200" 
      className="w-full h-full object-cover" 
      alt="Principal" 
    />
    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
      <ChevronLeft size={18}/>
    </button>
    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
      <ChevronRight size={18}/>
    </button>
    <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-xl">
      <Users size={12}/> Passeio Náutico
    </div>
  </div>
  
  {/* Miniaturas - Reduzidas de h-28 para h-20 */}
  <div className="grid grid-cols-5 gap-2 h-20">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all cursor-pointer">
        <img 
          src="https://images.unsplash.com/photo-1559131397-f94da358f7ca?q=80&w=300" 
          className="w-full h-full object-cover" 
          alt="Thumbnail" 
        />
      </div>
    ))}
    <div className="bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-0.5 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
      <Camera size={16}/>
      <span className="text-[9px] font-black uppercase tracking-tighter">18 fotos</span>
    </div>
  </div>
</div>

          {/* Título e Infos Rápidas */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Moto de Água em Santiago</h1>
            <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1"><Star size={14} className="fill-orange-400 text-orange-400"/> 4,8 (126 avaliações)</div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><MapPin size={14}/> Ilha de Santiago</div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><Clock size={14}/> Duração: 30 min</div>
              <div className="flex items-center gap-1 text-slate-400">|</div>
              <div className="flex items-center gap-1"><Users size={14}/> Guia local</div>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-8">
            Sinta a adrenalina e explore as águas cristalinas de Santiago em uma aventura inesquecível de moto de água.
          </p>

          {/* Ícones de Inclusão */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 py-6 border-y border-slate-100">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter"><ShieldCheck size={18} className="text-slate-400"/> Equipamento incluído</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter"><Headphones size={18} className="text-slate-400"/> Instruções de segurança</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter"><Info size={18} className="text-slate-400"/> Água e lanche</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter"><ShieldCheck size={18} className="text-slate-400"/> Seguro de viagem</div>
          </div>

          {/* Sobre a Experiência */}
          <div className="mb-12">
            <h3 className="font-black text-lg mb-4">Sobre a experiência</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              Após um briefing de segurança, você pilotará uma moto de água moderna acompanhado por um instrutor experiente. A atividade acontece em mar aberto, com uma vista incrível da costa de Santiago.
            </p>
          </div>

          {/* Informações Importantes */}
          <div className="mb-12">
            <h3 className="font-black text-lg mb-6">Informações importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Check size={16} className="text-green-500"/> Idade mínima: 12 anos</div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Check size={16} className="text-green-500"/> Saber nadar é recomendado</div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Check size={16} className="text-green-500"/> Levar documento de identificação</div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Check size={16} className="text-green-500"/> Cancelamento grátis até 24h antes</div>
            </div>
          </div>

          {/* Cards Inferiores (Confirmação, Cancelamento, Atendimento) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <Calendar className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Confirmação imediata</h4><p className="text-[10px] text-slate-400">Após o pagamento</p></div>
            </div>
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <ShieldCheck className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Cancelamento grátis</h4><p className="text-[10px] text-slate-400">Até 24h antes do passeio</p></div>
            </div>
            <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl">
              <Headphones className="text-blue-600 shrink-0" size={24}/>
              <div><h4 className="font-bold text-xs">Atendimento 24/7</h4><p className="text-[10px] text-slate-400">Estamos sempre disponíveis</p></div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA - SIDEBAR DE RESERVA */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 rounded-[2rem] p-8">
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-bold">8 000 CVE</span>
              <span className="text-xs font-semibold text-slate-400">/ pessoa</span>
            </div>

            <div className="space-y-6">
              {/* Data */}
              <div>
              <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3">
                Data do passeio
              </label>
                    <div className="relative">
                      <input type="date" value={dataPasseio} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:outline-none" />
                    </div>
                  </div>

           <div className="space-y-3">
    <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3">Escolha o período (horário)</label>
  
  <div className="grid grid-cols-3 gap-2">
    {periodos.map((p) => {
      const isSelected = periodo === p.label;
      return (
        <button 
          key={p.label}
          onClick={() => setPeriodo(p.label)}
          // Adicionado p-3 para reduzir o padding excessivo e items-center para alinhar o conteúdo
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 ${
            isSelected 
              ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' 
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <p.Icon 
              size={14} // Reduzido ligeiramente para equilibrar
              className={isSelected ? p.color : 'text-slate-300'} 
              strokeWidth={3} 
              fill="currentColor"
              fillOpacity={0.15}
            />
            <span className={`text-[12px] font-black tracking-tight ${isSelected ? 'text-[#1a2b6d]' : 'text-slate-800'}`}>
              {p.label}
            </span>
          </div>

          {/* Container das horas com largura controlada */}
          <div className="flex items-center gap-1.5 min-w-[85px]">
            <span className="text-[11px] font-black text-slate-400 leading-none tracking-tight whitespace-nowrap">
              {p.time.split(' - ')[0]}
            </span>
            <span className="text-[11px] font-black text-slate-400 leading-none">-</span>
            <span className="text-[11px] font-black text-slate-400 leading-none tracking-tight whitespace-nowrap">
              {p.time.split(' - ')[1]}
            </span>
          </div>
        </button>
      );
    })}
  </div>
</div>

              {/* Horários */}
              <div>

                    <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3">    Horários disponíveis</label>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest">
                  {['08:00', '09:00', '10:00'].map(h => (
                    <button 
                      key={h}
                      onClick={() => setHorario(h)}
                      className={`py-3 rounded-xl border transition-all ${horario === h ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-100 text-slate-800'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

             {/* Número de pessoas */}
<div className="space-y-3">
  <label className="text-[10px] font-black tracking-[0.1em] text-[#1a2b6d] block mb-3">    Numero de pessoas</label>
  <div className="flex items-center gap-2">
    {/* Botão Menos */}
    <button 
      onClick={() => setQuantidadePessoas(Math.max(1, quantidadePessoas - 1))}
      className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-600"
    >
      <Minus size={18} strokeWidth={3} />
    </button>

    {/* Display Central */}
    <div className="flex-1 h-12 flex items-center justify-center border border-slate-200 rounded-xl bg-white">
      <span className="text-[13px] font-bold text-[#1a2b6d]  tracking-tight">
        {quantidadePessoas} pessoas
      </span>
    </div>

    {/* Botão Mais */}
    <button 
      onClick={() => setQuantidadePessoas(quantidadePessoas + 1)}
      className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-600"
    >
      <Plus size={18} strokeWidth={3} />
    </button>
  </div>

  {/* Info de preço adicional (conforme imagem) */}
  <div className="w-full py-3 px-4 bg-blue-50/50 border border-blue-100/50 rounded-xl">
    <p className="text-[12px] font-bold text-slate-500 tracking-tight">
      Cada pessoa adicional: <span className="text-[#1a2b6d]">8 000 CVE</span>
    </p>
  </div>
</div>

       
              {/* Totais */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Preço por pessoa</span> <span>{precoPorPessoa.toLocaleString()} CVE</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Subtotal ({quantidadePessoas} pessoas)</span> <span>{subtotal.toLocaleString()} CVE</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Taxa de serviço</span> <span>0 CVE</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-lg font-black tracking-tighter">Total</span>
                  <span className="text-xl font-black">{subtotal.toLocaleString()} CVE</span>
                </div>
              </div>

              {/* Botão Reservar */}
              <button className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200">
                <Calendar size={18}/> Reservar agora
              </button>

              {/* Badge Segurança */}
              <div className="flex items-center justify-center gap-3 bg-blue-50/30 p-4 rounded-xl">
                 <ShieldCheck className="text-blue-600" size={24}/>
                 <div className="text-left">
                   <h5 className="text-[10px] font-black uppercase">Pagamento seguro</h5>
                   <p className="text-[9px] text-slate-400">Seus dados protegidos com segurança.</p>
                 </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default ExperienciaDetalhes;