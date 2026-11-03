import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Truck, Mountain, Gem, Leaf, Zap, Check, ChevronDown } from 'lucide-react';

function categoriaVisual(nome = '') {
  const normalizado = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalizado.includes('suv')) return [Mountain, 'suv'];
  if (normalizado.includes('econom')) return [Leaf, 'economico'];
  if (normalizado.includes('pickup') || normalizado.includes('pick-up')) return [Truck, 'pickup'];
  if (normalizado.includes('lux')) return [Gem, 'luxo'];
  if (normalizado.includes('eletr') || normalizado.includes('electric')) return [Zap, 'eletrico'];
  return [Car, null];
}

export default function SeletorCategoria({ tipos, value, onChange, disabled }) {
  const { t } = useTranslation();
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const options = useRef([]);
  const [aberto, setAberto] = useState(false);
  const selecionado = tipos.find(tipo => String(tipo.id) === String(value));
  const [Icone] = categoriaVisual(selecionado?.nome);
  const label = tipo => {
    const [, chave] = categoriaVisual(tipo.nome);
    return chave ? t(`carro_categoria_${chave}`, tipo.nome) : tipo.nome;
  };

  useEffect(() => {
    const fechar = event => {
      if (!root.current?.contains(event.target)) setAberto(false);
    };
    document.addEventListener('pointerdown', fechar);
    document.addEventListener('focusin', fechar);
    return () => {
      document.removeEventListener('pointerdown', fechar);
      document.removeEventListener('focusin', fechar);
    };
  }, []);

  useEffect(() => {
    if (aberto) {
      const index = tipos.findIndex(tipo => String(tipo.id) === String(value));
      options.current[Math.max(index, 0)]?.focus();
    }
  }, [aberto, tipos, value]);

  return (
    <div ref={root} className="relative">
      <label id={`${id}-label`} className="mb-2 block text-sm font-semibold text-gray-700">
        {t('carro_categoria_label', 'Categoria')}
      </label>
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={aberto && !disabled}
        aria-controls={`${id}-options`}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setAberto(!aberto)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setAberto(true);
          }
        }}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-3 text-left text-sm text-gray-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
      >
        <span className="text-gray-400"><Icone size={18} strokeWidth={1.7} aria-hidden="true" /></span>
        <span id={`${id}-value`} className="flex-1">{selecionado ? label(selecionado) : t('carro_categoria_selecionar', 'Selecione a categoria')}</span>
        <span className="text-gray-400"><ChevronDown size={16} aria-hidden="true" className={aberto ? 'rotate-180 transition-transform' : 'transition-transform'} /></span>
      </button>
      {aberto && !disabled && (
        <div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
          onKeyDown={event => {
            const index = options.current.indexOf(document.activeElement);
            let destino;
            if (event.key === 'ArrowDown') destino = (index + 1) % tipos.length;
            if (event.key === 'ArrowUp') destino = (index - 1 + tipos.length) % tipos.length;
            if (event.key === 'Home') destino = 0;
            if (event.key === 'End') destino = tipos.length - 1;
            if (destino !== undefined) {
              event.preventDefault();
              options.current[destino]?.focus();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              setAberto(false);
              trigger.current?.focus();
            }
            if (event.key === 'Tab') setAberto(false);
          }}
        >
          {tipos.map((tipo, index) => {
            const [IconeOpcao] = categoriaVisual(tipo.nome);
            const ativo = String(tipo.id) === String(value);
            return (
              <button key={tipo.id} ref={element => { options.current[index] = element; }}
                type="button" role="option" aria-selected={ativo} tabIndex={-1}
                onClick={() => {
                  onChange(Number(tipo.id));
                  setAberto(false);
                  trigger.current?.focus();
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${ativo ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                <span className={ativo ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600 group-focus:text-blue-600'}>
                  <IconeOpcao size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="flex-1">{label(tipo)}</span>
                {ativo && <span className="text-blue-600"><Check size={16} aria-hidden="true" /></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
