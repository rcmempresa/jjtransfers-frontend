import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
    LogOut, RefreshCw, ChevronLeft, ChevronRight,
    Clock, CheckCircle, XCircle, Flag, Euro,
    CalendarDays, Car, User, Phone, Mail,
    MapPin, FileText, AlertCircle, Edit2, Ban,
    LayoutDashboard, List, Calendar, Unlock, Search,
    Settings, Plus, Trash2, Save, BookOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ManagementView from './ManagementView';
import BlogManagement from './BlogManagement';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type AdminTab = 'dashboard' | 'reservations' | 'calendar' | 'management' | 'blog';

interface Reservation {
    id: number;
    status: ReservationStatus;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    pickup_address: string;
    dropoff_address: string;
    trip_pickup_time: string;
    trip_duration_minutes: number;
    final_price: string;
    special_requests: string | null;
    payment_intent_id: string | null;
    created_at: string;
    updated_at: string;
    fleet_name: string;
    fleet_category: string;
    service_name: string;
    user_email: string | null;
}

interface Stats {
    pending: string;
    confirmed: string;
    completed: string;
    cancelled: string;
    total: string;
    revenue: string;
}

interface BlockedDate {
    id: number;
    date: string;
    reason: string | null;
}

interface CalendarReservation {
    id: number;
    status: ReservationStatus;
    passenger_name: string;
    trip_pickup_time: string;
    final_price: string;
    fleet_name: string;
    service_name: string;
}

interface CalendarDayData {
    booking_date: string;
    reservations: CalendarReservation[];
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STATUS_CONFIG: Record<ReservationStatus, { label: string; bg: string; text: string; dot: string }> = {
    PENDING:   { label: 'Pendente',   bg: 'bg-yellow-900/50', text: 'text-yellow-300', dot: 'bg-yellow-400' },
    CONFIRMED: { label: 'Confirmada', bg: 'bg-green-900/50',  text: 'text-green-300',  dot: 'bg-green-400'  },
    COMPLETED: { label: 'Concluída',  bg: 'bg-blue-900/50',   text: 'text-blue-300',   dot: 'bg-blue-400'   },
    CANCELLED: { label: 'Cancelada',  bg: 'bg-red-900/50',    text: 'text-red-300',    dot: 'bg-red-400'    },
};

const NEXT_STATUSES: Record<ReservationStatus, ReservationStatus[]> = {
    PENDING:   ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};

const ACTION_CONFIG: Record<ReservationStatus, { label: string; color: string }> = {
    CONFIRMED: { label: 'Confirmar', color: 'bg-green-600 hover:bg-green-500' },
    COMPLETED: { label: 'Concluir',  color: 'bg-blue-600 hover:bg-blue-500'   },
    CANCELLED: { label: 'Cancelar',  color: 'bg-red-700 hover:bg-red-600'     },
    PENDING:   { label: 'Pendente',  color: 'bg-yellow-700 hover:bg-yellow-600' },
};

const STATUS_FILTERS = [
    { label: 'Todas',      value: 'ALL'       },
    { label: 'Pendentes',  value: 'PENDING'   },
    { label: 'Confirmadas',value: 'CONFIRMED' },
    { label: 'Concluídas', value: 'COMPLETED' },
    { label: 'Canceladas', value: 'CANCELLED' },
];

const WEEKDAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS_PT   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });

const formatPrice = (val: string) =>
    parseFloat(val).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

const toDatetimeLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Returns array of Date|null for a Monday-first calendar grid
const getCalendarDays = (year: number, month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Mon=0 … Sun=6
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
};

// ─────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ReservationStatus }) => {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }: {
    label: string; value: string | number; icon: React.ElementType; color: string;
}) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// EditReservationModal
// ─────────────────────────────────────────────
interface EditForm {
    trip_pickup_time: string;
    trip_duration_minutes: string;
    pickup_address: string;
    dropoff_address: string;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    special_requests: string;
}

const EditReservationModal = ({
    reservation, onClose, onSaved, onUnauthorized, authHeaders, base,
}: {
    reservation: Reservation;
    onClose: () => void;
    onSaved: () => void;
    onUnauthorized: () => void;
    authHeaders: Record<string, string>;
    base: string;
}) => {
    const [form, setForm] = useState<EditForm>({
        trip_pickup_time:     toDatetimeLocal(reservation.trip_pickup_time),
        trip_duration_minutes: String(reservation.trip_duration_minutes),
        pickup_address:        reservation.pickup_address,
        dropoff_address:       reservation.dropoff_address,
        passenger_name:        reservation.passenger_name,
        passenger_email:       reservation.passenger_email,
        passenger_phone:       reservation.passenger_phone,
        special_requests:      reservation.special_requests || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${base}api/admin/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({
                    ...form,
                    trip_pickup_time:      new Date(form.trip_pickup_time).toISOString(),
                    trip_duration_minutes: parseInt(form.trip_duration_minutes),
                    special_requests:      form.special_requests || null,
                }),
            });
            if (res.status === 401) { onUnauthorized(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Erro ao guardar.');
            toast.success(`Reserva #${reservation.id} atualizada.`);
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao guardar.');
        } finally {
            setIsSaving(false);
        }
    };

    const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors';
    const labelCls = 'block text-xs text-gray-400 mb-1';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white">Editar Reserva #{reservation.id}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Data e Hora de Recolha</label>
                            <input type="datetime-local" name="trip_pickup_time" value={form.trip_pickup_time} onChange={handleChange} className={inputCls} required />
                        </div>
                        <div>
                            <label className={labelCls}>Duração (minutos)</label>
                            <input type="number" name="trip_duration_minutes" value={form.trip_duration_minutes} onChange={handleChange} className={inputCls} min="1" required />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Origem</label>
                        <input type="text" name="pickup_address" value={form.pickup_address} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Destino</label>
                        <input type="text" name="dropoff_address" value={form.dropoff_address} onChange={handleChange} className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Nome do Passageiro</label>
                            <input type="text" name="passenger_name" value={form.passenger_name} onChange={handleChange} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Telefone</label>
                            <input type="tel" name="passenger_phone" value={form.passenger_phone} onChange={handleChange} className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Email do Passageiro</label>
                        <input type="email" name="passenger_email" value={form.passenger_email} onChange={handleChange} className={inputCls} />
                    </div>

                    <div>
                        <label className={labelCls}>Pedidos Especiais</label>
                        <textarea name="special_requests" value={form.special_requests} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50">
                            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// DetailModal
// ─────────────────────────────────────────────
const DetailModal = ({
    reservation, onClose, onStatusChange, onEdit, isUpdating,
}: {
    reservation: Reservation;
    onClose: () => void;
    onStatusChange: (id: number, status: ReservationStatus) => void;
    onEdit: () => void;
    isUpdating: boolean;
}) => {
    const nextStatuses = NEXT_STATUSES[reservation.status];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h3 className="text-lg font-bold text-white">Reserva #{reservation.id}</h3>
                        <div className="mt-1"><StatusBadge status={reservation.status} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors" title="Editar reserva">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Passageiro</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300 text-sm"><User className="w-4 h-4 text-gray-500 shrink-0" />{reservation.passenger_name}</div>
                            <div className="flex items-center gap-2 text-gray-300 text-sm"><Mail className="w-4 h-4 text-gray-500 shrink-0" />{reservation.passenger_email}</div>
                            <div className="flex items-center gap-2 text-gray-300 text-sm"><Phone className="w-4 h-4 text-gray-500 shrink-0" />{reservation.passenger_phone}</div>
                            {reservation.user_email && reservation.user_email !== reservation.passenger_email && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs"><User className="w-3 h-3 text-gray-600 shrink-0" />Conta: {reservation.user_email}</div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Viagem</h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-gray-300 text-sm">
                                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div><span className="text-gray-500 text-xs block">Origem</span>{reservation.pickup_address}</div>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300 text-sm">
                                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div><span className="text-gray-500 text-xs block">Destino</span>{reservation.dropoff_address}</div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                                {formatDate(reservation.trip_pickup_time)}
                                <span className="text-gray-500">({reservation.trip_duration_minutes} min)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                <Car className="w-4 h-4 text-gray-500 shrink-0" />
                                {reservation.fleet_name}
                                {reservation.fleet_category && <span className="text-gray-500 text-xs">· {reservation.fleet_category}</span>}
                            </div>
                            {reservation.service_name && (
                                <div className="flex items-center gap-2 text-gray-300 text-sm"><Flag className="w-4 h-4 text-gray-500 shrink-0" />{reservation.service_name}</div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pagamento</h4>
                        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                            <span className="text-gray-400 text-sm">Total</span>
                            <span className="text-amber-400 font-bold text-lg">{formatPrice(reservation.final_price)}</span>
                        </div>
                        {reservation.payment_intent_id && (
                            <p className="text-gray-600 text-xs mt-2">ID EasyPay: {reservation.payment_intent_id}</p>
                        )}
                    </section>

                    {reservation.special_requests && (
                        <section>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pedidos Especiais</h4>
                            <div className="flex items-start gap-2 text-gray-300 text-sm bg-gray-800 rounded-lg p-3">
                                <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                {reservation.special_requests}
                            </div>
                        </section>
                    )}

                    <p className="text-gray-600 text-xs">Criada em {formatDate(reservation.created_at)}</p>
                </div>

                {nextStatuses.length > 0 && (
                    <div className="p-6 border-t border-gray-800 flex gap-3">
                        {nextStatuses.map((s) => (
                            <button key={s} onClick={() => onStatusChange(reservation.id, s)} disabled={isUpdating}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${ACTION_CONFIG[s].color}`}>
                                {isUpdating ? 'A atualizar...' : ACTION_CONFIG[s].label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CreateReservationModal
// ─────────────────────────────────────────────
interface FleetOption { id: number; name: string; category: string; }
interface ServiceOption { id: number; name: string; }

const emptyCreate = (date?: string) => ({
    passenger_name: '',
    passenger_email: '',
    passenger_phone: '',
    pickup_address: '',
    dropoff_address: '',
    trip_pickup_time: date ? `${date}T09:00` : '',
    trip_duration_minutes: '60',
    fleet_id: '',
    service_id: '',
    final_price: '',
    special_requests: '',
    status: 'CONFIRMED' as ReservationStatus,
});

const CreateReservationModal = ({
    initialDate, onClose, onSaved, authHeaders, base,
}: {
    initialDate?: string;
    onClose: () => void;
    onSaved: () => void;
    authHeaders: Record<string, string>;
    base: string;
}) => {
    const [form, setForm] = useState(emptyCreate(initialDate));
    const [isSaving, setIsSaving] = useState(false);
    const [fleets, setFleets] = useState<FleetOption[]>([]);
    const [services, setServices] = useState<ServiceOption[]>([]);

    useEffect(() => {
        fetch(`${base}api/cars`).then(r => r.json()).then(d => {
            const list = Array.isArray(d) ? d : (d.data || []);
            setFleets(list.map((c: any) => ({ id: c.id, name: c.name, category: c.category })));
        }).catch(() => {});
        fetch(`${base}api/services`).then(r => r.json()).then(d => {
            const list = Array.isArray(d) ? d : (d.data || []);
            setServices(list.map((s: any) => ({ id: s.id, name: s.name?.pt || s.name || 'Serviço' })));
        }).catch(() => {});
    }, [base]);

    const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${base}api/admin/reservations`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    ...form,
                    fleet_id: parseInt(form.fleet_id),
                    service_id: form.service_id ? parseInt(form.service_id) : null,
                    trip_duration_minutes: parseInt(form.trip_duration_minutes),
                    final_price: form.final_price ? parseFloat(form.final_price) : 0,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Erro ao criar reserva.');
            toast.success('Reserva criada com sucesso!');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao criar reserva.');
        } finally {
            setIsSaving(false);
        }
    };

    const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400';
    const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-amber-400" /> Nova Reserva
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Passageiro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Nome do Passageiro *</label>
                            <input required className={inputCls} value={form.passenger_name} onChange={e => set('passenger_name', e.target.value)} placeholder="Nome completo" />
                        </div>
                        <div>
                            <label className={labelCls}>Email *</label>
                            <input required type="email" className={inputCls} value={form.passenger_email} onChange={e => set('passenger_email', e.target.value)} placeholder="email@exemplo.com" />
                        </div>
                        <div>
                            <label className={labelCls}>Telefone</label>
                            <input className={inputCls} value={form.passenger_phone} onChange={e => set('passenger_phone', e.target.value)} placeholder="+351 ..." />
                        </div>
                        <div>
                            <label className={labelCls}>Preço Final (€)</label>
                            <input type="number" step="0.01" min="0" className={inputCls} value={form.final_price} onChange={e => set('final_price', e.target.value)} placeholder="0.00" />
                        </div>
                    </div>

                    {/* Viagem */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Data e Hora de Recolha *</label>
                            <input required type="datetime-local" className={inputCls} value={form.trip_pickup_time} onChange={e => set('trip_pickup_time', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Duração (minutos)</label>
                            <input type="number" min="15" className={inputCls} value={form.trip_duration_minutes} onChange={e => set('trip_duration_minutes', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Local de Recolha</label>
                            <input className={inputCls} value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} placeholder="Aeroporto do Funchal..." />
                        </div>
                        <div>
                            <label className={labelCls}>Local de Destino</label>
                            <input className={inputCls} value={form.dropoff_address} onChange={e => set('dropoff_address', e.target.value)} placeholder="Hotel, morada..." />
                        </div>
                    </div>

                    {/* Veículo e Serviço */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Veículo *</label>
                            <select required className={inputCls} value={form.fleet_id} onChange={e => set('fleet_id', e.target.value)}>
                                <option value="">Selecionar veículo...</option>
                                {fleets.map(f => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Serviço</label>
                            <select className={inputCls} value={form.service_id} onChange={e => set('service_id', e.target.value)}>
                                <option value="">Selecionar serviço...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Estado</label>
                            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="CONFIRMED">Confirmada</option>
                                <option value="PENDING">Pendente</option>
                                <option value="COMPLETED">Concluída</option>
                            </select>
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className={labelCls}>Notas / Pedidos Especiais</label>
                        <textarea rows={3} className={inputCls} value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Informação adicional..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-900 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Criar Reserva
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// CalendarView
// ─────────────────────────────────────────────
const CalendarView = ({ authHeaders, base, onUnauthorized, onReservationClick, onNewReservation }: { authHeaders: Record<string, string>; base: string; onUnauthorized: () => void; onReservationClick: (id: number) => void; onNewReservation: (date: string) => void }) => {
    const today = new Date();
    const [viewYear,  setViewYear]  = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
    const [calData,   setCalData]   = useState<{ reservations: CalendarDayData[]; blockedDates: BlockedDate[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYY-MM-DD
    const [blockReason, setBlockReason] = useState('');
    const [isBlocking, setIsBlocking] = useState(false);

    const fetchCalendar = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${base}api/admin/calendar?year=${viewYear}&month=${viewMonth + 1}`, { headers: authHeaders });
            if (res.status === 401) { onUnauthorized(); return; }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                setCalData(data.data);
            } else {
                throw new Error(data.message || 'Resposta inválida do servidor.');
            }
        } catch (err) {
            toast.error(`Erro ao carregar calendário: ${err instanceof Error ? err.message : err}`);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base, viewYear, viewMonth]);

    useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

    const calDays = getCalendarDays(viewYear, viewMonth);

    const reservationMap = new Map<string, CalendarReservation[]>();
    // booking_date pode vir como "2027-01-18T00:00:00.000Z" — extrair só a parte da data
    calData?.reservations.forEach((d) => reservationMap.set(d.booking_date.substring(0, 10), d.reservations));

    const blockedMap = new Map<string, BlockedDate>();
    calData?.blockedDates.forEach((b) => blockedMap.set(b.date, b));

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
        else setViewMonth((m) => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
        else setViewMonth((m) => m + 1);
        setSelectedDay(null);
    };

    const handleBlockDay = async (dateStr: string) => {
        setIsBlocking(true);
        try {
            const res = await fetch(`${base}api/admin/blocked-dates`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ date: dateStr, reason: blockReason || null }),
            });
            if (res.status === 401) { onUnauthorized(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);
            toast.success(`Dia ${dateStr} bloqueado.`);
            setBlockReason('');
            fetchCalendar();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao bloquear dia.');
        } finally {
            setIsBlocking(false);
        }
    };

    const handleUnblockDay = async (blocked: BlockedDate) => {
        setIsBlocking(true);
        try {
            const res = await fetch(`${base}api/admin/blocked-dates/${blocked.id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            if (res.status === 401) { onUnauthorized(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);
            toast.success(`Dia ${blocked.date} desbloqueado.`);
            fetchCalendar();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao desbloquear dia.');
        } finally {
            setIsBlocking(false);
        }
    };

    const selectedDayReservations = selectedDay ? (reservationMap.get(selectedDay) || []) : [];
    const selectedDayBlocked      = selectedDay ? blockedMap.get(selectedDay) : undefined;
    const todayStr = toDateString(today);

    return (
        <div className="space-y-4">
            {/* Calendar Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                {/* Month navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white">
                        {MONTHS_PT[viewMonth]} {viewYear}
                    </h2>
                    <div className="flex items-center gap-1">
                        {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-gray-500 mr-2" />}
                        <button onClick={prevMonth} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(null); }}
                            className="px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            Hoje
                        </button>
                        <button onClick={nextMonth} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-gray-800">
                    {WEEKDAYS_PT.map((d) => (
                        <div key={d} className="text-center py-2 text-xs font-semibold text-gray-500">{d}</div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                    {calDays.map((day, i) => {
                        if (!day) return (
                            <div key={`e-${i}`} className="h-20 border-b border-r border-gray-800/40 last:border-r-0" />
                        );

                        const dateStr      = toDateString(day);
                        const dayRes       = reservationMap.get(dateStr) || [];
                        const isBlocked    = blockedMap.has(dateStr);
                        const isToday      = dateStr === todayStr;
                        const isSelected   = dateStr === selectedDay;
                        const isPast       = day < today && !isToday;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                                className={`h-20 border-b border-r border-gray-800/40 last:border-r-0 p-1.5 cursor-pointer transition-colors
                                    ${isBlocked  ? 'bg-red-950/40' : ''}
                                    ${isSelected ? 'ring-1 ring-inset ring-amber-400/50 bg-amber-400/5' : 'hover:bg-gray-800/50'}
                                    ${isPast && !isBlocked ? 'opacity-60' : ''}
                                `}
                            >
                                {/* Day number */}
                                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                                    ${isToday   ? 'bg-amber-400 text-gray-900' :
                                      isBlocked ? 'text-red-400' :
                                      'text-gray-400'}`}>
                                    {day.getDate()}
                                </div>

                                {/* Blocked indicator */}
                                {isBlocked && (
                                    <div className="flex items-center gap-0.5 mb-0.5">
                                        <Ban className="w-2.5 h-2.5 text-red-400" />
                                        <span className="text-red-400 text-[9px] leading-none">Bloqueado</span>
                                    </div>
                                )}

                                {/* Reservation dots */}
                                {dayRes.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                                        {dayRes.slice(0, 5).map((r) => (
                                            <span key={r.id} className={`w-2 h-2 rounded-full ${STATUS_CONFIG[r.status].dot}`} title={r.passenger_name} />
                                        ))}
                                        {dayRes.length > 5 && (
                                            <span className="text-[9px] text-gray-500 leading-none self-center">+{dayRes.length - 5}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* Empty state */}
                {!isLoading && calData && calData.reservations.length === 0 && (
                    <div className="px-6 py-4 text-sm text-gray-500 text-center border-t border-gray-800">
                        Sem reservas neste mês. Use as setas ‹ › para navegar.
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 px-1 text-xs text-gray-500">
                {(Object.entries(STATUS_CONFIG) as [ReservationStatus, typeof STATUS_CONFIG[ReservationStatus]][]).map(([s, cfg]) => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <Ban className="w-2.5 h-2.5 text-red-400" />
                    Bloqueado
                </div>
            </div>

            {/* Day detail panel */}
            {selectedDay && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-base font-bold text-white capitalize">
                            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-PT', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                            <button
                                onClick={() => onNewReservation(selectedDay)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-900/40 hover:bg-amber-900/60 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Nova Reserva
                            </button>

                        {selectedDayBlocked ? (
                            <button
                                onClick={() => handleUnblockDay(selectedDayBlocked)}
                                disabled={isBlocking}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-300 bg-green-900/40 hover:bg-green-900/60 transition-colors disabled:opacity-50 self-start sm:self-auto"
                            >
                                <Unlock className="w-3.5 h-3.5" />
                                Desbloquear Dia
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <input
                                    type="text"
                                    placeholder="Motivo (opcional)"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-36 sm:w-44"
                                />
                                <button
                                    onClick={() => handleBlockDay(selectedDay)}
                                    disabled={isBlocking}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 bg-red-900/40 hover:bg-red-900/60 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    <Ban className="w-3.5 h-3.5" />
                                    Bloquear Dia
                                </button>
                            </div>
                        )}
                        </div>
                    </div>

                    {selectedDayBlocked?.reason && (
                        <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
                            <Ban className="w-3 h-3" /> Motivo: {selectedDayBlocked.reason}
                        </p>
                    )}

                    {selectedDayReservations.length === 0 ? (
                        <p className="text-gray-500 text-sm">Sem reservas para este dia.</p>
                    ) : (
                        <div className="space-y-2">
                            {selectedDayReservations.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => onReservationClick(r.id)}
                                    className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 gap-3 cursor-pointer hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <StatusBadge status={r.status} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{r.passenger_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {r.fleet_name} · {new Date(r.trip_pickup_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-amber-400 font-semibold text-sm shrink-0">{formatPrice(r.final_price)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN — AdminDashboard
// ─────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab,           setActiveTab]           = useState<AdminTab>('dashboard');
    const [stats,               setStats]               = useState<Stats | null>(null);
    const [reservations,        setReservations]        = useState<Reservation[]>([]);
    const [total,               setTotal]               = useState(0);
    const [isLoading,           setIsLoading]           = useState(true);
    const [isUpdating,          setIsUpdating]          = useState(false);
    const [statusFilter,        setStatusFilter]        = useState('ALL');
    const [page,                setPage]                = useState(1);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [editingReservation,  setEditingReservation]  = useState<Reservation | null>(null);
    const [pendingCancelId,     setPendingCancelId]     = useState<number | null>(null);
    const [creatingForDate,     setCreatingForDate]     = useState<string | null>(null);
    const [searchQuery,         setSearchQuery]         = useState('');
    const [lastRefreshed,       setLastRefreshed]       = useState<Date | null>(null);

    const LIMIT = 15;

    useEffect(() => {
        if (!isAdmin) navigate('/login', { replace: true, state: { from: '/admin' } });
    }, [isAdmin, navigate]);

    const base = import.meta.env.VITE_BACKEND_URL;

    const authHeaders = useMemo<Record<string, string>>(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
    }), []);

    const handleUnauthorized = useCallback(() => {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        logout();
        navigate('/login', { replace: true, state: { from: '/admin' } });
    }, [logout, navigate]);

    const fetchStats = useCallback(async () => {
        try {
            const res  = await fetch(`${base}api/admin/stats`, { headers: authHeaders });
            if (res.status === 401) { handleUnauthorized(); return; }
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch { /* stats não críticas */ }
    }, [base, authHeaders, handleUnauthorized]);

    const fetchReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter, page: String(page), limit: String(LIMIT) });
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            const res    = await fetch(`${base}api/admin/reservations?${params}`, { headers: authHeaders });
            if (res.status === 401) { handleUnauthorized(); return; }
            const data   = await res.json();
            if (data.success) { setReservations(data.data); setTotal(data.total); }
        } catch {
            toast.error('Erro ao carregar reservas.');
        } finally {
            setIsLoading(false);
        }
    }, [base, authHeaders, statusFilter, page, searchQuery, handleUnauthorized]);

    useEffect(() => {
        if (isAdmin) { fetchStats(); fetchReservations(); setLastRefreshed(new Date()); }
    }, [isAdmin, fetchStats, fetchReservations]);

    // Auto-refresh a cada 60 segundos
    useEffect(() => {
        if (!isAdmin) return;
        const interval = setInterval(() => {
            fetchStats();
            fetchReservations();
            setLastRefreshed(new Date());
        }, 60_000);
        return () => clearInterval(interval);
    }, [isAdmin, fetchStats, fetchReservations]);

    const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
        setIsUpdating(true);
        try {
            const res  = await fetch(`${base}api/admin/reservations/${id}/status`, {
                method: 'PATCH', headers: authHeaders, body: JSON.stringify({ status: newStatus }),
            });
            if (res.status === 401) { handleUnauthorized(); return; }
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message);
            toast.success(`Reserva #${id} → ${STATUS_CONFIG[newStatus].label}`);
            setSelectedReservation(null);
            fetchReservations();
            fetchStats();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao atualizar.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFilterChange = (value: string) => { setStatusFilter(value); setPage(1); };
    const totalPages = Math.ceil(total / LIMIT);

    const handleStatusChangeOrConfirm = (id: number, newStatus: ReservationStatus) => {
        if (newStatus === 'CANCELLED') {
            setPendingCancelId(id);
        } else {
            handleStatusChange(id, newStatus);
        }
    };

    const handleCalendarReservationClick = useCallback(async (id: number) => {
        try {
            const res = await fetch(`${base}api/admin/reservations/${id}`, { headers: authHeaders });
            if (res.status === 401) { handleUnauthorized(); return; }
            const data = await res.json();
            if (data.success && data.data) {
                setSelectedReservation(data.data);
            } else {
                // fallback: muda para o tab de reservas se o endpoint não existir
                setActiveTab('reservations');
            }
        } catch {
            setActiveTab('reservations');
        }
    }, [base, authHeaders, handleUnauthorized]);

    if (!isAdmin) return null;

    const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard',    label: 'Painel',     icon: LayoutDashboard },
        { id: 'reservations', label: 'Reservas',   icon: List            },
        { id: 'calendar',     label: 'Calendário', icon: Calendar        },
        { id: 'management',   label: 'Gestão',     icon: Settings        },
        { id: 'blog',         label: 'Blog',       icon: BookOpen        },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Toaster position="top-right" />

            {/* ── TOP BAR ── */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/assets/logotipo_transparente.png" alt="Logo" className="h-8 w-auto" />
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Painel Admin</h1>
                        <p className="text-xs text-gray-500 mt-0.5">JJ Transfers · Madeira</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </header>

            {/* ── TABS ── */}
            <div className="bg-gray-900 border-b border-gray-800 px-6">
                <div className="flex gap-1 -mb-px">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === id
                                    ? 'border-amber-400 text-amber-400'
                                    : 'border-transparent text-gray-500 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="p-6 max-w-7xl mx-auto space-y-6">

                {/* ════════════════════════ PAINEL ════════════════════════ */}
                {activeTab === 'dashboard' && (
                    <>
                        {stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                <StatCard label="Total"       value={stats.total}     icon={CalendarDays} color="bg-gray-700"   />
                                <StatCard label="Pendentes"   value={stats.pending}   icon={Clock}        color="bg-yellow-700" />
                                <StatCard label="Confirmadas" value={stats.confirmed} icon={CheckCircle}  color="bg-green-700"  />
                                <StatCard label="Concluídas"  value={stats.completed} icon={Flag}         color="bg-blue-700"   />
                                <StatCard label="Canceladas"  value={stats.cancelled} icon={XCircle}      color="bg-red-700"    />
                                <StatCard
                                    label="Receita"
                                    value={parseFloat(stats.revenue).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                                    icon={Euro}
                                    color="bg-amber-700"
                                />
                            </div>
                        )}

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                                <h2 className="font-bold text-white">Últimas Reservas</h2>
                                <button onClick={() => setActiveTab('reservations')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                                    Ver todas →
                                </button>
                            </div>
                            {isLoading ? (
                                <div className="py-12 text-center text-gray-500">
                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                    A carregar...
                                </div>
                            ) : reservations.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                    Sem reservas.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {reservations.slice(0, 5).map((r) => (
                                        <div
                                            key={r.id}
                                            onClick={() => setSelectedReservation(r)}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <StatusBadge status={r.status} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{r.passenger_name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{r.fleet_name} · {formatDate(r.trip_pickup_time)}</p>
                                                </div>
                                            </div>
                                            <span className="text-amber-400 font-semibold text-sm shrink-0 ml-3">{formatPrice(r.final_price)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ════════════════════════ RESERVAS ════════════════════════ */}
                {activeTab === 'reservations' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-800">
                            <div className="flex gap-1 flex-wrap">
                                {STATUS_FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => handleFilterChange(f.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            statusFilter === f.value
                                                ? 'bg-amber-400 text-gray-900'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Nome, email ou #ID..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                        className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 w-44 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <button
                                        onClick={() => { fetchReservations(); fetchStats(); setLastRefreshed(new Date()); }}
                                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Atualizar
                                    </button>
                                    {lastRefreshed && (
                                        <span className="text-[10px] text-gray-600">
                                            às {lastRefreshed.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table — desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="text-left py-3 px-4">#</th>
                                        <th className="text-left py-3 px-4">Passageiro</th>
                                        <th className="text-left py-3 px-4">Veículo / Serviço</th>
                                        <th className="text-left py-3 px-4">Data / Hora</th>
                                        <th className="text-right py-3 px-4">Valor</th>
                                        <th className="text-center py-3 px-4">Status</th>
                                        <th className="text-center py-3 px-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-gray-500">
                                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                A carregar...
                                            </td>
                                        </tr>
                                    ) : reservations.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-gray-500">
                                                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                                Nenhuma reserva encontrada.
                                            </td>
                                        </tr>
                                    ) : reservations.map((r) => (
                                        <tr
                                            key={r.id}
                                            onClick={() => setSelectedReservation(r)}
                                            className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">{r.id}</td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-white">{r.passenger_name}</p>
                                                <p className="text-gray-500 text-xs">{r.passenger_email}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-gray-200">{r.fleet_name}</p>
                                                <p className="text-gray-500 text-xs">{r.service_name}</p>
                                            </td>
                                            <td className="py-3 px-4 text-gray-300 text-xs whitespace-nowrap">
                                                {formatDate(r.trip_pickup_time)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-amber-400">
                                                {formatPrice(r.final_price)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setEditingReservation(r)}
                                                        className="p-1.5 rounded text-gray-500 hover:text-amber-400 hover:bg-gray-800 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    {NEXT_STATUSES[r.status].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusChangeOrConfirm(r.id, s)}
                                                            disabled={isUpdating}
                                                            className={`px-2.5 py-1 rounded text-xs font-semibold text-white transition-colors disabled:opacity-50 ${ACTION_CONFIG[s].color}`}
                                                        >
                                                            {ACTION_CONFIG[s].label}
                                                        </button>
                                                    ))}
                                                    {NEXT_STATUSES[r.status].length === 0 && (
                                                        <span className="text-gray-600 text-xs">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards — mobile */}
                        <div className="md:hidden divide-y divide-gray-800">
                            {isLoading ? (
                                <div className="py-12 text-center text-gray-500">
                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                    A carregar...
                                </div>
                            ) : reservations.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                                    Nenhuma reserva encontrada.
                                </div>
                            ) : reservations.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => setSelectedReservation(r)}
                                    className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-white">{r.passenger_name}</p>
                                            <p className="text-gray-500 text-xs">{r.passenger_email}</p>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-xs text-gray-400 space-y-0.5">
                                            <p>{r.fleet_name}</p>
                                            <p>{formatDate(r.trip_pickup_time)}</p>
                                        </div>
                                        <span className="font-bold text-amber-400">{formatPrice(r.final_price)}</span>
                                    </div>
                                    {NEXT_STATUSES[r.status].length > 0 && (
                                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                            {NEXT_STATUSES[r.status].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusChangeOrConfirm(r.id, s)}
                                                    disabled={isUpdating}
                                                    className={`flex-1 py-1.5 rounded text-xs font-semibold text-white transition-colors disabled:opacity-50 ${ACTION_CONFIG[s].color}`}
                                                >
                                                    {ACTION_CONFIG[s].label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                                <span className="text-gray-500 text-xs">
                                    {total} reserva{total !== 1 ? 's' : ''} · página {page} de {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════ CALENDÁRIO ════════════════════════ */}
                {activeTab === 'calendar' && (
                    <CalendarView authHeaders={authHeaders} base={base} onUnauthorized={handleUnauthorized} onReservationClick={handleCalendarReservationClick} onNewReservation={(date) => setCreatingForDate(date)} />
                )}

                {/* ════════════════════════ GESTÃO ════════════════════════ */}
                {activeTab === 'management' && (
                    <ManagementView authHeaders={authHeaders} base={base} onUnauthorized={handleUnauthorized} />
                )}

                {/* ════════════════════════ BLOG ════════════════════════ */}
                {activeTab === 'blog' && (
                    <BlogManagement authHeaders={authHeaders} base={base} />
                )}

            </main>

            {/* ── MODALS ── */}
            {selectedReservation && (
                <DetailModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onStatusChange={handleStatusChangeOrConfirm}
                    onEdit={() => { setEditingReservation(selectedReservation); setSelectedReservation(null); }}
                    isUpdating={isUpdating}
                />
            )}
            {editingReservation && (
                <EditReservationModal
                    reservation={editingReservation}
                    onClose={() => setEditingReservation(null)}
                    onSaved={() => { fetchReservations(); fetchStats(); }}
                    onUnauthorized={handleUnauthorized}
                    authHeaders={authHeaders}
                    base={base}
                />
            )}
            {creatingForDate !== null && (
                <CreateReservationModal
                    initialDate={creatingForDate}
                    onClose={() => setCreatingForDate(null)}
                    onSaved={() => { fetchReservations(); fetchStats(); }}
                    authHeaders={authHeaders}
                    base={base}
                />
            )}

            {/* ── CONFIRMAÇÃO DE CANCELAMENTO ── */}
            {pendingCancelId !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Cancelar Reserva #{pendingCancelId}</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Esta ação é irreversível. Tem a certeza que pretende cancelar esta reserva?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingCancelId(null)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => {
                                    handleStatusChange(pendingCancelId, 'CANCELLED');
                                    setPendingCancelId(null);
                                }}
                                disabled={isUpdating}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
