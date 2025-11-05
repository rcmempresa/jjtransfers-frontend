import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  name,
  value,
  onChange,
  className = '',
  required = false,
  placeholder
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Função para formatar a data em português
  const formatDateInPortuguese = (dateString: string) => {
    if (!dateString) return placeholder || t('booking.date');
    
    const date = new Date(dateString + 'T00:00:00');
    
    const days = language === 'pt' 
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
    const months = language === 'pt'
      ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <div className="relative">
      <div className={`flex items-center bg-gray-800/80 rounded-2xl p-5 hover:bg-gray-700/80 transition-all border border-gray-600/50 ${className}`}>
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-400 mb-1">{t('booking.date')}</label>
          <div className="flex items-center justify-between">
            <span className="text-lg text-white">
              {formatDateInPortuguese(value)}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="absolute inset-0 opacity-0 cursor-pointer"
          lang={language === 'pt' ? 'pt-PT' : 'en-US'}
        />
      </div>
    </div>
  );
};

export default DatePicker;