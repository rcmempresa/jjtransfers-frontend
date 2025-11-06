import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

// Componentes importantes
import BookingForm from '../components/BookingForm'; 
import VehicleCard from '../components/VehicleCard';
import ServiceCard from '../components/ServiceCard';
import FixedVideoBackground from '../components/FixedVideoBackground';

// Hooks e Dados
import { useLanguage } from '../hooks/useLanguage';
import { testimonials } from '../data/testimonials';

// =================================================================
// INTERFACES DE DADOS
// =================================================================

interface MediaInterface {
  id: number;
  url: string;
}

// Interface para Serviços (Alinhada ao seu Backend com JSONB)
export interface ServiceInterface {
  id: number;
  // Campos Multilíngues (armazenados como JSON no DB)
  name: { [key: string]: string };
  description: { [key: string]: string };
  category?: { [key: string]: string }; 
  // Campos Simples
  is_active: boolean;
  icon?: string; 
  fleets: any[]; 
}

// Interface para Veículos (Frota)
export interface VehicleInterface {
  id: number;
  name: string;
  description: string;
  capacity: number;
  status: string;
  media: MediaInterface[]; 
  
  // Campos mapeados ou simulados no frontend:
  image: string; 
  type: string; 
  price: number; 
  
  // CAMPOS REAIS DO BACKEND
  features: string[];
  luggage_capacity: number; 
}
// =================================================================


const Home: React.FC = () => {
  // --- HOOKS DE LINGUAGEM ---
  const { t, currentLanguage } = useLanguage(); 
  
  // --- ESTADOS DA HERO SECTION (Controle do Vídeo e Carrossel) ---
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true); 
  
  // --- ESTADOS DA FROTA / SERVIÇOS ---
  const [currentFleetSlide, setCurrentFleetSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [vehicles, setVehicles] = useState<VehicleInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicesData, setServicesData] = useState<ServiceInterface[]>([]); 
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);


  // Hero carousel images - DEFINIÇÃO LOCAL
  const heroSlides = [
    {
      image: '/assets/WhatsApp Image 2025-09-19 at 12.04.49.jpeg',
      title: t('hero.carousel.slide1.title'),
      subtitle: t('hero.carousel.slide1.subtitle')
    },
    {
      image: '/assets/WhatsApp Image 2025-09-19 at 12.03.20.jpeg',
      title: t('hero.carousel.slide2.title'),
      subtitle: t('hero.carousel.slide2.subtitle')
    },
    {
      image: '/assets/WhatsApp Image 2025-09-19 at 12.04.54.jpeg',
      title: t('hero.carousel.slide3.title'),
      subtitle: t('hero.carousel.slide3.subtitle')
    },
    {
      image: '/assets/WhatsApp Image 2025-09-19 at 12.07.00 (1).jpeg',
      title: t('hero.carousel.slide4.title'),
      subtitle: t('hero.carousel.slide4.subtitle')
    }
  ];

  // =================================================================
  // USEFFECTS / LÓGICA
  // =================================================================

  // Auto-advance hero carousel (Agora a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Lógica para lidar com o carregamento do vídeo/fallback
  useEffect(() => {
    const videoLoadTimeout = setTimeout(() => {
      if (isVideoLoaded) {
        setShowFallback(false);
      }
    }, 500); 
    
    return () => clearTimeout(videoLoadTimeout);
  }, [isVideoLoaded]);


  // =================================================================
  // LÓGICA DE CARREGAMENTO DE VEÍCULOS (FROTA)
  // =================================================================
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/cars`); 
        if (!response.ok) {
          throw new Error(`Falha ao carregar frota. Status do Servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
             throw new Error("Formato de dados inesperado (falta array 'data').");
        }
        
        // Mapeamento dos campos do Backend para o VehicleCard
        const processedVehicles: VehicleInterface[] = result.data.map((car: any) => ({
            id: car.id,
            name: car.name,
            description: car.description,
            capacity: car.capacity,
            status: car.status,
            media: car.media,
            
            // Imagem: Usa a primeira media ou um placeholder robusto
            image: car.media?.length > 0 ? car.media[0].url : 'https://placehold.co/600x400/374151/ffffff?text=Carro', 
            
            // PREÇO CORRETO: Converte a string 'base_price_per_hour' para float
            price: parseFloat(car.base_price_per_hour) || 0,
            
            // CATEGORIA/TIPO CORRETO: Usa o campo 'category'
            type: car.category, 
            
            // FUNCIONALIDADES: Essencial para o VehicleCard (Usando os dados reais)
            features: car.features || [],
            luggage_capacity: car.luggage_capacity || 0,
        }));

        setVehicles(processedVehicles);
      } catch (err: any) {
        const errorMessage = (err.message || 'Erro desconhecido. Verifique o console.').includes('Failed to fetch')
             ? 'Erro de rede: O backend pode não estar ativo em http://localhost:3000/api/cars'
             : `Erro ao carregar dados: ${err.message}`;
             
        setError(errorMessage);
        console.error("Erro ao carregar veículos:", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []); 


  // =================================================================
  // LÓGICA DE CARREGAMENTO DE SERVIÇOS 
  // =================================================================
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        // 🎯 Rota de API para serviços
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/services`); 
        if (!response.ok) {
          throw new Error(`Falha ao carregar serviços. Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
             throw new Error("Formato de dados de serviço inesperado.");
        }
        
        // Atribui os dados do backend diretamente, assumindo a estrutura ServiceInterface
        setServicesData(result.data as ServiceInterface[]); 
        
      } catch (err: any) {
        const errorMessage = (err.message || 'Erro desconhecido.').includes('Failed to fetch')
             ? 'Erro de rede: O backend pode não estar ativo para serviços em http://localhost:3000/api/services'
             : `Erro ao carregar serviços: ${err.message}`;
             
        setServicesError(errorMessage);
        console.error("Erro ao carregar serviços:", err);
        setServicesData([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
}, []);


  // Lógica de filtragem dos veículos
  const filteredVehicles = activeFilter === 'all'
    ? vehicles
    : vehicles.filter(vehicle => vehicle.type === activeFilter);
  
  // Lógica do carrossel
  const totalItems = filteredVehicles.length;
  const itemsPerPage = 3;
  
  const nextFleetSlide = () => {
    if (totalItems <= itemsPerPage) return;
    setCurrentFleetSlide((prev) => (prev + 1) % totalItems);
  };
  
  const prevFleetSlide = () => {
    if (totalItems <= itemsPerPage) return;
    setCurrentFleetSlide((prev) => (prev - 1 + totalItems) % totalItems);
  };
  
  // Lógica para determinar os veículos visíveis
  const visibleVehicles: (VehicleInterface | undefined)[] = useMemo(() => {
    const items: (VehicleInterface | undefined)[] = [];
    if (totalItems > 0) {
        const itemsToDisplay = Math.min(itemsPerPage, totalItems); 
        
        for (let i = 0; i < itemsToDisplay; i++) {
            const vehicleIndex = (currentFleetSlide + i) % totalItems;
            items.push(filteredVehicles[vehicleIndex]);
        }
    }
    return items;
  }, [filteredVehicles, currentFleetSlide, totalItems, itemsPerPage]);

  // Função para lidar com a mudança de filtro
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentFleetSlide(0); // Reinicia o carrossel
  };

  // Extrai as categorias únicas
  const categories = ['all', ...new Set(vehicles.map(v => v.type).filter(Boolean))]; 

  // Componente AnimatedNumber
  const AnimatedNumber = ({ endValue, duration = 2000 }: { endValue: number, duration?: number }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null); 

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let startValue = 0;
                    const finalValue = endValue; 
                    const increment = finalValue / (duration / 16); 
                    
                    const timer = setInterval(() => {
                        startValue += increment;
                        if (startValue >= finalValue) {
                            setCurrentValue(finalValue);
                            clearInterval(timer);
                        } else {
                            setCurrentValue(Math.ceil(startValue));
                        }
                    }, 16);
                    
                    observer.unobserve(node); 
                    
                    return () => clearInterval(timer);
                }
            },
            { threshold: 0.5 } 
        );

        observer.observe(node);

        return () => {
            if (node) {
                observer.unobserve(node);
            }
        };
    }, [endValue, duration]);

    const formatValue = (value: number, finalValue: number) => {
        if (finalValue >= 1000) {
            return `${Math.floor(value / 1000)}K`;
        }
        return value;
    };


    return <span ref={ref}>{formatValue(currentValue, endValue)}</span>;
};

  return (
    <div>
      <FixedVideoBackground />
      {/* Seção Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            onLoad={() => {
                // Atualiza o estado quando o iframe é carregado
                setIsVideoLoaded(true); 
            }}
            onError={() => setIsVideoLoaded(false)}
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-80' : 'opacity-0'
            }`}
            src="https://www.youtube.com/embed/AOTGBDcDdEQ?&autoplay=1&mute=1&loop=1&playlist=AOTGBDcDdEQ&controls=0&modestbranding=1"
            title="2023 Mercedes-Benz S-Class S 580 | Test Drive & Review"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
          
          {showFallback && (
            <div className="absolute inset-0 bg-black">
              {heroSlides.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  alt="Luxury Mercedes" 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentHeroSlide ? 'opacity-60' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
        
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-8 sm:pb-12 lg:pb-20 w-full h-full flex flex-col justify-center">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center min-h-[80vh] lg:min-h-[80vh]">
            {/* Bloco de Texto (Visível apenas em Mobile/Tablet) */}
            <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-1 lg:order-1 lg:hidden">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="inline-block">
                  <span className="bg-amber-400/20 text-amber-400 px-3 py-1 sm:px-4 sm:py-2 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm lg:text-sm font-semibold uppercase tracking-wider">
                    Premium Transportation
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2 sm:px-0">
                  {heroSlides[currentHeroSlide].title}
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
                  {heroSlides[currentHeroSlide].subtitle}
                </p>
              </div>
            </div>

            {/* Formulário de Reserva */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-2 mb-4 lg:mb-0 lg:mt-0">
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                {/* O formulário de reservas compacto e funcional */}
                <BookingForm compact={true} showServiceAndVehicle={false} />
              </div>
            </div>

            {/* Bloco de Texto (Visível apenas em Desktop) */}
            <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-3 lg:order-1 hidden lg:block">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="inline-block">
                  <span className="bg-amber-400/20 text-amber-400 px-3 py-1 sm:px-4 sm:py-2 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm lg:text-sm font-semibold uppercase tracking-wider">
                    Premium Transportation
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-2 sm:px-0">
                  {heroSlides[currentHeroSlide].title}
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
                  {heroSlides[currentHeroSlide].subtitle}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-4 pt-4 sm:pt-6 lg:pt-8 px-2 sm:px-0">
                <Link
                  to="/booking"
                  className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-black px-6 py-3 sm:px-8 sm:py-4 lg:px-8 lg:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:shadow-2xl hover:shadow-amber-400/25 transition-all transform hover:scale-105 text-center"
                >
                  Reservar Agora
                </Link>
                <Link
                  to="/fleet"
                  className="border-2 border-white/30 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-8 lg:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:bg-white/10 hover:border-white/50 transition-all text-center backdrop-blur-sm"
                >
                  Ver Frota
                </Link>
              </div>
            </div>
          </div>
        
          <div className="absolute bottom-6 sm:bottom-8 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 lg:space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroSlide(index)}
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                  index === currentHeroSlide 
                    ? 'bg-amber-400 shadow-lg shadow-amber-400/50' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>


    {/* Fleet Section com Filtros */}
    <section className="py-20 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('fleet.title')}
          </h2>
          <p className="text-xl text-gray-300">
            {t('fleet.subtitle')}
          </p>
        </div>

        {/* Adicionado o estado de Carregamento e Erro */}
        {loading && (
          <div className="text-center text-amber-400 py-12">
            <svg className="animate-spin h-10 w-10 text-amber-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-2xl">A Carregar Frota...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-12 bg-gray-900 rounded-lg p-8 border border-red-700">
            <p className="text-xl font-bold mb-2">Erro ao carregar os veículos: {error}</p>
            <p className="text-lg text-gray-400">Por favor, verifique se o **backend** está ativo e a correr em `http://localhost:3000`.</p>
          </div>
        )}

        {/* Botões de Filtro */}
        {!loading && vehicles.length > 0 && (
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`
                  px-6 py-2 rounded-full font-semibold transition-all duration-300
                  ${activeFilter === category
                    ? 'bg-amber-400 text-black shadow-lg transform scale-105' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Mensagem de Estado Vazio */}
        {!loading && filteredVehicles.length === 0 && !error && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">{t('fleet.noVehiclesFound')}</p>
            <p>{t('fleet.tryAnotherFilter')}</p>
          </div>
        )}

        {/* Fleet Carousel Container */}
        {!loading && filteredVehicles.length > 0 && (
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Arrows */}
            {totalItems > itemsPerPage && ( 
              <>
                <button
                  onClick={prevFleetSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-amber-400 shadow-lg rounded-full p-3 hover:bg-amber-300 transition-all" 
                >
                  <ArrowLeft className="w-6 h-6 text-gray-900" /> 
                </button>
                
                <button
                  onClick={nextFleetSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-amber-400 shadow-lg rounded-full p-3 hover:bg-amber-300 transition-all" 
                >
                  <ArrowRight className="w-6 h-6 text-gray-900" /> 
                </button>
              </>
            )}

            {/* Fleet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleVehicles
                .filter((vehicle): vehicle is VehicleInterface => vehicle !== undefined)
                .map((vehicle, index) => (
                  // A chave composta garante unicidade, mesmo em um carrossel que repete
                  <div key={`${vehicle.id}-${index}`} className="group">
                    <VehicleCard vehicle={vehicle} /> 
                  </div>
              ))}
            </div>

            {/* Dots Indicator */}
            {totalItems > itemsPerPage && ( 
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalItems }).map((_, index) => ( 
                  <button
                    key={index}
                    onClick={() => setCurrentFleetSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentFleetSlide ? 'bg-amber-400' : 'bg-gray-700 hover:bg-gray-600' 
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && filteredVehicles.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/fleet"
              className="bg-amber-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-300 transition-all transform hover:scale-105" 
            >
              {t('fleet.viewAll')}
            </Link>
          </div>
        )}
      </div>
    </section>

      {/* ========================================================== */}
      {/* NOVO: A DIFERENÇA MADEIRA / Madeira Difference Section */}
      {/* ========================================================== */}
      <section className="py-20 bg-black/50 text-white border-y border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('home.madeiraTitle')} {/* Ex: A Essência da Experiência Madeirense */}
            </h2>
            <p className="text-xl text-amber-400 font-semibold">
              {t('home.madeiraSubtitle')} {/* Ex: Para além do transporte: uma jornada pela Ilha */}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Vantagem 1: Natureza Exuberante */}
            <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-gray-700/50">
              <img 
                src="assets/madeira_imagem_3.jpeg" // Ex: Levadas ou Montanhas
                alt="Levada Walks and Mountains"
                className="rounded-lg h-56 w-full object-cover shadow-lg mb-4 transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <h3 className="text-2xl font-bold text-amber-400 mb-2">
                {t('home.madeiraPoint1Title')}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('home.madeiraPoint1Desc')} {/* Ex: Desde o Laurissilva classificado pela UNESCO às vistas panorâmicas. */}
              </p>
            </div>

            {/* Vantagem 2: Cultura e História */}
            <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-gray-700/50">
              <img 
                src="/assets/madeira_imagem_5.jpg" // Ex: Funchal City ou Mercado
                alt="Funchal City and Culture"
                className="rounded-lg h-56 w-full object-cover shadow-lg mb-4 transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <h3 className="text-2xl font-bold text-amber-400 mb-2">
                {t('home.madeiraPoint2Title')}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('home.madeiraPoint2Desc')} {/* Ex: Explore a rica história e a vibrante vida cultural do Funchal. */}
              </p>
            </div>

            {/* Vantagem 3: Exclusividade e Luxo */}
            <div className="text-center group p-6 rounded-xl transition-all duration-300 hover:bg-gray-700/50">
              <img 
                src="/assets/madeira_imagem_6.jpeg" // Ex: Pôr do Sol ou Vinhas
                alt="Luxury and Exclusivity"
                className="rounded-lg h-56 w-full object-cover shadow-lg mb-4 transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <h3 className="text-2xl font-bold text-amber-400 mb-2">
                {t('home.madeiraPoint3Title')}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t('home.madeiraPoint3Desc')} {/* Ex: Rotas exclusivas, hotéis boutique e paisagens inesquecíveis. */}
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/about"
              className="border border-amber-400 text-amber-400 px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 hover:text-gray-900 transition-all transform" 
            >
              {t('home.madeiraCTA')} {/* Ex: Descubra a Nossa Vantagem Local */}
            </Link>
          </div>
        </div>
      </section>


    {/* How It Works Section */}
    <section className="py-20 bg-black/80 backdrop-blur-sm">
    <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lado Esquerdo - Fluxo de Passos */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">
                    SIMPLICIDADE E EFICIÊNCIA
                </p>
                <h2 className="text-5xl font-extrabold text-white mb-12">
                    {t('howItWorks.title')}
                </h2>
                
                <div className="space-y-12">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-6 relative">
                        <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-gray-800 flex items-center justify-center text-amber-400 font-bold text-lg z-10">
                                1
                            </div>
                            <div className="w-0.5 h-full bg-gray-700 absolute top-10 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <div className="pt-1 pb-16">
                            <h3 className="text-2xl font-semibold mb-3">
                                {t('howItWorks.steps.step1.title')}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {t('howItWorks.steps.step1.description')}
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start space-x-6 relative">
                        <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-gray-800 flex items-center justify-center text-amber-400 font-bold text-lg z-10">
                                2
                            </div>
                            <div className="w-0.5 h-full bg-gray-700 absolute top-10 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <div className="pt-1 pb-16">
                            <h3 className="text-2xl font-semibold mb-3">
                                {t('howItWorks.steps.step2.title')}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {t('howItWorks.steps.step2.description')}
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start space-x-6 relative">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-amber-400 flex items-center justify-center text-gray-900 font-bold text-lg z-10">
                                3
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-3">
                                {t('howItWorks.steps.step3.title')}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {t('howItWorks.steps.step3.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-700 ease-in-out"> 
                <div className="bg-gray-800 rounded-xl p-10 shadow-[0_35px_60px_-15px_rgba(255,193,7,0.3)] border border-gray-700">
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-700 px-4 py-2 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div> 
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-400">
                        reserva.seusite.com
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="bg-gray-800 text-white p-6 rounded-xl mb-4 border border-gray-700">
                        <div className="text-sm font-bold mb-3 text-amber-400 uppercase">Reserva Rápida</div>
                        <div className="space-y-3">
                          <input type="text" placeholder="Morada de Recolha" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:ring-amber-400 focus:border-amber-400"/>
                          <input type="text" placeholder="Morada de Entrega" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:ring-amber-400 focus:border-amber-400"/>
                          <button className="w-full bg-amber-400 text-gray-900 rounded-lg px-4 py-3 text-base font-bold shadow-lg hover:bg-amber-300 transition duration-300">
                            CALCULAR COTAÇÃO
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-6">
                          <h4 className="text-base font-semibold text-gray-300">Frota Disponível</h4>
                          <span className="text-xs text-amber-400">Ver Mais &gt;</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-b-xl h-2 mt-4"></div>
                </div>
              </div>
            </div>
            
        </div>
    </div>
</section>


        {/* Services Section */}
      <section className="py-20 bg-black/50 text-white border-y border-gray-700 backdrop-blur-sm" aria-labelledby="services-title">
    <div className="container mx-auto px-4">
        
        {/* Bloco de Título Profissional e Elegante */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">
                {t('services.tagline')}
            </p>
            <h2 id="services-title" className="text-5xl font-extrabold text-white mb-4">
                {t('services.title')}
            </h2>
            <div className="w-16 h-1 bg-amber-400 mx-auto my-6 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
                {t('services.subtitle')}
            </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* LÓGICA DE CARREGAMENTO E RENDERIZAÇÃO DE SERVIÇOS */}
        {/* ------------------------------------------------ */}
        
        {servicesLoading && (
            <div className="text-center text-amber-400 py-12">
                <svg className="animate-spin h-10 w-10 text-amber-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-2xl" aria-live="polite">A Carregar Serviços...</p>
            </div>
        )}
        
        {servicesError && (
            <div className="text-center text-red-500 py-12 bg-gray-900 rounded-lg p-8 border border-red-700" role="alert">
                <p className="text-xl font-bold mb-2">Erro ao carregar os serviços: {servicesError}</p>
                <p className="text-lg text-gray-400">Verifique se o backend está a responder em `http://localhost:3000/api/services`.</p>
            </div>
        )}
        
        {/* Layout de Serviço Dinâmico (Grid de 4 Colunas) */}
        {!servicesLoading && servicesData.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Mostra apenas os primeiros 4 serviços carregados da API */}
                {servicesData.slice(0, 4).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        )}
        
        {!servicesLoading && servicesData.length === 0 && !servicesError && (
            <div className="text-center text-gray-500 py-12">
                <p className="text-lg">Nenhum serviço disponível no momento. Volte mais tarde!</p>
            </div>
        )}
        
        {/* CTA para Ver Todos os Serviços (Opcional) */}
        {!servicesLoading && servicesData.length > 4 && (
            <div className="text-center mt-12">
                <Link
                    to="/services"
                    className="bg-amber-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-amber-300 transition-all transform hover:scale-105" 
                >
                    Ver Todos os Serviços
                </Link>
            </div>
        )}
        
    </div>
</section>

<section className="py-20 bg-black/80 backdrop-blur-sm"> 
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2">
        {t('tripFeatures.subtitle')}
      </p>
      <h2 className="text-5xl font-extrabold text-white mb-4">
        {t('tripFeatures.title')}
      </h2>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        Descobre o que nos torna a melhor escolha para a tua próxima viagem.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-10">
      {/* Card 1: Safety First */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 
                    hover:bg-gray-700 hover:border-amber-400 
                    hover:scale-[1.02] transition duration-300 transform">
        <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.27a19.43 19.43 0 010 3.86v5.27a19.43 19.43 0 01-5.618 4.27L12 21l-4.382-2.13a19.43 19.43 0 01-5.618-4.27v-5.27a19.43 19.43 0 015.618-4.27L12 3l4.382 2.13z"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">
          {t('tripFeatures.safetyFirst.title')}
        </h3>
        <p className="text-gray-400 leading-relaxed text-center">
          {t('tripFeatures.safetyFirst.description')}
        </p>
      </div>

      {/* Card 2: Prices With No Surprises */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 
                    hover:bg-gray-700 hover:border-amber-400 
                    hover:scale-[1.02] transition duration-300 transform">
        <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h10a1 1 0 011 1v7a2 2 0 01-2 2h-4a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2a2 2 0 00-2-2h-4a2 2 0 01-2-2V4a1 1 0 011-1z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">
          {t('tripFeatures.noPrices.title')}
        </h3>
        <p className="text-gray-400 leading-relaxed text-center">
          {t('tripFeatures.noPrices.description')}
        </p>
      </div>

      {/* Card 3: Private Travel Solutions */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 
                    hover:bg-gray-700 hover:border-amber-400 
                    hover:scale-[1.02] transition duration-300 transform">
        <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 1.38-.893 2-2 2-1.107 0-2-.62-2-2m4 0a2 2 0 10-4 0m4 0h4m-4 0V7.25c0-1.04-.84-1.75-1.875-1.75H7.75c-1.035 0-1.875.71-1.875 1.75V11m6 0v6.75c0 1.04.84 1.75 1.875 1.75h2.375c1.035 0 1.875-.71 1.875-1.75V11"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">
          {t('tripFeatures.privateTravel.title')}
        </h3>
        <p className="text-gray-400 leading-relaxed text-center">
          {t('tripFeatures.privateTravel.description')}
        </p>
      </div>
    </div>
  </div>
</section>

{/* Stats Section */}
      <section className="py-20 bg-black/50 text-white border-y border-gray-700 backdrop-blur-sm">
    <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Lado Esquerdo - Título */}
            <div>
                <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight"> 
                    {t('stats.title')}
                </h2>
                <p className="text-xl text-gray-400 mt-4"> 
                    {t('stats.description')}
                </p>
            </div>
            
            {/* Lado Direito - Estatísticas Animadas */}
            <div className="grid grid-cols-3 gap-8">
                {/* Stat 1: Veículos */}
                <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700"> 
                    <div className="text-5xl lg:text-6xl font-extrabold text-amber-400 mb-3"> 
                        <AnimatedNumber endValue={285} />
                    </div>
                    <div className="text-gray-300 text-lg font-medium">{t('stats.vehicles')}</div> 
                </div>

                {/* Stat 2: Prémios */}
                <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <div className="text-5xl lg:text-6xl font-extrabold text-amber-400 mb-3">
                        <AnimatedNumber endValue={97} />
                    </div>
                    <div className="text-gray-300 text-lg font-medium">{t('stats.awards')}</div>
                </div>

                {/* Stat 3: Clientes Satisfeitos */}
                <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <div className="text-5xl lg:text-6xl font-extrabold text-amber-400 mb-3">
                        <AnimatedNumber endValue={13000} />
                    </div>
                    <div className="text-gray-300 text-lg font-medium">{t('stats.happyCustomers')}</div>
                </div>
            </div>
        </div>
    </div>
</section>


{/* Testimonials Section */}
      <section className="py-20 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.slice(0, 4).map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700"> 
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" /> 
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic"> 
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p> 
                  <p className="text-sm text-gray-400">{testimonial.location}</p> 
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-400 text-black"> 
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto"> 
            Pronto para experimentar o transporte de luxo? Reserve a sua viagem hoje!
          </p>
          <Link
            to="/booking"
            className="bg-black text-amber-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 hover:text-amber-300 transition-all transform hover:scale-105 shadow-xl" 
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;

 