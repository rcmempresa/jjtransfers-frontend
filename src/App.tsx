import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './hooks/useLanguage'; // Importa useLanguage para aceder às traduções
import { translations } from './translations'; // Importa o objeto de traduções
import { AuthProvider } from './hooks/useAuth'; // Importação do AuthProvider

// Componente para forçar o scroll para o topo em cada navegação
import ScrollToTop from './components/ScrollToTop';

// Componente de Cookies (Vamos assumir que está em components/CookieBanner)
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

// Componentes da Frota e Serviços
import VehicleDetail from './pages/VehicleDetail'; 
import Services from './pages/Services'; 
import ServiceDetail from './pages/ServiceDetail';

// Importações de Autenticação
import Login from './pages/Login';
import Register from './pages/Register';

// Chave do LocalStorage
const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

// --- Componente principal com a lógica do Banner de Cookies ---
const AppContent = () => {
    // Aceder ao idioma atual para obter as traduções
    const { lang } = useLanguage();
    const t = translations[lang];

    // 1. Estados dos Cookies
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const [hasFullConsent, setHasFullConsent] = useState(false);
    
    // Estado para controlar a visibilidade do modal de gestão, se for necessário
    // const [showCookieModal, setShowCookieModal] = useState(false); 

    // 2. Efeito para verificar o consentimento no carregamento
    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

        if (consent === 'accepted') {
            setShowCookieBanner(false);
            setHasFullConsent(true);
            // 💡 Aqui: Inicializar Google Analytics, Hotjar, etc.
        } else if (consent === 'rejected') {
             setShowCookieBanner(false);
             setHasFullConsent(false);
             // 💡 Aqui: Não carregar nada ou só carregar scripts essenciais
        } else {
            // Se for a primeira visita, mostrar o banner
            setShowCookieBanner(true);
        }
    }, []);

    // 3. Funções de Manipulação
    const handleAcceptAll = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setShowCookieBanner(false);
        setHasFullConsent(true);
        console.log('Todos os cookies aceites. Scripts de terceiros ativados.');
        // Pode ser necessário um window.location.reload() para scripts que precisam de ser injetados no início.
    };

    const handleRejectNonEssential = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        setShowCookieBanner(false);
        setHasFullConsent(false);
        console.log('Apenas cookies essenciais aceites.');
    };

    const handleManagePreferences = () => {
        // Por agora, direcionamos para a rejeição, mas idealmente abriria um modal.
        // setShowCookieModal(true); 
        console.log('Abrir Modal de Gestão de Cookies.');
        handleRejectNonEssential(); 
    };

    return (
        <AuthProvider>
            <Router>
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
                            
                            {/* Rota para o perfil do utilizador (necessária para o Header) */}
                            <Route path="/profile" element={<div>Página do Perfil (A ser criada)</div>} />
                            
                            {/* Rota para a Política de Cookies (necessária para o banner) */}
                            <Route path="/cookies" element={<div>Página da Política de Cookies (A ser criada)</div>} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>

            {/* Banner de Cookies Renderizado Fora do Fluxo Principal (no final da div) */}
            {showCookieBanner && t && (
                <CookieBanner 
                    t={t.cookies.banner} 
                    onAccept={handleAcceptAll}
                    onReject={handleRejectNonEssential}
                    onManage={handleManagePreferences} // Lida com o 'Gerir Preferências'
                />
            )}
        </AuthProvider>
    );
}


// --- Ficheiro App.tsx final ---
function App() {
    return (
        // O LanguageProvider deve envolver tudo o que precisa de traduções
        <LanguageProvider>
            {/* O AppContent contém toda a lógica de cookies, rotas e AuthProvider */}
            <AppContent />
        </LanguageProvider>
    );
}

export default App;