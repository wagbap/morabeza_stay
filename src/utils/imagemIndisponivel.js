export const IMAGEM_INDISPONIVEL = '/images/placeholders/sem-imagem-pt.svg';

export function obterImagemIndisponivel(idioma = 'pt') {
  const lingua = String(idioma).toLowerCase().split('-')[0];
  const codigo = lingua === 'it' ? 'ir' : lingua;
  return `/images/placeholders/sem-imagem-${['pt','en','fr','es','de','ir','cv'].includes(codigo) ? codigo : 'pt'}.svg`;
}

export function substituirImagemIndisponivel(event) {
  const imagem = event.currentTarget;
  const fallback = imagem.dataset?.fallback || IMAGEM_INDISPONIVEL;
  const absoluto = new URL(fallback, imagem.ownerDocument?.baseURI || 'https://morabezastay.cv/').href;
  if (imagem.src !== absoluto) imagem.src = fallback;
}
