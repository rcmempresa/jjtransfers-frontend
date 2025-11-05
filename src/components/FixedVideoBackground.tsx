// src/components/FixedVideoBackground.tsx

import React, { useState, useEffect } from 'react';

const VIDEO_ID = "AOTGBDcDdEQ"; // Seu ID do YouTube

const FixedVideoBackground: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true); 
  
  // Imagens de fallback (ajuste os caminhos conforme necessário)
  const fallbackImage = '/src/assets/WhatsApp Image 2025-09-19 at 12.07.00 (1).jpeg';

  // Lógica para lidar com o carregamento do vídeo/fallback
  useEffect(() => {
    const videoLoadTimeout = setTimeout(() => {
      if (isVideoLoaded) {
        setShowFallback(false);
      }
    }, 500); 
    
    return () => clearTimeout(videoLoadTimeout);
  }, [isVideoLoaded]);

  return (
    // ESTE É O CONTAINER PRINCIPAL - Fixo, Full-Screen, Z-index negativo
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden z-[-10]"
    >
      <iframe
        onLoad={() => {
            setIsVideoLoaded(true); 
        }}
        onError={() => setIsVideoLoaded(false)}
        // Configuração para cobrir o container pai
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-50' : 'opacity-0' // Use opacity mais baixa para que o texto seja legível
        }`}
        // Configuração de loop e autoplay
        src={`https://www.youtube.com/embed/${VIDEO_ID}?&autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&vq=hd1080`}
        title="Luxury Car Background Video"
        frameBorder="0"
        allow="autoplay; encrypted-media; gyroscope"
        allowFullScreen
      ></iframe>
      
      {/* Fallback de Imagem */}
      {showFallback && (
        <div className="absolute inset-0 bg-black">
          <img
            src={fallbackImage}
            alt="Luxury Mercedes" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        </div>
      )}
      
      {/* Overlay Escuro para o conteúdo ser legível */}
      <div className="absolute inset-0 bg-black/80"></div> 
    </div>
  );
};

export default FixedVideoBackground;