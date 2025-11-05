import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, Zap, Briefcase } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

// URL da sua API de backend. Mude para o domínio de produção quando fizer o deploy!
const API_CONTACT_URL = 'http://localhost:3000/api/contact'; 

// Constantes de cores do seu tema (Adaptadas para Dark Mode)
const GOLD_COLOR_CLASS = 'text-amber-400'; // Dourado brilhante contra o escuro
const GOLD_BG_CLASS = 'bg-amber-400'; // Alterado para 400 para consistência no botão
const GOLD_RING_CLASS = 'focus:ring-amber-400 focus:border-amber-400';
const TEXT_LIGHT_CLASS = 'text-gray-100'; // Texto principal muito claro
const TEXT_SECONDARY_CLASS = 'text-gray-400'; // Texto secundário/descrições

// Componente principal
const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  // 🛑 NOVOS ESTADOS PARA GESTÃO DA API
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🛑 FUNÇÃO SUBMIT ATUALIZADA PARA CHAMAR A API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: null, text: '' }); // Limpar mensagens anteriores

    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setStatusMessage({ 
                type: 'success', 
                text: 'Mensagem enviada com sucesso! Verifique o seu email para a confirmação automática.' 
            });
            setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
            setStatusMessage({ 
                type: 'error', 
                text: data.message || 'Ocorreu um erro ao enviar a mensagem. Tente o contacto telefónico.' 
            });
        }

    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        setStatusMessage({ 
            type: 'error', 
            text: 'Não foi possível ligar ao servidor. Verifique se o backend está a correr (localhost:5000).' 
        });
    } finally {
        setLoading(false);
    }
  };

  // ... (restante do Contact.FC)
  return (
    <div className="min-h-screen bg-gray-900 pt-32 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ... (Título e Subtítulo) */}
        <div className="text-center mb-16">
          <p className={`text-lg font-medium ${GOLD_COLOR_CLASS} mb-2 uppercase tracking-widest`}>
            {t('contact.subtitle') || "O SEU CONTACTO É IMPORTANTE"}
          </p>
          <h1 className={`text-5xl md:text-6xl font-extrabold ${TEXT_LIGHT_CLASS}`}>
            {t('contact.title') || "Fale Connosco Hoje"}
          </h1>
        </div>

        {/* LAYOUT PRINCIPAL (2 COLUNAS) */}
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* 1. Contact Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 md:p-10 border border-gray-700 h-full text-white">
              <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">
                Inicie o Seu Pedido
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ... (Campos Nome, Email, Telefone, Mensagem) - permanecem iguais */}
                <div className="grid md:grid-cols-2 gap-6">
                  {['name', 'email'].map(field => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      placeholder={t(`contact.form.${field}`) as string}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-900 placeholder-gray-500 
                                  text-white focus:ring-2 ${GOLD_RING_CLASS} transition-shadow`}
                      required={field !== 'phone'}
                    />
                  ))}
                </div>
                
                <input
                  type="tel" id="phone" name="phone"
                  placeholder={t('contact.form.phone') as string}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-900 placeholder-gray-500 
                              text-white focus:ring-2 ${GOLD_RING_CLASS} transition-shadow`}
                />
                
                <textarea
                  id="message" name="message"
                  placeholder={t('contact.form.message') as string}
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-900 placeholder-gray-500 
                              text-white focus:ring-2 ${GOLD_RING_CLASS} resize-none transition-shadow`}
                  required
                ></textarea>

                {/* 🛑 FEEDBACK DE STATUS */}
                {statusMessage.type && (
                    <p className={`p-3 rounded-lg font-semibold 
                        ${statusMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                        transition-opacity duration-300`}
                    >
                        {statusMessage.text}
                    </p>
                )}
                
                {/* Botão de Envio (CTA Dourado) */}
                <button
                  type="submit"
                  disabled={loading} // Desativado durante o envio
                  className={`w-full flex items-center justify-center space-x-3 
                              ${loading ? 'bg-gray-500 cursor-not-allowed' : `${GOLD_BG_CLASS} hover:bg-amber-300`} text-gray-900 
                              px-6 py-4 rounded-lg font-extrabold text-lg 
                              shadow-lg transition-all duration-300 transform hover:scale-[1.01]`}
                >
                  {loading ? (
                    // Spinner de carregamento (Tailwind CSS)
                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Send className="w-5 h-5"/>
                  )}
                  <span>{loading ? 'A Enviar...' : t('contact.form.send')}</span>
                </button>
              </form>
            </div>
          </div>

          {/* ... (Informações de Contacto e Destaques - permanecem iguais) */}
          <div className="space-y-10 order-1 lg:order-2 p-4">
            
            {/* Informação Principal */}
            <div className={`space-y-8 ${TEXT_LIGHT_CLASS}`}>
              <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
                Informação Essencial
              </h2>
              
              <ContactInfoItem Icon={Phone} title="Reservas & Consultas" detail="+351 912 345 678" link="tel:+351912345678" description="A nossa linha para pedidos de orçamento e informação geral." isDark={true} />
              <ContactInfoItem Icon={Mail} title="Email Direto" detail="reservas@jjbespoketravel.com" link="mailto:reservas@jjbespoketravel.com" description="Para documentação, pedidos detalhados e alterações." isDark={true} />
              <ContactInfoItem Icon={Clock} title="Horário de Serviço" detail="24 Horas / 7 Dias por Semana" description="A nossa frota e apoio estão sempre operacionais para as suas necessidades." isDark={true} />
            </div>

            {/* DESTAQUE: CONTACTO DE EMERGÊNCIA */}
            <div className={`p-6 rounded-lg border-2 border-dashed ${GOLD_COLOR_CLASS} ${GOLD_BG_CLASS} text-gray-900 shadow-xl`}>
                <div className="flex items-center space-x-3 mb-3">
                    <Zap className={`w-6 h-6 text-gray-900`}/>
                    <h3 className="text-xl font-extrabold uppercase">
                        Apoio Imediato (24/7)
                    </h3>
                </div>
                <p className="mb-3 text-lg font-medium">
                    Para emergências, alterações de última hora ou assistência imediata ao serviço:
                </p>
                <a href="tel:+351924724724" className={`text-4xl font-extrabold tracking-wider underline hover:no-underline text-gray-900 block`}>
                    +351 924 724 724
                </a>
            </div>

             {/* NOVO BLOCO: CONTACTO EMPRESARIAL */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <ContactInfoItem Icon={Briefcase} title="Parcerias e Negócios" detail="parcerias@jjbespoketravel.com" link="mailto:parcerias@jjbespoketravel.com" description="Propostas de colaboração, Faturação e questões corporativas." isDark={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar atualizado para Dark Mode (permaneceu o mesmo)
const ContactInfoItem: React.FC<{ Icon: React.FC<any>, title: string, detail: string, link?: string, description: string, isDark: boolean }> = ({ Icon, title, detail, link, description, isDark }) => (
    <div className="flex items-start space-x-4">
        <Icon className={`w-7 h-7 ${GOLD_COLOR_CLASS} flex-shrink-0 mt-1`} />
        <div>
            <h3 className={`font-bold text-xl ${TEXT_LIGHT_CLASS}`}>{title}</h3>
            {link ? (
                <a 
                  href={link} 
                  className={`text-lg ${TEXT_SECONDARY_CLASS} hover:${GOLD_COLOR_CLASS} transition-colors font-semibold`}>
                    {detail}
                </a>
            ) : (
                <p className={`text-lg ${TEXT_SECONDARY_CLASS} font-semibold`}>{detail}</p>
            )}
            <p className={`text-sm ${TEXT_SECONDARY_CLASS} mt-1`}>{description}</p>
        </div>
    </div>
);


export default Contact;