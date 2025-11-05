import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

// =================================================================
// Interfaces CORRIGIDAS (Para receber features e luggage_capacity do Home.tsx)
// =================================================================
interface MediaInterface {
  id: number;
  url: string;
}

export interface VehicleInterface {
  id: number;
  name: string;
  description: string;
  capacity: number;
  status: string;
  media: MediaInterface[]; // Array de media do backend
  image: string; // URL da imagem principal (fallback)
  type: string; // Usado como category
  price: number;
  // CAMPOS REAIS DO BACKEND
  features: string[]; // ⚠️ Novo campo para as features da API
  luggage_capacity: number; // ⚠️ Novo campo para a capacidade de bagagem
}

// Props do componente
interface VehicleCardProps {
  vehicle: VehicleInterface;
  onSelect?: (vehicle: VehicleInterface) => void;
  showPrice?: boolean; 
}
// =================================================================

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect, showPrice = false }) => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mapear 'media' do backend para 'images' usando useMemo
  const images = useMemo(() => {
    return (vehicle?.media && vehicle.media.length > 0) 
      ? vehicle.media.map(m => m.url) 
      : [vehicle?.image || 'https://placehold.co/600x400/374151/ffffff?text=Carro'];
  }, [vehicle]);
  

  // ⚠️ LÓGICA DE TRADUÇÃO DAS FEATURES DA API
  const allFeatures = useMemo(() => {
    
    // Função auxiliar para traduzir uma feature da API usando o featuresMap
    const translateFeature = (featureKey: string): string => {
        // A chave de tradução completa é "featuresMap.O_TEXTO_DA_API"
        const translationKey = `featuresMap.${featureKey}`;
        
        const translatedText = t(translationKey);
        
        // Se a tradução não for igual à chave que procuramos, ela foi encontrada
        if (translatedText && translatedText !== translationKey) {
            return translatedText;
        }
        
        // Fallback: Retorna o texto original da BD (se não houver tradução)
        return featureKey; 
    };
    
    // 1. Recursos essenciais traduzidos (Capacidade e Bagagem)
    const essentialFeatures = [
        t('vehicleCard.capacity', { capacity: vehicle.capacity }),
        t('vehicleCard.luggage', { count: vehicle.luggage_capacity }),
    ];
    
    // 2. Features reais do backend (agora traduzidas)
    const backendFeatures = (vehicle?.features || []).map(translateFeature);
    
    // Combina os essenciais no topo com os reais traduzidos
    return [...essentialFeatures, ...backendFeatures];
    
  }, [vehicle, t]);
  
  // Verificação de segurança (DEBUG)
  if (!vehicle) {
      console.log('AVISO: VehicleCard recebeu veículo nulo ou indefinido e não será renderizado.');
      return null;
  }
  
  // Console Logs: (DESTAQUE: Estes logs só aparecerão se 'vehicle' não for nulo/undefined)
  console.log('Dados do Veículo:', vehicle); 
  console.log('Features para exibição:', allFeatures); 


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-700 group">
      
      {/* Image Carousel */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={vehicle.name}
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500"></div>
        
        {/* Navigation Arrows (Oculto se apenas 1 imagem) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        
        {/* Category Badge - Usa 'vehicle.type' */}
        <div className="absolute top-4 left-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold uppercase tracking-wider">
            {vehicle.type}
          </span>
        </div>
        
        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-amber-400' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Hover border effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 transition-all duration-500 rounded-2xl"></div>
      </div>
      
      <div className="p-6">
        {/* Title and Category */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-1 transform transition-transform duration-500 group-hover:translate-y-[-2px]">
            {vehicle.name}
          </h3>
          <p className="text-gray-300 group-hover:text-white transition-colors duration-300">
            {vehicle.type}
          </p>
          <div className="w-12 h-1 bg-amber-400 mt-3"></div>
        </div>
        
        {/* Features List - AGORA USA allFeatures */}
        <div className="space-y-3 mb-6">
          {/* Mostra APENAS as primeiras 5 features */}
          {allFeatures.slice(0, 5).map((feature, index) => ( 
            <div key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
            </div>
          ))}
          {/* Contador de apoios extra */}
          {allFeatures.length > 5 && (
            <p className="text-xs text-gray-500 mt-2 ml-8">
              {t('fleetPage.supportCount', { count: allFeatures.length - 5 })}
            </p>
          )}
        </div>

        {/* --- Preço e Ação --- */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
            <span className="text-2xl font-bold text-white">
                €{vehicle.price.toFixed(2)}
                <span className="text-sm text-gray-400 ml-1">{t('booking.perTrip')}</span>
            </span>

            {onSelect ? (
                <button
                    onClick={() => onSelect(vehicle)}
                    className="bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                >
                    {t('booking.selectThis')}
                </button>
            ) : (
                <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 hover:text-gray-900 transition-colors text-sm flex items-center"
                >
                    {t('fleetPage.detailsAndBooking')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;