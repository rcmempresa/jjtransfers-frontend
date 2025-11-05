import React, { useState, useMemo } from 'react';

// Importa ícones da Lucide-React
import { 
    Home, ArrowRight, Car, MapPin, ChevronDown, CheckCircle, 
    Calendar, Clock, Luggage, Shield, User, Briefcase, X, 
    Award, DollarSign, Users, Plane, Star
} from 'lucide-react'; 

// --- MOCK DE DEPENDÊNCIAS PARA COMPILAÇÃO EM FICHEIRO ÚNICO ---

// MOCK: Definição de Link (Substitui react-router-dom Link)
const Link = ({ to, children, className }) => (
    <a href={to} className={className} onClick={(e) => { e.preventDefault(); console.log(`Navigating to: ${to}`); }}>
        {children}
    </a>
);

// MOCK: Simula a obtenção de parâmetros do URL.
// Para este exemplo, definimos um ID fixo para o serviço (ex: 'airport-transfer').
// Se mudar o ID aqui, verá os detalhes do serviço correspondente, se existir.
const MOCK_SERVICE_ID = 'airport-transfer'; 
const useParams = () => ({ serviceId: MOCK_SERVICE_ID });


// MOCK: Definição de useLanguage (Substitui ../hooks/useLanguage)
const translations = {
    pt: {
        servicesPage: {
            serviceDetails: 'Detalhes do Serviço',
            detailsTitle: 'Detalhes do Serviço',
            featuresTitle: 'Características Principais',
            idealForTitle: 'Ideal Para',
            notFound: 'Serviço Não Encontrado',
            quickBookTitle: 'Reserve o Seu Serviço',
            quickBookBtn: 'Reservar Agora',
            contactUs: 'Fale Connosco para Orçamento Personalizado',
            formError: 'Por favor, preencha todos os campos obrigatórios.',
        },
        fleetPage: {
             homeBreadcrumb: 'Início',
             servicesBreadcrumb: 'Serviços',
             reserveNowBtn: 'Reservar Agora',
        },
        booking: {
            title: 'Reserva Rápida',
            subtitle: 'Calcule o preço e reserve em 3 passos.',
            pickupAddress: 'Endereço de Recolha',
            dropoffAddress: 'Endereço de Destino',
            date: 'Data',
            time: 'Hora',
            passengers: 'Passageiros',
            selectServicePlaceholder: 'Selecione o Serviço',
            viewPriceAndBook: 'Ver Preço e Reservar'
        }
    }
};

const useLanguage = () => {
    const lang = 'pt'; 
    const t = (key) => {
        const keys = key.split('.');
        let current = translations[lang];
        for (const k of keys) {
            if (current && current[k] !== undefined) {
                current = current[k];
            } else {
                return key.split('.').pop().replace(/([A-Z])/g, ' $1').trim();
            }
        }
        return current;
    };
    return { t };
};

// MOCK: Definição de services (Com detalhes expandidos)
const services = [
    {
        id: 'airport-transfer',
        icon: 'Plane',
        title: 'Transfer Aeroporto',
        category: 'Viagem',
        description: 'Chegue ao seu destino sem stress. Serviço porta-a-porta, monitorização de voo e assistência com bagagem.',
        image: 'https://images.pexels.com/photos/1036324/pexels-photo-1036324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        details: {
            highlights: [
                { icon: 'Calendar', text: 'Monitorização de voo em tempo real' },
                { icon: 'Clock', text: '60 minutos de espera gratuita (transfer de chegada)' },
                { icon: 'Luggage', text: 'Assistência completa com bagagem' },
                { icon: 'Shield', text: 'Rota otimizada para pontualidade e segurança' },
            ],
            descriptionLong: 'O nosso serviço de Transfer Aeroporto garante uma transição suave e confortável desde o momento em que aterra até ao seu destino final. Os motoristas esperam-no com uma placa personalizada no ponto de recolha e cuidam de toda a logística, permitindo-lhe relaxar após o voo. Este serviço é ideal tanto para viagens de negócios como para férias, com tarifa fixa e previsível. Cobrimos todos os principais aeroportos regionais e internacionais.',
            idealFor: ['Viajantes a Negócios', 'Famílias com crianças', 'Grupos com muita bagagem', 'Turistas'],
            priceExample: 'Desde 45€ (Zona Centro)'
        }
    },
    {
        id: 'executive-transport',
        icon: 'Briefcase',
        title: 'Transporte Executivo',
        category: 'Negócios',
        description: 'Carros de luxo e motoristas discretos para reuniões, eventos corporativos e deslocações de negócios.',
        image: 'https://images.pexels.com/photos/1036319/pexels-photo-1036319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        details: {
            highlights: [
                { icon: 'Award', text: 'Motoristas com formação em discrição e protocolo' },
                { icon: 'Star', text: 'Veículos de topo de gama (Classe S, BMW Série 7, etc.)' },
                { icon: 'Clock', text: 'Disponibilidade imediata para alterações de agenda' },
                { icon: 'Briefcase', text: 'Wi-Fi e bebidas a bordo' },
            ],
            descriptionLong: 'Focado em profissionais e líderes empresariais, o nosso Transporte Executivo oferece o máximo de conforto, privacidade e pontualidade. Garantimos que chega às suas reuniões ou conferências revigorado e a tempo. O motorista serve como seu assistente de viagem temporário, assegurando que o seu foco se mantém nos seus objetivos de negócio. Este serviço pode ser reservado por viagem ou à hora.',
            idealFor: ['CEOs e Diretores', 'Eventos Corporativos', 'Viagens de Múltiplas Reuniões'],
            priceExample: 'Desde 60€/hora'
        }
    },
    // Adicionar mais serviços aqui...
];

// Mapeamento dos nomes dos ícones (strings) para os componentes reais
const IconMap = {
    Plane: Plane,
    Briefcase: Briefcase,
    Calendar: Calendar,
    Clock: Clock,
    Luggage: Luggage,
    Shield: Shield,
    User: User,
    Award: Award,
    Star: Star,
    // Adicione mais ícones conforme necessário
};

// --- COMPONENTE DE FORMULÁRIO REUTILIZÁVEL PARA RESERVA RÁPIDA ---
const QuickBookingFormContent = ({ t, onSubmit, data, setData, isMobileModal = false, servicesList, isFixedService = false }) => {
    
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-gold focus:ring-1 focus:ring-gold transition-colors";
    
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            
            {/* CAMPO DE SELEÇÃO DE SERVIÇO */}
            <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <select
                    id={isMobileModal ? "service-mobile" : "service-desktop"}
                    name="service"
                    value={data.service}
                    onChange={(e) => setData(prev => ({ ...prev, service: e.target.value }))}
                    className={`${inputClasses} appearance-none pr-10 pl-10 cursor-pointer ${isFixedService ? 'opacity-80' : ''}`}
                    required
                    disabled={isFixedService} // Desabilita se o serviço for fixo (pré-selecionado)
                >
                    <option value="" disabled>{t('booking.selectServicePlaceholder') || 'Selecione o Serviço'}</option>
                    {servicesList.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.title}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* PICKUP */}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                    type="text"
                    name="pickup"
                    placeholder={t('booking.pickupAddress') || 'Endereço de Recolha'}
                    value={data.pickup}
                    onChange={(e) => setData(prev => ({ ...prev, pickup: e.target.value }))}
                    className={`${inputClasses} pl-10`}
                    required
                />
            </div>
            
            {/* DROPOFF */}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                    type="text"
                    name="dropoff"
                    placeholder={t('booking.dropoffAddress') || 'Endereço de Destino'}
                    value={data.dropoff}
                    onChange={(e) => setData(prev => ({ ...prev, dropoff: e.target.value }))}
                    className={`${inputClasses} pl-10`}
                    required
                />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
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
                {/* PASSENGERS */}
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    <input
                        type="number"
                        name="passengers"
                        min="1"
                        max="7"
                        placeholder={t('booking.passengers') || 'Pax'}
                        value={data.passengers}
                        onChange={(e) => setData(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                        className={`${inputClasses} pl-10`}
                        required
                    />
                </div>
            </div>
            
            <button 
                type="submit"
                className="w-full bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 shadow-lg flex items-center justify-center space-x-2 transition-colors"
            >
                <span>{t('booking.viewPriceAndBook') || 'Ver Preço e Reservar'}</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
    );
};


// --- COMPONENTE PRINCIPAL: DETALHES DO SERVIÇO ---
const ServiceDetail = () => {
    const { t } = useLanguage();
    const { serviceId } = useParams(); // Obtém o ID do serviço (mockado)
    
    // Encontra o serviço com base no ID
    const service = useMemo(() => {
        return services.find(s => s.id === serviceId);
    }, [serviceId]);

    // Estado para o formulário de reserva rápida, preenchendo o serviço automaticamente
    const [quickReserveData, setQuickReserveData] = useState({
        pickup: '',
        dropoff: '',
        service: service ? service.id : (services.length > 0 ? services[0].id : ''),
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        passengers: 1
    });

    const [isSubmitted, setIsSubmitted] = useState(false); // Estado para feedback de sucesso
    
    // LÓGICA DE SUBMISSÃO
    const handleQuickReserve = (e) => {
        e.preventDefault();

        const { pickup, dropoff, service: selectedService } = quickReserveData;

        if (!pickup || !dropoff || !selectedService) {
            console.error(t('servicesPage.formError'));
            return;
        }

        // Simulação de navegação ou cálculo de preço
        console.log("Reserva Rápida Submetida:", quickReserveData);
        
        // Simular sucesso e mostrar feedback
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000); 
    };

    // --- Tratamento de Serviço Não Encontrado ---
    if (!service) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 p-8 pt-32 text-center">
                <h1 className="text-4xl font-extrabold text-gold mb-4">{t('servicesPage.notFound') || 'Serviço Não Encontrado'}</h1>
                <p className="text-lg text-gray-400 mb-8">O serviço com o ID "{serviceId}" não foi localizado.</p>
                <Link to="/services" className="inline-flex items-center bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Voltar aos Serviços
                </Link>
            </div>
        );
    }

    const ServiceIcon = IconMap[service.icon] || Plane; 

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-16"> 
            <script src="https://cdn.tailwindcss.com"></script>
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                .text-gold { color: #EAB308; } 
                .bg-gold { background-color: #EAB308; }
                .border-gold { border-color: #EAB308; }
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(1); 
                    opacity: 0.8;
                    cursor: pointer;
                }
            `}</style>

            {/* 1. Header / Breadcrumbs */}
            <div className="bg-black py-16 pt-32 shadow-2xl border-b-4 border-gold">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-wider">
                        {service.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-6 font-light">{service.description}</p>
                    {/* Breadcrumbs */}
                    <nav className="flex items-center justify-center space-x-2 text-gold text-sm md:text-base">
                        <Home className="w-4 h-4" />
                        <Link to="/" className="hover:text-yellow-400 transition-colors font-semibold">
                            {t('fleetPage.homeBreadcrumb')}
                        </Link>
                        <span className="text-gray-600">/</span>
                        <Link to="/services" className="hover:text-yellow-400 transition-colors font-semibold">
                            {t('fleetPage.servicesBreadcrumb') || 'Serviços'}
                        </Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-400 font-medium">{service.title}</span>
                    </nav>
                </div>
            </div>

            {/* 2. Conteúdo Principal e Sidebar (Formulário) */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    
                    {/* Coluna de Conteúdo Principal (2/3 no Desktop) */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Imagem de Destaque */}
                        <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-auto object-cover max-h-[450px]"
                            />
                        </div>

                        {/* Detalhes e Descrição Longa */}
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
                                {t('servicesPage.featuresTitle') || 'Características Principais'}
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

                        {/* CTA de Contato Final (Mobile/Desktop) */}
                        <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg border-l-4 border-gold">
                             <h3 className="text-2xl font-bold text-white mb-2">
                                Orçamento Personalizado
                             </h3>
                             <p className="text-gray-400 mb-6">
                                 Se o seu pedido é complexo, a nossa equipa está pronta para criar uma solução à medida.
                             </p>
                            <Link to="/contact" className="inline-flex items-center bg-gold text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-md">
                                <MessageSquare className="w-5 h-5 mr-2" />
                                {t('servicesPage.contactUs') || 'Fale Connosco'}
                            </Link>
                        </div>

                    </div>
                    
                    {/* Sidebar / Formulário de Reserva Rápida (1/3 no Desktop) */}
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-4 h-fit">
                        
                        {/* Formulário de Reserva Rápida (Desktop Sticky) */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gold/20">
                            <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                                <Car className="w-6 h-6 mr-2" /> 
                                {t('servicesPage.quickBookTitle') || 'Reserve o Seu Serviço'}
                            </h3>
                            
                            {isSubmitted ? (
                                <div className="bg-green-600/20 text-green-300 p-4 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 mr-3" />
                                    <p className="font-semibold text-sm">Pedido de Reserva Recebido!</p>
                                </div>
                            ) : (
                                <QuickBookingFormContent 
                                    t={t}
                                    onSubmit={handleQuickReserve}
                                    data={quickReserveData}
                                    setData={setQuickReserveData}
                                    servicesList={services}
                                    isFixedService={true} // Marca como fixo para desabilitar o select
                                />
                            )}

                            {/* Exemplo de Preço (Se existir) */}
                            {service.details.priceExample && (
                                <p className="text-center text-gray-400 text-sm mt-4 pt-4 border-t border-gray-800">
                                    <Tag className="w-4 h-4 inline mr-1 text-gold" /> 
                                    {service.details.priceExample}
                                </p>
                            )}
                        </div>

                        {/* Secção de Contato Rápido (Se não estiver no CTA principal) */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">
                                Apoio ao Cliente
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Tem dúvidas sobre o Transfer Aeroporto? A nossa equipa está disponível 24/7.
                            </p>
                            <Link to="/contact" className="w-full inline-flex items-center justify-center bg-gray-800 text-gold px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors text-sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contato 24/7
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
