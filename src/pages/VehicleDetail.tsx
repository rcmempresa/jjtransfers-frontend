import React, { useState, useEffect, useMemo, useRef } from 'react';
import LocationPickerField from '../components/LocationPickerField';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    Users, Luggage, ArrowRight, Car, Euro, Check, Tag, ChevronLeft, X, 
    Calendar, DollarSign, Star, ShieldCheck, Zap, Heart, Briefcase, 
    ChevronDown, MapPin, Clock, Map, Loader, AlertTriangle
} from 'lucide-react'; 
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
// Importe a interface que define a estrutura do seu veículo
import { VehicleInterface } from '../components/VehicleCard';

// Importe a sua lista de serviços, que é usada no bloco de reserva
import { services } from '../data/services'; 
import MobileBookingBar from '../components/MobileBookingBar'; 
import VehicleCard from '../components/VehicleCard'; // Usado para a secção de relacionados

// =========================================================================
// 🎯 VARIÁVEL COPIADA DO BOOKINGFORM PARA RESTRIÇÃO DO GOOGLE MAPS
// =========================================================================
declare global {
  interface Window {
    google: any;
  }
}

const MADEIRA_BOUNDS = {
  south: 32.3, west: -17.5, north: 33.2, east: -16.0,
};

// --- Componente: Galeria de Imagens (Mantido) ---
const VehicleGallery: React.FC<{ images: string[], alt: string }> = ({ images, alt }) => {
    // Certifica-se de que images não está vazia antes de acessar o índice [0]
    const [mainImage, setMainImage] = useState(images.length > 0 ? images[0] : 'https://placehold.co/600x400?text=Sem+Foto');
    
    // Atualiza a imagem principal se o array de imagens mudar (ex: ao carregar o veículo)
    useEffect(() => {
        if (images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    return (
        <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden mb-10 border border-gold/20">
            {/* Imagem Principal */}
            <img
                src={mainImage}
                alt={alt}
                className="w-full h-auto object-cover max-h-[500px] transition-opacity duration-500"
            />
            
            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-3 border-t border-gray-800">
                    {images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`${alt} - ${index + 1}`}
                            className={`h-16 object-cover cursor-pointer rounded-lg border-2 transition-all ${
                                img === mainImage ? 'border-gold opacity-100' : 'border-gray-700 opacity-75 hover:opacity-100'
                            }`}
                            onClick={() => setMainImage(img)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente: Bloco de Reserva (Desktop / Sticky) ---
const VehicleBookingBlock: React.FC<{ vehicleName: string, vehicleId: string, basePrice: number }> = ({ vehicleName, vehicleId, basePrice }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const iconColor = "text-gray-400"; // Definição da cor do ícone

    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    
    const defaultServiceId = services.length > 0 ? String(services[0].id) : '1'; 

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('10:00');
    const [error, setError] = useState(''); 
    

    
    // =========================================================================
    // LÓGICA DE SUBMISSÃO (Mantida)
    // =========================================================================
    const handleBookClick = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pickup.trim() || !dropoff.trim()) {
            setError(t('vehicleDetail.errorMissingFieldsAddress') || 'Por favor, preencha ambos os Endereços.');
            return;
        } 
        
        setError(''); 
        
        const tripDetails = {
            serviceId: defaultServiceId,
            pickupAddress: pickup,
            dropoffAddress: dropoff,
            date: date,
            time: time,
            vehicleId: vehicleId, 
            vehicleName: vehicleName,
        };
        
        navigate('/booking', { state: { tripDetails: tripDetails } });
    };
    
    // ... (Resto da lógica de Preço e Classes)
    const driverFee = 5; 
    const price = basePrice || 0; 
    const subtotal = price;
    const taxes = (subtotal * 0.05); 
    const totalEstimated = subtotal + driverFee + taxes;
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border focus:ring-1 transition-colors";
    
    return (
        <div className="sticky top-8 bg-gray-900 rounded-xl shadow-2xl p-6 border-4 border-gold/20 transform transition-all duration-300 hover:shadow-gold/30">
            <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                <Car className="w-6 h-6 mr-2" /> {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
            </h3>
            
            <div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gold/50">
                <p className="text-sm text-gray-400 font-semibold">{t('booking.selectVehicleOption') || 'Veículo Selecionado'}:</p>
                <p className="text-lg font-extrabold text-white">{vehicleName}</p>
                <Link to="/fleet" className="text-xs text-gold hover:text-yellow-400 transition-colors mt-1 inline-block">
                    ({t('vehicleDetail.changeVehicle') || 'Mudar Veículo'})
                </Link>
            </div>
            

            <form onSubmit={handleBookClick} className="space-y-4">
                
                {/* Seletor de localizações com mapa */}
                <LocationPickerField
                    pickup={pickup}
                    dropoff={dropoff}
                    onConfirm={(p, d) => { setPickup(p); setDropoff(d); setError(''); }}
                />
                
                {/* Campos de Data/Hora (Com Ícones) */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <Calendar className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={`${inputClasses} pl-12`} 
                            aria-label={t('booking.date') || 'Data'} 
                            required
                        />
                    </div>
                    <div className="relative">
                        <Clock className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className={`${inputClasses} pl-12`}
                            aria-label={t('booking.time') || 'Hora'} 
                            required
                        />
                    </div>
                </div>
                
                {error && (
                    <p className="text-sm text-red-500 font-medium flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {error}
                    </p>
                )}

                <div className="pt-4 border-t border-gray-700 mt-4 space-y-2 text-sm">
                    <h4 className="text-base font-semibold text-white flex items-center mb-2"><DollarSign className="w-4 h-4 mr-2 text-gold"/>{t('vehicleDetail.priceEstimateTitle') || 'Estimativa de Preço'}</h4>
                    <div className="flex justify-between text-gray-400">
                        <span>{t('vehicleDetail.baseRate') || 'Taxa Base'} ({price}€ / {t('booking.hours').substring(0, 1)}):</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>{t('vehicleDetail.driverFee') || 'Taxa Motorista'}:</span>
                        <span>{driverFee.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span>{t('vehicleDetail.taxes') || 'Impostos'}:</span>
                        <span>{taxes.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gold border-t border-gray-700 pt-2">
                        <span>{t('booking.total') || 'Total Estimado'}:</span>
                        <span>{totalEstimated.toFixed(2)}€</span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                    <span>{t('fleetPage.viewPriceAndBook') || 'Ver Preço e Reservar'}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};


// --- Componente Principal: Detalhes do Veículo (COM API FETCH - Mantido) ---
const VehicleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const { t } = useLanguage();
    
    // ... (Estados e Lógica de Fetch da API mantidos)
    const [vehicle, setVehicle] = useState<VehicleInterface | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [relatedVehicles, setRelatedVehicles] = useState<VehicleInterface[]>([]);

    useEffect(() => {
        if (!id) {
            setIsNotFound(true);
            setIsLoading(false);
            return;
        }

        const fetchVehicle = async () => {
            setIsLoading(true);
            setIsNotFound(false);
            try {
                const url = `http://localhost:3000/api/cars/${id}`;
                
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/cars/${id}`); 
                
                if (!response.ok) {
                    setIsNotFound(true);
                    return; 
                }
                
                const apiResponse: { success: boolean; data?: any } = await response.json();
                const vehicleData = apiResponse.data; 

                
                if (vehicleData && vehicleData.id) {
                    
                    const standardizedVehicle: VehicleInterface = {
                        price: parseFloat(vehicleData.base_price_per_hour) || 0, 
                        type: vehicleData.category || 'N/D', 
                        id: String(vehicleData.id), 
                        name: vehicleData.name,
                        description: vehicleData.description,
                        capacity: vehicleData.capacity,
                        luggage_capacity: vehicleData.luggage_capacity,
                        media: vehicleData.media || [],
                        image: vehicleData.media?.[0]?.url || vehicleData.image || 'https://placehold.co/600x400?text=Sem+Foto', 
                        features: vehicleData.features || [],
                    };

                    setVehicle(standardizedVehicle);
                } else {
                    setIsNotFound(true);
                }
            } catch (err) {
                setIsNotFound(true); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicle();
    }, [id]); 
    
    useSEO({
        title: vehicle
            ? `${vehicle.name} | Transfer Privado na Madeira — JJ Transfers`
            : 'Veículo de Transfer Privado na Madeira | JJ Transfers',
        description: vehicle
            ? `Reserve o ${vehicle.name} para o seu transfer privado na Madeira. Capacidade: ${vehicle.capacity} passageiros, ${vehicle.luggage_capacity} malas. Ideal para transfer aeroporto, passeios e transporte na ilha.`
            : 'Descubra os nossos veículos premium para transfers privados na Madeira. Aeroporto, passeios e transporte executivo.',
        keywords: `${vehicle?.name || 'veículo'} transfer madeira, transfer privado madeira, carro com motorista madeira, ${vehicle?.type || ''} madeira`,
        url: `/vehicle/${id}`,
    });

    const translatedFeatures = useMemo(() => {
        if (!vehicle || !vehicle.features) return [];

        const translateFeature = (featureKey: string): string => {
            const translationKey = `featuresMap.${featureKey}`;
            const translatedText = t(translationKey);
            
            if (translatedText && translatedText !== translationKey) {
                return translatedText;
            }
            return featureKey; 
        };
        
        return vehicle.features.map(translateFeature);
    }, [vehicle, t]);
    
    // ... (Renderização de Loading / Not Found mantida)
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-xl text-gold animate-pulse">{t('loading') || 'A Carregar Detalhes do Veículo...'}</div>
            </div>
        );
    }
    
    if (isNotFound || !vehicle) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl font-extrabold text-gold mb-4">{t('vehicleDetail.notFoundTitle') || 'Veículo Não Encontrado'}</h1>
                <p className="text-xl text-gray-400 mb-8">{t('vehicleDetail.notFoundMessage') || 'O veículo que procura não existe ou foi retirado da frota.'}</p>
                <Link to="/fleet" className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center space-x-2">
                    <ChevronLeft className="w-5 h-5" />
                    <span>{t('vehicleDetail.backToFleet') || 'Voltar à Frota'}</span>
                </Link>
                <div className="h-16 lg:hidden"></div> 
            </div>
        );
    }
    
    // ... (Variáveis e Mock Data mantidos)
    const images = vehicle.media && vehicle.media.length > 0 
        ? vehicle.media.map(m => m.url) 
        : [vehicle.image]; 
        
    const description = vehicle.description || t('vehicleDetail.defaultDescription');
    const featuresDisplay = translatedFeatures.length > 0 ? translatedFeatures : [t('vehicleDetail.featureWifi') || 'WiFi Grátis', t('vehicleDetail.featureWater') || 'Água Engarrafada']; 
    
    const mockReviews = [
        { name: "Ana S.", rating: 5, comment: t('vehicleDetail.review1') || "Experiência impecável. Carro limpo e motorista muito profissional." },
        { name: "João P.", rating: 5, comment: t('vehicleDetail.review2') || "Pontualidade excelente. Foi o melhor transfer que já tive." },
    ];
    const keyBenefits = [
        { icon: ShieldCheck, title: t('vehicleDetail.benefitSafetyTitle') || 'Segurança Máxima', description: t('vehicleDetail.benefitSafetyDesc') || 'Veículos inspecionados e motoristas treinados.' },
        { icon: Zap, title: t('vehicleDetail.benefitTechTitle') || 'Tecnologia Avançada', description: t('vehicleDetail.benefitTechDesc') || 'GPS e monitorização em tempo real.' },
        { icon: Heart, title: t('vehicleDetail.benefitComfortTitle') || 'Conforto Superior', description: t('vehicleDetail.benefitComfortDesc') || 'Assentos em couro e ar-condicionado premium.' },
        { icon: Briefcase, title: t('vehicleDetail.benefitExecTitle') || 'Serviço Executivo', description: t('vehicleDetail.benefitExecDesc') || 'Ideal para viagens de negócios e VIPs.' },
    ];


    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-16 lg:pb-0"> 
            
            {/* Header / Breadcrumbs (Mantido) */}
            <div className="bg-black py-16 pt-32 shadow-2xl border-b-4 border-gold">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-wider">{vehicle.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-400 mb-6">
                        <p className="text-lg md:text-xl font-light">{vehicle.type} • {t('booking.from') || 'Desde'} {vehicle.price}€ / {t('booking.hours').substring(0, 1)}</p>
                        <div className="flex items-center text-gold">
                            <Star className="w-5 h-5 fill-gold mr-1" />
                            <span className="font-bold">5.0</span>
                            <span className="text-gray-400 text-sm ml-1">({mockReviews.length} {t('vehicleDetail.reviews') || 'avaliações'})</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gold">
                        <Link to="/" className="hover:text-yellow-400 transition-colors font-semibold">{t('fleetPage.homeBreadcrumb')}</Link>
                        <span>/</span>
                        <Link to="/fleet" className="hover:text-yellow-400 transition-colors font-semibold">{t('fleetPage.fleetBreadcrumb')}</Link>
                        <span>/</span>
                        <span className="text-gray-400 truncate max-w-xs">{vehicle.name}</span>
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto px-4 py-12 md:py-16">
                
                <div className="grid lg:grid-cols-3 gap-12">
                    
                    {/* Coluna de Detalhes do Veículo (Mantido) */}
                    <div className="lg:col-span-2">
                        <VehicleGallery images={images} alt={vehicle.name} />

                        {/* ... (Blocos de Especificações, Descrição e Avaliações mantidos) */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 mb-10 border border-gray-700">
                            <h2 className="text-2xl font-bold text-gold mb-6 border-b border-gray-700 pb-3 flex items-center">
                                <Tag className="w-5 h-5 mr-2" /> {t('vehicleDetail.specsTitle') || 'Especificações'}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Users className="w-6 h-6 text-gold mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{vehicle.capacity}</p>
                                    <p className="text-xs text-gray-400">{t('booking.passengers') || 'Passageiros'}</p>
                                </div>
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Luggage className="w-6 h-6 text-gold mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{vehicle.luggage_capacity}</p>
                                    <p className="text-xs text-gray-400">{t('booking.luggage') || 'Malas'}</p>
                                </div>
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Euro className="w-6 h-6 text-gold mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{vehicle.price}€ / {t('booking.hours').substring(0, 1)}</p>
                                    <p className="text-xs text-gray-400">{t('vehicleDetail.basePrice') || 'Preço Base'}</p>
                                </div>
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    <Calendar className="w-6 h-6 text-gold mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{t('vehicleDetail.categoryName') || 'Categoria'}</p>
                                    <p className="text-xs text-gray-400">{vehicle.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 mb-10 border border-gray-700">
                            <h2 className="text-2xl font-bold text-gold mb-6 border-b border-gray-700 pb-3">
                                {t('vehicleDetail.descriptionTitle') || 'Descrição'}
                            </h2>
                            <p className="text-gray-300 leading-relaxed mb-8">
                                {description}
                            </p>
                            
                            <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-gray-800 pb-2">
                                {t('vehicleDetail.whyChooseTitle') || 'Porque Escolher Este Veículo'}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {keyBenefits.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <item.icon className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-md font-semibold text-white">{item.title}</p>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-gray-800 pb-2">
                                {t('vehicleDetail.amenitiesTitle') || 'Comodidades Incluídas'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {featuresDisplay.map((feature, index) => (
                                    <div key={index} className="flex items-center text-gray-300">
                                        <Check className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold text-gold mb-6 border-b border-gray-700 pb-3 flex items-center">
                                <Star className="w-5 h-5 fill-gold mr-2" /> {t('vehicleDetail.reviewsTitle') || 'Avaliações dos Clientes'}
                            </h2>
                            <div className="space-y-6">
                                {mockReviews.map((review, index) => (
                                    <div key={index} className="pb-4 border-b border-gray-800 last:border-b-0">
                                        <div className="flex items-center mb-2">
                                            {Array.from({ length: review.rating }, (_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-gold text-gold mr-1" />
                                            ))}
                                            <span className="font-semibold text-white ml-2">{review.name}</span>
                                        </div>
                                        <p className="text-gray-300 italic">"{review.comment}"</p>
                                    </div>
                                ))}
                                <Link to="/testimonials" className="text-gold hover:text-yellow-400 transition-colors text-sm inline-block mt-4">
                                    {t('vehicleDetail.readAllReviews') || 'Ler Todas as Avaliações'}
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Coluna de Reserva (Desktop) */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <VehicleBookingBlock vehicleName={vehicle.name} vehicleId={vehicle.id} basePrice={vehicle.price} />
                    </div>
                </div>

                {/* Seção de Veículos Relacionados (Mantida) */}
                {relatedVehicles.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-gray-800">
                        <h2 className="text-3xl font-bold text-white mb-4">{t('vehicleDetail.relatedTitle') || 'Veículos Relacionados'}</h2>
                        <p className="text-lg text-gray-400 mb-8">
                            {t('vehicleDetail.relatedSubtitle') || 'Outras opções que podem lhe interessar.'}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedVehicles.map((v) => (
                                <VehicleCard 
                                    key={v.id} 
                                    vehicle={v} 
                                    showPrice={true}
                                /> 
                            ))}
                        </div>
                        
                        <div className="text-center mt-10">
                            <Link to="/fleet" className="text-gold border border-gold px-6 py-3 rounded-lg font-semibold hover:bg-gold hover:text-gray-900 transition-colors">
                                {t('fleet.viewAll') || 'Ver Toda a Frota'}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Mobile CTA (Mantido) */}
            <MobileBookingBar 
                overrideText={t('vehicleDetail.bookThisVehicle') || 'Reservar Este Veículo'} 
                overrideLink={`/booking`}
            />
        </div>
    );
};

export default VehicleDetail;