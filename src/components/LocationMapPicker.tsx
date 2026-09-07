import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Navigation, X, Check, ArrowRight, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (Vite issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:#22c55e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.5)"></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:#f59e0b;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.5)"></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const MADEIRA_CENTER: [number, number] = [32.7607, -17.0];
const MADEIRA_BOUNDS: [[number, number], [number, number]] = [[32.56, -17.35], [32.92, -16.65]];

// --- Nominatim (OpenStreetMap) — gratuito, sem API key ---
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Madeira')}&format=json&limit=5&countrycodes=pt`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-PT,pt;q=0.9' } });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-PT,pt;q=0.9' } });
    if (!res.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    const data = await res.json();
    // Return a clean short address
    const addr = data.address || {};
    const parts = [
      addr.road || addr.pedestrian || addr.path,
      addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : (data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

// --- Search Input ---
interface SearchInputProps {
  label: string;
  value: string;
  placeholder: string;
  color: 'green' | 'amber';
  active: boolean;
  onChange: (val: string) => void;
  onSelect: (result: NominatimResult) => void;
  onFocusPin: () => void;
  onLocateMe?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  label, value, placeholder, color, active, onChange, onSelect, onFocusPin, onLocateMe
}) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (val: string) => {
    onChange(val);
    setOpen(true);
    if (debounce.current) clearTimeout(debounce.current);
    if (val.length < 3) { setSuggestions([]); setSearching(false); return; }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      const res = await searchNominatim(val);
      setSuggestions(res);
      setSearching(false);
    }, 400);
  };

  const ring = active
    ? color === 'green' ? 'border-green-500 ring-1 ring-green-500/40' : 'border-amber-400 ring-1 ring-amber-400/40'
    : 'border-gray-700';
  const dot = color === 'green' ? 'bg-green-500' : 'bg-amber-400';

  return (
    <div className="relative">
      <div
        onClick={() => { onFocusPin(); inputRef.current?.focus(); }}
        className={`flex items-center gap-3 bg-gray-900 border rounded-xl px-3 py-3 cursor-text transition-all ${ring}`}
      >
        <div className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => { onFocusPin(); if (value.length >= 3) setOpen(true); }}
              onBlur={() => setTimeout(() => setOpen(false), 180)}
              placeholder={placeholder}
              className="w-full bg-transparent text-white text-sm placeholder-gray-500 outline-none"
            />
            {searching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
            {value && !searching && (
              <button type="button" onClick={e => { e.stopPropagation(); onChange(''); setSuggestions([]); }}
                className="text-gray-500 hover:text-white transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {onLocateMe && (
          <button type="button" onClick={e => { e.stopPropagation(); onLocateMe(); }}
            title="Usar localização atual"
            className="text-gray-500 hover:text-amber-400 transition-colors shrink-0 p-1">
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={() => { onSelect(s); setSuggestions([]); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-start gap-2 border-b border-gray-800 last:border-0 transition-colors"
            >
              <Search className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
              <span className="line-clamp-2 leading-snug">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Export ---
export interface LocationResult {
  pickupAddress: string;
  dropoffAddress: string;
}

interface LocationMapPickerProps {
  onConfirm: (result: LocationResult) => void;
  initialPickup?: string;
  initialDropoff?: string;
}

type ActivePin = 'pickup' | 'dropoff';

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({ onConfirm, initialPickup = '', initialDropoff = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);

  const [pickupAddress, setPickupAddress] = useState(initialPickup);
  const [dropoffAddress, setDropoffAddress] = useState(initialDropoff);
  const [pickupPos, setPickupPos] = useState<[number, number] | null>(null);
  const [dropoffPos, setDropoffPos] = useState<[number, number] | null>(null);
  const [activePin, setActivePin] = useState<ActivePin>('pickup');
  const [isLocating, setIsLocating] = useState(false);
  const [hint, setHint] = useState('Toque no mapa ou pesquise o ponto de recolha');

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MADEIRA_CENTER,
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'map-tiles-dark',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>' }).addTo(map);
    map.fitBounds(MADEIRA_BOUNDS);
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Map click to drop pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      if (activePin === 'pickup') {
        setPickupPos([lat, lng]);
        setPickupAddress(address);
        setActivePin('dropoff');
        setHint('Agora selecione o destino');
      } else {
        setDropoffPos([lat, lng]);
        setDropoffAddress(address);
        setHint('');
      }
    };

    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [activePin]);

  // Sync pickup marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickupPos) {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pickupPos, { icon: pickupIcon, draggable: true })
          .addTo(map)
          .bindTooltip('Recolha', { permanent: false, direction: 'top' })
          .on('dragend', async (e: L.LeafletEvent) => {
            const { lat, lng } = (e.target as L.Marker).getLatLng();
            const addr = await reverseGeocode(lat, lng);
            setPickupPos([lat, lng]);
            setPickupAddress(addr);
          });
      } else {
        pickupMarkerRef.current.setLatLng(pickupPos);
      }
    } else {
      pickupMarkerRef.current?.remove();
      pickupMarkerRef.current = null;
    }
  }, [pickupPos]);

  // Sync dropoff marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (dropoffPos) {
      if (!dropoffMarkerRef.current) {
        dropoffMarkerRef.current = L.marker(dropoffPos, { icon: dropoffIcon, draggable: true })
          .addTo(map)
          .bindTooltip('Destino', { permanent: false, direction: 'top' })
          .on('dragend', async (e: L.LeafletEvent) => {
            const { lat, lng } = (e.target as L.Marker).getLatLng();
            const addr = await reverseGeocode(lat, lng);
            setDropoffPos([lat, lng]);
            setDropoffAddress(addr);
          });
      } else {
        dropoffMarkerRef.current.setLatLng(dropoffPos);
      }
      // Fit both
      if (pickupPos) {
        map.fitBounds(L.latLngBounds([pickupPos, dropoffPos]).pad(0.3), { animate: true });
      }
    } else {
      dropoffMarkerRef.current?.remove();
      dropoffMarkerRef.current = null;
    }
  }, [dropoffPos, pickupPos]);

  const handlePickupSelect = useCallback((r: NominatimResult) => {
    const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
    setPickupPos([lat, lon]);
    setPickupAddress(r.display_name);
    mapRef.current?.setView([lat, lon], 14, { animate: true });
    setActivePin('dropoff');
    setHint('Agora selecione o destino');
  }, []);

  const handleDropoffSelect = useCallback((r: NominatimResult) => {
    const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
    setDropoffPos([lat, lon]);
    setDropoffAddress(r.display_name);
    mapRef.current?.setView([lat, lon], 14, { animate: true });
    setHint('');
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const addr = await reverseGeocode(lat, lon);
        setPickupPos([lat, lon]);
        setPickupAddress(addr);
        mapRef.current?.setView([lat, lon], 15, { animate: true });
        setActivePin('dropoff');
        setHint('Localização atual definida. Agora selecione o destino.');
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const canConfirm = pickupAddress.trim().length > 0 && dropoffAddress.trim().length > 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-950">

      {/* Pill tabs */}
      <div className="flex items-center gap-2 p-4 pb-3">
        <button
          type="button"
          onClick={() => { setActivePin('pickup'); setHint('Toque no mapa para mover a recolha'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            activePin === 'pickup'
              ? 'bg-green-500 border-green-500 text-white shadow shadow-green-500/30'
              : 'border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-current" />
          Recolha
        </button>
        <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
        <button
          type="button"
          onClick={() => { setActivePin('dropoff'); setHint('Toque no mapa para mover o destino'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            activePin === 'dropoff'
              ? 'bg-amber-400 border-amber-400 text-black shadow shadow-amber-400/30'
              : 'border-gray-700 text-gray-400 hover:border-amber-400 hover:text-amber-400'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-current" />
          Destino
        </button>
        {hint && (
          <p className="ml-auto text-[11px] text-amber-400 flex items-center gap-1 shrink-0">
            <MapPin className="w-3 h-3" />
            {hint}
          </p>
        )}
      </div>

      {/* Inputs */}
      <div className="px-4 pb-3 space-y-2">
        <SearchInput
          label="Ponto de Recolha"
          value={pickupAddress}
          placeholder="Aeroporto, hotel, morada..."
          color="green"
          active={activePin === 'pickup'}
          onChange={setPickupAddress}
          onSelect={handlePickupSelect}
          onFocusPin={() => setActivePin('pickup')}
          onLocateMe={isLocating ? undefined : handleLocateMe}
        />
        <div className="flex justify-center">
          <div className="w-px h-4 bg-gray-700" />
        </div>
        <SearchInput
          label="Destino"
          value={dropoffAddress}
          placeholder="Para onde vai?"
          color="amber"
          active={activePin === 'dropoff'}
          onChange={setDropoffAddress}
          onSelect={handleDropoffSelect}
          onFocusPin={() => setActivePin('dropoff')}
        />
      </div>

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ height: 320, cursor: 'crosshair' }}
        className="w-full border-t border-b border-gray-800"
      />

      {/* Confirm */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => canConfirm && onConfirm({ pickupAddress: pickupAddress.trim(), dropoffAddress: dropoffAddress.trim() })}
          disabled={!canConfirm}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
            canConfirm
              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20 active:scale-[0.99]'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {canConfirm ? (
            <><Check className="w-5 h-5" /> Confirmar Localizações</>
          ) : (
            <><MapPin className="w-5 h-5" /> Selecione recolha e destino</>
          )}
        </button>
      </div>
    </div>
  );
};

export default LocationMapPicker;
