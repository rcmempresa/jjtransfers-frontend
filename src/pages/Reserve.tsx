import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { useLanguage } from '../hooks/useLanguage';
import { TripDetails } from '../types';

const Reserve: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Extrai o ID do veículo da URL (Ex: /reserve?vehicle=id)
    const query = new URLSearchParams(location.search);
    const vehicleId = query.get('vehicle');
    
    // Funçao para lidar com o envio do formulário inicial
    const handleTripDetailsSubmit = (details: TripDetails) => {
        // Navega para a página de Booking/Checkout, enviando os detalhes
        // e o ID do veículo como estado e query param para ser lido no destino.
        const vehicleParam = vehicleId ? `&vehicle=${vehicleId}` : '';
        
        navigate(`/booking${location.search}`, { 
            state: { tripDetails: details } 
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-32 pb-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-4xl font-extrabold text-amber-400 mb-8 text-center">
                    {t('reservePage.title')}
                </h1>
                <p className="text-gray-400 mb-10 text-center">
                    {t('reservePage.subtitle')}
                </p>

                <div className="bg-black/80 rounded-xl shadow-2xl p-8 border border-gray-800">
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                        {t('booking.tripDetails')}
                    </h2>
                    
                    {/* Aqui renderizamos o formulário que recolhe as informações de pickup/dropoff */}
                    <BookingForm
                        onSubmit={handleTripDetailsSubmit} 
                        initialData={undefined} 
                        compact={false}
                        showServiceAndVehicle={false}
                    />
                    
                    {/* Se o veículo vier pré-selecionado, pode mostrar uma mensagem */}
                    {vehicleId && (
                        <p className="mt-4 text-sm text-amber-400 text-center">
                            {t('reservePage.vehicleSelected', { id: vehicleId })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reserve;