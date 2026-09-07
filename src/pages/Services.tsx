import LocationPickerField from '../components/LocationPickerField';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

// Importa ícones da Lucide-React
import { 
    Home, ArrowRight, ArrowLeft, Car, MapPin, ChevronDown, CheckCircle, 
    Calendar, Clock, Luggage, Shield, User, Briefcase, X, 
    Award, DollarSign, Users, Plane, Star, MessageSquare, Tag,
    Map, Loader2 
} from 'lucide-react'; 

// --- MOCK DE DEPENDÊNCIAS PARA COMPILAÇÃO EM FICHEIRO ÚNICO ---
// MOCK: Definição de Link (Substitui react-router-dom Link)
const Link = ({ to, children, className, onClick }) => (
    <a 
        href={to} 
        className={className} 
        onClick={(e) => { 
            // Permite a navegação se for para uma rota real (ex: /contact)
            if (to && to.startsWith('#')) {
                e.preventDefault(); 
                const targetElement = document.getElementById(to.substring(1));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            if (onClick) onClick(e);
            console.log(`Navigating to: ${to}`); 
        }}
    >
        {children}
    </a>
);


// Destaques estáticos (benefícios da empresa, não do serviço)
const benefits = [
    { icon: Award, titleKey: "benefits.certifiedDriversTitle", descriptionKey: "benefits.certifiedDriversDesc" },
    { icon: Shield, titleKey: "benefits.maxSecurityTitle", descriptionKey: "benefits.maxSecurityDesc" },
    { icon: Users, titleKey: "benefits.support247Title", descriptionKey: "benefits.support247Desc" },
    { icon: DollarSign, titleKey: "benefits.transparentPricingTitle", descriptionKey: "benefits.transparentPricingDesc" },
];
// FIM DOS MOCKS
// -------------------------------------------------------------------

// Variáveis Globais para Autocomplete
declare global {
    interface Window {
        google: any;
    }
}
const MADEIRA_BOUNDS = {
    south: 32.3, west: -17.5, north: 33.2, east: -16.0,
};

// Mapeamento dos nomes dos ícones (strings) para os componentes reais
const IconMap = {
    Home: Home, ArrowRight: ArrowRight, ArrowLeft: ArrowLeft, Car: Car, MapPin: MapPin, 
    ChevronDown: ChevronDown, CheckCircle: CheckCircle, Calendar: Calendar, Clock: Clock, 
    Luggage: Luggage, Shield: Shield, User: User, Briefcase: Briefcase, X: X, 
    Award: Award, DollarSign: DollarSign, Users: Users, Plane: Plane, Star: Star, 
    MessageSquare: MessageSquare, Tag: Tag, Map: Map, Loader2: Loader2
};

// --- FUNÇÃO ADAPTADORA: Transforma a API para o formato do Componente ---
const adaptServiceData = (apiService: any) => {
    // 1. Determina o preço mais baixo
    const availableFleets = apiService.fleets.filter((f: any) => f.status === 'available' && f.is_active);
    
    const bestFleet = availableFleets.reduce((prev: any, current: any) => {
        const prevPrice = prev.base_price_per_hour || Infinity;
        const currentPrice = current.base_price_per_hour || Infinity;
        return (prevPrice < currentPrice) ? prev : current;
    }, availableFleets[0] || {});

    // Lógica para determinar ícone, categoria e detalhes
    let iconName = 'Car';
    let categoryName = "Geral";
    let defaultHighlights = [
        { icon: 'Award', text: 'Motorista Privado e Discreto' },
        { icon: 'Shield', text: 'Seguro de Responsabilidade Civil' },
    ];
    let defaultIdealFor = ['Clientes de Luxo', 'Viagens Longas'];
    let descriptionSuffix = " Reserve com a certeza do veículo de luxo e do serviço de excelência.";

    const ptName = (apiService.name.pt || '').toLowerCase(); 

    if (ptName.includes('aeroporto') || ptName.includes('transfer') || ptName.includes('airport')) {
        iconName = 'Plane'; categoryName = 'Viagem';
        defaultHighlights = [ { icon: 'Calendar', text: 'Monitorização de voo em tempo real' }, { icon: 'Luggage', text: 'Assistência completa com bagagem' }, { icon: 'Clock', text: 'Esperas incluídas após a aterragem' }, ];
        defaultIdealFor = ['Viajantes a Negócios', 'Famílias', 'Turistas', 'Eventos'];
        descriptionSuffix = " Chegue ao seu destino sem stress. Serviço porta-a-porta, monitorização de voo e assistência com bagagem.";
    } else if (ptName.includes('executivo') || ptName.includes('negócios') || ptName.includes('executive')) {
        iconName = 'Briefcase'; categoryName = 'Negócios';
        defaultHighlights = [ { icon: 'Award', text: 'Motoristas com formação em protocolo' }, { icon: 'Briefcase', text: 'Wi-Fi e bebidas a bordo' }, { icon: 'Shield', text: 'Máxima discrição e privacidade' }, ];
        defaultIdealFor = ['CEOs e Diretores', 'Reuniões Corporativas', 'Roadshows'];
        descriptionSuffix = " Serviço de transporte premium e discreto, ideal para reuniões, eventos corporativos e deslocamento de executivos.";
    } else if (ptName.includes('hora') || ptName.includes('charter') || ptName.includes('hourly')) {
        iconName = 'Clock'; categoryName = 'Flexibilidade';
        defaultHighlights = [ { icon: 'Map', text: 'Paragens ilimitadas e flexibilidade total' }, { icon: 'Clock', text: 'Reserva mínima de 3 horas' }, { icon: 'User', text: 'Motorista dedicado durante o período' }, ];
        defaultIdealFor = ['City Tours e Turismo', 'Compras', 'Múltiplos Destinos'];
        descriptionSuffix = " Total flexibilidade para múltiplos destinos ou esperas. Reserve o seu motorista por horas, com total discrição.";
    } else if (ptName.includes('passeios') || ptName.includes('tour') || ptName.includes('tours')) {
        iconName = 'Map'; categoryName = 'Turismo';
        defaultHighlights = [ { icon: 'MapPin', text: 'Roteiro personalizado e flexível' }, { icon: 'Clock', text: 'Motorista dedicado por todo o percurso' }, { icon: 'Star', text: 'Conhecimento local do motorista' }, ];
        defaultIdealFor = ['Turistas', 'Exploração da Cidade', 'Grupos Pequenos'];
        descriptionSuffix = " Descubra os melhores pontos de interesse com o conforto e o luxo de um veículo privado e motorista experiente.";
    } else if (ptName.includes('casamentos') || ptName.includes('wedding') || ptName.includes('eventos') || ptName.includes('special events')) {
        iconName = 'Award'; categoryName = 'Eventos';
        defaultHighlights = [ { icon: 'Award', text: 'Veículos de Alta Gama' }, { icon: 'Shield', text: 'Serviço de Motorista Premium' }, { icon: 'Luggage', text: 'Logística de Convidados Coordenada' }, ];
        defaultIdealFor = ['Noivos', 'Organização de Eventos', 'Convidados VIP'];
        descriptionSuffix = " A elegância e pontualidade que o seu dia especial merece. Serviço dedicado para casamentos, galas e grandes eventos.";
    } 

    return {
        id: apiService.id, icon: iconName,
        title: apiService.name.pt, 
        category: categoryName,
        description: apiService.description.pt, 
        image: apiService.image_url,
        details: {
            highlights: defaultHighlights,
            descriptionLong: (apiService.description.pt || "Serviço premium.") + descriptionSuffix,
            idealFor: defaultIdealFor,
            priceExample: bestFleet.base_price_per_hour 
                ? `Desde ${parseFloat(bestFleet.base_price_per_hour).toFixed(2)}€/hora` 
                : 'Preço sob consulta (Frota Indisponível)'
        }
    };
};

// -------------------------------------------------------------------
// 🎯 INTERFACE DO FORMULÁRIO RÁPIDO
// -------------------------------------------------------------------
interface QuickBookingProps {
    t: (key: string) => string; 
    onSubmit: (e: React.FormEvent) => void;
    data: { pickup: string; dropoff: string; service: string; date: string; time: string; passengers: number }; 
    setData: React.Dispatch<React.SetStateAction<any>>;
    servicesList: any[];
    isFixedService?: boolean; // Para o detalhe, o serviço é fixo e visível
    isCompact?: boolean; // Para layout lateral na listagem
    isMobileModal?: boolean; // Para o modal móvel, se necessário um layout extra
    pickupRef: React.RefObject<HTMLInputElement>;
    dropoffRef: React.RefObject<HTMLInputElement>;
    handleLocateMe: () => void; // NOVO: Adicionado para Geolocalização
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    error: string | null;
}


// --- COMPONENTE: FORMULÁRIO DE RESERVA REUTILIZÁVEL (AJUSTADO PARA COMPACTO) ---
const QuickBookingFormContent: React.FC<QuickBookingProps> = ({ 
    t, onSubmit, data, setData, servicesList, isFixedService = false, isCompact = false, isMobileModal = false,
    pickupRef, dropoffRef, handleLocateMe, setError, error
}) => {
    
    // Ajusta classes para o layout compacto
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-sm";
    // O modal móvel usa sempre o grid completo (não-compacto)
    const gridCols = (isCompact && !isMobileModal) ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-2';
    const iconColor = "text-gray-400";
    
    return (
        <form onSubmit={onSubmit} className="space-y-3">
            
            {/* CAMPO DE SELEÇÃO DE SERVIÇO */}
            <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <select
                    id="service-select"
                    name="service"
                    value={data.service}
                    onChange={(e) => setData(prev => ({ ...prev, service: e.target.value }))}
                    className={`${inputClasses} appearance-none pr-10 pl-9 cursor-pointer ${isFixedService ? 'opacity-80' : ''}`}
                    required
                    disabled={isFixedService || servicesList.length === 0}
                >
                    <option value="" disabled>{t('booking.selectService') || 'Selecione um Serviço'}</option>
                    {servicesList.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.title}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Seletor de localizações com mapa */}
            <LocationPickerField
                pickup={data.pickup}
                dropoff={data.dropoff}
                onConfirm={(pickup, dropoff) => {
                    setData(prev => ({ ...prev, pickup, dropoff }));
                    setError(null);
                }}
            />
            
            <div className={`grid ${gridCols}`}>
                {/* DATE */}
                <input
                    type="date"
                    name="date"
                    value={data.date}
                    onChange={(e) => setData(prev => ({ ...prev, date: e.target.value }))}
                    className={inputClasses}
                    aria-label={t('booking.date') || 'Data'}
                    required
                />
                
                {/* TIME */}
                <input
                    type="time"
                    name="time"
                    value={data.time}
                    onChange={(e) => setData(prev => ({ ...prev, time: e.target.value }))}
                    className={inputClasses}
                    aria-label={t('booking.time') || 'Hora'}
                    required
                />
                
                {/* PASSENGERS (Aparece em todos os layouts exceto no layout compacto da sidebar) */}
                {(!isCompact || isMobileModal) && (
                    <div className="relative">
                        <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                        <input
                            type="number"
                            name="passengers"
                            min="1"
                            max="7"
                            placeholder={t('booking.passengers') || 'Pax'}
                            value={data.passengers}
                            onChange={(e) => setData(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                            className={`${inputClasses} pl-9`}
                            required
                        />
                    </div>
                )}
            </div>
            
            {error && (
                <p className="text-sm text-red-500 font-medium flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}

            <button 
                type="submit"
                disabled={servicesList.length === 0}
                className="w-full bg-gold text-gray-900 px-4 py-3 rounded-lg font-bold text-md hover:bg-yellow-400 shadow-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                <span>{t('fleetPage.viewPriceAndBook') || 'Ver Preço e Reservar'}</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    );
};


// --- COMPONENTE: MODAL/BARRA DE RESERVA FIXA (MOBILE) ---
// --- COMPONENTE: MODAL/BARRA DE RESERVA FIXA (MOBILE) ---
const MobileBookingBar: React.FC<{ 
    t: (key: string) => string; 
    onNavigateToBooking: () => void; // <--- NOVA PROP
    // Props removidas: handleQuickReserve, quickReserveData, setQuickReserveData, servicesList, pickupRef, dropoffRef, handleLocateMe, setError, error
}> = ({ 
    t, onNavigateToBooking // <--- ADICIONAR NOVA PROP
}) => {
    
    // Lógica do modal e estados removidos

    return (
        <>
            {/* 1. BARRA INFERIOR FIXA (O BOTÃO QUE APARECE NO ECRÃ) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gold z-50 shadow-2xl">
                <button
                    onClick={onNavigateToBooking} // <--- ALTERADO: Redireciona para /booking
                    className="w-full bg-gold text-gray-900 py-3 font-extrabold text-lg flex items-center justify-center space-x-2 hover:bg-yellow-400 transition-colors"
                    aria-label={t('fleetPage.reserveNowBtn') || 'Reservar Agora'}
                >
                    <Briefcase className="w-5 h-5" />
                    <span>{t('fleetPage.reserveNowBtn') || 'Reservar Agora'}</span>
                </button>
            </div>
            {/* O MODAL DE RESERVA FOI REMOVIDO */}
        </>
    );
};


// --- COMPONENTE: DETALHES DO SERVIÇO (Mantém layout 2/3 + 1/3) ---
const ServiceDetailComponent = ({ t, service, onBack, handleQuickReserve, quickReserveData, setQuickReserveData, allServices, pickupRef, dropoffRef, handleLocateMe, error, setError }) => {
    
    if (!service) {
        // ... (código de not found mantido) ...
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold text-gold mb-4">{t('servicesPage.notFound') || 'Serviço Não Encontrado'}</h1>
                <button onClick={onBack} className="inline-flex items-center bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t('servicesPage.backToServices') || 'Voltar aos Serviços'}
                </button>
            </div>
        );
    }

    const ServiceIcon = IconMap[service.icon] || Plane; 

    return (
       // Espaçamento superior alterado para pt-32
       <div className="container mx-auto px-4 pt-32 pb-16"> 
            
            {/* Botão de Volta e Breadcrumb */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-gold hover:text-yellow-400 transition-colors font-semibold text-lg"
                    aria-label={t('servicesPage.backToServices') || 'Voltar aos Serviços'}
                >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    {t('servicesPage.backToServices') || 'Voltar aos Serviços'}
                </button>
                <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                    <span className="text-gray-600">{t('servicesPage.servicesBreadcrumb') || 'Serviços'}</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-white font-medium">{service.title}</span>
                </nav>
            </div>
            
            {/* LAYOUT 2/3 (Conteúdo) + 1/3 (Sidebar/Formulário) */}
            <div className="grid lg:grid-cols-3 gap-12">
                
                {/* Coluna de Conteúdo Principal (2/3) */}
                <div className="lg:col-span-2 space-y-12">
                    
                    <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                        <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-auto object-cover max-h-[450px]"
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/1200x450/18181b/EAB308?text=${service.title.replace(/\s/g, '+')}` }}
                        />
                    </div>

                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
                        <h2 className="text-3xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-3">
                            <ServiceIcon className="w-7 h-7 mr-3 text-gold" />
                            {t('servicesPage.detailsTitle') || 'Detalhes do Serviço'}
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-lg mb-6">
                            {service.details.descriptionLong}
                        </p>
                        {/* Destaques (Highlights) */}
                        <h3 className="text-xl font-semibold text-gold mb-4 mt-6 uppercase tracking-wider">
                            {t('servicesPage.featuresTitle') || 'Destaques'}
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {service.details.highlights.map((item, index) => {
                                const HighlightIcon = IconMap[item.icon] || CheckCircle;
                                return (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-950 rounded-lg border border-gray-800">
                                        <HighlightIcon className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                                        <span className="text-gray-300 text-sm font-medium">{item.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Ideal Para */}
                        <h3 className="text-xl font-semibold text-gold mb-4 mt-10 uppercase tracking-wider">
                            {t('servicesPage.idealForTitle') || 'Ideal Para'}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {service.details.idealFor.map((target, index) => (
                                <span key={index} className="bg-gold/10 text-gold px-4 py-1 rounded-full text-sm font-medium border border-gold/30">
                                    {target}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA de Contato Final */}
                    <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg border-l-4 border-gold">
                         <h3 className="text-2xl font-bold text-white mb-2">
                            {t('servicesPage.budget') || 'Solicitar Orçamento Personalizado'}
                         </h3>
                         <p className="text-gray-400 mb-6">
                             {t('servicesPage.budgetText') || 'Entre em contato connosco para soluções à medida.'}
                         </p>
                        <Link to="/contact" className="inline-flex items-center bg-gold text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-md">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            {t('servicesPage.contactUs') || 'Contate-nos'}
                        </Link>
                    </div>

                </div>
                
                {/* Sidebar / Formulário de Reserva Rápida (1/3) */}
                <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-4 h-fit">
                    
                    <div id="service-quick-booking" className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gold/20">
                        <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                            <Car className="w-6 h-6 mr-2" /> 
                            {t('fleetPage.quickBookTitle') || 'Reserve Agora'}
                        </h3>
                        
                        <QuickBookingFormContent 
                            t={t}
                            onSubmit={handleQuickReserve}
                            data={quickReserveData}
                            setData={setQuickReserveData}
                            servicesList={allServices} 
                            isFixedService={true} // Serviço fixo no formulário
                            isCompact={false} // Mantém o layout completo na sidebar
                            pickupRef={pickupRef}
                            dropoffRef={dropoffRef}
                            handleLocateMe={handleLocateMe}
                            error={error}
                            setError={setError}
                        />

                        {service.details.priceExample && (
                            <p className="text-center text-gray-400 text-sm mt-4 pt-4 border-t border-gray-800">
                                <Tag className="w-4 h-4 inline mr-1 text-gold" /> 
                                {service.details.priceExample}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE: CARTÃO DE SERVIÇO (Mantido) ---
const ServiceCard = ({ service, onViewDetail, t }) => {
    const IconComponent = IconMap[service.icon] || Car;

    return (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out border border-gray-800 hover:border-gold/50">
            <div className="relative">
                <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/18181b/EAB308?text=${service.title.replace(/\s/g, '+')}` }}
                />
                <div className="absolute top-4 right-4 bg-gold text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {service.category}
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center mb-3">
                    <IconComponent className="w-6 h-6 text-gold mr-3 flex-shrink-0" />
                    <h3 className="text-xl font-bold text-white truncate">{service.title}</h3>
                </div>
                <p className="text-gray-400 mb-6 text-sm line-clamp-3">
                    {service.description}
                </p>
                <button
                    onClick={() => onViewDetail(service.id)}
                    className="inline-flex items-center text-gold font-semibold hover:text-yellow-400 transition-colors group"
                >
                    <span>{t('servicesPage.learnMore') || 'Saber Mais'}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE: CARTÃO DE BENEFÍCIO (Mantido) ---
const BenefitCard = ({ benefit, t }) => {
    const IconComponent = benefit.icon;
    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-center border border-gray-800 hover:border-gold/50 transition-colors">
            <IconComponent className="w-10 h-10 text-gold mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{t(benefit.titleKey)}</h3>
            <p className="text-gray-400 text-sm">{t(benefit.descriptionKey)}</p>
        </div>
    );
};

// --- COMPONENTE: CTA PARA CONTACTO (NOVO) ---
const ContactCTA = ({ t }) => (
    <div className="bg-gold/10 border-t border-b border-gold py-16">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-4">
                {t('contactCTA.title') || 'Necessita de um Serviço Personalizado?'}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                {t('contactCTA.subtitle') || 'A nossa equipa de especialistas está disponível 24/7 para criar a solução de transporte perfeita.'}
            </p>
            <Link to="/contact" className="inline-flex items-center bg-gold text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-colors shadow-xl transform hover:scale-105">
                <MessageSquare className="w-6 h-6 mr-3" />
                {t('contactCTA.button') || 'Falar com um Especialista'}
            </Link>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL: SERVICES (COM NOVO LAYOUT) ---
const Services = () => {

    const { t } = useLanguage();
    const navigate = useNavigate();

    useSEO({
      title: 'Serviços de Transfer Madeira | Aeroporto, Passeios Privados e Transporte Executivo',
      description: 'Todos os serviços de transfer e transporte privado na Madeira: transfer do aeroporto do Funchal, passeios pela ilha, transporte executivo e transfers para casamentos. Reserve online.',
      keywords: 'serviços transfer madeira, transfer aeroporto funchal, passeios privados madeira, transporte executivo madeira, transfer casamento madeira, excursões madeira',
      url: '/services',
    });
    
    // ESTADOS
    const [fetchedServices, setFetchedServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeServiceId, setActiveServiceId] = useState<string | null>(null); 

    // ESTADO DO FORMULÁRIO DE RESERVA RÁPIDA
    const [quickReserveData, setQuickReserveData] = useState({
        pickup: '',
        dropoff: '',
        service: '', 
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        passengers: 1
    });
    const [formError, setFormError] = useState<string | null>(null);
    
    // REFS PARA O GOOGLE AUTOCOMPLETE
    const pickupRef = useRef<HTMLInputElement>(null);
    const dropoffRef = useRef<HTMLInputElement>(null);

    // =========================================================================
    // 🎯 LÓGICA DO AUTOCOMPLETE 
    // =========================================================================
    useEffect(() => {
        
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            // Se a biblioteca não estiver carregada (ex: falta do script no index.html), o Autocomplete não funcionará.
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
        
        const initializeAutocomplete = (ref: React.RefObject<HTMLInputElement>, fieldName: 'pickup' | 'dropoff') => {
            if (ref.current) {
                const autocomplete = new window.google.maps.places.Autocomplete(ref.current, options);
                
                // Listener para quando o utilizador SELECIONA um endereço
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) {
                        setQuickReserveData(prev => ({ ...prev, [fieldName]: place.formatted_address }));
                        setFormError(null);
                    } else {
                        // Caso especial: o utilizador digitou e saiu sem selecionar a sugestão
                        setQuickReserveData(prev => ({ ...prev, [fieldName]: ref.current!.value || '' }));
                    }
                });

                // NOVO: Adiciona um evento 'blur' para garantir a sincronização final
                const handleBlur = () => {
                    if (ref.current) {
                        setQuickReserveData(prev => ({ ...prev, [fieldName]: ref.current!.value }));
                    }
                };

                ref.current.addEventListener('blur', handleBlur);
                
                // Função de limpeza
                return () => {
                    if (ref.current) {
                        ref.current.removeEventListener('blur', handleBlur);
                    }
                };
            }
        };
        
        // Chamadas para inicializar os dois campos e armazenar as funções de limpeza
        const cleanupPickup = initializeAutocomplete(pickupRef, 'pickup');
        const cleanupDropoff = initializeAutocomplete(dropoffRef, 'dropoff');

        // Retorna a função de limpeza que executa ambas as funções
        return () => {
            if (cleanupPickup) cleanupPickup();
            if (cleanupDropoff) cleanupDropoff();
        };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 


    // =========================================================================
    // FUNÇÃO PARA GEOLOCALIZAÇÃO (ADAPTADA DO COMPONENTE FROTA)
    // =========================================================================
    const handleLocateMe = () => {
        if (navigator.geolocation && window.google && window.google.maps) {
            
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

                            // 1. Atualiza o input via ref (para visualização imediata)
                            if (pickupRef.current) {
                                pickupRef.current.value = address;
                            }
                            
                            // 2. Atualiza o estado do React
                            setQuickReserveData(prev => ({ ...prev, pickup: address }));
                            setFormError(null);

                        } else {
                            setFormError(t('booking.geoAddressError') || 'Não foi possível converter a localização em endereço.');
                        }
                    });
                },
                (err) => {
                    console.error("Erro de geolocalização: ", err);
                    setFormError(t('booking.geoPermissionError') || 'A permissão de localização foi negada ou ocorreu um erro.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setFormError(t('booking.geoBrowserError') || 'O seu navegador não suporta geolocalização ou a API do Google Maps não está carregada.');
        }
    };


    // --- HOOK PARA CARREGAR DADOS DA API REAL ---
    useEffect(() => {
        const loadServices = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/services`); 
                if (!response.ok) { throw new Error(`Erro de rede: ${response.status} ${response.statusText}`); }
                const result = await response.json(); 
                const apiServices = result.data; 

                if (!Array.isArray(apiServices)) { throw new Error("Formato de dados da API inválido: 'data' não é um array."); }

                const adaptedServices = apiServices.map(adaptServiceData);
                setFetchedServices(adaptedServices);

                if (adaptedServices.length > 0 && !quickReserveData.service) {
                     setQuickReserveData(prev => ({ ...prev, service: adaptedServices[0].id }));
                }
            } catch (error) {
                console.error("Falha ao carregar serviços da API:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        loadServices(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Obtém os detalhes do serviço ativo
    const activeService = useMemo(() => {
        if (!activeServiceId) return null;
        return fetchedServices.find(s => s.id === activeServiceId);
    }, [activeServiceId, fetchedServices]);

    // --- FUNÇÕES DE HANDLER ---

    const handleViewDetail = (id: string) => {
        const serviceToView = fetchedServices.find(s => s.id === id);
        if (serviceToView) {
             setQuickReserveData(prev => ({ 
                 ...prev, 
                 service: id,
             }));
             setFormError(null);
             setActiveServiceId(id);
             // Scroll para o topo da página para ver o detalhe
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handleBackToServices = () => {
        setActiveServiceId(null);
        setFormError(null); 
    };

    // =========================================================================
    // 🎯 FUNÇÃO DE SUBMISSÃO (NAVEGA PARA /booking)
    // =========================================================================
    const handleQuickReserveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const { pickup, dropoff, service, date, time, passengers } = quickReserveData;
        
        if (!pickup.trim() || !dropoff.trim() || !service) {
            setFormError(t('servicesPage.formError') || 'Por favor, preencha o Serviço, a Recolha e o Destino.');
            return;
        }

        setFormError(null);
        
        const queryParams = new URLSearchParams();
        queryParams.append('service', encodeURIComponent(service));
        queryParams.append('pickup', encodeURIComponent(pickup));
        queryParams.append('dropoff', encodeURIComponent(dropoff));
        queryParams.append('date', date);
        queryParams.append('time', time);
        queryParams.append('passengers', String(passengers));
        
        // Navega para a página de Booking com os parâmetros preenchidos
        navigate(`/booking?${queryParams.toString()}`);
    };
    
    // --- RENDERIZAÇÃO CONDICIONAL (VISTA DE DETALHE) ---

    if (activeServiceId) {
        return (
            <div className="min-h-screen bg-gray-950 text-white pb-20 lg:pb-0">
                <ServiceDetailComponent 
                    t={t}
                    service={activeService}
                    onBack={handleBackToServices}
                    handleQuickReserve={handleQuickReserveSubmit}
                    quickReserveData={quickReserveData}
                    setQuickReserveData={setQuickReserveData}
                    allServices={fetchedServices}
                    pickupRef={pickupRef} 
                    dropoffRef={dropoffRef}
                    handleLocateMe={handleLocateMe}
                    error={formError}
                    setError={setFormError}
                />
                {/* MODAL MÓVEL DE RESERVA (NOVO) */}
                <MobileBookingBar 
                    t={t} 
                    handleQuickReserve={handleQuickReserveSubmit} 
                    quickReserveData={quickReserveData}
                    setQuickReserveData={setQuickReserveData}
                    servicesList={fetchedServices}
                    pickupRef={pickupRef} 
                    dropoffRef={dropoffRef}
                    handleLocateMe={handleLocateMe}
                    error={formError}
                    setError={setFormError}
                />
            </div>
        );
    }

    // --- RENDERIZAÇÃO PRINCIPAL (VISTA DE LISTAGEM) ---

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20 lg:pb-0">
            
            {/* Header / Intro */}
            <div className="bg-gray-900 py-16 pt-32 border-b border-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gold uppercase font-semibold tracking-widest mb-2">{t('servicesPage.sectionCommitment') || 'Compromisso com a Excelência'}</p>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                        {t('servicesPage.title') || 'O Seu Serviço de Transporte de Luxo'}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        {t('servicesPage.subtitle') || 'Descubra a nossa gama de serviços premium, desenhados para todas as suas necessidades de transporte.'}
                    </p>
                </div>
            </div>
            
            {/* NOVO LAYOUT: SERVIÇOS (2/3) + RESERVA RÁPIDA (1/3) */}
            <div className="container mx-auto px-4 pt-32 pb-16">
                
                <h2 className="text-4xl font-extrabold text-white text-center mb-10">{t('servicesPage.sectionServicesTitle') || 'Os Nossos Serviços Mais Procurados'}</h2>
                
                <div className="grid lg:grid-cols-3 gap-10">
                    
                    {/* Coluna Principal: Serviços (2/3) */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {isLoading && (
                            <div className="flex justify-center items-center h-40 col-span-full">
                                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                                <p className="ml-3 text-lg">{t('loading') || 'A Carregar Serviços...'}</p>
                            </div>
                        )}

                        {isError && !isLoading && (
                            <p className="text-center text-xl text-red-500 col-span-full">{t('servicesPage.fetchError') || 'Não foi possível carregar os serviços. Tente novamente mais tarde.'}</p>
                        )}

                        {!isLoading && !isError && fetchedServices.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-8">
                                {fetchedServices.map(service => (
                                    <ServiceCard 
                                        key={service.id}
                                        service={service}
                                        onViewDetail={handleViewDetail}
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Secção de Benefícios */}
                        <div className="mt-16 pt-8 border-t border-gray-800">
                            <h3 className="text-2xl font-bold text-white mb-6">{t('servicesPage.benefitsTitle') || 'Porquê Escolher a Nossa Empresa?'}</h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {benefits.map((benefit, index) => (
                                    <BenefitCard key={index} benefit={benefit} t={t} />
                                ))}
                            </div>
                        </div>

                    </div>
                    
                    {/* Sidebar: Reserva Rápida (1/3) */}
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-4 h-fit">
                        
                        <div id="quick-booking-section" className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gold/20">
                            <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                                <Calendar className="w-6 h-6 mr-2" /> 
                                {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
                            </h3>
                            
                            <QuickBookingFormContent 
                                t={t}
                                onSubmit={handleQuickReserveSubmit}
                                data={quickReserveData}
                                setData={setQuickReserveData}
                                servicesList={fetchedServices}
                                isFixedService={false}
                                isCompact={true} // Torna o formulário mais compacto
                                pickupRef={pickupRef} 
                                dropoffRef={dropoffRef}
                                handleLocateMe={handleLocateMe}
                                error={formError}
                                setError={setFormError}
                            />
                        </div>
                        
                        {/* Secção de Contato Rápido (Sidebar) */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">
                                {t('servicesPage.supportTitle') || 'Suporte 24/7'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                {t('servicesPage.supportText') || 'Tem dúvidas? Fale com a nossa equipa a qualquer hora.'}
                            </p>
                            <Link to="/contact" className="w-full inline-flex items-center justify-center bg-gray-800 text-gold px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors text-sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t('servicesPage.contact247') || 'Contatar Suporte'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* NOVA SECÇÃO: CTA de Contacto */}
            <ContactCTA t={t} />
            
            {/* MODAL MÓVEL DE RESERVA (NOVO) */}
            <MobileBookingBar 
                t={t}
                onNavigateToBooking={() => navigate('/booking')}
            />

        </div>
    );
};

export default Services;