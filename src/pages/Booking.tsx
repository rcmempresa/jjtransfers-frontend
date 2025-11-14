import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 

// Ícones
import { 
    Check, Briefcase, Lock, Plane, Calendar, Clock, Heart, MapPin, 
    Moon, Music, Car, Loader2, ArrowRight, CornerDownRight, XCircle
} from 'lucide-react'; 

// Componentes (assumindo a sua estrutura de ficheiros)
import BookingForm from '../components/BookingForm'; 
import VehicleCard from '../components/VehicleCard';
import ClientDetailsStep from '../components/ClientDetailsStep'; // 🚨 Importação do novo componente
import { useLanguage } from '../hooks/useLanguage';
import ElectricBorder from '../components/ElectricBorder'; // Se usa o seu ElectricBorder
// ----------------------------------------------------------------------
// TIPAGEM DINÂMICA (Manter a que usa no seu projeto)
// ----------------------------------------------------------------------
type ServiceType = { 
    id: string; 
    title: string; 
    description?: string; 
    icon?: string; 
    image?: string; 
};

type Vehicle = { 
    id: string; 
    name: string; 
    price: number; 
    capacity: number; 
    luggage_capacity: number; 
    type: string; 
    image: string; 
    serviceTypes: string[]; 
}; 

export type TripDetails = { 
    pickupAddress: string; 
    dropoffAddress: string; 
    date: string; 
    time: string; 
    tripType: 'one-way' | 'round-trip'; 
    returnDate?: string; 
    returnTime?: string; 
    durationHours?: number;
};

type BookingStep = { 
    step: number; 
    title: string; 
    completed: boolean; 
};

type PaymentData = {
    entity?: string;
    reference?: string;
    value?: string;
    redirect_url?: string;
    message?: string;
    transaction_key?: string;
    phone?: string; 
};

interface ReservationResponse {
    success: boolean;
    message: string;
    reservation: { id: number; fleet_id: number; trip_pickup_time: string; /* ... */ };
    payment: {
        method: string;
        data: PaymentData;
    };
}

export type ReservedSlot = {
    iso_date: string;
    vehicle_id: string;
};
// ----------------------------------------------------------------------

const IconMap: { [key: string]: React.ElementType } = {
    Briefcase: Briefcase, Plane: Plane, Calendar: Calendar, Clock: Clock, 
    Heart: Heart, MapPin: MapPin, Moon: Moon, Music: Music, Car: Car, 
};

const PaymentImageMap: { [key: string]: string } = {
    'mbw': 'https://placehold.co/100x40?text=MB+Way',
    'mb': 'https://placehold.co/100x40?text=Multibanco',
    'cc': 'https://placehold.co/100x40?text=Cartão',
};

const VIDEO_EMBED_URL = "https://www.youtube.com/embed/AOTGBDcDdEQ?autoplay=1&mute=1&loop=1&playlist=AOTGBDcDdEQ&controls=0&modestbranding=1&rel=0";

// Variáveis de Estilo
const goldColor = 'text-amber-400';
const cardBg = 'bg-black/80 border border-gray-800'; 

// HOOK PARA DETEÇÃO DE ECRÃ MÓVEL (Se estiver a usar)
const useIsMobile = (breakpoint = 768) => {
    const mediaQuery = `(max-width: ${breakpoint - 1}px)`;
    
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(mediaQuery).matches;
        }
        return false; 
    }); 
    
    useEffect(() => {
        const mql = window.matchMedia(mediaQuery);
        
        const handleMediaQueryChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        if (mql.addEventListener) {
            mql.addEventListener('change', handleMediaQueryChange);
        } else {
            mql.addListener(handleMediaQueryChange); 
        }
        setIsMobile(mql.matches);

        return () => {
            if (mql.removeEventListener) {
                mql.removeEventListener('change', handleMediaQueryChange);
            } else {
                mql.removeListener(handleMediaQueryChange);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [breakpoint, mediaQuery]); 

    return isMobile;
};

// ======================================================================

const Booking: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); 
  
  const initialTripDetails = location.state?.tripDetails; 
  
  const query = new URLSearchParams(location.search);
  const initialPickup = query.get('pickup');
  const initialDropoff = query.get('dropoff');

  let startStep = 1;
  if (initialTripDetails || (initialPickup && initialDropoff)) {
      startStep = 2; 
  }
  
  // ----------------------------------------------------------------------
  // ESTADOS PRINCIPAIS
  // ----------------------------------------------------------------------
  const [servicesList, setServicesList] = useState<ServiceType[]>([]);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [reservedSlots, setReservedSlots] = useState<ReservedSlot[]>([]); 
  const [currentStep, setCurrentStep] = useState(startStep);
  
  // ESTADOS DE RESERVA/PAGAMENTO
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [reservationResponse, setReservationResponse] = useState<ReservationResponse | null>(null);
  
  const [clientForm, setClientForm] = useState({
      passenger_name: '',
      passenger_email: '',
      passenger_phone: '',
      special_requests: '',
      paymentMethod: 'mbw' as 'mbw' | 'mb' | 'cc',
  });
  
  const [slotValidationError, setSlotValidationError] = useState<string | null>(null); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showVehicleWarning, setShowVehicleWarning] = useState(false); 
  
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(
      initialTripDetails || (initialPickup && initialDropoff ? {
          pickupAddress: decodeURIComponent(initialPickup),
          dropoffAddress: decodeURIComponent(initialDropoff),
          date: new Date().toISOString().split('T')[0], 
          time: "10:00", 
          tripType: 'one-way', 
          durationHours: 1, 
      } as TripDetails : null)
  );

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null); 
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // ----------------------------------------------------------------------
  // LÓGICA DE BUSCA DA API (Mantida)
  // ----------------------------------------------------------------------
  useEffect(() => {
    // ... lógica de fetch data ...
    const fetchBookingData = async () => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            // --- 1. BUSCA DE CARROS E SERVIÇOS ---
            const carsUrl = `${import.meta.env.VITE_BACKEND_URL}api/cars`;
            const carsResponse = await fetch(carsUrl); 
            
            if (!carsResponse.ok) {
                 throw new Error(`Falha na resposta HTTP de cars: Status ${carsResponse.status}`);
            }

            const carsResult: { success: boolean; data?: any[] } = await carsResponse.json();
            const carImagesMap = new Map<string, string>();
            (carsResult.data || []).forEach(v => {
                const vehicleId = String(v.id);
                const imageUrl = v.media?.[0]?.url || 'https://placehold.co/400x300?text=Sem+Foto';
                carImagesMap.set(vehicleId, imageUrl);
            });
            
            const servicesUrl = `${import.meta.env.VITE_BACKEND_URL}api/services`;
            const servicesResponse = await fetch(servicesUrl); 
            if (!servicesResponse.ok) {
                throw new Error(`Falha na resposta HTTP de serviços: Status ${servicesResponse.status}`);
            }

            const servicesResult: { success: boolean; data?: any[] } = await servicesResponse.json();
            const rawServices = servicesResult.data || [];
            
            const newServicesList: ServiceType[] = [];
            const allVehiclesMap = new Map<string, Vehicle>(); 
            
            rawServices.forEach(s => {
                const serviceId = String(s.id);

                newServicesList.push({
                    id: serviceId,
                    title: s.name.pt || serviceId, 
                    description: s.description?.pt || '',
                    icon: s.icon_key || 'Briefcase',
                    image: s.image_url || '',
                });

                (s.fleets || []).forEach((v: any) => {
                    const vehicleId = String(v.id);
                    const imageUrl = carImagesMap.get(vehicleId) || 'https://placehold.co/400x300?text=Sem+Foto (Fallback)';
                    
                    if (allVehiclesMap.has(vehicleId)) {
                        const existingVehicle = allVehiclesMap.get(vehicleId)!;
                        if (!existingVehicle.serviceTypes.includes(serviceId)) {
                            existingVehicle.serviceTypes.push(serviceId);
                        }
                        allVehiclesMap.set(vehicleId, existingVehicle);

                    } else {
                        const newVehicle: Vehicle = {
                            id: vehicleId,
                            name: v.name,
                            price: Number(v.base_price_per_hour) || 0, 
                            capacity: v.capacity || 4, 
                            luggage_capacity: v.luggage_capacity || 2, 
                            type: v.category || 'Standard', 
                            image: imageUrl, 
                            serviceTypes: [serviceId],
                        };
                        allVehiclesMap.set(vehicleId, newVehicle);
                    }
                });
            });
            
            const newVehiclesList = Array.from(allVehiclesMap.values());
            setServicesList(newServicesList);
            setVehiclesList(newVehiclesList);


            // --- 2. BUSCA DE SLOTS RESERVADOS ---
            const reservedUrl = `${import.meta.env.VITE_BACKEND_URL}api/reservations/reserved-slots`;
            const reservedResponse = await fetch(reservedUrl);
            
            if (!reservedResponse.ok) {
                console.warn("Aviso: Não foi possível carregar os slots reservados.");
            } else {
                const reservedResult: { success: boolean; data: ReservedSlot[] } = await reservedResponse.json();
                
                const validSlots = (reservedResult.data || []).filter(slot => 
                    slot && slot.iso_date && slot.vehicle_id
                );
                
                setReservedSlots(validSlots);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error("🛑 ERROR: Erro capturado durante o fetch:", errorMessage);
            setApiError(t('booking.fetchDataError') || `Não foi possível carregar os dados. Erro: ${errorMessage}`); 
        } finally {
            setIsLoading(false);
        }
    };

    fetchBookingData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, navigate, location.search]); 

  // ESTRUTURA DE 6 PASSOS (Mantida)
  const steps: BookingStep[] = [
    { step: 1, title: t('booking.tripAddresses') || '1. Localização', completed: currentStep > 1 },
    { step: 2, title: t('booking.selectService') || '2. Serviço', completed: currentStep > 2 },
    { step: 3, title: t('booking.selectVehicle') || '3. Veículo', completed: currentStep > 3 },
    { step: 4, title: t('booking.tripDateTime') || '4. Data & Hora', completed: currentStep > 4 }, 
    { step: 5, title: t('booking.paymentDetails') || '5. Pagamento', completed: currentStep > 5 },
    { step: 6, title: t('booking.confirmation') || '6. Confirmação', completed: false },
  ];

  // MEMOS (Mantidos)
  const getSelectedDateTime = useMemo(() => {
    if (!tripDetails?.date || !tripDetails?.time) return null;
    return `${tripDetails.date}T${tripDetails.time}:00.000Z`;
  }, [tripDetails]);

  const isHourlyService = useMemo(() => {
    return selectedService?.id === "6" || (selectedService?.title.includes('Hora') ?? false);
  }, [selectedService]);

  const validateCurrentSlotAvailability = useCallback((): boolean => {
    // ... lógica de validação (mantida) ...
    if (!selectedVehicle || !getSelectedDateTime) {
        setSlotValidationError(null); 
        return true; 
    }
    
    const isCurrentlyReserved = reservedSlots.some(slot => 
        slot.vehicle_id === selectedVehicle.id && 
        slot.iso_date === getSelectedDateTime
    );

    if (isCurrentlyReserved) {
        setSlotValidationError(
            t('booking.slotUnavailableError') || 
            `O veículo ${selectedVehicle.name} ficou indisponível para a data e hora selecionadas.`
        );
        return false;
    }
    
    setSlotValidationError(null); 
    return true;
  }, [selectedVehicle, getSelectedDateTime, reservedSlots, t]);

  const availableVehicles = useMemo(() => {
    if (!selectedService) return vehiclesList; 
    
    return vehiclesList.filter(v => v.serviceTypes && v.serviceTypes.includes(selectedService.id)); 
  }, [selectedService, vehiclesList]);

  const calculatedPrice = useMemo(() => {
    if (!selectedVehicle || !selectedService || !tripDetails) return 0;
    
    if (isHourlyService && tripDetails.durationHours && tripDetails.durationHours > 0) {
        return selectedVehicle.price * tripDetails.durationHours; 
    }
    
    return selectedVehicle.price; 
    
  }, [selectedVehicle, selectedService, tripDetails, isHourlyService]);


  // ----------------------------------------------------------------------
  // HANDLERS (COM CORREÇÃO DE STABILITY/FOCUS)
  // ----------------------------------------------------------------------

  // Handlers simples (envolvidos em useCallback)
  const handleServiceSelection = useCallback((service: ServiceType) => {
      setSelectedService(service);
      setCurrentStep(3); 
  }, []);

  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentStep(4); 
    setShowVehicleWarning(false);
  }, []);

  // 🚨 CORREÇÃO: Usar useCallback para estabilizar a função. 
  // Isso impede que o ClientDetailsStep (memoizado) se re-renderize em cada tecla.
  const handleClientFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setClientForm(prev => ({ ...prev, [name]: value }));
  }, []); // Dependências vazias = função estável

  // Handler de submissão de Endereço e Data/Hora (mantidos)
  const handleAddressSubmit = (details: TripDetails) => {
    setTripDetails(prev => ({
        pickupAddress: details.pickupAddress,
        dropoffAddress: details.dropoffAddress,
        date: prev?.date || new Date().toISOString().split('T')[0], 
        time: prev?.time || "10:00", 
        tripType: prev?.tripType || 'one-way', 
        returnDate: prev?.returnDate,
        returnTime: prev?.returnTime,
        durationHours: prev?.durationHours || 1, 
    }));
    setCurrentStep(2); 
  };
  
  const handleDateTimeSubmit = (details: TripDetails) => {
    setTripDetails(details);
    
    if (!selectedVehicle) {
        toast.error(t('booking.noVehicleTip') || "Por favor, selecione um veículo antes de escolher a data/hora.");
        setCurrentStep(3);
        return;
    }
    
    const selectedDateTime = `${details.date}T${details.time}:00.000Z`;
    const isCurrentlyReserved = reservedSlots.some(slot => 
        slot.vehicle_id === selectedVehicle!.id && 
        slot.iso_date === selectedDateTime
    );

    if (isCurrentlyReserved) {
        toast.error(
            t('booking.slotUnavailableError') || 
            `O veículo ${selectedVehicle.name} ficou indisponível para ${details.date} às ${details.time}. Por favor, escolha outra data ou hora.`
        );
        setSlotValidationError(
            t('booking.slotUnavailableError') || 
            `O veículo ${selectedVehicle.name} ficou indisponível para ${details.date} às ${details.time}. Por favor, escolha outra data ou hora.`
        );
        return; 
    }
    setSlotValidationError(null); 
    
    setCurrentStep(5); 
  };

  // Handler de submissão de Pagamento (Mantido)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ... Lógica de validação e submissão da API (mantida) ...
    if (!selectedVehicle || !tripDetails || !selectedService || !tripDetails.date || !tripDetails.time || !clientForm.passenger_email || !clientForm.passenger_name || !clientForm.passenger_phone) {
        toast.error(t('paymentError') || "Dados da reserva ou cliente incompletos. Por favor, volte atrás.");
        setPaymentError(t('paymentError') || "Dados da reserva ou cliente incompletos. Por favor, volte atrás.");
        return;
    }
    
    if (!validateCurrentSlotAvailability()) {
        toast.error(t('booking.slotUnavailableError') || "O horário escolhido ficou indisponível no último momento. Por favor, corrija o Passo 4 antes de submeter.");
        setPaymentError(t('booking.slotUnavailableError') || "O horário escolhido ficou indisponível no último momento. Por favor, corrija o Passo 4 antes de submeter.");
        setCurrentStep(4); 
        return; 
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    const token = localStorage.getItem('jwtToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }
    
    const calculatedDurationMinutes = 
        isHourlyService && tripDetails.durationHours 
        ? tripDetails.durationHours * 60 
        : 60; 

    const payload = {
        fleet_id: selectedVehicle.id,
        service_id: selectedService.id,
        trip_pickup_time: `${tripDetails.date}T${tripDetails.time}:00.000Z`,
        trip_duration_minutes: calculatedDurationMinutes,
        pickup_address: tripDetails.pickupAddress,
        dropoff_address: tripDetails.dropoffAddress,
        final_price: calculatedPrice.toFixed(2), 
        passenger_name: clientForm.passenger_name,
        passenger_email: clientForm.passenger_email,
        passenger_phone: clientForm.passenger_phone,
        special_requests: clientForm.special_requests || null,
        paymentMethod: clientForm.paymentMethod,
        clientData: {
            name: clientForm.passenger_name,
            email: clientForm.passenger_email,
            phone: clientForm.passenger_phone,
            phone_indicative: '351', 
            key: `client-${clientForm.passenger_email}`,
        }
    };
    
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/reservations/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                 const errorMessage = responseData.message || t('booking.slotUnavailableError') || 'O slot de reserva ficou indisponível. Por favor, volte ao Passo 4 e tente outra hora.';
                 toast.error(errorMessage);
                 setPaymentError(errorMessage);
                 setCurrentStep(4); 
                 throw new Error(errorMessage);
            }
            throw new Error(responseData.message || 'Falha na criação da reserva.');
        }

        const data: ReservationResponse = responseData;
        
        if (data.success) {
            setReservationResponse(data);
            const paymentMethod = data.payment.method;

            if (paymentMethod === 'cc' && data.payment.data.redirect_url) {
                window.location.href = data.payment.data.redirect_url;
                return; 
            } else {
                setCurrentStep(6);
            }
            
        } else {
            toast.error(data.message);
            setPaymentError(data.message);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
        setPaymentError(errorMessage);
    } finally {
        setIsSubmittingPayment(false);
    }
  };


  const handleGoBack = () => {
    if (currentStep === 6) {
        return;
    }
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  // ----------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------------------------

  const BorderWrapper = ({ children, step }: { children: React.ReactNode, step: number }) => {
    if (isMobile) {
        return <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>{children}</div>;
    }
    
    return (
        <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
            <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>{children}</div>
        </ElectricBorder>
    );
  };
  
  const SimpleWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>{children}</div>
  );


  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mr-3" />
            <div className="text-xl text-amber-400">{t('loading') || 'A Carregar dados de reserva...'}</div>
        </div>
    );
  }

  if (apiError || servicesList.length === 0) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-extrabold text-red-500 mb-4">Erro de Conexão ou Dados Indisponíveis</h1>
            <p className="text-xl text-gray-400 mb-8">{apiError || 'Nenhum serviço ou frota disponível para reserva.'}</p>
            <button onClick={() => navigate('/')} className="bg-amber-400 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-300 transition-colors">Voltar à Página Inicial</button>
        </div>
    );
  }

  return (
    // CONTÊINER PRINCIPAL
    <div className="relative min-h-screen">
        <Toaster position="top-right" /> 
        
        {/* OTIMIZAÇÃO: CAMADA DE VÍDEO DE BACKGROUND (SÓ CARREGA NO DESKTOP) */}
        {!isMobile && (
            <div className="fixed inset-0 overflow-hidden z-[-1]">
                <iframe
                    title="Background Video"
                    src={VIDEO_EMBED_URL}
                    allow="autoplay; encrypted-media"
                    allowFullScreen={false}
                    frameBorder="0"
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto translate-x-[-50%] translate-y-[-50%] pointer-events-none"
                    style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-black/70"></div>
            </div>
        )}
        
        {/* OTIMIZAÇÃO: FUNDO ESCURO SIMPLES PARA MOBILE */}
        {isMobile && <div className="fixed inset-0 bg-black/90 z-[-1]"></div>}


        {/* CONTEÚDO PRINCIPAL */}
        <div className="relative pt-40 pb-12 text-white min-h-screen">
          <div className="container mx-auto px-4">
            
            {/* Título Dinâmico */}
            <h1 className="text-4xl font-extrabold text-white mb-16 text-center drop-shadow-lg">
                {t('booking.reserveNow')} - {steps[currentStep - 1]?.title || '...'}
            </h1>

            {/* Progress Steps */}
            <div className="mb-12 drop-shadow-xl">
              <div className="flex items-center justify-center space-x-4 mb-8">
                {steps.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          currentStep === step.step
                            ? 'bg-amber-400 text-black ring-2 ring-amber-400'
                            : step.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {step.completed ? <Check className="w-5 h-5" /> : step.step}
                      </div>
                      <span 
                        className={`ml-3 text-sm font-medium hidden sm:inline transition-colors duration-300 ${
                            currentStep === step.step ? goldColor : 'text-gray-200' 
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-0.5 bg-gray-500"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="max-w-4xl mx-auto">
              {/* BOTÃO VOLTAR GLOBAL */}
              {currentStep > 1 && currentStep < 6 && !reservationResponse && (
                  <button 
                      onClick={handleGoBack}
                      className={`mb-6 text-sm text-gray-400 hover:${goldColor} transition-colors flex items-center`}
                  >
                      &larr; {t('booking.goBack')} {currentStep > 1 && `ao Passo ${currentStep - 1}`}
                  </button>
              )}

              {/* PASSO 1: Endereços */}
              {currentStep === 1 && ( 
                <BorderWrapper step={1}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">1. {t('booking.tripAddresses') || 'Localização'}</h2>
                    
                    <BookingForm 
                      onSubmit={handleAddressSubmit} 
                      initialData={tripDetails || undefined} 
                      compact={false} 
                      showDateAndTime={false} 
                      showServiceAndVehicle={false}
                      showTripType={false} 
                      reservedSlots={reservedSlots} 
                      selectedVehicleId={selectedVehicle?.id} 
                    />
                </BorderWrapper>
              )}

              {/* PASSO 2: Seleção de Serviço */}
              {currentStep === 2 && ( 
                  <BorderWrapper step={2}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-center">2. {t('booking.selectService')}</h2>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                          {servicesList.map((service) => {
                              const IconComponent = service.icon ? IconMap[service.icon] : Briefcase;
                              
                              const serviceCardStyle = !isMobile ? { 
                                  backgroundImage: `url(${service.image || 'https://placehold.co/400x300?text=Serviço'})`, 
                                  backgroundSize: 'cover', 
                                  backgroundPosition: 'center', 
                              } : {
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                  backgroundImage: 'none', 
                              };

                              return (
                                  <div key={service.id} onClick={() => handleServiceSelection(service)} 
                                      className={`relative h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${selectedService && selectedService.id === service.id ? 'ring-4 ring-amber-400 shadow-2xl scale-[1.02]' : 'border border-gray-700 hover:ring-2 hover:ring-amber-400/50'}`} 
                                      style={serviceCardStyle}
                                  >
                                      {!isMobile && <div className={`absolute inset-0 bg-black/50 transition-colors duration-300 ${selectedService && selectedService.id === service.id ? 'bg-black/30' : 'group-hover:bg-black/40'}`}></div>}
                                      
                                      <div className="relative p-5 flex flex-col items-center justify-center h-full text-center">
                                          <IconComponent className="w-8 h-8 text-amber-400 mx-auto mb-3 drop-shadow-lg" />
                                          <p className="font-bold text-xl text-white drop-shadow-lg">{service.title || service.id}</p>
                                          <p className="text-sm text-gray-200 mt-1 drop-shadow-md">{service.description || t('booking.clickToViewVehicles')}</p>
                                          {selectedService && selectedService.id === service.id && (<div className="absolute top-3 right-3 p-1 bg-amber-400 rounded-full text-black"><Check className="w-4 h-4" /></div>)}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </BorderWrapper>
              )}

              {/* PASSO 3: Seleção de Veículo */}
              {currentStep === 3 && ( 
                  <div>
                  <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">3. {t('booking.selectVehicle')}</h2>
                  {selectedService && (<div className="mb-8 p-4 bg-gray-800/90 rounded-lg text-center border border-gray-700"><p className="text-gray-300"><span className={goldColor}>{t('booking.serviceSelected')}:</span> <strong className="ml-2">{selectedService.title || selectedService.id}</strong></p></div>)}
                  <div className="grid md:grid-cols-2 gap-6">
                    {availableVehicles.length > 0 ? ( availableVehicles.map((vehicle) => ( 
                        <VehicleCard 
                            key={vehicle.id} 
                            vehicle={vehicle} 
                            onSelect={handleVehicleSelect} 
                            showPrice={true} 
                            darkMode={true} 
                            isSelected={selectedVehicle?.id === vehicle.id}
                            loadingStrategy={isMobile ? "lazy" : "eager"} 
                        /> 
                    )) ) : ( 
                        <SimpleWrapper>
                            <p className="text-xl text-gray-400">
                                {t('booking.noVehicleForService') || 'Não há veículos disponíveis para este serviço.'}
                            </p>
                        </SimpleWrapper>
                    )}
                  </div>
                  </div>
              )}
              
              {/* PASSO 4: Data e Hora */}
              {currentStep === 4 && selectedVehicle && tripDetails && selectedService && ( 
                <BorderWrapper step={4}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">4. {t('booking.tripDateTime') || 'Data e Hora'}</h2>

                      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <p className="text-sm text-gray-400">{t('booking.vehicleSelected')}:</p>
                          <p className="text-xl font-bold text-amber-400">{selectedVehicle.name}</p>
                      </div>

                      {slotValidationError && (
                            <div className="p-4 mb-4 bg-red-800/50 text-red-300 border border-red-700 rounded-lg flex items-center">
                                <XCircle className="w-5 h-5 mr-3" />
                                <p className="text-sm font-medium">{slotValidationError}</p>
                            </div>
                      )}

                      <BookingForm 
                          onSubmit={handleDateTimeSubmit}
                          initialData={tripDetails}
                          compact={false}
                          showDateAndTime={true} 
                          showServiceAndVehicle={false}
                          showAddresses={false}
                          showTripType={!isHourlyService} 
                          showDurationHours={isHourlyService} 
                          reservedSlots={reservedSlots}
                          selectedVehicleId={selectedVehicle.id}
                      />
                </BorderWrapper>
              )}
              
              {/* PASSO 5: Detalhes de Pagamento (Com o componente isolado ClientDetailsStep) */}
              {currentStep === 5 && selectedVehicle && tripDetails && selectedService && ( 
                <BorderWrapper step={5}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">5. {t('booking.paymentDetails') || 'Detalhes do Pagamento'}</h2>
                      
                      {/* Resumo da Reserva */}
                      <div className="mb-8 p-6 bg-gray-800/70 rounded-lg border border-gray-700">
                          <h3 className="text-xl font-bold mb-3 flex items-center"><CornerDownRight className={`w-5 h-5 mr-2 ${goldColor}`} /> {t('booking.tripSummary') || 'Resumo da Viagem'}</h3>
                          <p className="text-gray-300 mb-1">
                              <MapPin className="w-4 h-4 inline mr-2 text-gray-500" />
                              <strong className={goldColor}>{t('booking.from')}:</strong> {tripDetails.pickupAddress}
                          </p>
                          <p className="text-gray-300 mb-4">
                              <MapPin className="w-4 h-4 inline mr-2 text-gray-500" />
                              <strong className={goldColor}>{t('booking.to')}:</strong> {tripDetails.dropoffAddress}
                          </p>
                          <p className="text-gray-300 mb-1 flex items-center">
                              <Calendar className="w-4 h-4 inline mr-2 text-gray-500" />
                              <strong className={goldColor}>{t('booking.date')}:</strong> {tripDetails.date} às {tripDetails.time}
                          </p>
                          <p className="text-gray-300 mb-1 flex items-center">
                              <Car className="w-4 h-4 inline mr-2 text-gray-500" />
                              <strong className={goldColor}>{t('booking.vehicle')}:</strong> {selectedVehicle.name} ({selectedService.title})
                          </p>
                          <div className="text-3xl font-extrabold text-right mt-6 pt-4 border-t border-gray-700">
                              {t('booking.total')}: <span className={goldColor}>€{calculatedPrice.toFixed(2)}</span>
                          </div>
                      </div>

                      {paymentError && (
                          <div className="p-4 mb-4 bg-red-800/50 text-red-300 border border-red-700 rounded-lg flex items-center">
                              <XCircle className="w-5 h-5 mr-3" />
                              {paymentError}
                          </div>
                      )}

                      {/* 🚨 Integração do ClienteDetailsStep */}
                      <ClientDetailsStep
                          calculatedPrice={calculatedPrice}
                          clientForm={clientForm}
                          tripDetails={tripDetails}
                          selectedVehicle={selectedVehicle}
                          selectedService={selectedService}
                          paymentError={paymentError}
                          isSubmittingPayment={isSubmittingPayment}
                          handleClientFormChange={handleClientFormChange}
                          handlePaymentSubmit={handlePaymentSubmit}
                      />
                      
                </BorderWrapper>
              )}
              
              {/* PASSO 6: Confirmação */}
              {currentStep === 6 && reservationResponse && (
                  <SimpleWrapper>
                      <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
                      <h2 className="text-4xl font-extrabold text-white mb-4">{t('booking.successTitle') || 'Reserva Confirmada!'}</h2>
                      <p className="text-xl text-gray-300 mb-8">{t('booking.successMessage') || 'A sua reserva foi efetuada com sucesso. Em breve receberá um email com os detalhes.'}</p>
                      
                      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-left mb-8">
                          <h3 className="text-xl font-bold mb-3 border-b border-gray-700 pb-2 text-amber-400">{t('booking.paymentInfo') || 'Informação de Pagamento'}</h3>
                          <p className="text-gray-300 mb-2">
                              <strong className="text-white">{t('booking.method') || 'Método'}:</strong> {reservationResponse.payment.method === 'mbw' ? 'MB Way' : reservationResponse.payment.method === 'mb' ? 'Multibanco' : 'Cartão de Crédito'}
                          </p>
                          
                          {reservationResponse.payment.method === 'mbw' && (
                              <>
                                  <p className="text-gray-300 mb-2"><strong className="text-white">Telemóvel para MB WAY:</strong> {reservationResponse.payment.data.phone}</p>
                                  <p className="text-lg font-bold text-red-400 mt-4">{reservationResponse.payment.data.message || 'Por favor, confirme o pagamento na aplicação MB Way.'}</p>
                              </>
                          )}
                          
                          {reservationResponse.payment.method === 'mb' && (
                              <>
                                  <p className="text-gray-300 mb-2"><strong className="text-white">Entidade:</strong> {reservationResponse.payment.data.entity}</p>
                                  <p className="text-gray-300 mb-2"><strong className="text-white">Referência:</strong> {reservationResponse.payment.data.reference}</p>
                                  <p className="text-gray-300"><strong className="text-white">Valor:</strong> €{reservationResponse.payment.data.value}</p>
                                  <p className="text-lg font-bold text-red-400 mt-4">{t('booking.payMultibanco') || 'Por favor, efetue o pagamento antes da data limite.'}</p>
                              </>
                          )}
                          
                          {reservationResponse.payment.method === 'cc' && (
                              <p className="text-green-400 font-bold mt-2">{t('booking.paymentProcessed') || 'Pagamento com Cartão Processado com Sucesso.'}</p>
                          )}
                      </div>
                      
                      <button 
                          onClick={() => navigate('/')} 
                          className="mt-6 bg-amber-400 text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors"
                      >
                          {t('booking.goToHome') || 'Voltar à Página Inicial'}
                      </button>
                  </SimpleWrapper>
              )}
              
            </div>
          </div>
        </div>
        <div className="h-20"></div> 
    </div>
  );
};

export default Booking;