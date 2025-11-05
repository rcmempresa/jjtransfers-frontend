import React from 'react';
import { Link } from 'react-router-dom';
// Adicionado ChevronRight para um look mais moderno nas listas
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
// Assumindo que useLanguage é um hook que fornece { t }
import { useLanguage } from '../hooks/useLanguage';
import logo from '../public/assets/logotipo_transparente.png';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  // Constantes de cores do seu tema
  const GOLD_COLOR_CLASS = 'text-amber-400';
  const GOLD_HOVER_CLASS = 'hover:text-amber-300 transition-colors duration-300';
  const TEXT_SECONDARY_CLASS = 'text-gray-400';
  const TEXT_MAIN_CLASS = 'text-gray-100'; 

  // --- ARRAYS DE LINKS ---

  const quickLinks = [
    { path: '/', key: 'nav.home' },
    { path: '/services', key: 'nav.services' },
    { path: '/fleet', key: 'nav.fleet' },
    { path: '/about', key: 'nav.about' },
    { path: '/contact', key: 'nav.contact' },
    { path: '/booking', key: 'nav.book' },
  ];

  const serviceLinks = [
      { path: '/services/', key: 'services.list.airport.title' },
      { path: '/services/', key: 'services.list.executive.title' },
      { path: '/services/', key: 'services.list.weddings.title' },
      { path: '/services/', key: 'services.list.tours.title' }, 
  ];

  // CORREÇÃO AQUI: Removemos o '|| "Fallback Text"'
  // Pois o fallback deve ser gerido pela função 't' ou pelo valor predefinido no ficheiro de tradução.
  const legalLinks = [
    { path: '/privacy', key: 'footer.privacyPolicy' },
    { path: '/terms', key: 'footer.termsAndConditions' },
    { path: '/complaints-book', key: 'footer.complaintsBook' },
  ];

  // Efeito hover sofisticado para os ícones sociais
  const socialIconClass = `p-3 rounded-full border border-gray-700 ${TEXT_SECONDARY_CLASS} transition-all duration-300 ease-in-out 
                          hover:bg-amber-400 hover:text-gray-900 hover:border-amber-400 shadow-lg hover:shadow-amber-500/50`;

  return (
    <footer className="bg-gray-900 text-white">

      {/* Conteúdo Principal do Footer */}
      <div className="container mx-auto px-4 py-16">
        
        {/* Bloco principal de 4 colunas (Info, Links, Serviços, Social) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Company Info e Contactos (Col-span 2 no desktop) */}
          <div className="space-y-6 lg:col-span-2 pr-4">
            
            {/* Logo */}
            <Link to="/" className="inline-block mb-2">
                <img 
                    src={logo}
                    alt="J&J Bespoke Travel Logo" 
                    className="h-20 md:h-24 object-contain"
                />
            </Link>
            
            {/* Descrição e Missão */}
            <p className={`${TEXT_SECONDARY_CLASS} text-sm leading-relaxed italic`}>
              {t('footer.description_luxury') || "O seu parceiro de eleição em serviços de transporte executivo e personalizado. Experiências de viagem criadas à sua medida com motoristas profissionais, discrição e excelência 24/7."}
            </p>
            
            {/* Contactos em destaque */}
            <div className="space-y-4 pt-4 text-base">
              <div className="flex items-center space-x-3">
                <Phone className={`w-5 h-5 ${GOLD_COLOR_CLASS} flex-shrink-0`} />
                <a href="tel:+351912345678" className={`${TEXT_MAIN_CLASS} font-semibold ${GOLD_HOVER_CLASS}`}>
                    +351 912 345 678 
                    <span className="text-xs ml-2 text-gray-500">(Reservas 24h)</span>
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`w-5 h-5 ${GOLD_COLOR_CLASS} flex-shrink-0`} />
                <a href="mailto:info@jjbespoketravel.com" className={`${TEXT_MAIN_CLASS} font-medium ${GOLD_HOVER_CLASS}`}>
                    info@jjbespoketravel.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className={`w-5 h-5 ${GOLD_COLOR_CLASS} flex-shrink-0 mt-1`} />
                <span className={`${TEXT_MAIN_CLASS} text-sm`}>
                    Madeira, Portugal
                </span>
              </div>
            </div>

            {/* Destaque RNAVT */}
            <div className="flex items-center space-x-3 pt-6 text-sm">
                <ShieldCheck className={`w-5 h-5 ${GOLD_COLOR_CLASS} flex-shrink-0`} />
                <p className={`${TEXT_MAIN_CLASS} font-medium`}>
                  Registo RNAVT: <span className={`${GOLD_COLOR_CLASS} font-extrabold text-lg`}>3853</span>
                </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-bold mb-5 uppercase tracking-wider border-b border-gray-700 pb-3 ${GOLD_COLOR_CLASS}`}>{t('footer.quickLinks') || "Links Rápidos"}</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ path, key }) => (
                <li key={path} className="flex items-center">
                  <ChevronRight className={`w-4 h-4 mr-2 ${GOLD_COLOR_CLASS} flex-shrink-0`} />
                  <Link
                    to={path}
                    className={`${TEXT_SECONDARY_CLASS} ${GOLD_HOVER_CLASS} text-base`}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className={`text-lg font-bold mb-5 uppercase tracking-wider border-b border-gray-700 pb-3 ${GOLD_COLOR_CLASS}`}>{t('nav.services') || "Nossos Serviços"}</h4>
            <ul className="space-y-3">
              {serviceLinks.map(({ path, key }) => (
                 <li key={key} className="flex items-center">
                   <ChevronRight className={`w-4 h-4 mr-2 ${GOLD_COLOR_CLASS} flex-shrink-0`} />
                   <Link
                    // NOTA: Mudei a key para 'key' em vez de 'path' para garantir chaves únicas
                    to={path} 
                    className={`${TEXT_SECONDARY_CLASS} ${GOLD_HOVER_CLASS} text-base`}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className={`text-lg font-bold mb-5 uppercase tracking-wider border-b border-gray-700 pb-3 ${GOLD_COLOR_CLASS}`}>{t('footer.followUs') || "Siga-nos"}</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className={socialIconClass}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className={socialIconClass}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className={socialIconClass}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* --- SECÇÃO DE CTA --- */}
        <div className="bg-gray-800 border-y border-amber-500/50 shadow-2xl shadow-amber-500/10 mb-16 rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <Zap className={`w-8 h-8 ${GOLD_COLOR_CLASS} animate-pulse`} /> 
                    <h3 className="text-2xl font-extrabold tracking-tight text-white">
                    {t('footer.cta') || "Pronto para a sua Viagem Bespoke?"}
                    </h3>
                </div>
                <Link
                    to="/booking"
                    className={`
                    px-10 py-3 bg-amber-400 text-gray-900 text-xl font-black rounded-lg shadow-2xl shadow-amber-500/50 uppercase 
                    transition-all duration-300 transform 
                    hover:scale-105 hover:bg-amber-300 hover:shadow-amber-500/75
                    `}
                >
                    {t('nav.book') || "Reserve Agora"}
                </Link>
            </div>
        </div>
        
        {/* Legal e Copyright (Melhorado o layout) */}
        <div className="border-t border-gray-800 pt-8 text-sm flex flex-col md:flex-row justify-between items-center">
          
          {/* Links Legais - CORREÇÃO PRINCIPAL APLICADA AQUI */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-4 md:space-x-6 order-2 md:order-1 mt-4 md:mt-0">
            {legalLinks.map((link) => (
               <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`underline ${TEXT_SECONDARY_CLASS} ${GOLD_HOVER_CLASS} transition-colors`}
                >
                  {/* A FUNÇÃO 't' É APLICADA AQUI NA CHAVE CORRETA */}
                  {t(link.key)}
                </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className={`${TEXT_SECONDARY_CLASS} order-1 md:order-2`}>
            &copy; 2025 J&J Bespoke Travel. {t('footer.rights') || "Todos os direitos reservados"}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;