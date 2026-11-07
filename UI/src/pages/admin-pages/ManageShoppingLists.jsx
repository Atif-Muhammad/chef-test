import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageShoppingListsSkeleton } from '../../components/skeletons';
import DataTable from '../../components/shared/DataTable';
import CustomSelect from '../../components/shared/CustomSelect';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import {
  ClipboardIcon,
  PrinterIcon,
  EyeIcon,
  SearchIcon,
  WarningIcon,
  CheckCircleIcon,
  CalendarIcon,
  UsersIcon,
  SparkleIcon,
  PhoneIcon,
  EditIcon,
} from '../../components/shared/Icons';
import {
  formatArrivalWindow,
  formatLocalDate,
  convert24To12,
  toDateInputValue,
} from '../../utils/formatters';

export default function ManageShoppingLists() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);

  // Date Filters
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState('');

  // "Fill from Previous Shopping List" modal state
  const [copyModalVisit, setCopyModalVisit] = useState(null);
  const [allPastVisits, setAllPastVisits] = useState([]);
  const [loadingCopyVisits, setLoadingCopyVisits] = useState(false);
  const [copySearch, setCopySearch] = useState('');
  const [copySubmitting, setCopySubmitting] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  // Consolidated multi-visit shopping list modal state
  const [combinedModalOpen, setCombinedModalOpen] = useState(false);
  const [combinedData, setCombinedData] = useState(null);
  const [combinedLoading, setCombinedLoading] = useState(false);

  // Synchronize date defaults when tab switches
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSelectedIds([]);

    const now = new Date();
    if (newTab === 'upcoming') {
      // Today + upcoming
      setStartDate(toDateInputValue(now));
      setEndDate('');
    } else if (newTab === 'past') {
      // Past reservations: yesterday down to 30 days ago
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const thirtyAgo = new Date(yest);
      thirtyAgo.setDate(thirtyAgo.getDate() - 30);
      setStartDate(toDateInputValue(thirtyAgo));
      setEndDate(toDateInputValue(yest));
    } else {
      // All visits
      setStartDate('');
      setEndDate('');
    }
  };

  // Fetch visits filtered directly from backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisits();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, startDate, endDate, search, selectedStatus]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const params = {
        tab: activeTab,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search.trim()) params.search = search.trim();
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/admin/visits', { params });
      setVisits(res.data.visits || []);
    } catch (err) {
      console.error('Failed to load visits for shopping lists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Table selection handlers
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(visits.map((v) => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Open "Fill from Prev List" modal and fetch candidate past lists
  const handleOpenCopyModal = async (visit) => {
    setCopyModalVisit(visit);
    setCopySearch('');
    setCopySuccessMsg('');
    setLoadingCopyVisits(true);

    try {
      const res = await api.get('/admin/visits');
      const all = res.data.visits || [];
      const withLists = all.filter(
        (v) => v._id !== visit._id && Array.isArray(v.shoppingList) && v.shoppingList.length > 0
      );
      setAllPastVisits(withLists);
    } catch (err) {
      console.error('Failed to load past visits for shopping list copying', err);
    } finally {
      setLoadingCopyVisits(false);
    }
  };

  // Perform Copy from Previous Visit
  const handleExecuteCopy = async (sourceVisit) => {
    if (!copyModalVisit) return;
    setCopySubmitting(true);
    try {
      const res = await api.post(`/admin/visits/${copyModalVisit._id}/shopping-list/copy`, {
        sourceVisitId: sourceVisit._id,
      });

      // Update state locally
      setVisits((prev) =>
        prev.map((v) =>
          v._id === copyModalVisit._id ? { ...v, shoppingList: res.data.shoppingList } : v
        )
      );

      setCopySuccessMsg(
        `Filled ${res.data.shoppingList?.length || 0} items from visit on ${formatLocalDate(
          sourceVisit.visitDate
        )}! You can open and edit this list anytime.`
      );
    } catch (err) {
      alert(`Copy failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setCopySubmitting(false);
    }
  };

  // Handle Multi-Visit Combined List
  const handleGenerateCombined = async (idsToCombine = selectedIds) => {
    if (idsToCombine.length === 0) {
      alert('Please select at least one visit using the row checkboxes.');
      return;
    }

    setCombinedLoading(true);
    setCombinedModalOpen(true);
    try {
      const res = await api.post('/shopping-list/multi', { visitIds: idsToCombine });
      setCombinedData(res.data);
    } catch (err) {
      alert(`Consolidation failed: ${err.response?.data?.message || err.message}`);
      setCombinedModalOpen(false);
    } finally {
      setCombinedLoading(false);
    }
  };

  // Filter candidate visits inside copy modal
  const filteredCopyVisits = allPastVisits
    .filter((v) => {
      if (!copySearch.trim()) return true;
      const q = copySearch.toLowerCase();
      const cName = v.userId?.name || '';
      const dishNames = (v.dishes || [])
        .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
        .join(' ');
      return cName.toLowerCase().includes(q) || dishNames.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Prioritize same client
      const currentClientId = copyModalVisit?.userId?._id || copyModalVisit?.userId;
      const aSame = a.userId?._id === currentClientId || a.userId === currentClientId;
      const bSame = b.userId?._id === currentClientId || b.userId === currentClientId;
      if (aSame && !bSame) return -1;
      if (!aSame && bSame) return 1;
      return new Date(b.visitDate) - new Date(a.visitDate);
    });

  // Table Columns Definition
  const columns = [
    {
      header: 'Scheduled Date & Timing',
      key: 'date',
      width: '180px',
      render: (v) => {
        const dateStr = formatLocalDate(v.visitDate, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const windowStr = formatArrivalWindow(v.arrivalWindow);

        const statusColors = {
          pending: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
          confirmed: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
          completed: { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569' },
          cancelled: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
        };
        const sColor = statusColors[v.status] || statusColors.pending;

        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1a1814' }}>
              {dateStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.64rem',
                  padding: '1.5px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  color: '#4a453e',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Clock size={10} color="#655e53" style={{ flexShrink: 0 }} /> {windowStr}
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: sColor.bg,
                  border: `1px solid ${sColor.border}`,
                  color: sColor.text,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {v.status}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Client & Dossier',
      key: 'client',
      width: '180px',
      render: (v) => {
        const client = v.userId;
        const clientName = client?.name || 'Private Client';
        const clientId = client?._id || client?.id;

        return (
          <div>
            {clientId ? (
              <Link
                to={`/admin/clients/${clientId}`}
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--color-primary, #2e3b12)',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                {clientName}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1a1814',
                }}
              >
                {clientName}
              </span>
            )}
            <div style={{ fontSize: '0.66rem', color: '#716c62', marginTop: '2px' }}>
              {client?.location || 'Private Residence'}
            </div>
            <div style={{ fontSize: '0.64rem', color: '#8c857b', marginTop: '1px' }}>
              {v.guests || (v.adults || 0) + (v.children || 0)} Guests ({v.adults || 0} adults, {v.children || 0} kids)
            </div>
          </div>
        );
      },
    },
    {
      header: 'Menu Selections',
      key: 'dishes',
      render: (v) => {
        const dishList = v.dishes || [];
        if (dishList.length === 0) {
          return <span style={{ fontSize: '0.70rem', color: '#a8a29e', fontStyle: 'italic' }}>No dishes selected</span>;
        }

        const preview = dishList.slice(0, 3);
        const remainder = dishList.length - preview.length;

        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {preview.map((d, i) => {
              const name = d.dishId?.name || (typeof d.dishId === 'string' ? 'Dish' : 'Custom Course');
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '1.5px 6px',
                    borderRadius: '3px',
                    backgroundColor: '#f6f3eb',
                    border: '1px solid #ede8df',
                    fontSize: '0.67rem',
                    color: '#4a453e',
                    lineHeight: 1.3,
                  }}
                >
                  {name}
                </span>
              );
            })}
            {remainder > 0 && (
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  color: 'var(--color-primary, #2e3b12)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                +{remainder} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Shopping List Status',
      key: 'status',
      width: '180px',
      render: (v) => {
        const list = v.shoppingList || [];
        const hasItems = list.length > 0;

        if (hasItems) {
          return (
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                }}
              >
                <CheckCircleIcon size={11} color="#15803d" />
                {list.length} Items Scaled
              </span>
              <div style={{ fontSize: '0.64rem', color: '#716c62', marginTop: '3px' }}>
                {list.slice(0, 2).map((it) => it.name).join(', ')}
                {list.length > 2 && '...'}
              </div>
            </div>
          );
        }

        return (
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '3px',
                fontSize: '0.66rem',
                fontWeight: 600,
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#c2410c',
              }}
            >
              <WarningIcon size={11} color="#c2410c" />
              Empty / Needs Scaling
            </span>
            <div style={{ fontSize: '0.64rem', color: '#8c857b', marginTop: '3px' }}>
              Quick copy or auto-generate
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '130px',
      align: 'right',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
          {/* Fill from Previous Shopping List Button */}
          <button
            type="button"
            onClick={() => handleOpenCopyModal(v)}
            title="Fill grocery list from a previous visit (Quick Copy)"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '3px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffedd5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff7ed')}
          >
            <SparkleIcon size={12} color="#c2410c" />
          </button>

          {/* Open / Edit Shopping List */}
          <Link to={`/admin/shopping-list/${v._id}`} title="Open full shopping list and checklist">
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
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ec')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f3ef')}
            >
              <ClipboardIcon size={12} color="#2e3b12" />
            </button>
          </Link>

          {/* View Client Selection / Details */}
          <Link to={`/admin/selections?visit=${v._id}`} title="View client appointment selection">
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
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ec')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f3ef')}
            >
              <EyeIcon size={12} color="#4b5563" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <h1
              style={{
                color: 'var(--color-primary, #2e3b12)',
                fontSize: '1.25rem',
                margin: 0,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ClipboardIcon size={20} color="var(--color-primary, #2e3b12)" />
              Shopping Lists Directory
            </h1>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '3px',
                backgroundColor: '#f6f3eb',
                border: '1px solid #ede8df',
                color: '#57534e',
              }}
            >
              Ingredient Procurement Hub
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
            Central grocery orders, recipe ingredient scaling, and quick list copy across client reservations ({visits.length} results).
          </p>
        </div>

        {/* Top Header Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateCombined(selectedIds)}
              style={{
                borderRadius: '4px',
                height: '32px',
                fontSize: '0.74rem',
                padding: '0 12px',
                backgroundColor: '#2e3b12',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ClipboardIcon size={12} color="#ffffff" />
              Combine Selected ({selectedIds.length})
            </Button>
          )}

          <Link to="/admin/selections">
            <Button
              variant="outline"
              size="sm"
              style={{
                borderRadius: '4px',
                height: '32px',
                fontSize: '0.74rem',
                padding: '0 12px',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                border: '1px solid var(--color-border, #ece7de)',
              }}
            >
              &larr; Client Selections
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="admin-tab-scroll" style={{ borderBottom: '1px solid var(--color-border, #ece7de)', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => handleTabChange('upcoming')}
          style={{
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'upcoming' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
            color: activeTab === 'upcoming' ? 'var(--color-primary, #2e3b12)' : '#716c62',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '-1px',
          }}
        >
          Upcoming Visits
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('past')}
          style={{
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'past' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
            color: activeTab === 'past' ? 'var(--color-primary, #2e3b12)' : '#716c62',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '-1px',
          }}
        >
          Past / Completed
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('all')}
          style={{
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
            color: activeTab === 'all' ? 'var(--color-primary, #2e3b12)' : '#716c62',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '-1px',
          }}
        >
          All Visits
        </button>
      </div>

      {/* Filter and Date Range Bar (Filtered directly via Backend API) */}
      <div className="admin-filter-bar">
        {/* Search query (searches client, email, phone, dishes, and notes) */}
        <div className="admin-filter-search" style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SearchIcon size={14} color="#716c62" />
          </span>
          <input
            type="text"
            placeholder="Search client, email, dishes, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              fontSize: '0.76rem',
              outline: 'none',
              height: '34px',
              color: 'var(--color-text, #1e1b16)',
            }}
          />
        </div>

        {/* From Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', whiteSpace: 'nowrap' }}>
            From:
          </label>
          <CustomDatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              height: '34px',
              fontSize: '0.74rem',
              width: '135px',
            }}
            wrapperStyle={{ width: '135px' }}
          />
        </div>

        {/* To Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', whiteSpace: 'nowrap' }}>
            To:
          </label>
          <CustomDatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              height: '34px',
              fontSize: '0.74rem',
              width: '135px',
            }}
            wrapperStyle={{ width: '135px' }}
          />
        </div>

        {/* List status filter */}
        <div style={{ width: '150px' }}>
          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending Review' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>

        {(search || startDate || endDate || selectedStatus !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedStatus('All');
              handleTabChange(activeTab);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted, #716c62)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main DataTable */}
      {loading ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '10px 16px',
              backgroundColor: '#f6f3eb',
              borderBottom: '1px solid #ede8df',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div className="skeleton-box" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
            <div className="skeleton-box" style={{ width: '160px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '180px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '190px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
            <div style={{ flex: 1 }} />
            <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                padding: '12px 16px',
                borderBottom: i === 6 ? 'none' : '1px solid #f6f3eb',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div className="skeleton-box" style={{ width: '16px', height: '16px', borderRadius: '3px' }} />
              <div>
                <div className="skeleton-box" style={{ width: '130px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton-box" style={{ width: '80px', height: '12px' }} />
              </div>
              <div>
                <div className="skeleton-box" style={{ width: '140px', height: '16px', marginBottom: '4px' }} />
                <div className="skeleton-box" style={{ width: '100px', height: '12px' }} />
              </div>
              <div>
                <div className="skeleton-box" style={{ width: '160px', height: '14px', marginBottom: '4px' }} />
                <div className="skeleton-box" style={{ width: '110px', height: '12px' }} />
              </div>
              <div className="skeleton-box" style={{ width: '85px', height: '20px', borderRadius: '4px' }} />
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <div className="skeleton-box" style={{ width: '28px', height: '28px', borderRadius: '3px' }} />
                <div className="skeleton-box" style={{ width: '60px', height: '28px', borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visits}
          selectable={true}
          selectedIds={selectedIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          emptyMessage={
            search || startDate || endDate
              ? 'No dining appointments match your date and search filters.'
              : activeTab === 'upcoming'
              ? 'No upcoming visits scheduled for selected date range.'
              : 'No visit records found.'
          }
        />
      )}

      {/* "Fill from Previous Shopping List" Modal Dialog */}
      {copyModalVisit && (
        <Dialog
          isOpen={Boolean(copyModalVisit)}
          onClose={() => !copySubmitting && setCopyModalVisit(null)}
          title={`Fill Shopping List: ${copyModalVisit.userId?.name || 'Client'}`}
          maxWidth="640px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                {copySuccessMsg && (
                  <Link to={`/admin/shopping-list/${copyModalVisit._id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{
                        borderRadius: '4px',
                        height: '32px',
                        fontSize: '0.74rem',
                        padding: '0 12px',
                        backgroundColor: '#15803d',
                      }}
                    >
                      Open & Edit Scaled List &rarr;
                    </Button>
                  </Link>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCopyModalVisit(null)}
                disabled={copySubmitting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 14px',
                }}
              >
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Target Appointment Banner */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '4px',
                backgroundColor: '#f6f3eb',
                border: '1px solid #ede8df',
                fontSize: '0.74rem',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-primary, #2e3b12)', marginBottom: '3px' }}>
                Target Appointment: {formatLocalDate(copyModalVisit.visitDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ color: '#716c62', fontSize: '0.70rem' }}>
                Menu: {(copyModalVisit.dishes || []).map((d) => d.dishId?.name || 'Dish').join(', ') || 'No dishes specified'} &bull; {copyModalVisit.guests || 2} Guests
              </div>
            </div>

            {copySuccessMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircleIcon size={14} color="#15803d" />
                {copySuccessMsg}
              </div>
            )}

            <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)' }}>
              Choose a previous visit below to copy its custom ingredients, measured quantities, and chef notes into this appointment.
            </p>

            {/* Quick Filter Search */}
            <div style={{ position: 'relative', width: '100%' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SearchIcon size={13} color="#716c62" />
              </span>
              <input
                type="text"
                placeholder="Filter past lists by client name or dish..."
                value={copySearch}
                onChange={(e) => setCopySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.76rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Past Visits List */}
            {loadingCopyVisits ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ece7de',
                      backgroundColor: '#fbf9f5',
                    }}
                  >
                    <div className="skeleton-box" style={{ width: '40%', height: '14px', marginBottom: '6px' }} />
                    <div className="skeleton-box" style={{ width: '70%', height: '12px' }} />
                  </div>
                ))}
              </div>
            ) : filteredCopyVisits.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#a8a29e', padding: '20px 0', fontSize: '0.74rem' }}>
                No past visits with saved shopping lists match your search.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '270px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {filteredCopyVisits.map((v) => {
                  const targetClientId = copyModalVisit.userId?._id || copyModalVisit.userId;
                  const isSameClient = v.userId?._id === targetClientId || v.userId === targetClientId;
                  const dishNames = (v.dishes || [])
                    .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
                    .filter(Boolean);

                  return (
                    <div
                      key={v._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: isSameClient ? '1.5px solid #fed7aa' : '1px solid #ede8df',
                        backgroundColor: isSameClient ? '#fff7ed' : '#ffffff',
                        gap: '8px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                            {v.userId?.name || 'Client'}
                          </strong>
                          {isSameClient && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: '#fef3e2',
                                color: '#9a5b13',
                                fontWeight: 700,
                              }}
                            >
                              Same Client Match
                            </span>
                          )}
                          <span style={{ fontSize: '0.68rem', color: '#716c62' }}>
                            &bull; {formatLocalDate(v.visitDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: '#716c62',
                            marginTop: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Menu: {dishNames.join(', ') || 'Custom Dinner'}
                        </div>
                        <div style={{ fontSize: '0.64rem', color: '#8c857b', marginTop: '1px' }}>
                          {v.shoppingList?.length || 0} scaled ingredients &bull; {v.guests || 2} guests
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={copySubmitting}
                        onClick={() => handleExecuteCopy(v)}
                        style={{
                          borderRadius: '4px',
                          height: '28px',
                          fontSize: '0.70rem',
                          padding: '0 10px',
                          backgroundColor: isSameClient ? '#c2410c' : '#2e3b12',
                          borderColor: isSameClient ? '#c2410c' : '#2e3b12',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {copySubmitting ? 'Copying...' : 'Copy to Target'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* Combined Multi-Visit Shopping List Modal Dialog */}
      {combinedModalOpen && (
        <Dialog
          isOpen={combinedModalOpen}
          onClose={() => setCombinedModalOpen(false)}
          title={`Consolidated Grocery List (${combinedData?.visitsCount || selectedIds.length} Appointments)`}
          maxWidth="760px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#716c62' }}>
                Total items aggregated across {combinedData?.visitsCount || selectedIds.length} client visit(s).
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  style={{
                    borderRadius: '4px',
                    height: '32px',
                    fontSize: '0.74rem',
                    padding: '0 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <PrinterIcon size={12} color="#2e3b12" />
                  Print Master Sheet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCombinedModalOpen(false)}
                  style={{
                    borderRadius: '4px',
                    height: '32px',
                    fontSize: '0.74rem',
                    padding: '0 14px',
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          {combinedLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ece7de',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="skeleton-box" style={{ width: '35%', height: '16px', marginBottom: '8px' }} />
                  <div className="skeleton-box" style={{ width: '65%', height: '12px' }} />
                </div>
              ))}
            </div>
          ) : !combinedData || !combinedData.combinedShoppingList ? (
            <p style={{ textAlign: 'center', color: '#a8a29e', padding: '20px 0', fontSize: '0.74rem' }}>
              No combined grocery items available.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Summary of Included Visits */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  fontSize: '0.72rem',
                }}
              >
                <strong style={{ color: 'var(--color-primary, #2e3b12)', display: 'block', marginBottom: '4px' }}>
                  Appointments in this Consolidated Sheet:
                </strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(combinedData.visits || []).map((v, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '1.5px 6px',
                        borderRadius: '3px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e7e2d8',
                        fontSize: '0.66rem',
                        color: '#4a453e',
                      }}
                    >
                      {v.clientName || 'Client'} &bull; {formatLocalDate(v.visitDate, { month: 'short', day: 'numeric' })} ({v.guests} g)
                    </span>
                  ))}
                </div>
              </div>

              {/* Aggregated Items Table */}
              <div
                style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  borderRadius: '3px',
                  border: '1px solid #ede8df',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ backgroundColor: '#f6f3eb', borderBottom: '1px solid #ede8df' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#4a453e' }}>
                        Ingredient
                      </th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#4a453e', width: '110px' }}>
                        Category
                      </th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#4a453e', width: '90px' }}>
                        Consolidated
                      </th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#4a453e', width: '60px' }}>
                        Unit
                      </th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#4a453e' }}>
                        Substitutions & Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.combinedShoppingList.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: idx < combinedData.combinedShoppingList.length - 1 ? '1px solid #f2ede4' : 'none',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#faf8f4',
                        }}
                      >
                        <td style={{ padding: '6px 10px', fontWeight: 600, color: '#1a1814' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '6px 10px', color: '#716c62', fontSize: '0.67rem' }}>
                          {item.category || 'Produce'}
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary, #2e3b12)' }}>
                          {Math.round(item.quantity * 10) / 10}
                        </td>
                        <td style={{ padding: '6px 10px', color: '#716c62' }}>
                          <code>{item.unit}</code>
                        </td>
                        <td style={{ padding: '6px 10px', color: '#8c857b', fontSize: '0.68rem' }}>
                          {item.substitution ? `Sub: ${item.substitution}` : item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
