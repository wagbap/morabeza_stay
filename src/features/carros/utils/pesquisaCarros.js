export const normalizarPesquisaCarro = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

export const carroEmSantiago = carro => normalizarPesquisaCarro(carro.ilha) === 'santiago';

export function correspondePesquisaCarro(carro, pesquisa, campo = '') {
  const termo = normalizarPesquisaCarro(pesquisa);
  if (!termo) return true;
  const modelo = [carro.marca, carro.modelo].filter(Boolean).join(' ');
  const categorias = [carro.tipo, carro.categoria, carro.categoria_nome, carro.tipo_nome].filter(Boolean).join(' ');
  if (campo === 'marca_modelo') return termo.split(/\s+/).every(palavra => normalizarPesquisaCarro(modelo).includes(palavra));
  if (campo === 'marca') return normalizarPesquisaCarro(carro.marca).includes(termo);
  if (campo === 'modelo') return normalizarPesquisaCarro(modelo).includes(termo);
  if (campo === 'categoria') return normalizarPesquisaCarro(categorias).includes(termo);
  const lugares = termo.match(/^(\d+)\s*(lugares?|pessoas?|seats?)$/);
  if (lugares) return Number(carro.passageiros ?? carro.lugares ?? carro.capacidade) >= Number(lugares[1]);
  return termo.split(/\s+/).every(palavra => normalizarPesquisaCarro([carro.titulo, modelo, categorias, carro.combustivel, carro.localizacao].filter(Boolean).join(' ')).includes(palavra));
}
