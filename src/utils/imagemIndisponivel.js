export const IMAGEM_INDISPONIVEL = 'https://res.cloudinary.com/dpsrmzvsl/image/upload/v1792737521/3586230-sem-foto-sinal-adesivo-com-texto-inscricao-no-fundo-isolado-gratis-vetor_q5vj47.jpg';

export function substituirImagemIndisponivel(event) {
  const imagem = event.currentTarget;
  if (imagem.src !== IMAGEM_INDISPONIVEL) imagem.src = IMAGEM_INDISPONIVEL;
}
