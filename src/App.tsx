import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { LanguageProvider, useLanguage } from './hooks/useLanguage'; 
import { translations } from './data/translations'; 
import { AuthProvider } from './hooks/useAuth'; 

// Componente para forçar o scroll para o topo em cada navegação
import ScrollToTop from './components/ScrollToTop';

// Componente de Cookies
import CookieBanner from './components/CookieBanner';

// Componentes do Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas Principais
import Home from './pages/Home';
import Booking from './pages/Booking';
import Fleet from './pages/Fleet';
import News from './pages/News'
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Reserve from './pages/Reserve';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import CookiePolicyPage from './pages/CookiePolicyPage'; 

// Componentes da Frota e Serviços
import VehicleDetail from './pages/VehicleDetail'; 
import Services from './pages/Services'; 
import ServiceDetail from './pages/ServiceDetail';

// Importações de Autenticação
import Login from './pages/Login';
import Register from './pages/Register';

// Chave de persistência para o LocalStorage
const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

// --- Componente que contém as Rotas e a Lógica de Cookies ---
const AppContent = () => {
    const { lang } = useLanguage();
    const effectiveLang = lang || 'pt';
    const t = translations[effectiveLang] || {}; 

    // 1. Estados dos Cookies
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const [hasFullConsent, setHasFullConsent] = useState(false);
    
    // 2. Efeito para verificar o consentimento no carregamento
    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

        if (consent === 'accepted') {
            setShowCookieBanner(false);
            setHasFullConsent(true);
        } else if (consent === 'rejected') {
             setShowCookieBanner(false);
             setHasFullConsent(false);
        } else {
            setShowCookieBanner(true);
        }
    }, []);

    // 3. Funções de Manipulação do Banner
    const handleAcceptAll = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setShowCookieBanner(false);
        setHasFullConsent(true);
    };

    const handleRejectNonEssential = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        setShowCookieBanner(false);
        setHasFullConsent(false);
    };

    // CORRIGIDO: Esta função agora reverte o estado para mostrar o banner, sem limpar o LocalStorage
    // Opcionalmente, pode limpar, mas para gestão, reexibir é suficiente.
    const handleManagePreferences = () => {
        setShowCookieBanner(true);
        setHasFullConsent(false);
        console.log('Banner de gestão reexibido.');
    };


    const cookieBannerTranslations = t?.cookies?.banner;

    return (
        <AuthProvider>
            {/* 🚀 OBRIGATÓRIO: ScrollToTop deve estar DENTRO do Router, mas FORA do Routes */}
            <ScrollToTop /> 
            
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/booking" element={<Booking />} />
                        
                        {/* ROTAS DE AUTENTICAÇÃO */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* ROTAS EXISTENTES */}
                        <Route path="/fleet" element={<Fleet />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/news/:articleId" element={<News />} /> 
                        <Route path="/reserve" element={<Reserve />} /> 
                        
                        {/* ROTA DE SERVIÇOS */}
                        <Route path="/services" element={<Services />} /> 
                        <Route path="/services/:serviceId" element={<ServiceDetail />} />
                        <Route path="/services/:id" element={<Services />} /> 

                        <Route path="/vehicle/:id" element={<VehicleDetail />} />
                        
                        <Route path="/about" element={<About />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsAndConditions />} />
                        
                        {/* ROTA DA POLÍTICA DE COOKIES */}
                        <Route path="/cookies" element={<CookiePolicyPage />} />
                        
                        {/* Rota para o perfil do utilizador */}
                        <Route path="/profile" element={<div>Página do Perfil (A ser criada)</div>} />
                    </Routes>
                </main>
                <Footer />
            </div>

            {/* Banner de Cookies Renderizado Condicionalmente */}
            {showCookieBanner && cookieBannerTranslations && (
                <CookieBanner 
                    t={cookieBannerTranslations} 
                    onAccept={handleAcceptAll}
                    onReject={handleRejectNonEssential}
                    onManage={handleManagePreferences}
                />
            )}
        </AuthProvider>
    );
}


// --- Componente Raiz App ---
function App() {
    return (
        // O LanguageProvider deve envolver TUDO o que precisa de traduções
        <LanguageProvider>
            {/* O AppContent encapsula o resto da aplicação.
                Assumimos que o BrowserRouter está no ficheiro index.js/main.jsx,
                como é a prática recomendada.
            */}
            <AppContent />
        </LanguageProvider>
    );
}

export default App;