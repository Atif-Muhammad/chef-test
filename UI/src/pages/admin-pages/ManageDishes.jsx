import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, SlidersHorizontal, Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageDishesSkeleton } from '../../components/skeletons';
import CustomSelect from '../../components/shared/CustomSelect';
import FilterDrawer from '../../components/shared/FilterDrawer';
import KebabMenu from '../../components/shared/KebabMenu';
import { truncateWords } from '../../utils/formatters';
import DataTable, {
  CategoryBadge,
  DietaryBadge,
  AllergenBadge,
  StatusBadge,
} from '../../components/shared/DataTable';
import {
  EyeIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
  SearchIcon,
  LayersIcon,
  LeafIcon,
  HerbIcon,
  ShieldIcon,
  CheckCircleIcon,
  ChiliIcon,
  ChiliDoubleIcon,
  SnowflakeIcon,
  ChildIcon,
  LockIcon,
  SparkleIcon,
  CameraIcon,
} from '../../components/shared/Icons';

export default function ManageDishes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDietaryTag, setSelectedDietaryTag] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Modals & Menu State
  const [viewDish, setViewDish] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (searchParam !== null && searchParam !== undefined) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dishes');
      setDishes(res.data.dishes || []);
    } catch (err) {
      console.error('Failed to fetch dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/dishes/${deleteTarget._id}`);
      setDishes((prev) => prev.filter((d) => d._id !== deleteTarget._id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget._id));
      if (viewDish?._id === deleteTarget._id) {
        setViewDish(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const togglePublished = (dish) => {
    setStatusToggleTarget(dish);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusToggleTarget) return;
    setTogglingStatus(true);
    try {
      const newStatus = !statusToggleTarget.isPublished;
      const updated = await api.put(`/admin/dishes/${statusToggleTarget._id}`, {
        isPublished: newStatus,
      });
      const updatedDish = updated.data.dish;
      setDishes((prev) => prev.map((d) => (d._id === statusToggleTarget._id ? updatedDish : d)));
      if (viewDish?._id === statusToggleTarget._id) {
        setViewDish(updatedDish);
      }
      setStatusToggleTarget(null);
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setTogglingStatus(false);
    }
  };

  // Dynamic lists for filter dropdowns
  const categoriesList = Array.from(
    new Set(dishes.map((d) => d.categoryId?.name || d.course).filter(Boolean))
  );

  const dietaryTagsList = Array.from(
    new Set(dishes.flatMap((d) => d.dietaryTags || []).filter(Boolean))
  );

  const allergensList = Array.from(
    new Set(
      dishes
        .flatMap((d) => (d.allergens || []).map((a) => (typeof a === 'string' ? a : a.name)))
        .filter(Boolean)
    )
  );

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categoriesList.map((cat) => ({ value: cat, label: cat })),
  ];

  const dietaryOptions = [
    { value: '', label: 'All Dietary Tags' },
    ...dietaryTagsList.map((tag) => ({ value: tag, label: tag })),
  ];

  const allergenOptions = [
    { value: '', label: 'Allergens' },
    { value: 'none', label: 'Allergen Free (None)' },
    { value: 'has_allergens', label: 'Contains Allergens' },
    ...allergensList.map((allg) => ({ value: allg, label: `Contains ${allg}` })),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDietaryTag('');
    setSelectedAllergen('');
    setSelectedStatus('');
  };

  const filteredDishes = dishes.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.categoryId?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory) {
      const catName = d.categoryId?.name || d.course || '';
      if (catName.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    if (selectedDietaryTag) {
      const tags = d.dietaryTags || [];
      const hasTag = tags.some((t) => t.toLowerCase() === selectedDietaryTag.toLowerCase());
      if (!hasTag) return false;
    }

    if (selectedAllergen) {
      const allergens = (d.allergens || []).map((a) => (typeof a === 'string' ? a : a.name || ''));
      if (selectedAllergen === 'none') {
        if (allergens.length > 0) return false;
      } else if (selectedAllergen === 'has_allergens') {
        if (allergens.length === 0) return false;
      } else {
        const hasAllergen = allergens.some((a) => a.toLowerCase() === selectedAllergen.toLowerCase());
        if (!hasAllergen) return false;
      }
    }

    if (selectedStatus) {
      if (selectedStatus === 'active' && !d.isPublished) return false;
      if (selectedStatus === 'inactive' && d.isPublished) return false;
    }

    return true;
  });

  const activeFilterCount = [
    selectedCategory,
    selectedDietaryTag,
    selectedAllergen,
    selectedStatus,
  ].filter(Boolean).length;

  const columns = [
    {
      header: 'Dish',
      key: 'name',
      render: (row) => {
        const primaryImg =
          (Array.isArray(row.photos) && row.photos.length > 0 && row.photos[0]) ||
          row.photoUrl ||
          null;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div
              onClick={() => setViewDish(row)}
              style={{
                width: '38px',
                height: '32px',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                cursor: 'pointer',
                flexShrink: 0,
                border: '1px solid var(--color-border, #ece7de)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Click to view details"
            >
              {primaryImg ? (
                <img
                  src={primaryImg}
                  alt={row.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <CameraIcon size={14} color="#a8a29e" />
              )}
            </div>

            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setViewDish(row)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1a1814',
                    lineHeight: 1.25,
                  }}
                >
                  {row.name}
                </button>
                <CategoryBadge category={row.categoryId?.name || row.course} />
                <StatusBadge active={row.isPublished} activeText="Active" inactiveText="Inactive" />
              </div>

              <span
                style={{
                  display: 'block',
                  fontSize: '0.68rem',
                  color: '#716c62',
                  marginTop: '2px',
                  lineHeight: 1.25,
                }}
                title={row.description}
              >
                {truncateWords(row.description || 'Chef prepared seasonal specialty.', 4)}
              </span>
            </div>
          </div>
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
          ariaLabel={`Actions for ${row.name}`}
          items={[
            {
              label: 'View Recipe',
              icon: <Eye size={13} />,
              onClick: () => setViewDish(row),
            },
            {
              label: 'Edit Recipe',
              icon: <Edit3 size={13} />,
              onClick: () => navigate(`/admin/dishes/edit/${row._id}`),
            },
            {
              label: row.isPublished ? 'Deactivate' : 'Activate',
              icon: <CheckCircleIcon size={13} color={row.isPublished ? '#d97706' : '#15803d'} />,
              onClick: () => togglePublished(row),
            },
            {
              label: 'Delete Dish',
              icon: <Trash2 size={13} />,
              variant: 'danger',
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  if (loading) return <ManageDishesSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Title Row with Action Button at the End (justify-between) */}
      <div className="admin-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Manage Dishes
        </h1>
        <div className="admin-title-actions">
          <Link
            to="/admin/dishes/new"
            className="admin-action-btn"
            title="Add New Dish"
            aria-label="Add New Dish"
          >
            <Plus size={16} />
          </Link>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Master recipe oversight, allergen tags, and client catalogue controls ({dishes.length} total entries)
      </p>

      {/* Main Page Search & Filter Toggle Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-search-box">
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search dishes..."
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
        title="Filter Dishes"
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
              options={categoryOptions}
              placeholder="All Categories"
              size="sm"
              leadingIcon={<LayersIcon size={13} color="#4b5563" />}
              style={{ width: '100%' }}
              triggerStyle={{ height: '32px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              Dietary Tags
            </label>
            <CustomSelect
              value={selectedDietaryTag}
              onChange={(val) => setSelectedDietaryTag(val)}
              options={dietaryOptions}
              placeholder="All Dietary Tags"
              size="sm"
              leadingIcon={<LeafIcon size={13} color="#4b5563" />}
              style={{ width: '100%' }}
              triggerStyle={{ height: '32px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              Allergens
            </label>
            <CustomSelect
              value={selectedAllergen}
              onChange={(val) => setSelectedAllergen(val)}
              options={allergenOptions}
              placeholder="All Allergens"
              size="sm"
              leadingIcon={<ShieldIcon size={13} color="#4b5563" />}
              style={{ width: '100%' }}
              triggerStyle={{ height: '32px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4a453e', marginBottom: '4px' }}>
              Status
            </label>
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={statusOptions}
              placeholder="All Statuses"
              size="sm"
              leadingIcon={<CheckCircleIcon size={13} color="#4b5563" />}
              style={{ width: '100%' }}
              triggerStyle={{ height: '32px' }}
            />
          </div>
        </div>
      </FilterDrawer>

      {/* Dishes Table */}
      <DataTable
        columns={columns}
        data={filteredDishes}
        selectable={true}
        selectedIds={selectedIds}
        style={{ boxShadow: 'none' }}
        onSelectRow={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
          );
        }}
        onSelectAll={(all) => {
          setSelectedIds(all ? filteredDishes.map((d) => d._id) : []);
        }}
        emptyMessage="No dishes match search criteria."
      />

      {/* =========================================================================
          1. VIEW DETAIL DIALOG FOR DISH (Horizontal Sectioned Admin Recipe View)
         ========================================================================= */}
      {viewDish && (
        <Dialog
          isOpen={Boolean(viewDish)}
          onClose={() => setViewDish(null)}
          title={viewDish.name}
          maxWidth="880px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '16px 20px',
          }}
          footer={
            <div className="dialog-responsive-footer">
              <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                Base Servings: <strong>2 Standard</strong> &bull; {viewDish.categoryId?.name || viewDish.course || 'Uncategorized'}
              </span>
              <div className="dialog-footer-actions">
                <button
                  type="button"
                  onClick={() => setViewDish(null)}
                  style={{
                    height: '32px',
                    padding: '0 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    boxShadow: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ec')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg, #fbf9f5)')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dishId = viewDish._id;
                    setViewDish(null);
                    navigate(`/admin/dishes/edit/${dishId}`);
                  }}
                  style={{
                    height: '32px',
                    padding: '0 14px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-primary, #2e3b12)',
                    backgroundColor: 'var(--color-primary, #2e3b12)',
                    boxShadow: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover, #3b4b18)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary, #2e3b12)')}
                >
                  <EditIcon size={12} color="#ffffff" />
                  <span>Edit Recipe</span>
                </button>
              </div>
            </div>
          }
        >
          {/* Horizontal Multi-Section Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Media & Overview + Preparation Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Section 1: Overview & Media */}
              <div
                className="dialog-dish-overview"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  alignItems: 'center',
                }}
              >
                {/* Clickable Image & Photo Gallery (all photos rendered) */}
                {(() => {
                  const dishPhotos = Array.isArray(viewDish.photos) && viewDish.photos.length > 0
                    ? viewDish.photos
                    : viewDish.photoUrl ? [viewDish.photoUrl] : [];
                  const primaryPhoto = dishPhotos[0] || null;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                      <div
                        className="dialog-dish-thumb"
                        onClick={() => primaryPhoto && setPreviewImage(primaryPhoto)}
                        title={primaryPhoto ? "Click to view full photo" : undefined}
                        style={{
                          width: '84px',
                          height: '84px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: primaryPhoto ? 'pointer' : 'default',
                          border: '1px solid var(--color-border, #ece7de)',
                          backgroundColor: 'var(--color-bg, #fbf9f5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {primaryPhoto ? (
                          <img
                            src={primaryPhoto}
                            alt={viewDish.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <CameraIcon size={20} color="#a8a29e" />
                            <span style={{ fontSize: '0.6rem', color: '#a8a29e' }}>No image</span>
                          </div>
                        )}
                      </div>

                      {dishPhotos.length > 1 && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {dishPhotos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setPreviewImage(photo)}
                              title={`Click to view angle ${pIdx + 1}`}
                              style={{
                                width: '25px',
                                height: '20px',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: photo === primaryPhoto ? '1.5px solid var(--color-primary, #2e3b12)' : '1px solid var(--color-border, #ece7de)',
                                backgroundColor: 'var(--color-bg, #fbf9f5)',
                              }}
                            >
                              <img
                                src={photo}
                                alt={`${viewDish.name} angle ${pIdx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      margin: 0,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.05rem',
                      color: '#1a1814',
                      fontWeight: 700,
                    }}
                  >
                    {viewDish.name}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                    <StatusBadge active={viewDish.isPublished} activeText="Live" inactiveText="Draft" />
                    <CategoryBadge category={viewDish.categoryId?.name || viewDish.course} />
                    {viewDish.type && (
                      <span
                        style={{
                          padding: '1.5px 6px',
                          borderRadius: '3px',
                          fontSize: '0.63rem',
                          fontWeight: 500,
                          backgroundColor: '#f2ece2',
                          color: '#554f46',
                          textTransform: 'capitalize',
                        }}
                      >
                        {viewDish.type}
                      </span>
                    )}
                    {viewDish.isKidsMeal && (
                      <span
                        style={{
                          padding: '1.5px 6px',
                          borderRadius: '3px',
                          fontSize: '0.63rem',
                          fontWeight: 500,
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                        }}
                      >
                        Kids Friendly
                      </span>
                    )}
                    {viewDish.freezingSuitability && (
                      <span
                        style={{
                          padding: '1.5px 6px',
                          borderRadius: '3px',
                          fontSize: '0.63rem',
                          fontWeight: 500,
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                        }}
                      >
                        Freezer Safe
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '0.74rem',
                      color: '#554f46',
                      lineHeight: 1.4,
                    }}
                  >
                    {viewDish.description || 'Chef prepared seasonal specialty.'}
                  </p>
                </div>
              </div>

              {/* Section 2: Preparation & Storage */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    color: '#716c62',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                  }}
                >
                  Preparation & Storage
                </div>

                <div className="dialog-prep-grid">
                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Prep Time</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                      {viewDish.prepTimeMinutes ? `${viewDish.prepTimeMinutes} mins` : '—'}
                    </strong>
                  </div>

                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Cook Time</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                      {viewDish.cookTimeMinutes ? `${viewDish.cookTimeMinutes} mins` : '—'}
                    </strong>
                  </div>

                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Shelf Life</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                      {viewDish.storageDuration || '3 - 4 days'}
                    </strong>
                  </div>

                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Freezer Safe</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                      {viewDish.freezingSuitability ? 'Yes' : 'No'}
                    </strong>
                  </div>

                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Kids Friendly</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1e1b16' }}>
                      {viewDish.isKidsMeal ? 'Yes' : 'No'}
                    </strong>
                  </div>

                  <div style={{ padding: '6px 8px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ede8df' }}>
                    <span style={{ fontSize: '0.64rem', color: '#716c62', display: 'block' }}>Spice Level</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <img
                        src={viewDish.spiceLevel === 'spicy' ? '/assets/spice-spicy.png' : viewDish.spiceLevel === 'mild' ? '/assets/spice-mild.png' : '/assets/no-spice.png'}
                        alt={viewDish.spiceLevel || 'None'}
                        style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                      />
                      <strong style={{ fontSize: '0.78rem', color: '#1e1b16', textTransform: 'capitalize' }}>
                        {viewDish.spiceLevel || 'None'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dietary & Safety + Recipe Ingredients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Section 3: Dietary & Allergen Safety */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    color: '#716c62',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                  }}
                >
                  Dietary & Allergen Declarations
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d6ccbe transparent',
                    paddingRight: '4px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Dietary Tags
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(viewDish.dietaryTags || []).length > 0 ? (
                        viewDish.dietaryTags.map((tag, idx) => (
                          <DietaryBadge key={idx} tag={tag} />
                        ))
                      ) : (
                        <span style={{ fontSize: '0.70rem', color: '#8c827a' }}>None declared</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Allergens
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(viewDish.allergens || []).length > 0 ? (
                        viewDish.allergens.map((a, idx) => (
                          <AllergenBadge key={idx} allergen={typeof a === 'string' ? a : a.name} />
                        ))
                      ) : (
                        <AllergenBadge allergen="None" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Recipe Ingredients */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    color: '#716c62',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                  }}
                >
                  {(viewDish.ingredients || []).length > 0
                    ? `Recipe Ingredients (${viewDish.ingredients.length} items &bull; 2 servings)`
                    : 'Recipe Notes & Instructions'}
                </div>

                {(viewDish.ingredients || []).length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '5px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d6ccbe transparent',
                      paddingRight: '4px',
                    }}
                  >
                    {viewDish.ingredients.map((ing, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#ffffff',
                          borderRadius: '3px',
                          border: '1px solid #ede8df',
                          fontSize: '0.72rem',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#1e1b16' }}>{ing.name}</span>
                        <span style={{ color: '#716c62', fontSize: '0.68rem' }}>
                          {ing.qtyPer2} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#ffffff',
                      borderRadius: '3px',
                      border: '1px solid #ede8df',
                      fontSize: '0.72rem',
                      color: '#655e53',
                      lineHeight: 1.4,
                      maxHeight: '160px',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {viewDish.cookingInstructions ||
                      viewDish.reheatingInstructions ||
                      'Standard artisanal chef recipe with organic pantry essentials.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <Dialog
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          title="Dish Photo Preview"
          maxWidth="640px"
          cardStyle={{
            padding: '12px',
            backgroundColor: '#1c1917',
            border: '1px solid #292524',
          }}
          footer={
            <div className="dialog-footer-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewImage(null)}
                style={{
                  color: '#ffffff',
                  borderColor: '#57534e',
                  backgroundColor: 'transparent',
                  height: '28px',
                  fontSize: '0.72rem',
                }}
              >
                Close Preview
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={previewImage}
              alt="Dish full resolution preview"
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '68vh',
                objectFit: 'contain',
                borderRadius: '3px',
              }}
            />
          </div>
        </Dialog>
      )}

      {/* =========================================================================
          2. DELETE CONFIRMATION DIALOG (Protects against accidental recipe deletion)
         ========================================================================= */}
      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Dish"
          maxWidth="460px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '16px 20px',
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
                {deleting ? 'Deleting...' : 'Delete Dish'}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <WarningIcon size={20} color="#b91c1c" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: 'var(--color-text)' }}>
                  Confirm Recipe Deletion
                </h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Are you sure you want to permanently delete <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>
            </div>

            {/* Dish Context Card */}
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                color: 'var(--color-text)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              <div>
                <strong>Category & Course:</strong> {deleteTarget.categoryId?.name || 'Uncategorized'} &bull;{' '}
                {deleteTarget.type}
              </div>
              <div>
                <strong>Master Ingredients:</strong> {deleteTarget.ingredients?.length || 0} configured items
              </div>
              <div>
                <strong>Catalogue Status:</strong>{' '}
                <span style={{ color: deleteTarget.isPublished ? '#15803d' : '#6b7280', fontWeight: 600 }}>
                  {deleteTarget.isPublished ? 'Live in Client Catalogue' : 'Hidden / Draft'}
                </span>
              </div>
            </div>

            {/* Permanent Warning */}
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: '#fef2f2',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid #fecaca',
                fontSize: '0.7rem',
                color: '#991b1b',
                lineHeight: 1.35,
              }}
            >
              <strong>Notice:</strong> This action cannot be undone. All confidential ingredient ratios (qtyPer2),
              preparation notes, and client menu references will be permanently removed.
            </div>
          </div>
        </Dialog>
      )}

      {/* =========================================================================
          Status Toggle Confirmation Dialog
          ========================================================================= */}
      {statusToggleTarget && (
        <Dialog
          isOpen={Boolean(statusToggleTarget)}
          onClose={() => !togglingStatus && setStatusToggleTarget(null)}
          title={statusToggleTarget.isPublished ? 'Deactivate Dish' : 'Activate Dish'}
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
                onClick={() => setStatusToggleTarget(null)}
                disabled={togglingStatus}
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
                variant={statusToggleTarget.isPublished ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirmToggleStatus}
                disabled={togglingStatus}
                style={{
                  borderRadius: '4px',
                  boxShadow: 'none',
                  height: '28px',
                  fontSize: '0.74rem',
                }}
              >
                {togglingStatus
                  ? 'Updating...'
                  : statusToggleTarget.isPublished
                  ? 'Deactivate Dish'
                  : 'Activate Dish'}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  backgroundColor: statusToggleTarget.isPublished ? '#fef3c7' : '#eef4ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${statusToggleTarget.isPublished ? '#fde68a' : '#d5e4cc'}`,
                }}
              >
                {statusToggleTarget.isPublished ? (
                  <WarningIcon size={18} color="#b45309" />
                ) : (
                  <CheckCircleIcon size={18} color="#15803d" />
                )}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', color: 'var(--color-text, #1e1b16)', fontWeight: 700 }}>
                  {statusToggleTarget.isPublished ? 'Confirm Deactivation' : 'Confirm Activation'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--color-text-muted, #716c62)', lineHeight: 1.4 }}>
                  {statusToggleTarget.isPublished ? (
                    <>
                      Are you sure you want to deactivate <strong>"{statusToggleTarget.name}"</strong>? It will be hidden from client menu catalogue selections.
                    </>
                  ) : (
                    <>
                      Are you sure you want to activate <strong>"{statusToggleTarget.name}"</strong>? It will become visible in the client catalogue for upcoming booking requests.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Dish Info Context Card */}
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                fontSize: '0.72rem',
                color: 'var(--color-text, #1e1b16)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              <div>
                <strong>Dish:</strong> {statusToggleTarget.name}
              </div>
              <div>
                <strong>Category:</strong> {statusToggleTarget.categoryId?.name || 'Uncategorized'} &bull; {statusToggleTarget.type}
              </div>
              <div>
                <strong>Status Change:</strong>{' '}
                <span style={{ color: statusToggleTarget.isPublished ? '#15803d' : '#b45309', fontWeight: 600 }}>
                  {statusToggleTarget.isPublished ? 'Active (Live)' : 'Inactive (Draft)'}
                </span>{' '}
                &rarr;{' '}
                <strong style={{ color: statusToggleTarget.isPublished ? '#b45309' : '#15803d' }}>
                  {statusToggleTarget.isPublished ? 'Inactive' : 'Active'}
                </strong>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
