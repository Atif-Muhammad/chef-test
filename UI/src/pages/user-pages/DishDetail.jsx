import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../../config/shared/api';
import { useAuth } from '../../context/AuthContext';
import { DishDetailSkeleton } from '../../components/skeletons';
import {
  SparkleIcon,
  WarningIcon,
  SnowflakeIcon,
  HeartIcon,
} from '../../components/shared/Icons';

// Helper to render tags with +N overflow badge when tags > maxVisible for a category
function renderTagsWithOverflow(tags, type = 'dietary', maxVisible = 4) {
  if (!tags || tags.length === 0) return null;
  const isDietary = type === 'dietary';
  const visible = tags.slice(0, maxVisible);
  const extraCount = tags.length - maxVisible;

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
            fontSize: '0.68rem',
            padding: '2px 7px',
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
          title={tags.slice(maxVisible).join(', ')}
          style={{
            fontSize: '0.68rem',
            padding: '2px 7px',
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

export default function DishDetail() {
  const { id } = useParams();
  const { user, cart, addToCart } = useAuth();
  const [dish, setDish] = useState(null);
  const [similarDishes, setSimilarDishes] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [isFavAnimating, setIsFavAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favUpdating, setFavUpdating] = useState(false);

  useEffect(() => {
    fetchDishAndFavStatus();
  }, [id]);

  const fetchDishAndFavStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dishes/${id}`);
      if (res.data?.dish) {
        const loadedDish = res.data.dish;
        setDish(loadedDish);

        // Fetch similar dishes dynamically: random 2 items of same category + tags
        try {
          const simRes = await api.get('/dishes');
          const allDishes = simRes.data?.dishes || [];

          const loadedCat =
            loadedDish.categoryId?._id ||
            loadedDish.categoryId?.slug ||
            loadedDish.category ||
            loadedDish.type;

          const loadedDietary = Array.isArray(loadedDish.dietaryTags)
            ? loadedDish.dietaryTags
            : loadedDish.dietary
            ? [loadedDish.dietary]
            : [];

          const loadedCuisines = Array.isArray(loadedDish.cuisineTags)
            ? loadedDish.cuisineTags
            : loadedDish.cuisine
            ? [loadedDish.cuisine]
            : [];

          const loadedTagsLower = [...loadedDietary, ...loadedCuisines].map((t) =>
            String(t).toLowerCase()
          );

          const candidates = allDishes.filter((d) => d._id !== loadedDish._id);

          // Score candidate dishes by matching category and shared tags
          const scored = candidates.map((d) => {
            const dCat =
              d.categoryId?._id ||
              d.categoryId?.slug ||
              d.category ||
              d.type;
            const sameCat =
              loadedCat &&
              dCat &&
              (loadedCat === dCat ||
                d.categoryId?.slug === loadedDish.categoryId?.slug ||
                d.type === loadedDish.type);

            const dDietary = Array.isArray(d.dietaryTags)
              ? d.dietaryTags
              : d.dietary
              ? [d.dietary]
              : [];
            const dCuisines = Array.isArray(d.cuisineTags)
              ? d.cuisineTags
              : d.cuisine
              ? [d.cuisine]
              : [];
            const dTagsLower = [...dDietary, ...dCuisines].map((t) =>
              String(t).toLowerCase()
            );

            const sharedTagsCount = dTagsLower.filter((t) =>
              loadedTagsLower.includes(t)
            ).length;

            return {
              dish: d,
              sameCat: Boolean(sameCat),
              sharedTagsCount,
            };
          });

          // Priority 1: same category AND shared tags > 0
          let matches = scored.filter((s) => s.sameCat && s.sharedTagsCount > 0);

          // Priority 2: same category only
          if (matches.length < 2) {
            matches = scored.filter((s) => s.sameCat);
          }

          // Priority 3: shared tags > 0
          if (matches.length < 2) {
            matches = scored.filter((s) => s.sharedTagsCount > 0);
          }

          // Priority 4: any other dishes if DB has very few
          if (matches.length < 2) {
            matches = scored;
          }

          // Pick random 2 items
          const shuffled = [...matches].sort(() => 0.5 - Math.random());
          const selectedDishes = shuffled.slice(0, 2).map((item) => item.dish);

          const related = selectedDishes.map((d) => ({
            id: d._id,
            dishObj: d,
            name: d.name,
            categoryName: d.categoryId?.name || d.category || d.type || 'Seasonal',
            dietaryTags: Array.isArray(d.dietaryTags) ? d.dietaryTags : d.dietary ? [d.dietary] : [],
            cuisineTags: Array.isArray(d.cuisineTags) ? d.cuisineTags : d.cuisine ? [d.cuisine] : [],
            spiceLevel: d.spiceLevel,
            isTimeIntensive: d.isTimeIntensive,
            img: d.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
          }));

          setSimilarDishes(related);
        } catch {
          setSimilarDishes([]);
        }
      } else {
        setDish(null);
      }
    } catch {
      setDish(null);
    }

    if (user) {
      try {
        const favRes = await api.get('/favourites');
        const favList = favRes.data?.favourites || [];
        const found = favList.some((f) => f._id === id);
        setIsFav(found);
      } catch {
        // Ignored
      }
    }
    setLoading(false);
  };

  const toggleFav = () => {
    const nextFav = !isFav;

    // 1. Instant optimistic UI update (no waiting for network)
    setIsFav(nextFav);

    // 2. Trigger heart pop & fill animation
    setIsFavAnimating(true);
    setTimeout(() => {
      setIsFavAnimating(false);
    }, 450);

    if (!user) return;

    // 3. Background asynchronous sync with backend (non-blocking)
    const targetDishId = dish?._id || id;
    const req = nextFav
      ? api.post(`/favourites/${targetDishId}`)
      : api.delete(`/favourites/${targetDishId}`);

    req.catch((err) => {
      console.error('Failed to sync favourite with server', err);
      // Rollback state if server request fails
      setIsFav(!nextFav);
    });
  };

  // 1. Skeleton Loader
  if (loading) return <DishDetailSkeleton />;

  if (!dish) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1a1814', marginBottom: '8px', fontWeight: 600 }}>Dish Not Found</h2>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.8rem', marginBottom: '16px' }}>
          We could not find the dish you were looking for. It may have been retired or made private.
        </p>
        <Link to="/catalogue">
          <button
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              backgroundColor: '#2e3b12',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'none',
            }}
          >
            &larr; Back to Menu
          </button>
        </Link>
      </div>
    );
  }

  const currentDish = dish;
  const inCart = cart?.dishes?.some((d) => d._id === currentDish._id);
  const dishIngredients = currentDish.ingredients || [];

  const dietaryList = Array.isArray(currentDish.dietaryTags)
    ? currentDish.dietaryTags
    : currentDish.dietary
    ? [currentDish.dietary]
    : [];

  const nutritionalList = Array.isArray(currentDish.nutritionalHighlights)
    ? currentDish.nutritionalHighlights
    : [];

  const cuisineList = Array.isArray(currentDish.cuisineTags)
    ? currentDish.cuisineTags
    : currentDish.cuisine
    ? [currentDish.cuisine]
    : [];

  // Content availability flags for perfect alignment
  const hasNotes = Boolean(currentDish.description && currentDish.description.trim());
  const hasStorage = Boolean(
    currentDish.storageDuration || currentDish.reheatingInstructions || currentDish.freezingSuitability
  );
  const hasIngredients = Array.isArray(dishIngredients) && dishIngredients.length > 0;
  const hasLeftDetails = hasNotes || hasStorage;

  return (
    <div className="user-page-container">
      {/* Breadcrumb Navigation Bar (Flat, No Shadows) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#655e53', flexWrap: 'wrap' }}>
          <Link to="/catalogue" style={{ color: 'inherit', textDecoration: 'none' }}>
            Browse Menu
          </Link>
          <span>&rsaquo;</span>
          <span>{currentDish.categoryId?.name || currentDish.categoryName || 'Main Courses'}</span>
          <span>&rsaquo;</span>
          <span style={{ color: '#1a1814', fontWeight: 600 }}>{currentDish.name}</span>
        </div>

        <Link
          to="/catalogue"
          style={{
            fontSize: '0.74rem',
            color: '#2e3b12',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          &lsaquo; Back to Menu
        </Link>
      </div>

      {/* TOP SECTION: Hero Showcase (Photo on Left, Details & CTAs on Right - Equal Height Baseline) */}
      <div className="dish-detail-hero-grid">
        {/* Left Column: Main Hero Dish Photo */}
        <div
          className="dish-detail-hero-photo"
          style={{
            minHeight: '360px',
            height: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#f5eee3',
            border: '1px solid var(--color-border, #ece7de)',
            boxShadow: 'none',
            display: 'flex',
          }}
        >
          <img
            src={currentDish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
            alt={currentDish.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/assets/dishes/lemon-herb-salmon.png';
            }}
          />

          {/* Personal Favourite Button */}
          <button
            onClick={toggleFav}
            type="button"
            title={isFav ? 'Remove from personal favourites' : 'Save to personal favourites'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: isFav ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
              border: `1px solid ${isFav ? '#fca5a5' : '#ece7de'}`,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease',
              transform: isFavAnimating ? 'scale(1.18)' : 'scale(1)',
            }}
          >
            <HeartIcon filled={isFav} animating={isFavAnimating} size={18} color="#dc2626" />
          </button>

          {/* Time-Intensive Badge overlay */}
          {currentDish.isTimeIntensive && (
            <span
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                backgroundColor: 'rgba(180, 83, 9, 0.95)',
                color: '#ffffff',
                fontSize: '0.70rem',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: 'none',
              }}
            >
              Time-Intensive (Max 2 per visit)
            </span>
          )}
        </div>

        {/* Right Column: Meta + Title + Tags + Safety Box + Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Top Badges & Spice Level (Admin-Matched Icons) */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#f5eee3',
                  color: '#594f42',
                  fontWeight: 600,
                }}
              >
                {currentDish.type === 'kids' ? 'Kids' : currentDish.type === 'dessert' ? 'Dessert' : currentDish.type === 'soup' ? 'Soup' : currentDish.type === 'side' ? 'Side' : 'Main'}
              </span>

              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#f1f6ec',
                  color: '#2e3b12',
                  fontWeight: 700,
                  border: '1px solid rgba(46, 59, 18, 0.15)',
                }}
              >
                Base Servings: 2
              </span>

              {(currentDish.suitableForAges1to5 || currentDish.isKidsMeal) && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    fontWeight: 600,
                  }}
                >
                  Suitable for ages 1–5
                </span>
              )}

              {/* Admin-matched Spice Level Icon */}
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor:
                    currentDish.spiceLevel === 'spicy'
                      ? '#fee2e2'
                      : currentDish.spiceLevel === 'mild'
                      ? '#fef3c7'
                      : '#fbf9f5',
                  color:
                    currentDish.spiceLevel === 'spicy'
                      ? '#b91c1c'
                      : currentDish.spiceLevel === 'mild'
                      ? '#92400e'
                      : '#594f42',
                  border: '1px solid #ede8df',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <img
                  src={
                    currentDish.spiceLevel === 'spicy'
                      ? '/assets/spice-spicy.png'
                      : currentDish.spiceLevel === 'mild'
                      ? '/assets/spice-mild.png'
                      : '/assets/no-spice.png'
                  }
                  alt={currentDish.spiceLevel || 'None'}
                  style={{ width: '13px', height: '13px', objectFit: 'contain' }}
                />
                <span style={{ textTransform: 'capitalize' }}>
                  Spice: {currentDish.spiceLevel || 'None'}
                </span>
              </span>
            </div>

            {/* Dish Title */}
            <h1
              style={{
                fontSize: '1.75rem',
                color: '#1a1814',
                margin: '0 0 8px',
                letterSpacing: '-0.2px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.25,
              }}
            >
              {currentDish.name}
            </h1>

            {/* Cuisine Tags with +N overflow */}
            {cuisineList.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                {renderTagsWithOverflow(cuisineList, 'cuisine')}
              </div>
            )}

            {/* Dietary & Nutritional Highlights Safety Box (Flat, No Shadows) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px 16px',
                backgroundColor: '#faf8f5',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #ece7de)',
                boxShadow: 'none',
              }}
            >
              {/* Dietary Information */}
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#15803d',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Dietary Information:
                </span>
                {dietaryList.length > 0 ? (
                  renderTagsWithOverflow(dietaryList, 'dietary')
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#716c62' }}>Standard culinary preparation</span>
                )}
              </div>

              {/* Nutritional Highlights */}
              {nutritionalList.length > 0 && (
                <div style={{ borderTop: '1px solid #ece7de', paddingTop: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#2e3b12',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Nutritional Highlights:
                  </span>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {nutritionalList.slice(0, 4).map((nh, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f6ec',
                          color: '#2e3b12',
                          fontWeight: 600,
                          border: '1px solid #d4e5c8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <SparkleIcon size={11} color="#c49e5d" /> {nh}
                      </span>
                    ))}
                    {nutritionalList.length > 4 && (
                      <span
                        title={nutritionalList.slice(4).join(', ')}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#e6efe0',
                          color: '#2e3b12',
                          fontWeight: 700,
                        }}
                      >
                        +{nutritionalList.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Allergens Present */}
              {currentDish.allergens && currentDish.allergens.length > 0 && (
                <div style={{ borderTop: '1px solid #ece7de', paddingTop: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#c2410c',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Allergens Present:
                  </span>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {currentDish.allergens.map((alg, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #fed7aa',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <WarningIcon size={12} color="#c2410c" /> Contains {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call-to-Action Buttons (Add to Menu & Favourites) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => addToCart(currentDish)}
              style={{
                height: '38px',
                padding: '0 20px',
                borderRadius: '4px',
                backgroundColor: inCart ? '#eef3e9' : '#2e3b12',
                color: inCart ? '#2e3b12' : '#ffffff',
                border: inCart ? '1px solid #2e3b12' : 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              {inCart ? '✓ Selected in Menu Plan' : 'Add to Menu Plan \u2192'}
            </button>

            <button
              onClick={toggleFav}
              type="button"
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '4px',
                backgroundColor: isFav ? '#fef2f2' : '#ffffff',
                border: `1px solid ${isFav ? '#fca5a5' : 'var(--color-border, #ece7de)'}`,
                color: isFav ? '#dc2626' : '#1a1814',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'none',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
            >
              <HeartIcon filled={isFav} animating={isFavAnimating} size={15} color="#dc2626" />
              <span>{isFav ? 'Saved in Personal Favourites' : 'Save to Personal Favourites'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Aligned Details & Ingredients Cards Grid */}
      {(hasLeftDetails || hasIngredients) && (
        <div
          className={hasLeftDetails && hasIngredients ? 'dish-detail-middle-grid' : ''}
          style={{
            display: 'grid',
            gridTemplateColumns: hasLeftDetails && hasIngredients ? undefined : '1fr',
            gap: '24px',
            marginBottom: '20px',
            alignItems: 'stretch',
          }}
        >
          {/* Left Details Column: Chef's Culinary Notes + Storage Guidance */}
          {hasLeftDetails && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
              {/* Description / Chef's Culinary Notes Card (Hidden if not provided by admin) */}
              {hasNotes && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #ece7de)',
                    padding: '18px 20px',
                    boxShadow: 'none',
                    flex: hasStorage ? 'none' : 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      color: '#1a1814',
                      marginBottom: '8px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    About this dish
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#594f42', lineHeight: 1.6, margin: 0 }}>
                    {currentDish.description}
                  </p>
                </div>
              )}

              {/* Storage & Reheating Instructions Card */}
              {hasStorage && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #ece7de)',
                    padding: '18px 20px',
                    boxShadow: 'none',
                    flex: hasNotes ? 'none' : 1,
                  }}
                >
                  <h4 style={{ fontSize: '0.88rem', color: '#2e3b12', margin: '0 0 10px', fontWeight: 700 }}>
                    Storage & Reheating Guidance
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                    {currentDish.storageDuration && (
                      <div>
                        <strong style={{ color: '#1a1814' }}>Storage Freshness: </strong>
                        <span style={{ color: '#655e53' }}>{currentDish.storageDuration}</span>
                      </div>
                    )}

                    {currentDish.freezingSuitability && (
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                          }}
                        >
                          <SnowflakeIcon size={13} color="#1d4ed8" /> Suitable for Home Freezing
                        </span>
                      </div>
                    )}

                    {currentDish.reheatingInstructions && (
                      <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f6f3ed' }}>
                        <strong style={{ color: '#1a1814', display: 'block', marginBottom: '3px' }}>
                          Chef's Reheating Instructions:
                        </strong>
                        <p style={{ color: '#655e53', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                          {currentDish.reheatingInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Details Column: Key Fresh Ingredients (Table format with quantity) */}
          {hasIngredients && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '16px 18px',
                boxShadow: 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.90rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                  Key Fresh Ingredients
                </h3>
                <span style={{ fontSize: '0.68rem', color: '#594f42', backgroundColor: '#f5eee3', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                  2 Servings Base
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ece7de', backgroundColor: '#fbf9f5' }}>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '6px 8px',
                          color: '#716c62',
                          fontWeight: 600,
                          fontSize: '0.70rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Ingredient
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '6px 8px',
                          color: '#716c62',
                          fontWeight: 600,
                          fontSize: '0.70rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          width: '75px',
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '6px 8px',
                          color: '#716c62',
                          fontWeight: 600,
                          fontSize: '0.70rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          width: '65px',
                        }}
                      >
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishIngredients.map((ing, i) => {
                      const qty = ing.qtyPer2 ?? ing.quantity ?? ing.qty ?? '-';
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: i === dishIngredients.length - 1 ? 'none' : '1px solid #f6f3ed',
                          }}
                        >
                          <td style={{ padding: '6px 8px', color: '#1a1814', fontWeight: 500 }}>
                            {ing.name}
                          </td>
                          <td style={{ padding: '6px 8px', color: '#2e3b12', fontWeight: 600, textAlign: 'right' }}>
                            {qty}
                          </td>
                          <td style={{ padding: '6px 8px', color: '#655e53', textAlign: 'right' }}>
                            {ing.unit || 'Fresh'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM SECTION: Similar Seasonal Selections Row (Flush Full Width, Perfect Uniform Top Spacing) */}
      {similarDishes.length > 0 && (
        <div className="dish-similar-section">
          <div style={{ marginBottom: '14px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                color: '#1a1814',
                margin: '0 0 2px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Similar Seasonal Selections
            </h3>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#716c62' }}>
              Handpicked recommendations matching category and flavour profile.
            </p>
          </div>

          <div className="dish-similar-grid">
            {similarDishes.map((s) => {
              const inSimilarCart = cart?.dishes?.some((d) => d._id === s.id);
              return (
                <div key={s.id} className="dish-similar-card">
                  <div className="dish-similar-thumb">
                    <img
                      src={s.img}
                      alt={s.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                      }}
                    />
                  </div>

                  <div className="dish-similar-content">
                    <div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span
                          className="dish-similar-cat-badge"
                          style={{
                            fontSize: '0.64rem',
                            color: '#594f42',
                            backgroundColor: '#f5eee3',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontWeight: 600,
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.categoryName}
                        </span>

                        {s.spiceLevel && s.spiceLevel !== 'none' && (
                          <img
                            src={
                              s.spiceLevel === 'spicy'
                                ? '/assets/spice-spicy.png'
                                : '/assets/spice-mild.png'
                            }
                            alt={s.spiceLevel}
                            title={`Spice: ${s.spiceLevel}`}
                            style={{ width: '11px', height: '11px', objectFit: 'contain' }}
                          />
                        )}
                      </div>

                      <Link
                        to={`/dishes/${s.id}`}
                        className="dish-similar-title"
                      >
                        {s.name}
                      </Link>

                      <div className="dish-similar-tags">
                        {renderTagsWithOverflow(s.dietaryTags, 'dietary', 2)}
                      </div>
                    </div>

                    <div
                      className="dish-similar-footer-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '6px',
                        gap: '6px',
                      }}
                    >
                      <Link
                        to={`/dishes/${s.id}`}
                        className="dish-similar-view-link"
                        style={{
                          fontSize: '0.72rem',
                          color: '#2e3b12',
                          fontWeight: 600,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        View &rarr;
                      </Link>

                      <button
                        type="button"
                        onClick={() => addToCart(s.dishObj || { _id: s.id, name: s.name })}
                        className="dish-similar-select-btn"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: inSimilarCart ? '#eef3e9' : '#2e3b12',
                          color: inSimilarCart ? '#2e3b12' : '#ffffff',
                          border: inSimilarCart ? '1px solid #2e3b12' : 'none',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: 'none',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {inSimilarCart ? '✓ Selected' : '+ Select'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
