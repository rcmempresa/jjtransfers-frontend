import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Car, Briefcase, ChevronDown, Map, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { TripDetails } from '../types'; 

// 🚨 IMPORTAÇÃO DO TOAST
import toast, { Toaster } from 'react-hot-toast';

// Assumindo que você tem estes componentes no seu projeto
import DatePicker from './DatePicker'; 
import TimePicker from './TimePicker'; 

// --- TIPAGEM SIMPLIFICADA PARA OS DADOS DA API ---
interface Service {
    id: string;
    title: string;
}

interface Vehicle {
    id: string;
    name: string;
    price: number; 
}

// =========================================================================
// SIMULAÇÃO DA CHAMADA À API (SUBSTITUA PELA SUA LÓGICA REAL)
// =========================================================================
const fetchData = async <T,>(endpoint: string): Promise<T[]> => {
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    if (endpoint === '/api/services') {
        return [
            { id: 'transfer', title: 'Transfer Aeroporto/Ponto' },
            { id: 'hourly', title: 'Aluguer Horário (Chauffeur)' },
            { id: 'tour', title: 'Tour Privado na Ilha' },
        ] as T[];
    }
    if (endpoint === '/api/vehicles') {
        return [
            { id: '1', name: 'Sedan Executivo', price: 50 },
            { id: '2', name: 'Van VIP Premium', price: 80 },
            { id: '3', name: 'Minibus de Luxo', price: 120 },
        ] as T[];
    }
    return [] as T[];
};
// =========================================================================

// COORDENADAS PARA RESTRIÇÃO DA ILHA DA MADEIRA
const MADEIRA_BOUNDS = {
  south: 32.3, west: -17.5, north: 33.2, east: -16.0,
};

// Extensão da interface para o componente com NOVOS PROPS
interface BookingFormProps {
  onSubmit?: (details: TripDetails) => void;
  initialData?: Partial<TripDetails>;
  compact?: boolean;
  showServiceAndVehicle?: boolean;
  // 🚨 NOVOS PROPS PARA CONTROLO DO FLUXO DE 6 PASSOS
  showAddresses?: boolean; // Controla Morada de Recolha e Destino
  showTripType?: boolean;  // Controla o seletor Ida/Volta
  showDateAndTime?: boolean; // Controla todos os campos de Data e Hora
  
  // Estes props vieram do Booking.tsx mas não são usados aqui, mas mantidos para compatibilidade:
  reservedSlots?: any[];
  selectedVehicleId?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  onSubmit, 
  initialData, 
  compact = false, 
  showServiceAndVehicle = false,
  // 🚨 VALORES PADRÃO PARA OS NOVOS PROPS (TRUE para retrocompatibilidade)
  showAddresses = true, 
  showTripType = true,
  showDateAndTime = true,
  // Ignoramos os props não utilizados aqui
  // reservedSlots, selectedVehicleId
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'one-way' | 'hourly'>('one-way');
  
  // --- ESTADO PARA DADOS DA API ---
  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [fetchedVehicles, setFetchedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(showServiceAndVehicle); 
  const [error, setError] = useState<string | null>(null);

  // --- REFS PARA O GOOGLE AUTOCOMPLETE ---
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TripDetails>({
    pickupAddress: initialData?.pickupAddress || '',
    dropoffAddress: initialData?.dropoffAddress || '',
    tripType: initialData?.tripType || 'one-way',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || '10:00',
    returnDate: initialData?.returnDate || '',
    returnTime: initialData?.returnTime || '10:00',
    service: initialData?.service || '',
    vehicleId: initialData?.vehicleId || '',
    duration: initialData?.duration || '2'
  });

  // =========================================================================
  // USEEFFECT 1: CARREGAMENTO DE DADOS DA API (Serviços e Veículos)
  // =========================================================================
  useEffect(() => {
    if (!showServiceAndVehicle) return;

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [servicesData, vehiclesData] = await Promise.all([
                fetchData<Service>('/api/services'),
                fetchData<Vehicle>('/api/vehicles'),
            ]);
            setFetchedServices(servicesData);
            setFetchedVehicles(vehiclesData);
        } catch (err) {
            console.error("Erro ao carregar dados da API:", err);
            setError("Não foi possível carregar a lista de serviços ou veículos.");
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [showServiceAndVehicle]); 

  // =========================================================================
  // USEEFFECT 2: GOOGLE MAPS AUTOCOMPLETE
  // =========================================================================
  useEffect(() => {
    // Verifica se a biblioteca do Google Maps Places está carregada
    if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("Google Maps Places library não está carregada. O Autocomplete não funcionará.");
        return;
    }

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
    
    // Inicializa o Autocomplete num campo de input específico
    const initializeAutocomplete = (ref: React.RefObject<HTMLInputElement>, fieldName: keyof TripDetails) => {
        if (ref.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(ref.current, options);
            
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setFormData(prev => ({ 
                        ...prev, 
                        [fieldName]: place.formatted_address 
                    }));
                }
            });
        }
    };
    
    if (showAddresses) {
        initializeAutocomplete(pickupRef, 'pickupAddress');
        initializeAutocomplete(dropoffRef, 'dropoffAddress');
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, showAddresses]); 

  // =========================================================================
  // FUNÇÃO PARA GEOLOCALIZAÇÃO
  // =========================================================================
  const handleLocateMe = () => {
    if (navigator.geolocation && window.google && window.google.maps) {
      // 1. Obtém a posição atual do navegador
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 2. Converte coordenadas (lat/lng) para um endereço legível (Geocoding)
          
          const geocoder = new window.google.maps.Geocoder();
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              // 3. Preenche o campo de recolha com o endereço
              const address = results[0].formatted_address;
              setFormData(prev => ({ 
                ...prev, 
                pickupAddress: address 
              }));
              
              // 🚨 SUBSTITUIÇÃO DE ALERT POR TOAST SUCESSO
              toast.success(`${t('booking.locationSetTo')}: ${address}`, {
                duration: 4000,
                icon: '📍',
              });

            } else {
              // 🚨 SUBSTITUIÇÃO DE ALERT POR TOAST ERRO
              toast.error(t('booking.couldNotConvertLocationToAddress'));
            }
          });
        },
        (error) => {
          // Lidar com erros de permissão
          console.error("Erro de geolocalização: ", error);
          // 🚨 SUBSTITUIÇÃO DE ALERT POR TOAST ERRO
          toast.error(t('booking.locationPermissionDenied') || 'A permissão de localização foi negada ou ocorreu um erro. Por favor, escreva a morada.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // 🚨 SUBSTITUIÇÃO DE ALERT POR TOAST ERRO
      toast.error(t('booking.geolocationNotSupported') || 'O seu navegador não suporta geolocalização ou a API do Google Maps não está carregada.');
    }
  };

  // =========================================================================
  // FUNÇÕES GERAIS
  // =========================================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VALIDAÇÕES E SUBSTITUIÇÃO DE ALERT POR TOAST ERRO ---

    // 1. Validação de endereço
    if (showAddresses && (!formData.pickupAddress || (!compact && !formData.dropoffAddress))) {
        toast.error(t('booking.validation.addressRequired') || "Por favor, selecione as moradas completas usando o Autocomplete para garantir a precisão.");
        return;
    }
    
    // 2. Validação de data/hora
    if (showDateAndTime && (!formData.date || !formData.time)) {
        toast.error(t('booking.validation.dateTimeRequired') || "Por favor, preencha a data e hora de recolha.");
        return;
    }
    
    // 3. Validação de regresso
    if (showDateAndTime && formData.tripType === 'round-trip' && (!formData.returnDate || !formData.returnTime)) {
        toast.error(t('booking.validation.returnDateTimeRequired') || "Por favor, preencha a data e hora de regresso.");
        return;
    }
    
    // --- FIM DAS VALIDAÇÕES ---

    const finalData: TripDetails = {
        ...formData,
        // Garante que o tipo de viagem é consistente
        tripType: showTripType ? formData.tripType : 'one-way', 
        
        // Garante que os campos de regresso só são enviados se for 'round-trip'
        returnDate: formData.tripType === 'round-trip' ? formData.returnDate : '',
        returnTime: formData.tripType === 'round-trip' ? formData.returnTime : '',
        
        // No modo compact 'hourly', dropoff é vazio
        dropoffAddress: (compact && activeTab === 'hourly') ? '' : formData.dropoffAddress,
    };
    
    if (onSubmit) {
      onSubmit(finalData); 
    } else {
      navigate('/booking', { state: { tripDetails: finalData } });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ----------------------------------------------------------------------------------
  // ESTILOS
  // ----------------------------------------------------------------------------------
  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400";
  const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors";
  const radioClasses = "text-amber-400 focus:ring-amber-400 bg-gray-700 border-gray-600";
  const iconColor = "text-gray-400";
  
  // ----------------------------------------------------------------------------------
  // RENDERING
  // ----------------------------------------------------------------------------------
  
  // O componente `Toaster` deve ser renderizado para exibir os toasts
  // Idealmente, ele é colocado no componente de layout principal, mas funciona aqui também.
  const toasterComponent = <Toaster position="top-right" toastOptions={{
    className: 'bg-gray-800 text-white border border-gray-700 shadow-xl',
    error: {
        style: {
            background: '#4a0000',
            color: '#ffdddd',
            border: '1px solid #8b0000',
        },
    },
  }} />;

  if (compact) {
    return (
      <>
        {toasterComponent}
        <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl lg:rounded-3xl shadow-2xl p-4 lg:p-8 max-w-md mx-auto border border-gray-700/50">
          {/* ... Resto do JSX Compacto (mantido) ... */}
          {/* Tab Navigation (Mantido) */}
          <div className="flex mb-4 lg:mb-8 bg-gray-800 rounded-xl lg:rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab('one-way')}
              className={`flex-1 py-2 lg:py-4 px-3 lg:px-6 text-sm lg:text-lg font-semibold rounded-lg lg:rounded-xl transition-all ${
                activeTab === 'one-way'
                  ? 'bg-gray-700 text-white shadow-md'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
            >
              {t('booking.oneWayTab')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hourly')}
              className={`flex-1 py-2 lg:py-4 px-3 lg:px-6 text-sm lg:text-lg font-semibold rounded-lg lg:rounded-xl transition-all ${
                activeTab === 'hourly'
                  ? 'bg-gray-700 text-white shadow-md'
                  : 'text-gray-400 hover:text-amber-400'
              }`}
            >
              {t('booking.hourlyTab')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-6">
            {/* From Address (Pickup) - COM AUTOCOMPLETE E GEOLOCALIZAÇÃO */}
            <div className="relative">
              <div className="flex items-center bg-gray-800/80 rounded-xl lg:rounded-2xl p-3 lg:p-5 hover:bg-gray-700/80 transition-all border border-gray-600/50">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3 lg:mr-4 shadow-sm">
                  <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <div className="flex-1 pr-10"> {/* Adiciona padding à direita para o botão */}
                  <label className="block text-xs lg:text-sm font-semibold text-gray-400 mb-1">{t('booking.from')} <span className="text-xs text-amber-500">(Madeira)</span></label>
                  <input
                    type="text"
                    name="pickupAddress"
                    ref={pickupRef} 
                    defaultValue={formData.pickupAddress} 
                    onChange={handleChange}
                    placeholder={t('booking.addressPlaceholder')}
                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm lg:text-lg"
                    required
                  />
                </div>
                {/* Botão de Localização Compacta */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  title="Usar Localização Atual"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-white hover:text-black hover:bg-amber-400 transition-colors"
                >
                  <Map className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>

            {/* To Address or Duration */}
            {activeTab === 'one-way' ? (
              /* To Address (Dropoff) - COM AUTOCOMPLETE */
              <div className="relative">
                <div className="flex items-center bg-gray-800/80 rounded-xl lg:rounded-2xl p-3 lg:p-5 hover:bg-gray-700/80 transition-all border border-gray-600/50">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3 lg:mr-4 shadow-sm">
                    <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs lg:text-sm font-semibold text-gray-400 mb-1">{t('booking.to')} <span className="text-xs text-amber-500">(Madeira)</span></label>
                    <input
                      type="text"
                      name="dropoffAddress"
                      ref={dropoffRef} 
                      defaultValue={formData.dropoffAddress}
                      onChange={handleChange}
                      placeholder={t('booking.addressPlaceholder')}
                      className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm lg:text-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Duration (Hourly) - Mantido */
              <div className="relative">
                <div className="flex items-center bg-gray-800/80 rounded-xl lg:rounded-2xl p-3 lg:p-5 hover:bg-gray-700/80 transition-all border border-gray-600/50">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3 lg:mr-4 shadow-sm">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs lg:text-sm font-semibold text-gray-400 mb-1">{t('booking.duration')}</label>
                    <div className="flex items-center justify-between">
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full bg-transparent text-white focus:outline-none text-sm lg:text-lg appearance-none pr-6"
                      >
                        <option value="2">2 Horas</option>
                        <option value="3">3 Horas</option>
                        <option value="4">4 Horas</option>
                        <option value="8">8 Horas</option>
                      </select>
                      <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 mt-2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Picker (Usando input type="date" simplificado) - Mantido */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 mt-2 ml-1" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${inputClasses} pl-12`}
                required
              />
            </div>

            {/* Time Picker (Usando input type="time" simplificado) - Mantido */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 mt-2 ml-1" />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`${inputClasses} pl-12`}
                required
              />
            </div>

            {/* Info Message - Mantido */}
            {activeTab === 'one-way' && (
              <div className="flex items-center text-gray-300 text-xs lg:text-sm bg-gray-800/50 rounded-lg lg:rounded-xl p-2 lg:p-3 border border-gray-600/30">
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                  <span className="text-white text-xs">i</span>
                </div>
                <span>{t('booking.waitMessage') || 'O preço final será calculado no próximo passo.'}</span>
              </div>
            )}

            {/* Search Button - Mantido */}
            <button
              type="submit"
              className="w-full bg-amber-400 text-black py-3 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-sm lg:text-lg hover:shadow-2xl hover:shadow-amber-400/25 transition-all transform hover:scale-105"
            >
              {t('booking.search')}
            </button>
          </form>
        </div>
      </>
    );
  }

  
  
  // ----------------------------------------------------------------------------------
  // Versão COMPLETA (Controlada por Props: Passos 1 & 4)
  // ----------------------------------------------------------------------------------
  return (
    <>
      {toasterComponent}
      <form onSubmit={handleSubmit} className="space-y-6"> 
        
        {/* 🚨 BLOC 1: Endereços (Visível APENAS no Passo 1) */}
        {showAddresses && (
          <>
              {/* Pickup Address - COM AUTOCOMPLETE E GEOLOCALIZAÇÃO */}
              <div className="relative">
                <MapPin className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                <input
                  type="text"
                  name="pickupAddress"
                  ref={pickupRef} 
                  defaultValue={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder={`${t('booking.pickupAddress')} (Madeira)`}
                  className={`${inputClasses} pl-12 pr-12`} // Ajuste para o botão
                  required
                />
                {/* NOVO BOTÃO DE LOCALIZAÇÃO (Versão Completa) */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  title="Usar Localização Atual"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-amber-400 transition-colors"
                  style={{ marginTop: '-4px' }}
                >
                  <Map className="w-5 h-5" />
                </button>
              </div>

              {/* Dropoff Address - COM AUTOCOMPLETE (Mantido) */}
              <div className="relative">
                <MapPin className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                <input
                  type="text"
                  name="dropoffAddress"
                  ref={dropoffRef} 
                  defaultValue={formData.dropoffAddress}
                  onChange={handleChange}
                  placeholder={`${t('booking.dropoffAddress')} (Madeira)`}
                  className={`${inputClasses} pl-12`}
                  required
                />
              </div>
          </>
        )}

        {/* 🚨 BLOC 2: Tipo de Viagem, Datas e Horas (Visível APENAS no Passo 4) */}
        {(showTripType || showDateAndTime) && (
          <div className="space-y-6">
              
              {/* Tipos de Viagem (Visível se showTripType for true) */}
              {showTripType && (
                  <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                      <input
                          type="radio"
                          name="tripType"
                          value="one-way"
                          checked={formData.tripType === 'one-way'}
                          onChange={handleChange}
                          className={radioClasses}
                      />
                      <span>{t('booking.oneWay')}</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                      <input
                          type="radio"
                          name="tripType"
                          value="round-trip"
                          checked={formData.tripType === 'round-trip'}
                          onChange={handleChange}
                          className={radioClasses}
                      />
                      <span>{t('booking.roundTrip')}</span>
                      </label>
                  </div>
              )}

              {/* Datas e Horas (Visível se showDateAndTime for true) */}
              {showDateAndTime && (
                  <>
                      <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                          <Calendar className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                          <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={`${inputClasses} pl-12`}
                          required
                          />
                      </div>
                      <div className="relative">
                          <Clock className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                          <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className={`${inputClasses} pl-12`}
                          required
                          />
                      </div>
                      </div>

                      {/* Return Date and Time (Visível se for round-trip E showDateAndTime for true) */}
                      {formData.tripType === 'round-trip' && (
                      <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                          <Calendar className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                          <input
                              type="date"
                              name="returnDate"
                              value={formData.returnDate}
                              onChange={handleChange}
                              placeholder={t('booking.returnDate')}
                              className={`${inputClasses} pl-12`}
                              required
                          />
                          </div>
                          <div className="relative">
                          <Clock className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                          <input
                              type="time"
                              name="returnTime"
                              value={formData.returnTime}
                              onChange={handleChange}
                              placeholder={t('booking.returnTime')}
                              className={`${inputClasses} pl-12`}
                              required
                          />
                          </div>
                      </div>
                      )}
                  </>
              )}
          </div>
        )}


        {/* Service Selection e Vehicle Selection (Da API, com Loading/Error) */}
        {showServiceAndVehicle && (
          <div className="space-y-6">
              {/* Loading/Error State */}
              {loading && (
                  <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg text-amber-400">
                      <Loader className="w-5 h-5 animate-spin mr-3" />
                      <span>A carregar serviços e veículos...</span>
                  </div>
              )}
              {error && (
                  <div className="flex items-center p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-400">
                      <AlertTriangle className="w-5 h-5 mr-3" />
                      <span>{error}</span>
                  </div>
              )}
              
              {/* Service Selection */}
              {!loading && fetchedServices.length > 0 && (
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={`${inputClasses} pl-12 appearance-none`}
                      required
                    >
                      <option value="">{t('booking.selectService')}</option>
                      {fetchedServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {t(`services.list.${service.id}.title`) || service.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${iconColor} pointer-events-none`} />
                  </div>
              )}

              {/* Vehicle Selection */}
              {!loading && fetchedVehicles.length > 0 && (
                  <div className="relative">
                    <Car className={`absolute left-3 top-3 w-5 h-5 ${iconColor}`} />
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      className={`${inputClasses} pl-12 appearance-none`}
                      required
                    >
                      <option value="">{t('booking.selectVehicleOption')}</option>
                      {fetchedVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - €{vehicle.price}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${iconColor} pointer-events-none`} />
                  </div>
              )}
          </div>
        )}

        {/* Botão de Submissão - Alterado para "Continuar" */}
        <button type="submit" className={buttonClasses}>
          {t('booking.continue') || 'Continuar'}
        </button>
      </form>
    </>
  );
};

export default BookingForm;