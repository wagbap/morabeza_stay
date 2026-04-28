import React, { useState } from 'react';
import { Check, User, Calendar, MapPin, Clock, Users, ChevronRight, Plus, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import DataModal from './DataModal'; // Importar os modais
import HorarioModal from './HorarioModal';

const Checkout = () => {
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [isHorarioModalOpen, setHorarioModalOpen] = useState(false);
  const [participantes, setParticipantes] = useState([{ id: 1 }]);

  // Simulação de dados (viriam do seu state/context)
  const reserva = {
    titulo: "Cidade Velha Cultura & Tour",
    local: "Cidade Velha, Santiago",
    data: "24 de maio de 2024",
    periodo: "Manhã (08:00)",
    total: "9.000"
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* STEPPER - IGUAL À IMAGEM */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4">
          {[
            { n: 1, label: 'Dados do participante', check: true },
            { n: 2, label: 'Pagamento', check: true },
            { n: 3, label: 'Pagamento' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center min-w-[120px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                  s.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                  s.check ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-400'
                }`}>
                  {s.check ? <Check size={14} strokeWidth={3} /> : s.n}
                </div>
                <span className={`text-[10px] whitespace-nowrap ${s.active || s.check ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-200 mx-2 mb-6"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="lg:col-span-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Dados dos participantes</h1>
            <p className="text-slate-500 text-sm mb-6">Preencha os dados para todos os participantes.</p>

            {/* INFO BOX AZUL */}
            <div className="bg-[#F0F7FF] border border-blue-100 rounded-lg p-4 flex gap-3 mb-8">
              <div className="w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center text-blue-600 text-[10px] font-bold italic shrink-0">i</div>
              <div>
                <p className="text-sm font-bold text-blue-900">Informação importante</p>
                <p className="text-xs text-blue-700">O nome informado deve ser igual ao documento de identificação.</p>
              </div>
            </div>

            {/* PARTICIPANTE PRINCIPAL */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-blue-900 mb-4">Participante principal <span className="font-normal text-slate-400 text-xs">(responsável pela reserva)</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputGroup label="Nome completo *" placeholder="Ex: João Maria Silva" />
                <InputGroup label="Email *" placeholder="Ex: joao@email.com" />
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Telefone *</label>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden h-[45px]">
                    <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-xs font-bold gap-1">🇨🇻 +238</div>
                    <input className="flex-1 px-3 text-sm outline-none" placeholder="Ex: 991 23 45" />
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE ACOMPANHANTES */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-blue-900 uppercase">Participantes</h3>
                <button onClick={() => setParticipantes([...participantes, {id: Date.now()}])} className="text-blue-600 text-xs font-bold flex items-center gap-1">
                   + Adicionar participante
                </button>
              </div>

              {participantes.map((p, index) => (
                <div key={p.id} className="p-6 border border-slate-100 rounded-xl relative group">
                  <div className="flex items-center gap-3 mb-4">
                    <User size={18} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">Participante {index + 2}</span>
                    <button onClick={() => setParticipantes(participantes.filter(item => item.id !== p.id))} className="ml-auto text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6"><InputGroup label="Nome completo *" placeholder="Ex: Maria da Luz Gomes" /></div>
                    <div className="md:col-span-3"><SelectGroup label="Idade *" options={['Selecione', 'Adulto', 'Criança']} /></div>
                    <div className="md:col-span-3"><SelectGroup label="Nacionalidade *" options={['Selecione', 'Cabo-verdiana', 'Portuguesa']} /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-between h-[55px]">
              <button className="px-8 border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50"><ArrowLeft size={18}/> Voltar</button>
              <button className="px-10 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">Continuar para pagamento <ChevronRight size={18}/></button>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO (FIXO) */}
          <div className="lg:col-span-4">
            <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-blue-900 mb-6">Resumo da reserva</h2>
              <div className="flex gap-4 mb-6">
                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=200" className="w-20 h-20 rounded-lg object-cover" alt="" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Cidade Velha Cultura & Tour</h4>
                  <div className="mt-2 space-y-1 text-[11px] font-bold text-slate-400">
                    <p className="flex items-center gap-2"><Clock size={12}/> 3 - 4 horas</p>
                    <p className="flex items-center gap-2"><Users size={12}/> 1 - 15 pessoas</p>
                    <p className="flex items-center gap-2"><MapPin size={12}/> Cidade Velha, Santiago</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-50 pt-6">
                <ResumoItem label="Data selecionada" value={reserva.data} onEdit={() => setDataModalOpen(true)} />
                <ResumoItem label="Período" value={reserva.periodo} onEdit={() => setHorarioModalOpen(true)} />
                <ResumoItem label="Participantes" value={`${participantes.length + 1} pessoas`} onEdit={() => {}} />
                
                <div className="flex justify-between text-xs pt-2">
                  <span className="text-slate-500">Preço por pessoa</span>
                  <span className="font-bold text-blue-900 tracking-tight">A partir de 4.500 CVE</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-lg font-bold text-blue-900">Total</span>
                  <span className="text-xl font-bold text-blue-600 tracking-tighter">Sob consulta</span>
                </div>

                <div className="bg-[#F0F7FF] p-4 rounded-xl flex gap-3">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-blue-900">Reserva 100% segura</p>
                    <p className="text-[9px] text-blue-700 leading-tight mt-1 opacity-80">Os seus dados estão protegidos e a sua reserva será confirmada após o pagamento.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {isDataModalOpen && <DataModal onClose={() => setDataModalOpen(false)} />}
      {isHorarioModalOpen && <HorarioModal onClose={() => setHorarioModalOpen(false)} />}
    </div>
  );
};

// Componentes Auxiliares para manter o código limpo
const InputGroup = ({ label, placeholder }) => (
  <div className="w-full">
    <label className="text-xs font-bold text-slate-700 block mb-2">{label}</label>
    <input className="w-full h-[45px] border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-blue-500" placeholder={placeholder} />
  </div>
);

const SelectGroup = ({ label, options }) => (
  <div className="w-full">
    <label className="text-xs font-bold text-slate-700 block mb-2">{label}</label>
    <select className="w-full h-[45px] border border-slate-200 rounded-lg px-3 text-sm outline-none bg-white">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const ResumoItem = ({ label, value, onEdit }) => (
  <div className="flex justify-between items-start">
    <div className="text-xs">
      <p className="font-bold text-slate-800">{label}</p>
      <p className="text-slate-500 mt-1">{value}</p>
    </div>
    <button onClick={onEdit} className="text-blue-600 font-bold text-[10px] underline">Alterar</button>
  </div>
);

export default Checkout;