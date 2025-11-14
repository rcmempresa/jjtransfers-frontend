// components/CookieBanner.jsx
import React from 'react';

/**
 * Componente para exibir o banner de consentimento de cookies.
 * * @param {object} t - Objeto de tradução específico para o banner (t.cookies.banner).
 * @param {function} onAccept - Função para aceitar todos os cookies.
 * @param {function} onReject - Função para rejeitar os cookies não essenciais.
 * @param {function} onManage - Função para gerir/abrir o modal de preferências.
 */
const CookieBanner = ({ t, onAccept, onReject, onManage }) => {
  return (
    // Posição fixa no fundo, com alta prioridade Z-index e cores escuras
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 text-white shadow-2xl z-[1000]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
        
        {/* Título e Texto do Aviso */}
        <div className="flex-1 text-sm md:mr-6">
          <h4 className="font-bold mb-1 text-lg">{t.title}</h4>
          <p>
            {t.text} 
            {/* O link deve levar para a rota que você definiu para a Política de Cookies, por exemplo, /cookies */}
            <a href="/cookies" className="underline hover:text-blue-400 ml-1 font-semibold transition duration-150">
              {t.learnMore}
            </a>
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {/* Botão Principal: Aceitar Todos */}
          <button 
            onClick={onAccept} 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition duration-150 whitespace-nowrap"
          >
            {t.accept}
          </button>
          
          {/* Botão Secundário: Rejeitar Não Essenciais */}
          <button 
            onClick={onReject} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition duration-150 whitespace-nowrap"
          >
            {t.reject}
          </button>

          {/* Botão Terciário: Gerir Preferências */}
          <button 
            onClick={onManage} 
            className="px-4 py-2 border border-gray-500 hover:bg-gray-700 text-sm rounded-lg transition duration-150 whitespace-nowrap"
          >
            {t.manage}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;