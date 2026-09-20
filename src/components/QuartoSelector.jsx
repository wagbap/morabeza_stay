// src/components/QuartoSelector.jsx
import React from 'react';

/**
 * Recebe do useCheckStock:
 *   quartos = [{ quarto_id, tipo_quarto_id, quantidade_total,
 *                quantidade_disponivel, preco_noite, esgotado }]
 * E controla as quantidades selecionadas via `onChange`.
 */
const QuartoSelector = ({ quartos, selecionados, onChange, noites = 1 }) => {
  const getSelecionado = (quartoId) =>
    selecionados.find((s) => s.quarto_id === quartoId)?.quantidade || 0;

  const setQtd = (quarto, novaQtd) => {
    const qtd = Math.max(0, Math.min(novaQtd, quarto.quantidade_disponivel));
    const restantes = selecionados.filter((s) => s.quarto_id !== quarto.quarto_id);
    if (qtd === 0) {
      onChange(restantes);
    } else {
      onChange([
        ...restantes,
        {
          quarto_id: quarto.quarto_id,
          tipo_quarto_id: quarto.tipo_quarto_id,
          quantidade: qtd,
          preco_noite: quarto.preco_noite,
        },
      ]);
    }
  };

  if (!quartos?.length) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Sem quartos configurados para estas datas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quartos.map((q) => {
        const qtdSel = getSelecionado(q.quarto_id);
        const total = q.preco_noite * noites * (qtdSel || 1);

        return (
          <div
            key={q.quarto_id}
            className={`border rounded-lg p-4 flex items-center justify-between ${
              q.esgotado ? 'opacity-50 bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-slate-800">
                Quarto #{q.tipo_quarto_id}
              </div>
              <div className="text-sm text-gray-500">
                {q.preco_noite.toLocaleString('pt-CV')} CVE / noite
              </div>
              <div className="text-xs mt-1">
                {q.esgotado ? (
                  <span className="text-red-600 font-medium">Esgotado</span>
                ) : (
                  <span className="text-green-700">
                    Restam {q.quantidade_disponivel} de {q.quantidade_total}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {qtdSel > 0 && (
                <div className="text-sm font-semibold text-slate-700">
                  {total.toLocaleString('pt-CV')} CVE
                </div>
              )}
              <div className="flex items-center border rounded-lg">
                <button
                  type="button"
                  disabled={q.esgotado || qtdSel === 0}
                  onClick={() => setQtd(q, qtdSel - 1)}
                  className="px-3 py-1 disabled:opacity-30"
                >
                  −
                </button>
                <span className="px-3 py-1 min-w-[2rem] text-center">{qtdSel}</span>
                <button
                  type="button"
                  disabled={q.esgotado || qtdSel >= q.quantidade_disponivel}
                  onClick={() => setQtd(q, qtdSel + 1)}
                  className="px-3 py-1 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuartoSelector;