export const getExperiencias = async (filtros = {}) => {
  try {
    // Converte o objeto de filtros em query strings (?categoria=...&preco_max=...)
    const params = new URLSearchParams();
    
    if (filtros.categoria && filtros.categoria !== 'all') params.append('categoria', filtros.categoria);
    if (filtros.localizacao) params.append('localizacao', filtros.localizacao);
    if (filtros.preco_min) params.append('preco_min', filtros.preco_min);
    if (filtros.preco_max) params.append('preco_max', filtros.preco_max);
    if (filtros.pessoas) params.append('pessoas', filtros.pessoas);
    if (filtros.data) params.append('data', filtros.data);

    const response = await fetch(`https://welovepalop.com/api/get_experiencias.php?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Erro ao procurar experiências:", error);
    return [];
  }
};