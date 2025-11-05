import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
// IMPORTANTE: Assumo que o seu ficheiro de traduções existe neste caminho
// Se o seu ficheiro 'translations.ts' estiver noutro local, terá de ajustar este caminho.
import { translations } from '../data/translations'; 

// =================================================================
// Interfaces e Tipos
// =================================================================
// Define os idiomas disponíveis com base nas chaves do objeto translations
type LanguageKey = keyof typeof translations; 
// Define a estrutura de tradução, assumindo 'pt' como base (poderia ser 'en')
type Translation = typeof translations.pt; 
// Tipo para as variáveis de interpolação { key: value }
type Variables = { [key: string]: string | number };

interface LanguageContextType {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
  // Função de tradução que suporta interpolação de variáveis
  t: (key: string, variables?: Variables) => string;
}

// =================================================================
// 1. Contexto
// =================================================================
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// =================================================================
// 2. Hook Principal (useLanguage)
// =================================================================
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Este erro indica que o hook foi usado fora do Provider
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// =================================================================
// 3. Função de Interpolação de Variáveis (CORE DA CORREÇÃO)
// Procura por {{variavel}} e substitui pelo valor em 'variables'.
// =================================================================
const interpolate = (text: string, variables?: Variables): string => {
  if (!variables || !text) {
    return text;
  }
  
  // Regex para encontrar {{qualquerCoisa}}
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    const value = variables[key.trim()];
    // Se a variável existir, retorna o valor (convertido para string); caso contrário, retorna a string original {{key}}
    return value !== undefined && value !== null ? String(value) : match;
  });
};

// =================================================================
// 4. Provider (LanguageProvider)
// =================================================================
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Inicializa o idioma a partir do localStorage ou usa 'pt' como padrão
  const [language, setLanguage] = useState<LanguageKey>(() => {
    const savedLang = localStorage.getItem('appLanguage');
    return (savedLang === 'pt' || savedLang === 'en') ? savedLang : 'pt';
  });

  // Salva o idioma no localStorage sempre que ele muda
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Função de Tradução (t)
  const t = useMemo(() => {
    
    // Função auxiliar para aceder a chaves aninhadas (ex: 'booking.title')
    const getNestedTranslation = (key: string, dictionary: Translation): string | undefined => {
      const parts = key.split('.');
      let current: any = dictionary;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Chave não encontrada
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };
    
    // A função 't' final que será usada pelos componentes
    return (key: string, variables?: Variables): string => {
      // 1. Obter o dicionário atual
      const dictionary = translations[language] as Translation;
      
      // 2. Obter a string de tradução (pode ser a chave aninhada)
      const rawText = getNestedTranslation(key, dictionary);

      if (rawText === undefined) {
        // Loga um aviso se a chave não for encontrada para depuração
        console.warn(`Translation key not found for current language (${language}): ${key}`);
        return key; // Retorna a chave como fallback
      }
      
      // 3. Interpolar variáveis (A correção da chave {{}})
      return interpolate(rawText, variables);
    };

  }, [language]);


  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
