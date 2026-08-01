import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, Mail, ExternalLink, Pencil, Trash2, X, LogOut, Calendar, UserX, AlertTriangle, Menu, Users, LayoutDashboard, ChevronLeft, UserCircle, CheckCircle, Megaphone, GripVertical, EyeOff, Columns3, Headphones, Settings, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import type { Lead } from '../types';
import DateTimePicker from '../components/DateTimePicker';
import StatusDropdown from '../components/StatusDropdown';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import SidebarBrand from '../components/SidebarBrand';
import './AdminDashboard.css';

type ApiLead = {
  id?: number | string;
  nom?: string;
  email?: string;
  telephone?: string;
  typeDemande?: string;
  statut?: string;
  description?: string;
  calendar_url?: string;
  calendar_id?: string;
  reschedule_url?: string;
  cancel_url?: string;
  rappelEnvoye?: boolean;
  dateRappel?: string;
  dateVisite?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  phone?: string;
  leadType?: string;
  status?: string;
  calendarUrl?: string;
  calendarId?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  reminderSent?: boolean;
  reminderDate?: string;
  valeurVisite?: number | string;
  valeurAVie?: number | string;
  valeurVie?: number | string;
  visitValue?: number | string;
  lifetimeValue?: number | string;
  visitDate?: string;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Toutes les demandes', color: '#6b7280' },
  { value: 'phone-unconfirmed', label: 'Non confirmé', color: '#f59e0b' },
  { value: 'phone-confirmed', label: 'Confirmé', color: '#3b82f6' },
  { value: 'canceled', label: 'Annulé', color: '#9b9b9b' },
  { value: 'no-show', label: 'Absent', color: '#e74c3c' },
  { value: 'completed', label: 'Complété', color: '#27ae60' }
];

const STATUS_OPTIONS_WITHOUT_ALL = STATUS_OPTIONS.filter(opt => opt.value !== 'all');
const LEAD_TYPE_OPTIONS = [
  { value: 'appointment', label: 'Rendez-vous' },
  { value: 'emergency', label: 'Urgence' },
  { value: 'question', label: 'Question' },
];
const REMINDER_OPTIONS = [
  { value: 'false', label: 'Non envoyé' },
  { value: 'true', label: 'Envoyé' },
];
const PIPELINE_COLUMN_ORDER_KEY = 'reactivationflow_pipeline_column_order';
const PIPELINE_HIDDEN_COLUMNS_KEY = 'reactivationflow_pipeline_hidden_columns';
const PIPELINE_COLUMN_DRAG_TYPE = 'application/x-reactivationflow-pipeline-column';
const DEFAULT_PIPELINE_COLUMN_ORDER = STATUS_OPTIONS_WITHOUT_ALL.map(option => option.value);

const loadPipelineColumnOrder = () => {
  try {
    const savedOrder = JSON.parse(localStorage.getItem(PIPELINE_COLUMN_ORDER_KEY) ?? '[]');
    if (!Array.isArray(savedOrder)) return DEFAULT_PIPELINE_COLUMN_ORDER;

    const validSavedStatuses = savedOrder.filter(
      (status): status is string =>
        typeof status === 'string' && DEFAULT_PIPELINE_COLUMN_ORDER.includes(status)
    );
    const missingStatuses = DEFAULT_PIPELINE_COLUMN_ORDER.filter(status => !validSavedStatuses.includes(status));
    return [...validSavedStatuses, ...missingStatuses];
  } catch {
    return DEFAULT_PIPELINE_COLUMN_ORDER;
  }
};

const loadHiddenPipelineColumns = () => {
  try {
    const savedColumns = JSON.parse(localStorage.getItem(PIPELINE_HIDDEN_COLUMNS_KEY) ?? '[]');
    if (!Array.isArray(savedColumns)) return [];
    return savedColumns.filter(
      (status): status is string =>
        typeof status === 'string' && DEFAULT_PIPELINE_COLUMN_ORDER.includes(status)
    );
  } catch {
    return [];
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { messages, intlLocale } = useI18n();
  const cardsText = messages.crmCards;
  const statusFilterOptions = [
    { value: 'all', label: cardsText.all, color: '#6b7280' },
    { value: 'phone-unconfirmed', label: cardsText.unconfirmed, color: '#f59e0b' },
    { value: 'phone-confirmed', label: cardsText.confirmed, color: '#3b82f6' },
    { value: 'canceled', label: cardsText.canceled, color: '#9b9b9b' },
    { value: 'no-show', label: cardsText.absent, color: '#e74c3c' },
    { value: 'completed', label: cardsText.completed, color: '#27ae60' },
  ];
  const dateFilterOptions = [
    { value: 'all', label: cardsText.allDates },
    { value: 'today', label: cardsText.today },
    { value: 'tomorrow', label: cardsText.tomorrow },
  ];
  const sortOptions = [
    { value: 'dateVisiteAsc', label: cardsText.upcomingVisits },
    { value: 'dateVisiteDesc', label: cardsText.distantVisits },
    { value: 'nameAsc', label: cardsText.nameAZ },
    { value: 'nameDesc', label: cardsText.nameZA },
    { value: 'createdDesc', label: cardsText.newest },
    { value: 'createdAsc', label: cardsText.oldest },
  ];
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Lead | null>(null);
  const [editOriginalId, setEditOriginalId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'pipeline'>('pipeline');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Lead['status'] | null>(null);
  const [pipelineColumnOrder, setPipelineColumnOrder] = useState<string[]>(loadPipelineColumnOrder);
  const [hiddenPipelineColumns, setHiddenPipelineColumns] = useState<string[]>(loadHiddenPipelineColumns);
  const [draggedColumnStatus, setDraggedColumnStatus] = useState<string | null>(null);
  const [dragOverColumnStatus, setDragOverColumnStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'dateVisiteAsc' | 'dateVisiteDesc' | 'nameAsc' | 'nameDesc' | 'createdDesc' | 'createdAsc'>('dateVisiteAsc');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadForm, setAddLeadForm] = useState({
    name: '',
    email: '',
    phone: '+1 ',
    leadType: 'appointment' as Lead['leadType'],
    status: 'phone-unconfirmed' as Lead['status'],
    description: '',
    calendarUrl: '',
    calendarId: '',
    rescheduleUrl: '',
    cancelUrl: '',
    dateVisite: '',
    reminderSent: false,
    visitValue: 0,
    lifetimeValue: 0
  });
  const [addLeadSelectedDate, setAddLeadSelectedDate] = useState<Date | null>(null);
  const [addLeadBookedSlots, setAddLeadBookedSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [addLeadAvailabilityLoading, setAddLeadAvailabilityLoading] = useState(false);
  const [addLeadAvailabilityError, setAddLeadAvailabilityError] = useState<string | null>(null);
  const pageSize = 24;

  useEffect(() => {
    fetchLeads('pipeline');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortOrder]);

  useEffect(() => {
    if (!showAddLeadModal) return;

    let isMounted = true;
    const fetchAvailability = async () => {
      setAddLeadAvailabilityLoading(true);
      setAddLeadAvailabilityError(null);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const availabilityUrl = new URL(import.meta.env.VITE_WEBHOOK_CHECK_AVAILABILITY);
        availabilityUrl.searchParams.set('month_start', formatMontrealDateTime(monthStart));
        availabilityUrl.searchParams.set('month_end', formatMontrealDateTime(monthEnd));

        const response = await fetch(availabilityUrl.toString());
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des disponibilites');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Format de disponibilites invalide');
        }
        if (isMounted) {
          setAddLeadBookedSlots(data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Erreur inconnue';
          setAddLeadAvailabilityError(message);
        }
      } finally {
        if (isMounted) {
          setAddLeadAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [showAddLeadModal]);

  const mapStatus = (statut?: string): Lead['status'] => {
    switch ((statut || '').toLowerCase()) {
      case 'phone-unconfirmed':
      case 'phone_unconfirmed':
      case 'whatsapp-pending':
      case 'pending':
      case 'non confirme':
      case 'non confirmé':
      case 'non-confirme':
      case 'non-confirmé':
      case 'attente whatsapp':
      case 'en attente whatsapp':
      case 'verification en attente':
      case 'nouveau':
      case 'new':
        return 'phone-unconfirmed';
      case 'phone-confirmed':
      case 'phone_confirmed':
      case 'whatsapp-confirmed':
      case 'confirme whatsapp':
      case 'confirmé whatsapp':
      case 'confirme':
      case 'confirmé':
      case 'confirmed':
      case 'contacte':
      case 'contacté':
      case 'contacted':
      case 'qualifie':
      case 'qualifié':
      case 'qualified':
      case 'planifie':
      case 'planifié':
      case 'scheduled':
        return 'phone-confirmed';
      case 'annule':
      case 'annulé':
      case 'canceled':
      case 'cancelled':
        return 'canceled';
      case 'absent':
      case 'no-show':
        return 'no-show';
      case 'complete':
      case 'complété':
      case 'completed':
        return 'completed';
      default:
        return 'phone-unconfirmed';
    }
  };

  const mapLeadType = (typeDemande?: string): Lead['leadType'] => {
    switch ((typeDemande || '').toLowerCase()) {
      case 'rendez-vous':
      case 'rendez vous':
      case 'appointment':
        return 'appointment';
      case 'urgence':
      case 'emergency':
        return 'emergency';
      case 'question':
        return 'question';
      default:
        return 'question';
    }
  };

  const normalizeLeads = (data: ApiLead[]): Lead[] => {
    // Filter out empty objects (e.g., [{}]) that indicate no leads
    const validLeads = data.filter(lead => 
      lead && (lead.id || lead.nom || lead.name || lead.email || lead.telephone || lead.phone)
    );
    
    const toMoneyValue = (value: number | string | undefined) => {
      if (value === undefined || value === null || value === '') return 0;
      const parsed = typeof value === 'number'
        ? value
        : Number(value.replace(/\s/g, '').replace(',', '.'));
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    };

    return validLeads.map((lead) => ({
      id: String(lead.id ?? Date.now()),
      name: lead.nom ?? lead.name ?? '',
      email: lead.email ?? '',
      phone: lead.telephone ?? lead.phone ?? '',
      leadType: mapLeadType(lead.typeDemande ?? lead.leadType),
      status: mapStatus(lead.statut ?? lead.status),
      description: lead.description,
      calendarUrl: lead.calendar_url ?? lead.calendarUrl,
      calendarId: lead.calendar_id ?? lead.calendarId,
      rescheduleUrl: lead.reschedule_url ?? lead.rescheduleUrl,
      cancelUrl: lead.cancel_url ?? lead.cancelUrl,
      reminderSent: Boolean(lead.rappelEnvoye ?? lead.reminderSent),
      reminderDate: lead.dateRappel ?? lead.reminderDate,
      dateVisite: lead.dateVisite ?? lead.visitDate,
      visitValue: toMoneyValue(lead.valeurVisite ?? lead.visitValue),
      lifetimeValue: toMoneyValue(lead.valeurAVie ?? lead.valeurVie ?? lead.lifetimeValue),
      updatedAt: lead.updatedAt,
      createdAt: lead.createdAt ?? formatMontrealDateTime(new Date())
    }));
  };

  const fetchLeads = async (mode: 'cards' | 'list' | 'pipeline' = viewMode) => {
    try {
      setLoading(true);
      setError(null);
      const requestedStatuses = mode === 'pipeline'
        ? DEFAULT_PIPELINE_COLUMN_ORDER
        : ['phone-'];
      const responses = await Promise.all(requestedStatuses.map(async statut => {
        const endpoint = new URL(import.meta.env.VITE_WEBHOOK_LEADS);
        endpoint.searchParams.set('statut', statut);
        const response = await fetch(endpoint.toString());

        if (!response.ok) {
          throw new Error(`Failed to fetch ${statut} leads: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data)
          ? data
          : data.value ?? data.leads ?? [];
      }));
      const uniqueLeads = new Map<string, ApiLead>();
      responses.flat().forEach((lead: ApiLead, index) => {
        const key = String(lead.id ?? lead.email ?? lead.telephone ?? `${lead.nom ?? lead.name}-${index}`);
        uniqueLeads.set(key, lead);
      });
      const rawLeads = [...uniqueLeads.values()];
      setLeads(normalizeLeads(rawLeads));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      console.error('Error fetching leads:', err);
      // Fallback to localStorage if webhook fails
      const storedLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      setLeads(normalizeLeads(storedLeads));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case 'phone-unconfirmed': return cardsText.unconfirmed;
      case 'phone-confirmed': return cardsText.confirmed;
      case 'canceled': return cardsText.canceled;
      case 'no-show': return cardsText.absent;
      case 'completed': return cardsText.completed;
      default: return cardsText.unconfirmed;
    }
  };

  // Helper function to check if a date is today in Montreal timezone
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const nowParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(nowParts, 'year') === getPart(dateParts, 'year') &&
           getPart(nowParts, 'month') === getPart(dateParts, 'month') &&
           getPart(nowParts, 'day') === getPart(dateParts, 'day');
  };

  // Helper function to check if a date is tomorrow in Montreal timezone
  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(tomorrow);
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(tomorrowParts, 'year') === getPart(dateParts, 'year') &&
           getPart(tomorrowParts, 'month') === getPart(dateParts, 'month') &&
           getPart(tomorrowParts, 'day') === getPart(dateParts, 'day');
  };



  const filteredByStatus = filterStatus === 'all'
    ? leads
    : leads.filter(lead => lead.status === filterStatus);

  // Apply date filter
  const filteredByDate = dateFilter === 'all'
    ? filteredByStatus
    : filteredByStatus.filter(lead => {
        if (!lead.dateVisite) return false;
        switch (dateFilter) {
          case 'today':
            return isToday(lead.dateVisite);
          case 'tomorrow':
            return isTomorrow(lead.dateVisite);
          default:
            return true;
        }
      });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLeads = normalizedQuery
    ? filteredByDate.filter((lead) => {
        const typeLabel = lead.leadType === 'appointment'
          ? 'rendez-vous'
          : lead.leadType === 'emergency'
            ? 'urgence'
            : 'question';
        const statusLabel = getStatusLabel(lead.status).toLowerCase();
        const haystack = [
          lead.name || '',
          lead.email || '',
          lead.phone || '',
          lead.leadType || '',
          typeLabel,
          lead.status || '',
          statusLabel,
          lead.calendarUrl || '',
          lead.calendarId || '',
          lead.rescheduleUrl || '',
          lead.cancelUrl || ''
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : filteredByDate;

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    // Sorting by name
    if (sortOrder === 'nameAsc') {
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    }
    if (sortOrder === 'nameDesc') {
      return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' });
    }
    
    // Sorting by created date
    if (sortOrder === 'createdDesc') {
      const aCreated = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bCreated = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bCreated - aCreated;
    }
    if (sortOrder === 'createdAsc') {
      const aCreated = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bCreated = b.createdAt ? Date.parse(b.createdAt) : 0;
      return aCreated - bCreated;
    }
    
    // Sorting by visit date (default)
    const aDate = a.dateVisite ? Date.parse(a.dateVisite) : NaN;
    const bDate = b.dateVisite ? Date.parse(b.dateVisite) : NaN;
    const aMissing = Number.isNaN(aDate);
    const bMissing = Number.isNaN(bDate);

    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;

    return sortOrder === 'dateVisiteAsc' ? aDate - bDate : bDate - aDate;
  });

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'phone-unconfirmed': return '#d2ac67';
      case 'phone-confirmed': return '#2d9cdb';
      case 'canceled': return '#9b9b9b';
      case 'no-show': return '#e74c3c';
      case 'completed': return '#27ae60';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Get dates at midnight for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayOnly = new Date(todayOnly);
    yesterdayOnly.setDate(yesterdayOnly.getDate() - 1);
    const tomorrowOnly = new Date(todayOnly);
    tomorrowOnly.setDate(tomorrowOnly.getDate() + 1);
    
    // Format time as HH:MM
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const relativeDays = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

    // Check if date is yesterday, today, or tomorrow
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return `${relativeDays.format(-1, 'day')} ${timeString}`;
    } else if (dateOnly.getTime() === todayOnly.getTime()) {
      return `${relativeDays.format(0, 'day')} ${timeString}`;
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return `${relativeDays.format(1, 'day')} ${timeString}`;
    }
    
    // Default format for other dates
    const dateStr = date.toLocaleDateString(intlLocale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateStr} ${timeString}`;
  };

  const formatMaybeDate = (dateString?: string) => {
    if (!dateString) return '—';
    const parsed = Date.parse(dateString);
    if (Number.isNaN(parsed)) return '—';
    return formatDate(dateString);
  };

  const getLeadTypeLabel = (leadType: Lead['leadType']) => {
    return leadType === 'appointment' ? cardsText.appointment : leadType === 'emergency' ? cardsText.emergency : cardsText.question;
  };

  const formatYesNo = (value?: boolean) => (value ? 'Oui' : 'Non');

  const formatCurrency = (value?: number) => new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'CAD'
  }).format(value ?? 0);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const phoneDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    
    if (phoneDigits.length === 0) {
      return '+1 ';
    } else if (phoneDigits.length <= 3) {
      return `+1 (${phoneDigits}`;
    } else if (phoneDigits.length <= 6) {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
    } else {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    }
  };

  const formatMontrealDateTime = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');

    const localIso = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const utcFromLocal = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    const offsetMinutes = Math.round((utcFromLocal - date.getTime()) / 60000);
    const sign = offsetMinutes <= 0 ? '-' : '+';
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
    const offsetMins = String(absMinutes % 60).padStart(2, '0');

    return `${localIso}${sign}${offsetHours}:${offsetMins}`;
  };

  const handleAddLeadChange = (field: string, value: string | boolean | number) => {
    if (field === 'phone' && typeof value === 'string') {
      setAddLeadForm(prev => ({ ...prev, [field]: formatPhoneNumber(value) }));
    } else {
      setAddLeadForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddLeadDateChange = (date: Date | null) => {
    setAddLeadSelectedDate(date);
    if (date) {
      setAddLeadForm(prev => ({ ...prev, dateVisite: formatMontrealDateTime(date) }));
    } else {
      setAddLeadForm(prev => ({ ...prev, dateVisite: '' }));
    }
  };

  const handleCloseAddLeadModal = () => {
    setShowAddLeadModal(false);
    setAddLeadForm({
      name: '',
      email: '',
      phone: '+1 ',
      leadType: 'appointment',
      status: 'phone-unconfirmed',
      description: '',
      calendarUrl: '',
      calendarId: '',
      rescheduleUrl: '',
      cancelUrl: '',
      dateVisite: '',
      reminderSent: false,
      visitValue: 0,
      lifetimeValue: 0
    });
    setAddLeadSelectedDate(null);
  };

  const handleAddLeadSubmit = async () => {
    if (!addLeadForm.name || !addLeadForm.phone || !addLeadForm.email) {
      alert('Veuillez remplir tous les champs obligatoires (nom, email, téléphone)');
      return;
    }

    const createdAt = formatMontrealDateTime(new Date());
    let automationSettings = {
      appointmentReminders: true,
      reminderDelay: 24,
      reminderUnit: 'hours',
      reviewRequests: true,
      reviewDelay: 2,
      reviewUnit: 'hours',
    };
    try {
      automationSettings = {
        ...automationSettings,
        ...JSON.parse(localStorage.getItem('reactivationflow_settings') || '{}'),
      };
    } catch {
      // Retain safe automation defaults when device-local settings are invalid.
    }
    const unitMilliseconds: Record<string, number> = {
      minutes: 60_000,
      hours: 3_600_000,
      days: 86_400_000,
    };
    const reminderDate =
      automationSettings.appointmentReminders && addLeadSelectedDate
        ? new Date(
            addLeadSelectedDate.getTime() -
              automationSettings.reminderDelay * (unitMilliseconds[automationSettings.reminderUnit] || unitMilliseconds.hours),
          ).toISOString()
        : undefined;
    const newLead: Lead = {
      id: Date.now().toString(),
      name: addLeadForm.name,
      email: addLeadForm.email,
      phone: addLeadForm.phone,
      leadType: addLeadForm.leadType,
      status: addLeadForm.status,
      description: addLeadForm.description || undefined,
      calendarUrl: addLeadForm.calendarUrl || undefined,
      calendarId: addLeadForm.calendarId || undefined,
      rescheduleUrl: addLeadForm.rescheduleUrl || undefined,
      cancelUrl: addLeadForm.cancelUrl || undefined,
      reminderSent: addLeadForm.reminderSent,
      reminderDate,
      dateVisite: addLeadForm.dateVisite || undefined,
      visitValue: addLeadForm.visitValue,
      lifetimeValue: addLeadForm.lifetimeValue,
      createdAt
    };

    try {
      const webhookData = {
        nom: newLead.name,
        email: newLead.email,
        telephone: newLead.phone,
        typeDemande: newLead.leadType,
        statut: newLead.status,
        description: newLead.description,
        calendar_url: newLead.calendarUrl,
        calendar_id: newLead.calendarId,
        reschedule_url: newLead.rescheduleUrl,
        cancel_url: newLead.cancelUrl,
        rappelEnvoye: newLead.reminderSent,
        dateRappel: newLead.reminderDate,
        configurationRappel: {
          actif: automationSettings.appointmentReminders,
          delai: automationSettings.reminderDelay,
          unite: automationSettings.reminderUnit,
        },
        demandeAvis: {
          actif: automationSettings.reviewRequests,
          delai: automationSettings.reviewDelay,
          unite: automationSettings.reviewUnit,
        },
        dateVisite: newLead.dateVisite,
        valeurVisite: newLead.visitValue,
        valeurAVie: newLead.lifetimeValue,
        creeA: createdAt
      };

      await fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?type=manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Failed to submit manual lead:', error);
    }

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    
    handleCloseAddLeadModal();
  };

  const handleEditChange = (field: keyof Lead, value: string | boolean | number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editOriginalId) return;
    
    // Update timestamp
    const updatedForm = {
      ...editForm,
      updatedAt: formatMontrealDateTime(new Date())
    };
    
    // Send PUT request to webhook
    try {
      const webhookData = {
        id: updatedForm.id,
        nom: updatedForm.name,
        email: updatedForm.email,
        telephone: updatedForm.phone,
        typeDemande: updatedForm.leadType,
        statut: updatedForm.status,
        rappelEnvoye: updatedForm.reminderSent,
        dateRappel: updatedForm.reminderDate,
        dateVisite: updatedForm.dateVisite,
        valeurVisite: updatedForm.visitValue,
        valeurAVie: updatedForm.lifetimeValue,
        calendar_url: updatedForm.calendarUrl,
        calendar_id: updatedForm.calendarId,
        reschedule_url: updatedForm.rescheduleUrl,
        cancel_url: updatedForm.cancelUrl,
        creeA: updatedForm.createdAt,
        modifieA: updatedForm.updatedAt
      };

      await fetch(import.meta.env.VITE_WEBHOOK_LEADS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Failed to update lead on server:', error);
      // Continue with local update even if webhook fails
    }
    
    // Update local state
    const updatedLeads = leads.map(lead =>
      lead.id === editOriginalId ? updatedForm : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    setSelectedLead(updatedForm);
    setIsEditing(false);
    setEditForm(null);
    setEditOriginalId(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Send DELETE request to webhook
      await fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?id=${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Failed to delete lead from server:', error);
      // Continue with local deletion even if webhook fails
    }

    // Update local state
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    
    // Close the modal
    setSelectedLead(null);
    setIsEditing(false);
    setEditForm(null);
    setEditOriginalId(null);
  };

  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    const lead = leads.find(item => item.id === leadId);
    if (!lead || lead.status === status) return;
    if (!navigator.onLine) {
      setError('Connexion internet indisponible. Le statut n’a pas été modifié.');
      return;
    }

    const updatedLead: Lead = {
      ...lead,
      status,
      updatedAt: formatMontrealDateTime(new Date())
    };
    const previousLeads = leads;
    const updatedLeads = leads.map(item => item.id === leadId ? updatedLead : item);

    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    if (selectedLead?.id === leadId) setSelectedLead(updatedLead);
    setError(null);

    try {
      const updateEndpoint = new URL(import.meta.env.VITE_WEBHOOK_LEADS);
      updateEndpoint.searchParams.set('id', updatedLead.id);
      updateEndpoint.searchParams.set('statut', updatedLead.status);

      const response = await fetch(updateEndpoint.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedLead.id,
          nom: updatedLead.name,
          email: updatedLead.email,
          telephone: updatedLead.phone,
          typeDemande: updatedLead.leadType,
          statut: updatedLead.status,
          rappelEnvoye: updatedLead.reminderSent,
          dateRappel: updatedLead.reminderDate,
          dateVisite: updatedLead.dateVisite,
          valeurVisite: updatedLead.visitValue,
          valeurAVie: updatedLead.lifetimeValue,
          calendar_url: updatedLead.calendarUrl,
          calendar_id: updatedLead.calendarId,
          reschedule_url: updatedLead.rescheduleUrl,
          cancel_url: updatedLead.cancelUrl,
          creeA: updatedLead.createdAt,
          modifieA: updatedLead.updatedAt
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead: ${response.statusText}`);
      }
    } catch (statusUpdateError) {
      console.error('Failed to update pipeline status:', statusUpdateError);
      setLeads(previousLeads);
      localStorage.setItem('leads', JSON.stringify(previousLeads));
      if (selectedLead?.id === leadId) setSelectedLead(lead);
      setError(
        navigator.onLine
          ? 'Le webhook n8n est inaccessible. Le déplacement a été annulé.'
          : 'Connexion internet perdue. Le déplacement a été annulé.'
      );
    }
  };

  const handlePipelineDrop = (
    event: DragEvent<HTMLDivElement>,
    status: Lead['status']
  ) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('text/plain') || draggedLeadId;
    setDraggedLeadId(null);
    setDragOverStatus(null);
    if (leadId) {
      void updateLeadStatus(leadId, status).catch((unexpectedError) => {
        console.error('Unexpected pipeline status update failure:', unexpectedError);
        setError('Une erreur inattendue a empêché la mise à jour du statut.');
      });
    }
  };

  const reorderPipelineColumns = (sourceStatus: string, targetStatus: string) => {
    if (sourceStatus === targetStatus) return;

    setPipelineColumnOrder(currentOrder => {
      const sourceIndex = currentOrder.indexOf(sourceStatus);
      const targetIndex = currentOrder.indexOf(targetStatus);
      if (sourceIndex < 0 || targetIndex < 0) return currentOrder;

      const nextOrder = [...currentOrder];
      nextOrder.splice(sourceIndex, 1);
      nextOrder.splice(targetIndex, 0, sourceStatus);
      localStorage.setItem(PIPELINE_COLUMN_ORDER_KEY, JSON.stringify(nextOrder));
      return nextOrder;
    });
  };

  const setPipelineColumnVisibility = (status: string, visible: boolean) => {
    setHiddenPipelineColumns(currentHiddenColumns => {
      const nextHiddenColumns = visible
        ? currentHiddenColumns.filter(hiddenStatus => hiddenStatus !== status)
        : [...new Set([...currentHiddenColumns, status])];
      localStorage.setItem(PIPELINE_HIDDEN_COLUMNS_KEY, JSON.stringify(nextHiddenColumns));
      return nextHiddenColumns;
    });
  };

  const orderedPipelineColumns = pipelineColumnOrder
    .map(status => STATUS_OPTIONS_WITHOUT_ALL.find(option => option.value === status))
    .filter((option): option is (typeof STATUS_OPTIONS_WITHOUT_ALL)[number] => Boolean(option));
  const visiblePipelineColumns = orderedPipelineColumns.filter(
    option => !hiddenPipelineColumns.includes(option.value)
  );

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <SidebarBrand />
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            {!sidebarCollapsed && <span>CRM</span>}
          </Link>
          <Link to="/contacts-passes" className={`sidebar-link ${location.pathname === '/contacts-passes' ? 'active' : ''}`}>
            <CheckCircle size={20} />
            {!sidebarCollapsed && <span>CONTACTS PASSÉS</span>}
          </Link>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Link to="/promotions" className={`sidebar-link ${location.pathname === '/promotions' ? 'active' : ''}`}>
              <Megaphone size={20} />
              {!sidebarCollapsed && <span>PROMOTIONS</span>}
            </Link>
          )}
          <Link to="/utilisateurs" className={`sidebar-link ${location.pathname === '/utilisateurs' ? 'active' : ''}`}>
            <Users size={20} />
            {!sidebarCollapsed && <span>UTILISATEURS</span>}
          </Link>
          <Link to="/support" className={`sidebar-link ${location.pathname === '/support' ? 'active' : ''}`}>
            <Headphones size={20} />
            {!sidebarCollapsed && <span>SUPPORT</span>}
          </Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} />
            {!sidebarCollapsed && <span>PARAMÈTRES</span>}
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-icon">
                <UserCircle size={36} />
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{user?.name || 'Utilisateur'}</div>
                <div className="sidebar-user-phone">{user?.phone || ''}</div>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Se déconnecter"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
      
      <div className="main-wrapper">
        <header className="admin-header">
        <div className="header-content">
          <div className="header-center">
            <div className="header-search">
              <span className="header-search-icon">⌕</span>
              <input
                type="text"
                placeholder={cardsText.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              {searchQuery && (
                <button
                  className="header-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label={cardsText.clearSearch}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <LoadingScreen message={cardsText.loading} />
      )}

      {error && (
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={() => void fetchLeads(viewMode)} className="retry-button">{cardsText.retry}</button>
        </div>
      )}

      {!loading && (
      <div className="dashboard-content">
        <div className="kpis-section">
          <div className="kpi-card kpi-visits">
            <div className="kpi-icon">
              <Calendar size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{cardsText.visitsToday}</div>
              <div className="kpi-value">
                {leads.filter(l => {
                  if (!l.dateVisite) return false;
                  return isToday(l.dateVisite);
                }).length}
              </div>
            </div>
          </div>

          <div className="kpi-card kpi-noshows">
            <div className="kpi-icon">
              <UserX size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{cardsText.noShowsToday}</div>
              <div className="kpi-value">
                {leads.filter(l => {
                  if (!l.dateVisite || l.status !== 'no-show') return false;
                  return isToday(l.dateVisite);
                }).length}
              </div>
            </div>
          </div>

          <div className="kpi-card kpi-emergencies">
            <div className="kpi-icon">
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{cardsText.emergenciesToday}</div>
              <div className="kpi-value">
                {leads.filter(l => {
                  if (l.leadType !== 'emergency') return false;
                  
                  // Check if created today
                  if (l.createdAt && isToday(l.createdAt)) {
                    return true;
                  }
                  
                  // Check if visit is today
                  if (l.dateVisite && isToday(l.dateVisite)) {
                    return true;
                  }
                  
                  return false;
                }).length}
              </div>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="leads-toolbar">
            <div className="filters-top">
              {viewMode !== 'pipeline' && (
                <div className="filter-group">
                  <label htmlFor="status-filter" className="filter-label">{cardsText.filterStatus}</label>
                  <StatusDropdown
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={statusFilterOptions}
                    className="filter-context white-variant"
                  />
                </div>
              )}
              <div className="filter-group">
                <label className="filter-label">{cardsText.filterDate}</label>
                <StatusDropdown
                  value={dateFilter}
                  onChange={(value) => {
                    setDateFilter(value as typeof dateFilter);
                    setCurrentPage(1);
                  }}
                  options={dateFilterOptions}
                  className="filter-context"
                  ariaLabel={cardsText.filterDate}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{cardsText.sortBy}</label>
                <StatusDropdown
                  value={sortOrder}
                  onChange={(value) => setSortOrder(value as typeof sortOrder)}
                  options={sortOptions}
                  className="filter-context"
                  ariaLabel={cardsText.sortLeads}
                />
              </div>
            </div>
          </div>
          <div className="leads-list">
            <div className="leads-list-header">
              <div>
                <h2>{viewMode === 'pipeline' ? cardsText.pipelineTitle : cardsText.requests} ({sortedLeads.length})</h2>
                {viewMode === 'pipeline' && (
                  <p className="pipeline-helper">Glissez une carte vers une autre colonne pour modifier son statut.</p>
                )}
              </div>
              <div className="leads-header-actions">
                {viewMode === 'pipeline' && (
                  <details className="pipeline-columns-menu">
                    <summary>
                      <Columns3 size={16} aria-hidden="true" />
                      Colonnes
                      {hiddenPipelineColumns.length > 0 && (
                        <span className="pipeline-columns-hidden-count">{hiddenPipelineColumns.length}</span>
                      )}
                    </summary>
                    <div className="pipeline-columns-popover">
                      <strong>Colonnes visibles</strong>
                      {orderedPipelineColumns.map(column => (
                        <label key={column.value}>
                          <input
                            type="checkbox"
                            checked={!hiddenPipelineColumns.includes(column.value)}
                            onChange={(event) => setPipelineColumnVisibility(column.value, event.target.checked)}
                          />
                          <span
                            className="pipeline-status-dot"
                            style={{ backgroundColor: getStatusColor(column.value as Lead['status']) }}
                          />
                          {column.label}
                        </label>
                      ))}
                    </div>
                  </details>
                )}
                <div className="view-switcher" role="group" aria-label={cardsText.viewMode}>
                  <button
                    type="button"
                    className={viewMode === 'cards' ? 'active' : ''}
                    aria-pressed={viewMode === 'cards'}
                    onClick={() => {
                      setViewMode('cards');
                      void fetchLeads('cards');
                    }}
                  >
                    <LayoutGrid size={15} aria-hidden="true" />
                    {cardsText.cards}
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'list' ? 'active' : ''}
                    aria-pressed={viewMode === 'list'}
                    onClick={() => {
                      setViewMode('list');
                      void fetchLeads('list');
                    }}
                  >
                    <List size={15} aria-hidden="true" />
                    {cardsText.list}
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'pipeline' ? 'active' : ''}
                    aria-pressed={viewMode === 'pipeline'}
                    onClick={() => {
                      setFilterStatus('all');
                      setViewMode('pipeline');
                      void fetchLeads('pipeline');
                    }}
                  >
                    {cardsText.pipeline}
                  </button>
                </div>
                <button
                  type="button"
                  className="add-lead-button"
                  onClick={() => setShowAddLeadModal(true)}
                >
                  {cardsText.addLead}
                </button>
              </div>
            </div>
            {sortedLeads.length === 0 ? (
              <div className="empty-state">
                <p>{cardsText.empty}</p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="leads-grid">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsEditing(false);
                      setEditForm(null);
                      setEditOriginalId(null);
                    }}
                  >
                    <div className="lead-card-header">
                      <h3>{lead.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(lead.status) }}
                      >
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                    <div className="lead-card-info">
                      <p><strong>{lead.leadType === 'appointment' ? cardsText.appointmentRequest : lead.leadType === 'emergency' ? cardsText.emergency : cardsText.question}</strong></p>
                      <div className="lead-meta-row">
                        <span className="lead-meta">{lead.email}</span>
                        <a
                          className="lead-icon-button"
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${cardsText.email} ${lead.name}`}
                          title={cardsText.email}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2 8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </div>
                      <div className="lead-meta-row">
                        <span className="lead-meta">{lead.phone}</span>
                        <a
                          className="lead-icon-button"
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${cardsText.call} ${lead.name}`}
                          title={cardsText.call}
                        >
                          <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                        </a>
                      </div>
                      <p className="lead-date">{cardsText.visit}: {formatMaybeDate(lead.dateVisite)}</p>
                      <p className="lead-date">{cardsText.value}: {formatCurrency(lead.visitValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="leads-table-wrap">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Visite</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={selectedLead?.id === lead.id ? 'selected' : ''}
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsEditing(false);
                          setEditForm(null);
                          setEditOriginalId(null);
                        }}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedLead(lead);
                            setIsEditing(false);
                            setEditForm(null);
                            setEditOriginalId(null);
                          }
                        }}
                      >
                        <td>
                          <strong>{lead.name || 'Sans nom'}</strong>
                          <span>{lead.email || lead.phone || 'Aucun contact'}</span>
                        </td>
                        <td>{getLeadTypeLabel(lead.leadType)}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(lead.status) }}
                          >
                            {getStatusLabel(lead.status)}
                          </span>
                        </td>
                        <td>{formatMaybeDate(lead.dateVisite)}</td>
                        <td>{formatCurrency(lead.visitValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="pipeline-board" aria-label={cardsText.pipelineTitle}>
                {visiblePipelineColumns.map(column => {
                  const status = column.value as Lead['status'];
                  const columnLeads = sortedLeads.filter(lead => lead.status === status);

                  return (
                    <div
                      key={status}
                      className={`pipeline-column ${dragOverStatus === status ? 'drag-over' : ''} ${dragOverColumnStatus === status ? 'column-drag-over' : ''} ${draggedColumnStatus === status ? 'column-dragging' : ''}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        if (event.dataTransfer.types.includes(PIPELINE_COLUMN_DRAG_TYPE)) {
                          setDragOverColumnStatus(status);
                          setDragOverStatus(null);
                        } else {
                          setDragOverStatus(status);
                          setDragOverColumnStatus(null);
                        }
                      }}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                          setDragOverStatus(null);
                          setDragOverColumnStatus(null);
                        }
                      }}
                      onDrop={(event) => {
                        const sourceColumn = event.dataTransfer.getData(PIPELINE_COLUMN_DRAG_TYPE);
                        if (sourceColumn) {
                          event.preventDefault();
                          reorderPipelineColumns(sourceColumn, status);
                          setDraggedColumnStatus(null);
                          setDragOverColumnStatus(null);
                          return;
                        }
                        handlePipelineDrop(event, status);
                      }}
                    >
                      <div
                        className="pipeline-column-header"
                        draggable
                        onDragStart={(event) => {
                          event.stopPropagation();
                          event.dataTransfer.setData(PIPELINE_COLUMN_DRAG_TYPE, status);
                          event.dataTransfer.effectAllowed = 'move';
                          setDraggedColumnStatus(status);
                          setDraggedLeadId(null);
                        }}
                        onDragEnd={() => {
                          setDraggedColumnStatus(null);
                          setDragOverColumnStatus(null);
                        }}
                        title="Glissez pour réorganiser la colonne"
                      >
                        <div className="pipeline-column-title">
                          <GripVertical className="pipeline-column-drag-handle" size={17} aria-hidden="true" />
                          <span
                            className="pipeline-status-dot"
                            style={{ backgroundColor: getStatusColor(status) }}
                          />
                          <h3>{column.label}</h3>
                        </div>
                        <div className="pipeline-column-header-actions">
                          <span className="pipeline-count">{columnLeads.length}</span>
                          <button
                            type="button"
                            className="pipeline-column-hide"
                            draggable={false}
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              setPipelineColumnVisibility(status, false);
                            }}
                            aria-label={`Masquer la colonne ${column.label}`}
                            title="Masquer cette colonne"
                          >
                            <EyeOff size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="pipeline-column-cards">
                        {columnLeads.length === 0 ? (
                          <div className="pipeline-empty">Déposez un lead ici</div>
                        ) : columnLeads.map(lead => (
                          <article
                            key={lead.id}
                            className={`pipeline-card ${draggedLeadId === lead.id ? 'dragging' : ''}`}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData('text/plain', lead.id);
                              event.dataTransfer.effectAllowed = 'move';
                              setDraggedLeadId(lead.id);
                            }}
                            onDragEnd={() => {
                              setDraggedLeadId(null);
                              setDragOverStatus(null);
                            }}
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsEditing(false);
                              setEditForm(null);
                              setEditOriginalId(null);
                            }}
                            aria-label={`${lead.name}, ${getStatusLabel(lead.status)}`}
                          >
                            <div className="pipeline-card-top">
                              <div className="pipeline-avatar" aria-hidden="true">
                                {(lead.name || '?').trim().charAt(0).toUpperCase()}
                              </div>
                              <div className="pipeline-card-identity">
                                <h4>{lead.name || 'Sans nom'}</h4>
                                <span>{getLeadTypeLabel(lead.leadType)}</span>
                              </div>
                              <span className="pipeline-drag-handle" aria-hidden="true">⋮⋮</span>
                            </div>
                            {lead.dateVisite && (
                              <div className="pipeline-card-row">
                                <Calendar size={14} aria-hidden="true" />
                                <span>{formatMaybeDate(lead.dateVisite)}</span>
                              </div>
                            )}
                            <div className="pipeline-card-footer">
                              <span>{formatCurrency(lead.visitValue)}</span>
                              <span className="pipeline-contact">{lead.phone || lead.email}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {viewMode !== 'pipeline' && sortedLeads.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
              >
                {cardsText.previous}
              </button>
              <div className="pagination-info">
                {cardsText.page} {safePage} {cardsText.of} {totalPages} · {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} {cardsText.of} {sortedLeads.length}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
              >
                {cardsText.next}
              </button>
            </div>
          )}
        </main>

        {selectedLead && (
          <>
            <div 
              className="modal-backdrop"
              onClick={() => {
                setSelectedLead(null);
                setIsEditing(false);
                setEditForm(null);
                setEditOriginalId(null);
              }}
            ></div>
            <div
              className="details-modal request-details-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-details-title"
            >
              <div className="details-header">
                <div className="details-title-group">
                  <div className="patient-avatar" aria-hidden="true">
                    {(selectedLead.name || '?').trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="details-eyebrow">Fiche contact</span>
                    <h2 id="lead-details-title">{selectedLead.name || 'Détails de la demande'}</h2>
                    <div className="details-subtitle">
                      <span>{getLeadTypeLabel(selectedLead.leadType)}</span>
                      <span className="subtitle-separator" aria-hidden="true">•</span>
                      <span
                        className="details-status"
                        style={{
                          color: getStatusColor(selectedLead.status),
                          backgroundColor: `${getStatusColor(selectedLead.status)}14`
                        }}
                      >
                        <span
                          className="details-status-dot"
                          style={{ backgroundColor: getStatusColor(selectedLead.status) }}
                        />
                        {getStatusLabel(selectedLead.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="details-actions">
                  {!isEditing && (
                    <button
                      className="icon-button edit-button"
                      onClick={() => {
                        setIsEditing(true);
                        setEditForm({ ...selectedLead });
                        setEditOriginalId(selectedLead.id);
                      }}
                      title="Editer"
                    >
                      <Pencil size={20} strokeWidth={2.5} />
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      className="icon-button delete-button"
                      onClick={() => handleDeleteLead(selectedLead.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        className="text-save-button"
                        onClick={handleSaveEdit}
                        title="Sauvegarder"
                      >
                        Sauvegarder
                      </button>
                      <button
                        className="icon-button cancel-button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(null);
                          setEditOriginalId(null);
                        }}
                        title="Annuler"
                      >
                        <X size={20} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                  {!isEditing && (
                    <button 
                      className="close-details"
                      onClick={() => {
                        setSelectedLead(null);
                        setIsEditing(false);
                        setEditForm(null);
                        setEditOriginalId(null);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="details-quick-actions" aria-label="Actions rapides">
                  {selectedLead.phone && <a href={`tel:${selectedLead.phone}`}><Phone size={16} /><span>Appeler</span><small>{selectedLead.phone}</small></a>}
                  {selectedLead.email && <a href={`mailto:${selectedLead.email}`}><Mail size={16} /><span>E-mail</span><small>{selectedLead.email}</small></a>}
                  {selectedLead.calendarUrl && <a href={selectedLead.calendarUrl} target="_blank" rel="noreferrer"><Calendar size={16} /><span>Rendez-vous</span><small>Ouvrir le calendrier</small><ExternalLink size={13} className="quick-action-external" /></a>}
                </div>
              )}

              <div className="details-content">
              {!isEditing && (
                <>
                  <div className="detail-section contact-detail-section">
                    <h3><span className="section-icon" aria-hidden="true">01</span> Coordonnées</h3>
                    <div className="detail-item">
                      <label>Nom:</label>
                      <span>{selectedLead.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Téléphone:</label>
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>

                  <div className="detail-section request-detail-section">
                    <h3><span className="section-icon" aria-hidden="true">02</span> Demande</h3>
                    <div className="detail-item">
                      <label>Type:</label>
                      <span>{getLeadTypeLabel(selectedLead.leadType)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Statut:</label>
                      <span
                        className="inline-status"
                        style={{
                          color: getStatusColor(selectedLead.status),
                          backgroundColor: `${getStatusColor(selectedLead.status)}14`
                        }}
                      >
                        {getStatusLabel(selectedLead.status)}
                      </span>
                    </div>
                    {selectedLead.description && (
                      <div className="detail-item">
                        <label>Description:</label>
                        <span>{selectedLead.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section visit-detail-section">
                    <h3><span className="section-icon" aria-hidden="true">03</span> Visite</h3>
                    <div className="detail-item">
                      <label>Date de visite:</label>
                      <span>{formatMaybeDate(selectedLead.dateVisite)}</span>
                    </div>
                    <div className="detail-item financial-detail">
                      <label>Valeur de cette visite:</label>
                      <span className="financial-value">{formatCurrency(selectedLead.visitValue)}</span>
                    </div>
                    <div className="detail-item financial-detail lifetime-detail">
                      <label>Valeur à vie:</label>
                      <span className="financial-value">{formatCurrency(selectedLead.lifetimeValue)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Calendar ID:</label>
                      <span>{selectedLead.calendarId || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Calendar URL:</label>
                      {selectedLead.calendarUrl ? (
                        <a
                          href={selectedLead.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir l'evenement
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Lien de report:</label>
                      {selectedLead.rescheduleUrl ? (
                        <a
                          href={selectedLead.rescheduleUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Replanifier
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Lien d'annulation:</label>
                      {selectedLead.cancelUrl ? (
                        <a
                          href={selectedLead.cancelUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Annuler
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>

                  <div className="detail-section reminder-detail-section">
                    <h3><span className="section-icon" aria-hidden="true">04</span> Rappel</h3>
                    <div className="detail-item">
                      <label>Rappel envoye:</label>
                      <span>{formatYesNo(selectedLead.reminderSent)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date du rappel:</label>
                      <span>{formatMaybeDate(selectedLead.reminderDate)}</span>
                    </div>
                  </div>

                </>
              )}

              {isEditing && editForm && (
                <>
                  <div className="detail-section">
                    <h3>Edition</h3>
                    <div className="edit-form">
                      <div className="edit-field">
                        <label>Nom</label>
                        <input
                          className="edit-input"
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Email</label>
                        <input
                          className="edit-input"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Telephone</label>
                        <input
                          className="edit-input"
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Type de demande</label>
                        <StatusDropdown
                          value={editForm.leadType}
                          onChange={(value) => handleEditChange('leadType', value as Lead['leadType'])}
                          options={LEAD_TYPE_OPTIONS}
                          className="edit-context"
                          ariaLabel="Type de demande"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Statut</label>
                        <StatusDropdown
                          value={editForm.status}
                          onChange={(value) => handleEditChange('status', value as Lead['status'])}
                          options={STATUS_OPTIONS_WITHOUT_ALL}
                          className="edit-context"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Rappel envoye</label>
                        <StatusDropdown
                          value={editForm.reminderSent ? 'true' : 'false'}
                          onChange={(value) => handleEditChange('reminderSent', value === 'true')}
                          options={REMINDER_OPTIONS}
                          className="edit-context"
                          ariaLabel="État du rappel"
                        />
                      </div>
                      <div className="edit-field">
                        <label>Valeur de cette visite (CAD)</label>
                        <input
                          className="edit-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.visitValue ?? 0}
                          onChange={(e) => handleEditChange('visitValue', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Valeur à vie (CAD)</label>
                        <input
                          className="edit-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.lifetimeValue ?? 0}
                          onChange={(e) => handleEditChange('lifetimeValue', Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Description</label>
                        <textarea
                          className="edit-input"
                          value={editForm.description || ''}
                          onChange={(e) => handleEditChange('description', e.target.value)}
                          placeholder="Description de la visite..."
                          rows={4}
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
        )}

      {showAddLeadModal && (
        <>
          <div 
            className="modal-backdrop"
            onClick={handleCloseAddLeadModal}
          ></div>
          <div className="details-modal add-lead-modal">
            <div className="details-header">
              <h2>Ajouter un Lead</h2>
              <div className="details-actions">
                <button 
                  className="close-details"
                  onClick={handleCloseAddLeadModal}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h3>Informations du Lead</h3>
                <div className="edit-form">
                  <div className="edit-field">
                    <label>Nom *</label>
                    <input
                      className="edit-input"
                      type="text"
                      value={addLeadForm.name}
                      onChange={(e) => handleAddLeadChange('name', e.target.value)}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Email *</label>
                    <input
                      className="edit-input"
                      type="email"
                      value={addLeadForm.email}
                      onChange={(e) => handleAddLeadChange('email', e.target.value)}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Téléphone *</label>
                    <input
                      className="edit-input"
                      type="text"
                      value={addLeadForm.phone}
                      onChange={(e) => handleAddLeadChange('phone', e.target.value)}
                      placeholder="+1 (XXX) XXX-XXXX"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Type de demande</label>
                    <StatusDropdown
                      value={addLeadForm.leadType}
                      onChange={(value) => handleAddLeadChange('leadType', value)}
                      options={LEAD_TYPE_OPTIONS}
                      className="edit-context"
                      ariaLabel="Type de demande"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Statut</label>
                    <StatusDropdown
                      value={addLeadForm.status}
                      onChange={(value) => handleAddLeadChange('status', value)}
                      options={STATUS_OPTIONS_WITHOUT_ALL}
                      className="edit-context"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Date de visite</label>
                    <DateTimePicker
                      selected={addLeadSelectedDate}
                      onChange={handleAddLeadDateChange}
                      placeholder="Cliquez pour sélectionner une date"
                      isClearable
                      bookedSlots={addLeadBookedSlots}
                      availabilityLoading={addLeadAvailabilityLoading}
                      availabilityError={addLeadAvailabilityError}
                    />
                    <small className="form-hint">Disponibilités: Lundi au Vendredi, 8h00 à 18h00</small>
                  </div>
                  <div className="edit-field">
                    <label>Rappel envoyé</label>
                    <StatusDropdown
                      value={addLeadForm.reminderSent ? 'true' : 'false'}
                      onChange={(value) => handleAddLeadChange('reminderSent', value === 'true')}
                      options={REMINDER_OPTIONS}
                      className="edit-context"
                      ariaLabel="État du rappel"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Valeur de cette visite (CAD)</label>
                    <input
                      className="edit-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={addLeadForm.visitValue}
                      onChange={(e) => handleAddLeadChange('visitValue', Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="edit-field">
                    <label>Valeur à vie (CAD)</label>
                    <input
                      className="edit-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={addLeadForm.lifetimeValue}
                      onChange={(e) => handleAddLeadChange('lifetimeValue', Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                  <div className="edit-field">
                    <label>Description</label>
                    <textarea
                      className="edit-input"
                      value={addLeadForm.description}
                      onChange={(e) => handleAddLeadChange('description', e.target.value)}
                      placeholder="Description de la visite..."
                      rows={3}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-section full-width-section">
                <button
                  className="save-button"
                  onClick={handleAddLeadSubmit}
                >
                  Créer le Lead
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
