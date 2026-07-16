// src/components/sobre/FAQ.jsx
import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: "O que é a Morabeza Stay?",
      a: "A Morabeza Stay é uma plataforma digital que permite reservar alojamentos, alugar viaturas e descobrir experiências em Cabo Verde de forma simples e segura."
    },
    {
      q: "Como faço uma reserva?",
      a: "Escolha o alojamento, viatura ou experiência desejada, selecione as datas pretendidas, preencha as informações necessárias e conclua o pagamento."
    },
    {
      q: "Como recebo a confirmação da minha reserva?",
      a: "Após a confirmação do pagamento, receberá uma confirmação através do e-mail registado na plataforma."
    },
    {
      q: "Posso cancelar uma reserva?",
      a: "Sim. Os cancelamentos estão sujeitos à Política de Cancelamento da Morabeza Stay disponível na plataforma."
    },
    {
      q: "O que acontece se o anfitrião ou prestador de serviço cancelar a minha reserva?",
      a: "O cliente receberá um reembolso de 100% do valor pago. Sempre que possível, a Morabeza Stay poderá ajudar a encontrar uma alternativa disponível."
    },
    {
      q: "Os pagamentos são seguros?",
      a: "Sim. Os pagamentos são processados através de plataformas de pagamento seguras integradas na Morabeza Stay."
    },
    {
      q: "Posso anunciar o meu alojamento na Morabeza Stay?",
      a: "Sim. Os proprietários de alojamentos podem criar uma conta de anfitrião e submeter os seus anúncios para aprovação."
    },
    {
      q: "Posso anunciar a minha viatura para aluguer?",
      a: "Sim. Os proprietários de viaturas podem registar-se na plataforma e disponibilizar os seus veículos para aluguer, sujeitos às condições e aprovação da Morabeza Stay."
    },
    {
      q: "Posso criar experiências e atividades na plataforma?",
      a: "Sim. Guias turísticos, operadores e prestadores de atividades podem anunciar experiências para os utilizadores da Morabeza Stay."
    },
    {
      q: "Como posso entrar em contacto com a Morabeza Stay?",
      a: "Poderá contactar a Morabeza Stay através dos canais de contacto disponibilizados na plataforma, incluindo e-mail, telefone e redes sociais oficiais."
    },
    {
      q: "A Morabeza Stay está disponível em todas as ilhas de Cabo Verde?",
      a: "A plataforma iniciou as suas operações com foco na ilha de Santiago e pretende expandir gradualmente para as restantes ilhas de Cabo Verde."
    },
    {
      q: "Preciso de criar uma conta para efetuar reservas?",
      a: "Algumas funcionalidades poderão exigir a criação de uma conta para garantir a segurança, gestão das reservas e comunicação entre as partes envolvidas."
    }
  ];

  return (
    <div className="w-full bg-white">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
            <Zap size={28} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Encontre respostas para as dúvidas mais comuns
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  {faq.q}
                </span>
                {faqOpen === index ? (
                  <ChevronUp size={20} className="text-blue-600 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0 ml-4" />
                )}
              </button>
              {faqOpen === index && (
                <div className="p-4 md:p-5 bg-blue-50/50 border-t border-gray-200">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Zap size={14} className="text-blue-500" />
            FAQ atualizado regularmente
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-500">Perguntas gerais</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-500">Respostas úteis</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-500">Em atualização</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;