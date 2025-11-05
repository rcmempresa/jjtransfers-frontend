import React from 'react';
import { Plane, Briefcase, Calendar, Clock, Heart, MapPin, Moon, Music, Car as DefaultCarIcon } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../hooks/useLanguage'; 

interface ServiceCardProps {
  service: Service;
}

const iconMap = {
  Plane, Briefcase, Calendar, Clock, Heart, MapPin, Moon, Music
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // 1. Usamos a variável 'language' (o nome correto retornado pelo seu hook)
  const { language } = useLanguage(); 

  // Garantimos que 'service.name' e 'service.description' são objetos antes de tentar aceder.
  const nameObj = service.name && typeof service.name === 'object' ? service.name : {};
  const descriptionObj = service.description && typeof service.description === 'object' ? service.description : {};

  // 2. Acessamos o idioma ativo, com fallback para 'pt' e depois para uma mensagem de erro.
  const serviceName = nameObj[language] || nameObj.pt || "Título do Serviço em Falta";
  const serviceDescription = descriptionObj[language] || descriptionObj.pt || "Descrição do Serviço em Falta";
  
  // Ícone e Imagem
  const IconComponent = iconMap[service.icon] || DefaultCarIcon;
  const imageUrl = service.image_url || 'caminho/para/placeholder.jpg';

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group border border-gray-700 hover:border-amber-400 transition-all duration-300 transform hover:scale-105">
      <div className="relative h-48">
        <img
          src={imageUrl} 
          alt={serviceName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
        
        <div className="absolute top-4 right-4 w-10 h-10 bg-amber-400/90 rounded-lg flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-black" />
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:-translate-y-1">
          {serviceName}
        </h3>
        
        <p className="text-gray-300">
          {serviceDescription}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;