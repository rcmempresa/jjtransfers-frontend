import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Users, Luggage, Calendar, Clock, ArrowRight, Filter, Car, 
    ChevronLeft, ChevronRight, Tag, X, Briefcase, MapPin, 
    Zap, Map, AlertTriangle, DollarSign 
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { services } from '../data/services'; 
import VehicleCard, { VehicleInterface } from '../components/VehicleCard'; 
import { Service } from '../types'; 

// =========================================================================
// VARIÁVEL COPIADA PARA RESTRIÇÃO DO GOOGLE MAPS
// =========================================================================
declare global {
    interface Window {
        google: any;
    }
}

const MADEIRA_BOUNDS = {
    south: 32.3, west: -17.5, north: 33.2, east: -16.0,
};

// =========================================================================
// INTERFACE PARA PASSAR REFS E HANDLERS
// =========================================================================
interface QuickBookingProps {
    t: (key: string) => string; 
    onSubmit: (e: React.FormEvent) => void;
    data: { pickup: string; dropoff: string; date: string; time: string }; 
    setData: React.Dispatch<React.SetStateAction<any>>;
    pickupRef: React.RefObject<HTMLInputElement>;
    dropoffRef: React.RefObject<HTMLInputElement>;
    handleLocateMe: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    error: string | null;
}

// --- COMPONENTE DE FORMULÁRIO REUTILIZÁVEL PARA RESERVA RÁPIDA ---
const QuickBookingFormContent: React.FC<QuickBookingProps> = ({ 
    t, onSubmit, data, setData, 
    pickupRef, dropoffRef, handleLocateMe, setError, error
}) => {
    
    // Classes de input ajustadas para replicar o estilo do VehicleDetail
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-gold focus:ring-1 focus:ring-gold transition-colors";
    const iconColor = "text-gray-400";

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            
            {/* PICKUP (Com Botão de Localização - Estilo do VehicleDetail) */}
            <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                <input
                    type="text"
                    placeholder={t('booking.pickupAddress') || 'Endereço de Recolha'}
                    ref={pickupRef}
                    // NOTA: Não usamos value={data.pickup} para evitar conflitos com o Autocomplete.
                    // Usamos defaultValue e deixamos o Autocomplete controlar o valor.
                    defaultValue={data.pickup} 
                    onChange={() => setError(null)} 
                    className={`${inputClasses} pl-12 pr-12`}
                    required
                />
                {/* Botão de Geolocalização */}
                <button
                    type="button"
                    onClick={handleLocateMe}
                    title={t('booking.useCurrentLocation') || 'Usar Localização Atual'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gold transition-colors"
                >
                    <Map className="w-5 h-5" />
                </button>
            </div>
            
            {/* DROPOFF */}
            <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                <input
                    type="text"
                    placeholder={t('booking.dropoffAddress') || 'Endereço de Destino'}
                    ref={dropoffRef}
                    defaultValue={data.dropoff}
                    onChange={() => setError(null)} 
                    className={`${inputClasses} pl-12`}
                    required
                />
            </div>
            
            {/* DATE & TIME */}
            <div className="grid grid-cols-2 gap-2">
                {/* DATE */}
                <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                    <input
                        type="date"
                        value={data.date}
                        onChange={(e) => setData(prev => ({ ...prev, date: e.target.value }))}
                        className={`${inputClasses} pl-12`}
                        aria-label={t('booking.date') || 'Data'}
                        required
                    />
                </div>
                {/* TIME */}
                <div className="relative">
                    <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                    <input
                        type="time"
                        value={data.time}
                        onChange={(e) => setData(prev => ({ ...prev, time: e.target.value }))}
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

            {/* Adiciona uma secção de aviso de preço, como no VehicleDetail, mas genérica */}
            <div className="pt-4 border-t border-gray-700 space-y-2 text-sm">
                <h4 className="text-base font-semibold text-white flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gold"/>{t('fleetPage.priceNoteTitle') || 'Nota de Preço'}</h4>
                <p className="text-gray-400">
                    {t('fleetPage.priceNoteDesc') || 'O preço final será calculado no passo de reserva após escolher o veículo e o tipo de serviço (Transfer/Hora).'}
                </p>
            </div>


            <button 
                type="submit"
                className="w-full bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 shadow-lg flex items-center justify-center space-x-2 transition-colors"
            >
                <span>{t('fleetPage.viewPriceAndBook') || 'Ver Preço e Reservar'}</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    );
};


// --- COMPONENTE: BLOCO DE RESERVA RÁPIDA (Desktop/Sticky) ---
const FleetBookingBlock: React.FC<QuickBookingProps> = (props) => {
    const { t } = props;

    return (
        <div className="sticky top-8 bg-gray-900 rounded-xl shadow-2xl p-6 border-4 border-gold/20 transform transition-all duration-300 hover:shadow-gold/30">
            <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                <Car className="w-6 h-6 mr-2" /> {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
            </h3>
            
            <p className="text-gray-400 mb-4 text-sm">
                {t('fleetPage.quickBookDescription') || 'Insira os detalhes da sua viagem para pré-selecionar o veículo ideal.'}
            </p>

            <QuickBookingFormContent {...props} />
        </div>
    );
};


// --- COMPONENTE: BOTÃO DE RESERVA FIXO (MOBILE) ---
const MobileBookingBar: React.FC<{ 
    t: (key: string) => string; 
    handleQuickReserve: (e: React.FormEvent) => void; 
    quickReserveData: any; 
    setQuickReserveData: React.Dispatch<React.SetStateAction<any>>;
    pickupRef: React.RefObject<HTMLInputElement>;
    dropoffRef: React.RefObject<HTMLInputElement>;
    handleLocateMe: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    error: string | null;
}> = ({ 
    t, handleQuickReserve, quickReserveData, setQuickReserveData,
    pickupRef, dropoffRef, handleLocateMe, setError, error
}) => {
    
    const [isOpen, setIsOpen] = useState(false);

    const BookingFormContent = () => (
        <div className="bg-gray-900 rounded-t-xl p-6 border-t-4 border-gold">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gold flex items-center">
                    <Car className="w-5 h-5 mr-2" /> {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Reutiliza o formulário principal para consistência no mobile */}
            <QuickBookingFormContent 
                t={t}
                onSubmit={(e) => {
                    handleQuickReserve(e);
                    // Fechamos o modal se a submissão foi bem-sucedida (o navigate fará o resto)
                    if (!error) { 
                       setIsOpen(false);
                    }
                }}
                data={quickReserveData}
                setData={setQuickReserveData}
                pickupRef={pickupRef}
                dropoffRef={dropoffRef}
                handleLocateMe={handleLocateMe}
                setError={setError}
                error={error}
            />
        </div>
    );

    return (
        <>
            {/* Barra Inferior Fixa (Só no Mobile) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gold z-50 shadow-2xl">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-gold text-gray-900 py-3 font-extrabold text-lg flex items-center justify-center space-x-2 hover:bg-yellow-400 transition-colors"
                >
                    <Briefcase className="w-5 h-5" />
                    <span>{t('fleetPage.reserveNowBtn') || 'Reservar Agora'}</span>
                </button>
            </div>

            {/* Modal de Reserva (Mobile) */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-[60]"
                    onClick={() => setIsOpen(false)} 
                >
                    <div 
                        className="absolute bottom-0 left-0 right-0 animate-slideUp"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {BookingFormContent()}
                    </div>
                </div>
            )}
        </>
    );
};


// --- COMPONENTE AUXILIAR PARA O CARROSSEL (Mantido) ---
const VehicleCarousel: React.FC<{ vehicles: VehicleInterface[] }> = ({ vehicles }) => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    // Mostrar 3 veículos destacados ou todos se forem menos
    const featuredVehicles = vehicles.slice(0, Math.min(vehicles.length, 3)); 

    if (featuredVehicles.length === 0) return null;

    const totalSlides = featuredVehicles.length;
    const next = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    
    // Auto-slide a cada 5 segundos
    useEffect(() => {
        const interval = setInterval(next, 5000); 
        return () => clearInterval(interval);
    }, [totalSlides]);


    return (
        <div className="relative bg-gray-900 rounded-xl shadow-2xl p-4 md:p-8 text-white mb-12 border border-gold/20">
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-gold text-center mb-8">
                {t('fleetPage.featuredTitle') || 'Ofertas e Destaques da Frota'}
            </h2>

            <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ width: `${totalSlides * 100}%`, transform: `translateX(-${currentIndex * (100 / totalSlides)}%)` }}
                >
                    {featuredVehicles.map((v) => (
                        <div key={v.id} className="w-full flex-shrink-0 grid lg:grid-cols-2 gap-6 md:gap-8 items-center p-2" style={{ width: `${100 / totalSlides}%` }}>
                            
                            {/* IMAGEM E PREÇO */}
                            <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-xl shadow-2xl border border-gold/40">
                                <img
                                    src={v.image}
                                    alt={v.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-xl flex items-center">
                                    <span>{t('booking.from') || 'Desde'} {v.price}€/h</span>
                                </div>
                            </div>

                            {/* TEXTO E DETALHES */}
                            <div className="space-y-4 lg:space-y-6 p-2">
                                <h3 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{v.name}</h3>
                                
                                <p className="text-lg text-gray-300 italic">
                                    {t('fleetPage.featuredSubtitle') || 'A combinação perfeita de luxo e eficiência para a sua viagem.'}
                                </p>

                                {/* ESPECIFICAÇÕES BÁSICAS MAIS IMPACTANTES */}
                                <div className="flex space-x-6">
                                    <div className="flex items-center space-x-2 text-white">
                                        <Users className="w-6 h-6 text-gold" />
                                        <span className="text-xl font-semibold">{v.capacity} Pax</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-white">
                                        <Luggage className="w-6 h-6 text-gold" />
                                        <span className="text-xl font-semibold">{v.luggage_capacity} {t('fleetPage.luggage') || 'Malas'}</span>
                                    </div>
                                </div>
                                
                                {/* CALL TO ACTION */}
                                <Link 
                                    to={`/vehicle/${v.id}`}
                                    className="inline-flex items-center bg-gold text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all shadow-xl mt-4"
                                >
                                    {t('fleetPage.reserveThisNow') || 'Descubra e Reserve Agora'} <ArrowRight className="w-5 h-5 ml-3" />
                                </Link>
                                
                                {/* Benefício Extra (Exemplo) */}
                                <div className="flex items-center text-gray-400 pt-2">
                                    <Zap className="w-5 h-5 text-gold mr-2" />
                                    <span className="text-sm">{t('fleetPage.bonusFeature') || 'Inclui Wi-Fi e Água Grátis'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTÕES DE NAVEGAÇÃO */}
            <button onClick={prev} aria-label="Previous vehicle" className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 p-3 rounded-full hover:bg-opacity-90 transition-colors border border-gold/30 z-10">
                <ChevronLeft className="w-6 h-6 text-gold" />
            </button>
            <button onClick={next} aria-label="Next vehicle" className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 p-3 rounded-full hover:bg-opacity-90 transition-colors border border-gold/30 z-10">
                <ChevronRight className="w-6 h-6 text-gold" />
            </button>

            {/* INDICADORES (Dots) */}
            <div className="flex justify-center space-x-3 mt-6">
                {featuredVehicles.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                            currentIndex === index ? 'bg-gold' : 'bg-gray-700 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA FROTA ---
const Fleet: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate(); 
    
    // ESTADOS GERAIS
    const [vehicles, setVehicles] = useState<VehicleInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    
    // ESTADOS DO FORMULÁRIO DE RESERVA RÁPIDA
    const defaultDate = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    const [quickReserveData, setQuickReserveData] = useState({
        pickup: '',
        dropoff: '',
        date: defaultDate,
        time: '10:00'
    });
    // Erro de validação do formulário
    const [formError, setFormError] = useState<string | null>(null);

    // REFS PARA O GOOGLE AUTOCOMPLETE
    const pickupRef = useRef<HTMLInputElement>(null);
    const dropoffRef = useRef<HTMLInputElement>(null);

    // =========================================================================
    // LÓGICA DO AUTOCOMPLETE (Ajustada para Polling)
    // =========================================================================
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 30; // 3 segundos (30 * 100ms)

        // Verificação para garantir que a API do Google está carregada
        const checkAndInitialize = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                
                const bounds = new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(MADEIRA_BOUNDS.south, MADEIRA_BOUNDS.west),
                    new window.google.maps.LatLng(MADEIRA_BOUNDS.north, MADEIRA_BOUNDS.east)
                );
        
                const options = {
                    componentRestrictions: { country: 'pt' }, 
                    fields: ['formatted_address'], 
                    strictBounds: true,
                    bounds: bounds,
                    types: ['establishment', 'geocode'],
                };
                
                const cleanupFns: (() => void)[] = [];
        
                const initializeAutocomplete = (ref: React.RefObject<HTMLInputElement>, fieldName: 'pickup' | 'dropoff') => {
                    if (ref.current) {
                        const autocomplete = new window.google.maps.places.Autocomplete(ref.current, options);
                        
                        autocomplete.addListener('place_changed', () => {
                            const place = autocomplete.getPlace();
                            if (place.formatted_address) {
                                setQuickReserveData(prev => ({ ...prev, [fieldName]: place.formatted_address }));
                                setFormError(null);
                                // Atualiza o valor do input via DOM para garantir que o ref está correto
                                if (ref.current) {
                                     ref.current.value = place.formatted_address;
                                }
                            }
                        });
                        
                        // Tratar o caso em que o utilizador escreve e não seleciona (Blur event)
                        const handleBlur = () => {
                            if (ref.current) {
                                setQuickReserveData(prev => ({ ...prev, [fieldName]: ref.current!.value }));
                            }
                        };
                        ref.current.addEventListener('blur', handleBlur);
                        
                        cleanupFns.push(() => {
                            if (ref.current) {
                                ref.current.removeEventListener('blur', handleBlur);
                            }
                        });
                    }
                };

                // API carregada, inicializar Autocomplete
                initializeAutocomplete(pickupRef, 'pickup');
                initializeAutocomplete(dropoffRef, 'dropoff');

                // Cleanup function
                return () => cleanupFns.forEach(fn => fn());

            } else if (attempts < maxAttempts) {
                // Tentar novamente mais tarde
                attempts++;
                setTimeout(checkAndInitialize, 100);
            } else {
                 console.error("Google Maps Places library não carregou após 3 segundos. Verifique o seu script tag HTML.");
            }
        };

        const cleanup = checkAndInitialize();
        
        // Retorna a função de cleanup apenas se tiver sido definida durante a inicialização bem-sucedida
        return cleanup;

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    // =========================================================================
    // FUNÇÃO PARA GEOLOCALIZAÇÃO
    // =========================================================================
    const handleLocateMe = () => {
        if (!window.google || !window.google.maps) {
            setFormError(t('booking.geoBrowserError') || 'O seu navegador não suporta geolocalização ou a API do Google Maps não está carregada.');
            return;
        }

        if (navigator.geolocation) {
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const geocoder = new window.google.maps.Geocoder();
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    geocoder.geocode({ location: latlng }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            const address = results[0].formatted_address;

                            if (pickupRef.current) {
                                // Atualiza o DOM e o Estado
                                pickupRef.current.value = address;
                            }
                            
                            setQuickReserveData(prev => ({ ...prev, pickup: address }));
                            setFormError(null);

                        } else {
                            setFormError(t('booking.geoAddressError') || 'Não foi possível converter a localização em endereço.');
                        }
                    });
                },
                (err) => {
                    setFormError(t('booking.geoPermissionError') || 'A permissão de localização foi negada ou ocorreu um erro.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setFormError(t('booking.geoBrowserError') || 'O seu navegador não suporta geolocalização.');
        }
    };
    

    // =======================================================
    // LÓGICA DE SUBMISSÃO (Lê diretamente do DOM/Ref)
    // =======================================================
    const handleQuickReserve = (e: React.FormEvent) => {
        e.preventDefault();

        // LÊ OS VALORES MAIS RECENTES DIRETAMENTE DO DOM/REF (Correção para o problema de validação)
        const pickupValue = pickupRef.current?.value.trim() || '';
        const dropoffValue = dropoffRef.current?.value.trim() || '';
        
        // Atualiza o estado para garantir que os dados para o navigate estão corretos
        setQuickReserveData(prev => ({ 
            ...prev, 
            pickup: pickupValue, 
            dropoff: dropoffValue 
        }));

        const { date, time } = quickReserveData;
        const defaultServiceId = services.length > 0 ? String(services[0].id) : '1';

        // Validação usando os valores do DOM
        if (!pickupValue || !dropoffValue) {
            setFormError(t('fleetPage.formError') || 'Por favor, preencha todos os Endereços.');
            return;
        }

        setFormError(null);

        // Prepara os tripDetails no state 
        const tripDetails = {
            serviceId: defaultServiceId,
            pickupAddress: pickupValue, 
            dropoffAddress: dropoffValue, 
            date: date,
            time: time,
            vehicleId: null, // Na frota, não há veículo selecionado
        };
        
        // Redireciona para /booking com os dados no state
        navigate('/booking', { state: { tripDetails: tripDetails } });
    };

    // Lógica de Fetch da API (Mantida)
    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                // Endpoint local da API, ajuste conforme necessário
                const url = `http://localhost:3000/api/cars`;
                
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/cars`); 

                if (!response.ok) {
                    throw new Error(`Erro ${response.status} ao buscar a frota.`);
                }
                
                const apiResponse: { success: boolean; data?: any[] } = await response.json();
                const vehiclesData = apiResponse.data || [];
                
                const standardizedVehicles: VehicleInterface[] = vehiclesData.map(v => ({
                    id: String(v.id),
                    name: v.name,
                    description: v.description,
                    capacity: v.capacity, 
                    luggage_capacity: v.luggage_capacity, 
                    price: parseFloat(v.base_price_per_hour) || 0, 
                    type: v.category || 'N/D', 
                    image: v.media?.[0]?.url || v.image || 'https://placehold.co/400x300?text=Sem+Foto',
                    media: v.media || [],
                    features: v.features || [],
                }));
                
                setVehicles(standardizedVehicles);

            } catch (err) {
                setFetchError(t('fleetPage.fetchError') || 'Não foi possível carregar a frota. Tente novamente mais tarde.'); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, [t]);

    // Lógica de Filtragem e Mocks (Mantida)
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

    const allCategories = useMemo(() => {
        const categories = vehicles.map(v => v.type).filter((v, i, a) => a.indexOf(v) === i);
        return [t('fleetPage.allCategories') || 'Todos', ...categories]; 
    }, [vehicles, t]);

    const filteredVehicles = useMemo(() => {
        if (selectedCategory === (t('fleetPage.allCategories') || 'Todos')) {
            return vehicles;
        }
        return vehicles.filter(v => v.type === selectedCategory);
    }, [selectedCategory, vehicles, t]);
    
    // Mocks de Notícias e Tópicos (necessários para o bloco da sidebar)
    const latestNews = [
        { id: 1, title: t('fleetPage.news1Title') || 'Novos Padrões de Segurança Em Vigor', category: 'Viagens de Negócios', image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', date: '22 Mar 2024' },
        { id: 2, title: t('fleetPage.news2Title') || 'Economize 15% Em Reservas Recorrentes', category: 'Motoristas', image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', date: '18 Mar 2024' }
    ];

    const categories = [
        t('fleetPage.topic1') || 'Viagens de Negócios', t('fleetPage.topic2') || 'Motoristas', 
        t('fleetPage.topic3') || 'Limousine', t('fleetPage.topic4') || 'Transfer Aeroporto', 
    ];


    // --- RENDERIZAÇÃO DE ESTADOS ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center pt-32">
                <div className="text-xl text-gold animate-pulse">{t('loading') || 'A Carregar Frota...'}</div>
            </div>
        );
    }

    if (fetchError && !vehicles.length) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8 pt-32">
                <h1 className="text-3xl font-extrabold text-red-500 mb-4">Erro de Conexão</h1>
                <p className="text-xl text-gray-400 mb-8">{fetchError}</p>
            </div>
        );
    }
    
    if (vehicles.length === 0 && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8 pt-32">
                <h1 className="text-3xl font-extrabold text-white mb-4">Frota Indisponível</h1>
                <p className="text-xl text-gray-400 mb-8">Nenhum veículo está ativo ou disponível no momento.</p>
                <Link to="/" className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">Voltar à Página Inicial</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 pb-16 lg:pb-0"> 
        {/* Header Section */}
        <div className="bg-black py-16 pt-32 shadow-2xl border-b-4 border-gold">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-wider">
                    {t('fleetPage.title') || 'A Nossa Frota Premium'}
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-6 font-light">{t('fleetPage.subtitle')}</p>
                <div className="flex items-center justify-center space-x-2 text-gold">
                    <Link to="/" className="hover:text-yellow-400 transition-colors font-semibold">{t('fleetPage.homeBreadcrumb')}</Link>
                    <span>/</span>
                    <span className="text-gray-400">{t('fleetPage.fleetBreadcrumb')}</span>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16">

            <VehicleCarousel vehicles={vehicles} />
            
            <div className="grid lg:grid-cols-4 gap-12">
            
                {/* Coluna Principal da Frota (3/4) */}
                <div className="lg:col-span-3 order-2 lg:order-1"> 
                    
                    {/* Barra de Filtros */}
                    <div className="mb-8 p-4 bg-gray-900 rounded-xl shadow-2xl flex flex-wrap gap-3 items-center border border-gray-700">
                        <span className="text-lg font-semibold text-gold mr-2 flex items-center">
                            <Filter className="w-5 h-5 mr-2" /> {t('fleetPage.filterTitle')}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {allCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                                        selectedCategory === category
                                            ? 'bg-gold text-gray-900 shadow-md scale-105'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid dos Veículos */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map((vehicle) => (
                                <VehicleCard 
                                    key={vehicle.id} 
                                    vehicle={vehicle} 
                                    showPrice={true} // Mostrar preço
                                />
                            ))
                        ) : (
                            <div className="lg:col-span-3 text-center p-12 bg-gray-900 rounded-xl shadow-xl">
                                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{t('fleetPage.noVehiclesTitle') || 'Nenhum Veículo Encontrado'}</h3>
                                <p className="text-gray-400">{t('fleetPage.noVehiclesMessage') || 'Tente ajustar os seus filtros de pesquisa.'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna de Sidebar (1/4 - Desktop) */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    {/* Bloco de Reserva Rápida (Estilo VehicleDetail) */}
                    <FleetBookingBlock
                        t={t}
                        onSubmit={handleQuickReserve}
                        data={quickReserveData}
                        setData={setQuickReserveData}
                        pickupRef={pickupRef}
                        dropoffRef={dropoffRef}
                        handleLocateMe={handleLocateMe}
                        setError={setFormError}
                        error={formError}
                    />

                    {/* Bloco de Notícias/Tópicos */}
                    <div className="mt-8 bg-gray-900 rounded-xl shadow-2xl p-6 border-4 border-gray-700/20">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                            {t('fleetPage.sidebarNewsTitle') || 'Últimas Notícias'}
                        </h3>
                        <div className="space-y-4">
                            {latestNews.map(news => (
                                <Link to={`/blog/${news.id}`} key={news.id} className="block group">
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={news.image} 
                                            alt={news.title} 
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div>
                                            <p className="text-xs text-gold font-medium">{news.category}</p>
                                            <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors leading-tight">
                                                {news.title}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Bloco de Categorias de Blog */}
                    <div className="mt-8 bg-gray-900 rounded-xl shadow-2xl p-6 border-4 border-gray-700/20">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                            {t('fleetPage.sidebarTopicsTitle') || 'Tópicos Populares'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <Link 
                                    to={`/blog?category=${category}`} 
                                    key={category} 
                                    className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full hover:bg-gold hover:text-gray-900 transition-colors"
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile CTA (Barra de Reserva Rápida) */}
            <MobileBookingBar 
                t={t} 
                handleQuickReserve={handleQuickReserve}
                quickReserveData={quickReserveData}
                setQuickReserveData={setQuickReserveData}
                pickupRef={pickupRef}
                dropoffRef={dropoffRef}
                handleLocateMe={handleLocateMe}
                setError={setFormError}
                error={formError}
            />
        </div>
        </div> // Fim do div principal que estava em falta
    );
};

export default Fleet;
