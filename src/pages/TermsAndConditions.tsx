import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Lock, FileText, XCircle, Clock } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const { t } = useLanguage();
  const GOLD_COLOR_CLASS = 'text-amber-400';
  const SECTION_TITLE_CLASS = 'text-2xl font-bold border-b border-gray-700 pb-2 mb-4';

  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Título Principal */}
        <header className="text-center mb-12">
          <FileText className={`w-12 h-12 ${GOLD_COLOR_CLASS} mx-auto mb-4`} />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            {t('terms.title') || 'Termos e Condições'}
          </h1>
          <p className="text-gray-400 mt-2">
            {t('terms.governing') || 'Regem a utilização dos serviços de transporte da J&J Bespoke Travel.'}
          </p>
        </header>

        {/* Conteúdo dos Termos */}
        <div className="space-y-8 p-6 md:p-10 bg-gray-900 rounded-xl shadow-2xl">
          
          {/* Reservas e Pagamento */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>1. {t('terms.reservations.title') || 'Reservas e Pagamento'}</h2>
            <p className="text-gray-300 mb-4">
              {t('terms.reservations.content') || 'Todas as reservas estão sujeitas à confirmação de disponibilidade da frota. O pagamento integral ou parcial, conforme acordado, é obrigatório para garantir a reserva.'}
            </p>
          </div>

          {/* Cancelamentos */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>2. {t('terms.cancellation.title') || 'Política de Cancelamento'}</h2>
            <ul className="space-y-3 list-none pl-0">
              <li className="flex items-start text-gray-300">
                <XCircle className={`w-5 h-5 mr-3 mt-1 text-red-500`} /> 
                {t('terms.cancellation.a') || 'Cancelamentos efetuados com mais de 48 horas de antecedência: reembolso total.'}
              </li>
              <li className="flex items-start text-gray-300">
                <Clock className={`w-5 h-5 mr-3 mt-1 text-yellow-500`} /> 
                {t('terms.cancellation.b') || 'Cancelamentos efetuados com menos de 24 horas de antecedência: retenção de 50% do valor total.'}
              </li>
              <li className="flex items-start text-gray-300">
                <Lock className={`w-5 h-5 mr-3 mt-1 text-gray-500`} /> 
                {t('terms.cancellation.c') || 'No-show ou cancelamento na hora: valor total da reserva será cobrado.'}
              </li>
            </ul>
          </div>
          
          {/* Conduta */}
          <div>
            <h2 className={SECTION_TITLE_CLASS}>3. {t('terms.conduct.title') || 'Conduta do Passageiro'}</h2>
            <p className="text-gray-300">
              {t('terms.conduct.content') || 'Os passageiros são responsáveis por danos causados aos veículos. É estritamente proibido fumar ou consumir drogas nos veículos. O motorista reserva-se o direito de recusar o serviço a qualquer pessoa que esteja embriagada ou que represente um risco à segurança.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;