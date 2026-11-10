import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Package, Plus, SlidersHorizontal, Eye, ClipboardList, Trash2 } from 'lucide-react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ClientSelectionsSkeleton } from '../../components/skeletons';
import DataTable from '../../components/shared/DataTable';
import FilterDrawer from '../../components/shared/FilterDrawer';
import KebabMenu from '../../components/shared/KebabMenu';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import {
  CalendarIcon,
  PhoneIcon,
  WarningIcon,
  CheckCircleIcon,
  SearchIcon,
  EyeIcon,
  ClipboardIcon,
  TrashIcon,
  MapPinIcon,
  UtensilsIcon,
} from '../../components/shared/Icons';
import {
  formatArrivalWindow,
  formatLocalDate,
  convert24To12,
  parseTo24Time,
  toDateInputValue,
  truncateWords,
} from '../../utils/formatters';

export default function ClientSelections() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitIdParam = searchParams.get('visitId');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const clientDropdownRef = useRef(null);
  const [search, setSearch] = useState('');

  // From-To date filters (default to 10 days: 5 days prev, 5 days ahead of current date)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return toDateInputValue(d);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return toDateInputValue(d);
  });

  // Modals
  const [detailModalVisit, setDetailModalVisit] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    visit: null,
    targetStatus: 'confirmed', // 'confirmed', 'completed', 'cancelled'
    confirmedDate: '',
    startTime: '16:00',
    endTime: '17:00',
    chefNotes: '',
    cancellationReason: '',
    submitting: false,
  });

  // Create Appointment Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [allDishes, setAllDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const [createForm, setCreateForm] = useState({
    clientId: '',
    visitDate: '',
    startTime: '16:00',
    endTime: '17:00',
    adults: 2,
    children: 0,
    childrenAges: '',
    notes: '',
    chefNotes: '',
    selectedDishes: [],
    submitting: false,
    error: '',
    dishSearch: '',
    dishCategory: 'all',
  });

  // Fetch visits filtered directly from backend API
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (activeTab && activeTab !== 'all') params.status = activeTab;
      if (search && search.trim()) params.search = search.trim();

      const res = await api.get('/admin/visits', { params });
      setVisits(res.data.visits || []);
    } catch (err) {
      console.error('Failed to load visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisits();
    }, 200);
    return () => clearTimeout(timer);
  }, [startDate, endDate, activeTab, search]);

  // Deep-link auto dossier opener when visitIdParam is in URL
  useEffect(() => {
    if (!visitIdParam) return;
    const found = visits.find((v) => v._id === visitIdParam);
    if (found) {
      setDetailModalVisit(found);
    } else {
      api.get('/admin/visits').then((res) => {
        const direct = (res.data?.visits || []).find((v) => v._id === visitIdParam);
        if (direct) {
          setDetailModalVisit(direct);
        }
      }).catch(() => {});
    }
  }, [visitIdParam, visits]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const openCreateModal = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const defaultDate = toDateInputValue(tomorrow);

    setCreateForm({
      clientId: '',
      visitDate: defaultDate,
      startTime: '16:00',
      endTime: '17:00',
      adults: 2,
      children: 0,
      childrenAges: '',
      notes: '',
      chefNotes: '',
      selectedDishes: [],
      submitting: false,
      error: '',
      dishSearch: '',
      dishCategory: 'all',
    });
    setClientDropdownOpen(false);
    setClientSearchTerm('');
    setIsCreateOpen(true);

    if (clientsList.length === 0) {
      setLoadingClients(true);
      try {
        const res = await api.get('/admin/clients');
        setClientsList(res.data.clients || []);
      } catch (err) {
        console.error('Failed to load clients', err);
      } finally {
        setLoadingClients(false);
      }
    }

    if (allDishes.length === 0) {
      setLoadingDishes(true);
      try {
        const res = await api.get('/admin/dishes');
        setAllDishes(res.data.dishes || []);
      } catch (err) {
        console.error('Failed to load dishes', err);
      } finally {
        setLoadingDishes(false);
      }
    }
  };

  const handleClientChange = (clientId) => {
    const client = clientsList.find((c) => c._id === clientId);
    setCreateForm((prev) => ({
      ...prev,
      clientId,
      adults: client?.adultsCount || prev.adults || 2,
      children: client?.childrenCount || prev.children || 0,
      childrenAges: client?.childrenAges || prev.childrenAges || '',
      error: '',
    }));
  };

  const statusOptions = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];
  const currentStatusOption = statusOptions.find((o) => o.id === activeTab) || statusOptions[0];

  const selectedClient = clientsList.find((c) => c._id === createForm.clientId);
  const timeIntensiveCount = createForm.selectedDishes.filter((d) => d.isTimeIntensive).length;

  const filteredClients = clientsList.filter((c) => {
    const q = clientSearchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleAddDish = (dish) => {
    if (createForm.selectedDishes.length >= 7) {
      setCreateForm((prev) => ({ ...prev, error: 'Maximum 7 dishes allowed per appointment.' }));
      return;
    }
    if (dish.isTimeIntensive && timeIntensiveCount >= 2) {
      setCreateForm((prev) => ({
        ...prev,
        error: 'Maximum 2 time-intensive dishes (30+ min prep) allowed per visit.',
      }));
      return;
    }
    if (createForm.selectedDishes.some((d) => d._id === dish._id)) {
      return;
    }
    setCreateForm((prev) => ({
      ...prev,
      error: '',
      selectedDishes: [...prev.selectedDishes, dish],
    }));
  };

  const handleRemoveDish = (dishId) => {
    setCreateForm((prev) => ({
      ...prev,
      error: '',
      selectedDishes: prev.selectedDishes.filter((d) => d._id !== dishId),
    }));
  };

  const filteredAvailableDishes = allDishes.filter((dish) => {
    const matchesCat =
      createForm.dishCategory === 'all' ||
      (dish.type || '').toLowerCase() === createForm.dishCategory.toLowerCase();
    const q = createForm.dishSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      dish.name?.toLowerCase().includes(q) ||
      dish.description?.toLowerCase().includes(q) ||
      dish.cuisineTags?.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!createForm.clientId) {
      setCreateForm((prev) => ({ ...prev, error: 'Please select a client.' }));
      return;
    }
    if (!createForm.visitDate) {
      setCreateForm((prev) => ({ ...prev, error: 'Please select a visit date.' }));
      return;
    }
    if (createForm.selectedDishes.length > 7) {
      setCreateForm((prev) => ({ ...prev, error: 'Maximum 7 dishes allowed per visit.' }));
      return;
    }
    if (timeIntensiveCount > 2) {
      setCreateForm((prev) => ({ ...prev, error: 'Maximum 2 time-intensive dishes allowed per visit.' }));
      return;
    }

    setCreateForm((prev) => ({ ...prev, submitting: true, error: '' }));

    try {
      const formattedWindow =
        createForm.startTime && createForm.endTime
          ? `${convert24To12(createForm.startTime)} – ${convert24To12(createForm.endTime)}`
          : '4:00 PM – 5:00 PM';

      const payload = {
        clientId: createForm.clientId,
        visitDate: createForm.visitDate,
        adults: parseInt(createForm.adults, 10) || 2,
        children: parseInt(createForm.children, 10) || 0,
        childrenAges: (createForm.childrenAges || '').trim(),
        arrivalWindow: formattedWindow,
        notes: (createForm.notes || '').trim(),
        chefNotes: (createForm.chefNotes || '').trim(),
        dishes: createForm.selectedDishes.map((d) => ({
          dishId: d._id,
          course: d.type || 'main',
        })),
      };

      const res = await api.post('/admin/visits/schedule', payload);
      const newVisit = res.data.visit;

      if (newVisit) {
        setVisits((prev) => [newVisit, ...prev]);
      } else {
        fetchVisits();
      }

      setIsCreateOpen(false);
      setCreateSuccessMsg(
        res.data.message ||
          (createForm.selectedDishes.length > 0
            ? 'Appointment created with selected menu. No duplicate email sent; confirmation email will be sent upon manual confirmation.'
            : 'Appointment scheduled. Invitation email sent to client with direct link to select their menu.')
      );
      setTimeout(() => setCreateSuccessMsg(''), 7000);
    } catch (err) {
      setCreateForm((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || err.message || 'Failed to create appointment.',
      }));
    }
  };

  const openStatusModal = (visit, targetStatus) => {
    let sTime = '16:00';
    let eTime = '17:00';
    if (visit.arrivalWindow) {
      const parts = visit.arrivalWindow.split(/-|–/);
      if (parts.length >= 2) {
        sTime = parseTo24Time(parts[0], '16:00');
        eTime = parseTo24Time(parts[1], '17:00');
      } else if (parts.length === 1) {
        sTime = parseTo24Time(parts[0], '16:00');
      }
    }

    setStatusModal({
      open: true,
      visit,
      targetStatus,
      confirmedDate: toDateInputValue(visit.visitDate),
      startTime: sTime,
      endTime: eTime,
      chefNotes: visit.chefNotes || '',
      cancellationReason: '',
      submitting: false,
    });
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModal.visit) return;
    setStatusModal((prev) => ({ ...prev, submitting: true }));

    try {
      const formattedWindow =
        statusModal.startTime && statusModal.endTime
          ? `${convert24To12(statusModal.startTime)} – ${convert24To12(statusModal.endTime)}`
          : statusModal.visit.arrivalWindow || '4:00 PM – 5:00 PM';

      const payload = {
        status: statusModal.targetStatus,
        arrivalWindow: formattedWindow,
        visitDate: statusModal.confirmedDate,
        chefNotes: statusModal.chefNotes,
        cancellationReason: statusModal.cancellationReason,
      };

      const res = await api.patch(`/admin/visits/${statusModal.visit._id}/status`, payload);
      const updated = res.data.visit;

      setVisits((prev) =>
        prev.map((v) => (v._id === statusModal.visit._id ? { ...v, ...updated } : v))
      );

      if (detailModalVisit && detailModalVisit._id === statusModal.visit._id) {
        setDetailModalVisit((prev) => ({ ...prev, ...updated }));
      }

      setStatusModal((prev) => ({ ...prev, open: false, submitting: false }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visit status');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const filteredVisits = visits.filter((v) => {
    const matchesTab = activeTab === 'all' || v.status === activeTab;
    if (!matchesTab) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', label: 'Confirmed' },
      pending: { bg: '#fef3e2', color: '#9a5b13', border: '#fde68a', label: 'Pending Review' },
      ready: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'Ready' },
      completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Completed' },
      cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled' },
    };
    const c = config[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: status };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 7px',
          borderRadius: '3px',
          fontSize: '0.66rem',
          fontWeight: 600,
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          textTransform: 'capitalize',
        }}
      >
        {c.label}
      </span>
    );
  };

  const activeFilterCount =
    (activeTab !== 'all' ? 1 : 0) + (startDate ? 1 : 0) + (endDate ? 1 : 0);

  const resetFilters = () => {
    setActiveTab('all');
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  const columns = [
    {
      header: 'Client & Date',
      key: 'client',
      render: (v) => {
        const client = v.userId || {};
        const formattedDate = formatLocalDate(v.visitDate, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedWindow = formatArrivalWindow(v.arrivalWindow);

        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.80rem', color: '#1a1814' }}>
                {client.name || 'Private Client'}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#57534e' }}>• {formattedDate}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
              {v.arrivalWindow ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.64rem',
                    color: '#065f46',
                    fontWeight: 600,
                    backgroundColor: '#ecfdf5',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Clock size={10} color="#065f46" style={{ flexShrink: 0 }} /> {formattedWindow}
                </span>
              ) : (
                <span style={{ fontSize: '0.66rem', color: '#b45309' }}>Timing pending</span>
              )}

              {client.phone && (
                <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <PhoneIcon size={9} color="#716c62" /> {client.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Menu & Status',
      key: 'menu',
      render: (v) => {
        const dishNames = (v.dishes || [])
          .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
          .filter(Boolean);
        const hasConflicts = v.allergyFlags && v.allergyFlags.length > 0;

        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {getStatusBadge(v.status)}
              <span style={{ fontSize: '0.68rem', color: '#4a453e', fontWeight: 600 }}>
                {v.guests} Guests ({v.dishes?.length || 0} dishes)
              </span>
            </div>

            {dishNames.length > 0 && (
              <span
                style={{
                  display: 'block',
                  fontSize: '0.66rem',
                  color: 'var(--color-text-muted, #716c62)',
                  marginTop: '2px',
                  lineHeight: 1.25,
                }}
                title={dishNames.join(', ')}
              >
                {truncateWords(dishNames.join(', '), 4)}
              </span>
            )}

            {hasConflicts ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  marginTop: '2px',
                }}
                title={v.allergyFlags.map((f) => `${f.dishName}: ${f.conflictAllergen}`).join('; ')}
              >
                <WarningIcon size={9} color="#b91c1c" /> Allergy Flag
              </span>
            ) : (
              <span
                style={{
                  color: '#15803d',
                  fontSize: '0.64rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginTop: '2px',
                }}
              >
                <CheckCircleIcon size={10} color="#15803d" /> Safe
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: '',
      key: 'actions',
      width: '38px',
      align: 'right',
      render: (v) => {
        const items = [
          {
            label: 'View Dossier',
            icon: <Eye size={13} />,
            onClick: () => setDetailModalVisit(v),
          },
          {
            label: 'Shopping List',
            icon: <ClipboardList size={13} />,
            onClick: () => navigate(`/admin/shopping-list/${v._id}`),
          },
        ];

        if (v.status === 'pending') {
          items.push({
            label: 'Confirm Appointment',
            icon: <CheckCircleIcon size={13} color="#15803d" />,
            onClick: () => openStatusModal(v, 'confirmed'),
          });
          items.push({
            label: 'Decline / Cancel',
            icon: <Trash2 size={13} />,
            variant: 'danger',
            onClick: () => openStatusModal(v, 'cancelled'),
          });
        } else if (v.status === 'confirmed') {
          items.push({
            label: 'Mark Ready',
            icon: <Package size={13} color="#6d28d9" />,
            onClick: () => openStatusModal(v, 'ready'),
          });
          items.push({
            label: 'Cancel Appointment',
            icon: <Trash2 size={13} />,
            variant: 'danger',
            onClick: () => openStatusModal(v, 'cancelled'),
          });
        } else if (v.status === 'ready') {
          items.push({
            label: 'Mark Completed',
            icon: <CheckCircleIcon size={13} color="#2563eb" />,
            onClick: () => openStatusModal(v, 'completed'),
          });
          items.push({
            label: 'Cancel Appointment',
            icon: <Trash2 size={13} />,
            variant: 'danger',
            onClick: () => openStatusModal(v, 'cancelled'),
          });
        }

        return <KebabMenu ariaLabel={`Actions for appointment ${v._id}`} items={items} />;
      },
    },
  ];

  if (loading) return <ClientSelectionsSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Title Row with Action Buttons at the End (justify-between) */}
      <div className="admin-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <h1
          className="admin-page-title"
          style={{
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CalendarIcon size={18} color="var(--color-primary, #2e3b12)" />
          <span>Client Selections</span>
        </h1>
        <div className="admin-title-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={openCreateModal}
            className="admin-action-btn"
            title="Create Appointment"
            aria-label="Create Appointment"
          >
            <Plus size={16} />
          </button>
          <Link
            to="/admin/shopping-lists"
            className="admin-action-btn-outline"
            title="All Shopping Lists"
            aria-label="All Shopping Lists"
          >
            <ClipboardList size={15} />
          </Link>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Manage client booking requests, set confirmed arrival windows, check allergy safety ({visits.length} total).
      </p>

      {/* Success Notification Alert */}
      {createSuccessMsg && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 14px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '4px',
            color: '#166534',
            fontSize: '0.76rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircleIcon size={15} color="#16a34a" />
          <span style={{ fontWeight: 600 }}>{createSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search client, email, phone, or dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`admin-filter-toggle-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setFilterDrawerOpen(true)}
          title="Open filters sidebar"
        >
          <SlidersHorizontal size={13} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '1px 5px',
                fontSize: '0.62rem',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Slide-out Sidebar Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter Appointments"
        activeCount={activeFilterCount}
        onReset={resetFilters}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              Status
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {statusOptions.map((opt) => {
                const isSelected = activeTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveTab(opt.id)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#1e1b16',
                      border: '1px solid ' + (isSelected ? 'var(--color-primary, #2e3b12)' : '#e7e2d8'),
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 600 : 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircleIcon size={12} color="#ffffff" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              From Date
            </label>
            <CustomDatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ height: '34px', fontSize: '0.76rem', width: '100%' }}
              wrapperStyle={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              To Date
            </label>
            <CustomDatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ height: '34px', fontSize: '0.76rem', width: '100%' }}
              wrapperStyle={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                const prev5 = new Date();
                prev5.setDate(prev5.getDate() - 5);
                const ahead5 = new Date();
                ahead5.setDate(ahead5.getDate() + 5);
                setStartDate(toDateInputValue(prev5));
                setEndDate(toDateInputValue(ahead5));
              }}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                backgroundColor: '#ffffff',
                fontSize: '0.70rem',
                color: 'var(--color-primary, #2e3b12)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              &plusmn;5-Day Preset
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                backgroundColor: '#ffffff',
                fontSize: '0.70rem',
                color: '#716c62',
                cursor: 'pointer',
              }}
            >
              All Dates
            </button>
          </div>
        </div>
      </FilterDrawer>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredVisits}
        selectable={false}
        emptyMessage={
          search || startDate || endDate || activeTab !== 'all'
            ? 'No dining appointments match your date and search filters.'
            : 'No dining appointments scheduled.'
        }
      />

      {/* Visit Details Modal Dialog */}
      {detailModalVisit && (
        <Dialog
          isOpen={Boolean(detailModalVisit)}
          onClose={() => setDetailModalVisit(null)}
          title={`Dining Visit Dossier: ${detailModalVisit.userId?.name || 'Client'}`}
          maxWidth="780px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div className="dialog-responsive-footer">
              <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)' }}>
                Scheduled:{' '}
                <strong>
                  {formatLocalDate(detailModalVisit.visitDate, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>{' '}
                &bull; Guests: <strong>{detailModalVisit.guests}</strong>
              </span>

              <div className="dialog-footer-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModalVisit(null)}
                  style={{
                    borderRadius: '4px',
                    boxShadow: 'none',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    height: '32px',
                    fontSize: '0.74rem',
                    padding: '0 12px',
                  }}
                >
                  Close
                </Button>
                {detailModalVisit.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openStatusModal(detailModalVisit, 'confirmed')}
                    style={{
                      borderRadius: '4px',
                      boxShadow: 'none',
                      height: '32px',
                      fontSize: '0.74rem',
                      padding: '0 12px',
                      backgroundColor: '#2e3b12',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircleIcon size={12} color="#ffffff" />
                    Confirm & Notify
                  </Button>
                )}
                {detailModalVisit.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openStatusModal(detailModalVisit, 'ready')}
                    style={{
                      borderRadius: '4px',
                      boxShadow: 'none',
                      height: '32px',
                      fontSize: '0.74rem',
                      padding: '0 12px',
                      backgroundColor: '#6d28d9',
                      border: '1px solid #5b21b6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Package size={12} color="#ffffff" />
                    Mark Ready & Notify
                  </Button>
                )}
                {detailModalVisit.status === 'ready' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openStatusModal(detailModalVisit, 'completed')}
                    style={{
                      borderRadius: '4px',
                      boxShadow: 'none',
                      height: '32px',
                      fontSize: '0.74rem',
                      padding: '0 12px',
                      backgroundColor: '#2563eb',
                      border: '1px solid #1d4ed8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircleIcon size={12} color="#ffffff" />
                    Mark Completed
                  </Button>
                )}
                <Link to={`/admin/shopping-list/${detailModalVisit._id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{
                      borderRadius: '4px',
                      boxShadow: 'none',
                      height: '32px',
                      fontSize: '0.74rem',
                      padding: '0 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ClipboardIcon size={12} color="#ffffff" />
                    Open Shopping List
                  </Button>
                </Link>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Client Information Header Box */}
            <div
              style={{
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#716c62', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Client Details & Kitchen Location
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.74rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>Name</span>
                  <strong style={{ color: '#1e1b16' }}>{detailModalVisit.userId?.name || 'Private Client'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>Phone</span>
                  <strong style={{ color: '#1e1b16' }}>{detailModalVisit.userId?.phone || 'Not provided'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted, #716c62)', display: 'block', fontSize: '0.66rem' }}>Kitchen Location</span>
                  <strong style={{ color: '#1e1b16' }}>{detailModalVisit.userId?.location || 'Client residence'}</strong>
                </div>
              </div>

              {detailModalVisit.userId?.allergies && detailModalVisit.userId.allergies.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#dc2626', fontSize: '0.68rem', fontWeight: 600 }}>Client Allergies:</span>
                  {detailModalVisit.userId.allergies.map((a, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        fontSize: '0.66rem',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2-Column Split: Selected Dishes (Left) + Notes & Timing (Right) */}
            <div className="admin-split-grid">
              {/* Left: Selected Menu Dishes */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#716c62', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Selected Dishes ({detailModalVisit.dishes?.length || 0})
                  </div>
                  <span style={{ fontSize: '0.66rem', color: '#065f46', fontWeight: 600 }}>
                    {detailModalVisit.guests} Portions Each
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {detailModalVisit.dishes?.map((item, idx) => {
                    const dish = item.dishId && typeof item.dishId === 'object' ? item.dishId : {};
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '3px',
                          border: '1px solid #ede8df',
                          backgroundColor: '#ffffff',
                          fontSize: '0.74rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#1a1814', display: 'block' }}>{dish.name || 'Custom Selected Dish'}</strong>
                          <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted, #716c62)' }}>
                            Course: {item.course || dish.type || 'Main'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary, #2e3b12)' }}>{detailModalVisit.guests}</span>
                          <span style={{ fontSize: '0.62rem', color: '#716c62', display: 'block' }}>portions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Notes, Arrival & Safety */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Arrival Window & Status */}
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                  }}
                >
                  <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#716c62', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Appointment Window & Status
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#4a453e' }}>Window:</span>
                    <strong style={{ fontSize: '0.74rem', color: '#065f46' }}>
                      {formatArrivalWindow(detailModalVisit.arrivalWindow)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#4a453e' }}>Status:</span>
                    {getStatusBadge(detailModalVisit.status)}
                  </div>
                </div>

                {/* Notes */}
                {detailModalVisit.notes && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border, #ece7de)',
                      fontSize: '0.72rem',
                    }}
                  >
                    <strong style={{ color: '#1a1814', display: 'block', marginBottom: '3px' }}>Client Requests & Notes:</strong>
                    <p style={{ margin: 0, color: '#655e53', lineHeight: 1.4 }}>{detailModalVisit.notes}</p>
                  </div>
                )}

                {detailModalVisit.chefNotes && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#fcfaf7',
                      border: '1px solid #fed7aa',
                      fontSize: '0.72rem',
                    }}
                  >
                    <strong style={{ color: '#9a3412', display: 'block', marginBottom: '3px' }}>Chef Preparation Notes:</strong>
                    <p style={{ margin: 0, color: '#7c2d12', lineHeight: 1.4 }}>{detailModalVisit.chefNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Status Modal (Confirm / Complete / Cancel) */}
      {statusModal.open && statusModal.visit && (
        <Dialog
          isOpen={statusModal.open}
          onClose={() => !statusModal.submitting && setStatusModal({ ...statusModal, open: false })}
          title={
            statusModal.targetStatus === 'confirmed'
              ? 'Confirm Appointment & Arrival Window'
              : statusModal.targetStatus === 'ready'
              ? 'Mark Order Ready for Pickup / Dispatch'
              : statusModal.targetStatus === 'completed'
              ? 'Mark Visit as Completed'
              : 'Decline / Cancel Appointment'
          }
          maxWidth="460px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div className="dialog-footer-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusModal({ ...statusModal, open: false })}
                disabled={statusModal.submitting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 12px',
                }}
              >
                Cancel
              </Button>
              <Button
                variant={statusModal.targetStatus === 'cancelled' ? 'danger' : 'primary'}
                size="sm"
                onClick={handleStatusSubmit}
                disabled={statusModal.submitting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 14px',
                  backgroundColor:
                    statusModal.targetStatus === 'ready'
                      ? '#6d28d9'
                      : statusModal.targetStatus === 'cancelled'
                      ? '#dc2626'
                      : statusModal.targetStatus === 'completed'
                      ? '#2563eb'
                      : '#2e3b12',
                }}
              >
                {statusModal.submitting
                  ? 'Saving...'
                  : statusModal.targetStatus === 'confirmed'
                  ? 'Confirm & Notify'
                  : statusModal.targetStatus === 'ready'
                  ? 'Mark Ready & Notify'
                  : statusModal.targetStatus === 'completed'
                  ? 'Mark Completed'
                  : 'Cancel Appointment'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)', margin: 0 }}>
              Client: <strong>{statusModal.visit.userId?.name || 'Client'}</strong> &bull; Requested Date:{' '}
              {formatLocalDate(statusModal.visit.visitDate)}
            </p>

            {statusModal.targetStatus === 'confirmed' && (
              <>
                <div className="dialog-grid-2col">
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                      Confirmed Date *
                    </label>
                    <CustomDatePicker
                      required
                      value={statusModal.confirmedDate}
                      onChange={(e) => setStatusModal({ ...statusModal, confirmedDate: e.target.value })}
                      style={{
                        height: '34px',
                        fontSize: '0.76rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                      Confirmed Window
                    </label>
                    <div
                      style={{
                        height: '34px',
                        padding: '0 10px',
                        borderRadius: '4px',
                        border: '1px solid #a7f3d0',
                        backgroundColor: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#065f46',
                      }}
                    >
                      <Clock size={13} color="#065f46" style={{ flexShrink: 0 }} />
                      {convert24To12(statusModal.startTime)} – {convert24To12(statusModal.endTime)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                    Arrival Time Range *
                  </label>
                  <div className="dialog-grid-2col">
                    <div>
                      <span style={{ fontSize: '0.67rem', color: '#716c62', display: 'block', marginBottom: '2px' }}>
                        Start Time
                      </span>
                      <input
                        type="time"
                        required
                        value={statusModal.startTime}
                        onChange={(e) => setStatusModal({ ...statusModal, startTime: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border, #ece7de)',
                          backgroundColor: '#ffffff',
                          fontSize: '0.76rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          height: '34px',
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.67rem', color: '#716c62', display: 'block', marginBottom: '2px' }}>
                        End Time
                      </span>
                      <input
                        type="time"
                        required
                        value={statusModal.endTime}
                        onChange={(e) => setStatusModal({ ...statusModal, endTime: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border, #ece7de)',
                          backgroundColor: '#ffffff',
                          fontSize: '0.76rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          height: '34px',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                    Chef Preparation Notes (optional, included in confirmation email)
                  </label>
                  <textarea
                    rows={3}
                    value={statusModal.chefNotes}
                    onChange={(e) => setStatusModal({ ...statusModal, chefNotes: e.target.value })}
                    placeholder="e.g. Bringing carbon steel pans; please ensure stovetop is accessible..."
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.76rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}

            {statusModal.targetStatus === 'ready' && (
              <>
                <div
                  style={{
                    backgroundColor: '#f5f3ff',
                    border: '1px solid #ddd6fe',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    fontSize: '0.74rem',
                    color: '#5b21b6',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Box Order Ready:</strong> Marking this order as <strong>Ready</strong> will send an automated email notification to the client stating their meal box has been prepared and is ready for pickup or outbound dispatch.
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                    Pickup / Dispatch Window
                  </label>
                  <div
                    style={{
                      height: '34px',
                      padding: '0 10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd6fe',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#5b21b6',
                    }}
                  >
                    <Clock size={13} color="#6d28d9" style={{ flexShrink: 0 }} />
                    {formatArrivalWindow(statusModal.visit.arrivalWindow) || `${convert24To12(statusModal.startTime)} – ${convert24To12(statusModal.endTime)}`}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                    Chef Dispatch / Pickup Notes (optional, included in client email)
                  </label>
                  <textarea
                    rows={3}
                    value={statusModal.chefNotes}
                    onChange={(e) => setStatusModal({ ...statusModal, chefNotes: e.target.value })}
                    placeholder="e.g. Freshly packed in insulated thermal boxes. Ready at the kitchen reception..."
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.76rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}

            {statusModal.targetStatus === 'cancelled' && (
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#1e1b16' }}>
                  Cancellation Reason (sent in email to client) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={statusModal.cancellationReason}
                  onChange={(e) => setStatusModal({ ...statusModal, cancellationReason: e.target.value })}
                  placeholder="e.g. Ingredient supply disruption, emergency schedule conflict..."
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.76rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {statusModal.targetStatus === 'completed' && (
              <p
                style={{
                  fontSize: '0.74rem',
                  color: '#166534',
                  backgroundColor: '#f0fdf4',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                This will finalize and archive the appointment in client history (no extra email notification is sent).
              </p>
            )}
          </form>
        </Dialog>
      )}

      {/* Create Appointment for Client Modal */}
      {isCreateOpen && (
        <Dialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Schedule Appointment for Client"
          maxWidth="760px"
          footer={
            <div className="dialog-footer-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={createForm.submitting}
                style={{
                  borderRadius: '3px',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 14px',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateSubmit}
                disabled={createForm.submitting}
                style={{
                  borderRadius: '3px',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 16px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary, #2e3b12)',
                  color: '#ffffff',
                }}
              >
                {createForm.submitting
                  ? 'Scheduling...'
                  : createForm.selectedDishes.length > 0
                  ? 'Schedule Appointment'
                  : 'Schedule & Send Menu Invitation'}
              </Button>
            </div>
          }
        >
          <form
            onSubmit={handleCreateSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {createForm.error && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  color: '#b91c1c',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <WarningIcon size={14} color="#b91c1c" />
                <span>{createForm.error}</span>
              </div>
            )}

            {/* Step / Section 1: Client Selection (Custom Dropdown with Live Search) */}
            <div ref={clientDropdownRef} style={{ position: 'relative' }}>
              <label
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '4px',
                  color: '#1e1b16',
                }}
              >
                Client *
              </label>

              {/* Custom Dropdown Trigger Button */}
              <div
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                style={{
                  width: '100%',
                  minHeight: '34px',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  fontSize: '0.76rem',
                  color: selectedClient ? '#1e1b16' : '#716c62',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                {selectedClient ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#1e1b16' }}>{selectedClient.name}</strong>
                    <span style={{ color: '#716c62', fontSize: '0.72rem' }}>({selectedClient.email})</span>
                    {selectedClient.location && (
                      <span
                        style={{
                          fontSize: '0.66rem',
                          color: '#57534e',
                          backgroundColor: '#ede8df',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <MapPinIcon size={10} color="#57534e" />
                        {selectedClient.location}
                      </span>
                    )}
                  </div>
                ) : (
                  <span>-- Click to Search & Select Client --</span>
                )}
                <span style={{ fontSize: '0.62rem', color: '#716c62', marginLeft: '8px' }}>
                  {clientDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Custom Dropdown Search Panel */}
              {clientDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 60,
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '6px',
                    maxHeight: '230px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '6px' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <SearchIcon size={12} color="#716c62" />
                    </span>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type client name, email, or city..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        height: '28px',
                        padding: '0 8px 0 26px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border, #ece7de)',
                        backgroundColor: 'var(--color-bg, #fbf9f5)',
                        fontSize: '0.72rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: 'var(--color-text, #1e1b16)',
                      }}
                    />
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '170px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filteredClients.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.72rem', color: '#8c857b' }}>
                        No clients match &ldquo;{clientSearchTerm}&rdquo;
                      </div>
                    ) : (
                      filteredClients.map((c) => {
                        const isSelected = createForm.clientId === c._id;
                        return (
                          <div
                            key={c._id}
                            onClick={() => {
                              handleClientChange(c._id);
                              setClientDropdownOpen(false);
                            }}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '3px',
                              backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
                              border: isSelected ? '1px solid #a7f3d0' : '1px solid transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = '#f3efe6';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1e1b16' }}>
                                {c.name}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#716c62' }}>
                                {c.email} {c.location ? `• ${c.location}` : ''}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {c.allergies && c.allergies.length > 0 ? (
                                <span
                                  style={{
                                    fontSize: '0.60rem',
                                    padding: '1px 5px',
                                    borderRadius: '2px',
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                >
                                  <WarningIcon size={9} color="#991b1b" />
                                  <span>{c.allergies.length} allergies</span>
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.60rem',
                                    padding: '1px 5px',
                                    borderRadius: '2px',
                                    backgroundColor: '#ecfdf5',
                                    color: '#065f46',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                >
                                  <CheckCircleIcon size={9} color="#065f46" />
                                  <span>Clean</span>
                                </span>
                              )}
                              {isSelected && (
                                <CheckCircleIcon size={12} color="#065f46" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Selected Client Dossier Card */}
              {selectedClient && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    fontSize: '0.72rem',
                    color: '#57534e',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {selectedClient.phone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <PhoneIcon size={11} color="#655e53" /> {selectedClient.phone}
                    </span>
                  )}
                  {selectedClient.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPinIcon size={11} color="#655e53" /> {selectedClient.location}
                    </span>
                  )}
                  {selectedClient.allergies && selectedClient.allergies.length > 0 ? (
                    <span
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#991b1b',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <WarningIcon size={10} color="#991b1b" />
                      <span>Allergies: {selectedClient.allergies.join(', ')}</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#059669',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircleIcon size={10} color="#059669" />
                      <span>No declared allergens</span>
                    </span>
                  )}
                  {selectedClient.dietaryPreferences && selectedClient.dietaryPreferences.length > 0 && (
                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '1px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      Diet: {selectedClient.dietaryPreferences.join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step / Section 2: Visit Date & Timing */}
            <div
              className="dialog-grid-2col"
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Visit Date *
                </label>
                <CustomDatePicker
                  required
                  value={createForm.visitDate}
                  min={toDateInputValue(new Date())}
                  onChange={(e) => setCreateForm({ ...createForm, visitDate: e.target.value })}
                  style={{
                    height: '34px',
                    fontSize: '0.76rem',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Arrival Window Preview
                </label>
                <div
                  style={{
                    height: '34px',
                    padding: '0 10px',
                    borderRadius: '4px',
                    border: '1px solid #a7f3d0',
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#065f46',
                  }}
                >
                  <Clock size={12} color="#065f46" style={{ flexShrink: 0 }} />
                  {createForm.startTime && createForm.endTime
                    ? `${convert24To12(createForm.startTime)} – ${convert24To12(createForm.endTime)}`
                    : 'Timing pending'}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#4a463e',
                  }}
                >
                  Arrival Time Range (Start & End)
                </label>
                <div className="dialog-grid-2col">
                  <input
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      outline: 'none',
                      color: 'var(--color-text, #1e1b16)',
                    }}
                  />
                  <input
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      outline: 'none',
                      color: 'var(--color-text, #1e1b16)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step / Section 3: Party Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Adults *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={createForm.adults}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, adults: Math.max(1, parseInt(e.target.value, 10) || 1) })
                  }
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    fontSize: '0.76rem',
                    outline: 'none',
                    color: 'var(--color-text, #1e1b16)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={createForm.children}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, children: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    fontSize: '0.76rem',
                    outline: 'none',
                    color: 'var(--color-text, #1e1b16)',
                  }}
                />
              </div>

              {createForm.children > 0 && (
                <div>
                  <label
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'block',
                      marginBottom: '4px',
                      color: '#1e1b16',
                    }}
                  >
                    Children Ages
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4, 7"
                    value={createForm.childrenAges}
                    onChange={(e) => setCreateForm({ ...createForm, childrenAges: e.target.value })}
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.76rem',
                      outline: 'none',
                      color: 'var(--color-text, #1e1b16)',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.70rem', color: '#716c62', marginBottom: '4px' }}>Total Party</span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#1e1b16',
                    backgroundColor: '#f6f3eb',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #ede8df',
                    textAlign: 'center',
                  }}
                >
                  {(parseInt(createForm.adults, 10) || 0) + (parseInt(createForm.children, 10) || 0)} Guests
                </span>
              </div>
            </div>

            {/* Special Notes & Requests */}
            <div className="dialog-grid-2col">
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Client Requests / Dining Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Birthday dinner, mild spices, prefers olive oil..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    fontSize: '0.74rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: 'var(--color-text, #1e1b16)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#1e1b16',
                  }}
                >
                  Chef Missy Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring special copper pans, prepare extra portion..."
                  value={createForm.chefNotes}
                  onChange={(e) => setCreateForm({ ...createForm, chefNotes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    fontSize: '0.74rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: 'var(--color-text, #1e1b16)',
                  }}
                />
              </div>
            </div>

            {/* Step / Section 4: Menu & Dish Selection */}
            <div
              style={{
                border: '1px solid var(--color-border, #ece7de)',
                borderRadius: '4px',
                padding: '12px',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.80rem', fontWeight: 700, color: '#1e1b16' }}>
                    Menu & Dish Selection (0–7 Dishes)
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: '#716c62' }}>
                    Select courses now, or leave empty to let client choose.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      fontWeight: 600,
                      backgroundColor: createForm.selectedDishes.length === 7 ? '#fef3c7' : '#ecfdf5',
                      color: createForm.selectedDishes.length === 7 ? '#92400e' : '#065f46',
                      border: '1px solid',
                      borderColor: createForm.selectedDishes.length === 7 ? '#fde68a' : '#a7f3d0',
                    }}
                  >
                    {createForm.selectedDishes.length} / 7 Dishes
                  </span>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      fontWeight: 600,
                      backgroundColor: timeIntensiveCount >= 2 ? '#fef2f2' : '#f6f3eb',
                      color: timeIntensiveCount >= 2 ? '#991b1b' : '#57534e',
                      border: '1px solid',
                      borderColor: timeIntensiveCount >= 2 ? '#fecaca' : '#ede8df',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={11} color={timeIntensiveCount >= 2 ? '#991b1b' : '#57534e'} style={{ flexShrink: 0 }} />
                    <span>{timeIntensiveCount} / 2 Time-Intensive</span>
                  </span>
                </div>
              </div>

              {/* Selected Dishes Chips */}
              {createForm.selectedDishes.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px dashed #d6ccbe',
                  }}
                >
                  {createForm.selectedDishes.map((dish) => (
                    <div
                      key={dish._id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        backgroundColor: 'var(--color-bg, #fbf9f5)',
                        border: '1px solid #dcd5ca',
                        borderRadius: '3px',
                        fontSize: '0.72rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#1e1b16' }}>{dish.name}</span>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          padding: '0 4px',
                          borderRadius: '2px',
                          backgroundColor: '#ede8df',
                          color: '#655e53',
                          textTransform: 'capitalize',
                        }}
                      >
                        {dish.type || 'main'}
                      </span>
                      {dish.isTimeIntensive && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            color: '#b45309',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <Clock size={10} color="#b45309" style={{ flexShrink: 0 }} />
                          <span>30+ min</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(dish._id)}
                        title="Remove dish"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0 2px',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '8px 10px',
                    backgroundColor: '#faf8f4',
                    borderRadius: '4px',
                    border: '1px dashed #ede8df',
                    marginBottom: '10px',
                    fontSize: '0.72rem',
                    color: '#8c857b',
                  }}
                >
                  No dishes selected. Client will be invited to choose their menu via email with direct link.
                </div>
              )}

              {/* Dish Filter & Search */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Courses' },
                    { id: 'main', label: 'Mains' },
                    { id: 'starter', label: 'Starters' },
                    { id: 'dessert', label: 'Desserts' },
                    { id: 'side', label: 'Sides' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, dishCategory: cat.id })}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '3px',
                        border:
                          createForm.dishCategory === cat.id
                            ? '1px solid #2e3b12'
                            : '1px solid var(--color-border, #ece7de)',
                        backgroundColor:
                          createForm.dishCategory === cat.id ? '#2e3b12' : 'var(--color-bg, #fbf9f5)',
                        color: createForm.dishCategory === cat.id ? '#ffffff' : '#4a463e',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '200px' }}>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={createForm.dishSearch}
                    onChange={(e) => setCreateForm({ ...createForm, dishSearch: e.target.value })}
                    style={{
                      width: '100%',
                      height: '26px',
                      padding: '0 8px',
                      borderRadius: '3px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.70rem',
                      outline: 'none',
                      color: 'var(--color-text, #1e1b16)',
                    }}
                  />
                </div>
              </div>

              {/* Available Dishes Scrollable List */}
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-border, #ece7de)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  padding: '4px',
                }}
              >
                {filteredAvailableDishes.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.72rem', color: '#8c857b' }}>
                    No dishes found matching search criteria.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {filteredAvailableDishes.map((dish) => {
                      const isAdded = createForm.selectedDishes.some((d) => d._id === dish._id);
                      const isMaxDishes = createForm.selectedDishes.length >= 7;
                      const isMaxTime = dish.isTimeIntensive && timeIntensiveCount >= 2;
                      const isDisabled = !isAdded && (isMaxDishes || isMaxTime);

                      // Check client allergen conflicts
                      const clientAllergens = (selectedClient?.allergies || []).map((a) =>
                        a.toLowerCase().trim()
                      );
                      const dishAllergens = (dish.allergens || []).map((a) => a.toLowerCase().trim());
                      const hasConflict = dishAllergens.some((a) => clientAllergens.includes(a));

                      return (
                        <div
                          key={dish._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            backgroundColor: isAdded ? '#ecfdf5' : 'var(--color-bg, #fbf9f5)',
                            border: isAdded ? '1px solid #a7f3d0' : '1px solid var(--color-border, #ece7de)',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {dish.photoUrl ? (
                              <img
                                src={dish.photoUrl}
                                alt={dish.name}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '2px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '2px',
                                  backgroundColor: '#ede8df',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <UtensilsIcon size={12} color="#716c62" />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#1e1b16',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {dish.name}
                              </span>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    color: '#716c62',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {dish.type || 'main'}
                                </span>
                                {dish.isTimeIntensive && (
                                  <span
                                    style={{
                                      fontSize: '0.60rem',
                                      color: '#b45309',
                                      backgroundColor: '#fef3c7',
                                      padding: '0 4px',
                                      borderRadius: '2px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '2px',
                                    }}
                                  >
                                    <Clock size={9} color="#b45309" style={{ flexShrink: 0 }} />
                                    <span>30+ min</span>
                                  </span>
                                )}
                                {hasConflict && (
                                  <span
                                    style={{
                                      fontSize: '0.60rem',
                                      color: '#dc2626',
                                      backgroundColor: '#fee2e2',
                                      padding: '0 4px',
                                      borderRadius: '2px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '2px',
                                    }}
                                  >
                                    <WarningIcon size={9} color="#dc2626" />
                                    <span>Allergen</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isAdded ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveDish(dish._id)}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.64rem',
                                  borderRadius: '2px',
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fee2e2',
                                  color: '#b91c1c',
                                  cursor: 'pointer',
                                }}
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddDish(dish)}
                                disabled={isDisabled}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.64rem',
                                  borderRadius: '2px',
                                  border: isDisabled ? '1px solid #e5e7eb' : '1px solid #2e3b12',
                                  backgroundColor: isDisabled ? '#f3f4f6' : '#2e3b12',
                                  color: isDisabled ? '#9ca3af' : '#ffffff',
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Condition 2 Notice Banner */}
            {createForm.selectedDishes.length > 0 ? (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '0.72rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: 1.4,
                }}
              >
                <CheckCircleIcon size={14} color="#16a34a" />
                <span>
                  <strong>Full Menu Specified ({createForm.selectedDishes.length} dishes):</strong> No email will be sent now to avoid duplicate emails. When you click &ldquo;Confirm&rdquo; on this appointment, the confirmation email will be sent to the client.
                </span>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '0.72rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: 1.4,
                }}
              >
                <WarningIcon size={14} color="#b45309" />
                <span>
                  <strong>No Menu Selected:</strong> An invitation email will automatically be sent to the client with a direct reservation link asking them to choose their courses.
                </span>
              </div>
            )}
          </form>
        </Dialog>
      )}
    </div>
  );
}
