import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function DishFilterDrawer({
  isOpen,
  onClose,
  dishes = [],
  selectedDietary = [],
  onToggleDietary,
  selectedCuisines = [],
  onToggleCuisine,
  selectedSpice = 'all',
  onChangeSpice,
  selectedPrepTime = 'all',
  onChangePrepTime,
  excludedAllergens = [],
  onToggleExcludedAllergen,
  onResetAll,
  matchingCount = 0,
}) {
  // Close on Escape key without mutating document.body.style.overflow to prevent scrollbar jumping
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Compute live counts from dishes
  // 1. Dietary requirements
  const canonicalDietary = ['Vegan', 'Vegetarian', 'Dairy-Free', 'Halal', 'Gluten-Free', 'Keto', 'Nut-Free', 'Low Carb'];
  const extractedDietary = Array.from(
    new Set(dishes.flatMap((d) => (Array.isArray(d.dietaryTags) ? d.dietaryTags : d.dietary ? [d.dietary] : [])))
  ).filter(Boolean);
  const allDietaryTags = Array.from(new Set([...canonicalDietary, ...extractedDietary]));

  const dietaryOptions = allDietaryTags
    .map((tag) => {
      const count = dishes.filter((d) => {
        const dTags = Array.isArray(d.dietaryTags) ? d.dietaryTags : d.dietary ? [d.dietary] : [];
        return dTags.some((t) => t.toLowerCase() === tag.toLowerCase());
      }).length;
      return { label: tag, count };
    })
    .filter((item) => item.count > 0 || canonicalDietary.includes(item.label));

  // 2. Cuisines
  const canonicalCuisines = ['Modern British', 'Italian', 'Pan-Asian', 'Mediterranean', 'French', 'Thai', 'Japanese'];
  const extractedCuisines = Array.from(
    new Set(dishes.flatMap((d) => (Array.isArray(d.cuisineTags) ? d.cuisineTags : d.cuisine ? [d.cuisine] : [])))
  ).filter(Boolean);
  const allCuisines = Array.from(new Set([...canonicalCuisines, ...extractedCuisines]));

  const cuisineOptions = allCuisines
    .map((c) => {
      const count = dishes.filter((d) => {
        const dCuisines = Array.isArray(d.cuisineTags) ? d.cuisineTags : d.cuisine ? [d.cuisine] : [];
        return dCuisines.some((item) => item.toLowerCase() === c.toLowerCase());
      }).length;
      return { label: c, count };
    })
    .filter((item) => item.count > 0 || canonicalCuisines.includes(item.label));

  // 3. Allergens to exclude
  const canonicalAllergens = ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame'];
  const extractedAllergens = Array.from(
    new Set(dishes.flatMap((d) => (Array.isArray(d.allergens) ? d.allergens : [])))
  ).filter(Boolean);
  const allAllergens = Array.from(new Set([...canonicalAllergens, ...extractedAllergens]));

  const allergenOptions = allAllergens
    .map((alg) => {
      const count = dishes.filter((d) => {
        const dAllergens = Array.isArray(d.allergens) ? d.allergens : [];
        return dAllergens.some((a) => a.toLowerCase() === alg.toLowerCase());
      }).length;
      return { label: alg, count };
    })
    .filter((item) => item.count > 0 || canonicalAllergens.includes(item.label));

  // Active filter count
  let activeFilterCount = 0;
  activeFilterCount += selectedDietary.length;
  activeFilterCount += selectedCuisines.length;
  if (selectedSpice !== 'all') activeFilterCount += 1;
  if (selectedPrepTime !== 'all') activeFilterCount += 1;
  activeFilterCount += excludedAllergens.length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(26, 24, 20, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, visibility 0.22s ease',
        }}
      />

      {/* Right-Side Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          maxHeight: '100vh',
          width: '390px',
          maxWidth: '92vw',
          backgroundColor: '#ffffff',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '-4px 0 20px rgba(0, 0, 0, 0.12)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s ease',
          willChange: 'transform',
          borderLeft: '1px solid #ece7de',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #ece7de',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-heading, "Cormorant Garamond", Georgia, serif)',
                  color: '#1a1814',
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    fontSize: '0.70rem',
                    backgroundColor: '#eef3e9',
                    color: '#2e3b12',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount} selected
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.76rem', color: '#716c62', margin: '4px 0 0', lineHeight: 1.4 }}>
              Refine your menu to find dishes that match your preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters drawer"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              color: '#716c62',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Filter Options Body - Bulletproof Flex Overflow & Isolated Scroll */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d6ccbe transparent',
          }}
        >
          {/* 1. Dietary Requirements */}
          <div>
            <h3
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1a1814',
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Dietary requirements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dietaryOptions.map((item) => {
                const checked = selectedDietary.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onToggleDietary(item.label)}
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 2px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: checked ? '1px solid #2e3b12' : '1px solid #c7bea8',
                          backgroundColor: checked ? '#2e3b12' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                          flexShrink: 0,
                        }}
                      >
                        {checked && <Check size={11} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.80rem',
                          color: checked ? '#1a1814' : '#4a463e',
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#8c857b' }}>({item.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Cuisines */}
          <div>
            <h3
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1a1814',
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Cuisines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cuisineOptions.map((item) => {
                const checked = selectedCuisines.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onToggleCuisine(item.label)}
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 2px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: checked ? '1px solid #2e3b12' : '1px solid #c7bea8',
                          backgroundColor: checked ? '#2e3b12' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                          flexShrink: 0,
                        }}
                      >
                        {checked && <Check size={11} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.80rem',
                          color: checked ? '#1a1814' : '#4a463e',
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#8c857b' }}>({item.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Spice tolerance */}
          <div>
            <h3
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1a1814',
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Spice tolerance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'all', label: 'Any spice level' },
                { value: 'mild', label: 'Mild', icon: '/assets/spice-mild.png' },
                { value: 'medium', label: 'Medium' },
                { value: 'hot', label: 'Hot', icon: '/assets/spice-spicy.png' },
              ].map((opt) => {
                const selected = selectedSpice === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeSpice(opt.value)}
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '4px 2px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: selected ? '1px solid #2e3b12' : '1px solid #c7bea8',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2e3b12',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {opt.icon && (
                        <img
                          src={opt.icon}
                          alt=""
                          style={{ width: '13px', height: '13px', objectFit: 'contain' }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: '0.80rem',
                          color: selected ? '#1a1814' : '#4a463e',
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Preparation time */}
          <div>
            <h3
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1a1814',
                margin: '0 0 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Preparation time
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'all', label: 'Any duration' },
                { value: 'under30', label: 'Under 30 minutes' },
                { value: '30to60', label: '30–60 minutes' },
                { value: 'over60', label: 'Over 60 minutes' },
              ].map((opt) => {
                const selected = selectedPrepTime === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangePrepTime(opt.value)}
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '4px 2px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: selected ? '1px solid #2e3b12' : '1px solid #c7bea8',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2e3b12',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.80rem',
                        color: selected ? '#1a1814' : '#4a463e',
                        fontWeight: selected ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Allergens to exclude */}
          <div>
            <h3
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1a1814',
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Allergens to exclude
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#c2410c', display: 'block', marginBottom: '8px' }}>
              Dishes containing these allergens will be hidden
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allergenOptions.map((item) => {
                const checked = excludedAllergens.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onToggleExcludedAllergen(item.label)}
                    style={{
                      all: 'unset',
                      boxSizing: 'border-box',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 2px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: checked ? '1px solid #b91c1c' : '1px solid #c7bea8',
                          backgroundColor: checked ? '#fee2e2' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.12s ease',
                          flexShrink: 0,
                        }}
                      >
                        {checked && <X size={12} color="#b91c1c" strokeWidth={3} />}
                      </div>
                      <span
                        style={{
                          fontSize: '0.80rem',
                          color: checked ? '#b91c1c' : '#4a463e',
                          fontWeight: checked ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#8c857b' }}>({item.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Drawer Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #ece7de',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#716c62', fontWeight: 600 }}>
              {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} selected
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetAll}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.74rem',
                  color: '#b91c1c',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Reset all
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#2e3b12',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'background-color 0.12s ease',
            }}
          >
            Show {matchingCount} Matching {matchingCount === 1 ? 'Dish' : 'Dishes'}
          </button>
        </div>
      </div>
    </>
  );
}
