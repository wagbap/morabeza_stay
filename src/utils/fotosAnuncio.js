export function temFotoAnuncio(fotos) {
  return Array.isArray(fotos) && fotos.some(foto => {
    if (foto?.uploadCompleto === false || foto?.uploading || foto?.erro) return false;
    const url = typeof foto === 'string' ? foto : foto?.caminho_url || foto?.url || foto?.path || foto?.src || foto?.caminho || foto?.imagem_url;
    return typeof url === 'string' && Boolean(url.trim()) &&
      !/^(blob:|data:|null$|undefined$|false$)/i.test(url.trim()) &&
      !/placehold\.co|sem[-_+ ]?(foto|imagem)|no[-_ ]?photo/i.test(url);
  });
}
