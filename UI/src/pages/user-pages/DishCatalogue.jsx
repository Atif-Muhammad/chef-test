import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, SlidersHorizontal, X } from 'lucide-react';
import api from '../../config/shared/api';
import { useAuth } from '../../context/AuthContext';
import {
  HeartIcon,
  SearchIcon,
} from '../../components/shared/Icons';
import CustomSelect from '../../components/shared/CustomSelect';
import { DishCatalogueSkeleton } from '../../components/skeletons';
import DishFilterDrawer from '../../components/user-components/DishFilterDrawer';

// Helper to render tags with +N overflow when category tags > 4
function renderTagsWithOverflow(tags, type = 'dietary') {
  if (!tags || tags.length === 0) return null;
  const isDietary = type === 'dietary';
  const visible = tags.slice(0, 4);
  const extraCount = tags.length - 4;

  const badgeStyle = isDietary
    ? { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5' }
    : { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' };

  const extraBadgeStyle = isDietary
    ? { backgroundColor: '#e2f5ec', color: '#065f46', border: '1px solid #a7f3d0' }
    : { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };

  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
      {visible.map((tag, idx) => (
        <span
          key={idx}
          style={{
            fontSize: '0.66rem',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            ...badgeStyle,
          }}
        >
          {tag}
        </span>
      ))}
      {extraCount > 0 && (
        <span
          title={tags.slice(4).join(', ')}
          style={{
            fontSize: '0.66rem',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'default',
            ...extraBadgeStyle,
          }}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
}

export default function DishCatalogue() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const { user, cart, addToCart } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  const [search, setSearch] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [favourites, setFavourites] = useState(new Set());
  const [animatingFavId, setAnimatingFavId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Right-side Drawer state & filters
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedSpice, setSelectedSpice] = useState('all'); // 'all' | 'mild' | 'medium' | 'hot'
  const [selectedPrepTime, setSelectedPrepTime] = useState('all'); // 'all' | 'under30' | '30to60' | 'over60'
  const [excludedAllergens, setExcludedAllergens] = useState([]);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam !== null && searchParam !== undefined) setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    fetchDishes();
    if (user) fetchFavourites();
  }, [activeCategory, search]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const [dishesRes, catsRes] = await Promise.all([
        api.get('/dishes', { params: { search: search.trim() } }).catch(() => ({ data: { dishes: [] } })),
        api.get('/dishes/categories/all').catch(() => ({ data: { categories: [] } })),
      ]);

      setDishes(dishesRes.data?.dishes || []);
      setCategories(catsRes.data?.categories || []);
    } catch {
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavourites = async () => {
    try {
      const res = await api.get('/favourites');
      const set = new Set(res.data.favourites.map((d) => d._id));
      setFavourites(set);
    } catch {
      // Ignored
    }
  };

  const toggleFav = (dishId) => {
    const next = new Set(favourites);
    const exists = next.has(dishId);
    if (exists) next.delete(dishId);
    else next.add(dishId);
    setFavourites(next);

    // Instant spring pop & fill animation
    setAnimatingFavId(dishId);
    setTimeout(() => {
      setAnimatingFavId((prev) => (prev === dishId ? null : prev));
    }, 450);

    if (user) {
      const syncPromise = exists
        ? api.delete(`/favourites/${dishId}`)
        : api.post(`/favourites/${dishId}`);

      syncPromise.catch((err) => {
        console.error('Failed to sync favourite with server', err);
        // Rollback state if server error occurs
        setFavourites((prev) => {
          const rollback = new Set(prev);
          if (exists) rollback.add(dishId);
          else rollback.delete(dishId);
          return rollback;
        });
      });
    }
  };

  const isSelectedInCart = (dishId) => cart?.dishes?.some((d) => d._id === dishId);

  const toggleCuisineFilter = (c) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const toggleDietaryFilter = (dt) => {
    setSelectedDietary((prev) =>
      prev.includes(dt) ? prev.filter((item) => item !== dt) : [...prev, dt]
    );
  };

  const toggleExcludedAllergen = (alg) => {
    setExcludedAllergens((prev) =>
      prev.includes(alg) ? prev.filter((item) => item !== alg) : [...prev, alg]
    );
  };

  const resetAllFilters = () => {
    setActiveCategory('all');
    setSearch('');
    setSelectedCuisines([]);
    setSelectedDietary([]);
    setSelectedSpice('all');
    setSelectedPrepTime('all');
    setExcludedAllergens([]);
  };

  // Active filters count
  const activeDrawerFilterCount =
    selectedDietary.length +
    selectedCuisines.length +
    (selectedSpice !== 'all' ? 1 : 0) +
    (selectedPrepTime !== 'all' ? 1 : 0) +
    excludedAllergens.length;

  // Filter application
  const filteredDishes = dishes
    .filter((d) => {
      // 1. Category match
      const categoryName = d.categoryId?.slug || d.categoryId?.name?.toLowerCase() || '';
      const matchCat =
        activeCategory === 'all' ||
        d.category === activeCategory ||
        d.type === activeCategory ||
        categoryName === activeCategory;

      // 2. Search query
      const matchSearch =
        !search.trim() ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase());

      // 3. Cuisines (dish must match at least one selected cuisine if any selected)
      const dishCuisines = Array.isArray(d.cuisineTags)
        ? d.cuisineTags
        : d.cuisine
        ? [d.cuisine]
        : [];
      const matchCuisine =
        selectedCuisines.length === 0 ||
        selectedCuisines.some((c) =>
          dishCuisines.map((dc) => dc.toLowerCase()).includes(c.toLowerCase())
        );

      // 4. Dietary (dish must match all selected dietary tags)
      const dishDietary = Array.isArray(d.dietaryTags)
        ? d.dietaryTags
        : d.dietary
        ? [d.dietary]
        : [];
      const matchDietary =
        selectedDietary.length === 0 ||
        selectedDietary.every((dt) =>
          dishDietary.map((dd) => dd.toLowerCase()).includes(dt.toLowerCase())
        );

      // 5. Spice Level
      const dishSpice = (d.spiceLevel || 'none').toLowerCase();
      let matchSpice = true;
      if (selectedSpice === 'mild') {
        matchSpice = dishSpice === 'mild';
      } else if (selectedSpice === 'medium') {
        matchSpice = dishSpice === 'mild' || dishSpice === 'none';
      } else if (selectedSpice === 'hot') {
        matchSpice = dishSpice === 'spicy';
      }

      // 6. Preparation time
      let matchPrepTime = true;
      if (selectedPrepTime === 'under30') {
        matchPrepTime = !d.isTimeIntensive;
      } else if (selectedPrepTime === '30to60') {
        matchPrepTime = Boolean(d.isTimeIntensive);
      } else if (selectedPrepTime === 'over60') {
        matchPrepTime = Boolean(d.isTimeIntensive) && Boolean(d.cookingDuration > 60);
      }

      // 7. Allergens to Exclude
      const dishAllergens = (Array.isArray(d.allergens) ? d.allergens : []).map((a) =>
        a.toLowerCase()
      );
      const matchAllergens =
        excludedAllergens.length === 0 ||
        !excludedAllergens.some((ea) => dishAllergens.includes(ea.toLowerCase()));

      return (
        matchCat &&
        matchSearch &&
        matchCuisine &&
        matchDietary &&
        matchSpice &&
        matchPrepTime &&
        matchAllergens
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Header Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '1.45rem',
            color: '#1a1814',
            marginBottom: '2px',
            letterSpacing: '-0.3px',
            fontWeight: 600,
            fontFamily: 'var(--font-family-serif)',
          }}
        >
          Explore Our Menu
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.78rem', margin: 0 }}>
          Seasonal culinary selections crafted by Chef Missy. Standardized 2-serving base recipes for in-home meal prep.
        </p>
      </div>

      {/* Main Unified Filter Bar (Sleek, No Shadows, Drawer-Powered) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid var(--color-border, #ece7de)',
          padding: '12px 14px',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: 'none',
        }}
      >
        {/* Tier 1: Category Selector Bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: `1px solid ${activeCategory === 'all' ? '#2e3b12' : '#ece7de'}`,
              backgroundColor: activeCategory === 'all' ? '#2e3b12' : '#fbf9f5',
              color: activeCategory === 'all' ? '#ffffff' : '#594f42',
              fontSize: '0.74rem',
              fontWeight: activeCategory === 'all' ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: 'none',
              transition: 'all 0.12s ease',
            }}
          >
            All Dishes ({dishes.length})
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat._id || cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${isActive ? '#2e3b12' : '#ece7de'}`,
                  backgroundColor: isActive ? '#2e3b12' : '#fbf9f5',
                  color: isActive ? '#ffffff' : '#594f42',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}

          {['main', 'dessert', 'kids'].map((typeKey) => {
            const isActive = activeCategory === typeKey;
            const label = typeKey === 'main' ? 'Main Courses' : typeKey === 'dessert' ? 'Desserts' : "Kids' Meals";
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setActiveCategory(typeKey)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${isActive ? '#2e3b12' : '#ece7de'}`,
                  backgroundColor: isActive ? '#2e3b12' : '#fbf9f5',
                  color: isActive ? '#ffffff' : '#594f42',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  transition: 'all 0.12s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tier 2: Search Input, Filters Drawer Trigger, Sort By, and View Mode */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Input Box */}
          <div
            style={{
              flex: '1 1 240px',
              minWidth: '200px',
              backgroundColor: '#fbf9f5',
              border: '1px solid #ece7de',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              gap: '8px',
              height: '32px',
              boxShadow: 'none',
            }}
          >
            <SearchIcon size={13} color="#8c857b" />
            <input
              type="text"
              placeholder="Search dishes, ingredients, or flavours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.76rem',
                color: '#1a1814',
                width: '100%',
                boxShadow: 'none',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8c857b',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: 0,
                  boxShadow: 'none',
                }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Right-Side Filters Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              height: '32px',
              padding: '0 12px',
              borderRadius: '4px',
              border: activeDrawerFilterCount > 0 ? '1px solid #2e3b12' : '1px solid #ece7de',
              backgroundColor: activeDrawerFilterCount > 0 ? '#f1f6ec' : '#fbf9f5',
              color: activeDrawerFilterCount > 0 ? '#2e3b12' : '#594f42',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'all 0.12s ease',
            }}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {activeDrawerFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: '#2e3b12',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                }}
              >
                {activeDrawerFilterCount}
              </span>
            )}
          </button>

          {/* Sort By Dropdown */}
          <div style={{ width: '150px' }}>
            <CustomSelect
              size="sm"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'newest', label: 'Newest Additions' },
                { value: 'name', label: 'Alphabetical (A-Z)' },
              ]}
              triggerStyle={{
                backgroundColor: '#fbf9f5',
                border: '1px solid #ece7de',
                borderRadius: '4px',
                height: '32px',
                fontSize: '0.74rem',
                boxShadow: 'none',
              }}
              menuStyle={{
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* View Mode (Grid / List) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#fbf9f5',
              border: '1px solid #ece7de',
              borderRadius: '4px',
              overflow: 'hidden',
              height: '32px',
              boxShadow: 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0 10px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#2e3b12' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : '#6b665c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
              }}
              title="Grid View"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '0 10px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#2e3b12' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#6b665c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
              }}
              title="List View"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Ribbon (Quick dismiss) */}
      {activeDrawerFilterCount > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '2px 2px',
          }}
        >
          <span style={{ fontSize: '0.70rem', color: '#716c62', fontWeight: 600 }}>Active Filters:</span>

          {/* Dietary chips */}
          {selectedDietary.map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => toggleDietaryFilter(dt)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              <span>{dt}</span>
              <X size={10} />
            </button>
          ))}

          {/* Cuisine chips */}
          {selectedCuisines.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCuisineFilter(c)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              <span>{c}</span>
              <X size={10} />
            </button>
          ))}

          {/* Spice chip */}
          {selectedSpice !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedSpice('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                border: '1px solid #fde68a',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
                textTransform: 'capitalize',
              }}
            >
              <span>Spice: {selectedSpice}</span>
              <X size={10} />
            </button>
          )}

          {/* Prep time chip */}
          {selectedPrepTime !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedPrepTime('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              <span>
                Prep:{' '}
                {selectedPrepTime === 'under30'
                  ? '< 30m'
                  : selectedPrepTime === '30to60'
                  ? '30–60m'
                  : '> 60m'}
              </span>
              <X size={10} />
            </button>
          )}

          {/* Excluded allergens chip */}
          {excludedAllergens.map((alg) => (
            <button
              key={alg}
              type="button"
              onClick={() => toggleExcludedAllergen(alg)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              <span>No {alg}</span>
              <X size={10} />
            </button>
          ))}

          {/* Clear all link */}
          <button
            type="button"
            onClick={resetAllFilters}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.70rem',
              color: '#b91c1c',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600,
              padding: '2px 4px',
            }}
          >
            Reset all
          </button>
        </div>
      )}

      {/* Result Count Status */}
      <div style={{ marginBottom: '12px', fontSize: '0.74rem', color: '#716c62', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Showing <strong>{filteredDishes.length}</strong> {filteredDishes.length === 1 ? 'dish' : 'dishes'}
          {activeDrawerFilterCount > 0 ? ' (filtered)' : ''}
        </span>
      </div>

      {/* Dishes Grid, Skeleton or Empty State */}
      {loading ? (
        <DishCatalogueSkeleton count={8} viewMode={viewMode} />
      ) : filteredDishes.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '36px 20px',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <h3 style={{ fontSize: '1rem', color: '#1a1814', marginBottom: '6px', fontWeight: 600 }}>No Dishes Found</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #716c62)', marginBottom: '16px' }}>
            {dishes.length === 0
              ? 'No dishes have been added to the catalogue yet.'
              : 'No dishes match your active filter criteria. Try resetting your search or filters.'}
          </p>
          {dishes.length > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                backgroundColor: '#2e3b12',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: '18px',
          }}
        >
          {filteredDishes.map((dish) => {
            const isFav = favourites.has(dish._id);
            const inCart = isSelectedInCart(dish._id);
            const dishCuisines = Array.isArray(dish.cuisineTags) ? dish.cuisineTags : dish.cuisine ? [dish.cuisine] : [];
            const dishDietary = Array.isArray(dish.dietaryTags) ? dish.dietaryTags : dish.dietary ? [dish.dietary] : [];

            return (
              <div
                key={dish._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #ece7de)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: viewMode === 'grid' ? 'column' : 'row',
                  boxShadow: 'none',
                  transition: 'border-color 0.15s ease',
                  height: viewMode === 'grid' ? '100%' : 'auto',
                }}
              >
                {/* Thumbnail Container */}
                <div
                  style={{
                    height: viewMode === 'grid' ? '160px' : '140px',
                    width: viewMode === 'grid' ? '100%' : '180px',
                    position: 'relative',
                    backgroundColor: '#f5eee3',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                    alt={dish.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                    }}
                  />

                  {/* Personal Favourite Heart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(dish._id);
                    }}
                    title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isFav ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
                      border: `1px solid ${isFav ? '#fca5a5' : '#ece7de'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isFav ? '#dc2626' : '#9ca3af',
                      boxShadow: 'none',
                      transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease',
                      transform: animatingFavId === dish._id ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <HeartIcon
                      filled={isFav}
                      animating={animatingFavId === dish._id}
                      size={15}
                      color="#dc2626"
                    />
                  </button>

                  {/* Time-Intensive Badge overlay */}
                  {dish.isTimeIntensive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        backgroundColor: 'rgba(180, 83, 9, 0.94)',
                        color: '#ffffff',
                        fontSize: '0.67rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '3px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: 'none',
                      }}
                    >
                      <Clock size={11} color="#ffffff" style={{ flexShrink: 0 }} /> 30m+ Prep (Max 2)
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Meta Badges Row */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '3px',
                        backgroundColor: '#f5eee3',
                        color: '#594f42',
                        fontWeight: 600,
                      }}
                    >
                      {dish.type === 'kids' ? "Kids' Meal" : dish.type === 'dessert' ? 'Dessert' : 'Main'}
                    </span>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '3px',
                        backgroundColor: '#f1f6ec',
                        color: '#2e3b12',
                        fontWeight: 700,
                      }}
                    >
                      Base Servings: 2
                    </span>

                    {/* Admin-matched Spice Level Icon Badge */}
                    {dish.spiceLevel && dish.spiceLevel !== 'none' && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '3px',
                          backgroundColor: dish.spiceLevel === 'spicy' ? '#fee2e2' : '#fef3c7',
                          color: dish.spiceLevel === 'spicy' ? '#b91c1c' : '#92400e',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <img
                          src={dish.spiceLevel === 'spicy' ? '/assets/spice-spicy.png' : '/assets/spice-mild.png'}
                          alt={dish.spiceLevel}
                          style={{ width: '12px', height: '12px', objectFit: 'contain' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{dish.spiceLevel}</span>
                      </span>
                    )}
                  </div>

                  {/* Dish Name */}
                  <h3
                    style={{
                      fontSize: '0.96rem',
                      color: '#1a1814',
                      margin: '0 0 6px',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    <Link
                      to={`/dishes/${dish._id}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {dish.name}
                    </Link>
                  </h3>

                  {/* Dietary & Cuisine Tags with +N overflow when > 4 for each category */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                    {renderTagsWithOverflow(dishDietary, 'dietary')}
                    {renderTagsWithOverflow(dishCuisines, 'cuisine')}
                  </div>

                  {/* Dish Description with Strict 2-Line Height Clamp */}
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#716c62',
                      lineHeight: 1.45,
                      margin: '0 0 10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '2.9em',
                    }}
                    title={dish.description}
                  >
                    {dish.description || 'Seasonal bespoke recipe prepared fresh.'}
                  </p>

                  {/* Action Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '10px',
                      borderTop: '1px solid #f6f3ed',
                    }}
                  >
                    <Link
                      to={`/dishes/${dish._id}`}
                      style={{
                        fontSize: '0.76rem',
                        color: '#2e3b12',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      View Details &rarr;
                    </Link>

                    <button
                      type="button"
                      onClick={() => addToCart(dish)}
                      style={{
                        backgroundColor: inCart ? '#eef3e9' : '#2e3b12',
                        color: inCart ? '#2e3b12' : '#ffffff',
                        border: inCart ? '1px solid #2e3b12' : 'none',
                        borderRadius: '4px',
                        padding: '5px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        boxShadow: 'none',
                      }}
                    >
                      {inCart ? '✓ Selected' : '+ Select'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Right-Side Filters Drawer Component */}
      <DishFilterDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        dishes={dishes}
        selectedDietary={selectedDietary}
        onToggleDietary={toggleDietaryFilter}
        selectedCuisines={selectedCuisines}
        onToggleCuisine={toggleCuisineFilter}
        selectedSpice={selectedSpice}
        onChangeSpice={setSelectedSpice}
        selectedPrepTime={selectedPrepTime}
        onChangePrepTime={setSelectedPrepTime}
        excludedAllergens={excludedAllergens}
        onToggleExcludedAllergen={toggleExcludedAllergen}
        onResetAll={resetAllFilters}
        matchingCount={filteredDishes.length}
      />
    </div>
  );
}
