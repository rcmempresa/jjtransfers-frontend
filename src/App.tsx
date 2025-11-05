import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';

// Componente para forçar o scroll para o topo em cada navegação
import ScrollToTop from './components/ScrollToTop';

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

// Componentes da Frota e Serviços
import VehicleDetail from './pages/VehicleDetail'; 
import Services from './pages/Services'; 
import ServiceDetail from './pages/ServiceDetail';

// Importações de Autenticação
import Login from './pages/Login';
import Register from './pages/Register';
// 🛑 NOVO: Importar o AuthProvider
import { AuthProvider } from './hooks/useAuth'; 

function App() {
  return (
    <LanguageProvider>
      {/* 🛑 APLICAÇÃO ENVOLVIDA PELO AuthProvider */}
      <AuthProvider>
        <Router>
          {/* O ScrollToTop deve ser renderizado aqui, dentro do <Router> */}
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
                
                {/* Rota para o perfil do utilizador (necessária para o Header) */}
                <Route path="/profile" element={<div>Página do Perfil (A ser criada)</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider> {/* 🛑 FIM DO AuthProvider */}
    </LanguageProvider>
  );
}

export default App;