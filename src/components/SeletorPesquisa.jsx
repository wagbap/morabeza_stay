import { Children, useEffect, useId, useRef, useState } from 'react';

export default function SeletorPesquisa({ children, value, defaultValue, onChange, className = '', ...props }) {
  className = className.replace(/\bfocus(?:-visible)?:[^\s]+/g, '').trim();
  const options = Children.toArray(children).flatMap(child => Array.isArray(child) ? child : [child]);
  const itens = options.map(option => ({ value: String(option.props.value ?? option.props.children), label: option.props.children, disabled: option.props.disabled }));
  const [local, setLocal] = useState(defaultValue ?? itens[0]?.value ?? '');
  const atual = String(value ?? local);
  const [aberto, setAberto] = useState(false);
  const root = useRef(null), trigger = useRef(null), refs = useRef([]);
  const id = useId();
  useEffect(() => {
    if (!aberto) return;
    const fechar = event => { if (!root.current?.contains(event.target)) setAberto(false); };
    document.addEventListener('pointerdown', fechar);
    return () => document.removeEventListener('pointerdown', fechar);
  }, [aberto]);
  const abrir = ultimo => {
    setAberto(true);
    requestAnimationFrame(() => refs.current[ultimo ? itens.length - 1 : Math.max(0, itens.findIndex(item => item.value === atual))]?.focus());
  };
  const selecionar = item => {
    setLocal(item.value);
    onChange?.({ target: { value: item.value } });
    setAberto(false);
    trigger.current?.focus();
  };
  const label = itens.find(item => item.value === atual)?.label ?? itens[0]?.label;
  if (itens.length <= 1) return <span className={className}>{label}</span>;
  return <span ref={root} className="relative block min-w-0" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setAberto(false); }}>
    <button {...props} ref={trigger} type="button" aria-haspopup="listbox" aria-expanded={aberto} aria-controls={id} className={`${className} block border-0 text-left focus-visible:outline-none focus-visible:ring-0`} onClick={() => aberto ? setAberto(false) : abrir(false)} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); abrir(event.key === 'ArrowUp'); }
    }}>{label}</button>
    {aberto && <span id={id} role="listbox" aria-label={props['aria-label']} className="absolute left-0 top-full z-[150] mt-2 block max-h-64 w-max min-w-full max-w-[calc(100vw-3rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl" onKeyDown={event => {
      if (event.key === 'Escape' || event.key === 'Tab') { setAberto(false); if (event.key === 'Escape') { event.preventDefault(); trigger.current?.focus(); } return; }
      const index = refs.current.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown' ? (index + 1) % itens.length : event.key === 'ArrowUp' ? (index + itens.length - 1) % itens.length : event.key === 'Home' ? 0 : event.key === 'End' ? itens.length - 1 : null;
      if (next !== null) { event.preventDefault(); refs.current[next]?.focus(); }
    }}>{itens.map((item, index) => <button key={item.value} ref={element => { refs.current[index] = element; }} type="button" role="option" aria-selected={item.value === atual} disabled={item.disabled} onClick={() => selecionar(item)} className={`block w-full rounded-xl border-0 px-3 py-2 text-left text-sm font-semibold text-gray-900 transition-colors outline-none hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-40 ${item.value === atual ? 'bg-blue-50' : 'bg-white'}`}>{item.label}</button>)}</span>}
  </span>;
}
