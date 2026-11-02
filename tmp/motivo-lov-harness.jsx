import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import i18next from 'i18next';
import {I18nextProvider} from 'react-i18next';
import Form from '../src/components/gest/FormularioExcecaoExperiencia.jsx';
await i18next.init({lng:'pt',resources:{pt:{translation:{}}},initImmediate:false});
function Harness(){const [form,setForm]=useState({inicio:'2026-10-31',fim:'2026-10-31',motivo:'',tipo:'fechado'});const [version,setVersion]=useState(0);window.resetLov=()=>{setForm({inicio:'2026-10-31',fim:'2026-10-31',motivo:'',tipo:'fechado'});setVersion(v=>v+1)};window.currentForm=form;return <div className="fixed inset-0 flex items-center justify-center bg-[#182740]/65 p-4"><section className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[14px] bg-white p-5 text-[#050b48] shadow-2xl sm:p-7" style={{fontFamily:'Arial,sans-serif'}}><h1 className="mb-6 text-[26px] font-bold">Folga ou data excecional</h1><Form key={version} form={form} setForm={setForm} DateField={p=><input {...p} type="date"/>} busy={false} onSubmit={()=>{window.submitted={...form}}}/></section></div>};
createRoot(document.getElementById('lov-test')).render(<I18nextProvider i18n={i18next}><Harness/></I18nextProvider>);
