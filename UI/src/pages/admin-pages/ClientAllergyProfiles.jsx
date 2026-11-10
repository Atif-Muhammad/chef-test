import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, SlidersHorizontal, Eye } from 'lucide-react';
import api from '../../config/shared/api';
import Table from '../../components/shared/Table';
import Loader from '../../components/shared/Loader';
import { ManageClientsSkeleton } from '../../components/skeletons';
import FilterDrawer from '../../components/shared/FilterDrawer';
import KebabMenu from '../../components/shared/KebabMenu';
import { truncateWords } from '../../utils/formatters';
import { HerbIcon, WarningIcon, CheckCircleIcon, SearchIcon } from '../../components/shared/Icons';

export default function ClientAllergyProfiles() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'terminated'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const isTerminated = c.status === 'terminated';
    if (statusFilter === 'active' && isTerminated) return false;
    if (statusFilter === 'terminated' && !isTerminated) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const location = (c.location || '').toLowerCase();
    const allergies = (c.allergies || []).join(' ').toLowerCase();
    const dietary = (c.dietaryPreferences || []).join(' ').toLowerCase();

    return (
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      location.includes(q) ||
      allergies.includes(q) ||
      dietary.includes(q)
    );
  });

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

  const resetFilters = () => {
    setStatusFilter('all');
    setSearch('');
  };

  const columns = [
    {
      header: 'Client & Contact',
      accessor: 'name',
      render: (row) => {
        const isTerminated = row.status === 'terminated';
        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Link to={`/admin/clients/${row._id}`} style={{ textDecoration: 'none' }}>
                <strong style={{ fontSize: '0.80rem', color: 'var(--color-primary, #2e3b12)', fontWeight: 700 }}>
                  {row.name}
                </strong>
              </Link>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 600,
                  backgroundColor: isTerminated ? '#fee2e2' : '#ecfdf5',
                  border: `1px solid ${isTerminated ? '#fca5a5' : '#a7f3d0'}`,
                  color: isTerminated ? '#991b1b' : '#065f46',
                }}
              >
                {isTerminated ? 'Terminated' : 'Active'}
              </span>
            </div>
            <span style={{ display: 'block', fontSize: '0.66rem', color: 'var(--color-text-muted, #716c62)', marginTop: '1px' }}>
              {row.email} {row.phone ? `• ${row.phone}` : ''}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Allergens & Regimen',
      accessor: 'allergies',
      render: (row) => {
        const hasAllergies = row.allergies && row.allergies.length > 0;
        const allgStr = hasAllergies ? row.allergies.join(', ') : 'None';
        const dietStr = row.dietaryPreferences && row.dietaryPreferences.length > 0
          ? row.dietaryPreferences.join(', ')
          : 'Standard';

        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {hasAllergies ? (
                <span
                  style={{
                    fontSize: '0.64rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontWeight: 600,
                  }}
                  title={allgStr}
                >
                  <WarningIcon size={9} color="#b91c1c" /> {truncateWords(allgStr, 4)}
                </span>
              ) : (
                <span
                  style={{
                    color: '#15803d',
                    fontSize: '0.66rem',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <CheckCircleIcon size={11} color="#15803d" /> No allergies
                </span>
              )}
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.64rem',
                color: '#4a453e',
                marginTop: '2px',
              }}
              title={dietStr}
            >
              <HerbIcon size={9} /> {truncateWords(dietStr, 4)}
            </span>
          </div>
        );
      },
    },
    {
      header: '',
      accessor: '_id',
      align: 'right',
      width: '38px',
      render: (row) => (
        <KebabMenu
          ariaLabel={`Actions for ${row.name}`}
          items={[
            {
              label: 'View Client Dossier',
              icon: <Eye size={13} />,
              onClick: () => navigate(`/admin/clients/${row._id}`),
            },
          ]}
        />
      ),
    },
  ];

  if (loading) return <ManageClientsSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Title Row with Action Button at the End (justify-between) */}
      <div className="admin-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Allergy & Dietary Profiles
        </h1>
        <div className="admin-title-actions">
          <Link
            to="/admin/clients"
            className="admin-action-btn-outline"
            title="All Clients"
            aria-label="All Clients"
          >
            <Users size={16} />
          </Link>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Inspect declared allergies, dietary regimens, and account authorization per client ({clients.length} total).
      </p>

      {/* Search & Filter Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search client, email, allergen..."
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
        title="Filter Allergy Profiles"
        activeCount={activeFilterCount}
        onReset={resetFilters}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '6px' }}>
              Client Status
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Clients', count: clients.length },
                { id: 'active', label: 'Active', count: clients.filter((c) => c.status !== 'terminated').length },
                { id: 'terminated', label: 'Terminated', count: clients.filter((c) => c.status === 'terminated').length },
              ].map((tab) => {
                const isSelected = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: `1px solid ${isSelected ? 'var(--color-primary, #2e3b12)' : '#ede8df'}`,
                      backgroundColor: isSelected ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#4a463e',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#ede8df',
                        color: isSelected ? '#ffffff' : '#655e53',
                        fontWeight: 600,
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FilterDrawer>

      {/* Main Table */}
      <Table columns={columns} data={filteredClients} emptyMessage="No clients match the selected criteria." />
    </div>
  );
}
