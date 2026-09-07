import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Car, Settings, Plus, Trash2, Save, Edit2, X,
  Upload, RefreshCw, AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface FleetMedia { id?: number; url: string; type: string; order: number; }

interface FleetItem {
  id: number; name: string; category: string;
  base_price_per_hour: number; capacity: number; luggage_capacity: number;
  status: string; media: FleetMedia[]; description: string;
  year: number; range_km: number; transmission_type: string;
  features: string[]; is_active: boolean;
}

interface ServiceItem {
  id: number;
  name: { pt?: string; en?: string } | string;
  description: { pt?: string; en?: string } | string;
  image_url: string | null;
  is_active: boolean;
  fleets: { id: number; name: string }[];
}

interface FleetForm {
  name: string; description: string; year: string; range_km: string;
  transmission_type: string; category: string; luggage_capacity: string;
  base_price_per_hour: string; features: string[]; capacity: string;
  status: string; is_active: boolean; mediaUrls: string[];
}

interface ServiceForm {
  name_pt: string; name_en: string;
  description_pt: string; description_en: string;
  is_active: boolean; image_url: string; fleetIds: number[];
}

const EMPTY_FLEET: FleetForm = {
  name: '', description: '', year: String(new Date().getFullYear()),
  range_km: '', transmission_type: 'Automatic', category: '',
  luggage_capacity: '', base_price_per_hour: '', features: [''],
  capacity: '', status: 'available', is_active: true, mediaUrls: [],
};

const EMPTY_SERVICE: ServiceForm = {
  name_pt: '', name_en: '', description_pt: '', description_en: '',
  is_active: true, image_url: '', fleetIds: [],
};

// ─────────────────────────────────────────────
// IMAGE UPLOADER
// ─────────────────────────────────────────────

interface ImageUploaderProps {
  base: string;
  authToken: string;
  onUploaded: (url: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ base, authToken, onUploaded, label = 'Carregar imagem' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${base}api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
        toast.success('Imagem carregada!');
      } else {
        toast.error(data.message || 'Erro ao fazer upload.');
      }
    } catch {
      toast.error('Erro ao fazer upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-amber-400 hover:text-amber-400 transition-colors disabled:opacity-50"
      >
        {uploading
          ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          : <Upload className="w-3.5 h-3.5" />}
        {uploading ? 'A carregar...' : label}
      </button>
    </>
  );
};

// ─────────────────────────────────────────────
// MANAGEMENT VIEW
// ─────────────────────────────────────────────

interface ManagementViewProps {
  authHeaders: Record<string, string>;
  base: string;
  onUnauthorized: () => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({ authHeaders, base, onUnauthorized }) => {
  const authToken = (authHeaders.Authorization || '').replace('Bearer ', '');

  const [fleets, setFleets] = useState<FleetItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fleet modal
  const [fleetModal, setFleetModal] = useState<{ open: boolean; editing: FleetItem | null }>({ open: false, editing: null });
  const [fleetForm, setFleetForm] = useState<FleetForm>(EMPTY_FLEET);
  const [savingFleet, setSavingFleet] = useState(false);
  const [deletingFleet, setDeletingFleet] = useState<number | null>(null);

  // Service modal
  const [serviceModal, setServiceModal] = useState<{ open: boolean; editing: ServiceItem | null }>({ open: false, editing: null });
  const [serviceForm, setServiceForm] = useState<ServiceForm>(EMPTY_SERVICE);
  const [savingService, setSavingService] = useState(false);
  const [deletingService, setDeletingService] = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fr, sr] = await Promise.all([
        fetch(`${base}api/cars`),
        fetch(`${base}api/services`),
      ]);
      const fd = await fr.json();
      const sd = await sr.json();
      if (fd.success) setFleets(fd.data || []);
      if (sd.success) setServices(sd.data || []);
    } catch {
      toast.error('Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }, [base]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Helpers ────────────────────────────────

  const getName = (name: ServiceItem['name']) => {
    if (typeof name === 'object' && name !== null) return name.pt || name.en || 'Serviço';
    return String(name || 'Serviço');
  };

  const guard = (res: Response) => {
    if (res.status === 401 || res.status === 403) { onUnauthorized(); return true; }
    return false;
  };

  // ── Fleet CRUD ────────────────────────────

  const openCreateFleet = () => { setFleetForm(EMPTY_FLEET); setFleetModal({ open: true, editing: null }); };

  const openEditFleet = (f: FleetItem) => {
    setFleetForm({
      name: f.name, description: f.description,
      year: String(f.year || ''), range_km: String(f.range_km || ''),
      transmission_type: f.transmission_type || 'Automatic',
      category: f.category,
      luggage_capacity: String(f.luggage_capacity),
      base_price_per_hour: String(f.base_price_per_hour),
      features: f.features?.length ? f.features : [''],
      capacity: String(f.capacity), status: f.status,
      is_active: f.is_active ?? true,
      mediaUrls: f.media.map(m => m.url),
    });
    setFleetModal({ open: true, editing: f });
  };

  const saveFleet = async () => {
    setSavingFleet(true);
    try {
      const body: Record<string, unknown> = {
        name: fleetForm.name,
        description: fleetForm.description,
        year: parseInt(fleetForm.year),
        range_km: parseInt(fleetForm.range_km),
        transmission_type: fleetForm.transmission_type,
        category: fleetForm.category,
        luggage_capacity: parseInt(fleetForm.luggage_capacity),
        base_price_per_hour: parseFloat(fleetForm.base_price_per_hour),
        features: fleetForm.features.filter(f => f.trim()),
        capacity: parseInt(fleetForm.capacity),
        status: fleetForm.status,
        is_active: fleetForm.is_active,
      };
      if (fleetForm.mediaUrls.length > 0) {
        body.media = fleetForm.mediaUrls.map((url, order) => ({ url, type: 'image', order }));
      }

      const editId = fleetModal.editing?.id;
      const res = await fetch(
        editId ? `${base}api/cars/${editId}` : `${base}api/cars`,
        { method: editId ? 'PUT' : 'POST', headers: authHeaders, body: JSON.stringify(body) }
      );
      if (guard(res)) return;
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? 'Veículo atualizado!' : 'Veículo criado!');
        setFleetModal({ open: false, editing: null });
        fetchData();
      } else {
        toast.error(data.message || 'Erro ao guardar veículo.');
      }
    } catch {
      toast.error('Erro ao guardar.');
    } finally {
      setSavingFleet(false);
    }
  };

  const deleteFleet = async (id: number) => {
    try {
      const res = await fetch(`${base}api/cars/${id}`, { method: 'DELETE', headers: authHeaders });
      if (guard(res)) return;
      const data = await res.json();
      if (data.success) { toast.success('Veículo eliminado!'); setDeletingFleet(null); fetchData(); }
      else toast.error(data.message || 'Erro ao eliminar.');
    } catch { toast.error('Erro ao eliminar.'); }
  };

  // ── Service CRUD ──────────────────────────

  const openCreateService = () => { setServiceForm(EMPTY_SERVICE); setServiceModal({ open: true, editing: null }); };

  const openEditService = (s: ServiceItem) => {
    const n = typeof s.name === 'object' && s.name ? s.name : { pt: String(s.name || '') };
    const d = typeof s.description === 'object' && s.description ? s.description : { pt: String(s.description || '') };
    setServiceForm({
      name_pt: n.pt || '', name_en: n.en || '',
      description_pt: d.pt || '', description_en: d.en || '',
      is_active: s.is_active ?? true,
      image_url: s.image_url || '',
      fleetIds: (s.fleets || []).map(f => f.id),
    });
    setServiceModal({ open: true, editing: s });
  };

  const saveService = async () => {
    setSavingService(true);
    try {
      const body: Record<string, unknown> = {
        name: { pt: serviceForm.name_pt, en: serviceForm.name_en || serviceForm.name_pt },
        description: { pt: serviceForm.description_pt, en: serviceForm.description_en || serviceForm.description_pt },
        is_active: serviceForm.is_active,
        image_url: serviceForm.image_url || null,
        fleets: serviceForm.fleetIds.length > 0 ? serviceForm.fleetIds : fleets.slice(0, 1).map(f => f.id),
      };

      const editId = serviceModal.editing?.id;
      const res = await fetch(
        editId ? `${base}api/services/${editId}` : `${base}api/services`,
        { method: editId ? 'PUT' : 'POST', headers: authHeaders, body: JSON.stringify(body) }
      );
      if (guard(res)) return;
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? 'Serviço atualizado!' : 'Serviço criado!');
        setServiceModal({ open: false, editing: null });
        fetchData();
      } else {
        toast.error(data.message || 'Erro ao guardar serviço.');
      }
    } catch {
      toast.error('Erro ao guardar.');
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (id: number) => {
    try {
      const res = await fetch(`${base}api/services/${id}`, { method: 'DELETE', headers: authHeaders });
      if (guard(res)) return;
      const data = await res.json();
      if (data.success) { toast.success('Serviço eliminado!'); setDeletingService(null); fetchData(); }
      else toast.error(data.message || 'Erro ao eliminar.');
    } catch { toast.error('Erro ao eliminar.'); }
  };

  // ── Render ────────────────────────────────

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">

      {/* ════════════════ VEÍCULOS ════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Car className="w-5 h-5" /> Veículos ({fleets.length})
          </h2>
          <button onClick={openCreateFleet}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors">
            <Plus className="w-4 h-4" /> Novo Veículo
          </button>
        </div>

        <div className="grid gap-3">
          {fleets.map(fleet => (
            <div key={fleet.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              {fleet.media[0]
                ? <img src={fleet.media[0].url} alt={fleet.name} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-20 h-14 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0"><Car className="w-6 h-6 text-gray-600" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{fleet.name}</p>
                <p className="text-gray-400 text-sm">{fleet.category} · {fleet.capacity} pax · {fleet.luggage_capacity} malas</p>
                <p className="text-amber-400 text-sm font-medium">€{Number(fleet.base_price_per_hour).toFixed(2)}/h</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEditFleet(fleet)} title="Editar"
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeletingFleet(fleet.id)} title="Eliminar"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ SERVIÇOS ════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Serviços ({services.length})
          </h2>
          <button onClick={openCreateService}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors">
            <Plus className="w-4 h-4" /> Novo Serviço
          </button>
        </div>

        <div className="grid gap-3">
          {services.map(service => (
            <div key={service.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              {service.image_url
                ? <img src={service.image_url} alt={getName(service.name)} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-20 h-14 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0"><Settings className="w-6 h-6 text-gray-600" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{getName(service.name)}</p>
                <p className="text-gray-400 text-sm">{(service.fleets || []).length} veículo(s) associado(s)</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEditService(service)} title="Editar"
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeletingService(service.id)} title="Eliminar"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ MODAL VEÍCULO ════════════════ */}
      {fleetModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">
                {fleetModal.editing ? 'Editar Veículo' : 'Novo Veículo'}
              </h3>
              <button onClick={() => setFleetModal({ open: false, editing: null })} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">

              {/* Nome + Categoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                  <input value={fleetForm.name} onChange={e => setFleetForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Mercedes-Benz Classe E"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Categoria *</label>
                  <input value={fleetForm.category} onChange={e => setFleetForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Business Class"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Descrição *</label>
                <textarea value={fleetForm.description} onChange={e => setFleetForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Mercedes E-Class, BMW 5 Series, ou similar"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400 resize-none" />
              </div>

              {/* Ano + Transmissão + Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ano *</label>
                  <input type="number" value={fleetForm.year} onChange={e => setFleetForm(p => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Transmissão *</label>
                  <select value={fleetForm.transmission_type} onChange={e => setFleetForm(p => ({ ...p, transmission_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400">
                    <option value="Automatic">Automática</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Estado *</label>
                  <select value={fleetForm.status} onChange={e => setFleetForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400">
                    <option value="available">Disponível</option>
                    <option value="out_of_service">Fora de Serviço</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Passageiros + Bagagens + Autonomia */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Passageiros *</label>
                  <input type="number" min="1" value={fleetForm.capacity} onChange={e => setFleetForm(p => ({ ...p, capacity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bagagens *</label>
                  <input type="number" min="0" value={fleetForm.luggage_capacity} onChange={e => setFleetForm(p => ({ ...p, luggage_capacity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Autonomia (km) *</label>
                  <input type="number" min="1" value={fleetForm.range_km} onChange={e => setFleetForm(p => ({ ...p, range_km: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
              </div>

              {/* Preço + Ativo */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preço por hora (€) *</label>
                  <input type="number" min="0.01" step="0.01" value={fleetForm.base_price_per_hour}
                    onChange={e => setFleetForm(p => ({ ...p, base_price_per_hour: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-1">
                  <input type="checkbox" checked={fleetForm.is_active}
                    onChange={e => setFleetForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm text-gray-300">Ativo</span>
                </label>
              </div>

              {/* Características */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Características *</label>
                <div className="space-y-2">
                  {fleetForm.features.map((feat, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={feat}
                        onChange={e => { const u = [...fleetForm.features]; u[i] = e.target.value; setFleetForm(p => ({ ...p, features: u })); }}
                        placeholder="Ex: WiFi incluído"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                      <button onClick={() => setFleetForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setFleetForm(p => ({ ...p, features: [...p.features, ''] }))}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Adicionar característica
                  </button>
                </div>
              </div>

              {/* Imagens */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Imagens</label>
                <div className="space-y-2">
                  {fleetForm.mediaUrls.map((url, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-800 rounded-lg p-2">
                      <img src={url} alt="" className="w-16 h-11 object-cover rounded flex-shrink-0"
                        onError={e => (e.currentTarget.style.display = 'none')} />
                      <p className="flex-1 text-xs text-gray-400 truncate">{url.split('/').pop()}</p>
                      <button onClick={() => setFleetForm(p => ({ ...p, mediaUrls: p.mediaUrls.filter((_, idx) => idx !== i) }))}
                        className="p-1.5 text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <ImageUploader base={base} authToken={authToken} label="Adicionar imagem"
                    onUploaded={url => setFleetForm(p => ({ ...p, mediaUrls: [...p.mediaUrls, url] }))} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button onClick={() => setFleetModal({ open: false, editing: null })}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={saveFleet} disabled={savingFleet}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingFleet ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL SERVIÇO ════════════════ */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">
                {serviceModal.editing ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button onClick={() => setServiceModal({ open: false, editing: null })} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">

              {/* Nome PT + EN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome (PT) *</label>
                  <input value={serviceForm.name_pt} onChange={e => setServiceForm(p => ({ ...p, name_pt: e.target.value }))}
                    placeholder="Transfers Aeroporto"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nome (EN)</label>
                  <input value={serviceForm.name_en} onChange={e => setServiceForm(p => ({ ...p, name_en: e.target.value }))}
                    placeholder="Airport Transfers"
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400" />
                </div>
              </div>

              {/* Descrição PT + EN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Descrição (PT) *</label>
                  <textarea value={serviceForm.description_pt} onChange={e => setServiceForm(p => ({ ...p, description_pt: e.target.value }))}
                    rows={3} placeholder="Serviço confiável de/para o aeroporto..."
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400 resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Descrição (EN)</label>
                  <textarea value={serviceForm.description_en} onChange={e => setServiceForm(p => ({ ...p, description_en: e.target.value }))}
                    rows={3} placeholder="Reliable transfer to/from airport..."
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-400 resize-none" />
                </div>
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Imagem</label>
                {serviceForm.image_url && (
                  <div className="flex items-center gap-3 mb-2 bg-gray-800 rounded-lg p-2">
                    <img src={serviceForm.image_url} alt="" className="w-20 h-14 object-cover rounded"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                    <p className="flex-1 text-xs text-gray-400 truncate">{serviceForm.image_url.split('/').pop()}</p>
                    <button onClick={() => setServiceForm(p => ({ ...p, image_url: '' }))}
                      className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <ImageUploader base={base} authToken={authToken}
                  label={serviceForm.image_url ? 'Substituir imagem' : 'Carregar imagem'}
                  onUploaded={url => setServiceForm(p => ({ ...p, image_url: url }))} />
              </div>

              {/* Veículos associados */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Veículos associados *</label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {fleets.map(f => (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors">
                      <input type="checkbox" checked={serviceForm.fleetIds.includes(f.id)}
                        onChange={e => setServiceForm(p => ({
                          ...p,
                          fleetIds: e.target.checked ? [...p.fleetIds, f.id] : p.fleetIds.filter(id => id !== f.id),
                        }))}
                        className="w-4 h-4 accent-amber-500" />
                      <span className="text-sm text-gray-300">{f.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">€{Number(f.base_price_per_hour).toFixed(2)}/h</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ativo */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={serviceForm.is_active}
                  onChange={e => setServiceForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-300">Serviço ativo</span>
              </label>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-700">
              <button onClick={() => setServiceModal({ open: false, editing: null })}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={saveService} disabled={savingService}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-gray-900 hover:bg-amber-400 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingService ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ CONFIRMAR ELIMINAR VEÍCULO ════════════════ */}
      {deletingFleet !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Eliminar Veículo?</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação não pode ser revertida.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingFleet(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => deleteFleet(deletingFleet)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ CONFIRMAR ELIMINAR SERVIÇO ════════════════ */}
      {deletingService !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Eliminar Serviço?</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação não pode ser revertida.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingService(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => deleteService(deletingService)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagementView;
