import React, { useState, useEffect } from 'react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageAllergensSkeleton } from '../../components/skeletons';
import DataTable from '../../components/shared/DataTable';
import { WarningIcon, ShieldIcon, EditIcon, TrashIcon, SearchIcon } from '../../components/shared/Icons';

export default function ManageAllergens() {
  const [allergens, setAllergens] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Dialog state (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/allergens');
      setAllergens(res.data.allergens || []);
    } catch (err) {
      console.error('Failed to fetch allergens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setIsFormOpen(true);
  };

  const handleEdit = (alg) => {
    setEditingId(alg._id);
    setName(alg.name);
    setSlug(alg.slug || '');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingId(null);
    setName('');
    setSlug('');
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/allergens/${editingId}`, { name: name.trim(), slug: slug.trim() });
      } else {
        await api.post('/admin/allergens', { name: name.trim(), slug: slug.trim() });
      }
      handleCloseForm();
      await fetchAllergens();
    } catch (err) {
      alert(`Save error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/allergens/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchAllergens();
    } catch (err) {
      alert(`Delete error: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = allergens.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.slug && a.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      header: 'Allergen Name',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2.5px 8px',
              borderRadius: '3px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <WarningIcon size={12} color="#dc2626" />
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: 'System Slug / URL Identifier',
      key: 'slug',
      render: (row) => (
        <code
          style={{
            fontSize: '0.70rem',
            backgroundColor: '#f6f3eb',
            border: '1px solid #ede8df',
            padding: '2px 7px',
            borderRadius: '3px',
            color: '#57534e',
            fontWeight: 500,
          }}
        >
          {row.slug}
        </code>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '80px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="Edit allergen"
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
            <EditIcon size={11} color="#4b5563" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            title="Delete allergen"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '3px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fecaca')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
          >
            <TrashIcon size={11} color="#dc2626" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <ManageAllergensSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-flex">
        <div>
          <h1
            style={{
              color: 'var(--color-primary, #2e3b12)',
              fontSize: '1.25rem',
              margin: '0 0 2px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldIcon size={20} color="var(--color-primary, #2e3b12)" />
            Master Allergens Directory
          </h1>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
            Standard dietary allergens matched automatically against client safety profiles for kitchen warnings ({allergens.length} recorded).
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          style={{
            borderRadius: '4px',
            boxShadow: 'none',
            height: '34px',
            fontSize: '0.76rem',
            padding: '0 14px',
            fontWeight: 600,
          }}
        >
          + Add Allergen
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
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
            placeholder="Search allergens by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              fontSize: '0.76rem',
              boxShadow: 'none',
              outline: 'none',
              height: '34px',
              color: 'var(--color-text, #1e1b16)',
            }}
          />
        </div>

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted, #716c62)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px',
            }}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Modern DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        selectable={false}
        emptyMessage={
          search
            ? 'No master allergens match your search.'
            : 'No allergens recorded yet. Click "+ Add Allergen" above to add your first one.'
        }
      />

      {/* Add / Edit Allergen Modal Dialog Form */}
      {isFormOpen && (
        <Dialog
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          title={editingId ? 'Edit Allergen' : 'Add Allergen'}
          maxWidth="480px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            boxShadow: 'none',
            padding: '20px 22px',
            overflow: 'visible',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseForm}
                disabled={submitting}
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
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={submitting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0 14px',
                }}
              >
                {submitting ? 'Saving...' : editingId ? '✓ Save Changes' : '+ Add Allergen'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)' }}>
              {editingId
                ? 'Update allergen designation and unique system slug identifier.'
                : 'Register a standard dietary allergen for automatic profile matching and safety warnings.'}
            </p>

            <FormInput
              label="Allergen Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tree Nuts, Shellfish, Gluten, Sesame..."
              required
              autoFocus
              style={{ marginBottom: 0 }}
            />

            <div>
              <FormInput
                label="Slug / Identifier (optional)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. tree-nuts (auto-generated if empty)"
                style={{ marginBottom: 0 }}
              />
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '3px' }}>
                Unique system key used in client dietary profiles and URL matching.
              </span>
            </div>
          </form>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleting && setDeleteTarget(null)}
          title="Delete Allergen"
          maxWidth="440px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            boxShadow: 'none',
            padding: '18px 20px',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  border: '1px solid var(--color-border, #ece7de)',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  height: '28px',
                  fontSize: '0.74rem',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  height: '28px',
                  fontSize: '0.74rem',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Allergen'}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #fecaca',
              }}
            >
              <WarningIcon size={18} color="#b91c1c" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: 'var(--color-text, #1e1b16)', fontWeight: 700 }}>
                Confirm Allergen Deletion
              </h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted, #716c62)', lineHeight: 1.4 }}>
                Are you sure you want to delete allergen <strong>"{deleteTarget.name}"</strong>? Dishes and client profiles referencing this allergen will no longer trigger automatic safety alerts.
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
