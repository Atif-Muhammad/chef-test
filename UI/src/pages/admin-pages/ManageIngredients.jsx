import React, { useState, useEffect } from 'react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import CustomSelect from '../../components/shared/CustomSelect';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageIngredientsSkeleton } from '../../components/skeletons';
import DataTable, { CategoryBadge } from '../../components/shared/DataTable';
import { EditIcon, TrashIcon, WarningIcon, UtensilsIcon, SearchIcon } from '../../components/shared/Icons';

const CATEGORIES = [
  'Produce',
  'Meat & Poultry',
  'Seafood',
  'Dairy',
  'Pantry',
  'Grains & Pasta',
  'Herbs & Spices',
  'Oils & Vinegars',
];

const UNITS = ['g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp', 'bunch'];

export default function ManageIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Dialog state (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Produce',
    defaultUnit: 'g',
    aliases: '',
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ingredients');
      setIngredients(res.data.ingredients || []);
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Produce',
      defaultUnit: 'g',
      aliases: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (ing) => {
    setEditingId(ing._id);
    setFormData({
      name: ing.name,
      category: ing.category || 'Produce',
      defaultUnit: ing.defaultUnit || 'g',
      aliases: (ing.aliases || []).join(', '),
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Produce',
      defaultUnit: 'g',
      aliases: '',
    });
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/ingredients/${editingId}`, formData);
      } else {
        await api.post('/admin/ingredients', formData);
      }
      handleCloseForm();
      await fetchIngredients();
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
      await api.delete(`/admin/ingredients/${deleteTarget._id}`);
      setDeleteTarget(null);
      await fetchIngredients();
    } catch (err) {
      alert(`Delete error: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = ingredients.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(search.toLowerCase())) ||
      (i.aliases && i.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'All' || i.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: 'Ingredient Name',
      key: 'name',
      render: (row) => (
        <div>
          <strong style={{ fontSize: '0.78rem', color: 'var(--color-text, #1e1b16)', display: 'block' }}>
            {row.name}
          </strong>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            Default unit:
            <code
              style={{
                fontSize: '0.66rem',
                backgroundColor: '#f6f3eb',
                border: '1px solid #ede8df',
                padding: '1px 5px',
                borderRadius: '3px',
                color: '#4a453e',
                fontWeight: 600,
              }}
            >
              {row.defaultUnit}
            </code>
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      width: '160px',
      render: (row) => <CategoryBadge category={row.category} />,
    },
    {
      header: 'Aliases & Synonyms (PRD § 19)',
      key: 'aliases',
      render: (row) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {row.aliases && row.aliases.length > 0 ? (
            row.aliases.map((a, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  color: '#57534e',
                  fontSize: '0.68rem',
                  lineHeight: 1.3,
                }}
              >
                {a}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--color-text-muted, #a8a29e)', fontSize: '0.70rem', fontStyle: 'italic' }}>
              None
            </span>
          )}
        </div>
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
            title="Edit ingredient"
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
            title="Delete ingredient"
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

  if (loading) return <ManageIngredientsSkeleton />;

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
            <UtensilsIcon size={20} color="var(--color-primary, #2e3b12)" />
            Master Ingredients Directory
          </h1>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
            Central ingredient identities, unit scales, and alias synonyms for automated shopping-list combining ({ingredients.length} items).
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
          + Add Ingredient
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-search" style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
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
            placeholder="Search ingredients by name, category, or alias..."
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

        {/* Category Filter Pills / Dropdown */}
        <div style={{ width: '180px' }}>
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={[
              { value: 'All', label: 'All Categories' },
              ...CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
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
          search || selectedCategory !== 'All'
            ? 'No master ingredients match your search filters.'
            : 'No master ingredients registered. Click "+ Add Ingredient" above to add your first one.'
        }
      />

      {/* Add / Edit Ingredient Modal Dialog Form */}
      {isFormOpen && (
        <Dialog
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          title={editingId ? 'Edit Ingredient' : 'Add Ingredient'}
          maxWidth="520px"
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
                {submitting ? 'Saving...' : editingId ? '✓ Save Changes' : '+ Add Ingredient'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)' }}>
              {editingId
                ? 'Update central ingredient identity, category classification, and synonym aliases.'
                : 'Define a central ingredient identity for recipe formulation and shopping list scaling.'}
            </p>

            <FormInput
              label="Ingredient Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Heirloom Tomato, Salmon Fillet, White Truffle Oil..."
              required
              autoFocus
              style={{ marginBottom: 0 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <CustomSelect
                  label="Category"
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div>
                <CustomSelect
                  label="Default Unit"
                  value={formData.defaultUnit}
                  onChange={(val) => setFormData({ ...formData, defaultUnit: val })}
                  options={UNITS.map((u) => ({ value: u, label: u }))}
                />
              </div>
            </div>

            <div>
              <FormInput
                label="Aliases & Synonyms (comma-separated, PRD § 19)"
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                placeholder="e.g. tomatoes, cherry tomatoes, plum tomatoes, roma tomato"
                style={{ marginBottom: 0 }}
              />
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', marginTop: '3px' }}>
                Used to merge recipe ingredients under a single grocery item when generating client shopping lists.
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
          title="Delete Ingredient"
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
                {deleting ? 'Deleting...' : 'Delete Ingredient'}
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
                Confirm Ingredient Deletion
              </h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted, #716c62)', lineHeight: 1.4 }}>
                Are you sure you want to delete ingredient <strong>"{deleteTarget.name}"</strong>? Dishes using this ingredient will no longer combine automatically in visit shopping lists.
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
