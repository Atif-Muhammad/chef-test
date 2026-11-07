import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { ManageDishesSkeleton } from '../../components/skeletons';
import CustomSelect from '../../components/shared/CustomSelect';
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

  const columns = [
    {
      header: 'Image',
      key: 'photoUrl',
      width: '46px',
      render: (row) => {
        const primaryImg =
          (Array.isArray(row.photos) && row.photos.length > 0 && row.photos[0]) ||
          row.photoUrl ||
          null;

        return (
          <div
            onClick={() => setViewDish(row)}
            style={{
              width: '38px',
              height: '28px',
              borderRadius: '3px',
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
        );
      },
    },
    {
      header: 'Dish Name',
      key: 'name',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => setViewDish(row)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'block',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#1a1814',
              lineHeight: 1.25,
            }}
          >
            {row.name}
          </button>
          <span
            style={{
              display: 'block',
              fontSize: '0.66rem',
              color: '#716c62',
              marginTop: '1px',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.25,
            }}
            title={row.description}
          >
            {row.description || 'Chef prepared seasonal specialty.'}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => <CategoryBadge category={row.categoryId?.name || row.course} />,
    },
    {
      header: 'Dietary Tags',
      key: 'dietaryTags',
      render: (row) => {
        const tags = row.dietaryTags || [];
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {tags.length > 0 ? (
              tags.map((t, i) => <DietaryBadge key={i} tag={t} />)
            ) : (
              <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>—</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Allergens',
      key: 'allergens',
      render: (row) => {
        const allergens = (row.allergens || []).map((a) => (typeof a === 'string' ? a : a.name || ''));
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {allergens.length > 0 ? (
              allergens.map((a, i) => <AllergenBadge key={i} allergen={a} />)
            ) : (
              <AllergenBadge allergen="None" />
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      key: 'isPublished',
      render: (row) => (
        <StatusBadge active={row.isPublished} activeText="Active" inactiveText="Inactive" />
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* Status Toggler Switch */}
          <button
            type="button"
            onClick={() => togglePublished(row)}
            title={row.isPublished ? 'Deactivate dish (hide from catalogue)' : 'Activate dish (publish to catalogue)'}
            style={{
              width: '28px',
              height: '16px',
              borderRadius: '9px',
              backgroundColor: row.isPublished ? '#15803d' : '#d1d5db',
              border: 'none',
              cursor: 'pointer',
              padding: '1.5px',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transition: 'transform 0.2s ease',
                transform: row.isPublished ? 'translateX(12px)' : 'translateX(0)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                display: 'block',
              }}
            />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => navigate(`/admin/dishes/edit/${row._id}`)}
            title="Edit recipe"
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
            title="Delete dish"
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

          {/* View Details Button */}
          <button
            type="button"
            onClick={() => setViewDish(row)}
            title="View details"
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
            <EyeIcon size={11} color="#4b5563" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <ManageDishesSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Title & Add Button */}
      <div className="admin-header-flex">
        <div>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '1.45rem', margin: 0, fontWeight: 700 }}>
            Manage Dishes
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>
            Master recipe oversight, allergen tags, and client catalogue controls ({dishes.length} total entries)
          </p>
        </div>

        <Link to="/admin/dishes/new" style={{ textDecoration: 'none' }}>
          <Button
            variant="primary"
            size="sm"
            style={{
              borderRadius: '4px',
              gap: '6px',
              padding: '0 12px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: 'none',
            }}
          >
            <span style={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: 500 }}>+</span>
            <span>Add New Dish</span>
          </Button>
        </Link>
      </div>

      {/* Top Filter Bar (matching parent background) */}
      <div className="admin-filter-bar">
        {/* Search */}
        <div
          className="admin-filter-search"
          style={{
            flex: '1 1 200px',
            maxWidth: '240px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            borderRadius: '4px',
            padding: '0 9px',
            boxShadow: 'none',
          }}
        >
          <SearchIcon size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.72rem',
              color: '#1f2937',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* All Categories dropdown */}
        <div className="admin-filter-select">
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={categoryOptions}
            placeholder="All Categories"
            size="sm"
            leadingIcon={<LayersIcon size={13} color="#4b5563" />}
            style={{ width: '140px' }}
            triggerStyle={{
              height: '28px',
              minHeight: '28px',
              padding: '0 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              boxShadow: 'none',
            }}
            menuStyle={{
              minWidth: '100%',
              width: 'max-content',
              maxWidth: '220px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px -2px rgba(25, 20, 15, 0.12)',
            }}
          />
        </div>

        {/* All Dietary Tags dropdown */}
        <div className="admin-filter-select">
          <CustomSelect
            value={selectedDietaryTag}
            onChange={(val) => setSelectedDietaryTag(val)}
            options={dietaryOptions}
            placeholder="All Dietary Tags"
            size="sm"
            leadingIcon={<LeafIcon size={13} color="#4b5563" />}
            style={{ width: '145px' }}
            triggerStyle={{
              height: '28px',
              minHeight: '28px',
              padding: '0 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              boxShadow: 'none',
            }}
            menuStyle={{
              minWidth: '100%',
              width: 'max-content',
              maxWidth: '220px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px -2px rgba(25, 20, 15, 0.12)',
            }}
          />
        </div>

        {/* Allergens dropdown */}
        <div className="admin-filter-select">
          <CustomSelect
            value={selectedAllergen}
            onChange={(val) => setSelectedAllergen(val)}
            options={allergenOptions}
            placeholder="All Allergens"
            size="sm"
            leadingIcon={<ShieldIcon size={13} color="#4b5563" />}
            style={{ width: '130px' }}
            triggerStyle={{
              height: '28px',
              minHeight: '28px',
              padding: '0 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              boxShadow: 'none',
            }}
            menuStyle={{
              minWidth: '100%',
              width: 'max-content',
              maxWidth: '220px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px -2px rgba(25, 20, 15, 0.12)',
            }}
          />
        </div>

        {/* All Statuses dropdown */}
        <div className="admin-filter-select">
          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={statusOptions}
            placeholder="All Statuses"
            size="sm"
            leadingIcon={<CheckCircleIcon size={13} color="#4b5563" />}
            style={{ width: '120px' }}
            triggerStyle={{
              height: '28px',
              minHeight: '28px',
              padding: '0 8px',
              fontSize: '0.72rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              boxShadow: 'none',
            }}
            menuStyle={{
              minWidth: '100%',
              width: 'max-content',
              maxWidth: '220px',
              borderRadius: '4px',
              boxShadow: '0 8px 24px -2px rgba(25, 20, 15, 0.12)',
            }}
          />
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={resetFilters}
          style={{
            height: '28px',
            padding: '0 12px',
            borderRadius: '4px',
            border: '1px solid var(--color-border, #ece7de)',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            fontSize: '0.72rem',
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            boxShadow: 'none',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f4ec')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg, #fbf9f5)')}
        >
          Reset
        </button>
      </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                Base Servings: <strong>2 Standard</strong> &bull; {viewDish.categoryId?.name || viewDish.course || 'Uncategorized'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewDish(null)}
                  style={{
                    height: '28px',
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
                    height: '28px',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Media & Overview + Preparation Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Section 1: Overview & Media */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
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
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20, 16, 12, 0.72)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid var(--color-border, #ece7de)',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              title="Close image preview"
            >
              &times;
            </button>
            <img
              src={previewImage}
              alt="Dish full resolution preview"
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
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
