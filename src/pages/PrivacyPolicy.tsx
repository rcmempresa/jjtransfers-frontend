import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldCheck, User, Mail, Zap } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();
  const GOLD_COLOR_CLASS = 'text-amber-400';
  const SECTION_TITLE_CLASS = 'text-2xl font-bold border-b border-gray-700 pb-2 mb-4';

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Título Principal */}
        <header className="text-center mb-12">
          <ShieldCheck className={`w-12 h-12 ${GOLD_COLOR_CLASS} mx-auto mb-4`} />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            {t('privacy.title') || 'Política de Privacidade'}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('privacy.lastUpdated') || 'Última atualização: 15 de Novembro de 2025'}
          </p>
        </header>

        {/* Conteúdo da Política */}
        <div className="space-y-8 p-6 md:p-10 bg-gray-900 rounded-xl shadow-2xl">
          
          {/* Introdução */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>1. {t('privacy.intro.title') || 'Introdução'}</h2>
            <p className="text-gray-300">
              {t('privacy.intro.content') || 'A J&J Bespoke Travel está empenhada em proteger a privacidade dos seus utilizadores. Esta política descreve como recolhemos, usamos e partilhamos a sua informação pessoal, em conformidade com o Regulamento Geral de Proteção de Dados (RGPD).'}
            </p>
          </div>

          {/* Dados Recolhidos */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>2. {t('privacy.data.title') || 'Dados Pessoais Recolhidos'}</h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.data.explanation') || 'Recolhemos dados que nos fornece diretamente, tais como:'}
            </p>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex items-start text-gray-300"><User className={`w-5 h-5 mr-3 mt-1 ${GOLD_COLOR_CLASS}`} /> {t('privacy.data.name')} Nome, contacto telefónico e e-mail (essenciais para a reserva).</li>
              <li className="flex items-start text-gray-300"><Zap className={`w-5 h-5 mr-3 mt-1 ${GOLD_COLOR_CLASS}`} /> {t('privacy.data.trip')} Detalhes da viagem (endereços, datas, pedidos especiais).</li>
              <li className="flex items-start text-gray-300"><Mail className={`w-5 h-5 mr-3 mt-1 ${GOLD_COLOR_CLASS}`} /> {t('privacy.data.marketing')} Preferências de marketing (se aplicável).</li>
            </ul>
          </div>

          {/* Uso dos Dados */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>3. {t('privacy.use.title') || 'Como Usamos os Seus Dados'}</h2>
            <p className="text-gray-300 space-y-3">
              <span className="block">{t('privacy.use.a') || '• Para processar e gerir a sua reserva de transporte.'}</span>
              <span className="block">{t('privacy.use.b') || '• Para comunicar consigo sobre a sua viagem, incluindo atualizações e confirmações.'}</span>
              <span className="block">{t('privacy.use.c') || '• Para fins de faturação e gestão contabilística.'}</span>
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>5. {t('privacy.contact.title') || 'Os Seus Direitos e Contacto'}</h2>
            <p className="text-gray-300">
              {t('privacy.contact.content') || 'Tem o direito de aceder, retificar ou apagar os seus dados pessoais. Para exercer estes direitos ou colocar questões, contacte-nos através do e-mail:'} <strong className={GOLD_COLOR_CLASS}>info@jjbespoketravel.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;