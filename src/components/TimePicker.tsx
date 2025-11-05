import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface TimePickerProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  name,
  value,
  onChange,
  className = '',
  required = false,
  placeholder
}) => {
  const { t } = useLanguage();
  
  // Função para formatar a hora em português
  const formatTimeInPortuguese = (timeString: string) => {
    if (!timeString) return placeholder || t('booking.pickupTime');
    
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="relative">
      <div className={`flex items-center bg-gray-800/80 rounded-2xl p-5 hover:bg-gray-700/80 transition-all border border-gray-600/50 ${className}`}>
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-400 mb-1">{t('booking.pickupTime')}</label>
          <div className="flex items-center justify-between">
            <span className="text-lg text-white">
              {formatTimeInPortuguese(value)}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <input
          type="time"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default TimePicker;