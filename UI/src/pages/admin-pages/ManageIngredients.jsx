import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Edit3, Trash2 } from 'lucide-react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import CustomSelect from '../../components/shared/CustomSelect';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageIngredientsSkeleton } from '../../components/skeletons';
import DataTable, { CategoryBadge } from '../../components/shared/DataTable';
import FilterDrawer from '../../components/shared/FilterDrawer';
import KebabMenu from '../../components/shared/KebabMenu';
import { truncateWords } from '../../utils/formatters';
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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

  const activeFilterCount = selectedCategory !== 'All' ? 1 : 0;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearch('');
  };

  const columns = [
    {
      header: 'Ingredient & Unit',
      key: 'name',
      render: (row) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.80rem', color: 'var(--color-text, #1e1b16)' }}>
              {row.name}
            </strong>
            <CategoryBadge category={row.category} />
          </div>
          <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted, #716c62)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            Default unit:
            <code
              style={{
                fontSize: '0.64rem',
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
      header: 'Aliases & Synonyms',
      key: 'aliases',
      render: (row) => {
        const aliasStr = row.aliases && row.aliases.length > 0 ? row.aliases.join(', ') : 'None';
        return (
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: row.aliases && row.aliases.length > 0 ? '#4a453e' : '#a8a29e',
              lineHeight: 1.25,
            }}
            title={aliasStr}
          >
            {truncateWords(aliasStr, 4)}
          </span>
        );
      },
    },
    {
      header: '',
      key: 'actions',
      width: '38px',
      align: 'right',
      render: (row) => (
        <KebabMenu
          ariaLabel={`Actions for ingredient ${row.name}`}
          items={[
            {
              label: 'Edit Ingredient',
              icon: <Edit3 size={13} />,
              onClick: () => handleEdit(row),
            },
            {
              label: 'Delete Ingredient',
              icon: <Trash2 size={13} />,
              variant: 'danger',
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  if (loading) return <ManageIngredientsSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
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
          <UtensilsIcon size={18} color="var(--color-primary, #2e3b12)" />
          <span>Master Ingredients</span>
        </h1>
        <div className="admin-title-actions">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="admin-action-btn"
            title="Add Ingredient"
            aria-label="Add Ingredient"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Central ingredient identities, unit scales, and alias synonyms ({ingredients.length} items).
      </p>

      {/* Search & Filter Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search ingredients by name, category, or alias..."
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
        title="Filter Ingredients"
        activeCount={activeFilterCount}
        onReset={resetFilters}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              Category
            </label>
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={[
                { value: 'All', label: 'All Categories' },
                ...CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
              style={{ width: '100%' }}
              triggerStyle={{ height: '34px' }}
            />
          </div>
        </div>
      </FilterDrawer>

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
            <div className="dialog-footer-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
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

            <div className="dialog-grid-2col">
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
