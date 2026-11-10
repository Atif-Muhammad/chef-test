import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageCategoriesSkeleton } from '../../components/skeletons';
import DataTable, { CategoryBadge } from '../../components/shared/DataTable';
import KebabMenu from '../../components/shared/KebabMenu';
import { EditIcon, TrashIcon, WarningIcon, LayersIcon } from '../../components/shared/Icons';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Responsive state: on small screens, category form opens inside a Dialog
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, { name: name.trim(), order: parseInt(order, 10) || 0 });
      } else {
        await api.post('/admin/categories', { name: name.trim(), order: parseInt(order, 10) || 0 });
      }
      setName('');
      setOrder(0);
      setEditingId(null);
      setFormDialogOpen(false);
      await fetchCategories();
    } catch (err) {
      alert(`Save error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setOrder(cat.order || 0);
    if (isMobile) {
      setFormDialogOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/categories/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      alert(`Delete error: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Category Name',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <CategoryBadge category={row.name} />
          <strong style={{ fontSize: '0.80rem', color: 'var(--color-text, #1e1b16)' }}>
            {row.name}
          </strong>
        </div>
      ),
    },
    {
      header: 'Order & Identifier',
      key: 'slug',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1px 5px',
              borderRadius: '3px',
              backgroundColor: '#f6f3eb',
              border: '1px solid #ede8df',
              color: '#4a453e',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
          >
            #{row.order ?? 0}
          </span>
          <code
            style={{
              fontSize: '0.68rem',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              padding: '1.5px 5px',
              borderRadius: '3px',
              border: '1px solid var(--color-border, #ece7de)',
              color: 'var(--color-text-muted, #716c62)',
            }}
          >
            {row.slug}
          </code>
        </div>
      ),
    },
    {
      header: '',
      key: 'actions',
      width: '38px',
      align: 'right',
      render: (row) => (
        <KebabMenu
          ariaLabel={`Actions for category ${row.name}`}
          items={[
            {
              label: 'Edit Category',
              icon: <Edit3 size={13} />,
              onClick: () => handleEdit(row),
            },
            {
              label: 'Delete Category',
              icon: <Trash2 size={13} />,
              variant: 'danger',
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  if (loading) return <ManageCategoriesSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Title Row with Action Button at the End (justify-between) */}
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
          <LayersIcon size={18} color="var(--color-primary, #2e3b12)" />
          <span>Manage Categories</span>
        </h1>
        <div className="admin-title-actions">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName('');
              setOrder(0);
              if (isMobile) {
                setFormDialogOpen(true);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="admin-action-btn"
            title="Add Category"
            aria-label="Add Category"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Organize courses, culinary classifications, and presentation order ({categories.length} total).
      </p>

      {/* Add / Edit Category Dialog for Small / Mobile Screens */}
      {isMobile && (
        <Dialog
          isOpen={formDialogOpen}
          onClose={() => {
            if (!submitting) {
              setFormDialogOpen(false);
              setEditingId(null);
              setName('');
              setOrder(0);
            }
          }}
          title={editingId ? 'Edit Category' : 'Add New Category'}
          maxWidth="460px"
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FormInput
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mains - Seafood, Japanese..."
              required
              autoFocus
            />
            <FormInput
              label="Display Order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="0"
            />
            <div className="dialog-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', width: '100%' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormDialogOpen(false);
                  setEditingId(null);
                  setName('');
                  setOrder(0);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !name.trim()}
              >
                {submitting ? 'Saving...' : editingId ? '✓ Save Changes' : '+ Add Category'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Add / Edit Form Card (Desktop / Wide screens only) */}
      {!isMobile && (
        <Card
          style={{
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            borderRadius: '4px',
            border: '1px solid var(--color-border, #ece7de)',
            boxShadow: 'none',
            padding: '16px 20px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary, #2e3b12)' }}>
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted, #716c62)' }}>
                {editingId
                  ? 'Update category display name and sorting order.'
                  : 'Create a new course or category grouping for client seasonal menu selections.'}
              </p>
            </div>
            {editingId && (
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  backgroundColor: '#fef3e2',
                  color: '#9a5b13',
                  border: '1px solid #fde68a',
                }}
              >
                Editing Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <FormInput
                label="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mains - Seafood, Japanese & Asian Fusion..."
                required
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ width: '110px' }}>
              <FormInput
                label="Display Order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', height: '38px', alignItems: 'center' }}>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
                style={{ borderRadius: '4px', boxShadow: 'none', height: '38px', fontSize: '0.76rem', padding: '0 14px' }}
              >
                {submitting ? 'Saving...' : editingId ? '✓ Save Changes' : '+ Add Category'}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setOrder(0);
                  }}
                  disabled={submitting}
                  style={{ borderRadius: '4px', boxShadow: 'none', height: '38px', fontSize: '0.76rem', padding: '0 14px' }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Modern DataTable */}
      <DataTable
        columns={columns}
        data={categories}
        selectable={false}
        emptyMessage="No categories found. Use the form above to add your first category."
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleting && setDeleteTarget(null)}
          title="Delete Category"
          maxWidth="440px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            boxShadow: 'none',
            padding: '18px 20px',
          }}
          footer={
            <div className="dialog-footer-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
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
                {deleting ? 'Deleting...' : 'Delete Category'}
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
                Confirm Category Deletion
              </h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted, #716c62)', lineHeight: 1.4 }}>
                Are you sure you want to delete category <strong>"{deleteTarget.name}"</strong>? Dishes assigned to this category should be reassigned.
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
