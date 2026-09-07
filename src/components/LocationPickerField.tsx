/**
 * LocationPickerField — campo compacto de endereço que abre um modal
 * com o mapa estilo Uber ao clicar. Substitui todos os inputs de pickup/dropoff
 * nos formulários compactos do site (Home, Fleet, Services, ServiceDetail, VehicleDetail).
 */
import React, { useState } from 'react';
import { MapPin, X, Navigation2 } from 'lucide-react';
import LocationMapPicker, { LocationResult } from './LocationMapPicker';

interface LocationPickerFieldProps {
  pickup: string;
  dropoff: string;
  onConfirm: (pickup: string, dropoff: string) => void;
  /** Cor de destaque — gold (#F59E0B) por defeito, mas pode ser personalizado */
  accentClass?: string;
  /** Classe extra para o container */
  className?: string;
}

const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  pickup,
  dropoff,
  onConfirm,
  accentClass = 'border-amber-400 text-amber-400',
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = (result: LocationResult) => {
    onConfirm(result.pickupAddress, result.dropoffAddress);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger — clicável, mostra endereços actuais ou placeholder */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left bg-gray-800 border border-gray-700 hover:border-amber-400/60 rounded-xl p-3 transition-all group ${className}`}
      >
        <div className="flex items-stretch gap-3">
          {/* Linha de dots */}
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/30" />
            <div className="w-px flex-1 bg-gray-600 min-h-[18px]" />
            <div className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
          </div>

          {/* Addresses */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Recolha</p>
              <p className={`text-sm truncate ${pickup ? 'text-white' : 'text-gray-500 italic'}`}>
                {pickup || 'Selecionar ponto de recolha...'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Destino</p>
              <p className={`text-sm truncate ${dropoff ? 'text-white' : 'text-gray-500 italic'}`}>
                {dropoff || 'Selecionar destino...'}
              </p>
            </div>
          </div>

          {/* Icon */}
          <div className="shrink-0 self-center text-gray-600 group-hover:text-amber-400 transition-colors">
            <Navigation2 className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-lg relative animate-fade-in">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 z-10 bg-gray-900 border border-gray-700 rounded-full p-1.5 text-gray-400 hover:text-white hover:border-gray-500 transition-all shadow-xl"
            >
              <X className="w-4 h-4" />
            </button>

            <LocationMapPicker
              initialPickup={pickup}
              initialDropoff={dropoff}
              onConfirm={handleConfirm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LocationPickerField;
