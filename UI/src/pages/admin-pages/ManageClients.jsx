import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../config/shared/api';
import Table from '../../components/shared/Table';
import Loader from '../../components/shared/Loader';
import { ManageClientsSkeleton } from '../../components/skeletons';
import { SearchIcon, WarningIcon, CheckCircleIcon, HeartIcon } from '../../components/shared/Icons';

export default function ManageClients() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClientFavs, setSelectedClientFavs] = useState(null);

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

  const columns = [
    {
      header: 'Client',
      accessor: 'name',
      render: (row) => {
        const initial = (row.name || row.email || 'C').charAt(0).toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <div>
              <Link to={`/admin/clients/${row._id}`} style={{ textDecoration: 'none' }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--color-primary, #2e3b12)', fontWeight: 700 }}>
                  {row.name}
                </strong>
              </Link>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '1px' }}>
                {row.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Visits Record',
      accessor: 'visitCount',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1e1b16' }}>
            {row.visitCount || 0} visits
          </span>
          <span style={{ display: 'block', fontSize: '0.67rem', color: 'var(--color-text-muted, #716c62)', marginTop: '1px' }}>
            {row.lastVisitDate ? `Last: ${new Date(row.lastVisitDate).toLocaleDateString()}` : 'No visits yet'}
          </span>
        </div>
      ),
    },
    {
      header: 'Declared Allergies',
      accessor: 'allergies',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {row.allergies && row.allergies.length > 0 ? (
            row.allergies.map((alg) => (
              <span
                key={alg}
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontWeight: 600,
                }}
              >
                {alg}
              </span>
            ))
          ) : (
            <span style={{ color: '#15803d', fontSize: '0.70rem', fontWeight: 500 }}>
              None
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Favourites',
      accessor: 'favouriteDishes',
      width: '120px',
      render: (row) => {
        const favs = row.favouriteDishes || [];
        const count = favs.length;
        if (count === 0) {
          return (
            <span style={{ fontSize: '0.70rem', color: '#a8a29e', fontStyle: 'italic' }}>
              0 dishes
            </span>
          );
        }
        return (
          <button
            type="button"
            onClick={() => setSelectedClientFavs(row)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2.5px 8px',
              borderRadius: '4px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.69rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            title="Click to view client favourites"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
          >
            <HeartIcon filled size={11} color="#dc2626" />
            <span>{count} {count === 1 ? 'Dish' : 'Dishes'}</span>
          </button>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: (row) => {
        const isTerminated = row.status === 'terminated';
        return (
          <span
            style={{
              fontSize: '0.66rem',
              padding: '2px 7px',
              borderRadius: '4px',
              fontWeight: 600,
              backgroundColor: isTerminated ? '#fee2e2' : '#ecfdf5',
              border: `1px solid ${isTerminated ? '#fca5a5' : '#a7f3d0'}`,
              color: isTerminated ? '#991b1b' : '#065f46',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isTerminated ? '#dc2626' : '#16a34a' }} />
            {isTerminated ? 'Terminated' : 'Active'}
          </span>
        );
      },
    },
    {
      header: 'Member Since',
      accessor: 'createdAt',
      width: '110px',
      render: (row) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #716c62)' }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      align: 'right',
      width: '120px',
      render: (row) => (
        <Link to={`/admin/clients/${row._id}`} style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              padding: '0 10px',
              height: '26px',
              borderRadius: '4px',
              border: '1px solid #ece7de',
              backgroundColor: '#f6f3eb',
              color: '#1e1b16',
              fontSize: '0.70rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.12s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ede8df')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f6f3eb')}
          >
            <span>View Details</span>
            <span>&rarr;</span>
          </button>
        </Link>
      ),
    },
  ];

  if (loading) return <ManageClientsSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ color: 'var(--color-primary, #2e3b12)', fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>
          Client Management
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: '3px 0 0' }}>
          Overview of registered clients, allergy profiles, dining histories, and access status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="admin-filter-bar"
        style={{
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid var(--color-border, #ece7de)',
        }}
      >
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#655e53', fontWeight: 600 }}>Filter:</span>
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
                  height: '26px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? 'var(--color-primary, #2e3b12)' : '#ede8df'}`,
                  backgroundColor: isSelected ? 'var(--color-primary, #2e3b12)' : '#fbf9f5',
                  color: isSelected ? '#ffffff' : '#4a463e',
                  fontSize: '0.70rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.5px 4px',
                    borderRadius: '3px',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.22)' : '#ede8df',
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

        {/* Search Input */}
        <div className="admin-filter-search" style={{ position: 'relative', width: '280px' }}>
          <span
            style={{
              position: 'absolute',
              left: '9px',
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
            placeholder="Search by client name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 10px 5px 28px',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              fontSize: '0.74rem',
              color: 'var(--color-text, #1e1b16)',
              outline: 'none',
              boxSizing: 'border-box',
              height: '30px',
            }}
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} emptyMessage="No clients match the selected criteria." />

      {/* Client Favourites Quick View Modal */}
      {selectedClientFavs && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setSelectedClientFavs(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border, #ece7de)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fbf9f5',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.90rem',
                    color: 'var(--color-primary, #2e3b12)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <HeartIcon filled size={14} color="#dc2626" />
                  <span>Favourite Dishes — {selectedClientFavs.name}</span>
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#716c62' }}>
                  {selectedClientFavs.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientFavs(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#716c62',
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
              {(selectedClientFavs.favouriteDishes || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#716c62', fontSize: '0.78rem' }}>
                  No favourite dishes saved yet by this client.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          backgroundColor: '#fdfcf9',
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
                              backgroundColor: '#ffffff',
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

            {/* Modal Footer */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--color-border, #ece7de)',
                backgroundColor: '#fbf9f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
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
              <button
                type="button"
                onClick={() => setSelectedClientFavs(null)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '3px',
                  border: '1px solid #dcd5ca',
                  backgroundColor: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#4a463e',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
