import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowRight } from 'lucide-react';

/**
 * Barra de reserva fixa para dispositivos móveis.
 * Serve como um Call-to-Action (CTA) persistente no fundo do ecrã.
 * * @param {string} overrideText - Texto opcional para substituir o default "Reservar".
 * @param {string} overrideLink - Link opcional para substituir o default "/booking".
 */
const MobileBookingBar = ({ overrideText, overrideLink }) => {
    const { t } = useLanguage();

    // Texto e link a usar, com fallback para os valores padrão (gerais de reserva)
    const buttonText = overrideText || t('nav.book');
    const buttonLink = overrideLink || '/booking';
    
    // O 'lg:hidden' garante que a barra só aparece em ecrãs pequenos.
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 shadow-2xl lg:hidden border-t-4 border-gold p-4">
            <div className="container mx-auto">
                <Link
                    to={buttonLink}
                    className="w-full bg-gold text-gray-900 px-6 py-3 rounded-xl font-extrabold text-lg 
                                hover:bg-yellow-400 transition-colors shadow-lg 
                                flex items-center justify-center space-x-2 uppercase"
                    aria-label={buttonText}
                >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
            </div>
        </div>
    );
};

export default MobileBookingBar;