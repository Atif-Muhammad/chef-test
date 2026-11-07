import React, { useState, useEffect } from 'react';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageCategoriesSkeleton } from '../../components/skeletons';
import DataTable, { CategoryBadge } from '../../components/shared/DataTable';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      header: 'Order',
      key: 'order',
      width: '70px',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 7px',
            borderRadius: '3px',
            backgroundColor: '#f6f3eb',
            border: '1px solid #ede8df',
            color: '#4a453e',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}
        >
          #{row.order ?? 0}
        </span>
      ),
    },
    {
      header: 'Category Name',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CategoryBadge category={row.name} />
          <strong style={{ fontSize: '0.78rem', color: 'var(--color-text, #1e1b16)' }}>
            {row.name}
          </strong>
        </div>
      ),
    },
    {
      header: 'Slug / URL Identifier',
      key: 'slug',
      render: (row) => (
        <code
          style={{
            fontSize: '0.72rem',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            padding: '2px 6px',
            borderRadius: '3px',
            border: '1px solid var(--color-border, #ece7de)',
            color: 'var(--color-text-muted, #716c62)',
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
            title="Edit category"
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
            title="Delete category"
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

  if (loading) return <ManageCategoriesSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '16px' }}>
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
          <LayersIcon size={20} color="var(--color-primary, #2e3b12)" />
          Manage Menu Categories
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
          Organize courses, culinary classifications, and presentation order across all client menu catalogues.
        </p>
      </div>

      {/* Add / Edit Form Card */}
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
