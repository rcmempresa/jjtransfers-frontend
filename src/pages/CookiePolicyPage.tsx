import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

const CookiePolicyPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang] || {};

  // Assume que o conteúdo da política está em t.cookies.details
  const policyContent = t.cookies?.details;
  
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Função para limpar o consentimento e reabrir o banner no próximo carregamento
  const handleResetConsent = () => {
    // Remove o item do localStorage
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    
    // Mostra uma mensagem de confirmação breve
    setShowConfirmation(true);
    
    // O ideal seria forçar um refresh da página para o App.tsx detetar a ausência do cookie
    setTimeout(() => {
        window.location.reload(); 
    }, 1500);
  };

  if (!policyContent) {
    return (
      <div className="container mx-auto p-8 text-center min-h-[400px]">
        <h1 className="text-3xl font-bold text-red-600">Erro de Carregamento</h1>
        <p className="mt-4">O conteúdo da Política de Cookies para o idioma '{lang}' não foi encontrado nas traduções.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-4xl min-h-screen">
      
      {/* Título Principal */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        {policyContent.title}
      </h1>
      
      {/* Botão de Gestão/Reinicialização de Cookies */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-md rounded-lg">
        <p className="text-sm text-gray-700 mb-3 md:mb-0 md:mr-4">
          {policyContent.managementNote}
        </p>
        <button
          onClick={handleResetConsent}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition duration-150 shadow-md whitespace-nowrap"
        >
          {policyContent.resetButtonText}
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-green-500 text-white text-center font-bold z-50">
          Consentimento redefinido. A página irá recarregar para reexibir o banner.
        </div>
      )}

      {/* Secção 1: Introdução e O que são Cookies */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">{policyContent.sections.intro.title}</h2>
        <p className="text-gray-600 mb-4">{policyContent.sections.intro.p1}</p>
        <p className="text-gray-600">{policyContent.sections.intro.p2}</p>
      </section>

      {/* Secção 2: Tipos de Cookies */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">{policyContent.sections.types.title}</h2>
        
        {/* Lista de Tipos de Cookies */}
        <ul className="space-y-4">
          {policyContent.sections.types.list.map((item, index) => (
            <li key={index} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50/50 rounded-r-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>
      
      {/* Secção 3: Como Gerir (Browsers) */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">{policyContent.sections.management.title}</h2>
        <p className="text-gray-600 mb-4">{policyContent.sections.management.p1}</p>
        
        <h4 className="text-lg font-semibold mt-4 mb-2">Links Úteis:</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="hover:underline">Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="hover:underline">Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471" target="_blank" rel="noopener noreferrer" className="hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae07" target="_blank" rel="noopener noreferrer" className="hover:underline">Edge</a></li>
        </ul>
      </section>

      {/* Rodapé e Data */}
      <div className="mt-12 pt-4 border-t text-sm text-gray-500 text-center">
        <p>Última atualização: {policyContent.lastUpdated}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 block">Voltar à Página Principal</Link>
      </div>
      
    </div>
  );
};

export default CookiePolicyPage;