import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/shared/api';
import Table from '../../components/shared/Table';
import Loader from '../../components/shared/Loader';
import { ManageClientsSkeleton } from '../../components/skeletons';
import { HerbIcon, WarningIcon, CheckCircleIcon, SearchIcon } from '../../components/shared/Icons';

export default function ClientAllergyProfiles() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'terminated'

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

  const columns = [
    {
      header: 'Client & Contact',
      accessor: 'name',
      render: (row) => (
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
      ),
    },
    {
      header: 'Phone & Location',
      accessor: 'phone',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.74rem', color: '#1e1b16', display: 'block', fontWeight: 500 }}>
            {row.phone || '—'}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '1px', display: 'block' }}>
            {row.location || 'Client residence'}
          </span>
        </div>
      ),
    },
    {
      header: 'Dietary Regimen',
      accessor: 'dietaryPreferences',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {row.dietaryPreferences && row.dietaryPreferences.length > 0 ? (
            row.dietaryPreferences.map((pref, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.66rem',
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 500,
                }}
              >
                <HerbIcon size={10} /> {pref}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.72rem' }}>Standard</span>
          )}
        </div>
      ),
    },
    {
      header: 'Declared Allergens',
      accessor: 'allergies',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {row.allergies && row.allergies.length > 0 ? (
            row.allergies.map((alg) => (
              <span
                key={alg}
                style={{
                  fontSize: '0.66rem',
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: 600,
                }}
              >
                <WarningIcon size={10} color="#b91c1c" /> {alg}
              </span>
            ))
          ) : (
            <span style={{ color: '#15803d', fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircleIcon size={12} color="#15803d" /> No declared allergies
            </span>
          )}
        </div>
      ),
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
              borderRadius: '3px',
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
              border: '1px solid #dcd5ca',
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
            <span>Dossier</span>
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
          Client Allergy & Dietary Profiles
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: '3px 0 0' }}>
          Inspect declared allergies, dietary regimens, and account authorization per client.
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
                  borderRadius: '3px',
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
                    borderRadius: '2px',
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
            placeholder="Search client, email, phone, allergen..."
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

      {/* Main Table */}
      <Table columns={columns} data={filteredClients} emptyMessage="No clients match the selected criteria." />
    </div>
  );
}
