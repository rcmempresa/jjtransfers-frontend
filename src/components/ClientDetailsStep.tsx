import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
// Assuma que 'useLanguage' está disponível no seu projeto
import { useLanguage } from '../hooks/useLanguage'; 

// Variáveis de Estilo
const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/90 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400";
const buttonClasses = "w-full bg-amber-400 text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-amber-300 transition-colors flex items-center justify-center";

const PaymentImageMap: { [key: string]: string } = {
    'mbw': 'https://placehold.co/100x40?text=MB+Way',
    'mb': 'https://placehold.co/100x40?text=Multibanco',
    'cc': 'https://placehold.co/100x40?text=Cartão',
};

// Tipagem Corrigida e Simplificada
interface ClientDetailsStepProps {
    calculatedPrice: number;
    clientForm: {
        passenger_name: string;
        passenger_email: string;
        passenger_phone: string;
        special_requests: string;
        paymentMethod: 'mbw' | 'mb' | 'cc';
    };
    paymentError: string | null;
    isSubmittingPayment: boolean;
    // O handler deve ser envolvido em useCallback no componente pai
    handleClientFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
    handlePaymentSubmit: (e: React.FormEvent) => Promise<void>;
}


// OTIMIZAÇÃO CRUCIAL: React.memo para evitar re-renderizações desnecessárias
const ClientDetailsStep: React.FC<ClientDetailsStepProps> = React.memo(({
    calculatedPrice,
    clientForm,
    paymentError,
    isSubmittingPayment,
    handleClientFormChange,
    handlePaymentSubmit
}) => {
    const { t } = useLanguage();

    return (
        <form onSubmit={handlePaymentSubmit}>
            <h3 className="text-xl font-bold text-white mb-4">{t('booking.contactDetails') || 'Dados do Contacto'}</h3>
            <div className="space-y-4 mb-8">
                <input 
                    type="text" 
                    name="passenger_name" 
                    placeholder={t('form.fullName') || "Nome Completo"} 
                    value={clientForm.passenger_name} 
                    onChange={handleClientFormChange} 
                    className={inputClasses}
                    required
                />
                <input 
                    type="email" 
                    name="passenger_email" 
                    placeholder={t('form.email') || "Email"} 
                    value={clientForm.passenger_email} 
                    onChange={handleClientFormChange} 
                    className={inputClasses}
                    required
                />
                <input 
                    type="tel" 
                    name="passenger_phone" 
                    placeholder={t('form.phone') || "Telefone (ex: 912345678)"} 
                    value={clientForm.passenger_phone} 
                    onChange={handleClientFormChange} 
                    className={inputClasses}
                    required
                />
                <textarea
                    name="special_requests"
                    placeholder={t('form.specialRequests') || "Pedidos Especiais (Ex: cadeira de criança, paragem extra...)"}
                    value={clientForm.special_requests}
                    onChange={handleClientFormChange}
                    className={`${inputClasses} h-24`}
                />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">{t('booking.paymentMethod') || 'Método de Pagamento'}</h3>
            <div className="flex flex-col space-y-3 mb-8">
                {/* MB Way */}
                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${clientForm.paymentMethod === 'mbw' ? 'bg-amber-400/20 border-amber-400' : 'border-gray-600 hover:bg-gray-700/50'}`}>
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="mbw" 
                        checked={clientForm.paymentMethod === 'mbw'} 
                        onChange={handleClientFormChange}
                        className="form-radio h-5 w-5 text-amber-400 border-gray-600 bg-gray-800 focus:ring-amber-400"
                    />
                    <span className="ml-3 font-medium text-white">MB Way</span>
                    <img src={PaymentImageMap.mbw} alt="MB Way" className="ml-auto" />
                </label>
                {/* Multibanco */}
                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${clientForm.paymentMethod === 'mb' ? 'bg-amber-400/20 border-amber-400' : 'border-gray-600 hover:bg-gray-700/50'}`}>
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="mb" 
                        checked={clientForm.paymentMethod === 'mb'} 
                        onChange={handleClientFormChange}
                        className="form-radio h-5 w-5 text-amber-400 border-gray-600 bg-gray-800 focus:ring-amber-400"
                    />
                    <span className="ml-3 font-medium text-white">Multibanco (Entidade/Referência)</span>
                    <img src={PaymentImageMap.mb} alt="Multibanco" className="ml-auto" />
                </label>
                {/* Cartão de Crédito */}
                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${clientForm.paymentMethod === 'cc' ? 'bg-amber-400/20 border-amber-400' : 'border-gray-600 hover:bg-gray-700/50'}`}>
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cc" 
                        checked={clientForm.paymentMethod === 'cc'} 
                        onChange={handleClientFormChange}
                        className="form-radio h-5 w-5 text-amber-400 border-gray-600 bg-gray-800 focus:ring-amber-400"
                    />
                    <span className="ml-3 font-medium text-white">{t('booking.creditCard') || 'Cartão de Crédito'}</span>
                    <img src={PaymentImageMap.cc} alt="Cartão" className="ml-auto" />
                </label>
            </div>

            <button 
                type="submit" 
                className={buttonClasses + (isSubmittingPayment ? ' opacity-60 cursor-not-allowed' : '')} 
                disabled={isSubmittingPayment}
            >
                {isSubmittingPayment ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        {t('booking.submittingPayment') || 'A Processar Pagamento...'} 
                    </>
                ) : (
                    <>
                        <ArrowRight className="w-6 h-6 mr-2" />
                        {t('booking.completeBooking') || `Pagar €${calculatedPrice.toFixed(2)} e Concluir Reserva`}
                    </>
                )}
            </button>
        </form>
    );
});

export default ClientDetailsStep;