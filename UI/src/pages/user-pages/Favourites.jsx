import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/shared/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/shared/Loader';
import { HeartIcon } from '../../components/shared/Icons';

export default function Favourites() {
  const navigate = useNavigate();
  const { cart, addToCart } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dishToRemove, setDishToRemove] = useState(null);

  useEffect(() => {
    fetchFavs();
  }, []);

  const fetchFavs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favourites');
      setFavourites(res.data?.favourites || []);
    } catch (err) {
      console.error('Failed to load favourites', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFav = async (id) => {
    setFavourites((prev) => prev.filter((f) => f._id !== id));
    try {
      await api.delete(`/favourites/${id}`);
    } catch (err) {
      console.error('Failed to remove favourite', err);
    }
  };

  // Dynamically compute tabs from real favourites list
  const tabCounts = favourites.reduce(
    (acc, f) => {
      acc.all++;
      const cat = f.category || (f.categoryId && typeof f.categoryId === 'object' ? f.categoryId.slug : null) || 'mains';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    { all: 0 }
  );

  const filterTabs = [
    { id: 'all', label: `All (${tabCounts.all})` },
    ...(tabCounts.mains ? [{ id: 'mains', label: `Mains (${tabCounts.mains})` }] : []),
    ...(tabCounts.salads ? [{ id: 'salads', label: `Salads (${tabCounts.salads})` }] : []),
    ...(tabCounts.pasta ? [{ id: 'pasta', label: `Pasta & Grains (${tabCounts.pasta})` }] : []),
    ...(tabCounts.desserts ? [{ id: 'desserts', label: `Desserts (${tabCounts.desserts})` }] : []),
    ...(tabCounts.kids ? [{ id: 'kids', label: `Kids' Meals (${tabCounts.kids})` }] : []),
  ];

  const filtered = favourites.filter((f) => {
    if (activeTab === 'all') return true;
    const cat = f.category || (f.categoryId && typeof f.categoryId === 'object' ? f.categoryId.slug : null);
    return cat === activeTab;
  });

  if (loading) return <Loader message="Loading favourite dishes..." />;

  return (
    <div style={{ width: '100%', paddingBottom: '30px' }}>
      {/* Title Bar */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.35rem', color: '#1a1814', margin: '0 0 2px', letterSpacing: '-0.3px', fontWeight: 700 }}>
          My Favourites
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.78rem', margin: 0 }}>
          Your personally saved dishes, ready to add to upcoming chef boxes.
        </p>
      </div>

      {favourites.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <HeartIcon filled={false} size={38} color="#d1d5db" />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#1a1814', marginBottom: '6px', fontWeight: 600 }}>
            No Favourites Saved Yet
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #716c62)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.4 }}>
            When browsing Chef Missy's seasonal dishes, click the heart icon on any dish to save it here for quick meal selections.
          </p>
          <Link to="/catalogue">
            <button
              type="button"
              style={{
                padding: '8px 18px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary, #2e3b12)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              Explore Menu Dishes &rarr;
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          {filterTabs.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '2px' }}>
              {filterTabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: `1px solid ${active ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
                      backgroundColor: active ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: active ? '#ffffff' : '#1e1b16',
                      fontSize: '0.72rem',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dish Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {filtered.map((dish) => {
              const inCart = cart.dishes.some((d) => d._id === dish._id);
              return (
                <div
                  key={dish._id}
                  onClick={() => navigate(`/dishes/${dish._id}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #ece7de)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c5bea8')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border, #ece7de)')}
                >
                  {/* Image Container with Heart Button */}
                  <div style={{ height: '140px', position: 'relative', backgroundColor: '#f5eee3' }}>
                    <img
                      src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                      alt={dish.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDishToRemove(dish);
                      }}
                      title="Remove from favourites"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ece7de',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: 0,
                        zIndex: 2,
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <HeartIcon filled={true} size={15} color="#dc2626" style={{ display: 'block' }} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '0.86rem', color: '#1a1814', margin: '0 0 4px', fontWeight: 600, lineHeight: 1.3 }}>
                      {dish.name}
                    </h3>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {dish.course && (
                        <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: '#f5eee3', color: '#594f42', fontWeight: 600 }}>
                          {dish.course}
                        </span>
                      )}
                      {dish.cuisine && (
                        <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                          {dish.cuisine}
                        </span>
                      )}
                      {dish.dietary && (
                        <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: '#ecfdf5', color: '#047857' }}>
                          {dish.dietary}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted, #716c62)',
                        lineHeight: 1.35,
                        margin: '0 0 10px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {dish.description}
                    </p>

                    {/* Add to Menu / Box Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(dish);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 0',
                        borderRadius: '4px',
                        border: inCart ? '1px solid var(--color-primary, #2e3b12)' : '1px solid var(--color-border, #ece7de)',
                        backgroundColor: inCart ? '#eef3e9' : '#faf8f4',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--color-primary, #2e3b12)',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {inCart ? '✓ In Your Box' : '+ Pack into Box'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Remove Confirmation Dialog Modal */}
      {dishToRemove && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setDishToRemove(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              maxWidth: '400px',
              width: '100%',
              padding: '20px 22px',
              boxShadow: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HeartIcon filled={true} size={16} color="#dc2626" />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#1a1814', fontWeight: 700 }}>
                Remove from Favourites?
              </h3>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#57534e', margin: '0 0 18px', lineHeight: 1.45 }}>
              Are you sure you want to remove <strong>{dishToRemove.name}</strong> from your saved favourites?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDishToRemove(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #dcd5ca',
                  backgroundColor: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#4a463e',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFav(dishToRemove._id);
                  setDishToRemove(null);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
