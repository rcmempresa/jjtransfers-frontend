import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth'; // Importação do hook de autenticação


const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null); // Ref para fechar o menu ao clicar fora
  
  const { language, setLanguage, t } = useLanguage();
  // Obter o estado de autenticação e os dados do utilizador
  const { isAuthenticated, user, logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', key: 'nav.home' },
    { path: '/services', key: 'nav.services' },
    { path: '/fleet', key: 'nav.fleet' },
    { path: '/about', key: 'nav.about' },
    { path: '/news', key: 'nav.news' },
    { path: '/contact', key: 'nav.contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };
  
  // Função de logout e redirecionamento
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login'); // Redirecionar para a página de login após logout
  };

  // Efeito para detetar o scroll e alterar o estilo do header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efeito para fechar o menu do utilizador ao clicar fora (Desktop Dropdown)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    // Usar 'mousedown' é geralmente melhor para menus dropdowns
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuRef]);


  // Cores e Classes Base
  const goldColor = 'text-amber-400';
  const textColor = 'text-gray-100'; 
  const hoverGold = 'hover:text-amber-300'; 
  const activeGold = 'text-amber-400 font-semibold'; 
  
  // Classes dinâmicas para o header
  const headerClasses = `fixed w-full z-50 transition-all duration-300 ${
    isScrolled ? 'bg-black/90 shadow-2xl py-3' : 'bg-black/70 backdrop-blur-md py-4'
  }`;

  // Classes para os links de navegação
  const navLinkClasses = (path: string) => `
    relative text-base font-medium ${textColor} ${hoverGold} transition-all duration-300 ease-in-out
    group
    ${location.pathname.startsWith(path) && path !== '/' ? activeGold :
      location.pathname === path ? activeGold : ''}
    
    // Efeito de sublinhado que aparece no hover/ativo
    before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-amber-400 
    before:transition-all before:duration-300 before:ease-in-out
    ${(location.pathname.startsWith(path) && path !== '/') || location.pathname === path ? 'before:w-full' : 'group-hover:before:w-full'}
  `;

  // Classes para o botão de reserva (CTA)
  const ctaButtonClasses = `
    relative overflow-hidden
    bg-gradient-to-r from-amber-500 to-amber-300 text-gray-900 
    px-6 py-2.5 rounded-full font-bold text-sm shadow-xl
    transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
    group
  `;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/assets/logotipo_transparente.png"
              alt="J&J Bespoke Travel Logo" 
              className={`object-contain transition-all duration-300 
                ${isScrolled ? 'h-16' : 'h-20'} `} 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map(({ path, key }) => (
              <Link key={path} to={path} className={navLinkClasses(path)}>
                {t(key)}
              </Link>
            ))}
            
            {/* Seletor de Idioma Desktop */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 ${textColor} ${hoverGold} 
                          transition-colors duration-200 ml-4 p-2 rounded-full hover:bg-white/10`}
            >
              <Globe className="w-5 h-5" />
              <span className="uppercase text-sm font-semibold">{language}</span>
            </button>
          </nav>

          {/* Botão de Reserva (CTA) e Mobile Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Ícone de Login/Conta - COMPONENTE CONDICIONAL DESKTOP */}
            <div className="hidden md:block relative" ref={userMenuRef}>
                {isAuthenticated ? (
                    // 1. ESTADO LOGADO: Botão que abre o Dropdown
                    <button
                        onClick={() => setIsUserMenuOpen(prev => !prev)}
                        className={`flex items-center space-x-2 ${goldColor} p-2 rounded-full hover:bg-white/10 transition-colors duration-200`}
                    >
                        <User className="w-6 h-6" />
                        {/* Mostra apenas o primeiro nome (ou fallback) */}
                        <span className="text-sm font-medium text-white hidden lg:inline">{user?.name.split(' ')[0]}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                ) : (
                    // 2. ESTADO NÃO LOGADO: Link de Login Simples
                    <Link
                        to="/login"
                        className={`${textColor} ${hoverGold} transition-colors duration-200 p-2 rounded-full hover:bg-white/10`}
                    >
                        <User className="w-6 h-6" />
                    </Link>
                )}

                {/* Dropdown Menu (Conteúdo) */}
                {isAuthenticated && isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-amber-400/30 rounded-lg shadow-2xl overflow-hidden z-10 animate-fade-in-down">
                        <div className="p-3 border-b border-gray-700">
                            <p className="text-sm font-bold text-amber-400 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link 
                            to="/profile" 
                            className="flex items-center space-x-2 px-4 py-3 text-sm text-white hover:bg-amber-400/20 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            <span>{t('nav.profile') || 'O Meu Perfil'}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-3 text-sm w-full text-left text-red-400 hover:bg-red-400/20 transition-colors border-t border-gray-700"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('nav.logout') || 'Sair (Logout)'}</span> {/* Botão de Logout */}
                        </button>
                    </div>
                )}
            </div>


            {/* CTA: Botão de Reserva */}
            <Link
              to="/booking"
              className={ctaButtonClasses}
              onClick={() => isMenuOpen && setIsMenuOpen(false)}
            >
                <span className="absolute -inset-full bg-white opacity-20 transform rotate-45 
                                  group-hover:animate-shine"></span>
                {t('nav.book')}
            </Link>

            {/* Mobile Menu Button e Seletor de Idioma no Mobile */}
            <div className="flex items-center md:hidden space-x-3">
                 
                 {/* Ícone de Login/Conta (Mobile) */}
                {isAuthenticated ? (
                    // Logado: Botão de Logout direto
                    <button
                        onClick={handleLogout} 
                        className={`${textColor} hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10`}
                    >
                        <LogOut className="w-6 h-6" /> 
                    </button>
                ) : (
                    // Não Logado: Link para Login
                    <Link
                        to="/login"
                        className={`${textColor} ${hoverGold} transition-colors p-2 rounded-full hover:bg-white/10`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <User className="w-6 h-6" />
                    </Link>
                )}


                 {/* Seletor de Idioma em Mobile */}
                <button
                    onClick={toggleLanguage}
                    className={`${textColor} ${hoverGold} transition-colors p-2 rounded-full hover:bg-white/10`}
                >
                    <Globe className="w-6 h-6" />
                </button>
                
                {/* Botão para Abrir/Fechar Menu */}
                <button
                    className={`${goldColor}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-8 h-8 transform rotate-90 transition-transform duration-300" /> : <Menu className="w-8 h-8 transition-transform duration-300" />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (Itens do menu) */}
        {isMenuOpen && (
          <nav 
            className="md:hidden absolute top-full left-0 w-full bg-black/95 border-t border-gray-800 shadow-xl 
                       transform transition-transform duration-300 ease-out animate-slide-down"
          >
            <div className="flex flex-col space-y-3 p-6">
              {navLinks.map(({ path, key }) => (
                <Link
                  key={path}
                  to={path}
                  className={`text-lg font-medium py-2 ${textColor} ${hoverGold} transition-colors 
                    ${location.pathname.startsWith(path) && path !== '/' ? activeGold : 
                      location.pathname === path ? activeGold : ''}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(key)}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;