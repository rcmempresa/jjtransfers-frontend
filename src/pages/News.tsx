import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    Calendar, ArrowRight, ArrowLeft, Tag, Clock, Car, 
    X, Briefcase, MapPin, Map, Filter, Loader2, MessageSquare, 
    User
} from 'lucide-react';
// CORREÇÃO: Ajustar o path de importação para um nível acima
import { useLanguage } from '../hooks/useLanguage'; 

// =========================================================================
// TIPAGEM
// =========================================================================

// Tipagem para um Artigo de Notícia (Ajuste para o formato da sua API)
interface NewsArticle {
    id: string; 
    title: string;
    summary: string;
    content: string; 
    category: string;
    image: string;
    date: string; // Formato YYYY-MM-DD
    author: string;
    readTime: string;
}

// Reutilização das variáveis do Fleet para o Autocomplete/Booking
declare global {
    interface Window {
        google: any;
    }
}

const MADEIRA_BOUNDS = {
    south: 32.3, west: -17.5, north: 33.2, east: -16.0,
};

// =========================================================================
// INTERFACES E COMPONENTES REUTILIZADOS (Do seu Fleet.tsx)
// =========================================================================
interface QuickBookingProps {
    t: (key: string) => string; 
    onSubmit: (e: React.FormEvent) => void;
    data: { pickup: string; dropoff: string; date: string; time: string }; 
    setData: React.Dispatch<React.SetStateAction<any>>;
    isMobileModal?: boolean;
    pickupRef: React.RefObject<HTMLInputElement>;
    dropoffRef: React.RefObject<HTMLInputElement>;
    handleLocateMe: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    error: string | null;
}

// --- COMPONENTE DE FORMULÁRIO REUTILIZÁVEL PARA RESERVA RÁPIDA ---
const QuickBookingFormContent: React.FC<QuickBookingProps> = ({ 
    t, onSubmit, data, setData, isMobileModal = false, 
    pickupRef, dropoffRef, handleLocateMe, setError, error
}) => {
    
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-gold focus:ring-1 focus:ring-gold transition-colors";
    const iconColor = "text-gray-400";

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            
            <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                <input
                    type="text"
                    placeholder={t('booking.pickupAddress') || 'Endereço de Recolha'}
                    ref={pickupRef}
                    onChange={() => setError(null)} 
                    className={`${inputClasses} pl-12 pr-12`}
                    required
                />
                <button
                    type="button"
                    onClick={handleLocateMe}
                    title={t('booking.useCurrentLocation') || 'Usar Localização Atual'}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gold transition-colors"
                >
                    <Map className="w-5 h-5" />
                </button>
            </div>
            
            <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`} />
                <input
                    type="text"
                    placeholder={t('booking.dropoffAddress') || 'Endereço de Destino'}
                    ref={dropoffRef}
                    onChange={() => setError(null)} 
                    className={`${inputClasses} pl-12`}
                    required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
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

            <button 
                type="submit"
                className="w-full bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 shadow-lg flex items-center justify-center space-x-2 transition-colors"
            >
                <span>{t('fleetPage.continueToBooking') || 'Continuar para Reserva'}</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
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
            
            <QuickBookingFormContent 
                t={t}
                onSubmit={(e) => {
                    handleQuickReserve(e);
                    setIsOpen(false);
                }}
                data={quickReserveData}
                setData={setQuickReserveData}
                isMobileModal={true}
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


// =========================================================================
// 🎯 COMPONENTES ESPECÍFICOS DA PÁGINA NEWS
// =========================================================================

// --- Componente: Cartão de Notícia ---
const NewsCard: React.FC<{ article: NewsArticle; navigate: (id: string) => void }> = ({ article, navigate }) => (
    <div 
        className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 ease-in-out cursor-pointer group border border-gray-800 hover:border-gold/50"
        onClick={() => navigate(article.id)}
    >
        <div className="relative h-56">
            <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400/18181b/EAB308?text=Sem+Imagem'; }}
            />
            <div className="absolute top-3 left-3 bg-gold text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {article.category}
            </div>
        </div>
        <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors line-clamp-2">{article.title}</h3>
            <p className="text-gray-400 mb-4 text-sm line-clamp-3">{article.summary}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-3">
                <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gold" />
                    <span>{article.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gold" />
                    <span>{article.readTime}</span>
                </span>
            </div>
        </div>
    </div>
);

// --- Componente: Detalhe do Artigo ---
const ArticleDetail: React.FC<{ article: NewsArticle; onBack: () => void; t: (key: string) => string }> = ({ article, onBack, t }) => (
    <div className="container mx-auto px-4 pt-32 pb-16"> 
        
        {/* Botão de Volta */}
        <div className="mb-8 border-b border-gray-800 pb-4">
            <button
                onClick={onBack}
                className="flex items-center text-gold hover:text-yellow-400 transition-colors font-semibold text-lg"
                aria-label={t('newsPage.backToNews') || 'Voltar às Notícias'}
            >
                <ArrowLeft className="w-5 h-5 mr-3" />
                {t('newsPage.backToNews') || 'Voltar às Notícias'}
            </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Conteúdo Principal (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{article.title}</h1>
                
                {/* Metadados */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gold" />
                        <span className="font-medium">{t('newsPage.category') || 'Categoria'}: {article.category}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gold" />
                        <span>{article.date}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gold" />
                        <span>{article.readTime} {t('newsPage.readTime') || 'de leitura'}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gold" />
                        <span>{article.author}</span>
                    </span>
                </div>
                
                {/* Imagem de Destaque */}
                <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-auto object-cover max-h-[500px]"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/1200x500/18181b/EAB308?text=Sem+Imagem'; }}
                    />
                </div>

                {/* Conteúdo do Artigo */}
                <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 space-y-6 text-lg text-gray-300 leading-relaxed">
                    {/* Renderiza o conteúdo (assumindo que o conteúdo é formatado com quebras de linha ou parágrafos) */}
                    {article.content.split('\n').map((paragraph, index) => (
                        <p key={index} className={index === 0 ? "text-white font-semibold italic" : ""}>{paragraph}</p>
                    ))}
                </div>

                {/* Call to Action relacionado */}
                 <div className="bg-gray-800 p-6 rounded-xl text-center shadow-lg border-l-4 border-gold">
                    <p className="text-gray-400 text-lg mb-4">
                        {t('newsPage.ctaText') || 'Pronto para experimentar a nossa excelência? Reserve agora!'}
                    </p>
                    <Link to="/booking" className="inline-flex items-center bg-gold text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-md">
                        <Car className="w-5 h-5 mr-2" />
                        {t('fleetPage.reserveNowBtn') || 'Reservar Agora'}
                    </Link>
                </div>

            </div>
            
            {/* Sidebar (1/3) - Reserva Rápida */}
            {/* NOTA: O formulário aqui não é funcional sem os estados e handlers reais do componente pai */}
            <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-4 h-fit">
                 <div id="quick-booking-sidebar-detail" className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gold/20">
                    <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                        <Calendar className="w-6 h-6 mr-2" /> 
                        {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
                    </h3>
                    
                    {/* Componente placeholder no detalhe, pois os dados vêm do estado do componente pai */}
                    <p className='text-gray-500 text-sm italic'>
                        {t('newsPage.sidebarNote') || 'Use o botão "Reservar Agora" para iniciar o processo.'}
                    </p>
                    <Link 
                        to="/booking"
                        className="w-full mt-4 inline-flex items-center justify-center bg-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-md"
                    >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        {t('fleetPage.reserveNowBtn') || 'Reservar Agora'}
                    </Link>
                </div>
            </div>
        </div>
    </div>
);


// =========================================================================
// COMPONENTE PRINCIPAL: NEWS
// =========================================================================

const News: React.FC = () => {
    
    const { t } = useLanguage();
    const navigate = useNavigate(); 
    const { articleId } = useParams<{ articleId: string }>(); 
    
    // ESTADOS GERAIS DE DADOS
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [fetchError, setFetchError] = useState<string | null>(null);

    // ESTADOS DO FORMULÁRIO DE RESERVA RÁPIDA (REUTILIZADOS)
    const [quickReserveData, setQuickReserveData] = useState({
        pickup: '',
        dropoff: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00'
    });
    const [formError, setFormError] = useState<string | null>(null);

    // REFS PARA O GOOGLE AUTOCOMPLETE (REUTILIZADOS)
    const pickupRef = useRef<HTMLInputElement>(null);
    const dropoffRef = useRef<HTMLInputElement>(null);

    // =========================================================================
    // 🎯 LÓGICA DE FETCH DA API PARA AS NOTÍCIAS
    // =========================================================================
    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                // ⚠️ AJUSTE ESTA URL PARA O SEU ENDPOINT REAL DE NOTÍCIAS ⚠️
                const url = `http://localhost:3000/api/news`; 
                
                const response = await fetch(url); 

                if (!response.ok) {
                    throw new Error(`Erro ${response.status} ao buscar notícias.`);
                }
                
                const apiResponse: { success: boolean; data?: any[] } = await response.json();
                const newsData = apiResponse.data || [];
                
                // Mapeamento dos dados da API para o tipo NewsArticle
                const standardizedNews: NewsArticle[] = newsData.map(n => ({
                    id: String(n.id),
                    title: n.title,
                    summary: n.summary || (n.content?.length > 150 ? n.content.substring(0, 150) + '...' : n.content || 'Sem resumo disponível.'),
                    content: n.content || '', 
                    category: n.category || 'Geral', 
                    // CORREÇÃO: Prioriza 'image' (nome da coluna SQL)
                    image: n.image || n.image_url || 'https://placehold.co/600x400?text=Sem+Foto',
                    // CORREÇÃO: Prioriza 'date' (nome do modelo) ou 'published_date' (nome SQL) e extrai YYYY-MM-DD
                    date: (n.date && typeof n.date === 'string' 
                            ? n.date.split('T')[0] 
                            : (n.published_date && typeof n.published_date === 'string' 
                                ? n.published_date.split('T')[0] 
                                : 'N/D')), 
                    // CORREÇÃO: Usa 'author' (nome da coluna SQL)
                    author: n.author || n.author_name || 'Equipa Editorial',
                    // Prioriza 'readTime' (camelCase) ou 'read_time' (snake_case)
                    readTime: n.readTime || n.read_time || '5 min', 
                }));
                
                setNews(standardizedNews);

            } catch (err) {
                console.error("Erro ao buscar as notícias:", err);
                setFetchError(t('newsPage.fetchError') || 'Não foi possível carregar as notícias. Tente novamente mais tarde.'); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [t]);


    // =========================================================================
    // LÓGICA DE AUTOCOMPLETE E GEOLOCALIZAÇÃO (PLACEHOLDERS)
    // ⚠️ SUBSTITUA ISTO PELA LÓGICA COMPLETA DO SEU FICHEIRO Fleet.tsx ⚠️
    // =========================================================================
    useEffect(() => {
        // CÓDIGO DO GOOGLE AUTOCOMPLETE DEVE SER INSERIDO AQUI
        // (use pickupRef, dropoffRef, setQuickReserveData, MADEIRA_BOUNDS)
        console.log("Autocomplete placeholder running.");
    }, [t]); 

    const handleLocateMe = () => {
        // CÓDIGO DO GEOLOCALIZAÇÃO DEVE SER INSERIDO AQUI
        // (use navigator.geolocation, pickupRef, setQuickReserveData, setFormError)
        setFormError(t('booking.geoBrowserError') || 'O seu navegador não suporta geolocalização ou o Maps API não está carregado.');
    };
    
    // =========================================================================
    // LÓGICA DE FILTRAGEM E NAVEGAÇÃO
    // =========================================================================

    // Categorias Dinâmicas
    const allCategories = useMemo(() => {
        const categories = news.map(a => a.category).filter((v, i, a) => a.indexOf(v) === i);
        return [t('newsPage.allCategories') || 'Todas', ...categories]; 
    }, [news, t]);
    
    const [selectedCategory, setSelectedCategory] = useState<string>(t('newsPage.allCategories') || 'Todas');
    
    // Atualiza a categoria se o idioma mudar
    useEffect(() => {
        const defaultCategoryName = t('newsPage.allCategories') || 'Todas';
        // Se a categoria selecionada não existir mais (mudança de idioma), volta para "Todas"
        if (!allCategories.includes(selectedCategory)) {
             setSelectedCategory(defaultCategoryName);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, news.length]); 
    
    const filteredNews = useMemo(() => {
        const defaultCategoryName = t('newsPage.allCategories') || 'Todas';
        if (selectedCategory === defaultCategoryName) {
            return news;
        }
        return news.filter(a => a.category === selectedCategory);
    }, [selectedCategory, news, t]);

    const handleViewDetail = (id: string) => {
        navigate(`/news/${id}`); 
    };

    const handleBackToNews = () => {
        navigate('/news');
    };

    // LÓGICA DE SUBMISSÃO (Reutilizada do Fleet)
    const handleQuickReserve = (e: React.FormEvent) => {
        e.preventDefault();

        const { pickup, dropoff, date, time } = quickReserveData;

        if (!pickup.trim() || !dropoff.trim()) {
            setFormError(t('fleetPage.formError') || 'Por favor, preencha ambos os Endereços.');
            return;
        }
        setFormError(null);

        const queryParams = new URLSearchParams();
        queryParams.append('pickup', encodeURIComponent(pickup));
        queryParams.append('dropoff', encodeURIComponent(dropoff));
        queryParams.append('date', date);
        queryParams.append('time', time);
        
        navigate(`/booking?${queryParams.toString()}`);
    };
    
    const activeArticle = useMemo(() => {
        return news.find(a => a.id === articleId);
    }, [articleId, news]);
    

    // --- RENDERIZAÇÃO DE ESTADOS ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center pt-32">
                <div className="text-xl text-gold animate-pulse flex items-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    {t('loading') || 'A Carregar Notícias...'}
                </div>
            </div>
        );
    }
    
    if (fetchError && !news.length) {
         return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8 pt-32">
                <h1 className="text-3xl font-extrabold text-red-500 mb-4">Erro de Conexão</h1>
                <p className="text-xl text-gray-400 mb-8">{fetchError}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors mt-4"
                >
                    {t('newsPage.retry') || 'Tentar Novamente'}
                </button>
            </div>
        );
    }

    // RENDERIZAÇÃO CONDICIONAL: DETALHE DO ARTIGO
    if (articleId && activeArticle) {
        return (
            <div className="min-h-screen bg-gray-950 text-white pb-16 lg:pb-0">
                <ArticleDetail 
                    article={activeArticle} 
                    onBack={handleBackToNews} 
                    t={t}
                />
                <MobileBookingBar 
                    t={t} 
                    handleQuickReserve={handleQuickReserve} 
                    quickReserveData={quickReserveData}
                    setQuickReserveData={setQuickReserveData}
                    pickupRef={pickupRef} 
                    dropoffRef={dropoffRef}
                    handleLocateMe={handleLocateMe}
                    error={formError}
                    setError={setFormError}
                />
            </div>
        );
    }
    
    // RENDERIZAÇÃO PRINCIPAL: LISTA DE NOTÍCIAS
    return (
        <div className="min-h-screen bg-gray-950 text-white pb-16 lg:pb-0"> 
            
            {/* Header Section */}
            <div className="bg-black py-16 pt-32 shadow-2xl border-b-4 border-gold">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-wider">
                        {t('newsPage.title') || 'Notícias e Atualizações'}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-6 font-light">{t('newsPage.subtitle') || 'Fique a par das novidades da nossa frota e dos nossos serviços.'}</p>
                    <div className="flex items-center justify-center space-x-2 text-gold">
                        <Link to="/" className="hover:text-yellow-400 transition-colors font-semibold">{t('fleetPage.homeBreadcrumb') || 'Início'}</Link>
                        <span>/</span>
                        <span className="text-gray-400">{t('newsPage.newsBreadcrumb') || 'Notícias'}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
            
                <div className="grid lg:grid-cols-4 gap-12">
                
                    {/* Coluna Principal das Notícias (3/4) */}
                    <div className="lg:col-span-3 order-2 lg:order-1"> 
                        
                        {/* Barra de Filtros */}
                        <div className="mb-10 p-4 bg-gray-900 rounded-xl shadow-2xl flex flex-wrap gap-3 items-center border border-gray-700">
                            <span className="text-lg font-semibold text-gold mr-2 flex items-center">
                                <Filter className="w-5 h-5 mr-2" /> {t('newsPage.filterTitle') || 'Filtrar por Categoria'}:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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

                        {/* Grid dos Artigos */}
                        {filteredNews.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
                                {filteredNews.map((article) => (
                                    <NewsCard 
                                        key={article.id} 
                                        article={article} 
                                        navigate={handleViewDetail} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="col-span-full text-center text-xl text-gray-500 py-10">
                                {t('newsPage.noArticles') || 'Nenhum artigo encontrado nesta categoria.'}
                            </p>
                        )}
                    </div>
                    
                    {/* Sidebar / Reserva Rápida (1/4) */}
                    <div className="lg:col-span-1 order-1 lg:order-2 space-y-8 lg:sticky lg:top-4 h-fit">
                        
                        {/* Formulário de Reserva Rápida */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gold/20">
                            <h3 className="text-2xl font-bold text-gold mb-4 flex items-center border-b border-gray-700 pb-3">
                                <Car className="w-6 h-6 mr-2" /> 
                                {t('fleetPage.quickBookTitle') || 'Reserva Rápida'}
                            </h3>
                            
                            <QuickBookingFormContent 
                                t={t}
                                onSubmit={handleQuickReserve}
                                data={quickReserveData}
                                setData={setQuickReserveData}
                                pickupRef={pickupRef}
                                dropoffRef={dropoffRef}
                                handleLocateMe={handleLocateMe}
                                error={formError}
                                setError={setFormError}
                            />
                        </div>
                        
                        {/* Widget de Contato Rápido */}
                        <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">
                                {t('newsPage.contactWidgetTitle') || 'Fale Connosco'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                {t('newsPage.contactWidgetText') || 'Para questões sobre os nossos artigos ou serviços, contacte-nos diretamente.'}
                            </p>
                            <Link to="/contact" className="w-full inline-flex items-center justify-center bg-gray-800 text-gold px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors text-sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t('newsPage.contactButton') || 'Página de Contato'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <MobileBookingBar 
                t={t} 
                handleQuickReserve={handleQuickReserve} 
                quickReserveData={quickReserveData}
                setQuickReserveData={setQuickReserveData}
                pickupRef={pickupRef} 
                dropoffRef={dropoffRef}
                handleLocateMe={handleLocateMe}
                error={formError}
                setError={setFormError}
            />
        </div>
    );
};

export default News;