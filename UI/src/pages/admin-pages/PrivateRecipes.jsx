import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../../config/shared/api';
import Button from '../../components/shared/Button';
import Dialog from '../../components/shared/Dialog';
import Loader from '../../components/shared/Loader';
import { PrivateRecipesSkeleton } from '../../components/skeletons';
import DataTable, { CategoryBadge, DietaryBadge, AllergenBadge } from '../../components/shared/DataTable';
import CustomSelect from '../../components/shared/CustomSelect';
import {
  LockIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  CameraIcon,
  SparkleIcon,
  WarningIcon,
} from '../../components/shared/Icons';

export default function PrivateRecipes() {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Detail Modal Dialog state
  const [viewDish, setViewDish] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [dishesRes, catsRes] = await Promise.all([
        api.get('/admin/dishes'),
        api.get('/admin/categories').catch(() => ({ data: { categories: [] } })),
      ]);
      setDishes(dishesRes.data.dishes || []);
      setCategories(catsRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch private recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.cookingInstructions?.toLowerCase().includes(search.toLowerCase()) ||
      (d.ingredients && d.ingredients.some((ing) => ing.name?.toLowerCase().includes(search.toLowerCase())));

    const catName = d.categoryId?.name || d.course || '';
    const matchesCategory =
      selectedCategory === 'All' || catName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: 'Image',
      key: 'image',
      width: '46px',
      align: 'center',
      render: (row) => {
        const primaryImg =
          (Array.isArray(row.photos) && row.photos[0]) || row.photoUrl || null;
        return (
          <div
            onClick={() => setViewDish(row)}
            style={{
              width: '38px',
              height: '30px',
              borderRadius: '3px',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              border: '1px solid var(--color-border, #ece7de)',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Click to view recipe details"
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
      header: 'Recipe / Dish Name',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
            <CategoryBadge category={row.categoryId?.name || row.course} />
            {row.type && (
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '0.62rem',
                  fontWeight: 500,
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  color: '#57534e',
                  textTransform: 'capitalize',
                }}
              >
                {row.type}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Master Ingredients (Base: 2 Servings)',
      key: 'ingredients',
      render: (row) => {
        const ings = row.ingredients || [];
        if (ings.length === 0) {
          return <span style={{ fontSize: '0.70rem', color: '#a8a29e', fontStyle: 'italic' }}>None specified</span>;
        }

        const previewList = ings.slice(0, 3);
        const remainder = ings.length - previewList.length;

        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {previewList.map((ing, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '1.5px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#f6f3eb',
                  border: '1px solid #ede8df',
                  fontSize: '0.67rem',
                  color: '#4a453e',
                  lineHeight: 1.3,
                }}
              >
                <strong>{ing.name}</strong>: {ing.qtyPer2} {ing.unit}
              </span>
            ))}
            {remainder > 0 && (
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  color: 'var(--color-primary, #2e3b12)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                +{remainder} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Confidential Culinary Technique',
      key: 'cookingInstructions',
      render: (row) => {
        if (!row.cookingInstructions) {
          return (
            <span style={{ fontSize: '0.70rem', color: '#a8a29e', fontStyle: 'italic' }}>
              No private instructions recorded
            </span>
          );
        }

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '3px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              maxWidth: '320px',
            }}
          >
            <LockIcon size={12} color="#9a3412" />
            <span
              style={{
                fontSize: '0.68rem',
                color: '#9a3412',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
              title={row.cookingInstructions}
            >
              {row.cookingInstructions}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Prep Scale',
      key: 'isTimeIntensive',
      width: '110px',
      render: (row) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 7px',
            borderRadius: '3px',
            fontSize: '0.66rem',
            fontWeight: 600,
            backgroundColor: row.isTimeIntensive ? '#fef3e2' : '#f6f3eb',
            border: `1px solid ${row.isTimeIntensive ? '#fde68a' : '#ede8df'}`,
            color: row.isTimeIntensive ? '#9a5b13' : '#716c62',
          }}
        >
          {row.isTimeIntensive && <Clock size={11} color="#9a5b13" style={{ flexShrink: 0 }} />}
          {row.isTimeIntensive ? 'Time-Intensive' : 'Standard Prep'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '75px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
          {/* View Details Button */}
          <button
            type="button"
            onClick={() => setViewDish(row)}
            title="View confidential recipe details"
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
            <EyeIcon size={12} color="#4b5563" />
          </button>

          {/* Edit Dish Form Button */}
          <button
            type="button"
            onClick={() => navigate(`/admin/dishes/edit/${row._id}`)}
            title="Edit master recipe in dish form"
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
        </div>
      ),
    },
  ];

  if (loading) return <PrivateRecipesSkeleton />;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <h1
              style={{
                color: 'var(--color-primary, #2e3b12)',
                fontSize: '1.25rem',
                margin: 0,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LockIcon size={20} color="var(--color-primary, #2e3b12)" />
              Private Master Recipes
            </h1>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '3px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#9a3412',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Confidential Chef Archive
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', margin: 0 }}>
            Confidential culinary formulations, exact 2-serving ingredient ratios, and proprietary preparation techniques ({dishes.length} master recipes).
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
            placeholder="Search private instructions, ingredients, or dishes..."
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

        {/* Category Filter */}
        <div style={{ width: '180px' }}>
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={[
              { value: 'All', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
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

      {/* Main Recipes DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        selectable={false}
        emptyMessage={
          search || selectedCategory !== 'All'
            ? 'No confidential recipes match your search filters.'
            : 'No recipes recorded in the master archive.'
        }
      />

      {/* Comprehensive Horizontal Recipe Detail Dialog */}
      {viewDish && (
        <Dialog
          isOpen={Boolean(viewDish)}
          onClose={() => setViewDish(null)}
          title={`Confidential Master Recipe: ${viewDish.name}`}
          maxWidth="860px"
          cardStyle={{
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg, #fbf9f5)',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '18px 20px',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LockIcon size={12} color="#9a3412" /> Admin culinary secret &bull; Never transmitted to client portal
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewDish(null)}
                  style={{
                    borderRadius: '4px',
                    boxShadow: 'none',
                    border: '1px solid var(--color-border, #ece7de)',
                    backgroundColor: 'var(--color-bg, #fbf9f5)',
                    height: '32px',
                    fontSize: '0.74rem',
                    padding: '0 14px',
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/admin/dishes/edit/${viewDish._id}`)}
                  style={{
                    borderRadius: '4px',
                    boxShadow: 'none',
                    height: '32px',
                    fontSize: '0.74rem',
                    padding: '0 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <EditIcon size={12} color="#ffffff" />
                  Edit in Dish Form
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header Identity Row */}
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '12px 14px',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
              }}
            >
              {/* Thumbnail Gallery */}
              {(() => {
                const dishPhotos =
                  Array.isArray(viewDish.photos) && viewDish.photos.length > 0
                    ? viewDish.photos
                    : viewDish.photoUrl
                    ? [viewDish.photoUrl]
                    : [];
                const primaryPhoto = dishPhotos[0] || null;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      onClick={() => primaryPhoto && setPreviewImage(primaryPhoto)}
                      style={{
                        width: '84px',
                        height: '66px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        cursor: primaryPhoto ? 'pointer' : 'default',
                        border: '1px solid var(--color-border, #ece7de)',
                        backgroundColor: '#f6f3eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      title={primaryPhoto ? 'Click to enlarge cover image' : 'No photo'}
                    >
                      {primaryPhoto ? (
                        <img
                          src={primaryPhoto}
                          alt={viewDish.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <CameraIcon size={20} color="#a8a29e" />
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
                              width: '26px',
                              height: '20px',
                              borderRadius: '2px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: photo === primaryPhoto ? '1.5px solid var(--color-primary, #2e3b12)' : '1px solid var(--color-border, #ece7de)',
                              backgroundColor: '#f6f3eb',
                            }}
                          >
                            <img
                              src={photo}
                              alt={`${viewDish.name} photo ${pIdx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Title & Metadata Badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.05rem',
                      color: 'var(--color-primary, #2e3b12)',
                      fontWeight: 700,
                    }}
                  >
                    {viewDish.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <CategoryBadge category={viewDish.categoryId?.name || viewDish.course} />
                  {viewDish.type && (
                    <span
                      style={{
                        padding: '1.5px 6px',
                        borderRadius: '3px',
                        fontSize: '0.64rem',
                        fontWeight: 500,
                        backgroundColor: '#f6f3eb',
                        border: '1px solid #ede8df',
                        color: '#57534e',
                        textTransform: 'capitalize',
                      }}
                    >
                      {viewDish.type} Course
                    </span>
                  )}
                  <span
                    style={{
                      padding: '1.5px 6px',
                      borderRadius: '3px',
                      fontSize: '0.64rem',
                      fontWeight: 600,
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#9a3412',
                    }}
                  >
                    Standard Base: 2 Servings
                  </span>
                  {viewDish.isTimeIntensive && (
                    <span
                      style={{
                        padding: '1.5px 6px',
                        borderRadius: '3px',
                        fontSize: '0.64rem',
                        fontWeight: 600,
                        backgroundColor: '#fef3e2',
                        border: '1px solid #fde68a',
                        color: '#9a5b13',
                      }}
                    >
                      Time-Intensive Prep
                    </span>
                  )}
                </div>

                <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: 'var(--color-text-muted, #716c62)', lineHeight: 1.4 }}>
                  {viewDish.description || 'Confidential chef master formulation.'}
                </p>
              </div>
            </div>

            {/* Top 2-Column Row: Exact Ingredients (Left) + Storage & Safety (Right) */}
            <div className="admin-split-grid">
              {/* Left Column: Master Ingredients Table */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--color-bg, #fbf9f5)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border, #ece7de)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#716c62',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Exact Ingredients (2 Servings Base)
                  </div>
                  <span style={{ fontSize: '0.64rem', color: '#9a3412', fontWeight: 600 }}>
                    Scaled automatically
                  </span>
                </div>

                {viewDish.ingredients && viewDish.ingredients.length > 0 ? (
                  <div
                    style={{
                      borderRadius: '3px',
                      border: '1px solid #ede8df',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d6ccbe transparent',
                    }}
                  >
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr style={{ backgroundColor: '#f6f3eb', borderBottom: '1px solid #ede8df' }}>
                          <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600, color: '#4a453e' }}>
                            Ingredient
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600, color: '#4a453e', width: '70px' }}>
                            Qty / 2
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600, color: '#4a453e', width: '60px' }}>
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewDish.ingredients.map((ing, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: idx < viewDish.ingredients.length - 1 ? '1px solid #f2ede4' : 'none',
                              backgroundColor: idx % 2 === 0 ? 'transparent' : '#faf8f4',
                            }}
                          >
                            <td style={{ padding: '5px 8px', color: 'var(--color-text, #1e1b16)', fontWeight: 500 }}>
                              {ing.name}
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary, #2e3b12)' }}>
                              {ing.qtyPer2}
                            </td>
                            <td style={{ padding: '5px 8px', color: '#716c62' }}>
                              <code>{ing.unit}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#a8a29e', fontStyle: 'italic' }}>
                    No exact ingredient measurements registered.
                  </p>
                )}
              </div>

              {/* Right Column: Storage, Shelf Life & Safety Profile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Storage & Reheating Instructions */}
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
                      marginBottom: '6px',
                    }}
                  >
                    Storage, Shelf Life & Reheating
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.70rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#4a453e', display: 'block' }}>Storage Duration:</span>
                      <span style={{ color: '#716c62' }}>
                        {viewDish.storageDuration ? `${viewDish.storageDuration} days refrigerated` : '3 - 4 days'}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: '#4a453e', display: 'block' }}>Freezer Safe:</span>
                      <span style={{ color: '#716c62' }}>
                        {viewDish.freezingSuitability ? 'Yes (up to 30 days)' : 'No / Fresh prep only'}
                      </span>
                    </div>
                  </div>
                  {viewDish.storageInstructions && (
                    <div style={{ marginTop: '6px', fontSize: '0.70rem' }}>
                      <span style={{ fontWeight: 600, color: '#4a453e', display: 'block' }}>Handling Guidelines:</span>
                      <span style={{ color: '#716c62' }}>{viewDish.storageInstructions}</span>
                    </div>
                  )}
                  {viewDish.reheatingInstructions && (
                    <div style={{ marginTop: '6px', fontSize: '0.70rem' }}>
                      <span style={{ fontWeight: 600, color: '#4a453e', display: 'block' }}>Reheating Technique:</span>
                      <span style={{ color: '#716c62' }}>{viewDish.reheatingInstructions}</span>
                    </div>
                  )}
                </div>

                {/* Safety & Dietary Profile */}
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
                      marginBottom: '6px',
                    }}
                  >
                    Safety & Dietary Profile
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    {viewDish.allergens && viewDish.allergens.length > 0 ? (
                      viewDish.allergens.map((a, i) => (
                        <AllergenBadge key={i} allergen={typeof a === 'string' ? a : a.name || ''} />
                      ))
                    ) : (
                      <AllergenBadge allergen="None" />
                    )}
                    {viewDish.dietaryTags?.map((t, i) => (
                      <DietaryBadge key={i} tag={t} />
                    ))}
                    {viewDish.isKidsMeal && (
                      <span style={{ fontSize: '0.64rem', padding: '1.5px 6px', borderRadius: '3px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                        Kids Friendly
                      </span>
                    )}
                    {viewDish.freezingSuitability && (
                      <span style={{ fontSize: '0.64rem', padding: '1.5px 6px', borderRadius: '3px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                        Freezer Safe
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Full-Width Section: Proprietary Recipe Preparation & Cooking Technique */}
            <div
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#fff7ed',
                borderRadius: '4px',
                border: '1px solid #fed7aa',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <LockIcon size={14} color="#9a3412" />
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#9a3412',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Proprietary Recipe Preparation & Cooking Technique (Chef Private Archive)
                </span>
              </div>
              <div
                style={{
                  maxHeight: '240px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#fed7aa transparent',
                  paddingRight: '6px',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.76rem',
                    color: '#7c2d12',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                  }}
                >
                  {viewDish.cookingInstructions || 'No private cooking instructions specified for this master dish.'}
                </p>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Photo Lightbox Preview */}
      {previewImage && (
        <Dialog
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          title="Dish Photo Preview"
          maxWidth="580px"
          cardStyle={{
            padding: '12px',
            backgroundColor: '#1c1917',
            border: '1px solid #292524',
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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
              alt="Enlarged dish view"
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
