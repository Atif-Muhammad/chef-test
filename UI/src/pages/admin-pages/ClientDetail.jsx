import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  UserX,
  UserCheck,
  AlertTriangle,
  Package,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Shield,
  Leaf,
  FileText,
  Heart,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import Table from '../../components/shared/Table';
import {
  formatArrivalWindow,
  formatLocalDate,
  convert24To12,
  parseTo24Time,
  toDateInputValue,
} from '../../utils/formatters';
import {
  WarningIcon,
  CheckCircleIcon,
  ClipboardIcon,
  HeartIcon,
} from '../../components/shared/Icons';

export default function ClientDetail() {
  const { id } = useParams();

  // Responsive mode: tabs on mobile (< 1024px), unified multi-card grid on desktop (>= 1024px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Section 1: Profile (Personal info, dietary, allergy, notes)
  const [profileLoading, setProfileLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [totalVisits, setTotalVisits] = useState(0);
  const [latestVisit, setLatestVisit] = useState(null);

  // Section 2: Favourites
  const [favouritesLoading, setFavouritesLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);

  // Section 3: Recent Orders / Visits
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [visitsTotalCount, setVisitsTotalCount] = useState(0);

  // Tabs state for mobile view: 'appointments' | 'dietary' | 'favourites'
  const [activeTab, setActiveTab] = useState('appointments');

  // From-To date filters for Recent Orders section
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

  // User Termination / Status Modal state
  const [statusActionModal, setStatusActionModal] = useState({
    open: false,
    targetStatus: null, // 'active' | 'terminated'
    submitting: false,
  });

  // Appointment Status modal (Confirm / Ready / Cancel)
  const [statusModal, setStatusModal] = useState({
    open: false,
    visit: null,
    targetStatus: 'confirmed',
    confirmedDate: '',
    startTime: '16:00',
    endTime: '17:00',
    chefNotes: '',
    cancellationReason: '',
    submitting: false,
  });

  /* -------------------------------------------------------------
   * INDEPENDENT API FETCHERS WITH DEDICATED LOADERS
   * ----------------------------------------------------------- */

  // 1. Fetch Client Profile (Personal info, dietary, allergies, notes)
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get(`/admin/clients/${id}/profile`).catch(() =>
        // Fallback to general client endpoint if profile subroute is not yet hit
        api.get(`/admin/clients/${id}`)
      );
      if (res.data?.client) {
        setClient(res.data.client);
        setTotalVisits(res.data.totalVisits || 0);
        setLatestVisit(res.data.latestVisit || null);
      }
    } catch (err) {
      console.error('Failed to fetch client profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Fetch Favorite Dishes
  const fetchFavourites = async () => {
    setFavouritesLoading(true);
    try {
      const res = await api.get(`/admin/clients/${id}/favourites`).catch(() =>
        api.get(`/admin/clients/${id}`)
      );
      setFavourites(res.data?.favourites || res.data?.client?.favouriteDishes || []);
    } catch (err) {
      console.error('Failed to fetch client favourites:', err);
    } finally {
      setFavouritesLoading(false);
    }
  };

  // 3. Fetch Recent Orders / Visits (filters only reload this section!)
  const fetchVisits = async () => {
    setVisitsLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(`/admin/clients/${id}/visits`, { params }).catch(() =>
        api.get(`/admin/clients/${id}`, { params })
      );

      const fetchedVisits = res.data?.visits || [
        ...(res.data?.upcomingVisits || []),
        ...(res.data?.pastVisits || []),
      ];

      setVisits(fetchedVisits);
      setVisitsTotalCount(res.data?.totalVisits || fetchedVisits.length);
    } catch (err) {
      console.error('Failed to fetch client visits:', err);
    } finally {
      setVisitsLoading(false);
    }
  };

  // Initial load: fetch profile and favourites once
  useEffect(() => {
    fetchProfile();
    fetchFavourites();
  }, [id]);

  // Debounced visits fetch on date filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisits();
    }, 180);
    return () => clearTimeout(timer);
  }, [id, startDate, endDate]);

  // Toggle user status (allow / terminate)
  const handleToggleClientStatus = async () => {
    if (!statusActionModal.targetStatus) return;
    setStatusActionModal((prev) => ({ ...prev, submitting: true }));

    try {
      const targetStatus = statusActionModal.targetStatus;
      await api.patch(`/admin/clients/${id}/status`, { status: targetStatus });
      setClient((prev) => (prev ? { ...prev, status: targetStatus } : prev));
      setStatusActionModal({ open: false, targetStatus: null, submitting: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update client status');
      setStatusActionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const openStatusModal = (visit, targetStatus) => {
    if (targetStatus === 'cancelled' && visit.status === 'confirmed') {
      alert('Confirmed dining appointments cannot be declined directly.');
      return;
    }

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

      await api.patch(`/admin/visits/${statusModal.visit._id}/status`, payload);
      setStatusModal((prev) => ({ ...prev, open: false, submitting: false }));
      fetchVisits();
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visit status');
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const isTerminated = client?.status === 'terminated';

  const memberSince = client?.createdAt
    ? new Date(client.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const lastOrderDate = latestVisit?.visitDate
    ? new Date(latestVisit.visitDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : visits.length > 0 && visits[0].visitDate
    ? new Date(visits[0].visitDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const preferredDelivery = latestVisit?.arrivalWindow
    ? formatArrivalWindow(latestVisit.arrivalWindow)
    : visits.length > 0 && visits[0].arrivalWindow
    ? formatArrivalWindow(visits[0].arrivalWindow)
    : client?.location
    ? 'Standard Window'
    : '—';

  // Table columns for full-width Dining Appointments section
  const appointmentColumns = [
    {
      header: 'Scheduled Date & Timing',
      accessor: 'visitDate',
      width: '210px',
      render: (v) => {
        const formattedWindow = formatArrivalWindow(v.arrivalWindow);
        return (
          <div>
            <strong style={{ fontSize: '0.80rem', color: '#1e1b16', display: 'block' }}>
              {formatLocalDate(v.visitDate)}
            </strong>
            {formattedWindow && formattedWindow !== 'Timing pending' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.66rem',
                  color: '#065f46',
                  fontWeight: 600,
                  backgroundColor: '#ecfdf5',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid #a7f3d0',
                  marginTop: '2px',
                }}
              >
                <Clock size={10} color="#065f46" style={{ flexShrink: 0 }} /> {formattedWindow}
              </span>
            ) : (
              <span style={{ display: 'block', fontSize: '0.66rem', color: '#b45309', marginTop: '2px' }}>
                Timing pending
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Menu & Dishes',
      accessor: 'guests',
      render: (v) => {
        const dishNames = (v.dishes || [])
          .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
          .filter(Boolean);

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#1e1b16', fontSize: '0.76rem' }}>
                {v.guests || 2} Guests
              </span>
              <span
                style={{
                  fontSize: '0.64rem',
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  color: '#57534e',
                }}
              >
                {v.dishes?.length || 0} dishes
              </span>
            </div>

            {dishNames.length > 0 && (
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#716c62',
                  marginTop: '2px',
                  maxWidth: '360px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={dishNames.join(', ')}
              >
                {dishNames.join(', ')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Allergy Safety',
      accessor: 'allergyFlags',
      width: '180px',
      render: (v) => {
        const hasConflicts = v.allergyFlags && v.allergyFlags.length > 0;
        return hasConflicts ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {v.allergyFlags.map((flag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  maxWidth: '170px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={`${flag.dishName}: ${flag.conflictAllergen}`}
              >
                <WarningIcon size={10} color="#b91c1c" /> {flag.dishName}: {flag.conflictAllergen}
              </span>
            ))}
          </div>
        ) : (
          <span
            style={{
              color: '#15803d',
              fontSize: '0.70rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircleIcon size={12} color="#15803d" /> No Conflicts
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '105px',
      render: (v) => {
        const isConfirmed = v.status === 'confirmed';
        const isReady = v.status === 'ready';
        const isPending = v.status === 'pending';
        const isCompleted = v.status === 'completed';

        return (
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '3px',
              textTransform: 'capitalize',
              backgroundColor: isConfirmed
                ? '#ecfdf5'
                : isReady
                ? '#f5f3ff'
                : isPending
                ? '#fef3c7'
                : isCompleted
                ? '#f0fdf4'
                : '#fee2e2',
              color: isConfirmed
                ? '#065f46'
                : isReady
                ? '#6d28d9'
                : isPending
                ? '#92400e'
                : isCompleted
                ? '#166534'
                : '#991b1b',
              border: `1px solid ${
                isConfirmed
                  ? '#a7f3d0'
                  : isReady
                  ? '#ddd6fe'
                  : isPending
                  ? '#fde68a'
                  : isCompleted
                  ? '#bbf7d0'
                  : '#fca5a5'
              }`,
              display: 'inline-block',
            }}
          >
            {v.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: '_id',
      align: 'right',
      width: '155px',
      render: (v) => {
        const isPending = v.status === 'pending';
        const isConfirmed = v.status === 'confirmed';
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
            <Link to={`/admin/shopping-list/${v._id}`} title="View shopping list">
              <button
                type="button"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '3px',
                  backgroundColor: '#f5f3ef',
                  border: '1px solid #e7e2d8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede8df')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f3ef')}
              >
                <ClipboardIcon size={11} color="#2e3b12" />
              </button>
            </Link>

            {isPending && (
              <button
                type="button"
                onClick={() => openStatusModal(v, 'confirmed')}
                title="Confirm appointment"
                style={{
                  padding: '0 8px',
                  height: '24px',
                  borderRadius: '3px',
                  border: '1px solid #242e0e',
                  backgroundColor: '#2e3b12',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCircleIcon size={10} color="#ffffff" />
                <span>Confirm</span>
              </button>
            )}

            {isConfirmed && (
              <button
                type="button"
                onClick={() => openStatusModal(v, 'ready')}
                title="Mark order ready for pickup or dispatch"
                style={{
                  padding: '0 8px',
                  height: '24px',
                  borderRadius: '3px',
                  border: '1px solid #5b21b6',
                  backgroundColor: '#6d28d9',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Package size={10} color="#ffffff" />
                <span>Ready</span>
              </button>
            )}

            {isPending && (
              <button
                type="button"
                onClick={() => openStatusModal(v, 'cancelled')}
                title="Decline appointment"
                style={{
                  padding: '0 7px',
                  height: '24px',
                  borderRadius: '3px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Decline
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const getDietaryTagStyle = (tag, index) => {
    const palette = [
      { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
      { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
      { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
      { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
    ];
    return palette[index % palette.length];
  };

  /* -------------------------------------------------------------
   * DEDICATED SKELETON LOADERS
   * ----------------------------------------------------------- */

  const ClientInfoSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', height: '100%', minHeight: '210px' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '62px', height: '62px', borderRadius: '50%', backgroundColor: '#f0ece1' }} className="skeleton-pulse" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ width: '140px', height: '18px', backgroundColor: '#f0ece1', borderRadius: '3px' }} className="skeleton-pulse" />
          <div style={{ width: '180px', height: '12px', backgroundColor: '#f5f3ed', borderRadius: '3px' }} className="skeleton-pulse" />
          <div style={{ width: '110px', height: '12px', backgroundColor: '#f5f3ed', borderRadius: '3px' }} className="skeleton-pulse" />
        </div>
      </div>
      <div className="admin-four-stat-strip" style={{ padding: '10px 8px', backgroundColor: '#fbf9f5', borderRadius: '4px', border: '1px solid #ece7de' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '50px', height: '10px', backgroundColor: '#ede8df', borderRadius: '2px' }} className="skeleton-pulse" />
            <div style={{ width: '60px', height: '14px', backgroundColor: '#f0ece1', borderRadius: '2px' }} className="skeleton-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );

  const AllergyProfileSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', height: '100%', minHeight: '210px' }}>
      <div style={{ width: '110px', height: '16px', backgroundColor: '#f0ece1', borderRadius: '3px', marginBottom: '14px' }} className="skeleton-pulse" />
      <div style={{ height: '34px', backgroundColor: '#fef2f2', borderRadius: '4px', marginBottom: '12px' }} className="skeleton-pulse" />
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <div style={{ width: '60px', height: '24px', backgroundColor: '#fee2e2', borderRadius: '4px' }} className="skeleton-pulse" />
        <div style={{ width: '70px', height: '24px', backgroundColor: '#fee2e2', borderRadius: '4px' }} className="skeleton-pulse" />
      </div>
      <div style={{ height: '44px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }} className="skeleton-pulse" />
    </Card>
  );

  const DietaryPreferencesSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', minHeight: '95px' }}>
      <div style={{ width: '130px', height: '16px', backgroundColor: '#f0ece1', borderRadius: '3px', marginBottom: '12px' }} className="skeleton-pulse" />
      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ width: '80px', height: '24px', backgroundColor: '#ecfdf5', borderRadius: '4px' }} className="skeleton-pulse" />
        <div style={{ width: '70px', height: '24px', backgroundColor: '#eff6ff', borderRadius: '4px' }} className="skeleton-pulse" />
        <div style={{ width: '90px', height: '24px', backgroundColor: '#f5f3ff', borderRadius: '4px' }} className="skeleton-pulse" />
      </div>
    </Card>
  );

  const AdditionalNotesSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', height: '100%', minHeight: '95px' }}>
      <div style={{ width: '120px', height: '16px', backgroundColor: '#f0ece1', borderRadius: '3px', marginBottom: '10px' }} className="skeleton-pulse" />
      <div style={{ width: '90%', height: '12px', backgroundColor: '#f5f3ed', borderRadius: '2px', marginBottom: '6px' }} className="skeleton-pulse" />
      <div style={{ width: '65%', height: '12px', backgroundColor: '#f5f3ed', borderRadius: '2px' }} className="skeleton-pulse" />
    </Card>
  );

  const FavoriteDishesSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', height: '100%', minHeight: '210px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ width: '110px', height: '16px', backgroundColor: '#f0ece1', borderRadius: '3px' }} className="skeleton-pulse" />
        <div style={{ width: '55px', height: '18px', backgroundColor: '#fee2e2', borderRadius: '4px' }} className="skeleton-pulse" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', padding: '7px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0ece1', borderRadius: '4px', flexShrink: 0 }} className="skeleton-pulse" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ width: '80%', height: '12px', backgroundColor: '#ede8df', borderRadius: '2px' }} className="skeleton-pulse" />
              <div style={{ width: '50%', height: '10px', backgroundColor: '#f5f3ed', borderRadius: '2px' }} className="skeleton-pulse" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const RecentOrdersSkeleton = () => (
    <Card style={{ padding: '16px 18px', border: '1px solid #ece7de', borderRadius: '4px', backgroundColor: '#ffffff', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '150px', height: '16px', backgroundColor: '#f0ece1', borderRadius: '3px' }} className="skeleton-pulse" />
        <div style={{ width: '60px', height: '14px', backgroundColor: '#ede8df', borderRadius: '2px' }} className="skeleton-pulse" />
      </div>
      <div style={{ height: '34px', backgroundColor: '#fbf9f5', borderRadius: '4px', border: '1px solid #ece7de', marginBottom: '12px' }} className="skeleton-pulse" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '42px', backgroundColor: '#fcfbf8', borderRadius: '4px', border: '1px solid #f2ede4' }} className="skeleton-pulse" />
        ))}
      </div>
    </Card>
  );

  /* -------------------------------------------------------------
   * SECTION RENDERERS
   * ----------------------------------------------------------- */

  // 1. Client Information Card
  const renderClientInfoCard = () => {
    if (profileLoading || !client) return <ClientInfoSkeleton />;

    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
            <User size={15} color="var(--color-primary, #2e3b12)" />
            <h3
              style={{
                fontSize: '0.90rem',
                color: '#1a1814',
                margin: 0,
                fontWeight: 700,
                fontFamily: 'var(--font-heading, serif)',
              }}
            >
              Client Information
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#2e3b12',
                color: '#ffffff',
                fontSize: '1.35rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ede8df',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {client.photoUrl ? (
                <img
                  src={client.photoUrl}
                  alt={client.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                (client.name || 'C').charAt(0).toUpperCase()
              )}
            </div>

            {/* Name, Status & Contacts */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2
                  style={{
                    color: '#1a1814',
                    fontSize: '1.15rem',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  {client.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.64rem',
                    padding: '1.5px 7px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    backgroundColor: isTerminated ? '#fee2e2' : '#ecfdf5',
                    border: `1px solid ${isTerminated ? '#fca5a5' : '#a7f3d0'}`,
                    color: isTerminated ? '#991b1b' : '#065f46',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  {isTerminated ? 'Terminated' : 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem', color: '#57534e' }}>
                {client.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} color="#8c857b" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#57534e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.email}
                    </span>
                  </div>
                )}
                {client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color="#8c857b" style={{ flexShrink: 0 }} />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} color="#8c857b" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div
          className="admin-four-stat-strip"
          style={{
            padding: '9px 8px',
            backgroundColor: '#fbf9f5',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.62rem', color: '#8c857b', display: 'block', marginBottom: '2px' }}>
              Client Since
            </span>
            <strong style={{ fontSize: '0.72rem', color: '#1a1814', fontWeight: 700, display: 'block' }}>
              {memberSince}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.62rem', color: '#8c857b', display: 'block', marginBottom: '2px' }}>
              Total Orders
            </span>
            <strong style={{ fontSize: '0.76rem', color: 'var(--color-primary, #2e3b12)', fontWeight: 700, display: 'block' }}>
              {totalVisits}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.62rem', color: '#8c857b', display: 'block', marginBottom: '2px' }}>
              Last Order
            </span>
            <strong style={{ fontSize: '0.72rem', color: '#1a1814', fontWeight: 700, display: 'block' }}>
              {lastOrderDate}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.62rem', color: '#8c857b', display: 'block', marginBottom: '2px' }}>
              Preferred Delivery
            </span>
            <strong
              style={{
                fontSize: '0.70rem',
                color: '#1a1814',
                fontWeight: 700,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={preferredDelivery}
            >
              {preferredDelivery}
            </strong>
          </div>
        </div>
      </Card>
    );
  };

  // 2. Allergy Profile Card
  const renderAllergyProfileCard = () => {
    if (profileLoading || !client) return <AllergyProfileSkeleton />;

    const hasAllergies = client.allergies && client.allergies.length > 0;
    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
            <Shield size={15} color="var(--color-primary, #2e3b12)" />
            <h3
              style={{
                fontSize: '0.90rem',
                color: '#1a1814',
                margin: 0,
                fontWeight: 700,
                fontFamily: 'var(--font-heading, serif)',
              }}
            >
              Allergy Profile
            </h3>
          </div>

          {/* Warning / Safety Banner */}
          {hasAllergies ? (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: '#991b1b', lineHeight: 1.4, fontWeight: 500 }}>
                This client has food allergies. Please ensure all menus and dishes are prepared without these allergens.
              </span>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '4px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <CheckCircle2 size={15} color="#166534" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: '#166534', lineHeight: 1.4, fontWeight: 500 }}>
                No declared food allergies recorded for this client.
              </span>
            </div>
          )}

          {/* Allergen Badges */}
          {hasAllergies && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {client.allergies.map((alg, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                  <span>{alg}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Allergy Notes Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <FileText size={13} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '1px' }}>
              Allergy Notes
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>
              {hasAllergies
                ? `Cross-contamination safety protocol active for ${client.allergies.join(', ')}. Chef Missy verifies ingredient packaging.`
                : 'Standard preparation protocols apply. No special allergen substitutions requested.'}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  // 3. Dietary Preferences Card
  const renderDietaryPreferencesCard = () => {
    if (profileLoading || !client) return <DietaryPreferencesSkeleton />;

    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <Leaf size={15} color="var(--color-primary, #2e3b12)" />
          <h3
            style={{
              fontSize: '0.90rem',
              color: '#1a1814',
              margin: 0,
              fontWeight: 700,
              fontFamily: 'var(--font-heading, serif)',
            }}
          >
            Dietary Preferences
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {client.dietaryPreferences && client.dietaryPreferences.length > 0 ? (
            client.dietaryPreferences.map((pref, i) => {
              const s = getDietaryTagStyle(pref, i);
              return (
                <span
                  key={i}
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    backgroundColor: s.bg,
                    border: `1px solid ${s.border}`,
                    color: s.color,
                    fontWeight: 600,
                  }}
                >
                  {pref}
                </span>
              );
            })
          ) : (
            <span style={{ color: '#716c62', fontSize: '0.74rem' }}>
              Standard / Omnivore (No specific dietary regimen specified)
            </span>
          )}
        </div>
      </Card>
    );
  };

  // 4. Additional Notes Card
  const renderAdditionalNotesCard = () => {
    if (profileLoading || !client) return <AdditionalNotesSkeleton />;

    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
          <FileText size={15} color="var(--color-primary, #2e3b12)" />
          <h3
            style={{
              fontSize: '0.90rem',
              color: '#1a1814',
              margin: 0,
              fontWeight: 700,
              fontFamily: 'var(--font-heading, serif)',
            }}
          >
            Additional Notes
          </h3>
        </div>

        {client.specialRequests ? (
          <p style={{ fontSize: '0.74rem', color: '#4a463e', lineHeight: 1.5, margin: '0 0 8px' }}>
            {client.specialRequests}
          </p>
        ) : (
          <p style={{ fontSize: '0.74rem', color: '#8c857b', fontStyle: 'italic', margin: '0 0 8px' }}>
            No special client preparation notes recorded.
          </p>
        )}

        {client.dislikedIngredients && client.dislikedIngredients.length > 0 && (
          <div style={{ paddingTop: '6px', borderTop: '1px solid #f2ede4' }}>
            <span style={{ fontSize: '0.67rem', color: '#716c62', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Disliked Ingredients:
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {client.dislikedIngredients.map((ing, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.66rem',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    backgroundColor: '#faf8f5',
                    border: '1px solid #ece7de',
                    color: '#57534e',
                  }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // 5. Favorite Dishes Card
  const renderFavoriteDishesCard = () => {
    if (favouritesLoading) return <FavoriteDishesSkeleton />;

    const favList = favourites || [];
    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Heart size={15} color="#dc2626" fill="#dc2626" />
            <h3
              style={{
                fontSize: '0.90rem',
                color: '#1a1814',
                margin: 0,
                fontWeight: 700,
                fontFamily: 'var(--font-heading, serif)',
              }}
            >
              Favorite Dishes
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.66rem',
              padding: '1.5px 7px',
              borderRadius: '4px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontWeight: 700,
            }}
          >
            {favList.length} Saved
          </span>
        </div>

        {favList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 16px',
              backgroundColor: '#fbf9f5',
              borderRadius: '4px',
              border: '1px dashed #ded8cb',
            }}
          >
            <Heart size={20} color="#a8a29e" style={{ margin: '0 auto 6px', display: 'block' }} />
            <span style={{ fontSize: '0.74rem', color: '#716c62', display: 'block' }}>
              No favorite dishes saved yet by this client.
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
            {favList.map((dish) => {
              if (!dish || typeof dish !== 'object') return null;
              return (
                <div
                  key={dish._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '8px',
                    padding: '7px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#f0ece1',
                    }}
                  >
                    <img
                      src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                      alt={dish.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        fontSize: '0.74rem',
                        color: '#1a1814',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px',
                      }}
                      title={dish.name}
                    >
                      {dish.name}
                    </strong>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.58rem',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          backgroundColor: '#f5f3ef',
                          color: '#655e53',
                          textTransform: 'capitalize',
                          fontWeight: 600,
                        }}
                      >
                        {dish.type || 'Main'}
                      </span>
                      {dish.isTimeIntensive && (
                        <span
                          style={{
                            fontSize: '0.58rem',
                            padding: '1px 5px',
                            borderRadius: '2px',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            fontWeight: 600,
                          }}
                        >
                          30+ min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  // 6. Recent Orders / Visits Card (FULL WIDTH at bottom!)
  const renderRecentOrdersCard = () => {
    return (
      <Card
        style={{
          padding: '16px 18px',
          border: '1px solid var(--color-border, #ece7de)',
          borderRadius: '4px',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Calendar size={15} color="var(--color-primary, #2e3b12)" />
            <h3
              style={{
                fontSize: '0.92rem',
                color: '#1a1814',
                margin: 0,
                fontWeight: 700,
                fontFamily: 'var(--font-heading, serif)',
              }}
            >
              Recent Orders / Visits
            </h3>
          </div>
          <Link
            to="/admin/selections"
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-primary, #2e3b12)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Date Range Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            flexWrap: 'wrap',
            backgroundColor: '#fbf9f5',
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ece7de',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '0.70rem', color: '#655e53', fontWeight: 600 }}>From:</label>
            <CustomDatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ height: '26px', fontSize: '0.70rem', width: '125px' }}
              wrapperStyle={{ width: '125px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '0.70rem', color: '#655e53', fontWeight: 600 }}>To:</label>
            <CustomDatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ height: '26px', fontSize: '0.70rem', width: '125px' }}
              wrapperStyle={{ width: '125px' }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              title="Reset date filters"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 7px',
                height: '24px',
                borderRadius: '3px',
                border: '1px solid #e7e2d8',
                backgroundColor: '#ffffff',
                fontSize: '0.66rem',
                color: '#716c62',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={10} />
              <span>Clear</span>
            </button>
          )}

          <span style={{ fontSize: '0.68rem', color: '#716c62', marginLeft: 'auto' }}>
            {visitsLoading ? 'Updating records...' : `${visits.length} record${visits.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {/* Orders Table with Skeleton Loader */}
        {visitsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: '42px',
                  backgroundColor: '#fcfbf8',
                  borderRadius: '4px',
                  border: '1px solid #f2ede4',
                }}
                className="skeleton-pulse"
              />
            ))}
          </div>
        ) : (
          <Table
            columns={appointmentColumns}
            data={visits}
            emptyMessage="No dining appointments found matching the selected filter."
          />
        )}
      </Card>
    );
  };

  /* -------------------------------------------------------------
   * MAIN VIEW
   * ----------------------------------------------------------- */

  if (!profileLoading && !client) {
    return (
      <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '20px' }}>
        <p style={{ color: '#716c62', fontSize: '0.84rem' }}>Client record not found.</p>
        <Link to="/admin/clients">
          <Button size="sm" variant="outline">&larr; Back to Clients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: '24px' }}>
      <style>{`
        @keyframes shimmerPulse {
          0% { opacity: 0.55; }
          50% { opacity: 0.95; }
          100% { opacity: 0.55; }
        }
        .skeleton-pulse {
          animation: shimmerPulse 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Top Breadcrumb & Page Header */}
      <div style={{ marginBottom: '14px' }}>
        <Link
          to="/admin/clients"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--color-primary, #2e3b12)',
            fontSize: '0.74rem',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '4px',
          }}
        >
          &larr; Back to Client List
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.30rem',
                color: 'var(--color-primary, #2e3b12)',
                fontFamily: 'var(--font-heading, serif)',
                fontWeight: 700,
                margin: '0 0 2px',
              }}
            >
              Client Details
            </h1>
            <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.74rem', margin: 0 }}>
              View and manage client information, dietary preferences, allergy profile, and order history.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Status Toggle Action Button */}
            {client && (
              <button
                type="button"
                onClick={() =>
                  setStatusActionModal({
                    open: true,
                    targetStatus: isTerminated ? 'active' : 'terminated',
                    submitting: false,
                  })
                }
                style={{
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: isTerminated ? '#2e3b12' : '#ffffff',
                  color: isTerminated ? '#ffffff' : '#b91c1c',
                  border: `1px solid ${isTerminated ? '#242e0e' : '#fecaca'}`,
                  boxShadow: 'none',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isTerminated) e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  if (!isTerminated) e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {isTerminated ? (
                  <>
                    <UserCheck size={12} color="#ffffff" />
                    <span>Allow System Access</span>
                  </>
                ) : (
                  <>
                    <UserX size={12} color="#b91c1c" />
                    <span>Terminate User</span>
                  </>
                )}
              </button>
            )}

            {/* Add Order / Selections Link */}
            <Link
              to="/admin/selections"
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary, #2e3b12)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
                boxShadow: 'none',
              }}
            >
              <span>+ Add Order / Visit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* VIEWPORT-BASED LAYOUT:
          - Desktop (>= 1024px):
            - Row 1: Client Information (Left) | Allergy Profile (Right)
            - Row 2: Dietary Preferences & Additional Notes (Left) | Favorite Dishes (Right)
            - Row 3: FULL WIDTH Recent Orders / Visits (Bottom)
          - Mobile / Tablet (< 1024px): Classic Tab-based Layout
      */}
      {!isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row 1: Client Info & Allergy Profile Side-by-Side with Matched Alignment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '14px', alignItems: 'stretch' }}>
            {renderClientInfoCard()}
            {renderAllergyProfileCard()}
          </div>

          {/* Row 2: Dietary Preferences + Additional Notes (Left) & Favorite Dishes (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '14px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
              {renderDietaryPreferencesCard()}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {renderAdditionalNotesCard()}
              </div>
            </div>
            {renderFavoriteDishesCard()}
          </div>

          {/* Row 3: FULL-WIDTH Recent Orders / Visits at Bottom */}
          <div>
            {renderRecentOrdersCard()}
          </div>
        </div>
      ) : (
        /* MOBILE / TABLET TAB LAYOUT */
        <div>
          {/* Top Profile Summary on Mobile */}
          <div style={{ marginBottom: '12px' }}>
            {renderClientInfoCard()}
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid var(--color-border, #ece7de)',
              marginBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              style={{
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'appointments' ? 700 : 500,
                color: activeTab === 'appointments' ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'appointments' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <span>Dining Appointments</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'appointments' ? '#ede8df' : '#f5f3ef',
                  color: '#4a463e',
                  fontWeight: 600,
                }}
              >
                {visitsTotalCount || totalVisits || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dietary')}
              style={{
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'dietary' ? 700 : 500,
                color: activeTab === 'dietary' ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'dietary' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <span>Dietary & Allergies</span>
              {client?.allergies && client.allergies.length > 0 && (
                <span
                  style={{
                    fontSize: '0.60rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    fontWeight: 600,
                  }}
                >
                  {client.allergies.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('favourites')}
              style={{
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: activeTab === 'favourites' ? 700 : 500,
                color: activeTab === 'favourites' ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'favourites' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <span>Favourites</span>
              <span
                style={{
                  fontSize: '0.60rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'favourites' ? '#fee2e2' : '#f5f3ef',
                  color: activeTab === 'favourites' ? '#dc2626' : '#716c62',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <HeartIcon filled={activeTab === 'favourites'} size={8} color={activeTab === 'favourites' ? '#dc2626' : '#716c62'} />
                {favourites.length}
              </span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'appointments' && renderRecentOrdersCard()}
          {activeTab === 'dietary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {renderAllergyProfileCard()}
              {renderDietaryPreferencesCard()}
              {renderAdditionalNotesCard()}
            </div>
          )}
          {activeTab === 'favourites' && renderFavoriteDishesCard()}
        </div>
      )}

      {/* USER TERMINATION CONFIRMATION MODAL */}
      {statusActionModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              maxWidth: '430px',
              width: '100%',
              padding: '18px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border, #ece7de)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {statusActionModal.targetStatus === 'terminated' ? (
                <AlertTriangle size={18} color="#dc2626" />
              ) : (
                <ShieldCheck size={18} color="#15803d" />
              )}
              <h3 style={{ fontSize: '1.0rem', color: '#1e1b16', margin: 0, fontWeight: 700 }}>
                {statusActionModal.targetStatus === 'terminated'
                  ? 'Terminate Client Access?'
                  : 'Reactivate Client Access?'}
              </h3>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#4a463e', lineHeight: 1.5, margin: '0 0 16px' }}>
              {statusActionModal.targetStatus === 'terminated' ? (
                <>
                  Terminating <strong>{client?.name}</strong> will immediately revoke their access to the system.
                  Active portal sessions will be blocked, and all subsequent login attempts will be rejected.
                </>
              ) : (
                <>
                  Allowing system access will restore <strong>{client?.name}</strong>’s login privileges and portal access.
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                disabled={statusActionModal.submitting}
                onClick={() => setStatusActionModal({ open: false, targetStatus: null, submitting: false })}
                style={{
                  height: '30px',
                  padding: '0 12px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#4a463e',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusActionModal.submitting}
                onClick={handleToggleClientStatus}
                style={{
                  height: '30px',
                  padding: '0 14px',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: statusActionModal.targetStatus === 'terminated' ? '#dc2626' : '#2e3b12',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {statusActionModal.submitting
                  ? 'Updating...'
                  : statusActionModal.targetStatus === 'terminated'
                  ? 'Confirm Termination'
                  : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISIT STATUS UPDATE MODAL (CONFIRM / READY / DECLINE) */}
      {statusModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              maxWidth: '460px',
              width: '100%',
              padding: '18px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: '1px solid var(--color-border, #ece7de)',
            }}
          >
            <h3 style={{ fontSize: '1.0rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 700 }}>
              {statusModal.targetStatus === 'confirmed'
                ? 'Confirm Appointment & Arrival Window'
                : statusModal.targetStatus === 'ready'
                ? 'Mark Order Ready for Pickup / Dispatch'
                : 'Decline Appointment'}
            </h3>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statusModal.targetStatus === 'confirmed' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                        Confirmed Date *
                      </label>
                      <CustomDatePicker
                        required
                        value={statusModal.confirmedDate}
                        onChange={(e) => setStatusModal({ ...statusModal, confirmedDate: e.target.value })}
                        style={{
                          height: '32px',
                          fontSize: '0.74rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                        Confirmed Window Preview
                      </label>
                      <div
                        style={{
                          height: '32px',
                          padding: '0 8px',
                          borderRadius: '3px',
                          border: '1px solid #a7f3d0',
                          backgroundColor: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#065f46',
                        }}
                      >
                        <Clock size={11} color="#065f46" style={{ flexShrink: 0 }} />
                        {convert24To12(statusModal.startTime)} – {convert24To12(statusModal.endTime)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                      Arrival Time Range *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: '#716c62', display: 'block', marginBottom: '2px' }}>Start Time</span>
                        <input
                          type="time"
                          required
                          value={statusModal.startTime}
                          onChange={(e) => setStatusModal({ ...statusModal, startTime: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '3px',
                            border: '1px solid var(--color-border, #ece7de)',
                            backgroundColor: 'var(--color-bg, #fbf9f5)',
                            fontSize: '0.74rem',
                            boxSizing: 'border-box',
                            height: '32px',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: '#716c62', display: 'block', marginBottom: '2px' }}>End Time</span>
                        <input
                          type="time"
                          required
                          value={statusModal.endTime}
                          onChange={(e) => setStatusModal({ ...statusModal, endTime: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '5px 8px',
                            borderRadius: '3px',
                            border: '1px solid var(--color-border, #ece7de)',
                            backgroundColor: 'var(--color-bg, #fbf9f5)',
                            fontSize: '0.74rem',
                            boxSizing: 'border-box',
                            height: '32px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                      Chef Preparation Notes (optional, included in confirmation email)
                    </label>
                    <textarea
                      rows="3"
                      value={statusModal.chefNotes}
                      onChange={(e) => setStatusModal({ ...statusModal, chefNotes: e.target.value })}
                      placeholder="e.g. Bringing carbon steel pans; please ensure stovetop is accessible..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border, #ece7de)',
                        backgroundColor: 'var(--color-bg, #fbf9f5)',
                        fontSize: '0.74rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </>
              )}

              {statusModal.targetStatus === 'ready' && (
                <>
                  <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '4px', padding: '10px 12px', fontSize: '0.74rem', color: '#5b21b6', lineHeight: 1.4 }}>
                    <strong>Box Order Ready:</strong> Marking this order as <strong>Ready</strong> will send an automated email notification to the client stating their meal box has been prepared and is ready for pickup or outbound dispatch.
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                      Pickup / Dispatch Notes (optional, included in client email)
                    </label>
                    <textarea
                      rows="3"
                      value={statusModal.chefNotes}
                      onChange={(e) => setStatusModal({ ...statusModal, chefNotes: e.target.value })}
                      placeholder="e.g. Freshly packed in insulated thermal box. Ready for pickup at kitchen desk..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border, #ece7de)',
                        backgroundColor: 'var(--color-bg, #fbf9f5)',
                        fontSize: '0.74rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </>
              )}

              {statusModal.targetStatus === 'cancelled' && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#1e1b16' }}>
                    Decline / Cancellation Reason (sent in email to client) *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={statusModal.cancellationReason}
                    onChange={(e) => setStatusModal({ ...statusModal, cancellationReason: e.target.value })}
                    placeholder="Provide clear reason for declining this appointment..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '3px',
                      border: '1px solid var(--color-border, #ece7de)',
                      backgroundColor: 'var(--color-bg, #fbf9f5)',
                      fontSize: '0.74rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setStatusModal({ ...statusModal, open: false })}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={statusModal.submitting}
                >
                  {statusModal.submitting
                    ? 'Saving...'
                    : statusModal.targetStatus === 'confirmed'
                    ? 'Confirm & Notify'
                    : statusModal.targetStatus === 'ready'
                    ? 'Mark Ready & Notify'
                    : 'Decline & Notify'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
