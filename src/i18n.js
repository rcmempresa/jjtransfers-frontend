import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Nota: Adapte o caminho se as suas traduções estiverem noutro lugar.
// Se as suas traduções estão em './data/translations', certifique-se de que o caminho está correto.
import { translations } from './data/translations'; 

// --- Configurações básicas de localização (CORRIGIDO PARA O BROWSER) ---
// Usa 'import.meta.env' para ler variáveis no frontend (Vite/Rollup)
// ATENÇÃO: As variáveis no seu .env devem começar com VITE_ (ex: VITE_SUPPORTED_LOCALES)
const supportedLocales = import.meta.env.VITE_SUPPORTED_LOCALES
  ? import.meta.env.VITE_SUPPORTED_LOCALES.split(",")
  : ["pt"];

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || "pt";
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// Inicialização do i18next
// ----------------------------------------------------------------------------
i18n
  .use(initReactI18next) // Conecta o i18next aos componentes React
  .init({
    // Carrega os dicionários que importámos
    resources: translations, 
    
    // Define o idioma a usar por padrão
    lng: defaultLocale,      
    
    // Idioma de recurso caso uma chave não seja encontrada
    fallbackLng: defaultLocale, 

    // Define o namespace padrão para evitar ter de o especificar sempre (opcional)
    ns: ['common'],
    defaultNS: 'common',

    // =======================================================
    // CORREÇÃO CRÍTICA PARA AS VARIÁVEIS {{capacity}} E {{count}}
    // =======================================================
    interpolation: {
      // O 'escapeValue: false' impede que as chaves {{var}} sejam ignoradas 
      // e garante que sejam substituídas pelos valores corretos.
      escapeValue: false, 
    },
    // =======================================================

    // Configurações do React
    react: {
      useSuspense: false, 
    }
  });

export default i18n;
