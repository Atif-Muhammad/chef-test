import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, SlidersHorizontal, Eye, Heart, ArrowRight } from 'lucide-react';
import api from '../../config/shared/api';
import Table from '../../components/shared/Table';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageClientsSkeleton } from '../../components/skeletons';
import FilterDrawer from '../../components/shared/FilterDrawer';
import KebabMenu from '../../components/shared/KebabMenu';
import { truncateWords } from '../../utils/formatters';
import { SearchIcon, WarningIcon, CheckCircleIcon, HeartIcon } from '../../components/shared/Icons';

export default function ManageClients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClientFavs, setSelectedClientFavs] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (searchParam !== null && searchParam !== undefined) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter((c) => {
    const isTerminated = c.status === 'terminated';
    if (statusFilter === 'active' && isTerminated) return false;
    if (statusFilter === 'terminated' && !isTerminated) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
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
        const initial = (row.name || row.email || 'C').charAt(0).toUpperCase();
        const isTerminated = row.status === 'terminated';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '4px',
                backgroundColor: '#2e3b12',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #ece7de',
              }}
            >
              {row.photoUrl ? (
                <img
                  src={row.photoUrl}
                  alt={row.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                initial
              )}
            </div>
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
                {row.email} {row.location ? `• ${row.location}` : ''}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Record & Allergies',
      accessor: 'visitCount',
      render: (row) => {
        const allergiesText = row.allergies && row.allergies.length > 0 ? row.allergies.join(', ') : 'None';
        const favsCount = (row.favouriteDishes || []).length;
        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1e1b16' }}>
                {row.visitCount || 0} visits
              </span>
              {favsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedClientFavs(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.64rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Click to view client favourites"
                >
                  <HeartIcon filled size={9} color="#dc2626" />
                  <span>{favsCount} Favs</span>
                </button>
              )}
            </div>
            <span
              style={{
                display: 'block',
                fontSize: '0.66rem',
                color: row.allergies && row.allergies.length > 0 ? '#991b1b' : '#15803d',
                marginTop: '2px',
                lineHeight: 1.25,
              }}
              title={allergiesText}
            >
              Allergies: {truncateWords(allergiesText, 4)}
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
            {
              label: 'View Allergy Profile',
              icon: <Shield size={13} />,
              onClick: () => navigate(`/admin/allergy-profiles?search=${encodeURIComponent(row.name)}`),
            },
            {
              label: 'View Favourites',
              icon: <Heart size={13} />,
              onClick: () => setSelectedClientFavs(row),
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
          Client Management
        </h1>
        <div className="admin-title-actions">
          <Link
            to="/admin/allergy-profiles"
            className="admin-action-btn-outline"
            title="Client Allergy Profiles"
            aria-label="Client Allergy Profiles"
          >
            <Shield size={16} />
          </Link>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Overview of registered clients, allergy profiles, dining histories, and access status ({clients.length} total).
      </p>

      {/* Search & Filter Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search by client name, email, phone..."
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
        title="Filter Clients"
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

      <Table columns={columns} data={filtered} emptyMessage="No clients match the selected criteria." />

      {/* Client Favourites Quick View Modal Dialog */}
      {selectedClientFavs && (
        <Dialog
          isOpen={Boolean(selectedClientFavs)}
          onClose={() => setSelectedClientFavs(null)}
          title={`Favourite Dishes — ${selectedClientFavs.name}`}
          maxWidth="520px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '16px 20px',
          }}
          footer={
            <div className="dialog-responsive-footer">
              <Link
                to={`/admin/clients/${selectedClientFavs._id}`}
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-primary, #2e3b12)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Go to Client Profile &rarr;
              </Link>
              <div className="dialog-footer-actions">
                <button
                  type="button"
                  onClick={() => setSelectedClientFavs(null)}
                  style={{
                    padding: '4px 14px',
                    borderRadius: '3px',
                    border: '1px solid #dcd5ca',
                    backgroundColor: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#4a463e',
                    cursor: 'pointer',
                    height: '32px',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ padding: '4px 0' }}>
            <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block', marginBottom: '8px' }}>
              {selectedClientFavs.email}
            </span>
            {(selectedClientFavs.favouriteDishes || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#716c62', fontSize: '0.78rem' }}>
                No favourite dishes saved yet by this client.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '55vh', overflowY: 'auto' }}>
                {selectedClientFavs.favouriteDishes.map((dish) => {
                  const dishObj = typeof dish === 'object' ? dish : { _id: dish, name: 'Dish' };
                  return (
                    <div
                      key={dishObj._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ede8df',
                        backgroundColor: '#ffffff',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img
                          src={dishObj.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                          alt={dishObj.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                            border: '1px solid #ece7de',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.80rem',
                              fontWeight: 600,
                              color: '#1a1814',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {dishObj.name}
                          </span>
                          <span style={{ fontSize: '0.67rem', color: '#716c62' }}>
                            {dishObj.categoryId?.name || dishObj.type || 'Menu Selection'}
                            {dishObj.spiceLevel ? ` • ${dishObj.spiceLevel} spice` : ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <Link
                          to={`/catalogue/${dishObj._id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--color-primary, #2e3b12)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '3px',
                            border: '1px solid #ede8df',
                            backgroundColor: '#fbf9f5',
                          }}
                        >
                          View Dish &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
