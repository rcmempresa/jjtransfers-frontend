import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Ícones
import { 
    Check, Briefcase, Lock, Plane, Calendar, Clock, Heart, MapPin, 
    Moon, Music, Car, Loader2, ArrowRight
} from 'lucide-react'; 
// Componentes (assumidos como existentes)
import BookingForm from '../components/BookingForm'; 
import VehicleCard from '../components/VehicleCard';
import { useLanguage } from '../hooks/useLanguage';
import ElectricBorder from '../components/ElectricBorder'; 
// Assumindo que a sua função de API para o db.query está acessível no backend
// NOTE: Este é um ficheiro frontend, a lógica db.query está no reservationsController.js

// ----------------------------------------------------------------------
// TIPAGEM DINÂMICA
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
    durationHours?: number; // NOVO: Duração para serviços à hora
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
    iso_date: string; // Ex: "2025-10-15T10:00:00.000Z"
    vehicle_id: string; // O ID do veículo que está a bloquear o slot
};
// ----------------------------------------------------------------------


// MAPA DE ÍCONES PARA RENDERIZAÇÃO DINÂMICA
const IconMap: { [key: string]: React.ElementType } = {
    Briefcase: Briefcase, Plane: Plane, Calendar: Calendar, Clock: Clock, 
    Heart: Heart, MapPin: MapPin, Moon: Moon, Music: Music, Car: Car, 
};

// URLs de Imagens para Métodos de Pagamento (Use os seus assets reais!)
const PaymentImageMap: { [key: string]: string } = {
    'mbw': 'https://placehold.co/100x40?text=MB+Way',
    'mb': 'https://placehold.co/100x40?text=Multibanco',
    'cc': 'https://placehold.co/100x40?text=Cartão',
};

// URL DA API (Usar variável de ambiente em produção)
const API_BASE_URL = 'http://localhost:3000/api'; 

// URL DO VÍDEO DE BACKGROUND
const VIDEO_EMBED_URL = "https://www.youtube.com/embed/AOTGBDcDdEQ?autoplay=1&mute=1&loop=1&playlist=AOTGBDcDdEQ&controls=0&modestbranding=1&rel=0";

const Booking: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
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
  // ESTADOS PRINCIPAIS E DE GESTÃO DA API
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
      paymentMethod: 'mbw', // Default para MB Way
  });
  
  // ESTADO PARA CONTROLO DE ERRO DE VALIDAÇÃO DE SLOT
  const [slotValidationError, setSlotValidationError] = useState<string | null>(null); 
  
  // ESTADO PARA CONTROLO DO POP-UP DE AVISO DE VEÍCULO PRÉ-SELECIONADO
  const [showVehicleWarning, setShowVehicleWarning] = useState(false); 
  
  // Ajuste: A data/hora agora têm um valor inicial *default*
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(
      initialTripDetails || (initialPickup && initialDropoff ? {
          pickupAddress: decodeURIComponent(initialPickup),
          dropoffAddress: decodeURIComponent(initialDropoff),
          // Valores iniciais default
          date: new Date().toISOString().split('T')[0], 
          time: "10:00", 
          tripType: 'one-way', 
          durationHours: 1, // NOVO: Duração default de 1h
      } as TripDetails : null)
  );

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null); 
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // ----------------------------------------------------------------------
  // LÓGICA DE BUSCA DA API (Dados Iniciais e Slots Reservados)
  // ----------------------------------------------------------------------
 useEffect(() => {
    // ... (Lógica de fetchBookingData - mantida)
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
                            // O preço base é base_price_per_hour (usado para cálculo de preço fixo e hora)
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
  const cardBg = 'bg-black/80 border border-gray-800'; 
  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/90 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400";
  const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors flex items-center justify-center";


  // ESTRUTURA DE 6 PASSOS
  const steps: BookingStep[] = [
    { step: 1, title: t('booking.tripAddresses') || '1. Localização', completed: currentStep > 1 },
    { step: 2, title: t('booking.selectService') || '2. Serviço', completed: currentStep > 2 },
    { step: 3, title: t('booking.selectVehicle') || '3. Veículo', completed: currentStep > 3 },
    { step: 4, title: t('booking.tripDateTime') || '4. Data & Hora', completed: currentStep > 4 }, 
    { step: 5, title: t('booking.paymentDetails') || '5. Pagamento', completed: currentStep > 5 },
    { step: 6, title: t('booking.confirmation') || '6. Confirmação', completed: false },
  ];

  // ----------------------------------------------------------------------
  // FUNÇÃO DE VALIDAÇÃO DE DISPONIBILIDADE
  // ----------------------------------------------------------------------
  const validateCurrentSlotAvailability = useCallback((): boolean => {
    if (!selectedVehicle || !tripDetails || !tripDetails.date || !tripDetails.time) {
        setSlotValidationError(null); 
        return true; 
    }
    
    // Constrói o ISO string do slot atual para comparação precisa
    const selectedDateTime = `${tripDetails.date}T${tripDetails.time}:00.000Z`;
    
    // Verifica se o slot está na lista de slots reservados (USANDO o ID DO VEÍCULO)
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
    
    setSlotValidationError(null); // Limpa qualquer erro anterior
    return true;
  }, [selectedVehicle, tripDetails, reservedSlots, t]);

  // --- HANDLERS ---

  // HANDLER DO NOVO PASSO 1 (Apenas endereços)
  const handleAddressSubmit = (details: TripDetails) => {
    // Mantém apenas os campos de endereço e tipo de viagem
    setTripDetails(prev => ({
        pickupAddress: details.pickupAddress,
        dropoffAddress: details.dropoffAddress,
        // Mantém data/hora como default
        date: prev?.date || new Date().toISOString().split('T')[0], 
        time: prev?.time || "10:00", 
        tripType: prev?.tripType || 'one-way', 
        returnDate: prev?.returnDate,
        returnTime: prev?.returnTime,
        durationHours: prev?.durationHours || 1, // Mantém ou define 1h
    }));
    
    // Avança para a seleção de serviço
    setCurrentStep(2); 
  };
  
  // HANDLER DO NOVO PASSO 4 (Data/Hora e Tipo de Viagem)
  const handleDateTimeSubmit = (details: TripDetails) => {
    // Atualiza todos os detalhes, incluindo data, hora, tripType e durationHours
    setTripDetails(details);
    
    if (!selectedVehicle) {
        setSlotValidationError(t('booking.noVehicleTip') || "Por favor, selecione um veículo antes de escolher a data/hora.");
        setCurrentStep(3);
        return;
    }
    
    // Validação final de disponibilidade
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
        return; // Impede o avanço se o slot estiver reservado
    }
    setSlotValidationError(null); // Limpa erro se a validação passar
    
    // Se a data/hora for válida, avança para os detalhes do cliente/pagamento (Novo Passo 5)
    setCurrentStep(5); 
  };
  
  const handleServiceSelection = (service: ServiceType) => {
      setSelectedService(service);
      setCurrentStep(3); // Avança para a seleção do veículo
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    
    // Avança para o NOVO PASSO 4 (Seleção de Data/Hora)
    setCurrentStep(4); 
    
    setShowVehicleWarning(false);
  };

  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setClientForm(prev => ({ ...prev, [name]: value }));
  };

  // HANDLER CRÍTICO: SUBMISSÃO PARA O BACKEND (NOVO PASSO 5)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação completa dos dados necessários
    if (!selectedVehicle || !tripDetails || !selectedService || !tripDetails.date || !tripDetails.time || !clientForm.passenger_email || !clientForm.passenger_name || !clientForm.passenger_phone) {
        setPaymentError(t('paymentError') || "Dados da reserva ou cliente incompletos. Por favor, volte atrás.");
        return;
    }
    
    // REVALIDAÇÃO FINAL ANTES DE SUBMETER À API
    if (!validateCurrentSlotAvailability()) {
        setPaymentError(t('booking.slotUnavailableError') || "O horário escolhido ficou indisponível no último momento. Por favor, corrija o Passo 4 antes de submeter.");
        setCurrentStep(4); 
        return; // Bloqueia o envio do POST
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    // 🛑 GESTÃO DO TOKEN DE AUTENTICAÇÃO
    // Lê o token do localStorage (se existir)
    const token = localStorage.getItem('jwtToken');
    
    const headers: HeadersInit = { 
        'Content-Type': 'application/json' 
    };
    
    if (token) {
        // ANEXA o token ao cabeçalho Authorization para que o backend o descodifique
        headers['Authorization'] = `Bearer ${token}`;
        console.log("Token JWT anexado para reserva autenticada.");
    }
    // FIM DA GESTÃO DO TOKEN
    
    // CÁLCULO DA DURAÇÃO DA VIAGEM EM MINUTOS
    const isHourlyService = selectedService.id === "6" || selectedService.title.includes('Hora'); 

    const calculatedDurationMinutes = 
        isHourlyService && tripDetails.durationHours 
        ? tripDetails.durationHours * 60 
        : 60; // Default 60 minutos para transfers fixos (o backend usará isto como base)

    // Constrói o payload para o backend
    const payload = {
        fleet_id: selectedVehicle.id,
        service_id: selectedService.id,
        
        // Data/Hora de levantamento em formato ISO
        trip_pickup_time: `${tripDetails.date}T${tripDetails.time}:00.000Z`,
        trip_duration_minutes: calculatedDurationMinutes,
        
        pickup_address: tripDetails.pickupAddress,
        dropoff_address: tripDetails.dropoffAddress,
        final_price: selectedVehicle.price.toFixed(2), // Preço base (validado pelo backend)
        
        // Dados do Cliente (sempre necessários, mesmo para autenticados)
        passenger_name: clientForm.passenger_name,
        passenger_email: clientForm.passenger_email,
        passenger_phone: clientForm.passenger_phone,
        special_requests: clientForm.special_requests || null,

        // Dados de Pagamento (para EasyPay)
        paymentMethod: clientForm.paymentMethod,
        clientData: {
            name: clientForm.passenger_name,
            email: clientForm.passenger_email,
            phone: clientForm.passenger_phone,
            phone_indicative: '351', // Assumindo Portugal
            key: `client-${clientForm.passenger_email}`,
        }
    };
    
    console.log("PAYLOAD DE RESERVA ENVIADO:", payload);
    
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/reservations/create`, {
            method: 'POST',
            // 🛑 USAR HEADERS COM O TOKEN
            headers: headers,
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            // TRATAMENTO DO ERRO 409 CONFLICT (Slot Ocupado)
            if (response.status === 409) {
                 const errorMessage = responseData.message || t('booking.slotUnavailableError') || 'O slot de reserva ficou indisponível. Por favor, volte ao Passo 4 e tente outra hora.';
                 setPaymentError(errorMessage);
                 setCurrentStep(4); 
                 throw new Error(errorMessage);
            }
            // Outros erros
            throw new Error(responseData.message || 'Falha na criação da reserva.');
        }

        const data: ReservationResponse = responseData;
        
        if (data.success) {
            setReservationResponse(data);
            
            // CORREÇÃO DO FLUXO PÓS-PAGAMENTO
            const paymentMethod = data.payment.method;

            if (paymentMethod === 'cc' && data.payment.data.redirect_url) {
                // 1. Cartão de Crédito: Redirecionamento imediato
                window.location.href = data.payment.data.redirect_url;
                return; 
            } else if (paymentMethod === 'mb' || paymentMethod === 'mbw') {
                // 2. MB Way / Multibanco: Fica no Passo 5 para mostrar as referências
            } else {
                // 3. Outros (Ex: Pagamento à Chegada, ou CC bem sucedido): Avança para o 6
                setCurrentStep(6);
            }
            
        } else {
            setPaymentError(data.message);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setPaymentError(errorMessage);
        console.error("Erro na EasyPay/Reserva:", error);
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
  
  // Veículos disponíveis com base no serviço selecionado
  const availableVehicles = useMemo(() => {
    if (!selectedService) return vehiclesList; 
    
    return vehiclesList.filter(v => v.serviceTypes && v.serviceTypes.includes(selectedService.id)); 
  }, [selectedService, vehiclesList]);


  // ----------------------------------------------------------------------
  // RENDERIZAÇÃO DE ESTADOS DE CARREGAMENTO/ERRO
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

  return (
    // CONTÊINER PRINCIPAL
    <div className="relative min-h-screen">
        
        {/* 1. CAMADA DE VÍDEO DE BACKGROUND */}
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
            {/* 2. OVERLAY ESCURO */}
            <div className="absolute inset-0 bg-black/70"></div>
        </div>


        {/* 3. CONTEÚDO PRINCIPAL */}
        <div className="relative pt-40 pb-12 text-white min-h-screen">
          <div className="container mx-auto px-4">
            
            {/* Título Dinâmico */}
            <h1 className="text-4xl font-extrabold text-white mb-16 text-center drop-shadow-lg">
                {t('booking.reserveNow')} - {steps[currentStep - 1]?.title || '...'}
            </h1>

            {/* Progress Steps (Barra de Progresso) */}
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

              {/* PASSO 1: Endereços (APENAS Recolha e Destino) */}
              {currentStep === 1 && ( 
                <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                    <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>
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
                      />
                      
                    </div> 
                </ElectricBorder>
              )}

              {/* PASSO 2: Seleção de Serviço */}
              {currentStep === 2 && ( 
                  <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                      <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3 text-center">2. {t('booking.selectService')}</h2>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                          {servicesList.map((service) => {
                              const IconComponent = service.icon ? IconMap[service.icon] : Briefcase;
                              return (
                                  <div key={service.id} onClick={() => handleServiceSelection(service)} className={`relative h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${selectedService && selectedService.id === service.id ? 'ring-4 ring-amber-400 shadow-2xl scale-[1.02]' : 'border border-gray-700 hover:ring-2 hover:ring-amber-400/50'}`} style={{ backgroundImage: `url(${service.image || 'https://placehold.co/400x300?text=Serviço'})`, backgroundSize: 'cover', backgroundPosition: 'center', }}>
                                      <div className={`absolute inset-0 bg-black/50 transition-colors duration-300 ${selectedService && selectedService.id === service.id ? 'bg-black/30' : 'group-hover:bg-black/40'}`}></div>
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
                    </div>
                  </ElectricBorder>
              )}

              {/* PASSO 3: Seleção de Veículo */}
              {currentStep === 3 && ( 
                  <div>
                  <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">3. {t('booking.selectVehicle')}</h2>
                  {selectedService && (<div className="mb-8 p-4 bg-gray-800/90 rounded-lg text-center border border-gray-700"><p className="text-gray-300"><span className={goldColor}>{t('booking.serviceSelected')}:</span> <strong className="ml-2">{selectedService.title || selectedService.id}</strong></p></div>)}
                  <div className="grid md:grid-cols-2 gap-6">
                    {availableVehicles.length > 0 ? ( availableVehicles.map((vehicle) => ( <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={handleVehicleSelect} showPrice={true} darkMode={true} isSelected={selectedVehicle?.id === vehicle.id} /> )) ) : ( <div className={`${cardBg} md:col-span-2 rounded-xl shadow-2xl p-8 text-center`}><p className="text-lg text-gray-300 mb-6">{t('booking.noVehicleAvailable', { serviceName: selectedService?.title || t('booking.notSelected') })}</p><p className="text-sm text-gray-500 mb-6">{t('booking.noVehicleTip') || 'Nenhum veículo disponível nas datas indicadas. Por favor, volte atrás e tente outro serviço.'}</p><button onClick={() => setCurrentStep(2)} className="inline-flex items-center bg-gray-700 text-amber-400 px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"><ArrowRight className="w-5 h-5 mr-2 transform rotate-180" />{t('booking.tryAnotherService') || 'Tentar Outro Serviço'}</button></div> )}
                  </div>
                </div>
              )}
              
              {/* PASSO 4: Data e Hora (Inclui Ida/Volta e DURAÇÃO) */}
              {currentStep === 4 && selectedVehicle && tripDetails && selectedService && ( 
                <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                    <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>
                      <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">4. {t('booking.tripDateTime') || 'Escolha a Data e Hora'}</h2>
                      
                      {/* Resumo Rápido */}
                      <div className="p-4 bg-gray-800/90 rounded-lg text-center border border-gray-700 mb-4">
                          <p className="text-sm text-gray-300">
                              {t('booking.vehicleSelected') || 'Veículo Escolhido:'} <strong className={goldColor}>{selectedVehicle.name}</strong>
                              <span className='mx-2'>|</span>
                              {t('booking.serviceSelected') || 'Serviço:'} <strong className={goldColor}>{selectedService.title}</strong>
                          </p>
                      </div>
                      
                      {/* FORMULÁRIO DE DATA/HORA/DURAÇÃO */}
                      <form onSubmit={(e) => {
                          e.preventDefault();
                          
                          // Verifica se é serviço à hora (inferindo pelo ID ou título)
                          const isHourly = selectedService.id === "6" || selectedService.title.includes('Hora'); 
                          
                          if (isHourly && (!tripDetails.durationHours || tripDetails.durationHours < 1)) {
                              setSlotValidationError(t('booking.selectDurationError') || "Por favor, selecione a duração do serviço à hora (mínimo 1h).");
                              return;
                          }
                          
                          // Chama o handler principal do passo
                          handleDateTimeSubmit(tripDetails);
                      }}>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                              {/* Campo de Data e Hora existentes */}
                              <div>
                                  <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2">{t('booking.date')}</label>
                                  <input 
                                      type="date" 
                                      id="date"
                                      name="date"
                                      value={tripDetails.date}
                                      min={new Date().toISOString().split('T')[0]} 
                                      onChange={(e) => setTripDetails(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                                      className={inputClasses}
                                      required
                                  />
                              </div>
                              <div>
                                  <label htmlFor="time" className="block text-sm font-medium text-gray-400 mb-2">{t('booking.time')}</label>
                                  <input 
                                      type="time" 
                                      id="time"
                                      name="time"
                                      value={tripDetails.time}
                                      onChange={(e) => setTripDetails(prev => prev ? ({ ...prev, time: e.target.value }) : null)}
                                      className={inputClasses}
                                      required
                                  />
                              </div>

                              {/* ADICIONAR: SELETOR DE DURAÇÃO (Se for Serviço à Hora) */}
                              {(selectedService.id === "6" || selectedService.title.includes('Hora')) && (
                                  <div className="md:col-span-2">
                                      <label htmlFor="duration" className="block text-sm font-medium text-amber-400 mb-2">
                                          <Clock className="w-4 h-4 inline mr-1" /> {t('booking.selectDuration') || 'Duração da Reserva (Mínimo 1h)'}
                                      </label>
                                      <select
                                          id="duration"
                                          name="duration"
                                          value={tripDetails.durationHours || 1}
                                          onChange={(e) => setTripDetails(prev => prev ? ({ ...prev, durationHours: parseInt(e.target.value) }) : null)}
                                          className={inputClasses + ' appearance-none'}
                                          required
                                      >
                                          {/* Opções de duração: 1h a 12h (Mínimo 1h) */}
                                          {[...Array(12).keys()].map(i => (
                                              <option key={i + 1} value={i + 1}>{i + 1} Hora{i === 0 ? '' : 's'}</option>
                                          ))}
                                      </select>
                                      <p className="text-xs text-gray-500 mt-1">O preço final será calculado com base nesta duração.</p>
                                  </div>
                              )}
                              
                              {/* Seletor de Ida/Volta (tripType) */}
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('booking.tripType')}</label>
                                  <div className="flex space-x-4">
                                      <label className="flex items-center space-x-2">
                                          <input type="radio" name="tripType" value="one-way" checked={tripDetails.tripType === 'one-way'} onChange={() => setTripDetails(prev => prev ? ({ ...prev, tripType: 'one-way', returnDate: undefined, returnTime: undefined }) : null)} className="form-radio text-amber-400 bg-gray-700 border-gray-600" />
                                          <span className="text-white">{t('booking.oneWay')}</span>
                                      </label>
                                      <label className="flex items-center space-x-2">
                                          <input type="radio" name="tripType" value="round-trip" checked={tripDetails.tripType === 'round-trip'} onChange={() => setTripDetails(prev => prev ? ({ ...prev, tripType: 'round-trip' }) : null)} className="form-radio text-amber-400 bg-gray-700 border-gray-600" />
                                          <span className="text-white">{t('booking.roundTrip')}</span>
                                      </label>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Campos de Volta (apenas se 'round-trip' estiver selecionado) */}
                          {tripDetails.tripType === 'round-trip' && (
                              <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                                  <div>
                                      <label htmlFor="returnDate" className="block text-sm font-medium text-gray-400 mb-2">{t('booking.returnDate')}</label>
                                      <input type="date" id="returnDate" name="returnDate" value={tripDetails.returnDate || ''} min={tripDetails.date} onChange={(e) => setTripDetails(prev => prev ? ({ ...prev, returnDate: e.target.value }) : null)} className={inputClasses} required />
                                  </div>
                                  <div>
                                      <label htmlFor="returnTime" className="block text-sm font-medium text-gray-400 mb-2">{t('booking.returnTime')}</label>
                                      <input type="time" id="returnTime" name="returnTime" value={tripDetails.returnTime || ''} onChange={(e) => setTripDetails(prev => prev ? ({ ...prev, returnTime: e.target.value }) : null)} className={inputClasses} required />
                                  </div>
                              </div>
                          )}
                          
                          {/* Mensagem de Erro de Validação de Slot */}
                          {slotValidationError && (
                              <div className="mt-4 p-3 bg-red-800/70 border border-red-500 rounded-lg text-sm text-white">
                                  <p>{slotValidationError}</p>
                              </div>
                          )}
                          
                          {/* Botão de Avançar */}
                          <div className="mt-6">
                              <button type="submit" className={buttonClasses}>
                                  {t('booking.continueToPayment') || 'Continuar para os Dados do Cliente'} <ArrowRight className="w-5 h-5 ml-2" />
                              </button>
                          </div>
                          
                      </form>
                      
                    </div> 
                </ElectricBorder>
              )}


              {/* PASSO 5: Dados do Cliente e Pagamento */}
              {currentStep === 5 && selectedVehicle && tripDetails && selectedService && (
                <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                    <div className={`${cardBg} rounded-xl shadow-2xl p-8`}>
                        <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-3">5. {t('booking.paymentDetails')}</h2>
                        
                        {/* 5A. Resumo da Reserva */}
                        <div className="mb-6 p-4 bg-gray-800/90 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold mb-3 text-amber-400">{t('booking.tripSummary')}</h3>
                            <ul className="text-gray-300 space-y-1 text-sm">
                                <li><span className="font-semibold">{t('booking.service')}:</span> {selectedService.title}</li>
                                <li><span className="font-semibold">{t('booking.vehicle')}:</span> {selectedVehicle.name}</li>
                                <li><span className="font-semibold">{t('booking.pickup')}:</span> {tripDetails.pickupAddress}</li>
                                <li><span className="font-semibold">{t('booking.dropoff')}:</span> {tripDetails.dropoffAddress}</li>
                                <li><span className="font-semibold">{t('booking.dateTime')}:</span> {tripDetails.date} às {tripDetails.time}</li>
                                {(selectedService.id === "6" || selectedService.title.includes('Hora')) && (
                                    <li className='text-amber-500'><span className="font-semibold">{t('booking.duration')}:</span> {tripDetails.durationHours} Hora(s)</li>
                                )}
                                {/* PREÇO FINAL: Será mostrado aqui APÓS a submissão, ou pode ser carregado por uma API de preço */}
                                <li><span className="font-semibold text-white text-lg">{t('booking.estimatedPrice')}:</span> <span className="text-xl text-amber-400">€{selectedVehicle.price.toFixed(2)} *</span></li>
                                <li className="text-xs text-gray-500">* {t('booking.priceNote') || 'O preço final será confirmado pelo servidor após a validação.'}</li>
                            </ul>
                        </div>
                        
                        {/* Se o pagamento já tiver sido submetido (MB Way/Multibanco) */}
                        {reservationResponse && (
                            <div className="mb-6 p-6 bg-green-900/50 border border-green-700 rounded-lg text-white">
                                <h3 className="text-2xl font-bold mb-3 text-green-400 flex items-center"><Check className='w-6 h-6 mr-2' /> {t('booking.paymentPending')}</h3>
                                <p className="mb-4">{reservationResponse.message || t('booking.paymentInstruction')}</p>
                                
                                {reservationResponse.payment.data.entity && (
                                    <div className='mt-4 p-4 bg-black/50 rounded-lg'>
                                        <p className='text-lg font-semibold text-amber-400'>Multibanco:</p>
                                        <p>Entidade: <span className='font-mono'>{reservationResponse.payment.data.entity}</span></p>
                                        <p>Referência: <span className='font-mono'>{reservationResponse.payment.data.reference}</span></p>
                                        <p>Valor: <span className='font-mono'>€{reservationResponse.payment.data.value}</span></p>
                                    </div>
                                )}
                                <div className="mt-6 text-center">
                                    <button onClick={() => setCurrentStep(6)} className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-500 transition-colors">
                                        {t('booking.viewConfirmation') || 'Ver Confirmação de Reserva'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 5B. Formulário de Dados do Cliente e Método de Pagamento */}
                        {!reservationResponse && (
                            <form onSubmit={handlePaymentSubmit}>
                                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{t('booking.passengerDetails')}</h3>
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <input type="text" name="passenger_name" value={clientForm.passenger_name} onChange={handleClientFormChange} placeholder={t('booking.name') || "Nome Completo"} className={inputClasses} required />
                                    <input type="email" name="passenger_email" value={clientForm.passenger_email} onChange={handleClientFormChange} placeholder={t('booking.email') || "Email"} className={inputClasses} required />
                                    <input type="tel" name="passenger_phone" value={clientForm.passenger_phone} onChange={handleClientFormChange} placeholder={t('booking.phone') || "Telefone (ex: +351 9XX YYY ZZZ)"} className={inputClasses} required />
                                </div>
                                
                                <textarea name="special_requests" value={clientForm.special_requests} onChange={handleClientFormChange} placeholder={t('booking.specialRequests') || "Pedidos Especiais (Ex: Cadeirinha, paragem extra...)"} className={`${inputClasses} mb-6`} rows={3}></textarea>

                                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{t('booking.paymentMethod')}</h3>
                                
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    {['mbw', 'mb', 'cc'].map(method => (
                                        <label key={method} className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${clientForm.paymentMethod === method ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}>
                                            <input type="radio" name="paymentMethod" value={method} checked={clientForm.paymentMethod === method} onChange={handleClientFormChange} className="form-radio text-amber-400 bg-gray-700 border-gray-600" />
                                            <span className="text-sm font-semibold ml-2 text-white capitalize">{method === 'mbw' ? 'MB Way' : method === 'mb' ? 'Multibanco' : 'Cartão Crédito'}</span>
                                            <img src={PaymentImageMap[method]} alt={method} className="h-6" />
                                        </label>
                                    ))}
                                </div>

                                {paymentError && (
                                    <div className="mt-4 p-3 bg-red-800/70 border border-red-500 rounded-lg text-sm text-white">
                                        <p>{paymentError}</p>
                                    </div>
                                )}
                                
                                <button type="submit" disabled={isSubmittingPayment} className={buttonClasses + " mt-6"}>
                                    {isSubmittingPayment ? ( <Loader2 className="w-5 h-5 animate-spin mr-3" /> ) : ( <> {t('booking.confirmAndPay') || 'Confirmar Reserva e Pagar'} <Lock className="w-5 h-5 ml-2" /> </> )}
                                </button>
                            </form>
                        )}
                    </div>
                </ElectricBorder>
              )}

              {/* PASSO 6: Confirmação Final */}
              {currentStep === 6 && reservationResponse && (
                <ElectricBorder color="#FBBF24" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }}>
                    <div className={`${cardBg} rounded-xl shadow-2xl p-8 text-center`}>
                        <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h2 className="text-4xl font-extrabold text-white mb-2">{t('booking.successTitle') || 'Reserva Confirmada!'}</h2>
                        <p className="text-lg text-gray-300 mb-6">{reservationResponse.message || t('booking.successMessage')}</p>
                        
                        <div className="mb-8 p-4 bg-gray-900/90 rounded-lg inline-block text-left">
                             <p className="font-semibold text-amber-400">{t('booking.reservationId')}: <span className="text-white ml-2">{reservationResponse.reservation.id}</span></p>
                             <p className="font-semibold text-amber-400">{t('booking.pickupTime')}: <span className="text-white ml-2">{new Date(reservationResponse.reservation.trip_pickup_time).toLocaleString()}</span></p>
                        </div>
                        
                        <div className="mt-8">
                            <button onClick={() => navigate('/')} className="bg-amber-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-amber-300 transition-colors">
                                {t('booking.backHome') || 'Voltar à Página Inicial'}
                            </button>
                        </div>
                    </div>
                </ElectricBorder>
              )}

            </div>
          </div>
        </div>
    </div>
  );
};

export default Booking;