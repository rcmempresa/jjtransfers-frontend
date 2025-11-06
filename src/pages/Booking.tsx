import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Ícones
import { 
    Check, Briefcase, Lock, Plane, Calendar, Clock, Heart, MapPin, 
    Moon, Music, Car, Loader2, ArrowRight, CornerDownRight
} from 'lucide-react'; 
// Componentes (assumidos como existentes)
import BookingForm from '../components/BookingForm'; 
import VehicleCard from '../components/VehicleCard';
import { useLanguage } from '../hooks/useLanguage';
// IMPORTANTE: Tornar a ElectricBorder condicional para melhor performance no móvel
import ElectricBorder from '../components/ElectricBorder'; 

// ----------------------------------------------------------------------
// TIPAGEM DINÂMICA (MANTIDA)
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

type TripDetails = { 
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


// MAPA DE ÍCONES PARA RENDERIZAÇÃO DINÂMICA (MANTIDO)
const IconMap: { [key: string]: React.ElementType } = {
    Briefcase: Briefcase, Plane: Plane, Calendar: Calendar, Clock: Clock, 
    Heart: Heart, MapPin: MapPin, Moon: Moon, Music: Music, Car: Car, 
};

// URL DO VÍDEO DE BACKGROUND (MANTIDO)
const VIDEO_EMBED_URL = "https://www.youtube.com/embed/AOTGBDcDdEQ?autoplay=1&mute=1&loop=1&playlist=AOTGBDcDdEQ&controls=0&modestbranding=1&rel=0";

// ======================================================================
// HOOK PARA DETEÇÃO DE ECRÃ MÓVEL (Melhorado o useEffect para não correr o handleResize logo no mount, que já fazemos abaixo)
// ======================================================================
const useIsMobile = (breakpoint = 768) => { 
    // Começa com false no servidor ou para evitar flash, mas o useEffect corrigirá
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
             // O window.innerWidth só é acessível no browser
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < breakpoint);
            }
        };

        checkIsMobile(); // Verifica no mount

        window.addEventListener('resize', checkIsMobile);
        
        return () => window.removeEventListener('resize', checkIsMobile);
    }, [breakpoint]);

    return isMobile;
};

// ======================================================================

const Booking: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // CHAMA O HOOK AQUI!
  
  const initialTripDetails = location.state?.tripDetails; 
  
  // LER QUERY STRING
  const query = new URLSearchParams(location.search);
  const initialPickup = query.get('pickup');
  const initialDropoff = query.get('dropoff');

  // LÓGICA DE INICIALIZAÇÃO DO PASSO
  let startStep = 1;
  if (initialTripDetails || (initialPickup && initialDropoff)) {
      startStep = 2; 
  }
  
  // ----------------------------------------------------------------------
  // ESTADOS PRINCIPAIS E DE GESTÃO DA API (MANTIDOS)
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
      paymentMethod: 'mbw', 
  });
  
  const [slotValidationError, setSlotValidationError] = useState<string | null>(null); 
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
  // LÓGICA DE BUSCA DA API (MANTIDA)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const fetchBookingData = async () => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            // ... (Lógica de fetch de serviços e veículos mantida)
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
                console.log("✅ Slots reservados carregados:", validSlots.length);
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

  // Variáveis de Estilo
  const goldColor = 'text-amber-400';
  // Otimização: No móvel, usamos um fundo menos opaco para contrastar com o fundo preto simples
  const cardBg = isMobile ? 'bg-black/90 border border-gray-800' : 'bg-black/80 border border-gray-800'; 
  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/90 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400";
  const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors flex items-center justify-center";


  // ESTRUTURA DE 6 PASSOS (MANTIDA)
  const steps: BookingStep[] = [
    { step: 1, title: t('booking.tripAddresses') || '1. Localização', completed: currentStep > 1 },
    { step: 2, title: t('booking.selectService') || '2. Serviço', completed: currentStep > 2 },
    { step: 3, title: t('booking.selectVehicle') || '3. Veículo', completed: currentStep > 3 },
    { step: 4, title: t('booking.tripDateTime') || '4. Data & Hora', completed: currentStep > 4 }, 
    { step: 5, title: t('booking.paymentDetails') || '5. Pagamento', completed: currentStep > 5 },
    { step: 6, title: t('booking.confirmation') || '6. Confirmação', completed: false },
  ];

  // ----------------------------------------------------------------------
  // FUNÇÕES DE VALIDAÇÃO E HANDLERS (MANTIDOS)
  // ----------------------------------------------------------------------
  const validateCurrentSlotAvailability = useCallback((): boolean => {
    if (!selectedVehicle || !tripDetails || !tripDetails.date || !tripDetails.time) {
        setSlotValidationError(null); 
        return true; 
    }
    
    const selectedDateTime = `${tripDetails.date}T${tripDetails.time}:00.000Z`;
    
    const isCurrentlyReserved = reservedSlots.some(slot => 
        slot.vehicle_id === selectedVehicle.id && 
        slot.iso_date === selectedDateTime
    );

    if (isCurrentlyReserved) {
        setSlotValidationError(
            t('booking.slotUnavailableError') || 
            `O veículo ${selectedVehicle.name} ficou indisponível para ${tripDetails.date} às ${tripDetails.time}. Por favor, escolha outra data ou hora.`
        );
        return false;
    }
    
    setSlotValidationError(null); 
    return true;
  }, [selectedVehicle, tripDetails, reservedSlots, t]);

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
        setSlotValidationError(t('booking.noVehicleTip') || "Por favor, selecione um veículo antes de escolher a data/hora.");
        setCurrentStep(3);
        return;
    }
    
    const selectedDateTime = `${details.date}T${details.time}:00.000Z`;
    const isCurrentlyReserved = reservedSlots.some(slot => 
        slot.vehicle_id === selectedVehicle!.id && 
        slot.iso_date === selectedDateTime
    );

    if (isCurrentlyReserved) {
        setSlotValidationError(
            t('booking.slotUnavailableError') || 
            `O veículo ${selectedVehicle.name} ficou indisponível para ${details.date} às ${details.time}. Por favor, escolha outra data ou hora.`
        );
        return; 
    }
    setSlotValidationError(null); 
    
    setCurrentStep(5); 
  };
  
  const handleServiceSelection = (service: ServiceType) => {
      setSelectedService(service);
      setCurrentStep(3); 
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentStep(4); 
  };

  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setClientForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !tripDetails || !selectedService || !tripDetails.date || !tripDetails.time || !clientForm.passenger_email || !clientForm.passenger_name || !clientForm.passenger_phone) {
        setPaymentError(t('paymentError') || "Dados da reserva ou cliente incompletos. Por favor, volte atrás.");
        return;
    }
    
    if (!validateCurrentSlotAvailability()) {
        setPaymentError(t('booking.slotUnavailableError') || "O horário escolhido ficou indisponível no último momento. Por favor, corrija o Passo 4 antes de submeter.");
        setCurrentStep(4); 
        return; 
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    const token = localStorage.getItem('jwtToken');
    
    const headers: HeadersInit = { 
        'Content-Type': 'application/json' 
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const isHourlyService = selectedService.id === "6" || selectedService.title.includes('Hora'); 

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
        final_price: selectedVehicle.price.toFixed(2), 
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
            } else if (paymentMethod === 'cash') {
                setCurrentStep(6); // Pagamento à chegada: sucesso e avança
            }
            // MB/MBW: Fica no Passo 5 para mostrar as referências (aqui o currentStep já é 5)
            
        } else {
            setPaymentError(data.message);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
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
  
  const availableVehicles = useMemo(() => {
    if (!selectedService) return vehiclesList; 
    
    return vehiclesList.filter(v => v.serviceTypes && v.serviceTypes.includes(selectedService.id)); 
  }, [selectedService, vehiclesList]);


  // ----------------------------------------------------------------------
  // RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO/ERRO (MANTIDO)
  // ----------------------------------------------------------------------
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

    // Função auxiliar para aplicar a borda animada apenas no desktop
    const ConditionalBorder = ({ children, step }: { children: React.ReactNode, step: number }) => {
        // Aplica a borda animada APENAS se não for móvel
        if (!isMobile) {
            return (
                <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                    {children}
                </ElectricBorder>
            );
        }
        // No móvel, apenas o container
        return <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>{children}</div>;
    };


  return (
    // CONTÊINER PRINCIPAL
    // O fundo principal passa a ser o bg-black/90 em vez do vídeo
    <div className="relative min-h-screen bg-black/90">
        
        {/* 1. CAMADA DE VÍDEO DE BACKGROUND (Renderização Condicional mantida) */}
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
                {/* 2. OVERLAY ESCURO no Desktop (para escurecer o vídeo) */}
                <div className="absolute inset-0 bg-black/70"></div>
            </div>
        )}
        
        {/* NO MÓVEL: O fundo preto/90 do container principal é suficiente. */}


        {/* 3. CONTEÚDO PRINCIPAL */}
        <div className="relative pt-24 pb-12 text-white min-h-screen sm:pt-40"> 
          <div className="container mx-auto px-4">
            
            {/* Título Dinâmico */}
            <h1 className="text-3xl font-extrabold text-white mb-10 text-center drop-shadow-lg sm:text-4xl sm:mb-16">
                {t('booking.reserveNow')} - {steps[currentStep - 1]?.title || '...'}
            </h1>

            {/* Progress Steps (Barra de Progresso) - Otimizado para móvel (oculta o título do passo) */}
            <div className="mb-8 drop-shadow-xl sm:mb-12">
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8">
                {steps.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 sm:w-10 sm:h-10 ${
                          currentStep === step.step
                            ? 'bg-amber-400 text-black ring-2 ring-amber-400'
                            : step.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {step.completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.step}
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
                      <div className="w-4 h-0.5 bg-gray-500 sm:w-8"></div>
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

              {/* PASSO 1: Endereços (APENAS Recolha e Destino) */}
              {currentStep === 1 && ( 
                <ConditionalBorder step={1}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">1. {t('booking.tripAddresses') || 'Localização'}</h2>
                      
                    {/* O BookingForm aqui apenas recolhe endereços */}
                    <BookingForm 
                      onSubmit={handleAddressSubmit} 
                      initialData={tripDetails || undefined} 
                      compact={false} 
                      showDateAndTime={false} 
                      showServiceAndVehicle={false}
                      showTripType={false} 
                      reservedSlots={reservedSlots} 
                      selectedVehicleId={selectedVehicle?.id} 
                      // Passar isMobile para que o BookingForm otimize componentes internos (ex: Google Maps)
                      isMobile={isMobile}
                    />
                </ConditionalBorder>
              )}

              {/* PASSO 2: Seleção de Serviço */}
              {currentStep === 2 && ( 
                  <ConditionalBorder step={2}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-center">2. {t('booking.selectService')}</h2>
                      {/* Otimização: No móvel, mudar para 1 coluna se necessário ou garantir que o grid é responsivo */}
                      <div className="grid md:grid-cols-3 gap-6 mb-8"> 
                          {servicesList.map((service) => {
                              const IconComponent = service.icon ? IconMap[service.icon] : Briefcase;
                              return (
                                  <div key={service.id} onClick={() => handleServiceSelection(service)} className={`relative h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${selectedService && selectedService.id === service.id ? 'ring-4 ring-amber-400 shadow-2xl scale-[1.02]' : 'border border-gray-700 hover:ring-2 hover:ring-amber-400/50'}`} style={{ backgroundImage: `url(${service.image || 'https://placehold.co/400x300?text=Serviço'})`, backgroundSize: 'cover', backgroundPosition: 'center', }}>
                                      <div className={`absolute inset-0 bg-black/50 transition-colors duration-300 ${selectedService && selectedService.id === service.id ? 'bg-black/30' : 'group-hover:bg-black/40'}`}></div>
                                      <div className="relative p-5 flex flex-col items-center justify-center h-full text-center">
                                          <IconComponent className="w-7 h-7 text-amber-400 mx-auto mb-2 drop-shadow-lg sm:w-8 sm:h-8" />
                                          <p className="font-bold text-lg text-white drop-shadow-lg sm:text-xl">{service.title || service.id}</p>
                                          <p className="text-xs text-gray-200 mt-1 drop-shadow-md sm:text-sm">{service.description || t('booking.clickToViewVehicles')}</p>
                                          {selectedService && selectedService.id === service.id && (<div className="absolute top-3 right-3 p-1 bg-amber-400 rounded-full text-black"><Check className="w-4 h-4" /></div>)}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </ConditionalBorder>
              )}

              {/* PASSO 3: Seleção de Veículo */}
              {currentStep === 3 && ( 
                  <div>
                  <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">3. {t('booking.selectVehicle')}</h2>
                  {selectedService && (<div className="mb-8 p-4 bg-gray-800/90 rounded-lg text-center border border-gray-700"><p className="text-gray-300"><span className={goldColor}>{t('booking.serviceSelected')}:</span> <strong className="ml-2">{selectedService.title || selectedService.id}</strong></p></div>)}
                  {/* Otimização: Grid de 1 coluna no telemóvel para VehicleCard */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2"> 
                    {availableVehicles.length > 0 ? ( 
                        availableVehicles.map((vehicle) => ( 
                            <VehicleCard 
                                key={vehicle.id} 
                                vehicle={vehicle} 
                                onSelect={handleVehicleSelect} 
                                showPrice={true} 
                                darkMode={true} 
                                isSelected={selectedVehicle?.id === vehicle.id} 
                            /> 
                        )) 
                    ) : ( 
                        <div className={`${cardBg} md:col-span-2 rounded-xl shadow-2xl p-8 text-center`}>
                            <Car className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                            <h3 className="text-xl font-bold text-white mb-2">{t('booking.noVehicles')}</h3>
                            <p className="text-gray-400">{t('booking.noVehiclesMessage')}</p>
                            <button onClick={() => setCurrentStep(2)} className={`mt-4 text-sm text-gray-400 hover:${goldColor} transition-colors flex items-center justify-center mx-auto`}>
                                &larr; {t('booking.backToService')}
                            </button>
                        </div> 
                    )}
                  </div>
                </div>
              )}

              {/* PASSO 4: Data & Hora */}
              {currentStep === 4 && tripDetails && selectedVehicle && (
                  <ConditionalBorder step={4}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-center">4. {t('booking.tripDateTime') || 'Data & Hora'}</h2>
                      
                      {slotValidationError && (
                          <div className="p-4 mb-6 bg-red-800/80 text-white rounded-lg border border-red-600 flex items-center">
                              <Lock className="w-5 h-5 mr-3 flex-shrink-0" />
                              <p className="text-sm font-medium">{slotValidationError}</p>
                          </div>
                      )}
                      
                      <BookingForm 
                          onSubmit={handleDateTimeSubmit} 
                          initialData={tripDetails}
                          compact={false} 
                          showDateAndTime={true} 
                          showServiceAndVehicle={false}
                          showTripType={true}
                          reservedSlots={reservedSlots} 
                          selectedVehicleId={selectedVehicle.id}
                          serviceType={selectedService} 
                          isMobile={isMobile} // Passa isMobile
                      />
                  </ConditionalBorder>
              )}

              {/* PASSO 5: Pagamento e Detalhes do Cliente */}
              {currentStep === 5 && tripDetails && selectedVehicle && (
                  <ConditionalBorder step={5}>
                      <form onSubmit={handlePaymentSubmit} className={`p-0`}> {/* p-0 porque ConditionalBorder já tem o padding e o fundo */}
                          <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-center">5. {t('booking.paymentDetails') || 'Pagamento'}</h2>

                          {/* Resumo da Reserva */}
                          <div className="mb-8 p-4 sm:p-6 bg-gray-900/90 rounded-xl border border-amber-400/50">
                              <h3 className="text-xl font-bold mb-4 flex items-center text-amber-400"><CornerDownRight className="w-5 h-5 mr-2" /> {t('booking.summary')}</h3>
                              <ul className="space-y-2 text-gray-300 text-sm">
                                  <li className="flex justify-between items-start"><MapPin className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-gray-500"/>{t('booking.pickup')}: <strong className='ml-2 text-right break-words'>{tripDetails.pickupAddress}</strong></li>
                                  <li className="flex justify-between items-start"><MapPin className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-gray-500"/>{t('booking.dropoff')}: <strong className='ml-2 text-right break-words'>{tripDetails.dropoffAddress}</strong></li>
                                  <li className="flex justify-between items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500"/>{t('booking.date')}: <strong>{tripDetails.date} @ {tripDetails.time}</strong></li>
                                  <li className="flex justify-between items-center"><Car className="w-4 h-4 mr-2 text-gray-500"/>{t('booking.vehicle')}: <strong>{selectedVehicle.name}</strong></li>
                                  <li className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-700 mt-2"><Briefcase className="w-4 h-4 mr-2 text-amber-400"/>{t('booking.estimatedPrice')}: <span className="text-amber-400">€ {selectedVehicle.price.toFixed(2)}</span></li>
                              </ul>
                          </div>

                          {/* Dados do Cliente */}
                          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{t('booking.clientDetails')}</h3>
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                              <input type="text" name="passenger_name" value={clientForm.passenger_name} onChange={handleClientFormChange} placeholder={t('booking.namePlaceholder') || "Nome Completo *"} className={inputClasses} required />
                              <input type="email" name="passenger_email" value={clientForm.passenger_email} onChange={handleClientFormChange} placeholder={t('booking.emailPlaceholder') || "Email *"} className={inputClasses} required />
                              <input type="tel" name="passenger_phone" value={clientForm.passenger_phone} onChange={handleClientFormChange} placeholder={t('booking.phonePlaceholder') || "Telemóvel * (+351...)"} className={inputClasses} required />
                              <select name="paymentMethod" value={clientForm.paymentMethod} onChange={handleClientFormChange} className={inputClasses}>
                                  <option value="mbw">{t('payment.mbway') || 'MB Way'}</option>
                                  <option value="mb">{t('payment.multibanco') || 'Multibanco (Referências)'}</option>
                                  <option value="cc">{t('payment.creditCard') || 'Cartão de Crédito/Débito'}</option>
                                  <option value="cash">{t('payment.cash') || 'Pagamento ao Motorista'}</option>
                              </select>
                          </div>
                          <textarea name="special_requests" value={clientForm.special_requests} onChange={handleClientFormChange} placeholder={t('booking.requestsPlaceholder') || "Pedidos Especiais (Ex: Cadeirinha de Bebé, Paragens)"} rows={3} className={`${inputClasses} mb-6`}></textarea>

                          {/* Exibir Referências de Pagamento ou Mensagem de Erro/Carregamento */}
                          {reservationResponse && (clientForm.paymentMethod === 'mb' || clientForm.paymentMethod === 'mbw') ? (
                              <div className="p-6 mb-6 bg-green-900/70 text-white rounded-lg border border-green-600">
                                  <h3 className="text-xl font-bold mb-3 flex items-center text-green-400"><Check className="w-5 h-5 mr-2" /> {t('payment.pending')}</h3>
                                  <p className="mb-4">{t('payment.infoMessage')}</p>
                                  
                                  {clientForm.paymentMethod === 'mb' && (
                                      <div className="grid grid-cols-2 gap-4 bg-black/50 p-4 rounded-lg">
                                          <p><strong>{t('payment.entity')}:</strong> {reservationResponse.payment.data.entity}</p>
                                          <p><strong>{t('payment.reference')}:</strong> {reservationResponse.payment.data.reference}</p>
                                          <p className="col-span-2"><strong>{t('payment.value')}:</strong> {reservationResponse.payment.data.value} €</p>
                                      </div>
                                  )}
                                  
                                  {clientForm.paymentMethod === 'mbw' && (
                                      <div className="bg-black/50 p-4 rounded-lg">
                                          <p><strong>{t('payment.mbwPhone')}:</strong> {reservationResponse.payment.data.phone}</p>
                                          <p className="mt-2">Aguarde a notificação no seu telemóvel para aprovar o pagamento de **{reservationResponse.payment.data.value} €**.</p>
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <>
                                  {paymentError && (
                                      <div className="p-4 mb-6 bg-red-800/80 text-white rounded-lg border border-red-600 flex items-center">
                                          <Lock className="w-5 h-5 mr-3 flex-shrink-0" />
                                          <p className="text-sm font-medium">{paymentError}</p>
                                      </div>
                                  )}

                                  <button 
                                      type="submit" 
                                      className={buttonClasses + (isSubmittingPayment ? ' opacity-70 cursor-not-allowed' : '')} 
                                      disabled={isSubmittingPayment || (reservationResponse && clientForm.paymentMethod !== 'cash')}
                                  >
                                      {isSubmittingPayment ? (
                                          <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> {t('payment.submitting') || 'A Processar Pagamento...'}</>
                                      ) : reservationResponse ? (
                                          <><Check className="w-5 h-5 mr-3" /> {t('payment.processed') || 'Detalhes de Pagamento Exibidos'}</>
                                      ) : (
                                          <>{t('payment.confirmAndPay') || 'Confirmar e Pagar'}</>
                                      )}
                                  </button>
                              </>
                          )}
                      </form>
                  </ConditionalBorder>
              )}

              {/* PASSO 6: Confirmação Final */}
              {currentStep === 6 && (
                  <div className={`${cardBg} rounded-xl shadow-2xl p-8 text-center`}>
                      <Check className="w-12 h-12 mx-auto mb-6 text-green-500 drop-shadow-lg" />
                      <h2 className="text-3xl font-bold text-white mb-4">{t('booking.thanksTitle') || 'Reserva Confirmada!'}</h2>
                      <p className="text-xl text-gray-300 mb-8">{t('booking.thanksMessage') || 'Obrigado pela sua reserva. Enviámos um email com todos os detalhes.'}</p>
                      
                      {reservationResponse?.reservation?.id && (
                          <p className="text-sm text-gray-500 mb-4">
                              {t('booking.ref')}: <span className="font-mono text-amber-400">{reservationResponse.reservation.id}</span>
                          </p>
                      )}
                      
                      <button onClick={() => navigate('/')} className={buttonClasses + " mt-4 max-w-sm mx-auto"}>
                          <ArrowRight className="w-5 h-5 mr-2" /> {t('booking.backHome') || 'Voltar à Página Inicial'}
                      </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}; 

export default Booking;