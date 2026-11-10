import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  RotateCcw,
  Eye,
  FileText,
  Package,
  Utensils,
  ChevronLeft,
  ChevronRight,
  ChefHat,
} from 'lucide-react';
import api from '../../config/shared/api';
import { useAuth } from '../../context/AuthContext';
import { formatArrivalWindow } from '../../utils/formatters';

// Skeletons for the selected box details (metrics, dishes, summary & actions)
function BoxDetailsSkeleton() {
  return (
    <div>
      {/* 3 Metric Overview Cards Skeleton */}
      <div className="user-metric-3col" style={{ marginBottom: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ece7de',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'none',
            }}
          >
            <div className="skeleton-box" style={{ width: '34px', height: '34px', borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-box" style={{ width: '75px', height: '11px', marginBottom: '6px' }} />
              <div className="skeleton-box" style={{ width: '135px', height: '15px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Grid Skeleton */}
      <div className="user-split-2col">
        {/* Left Column: Dishes Skeleton */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className="skeleton-box" style={{ width: '140px', height: '18px' }} />
            <div className="skeleton-box" style={{ width: '80px', height: '14px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #ece7de',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div className="skeleton-box" style={{ width: '74px', height: '58px', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-box" style={{ width: '160px', height: '16px', marginBottom: '6px' }} />
                  <div className="skeleton-box" style={{ width: '85%', height: '12px', marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div className="skeleton-box" style={{ width: '45px', height: '16px', borderRadius: '3px' }} />
                    <div className="skeleton-box" style={{ width: '55px', height: '16px', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Summary Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #ece7de',
              overflow: 'hidden',
            }}
          >
            <div style={{ backgroundColor: 'var(--color-primary, #2e3b12)', padding: '10px 14px' }}>
              <div className="skeleton-box" style={{ width: '130px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
            </div>
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ width: '90px', height: '13px' }} />
                  <div className="skeleton-box" style={{ width: '45px', height: '13px' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="skeleton-box" style={{ width: '100%', height: '38px', borderRadius: '6px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const { addToCart, updateCartDetails } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetVisitId = searchParams.get('visitId');
  const scrollRef = useRef(null);
  const detailsCache = useRef({});

  // Carousel Cards State (10 at a time)
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Selected Box Details State
  const [selectedVisitId, setSelectedVisitId] = useState(targetVisitId || null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Initial fetch: first 10 cards
  useEffect(() => {
    fetchInitialCards();
  }, []);

  const fetchInitialCards = async () => {
    setLoadingCards(true);
    try {
      const res = await api.get('/visits/history', { params: { page: 1, limit: 10 } });
      const list = res.data?.visits || [];
      setCards(list);
      setHasMore(Boolean(res.data?.hasMore));
      setPage(1);

      if (targetVisitId) {
        setSelectedVisitId(targetVisitId);
      } else if (list.length > 0) {
        setSelectedVisitId(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch initial box history', err);
    } finally {
      setLoadingCards(false);
    }
  };

  // Fetch next batch of 10 cards when approaching the 9th card / track end
  const fetchMoreCards = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await api.get('/visits/history', { params: { page: nextPage, limit: 10 } });
      const newItems = res.data?.visits || [];
      if (newItems.length > 0) {
        setCards((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const filtered = newItems.filter((c) => !existingIds.has(c._id));
          return [...prev, ...filtered];
        });
        setPage(nextPage);
      }
      setHasMore(Boolean(res.data?.hasMore));
    } catch (err) {
      console.error('Failed to fetch more boxes', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Fetch full details only for the checked/selected top card
  useEffect(() => {
    if (!selectedVisitId) {
      setSelectedVisit(null);
      return;
    }

    // Check in-memory cache first for instant response
    if (detailsCache.current[selectedVisitId]) {
      setSelectedVisit(detailsCache.current[selectedVisitId]);
      setDetailsLoading(false);
      return;
    }

    // Fetch details on-demand with skeleton loader
    fetchBoxDetails(selectedVisitId);
  }, [selectedVisitId]);

  const fetchBoxDetails = async (visitId) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/visits/${visitId}`);
      const data = res.data?.visit;
      if (data) {
        detailsCache.current[visitId] = data;
        setSelectedVisit(data);
      }
    } catch (err) {
      console.error('Failed to fetch box details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Horizontal scroll handler: triggers fetchMore when 9th card is reached
  const handleTrackScroll = (e) => {
    const el = e.currentTarget;
    if (!el || loadingMore || !hasMore) return;

    // Remaining horizontal scroll distance
    const remainingDistance = el.scrollWidth - (el.scrollLeft + el.clientWidth);

    // Each card is ~240px + 12px gap = ~252px. When user scrolls to near the 9th/10th card (< 320px left):
    if (remainingDistance < 320) {
      fetchMoreCards();
    }
  };

  const scrollCarousel = (direction) => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth || 280;
      const isMobile = window.innerWidth <= 640;
      const offset = isMobile
        ? (direction === 'left' ? -containerWidth : containerWidth)
        : (direction === 'left' ? -(containerWidth + 12) : (containerWidth + 12));
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const useMenuAgain = (boxToUse) => {
    const target = boxToUse || selectedVisit;
    if (!target || !target.dishes) return;

    if (updateCartDetails) {
      updateCartDetails({
        guests: target.guests || 2,
        notes: target.notes || '',
      });
    }

    target.dishes.forEach((item) => {
      const dishObj = item.dishId && typeof item.dishId === 'object' ? item.dishId : {};
      addToCart({
        _id: dishObj._id || item.dishId,
        name: dishObj.name || 'Selected Dish',
        course: item.course || dishObj.course || 'Main Course',
        photoUrl: dishObj.photoUrl || '/assets/dishes/lemon-herb-salmon.png',
        dietary: dishObj.dietary,
      });
    });
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', label: 'Confirmed' },
      ready: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'Ready for Pickup' },
      pending: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', label: 'Pending Review' },
      completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Completed' },
      cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled' },
    };
    const c = config[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: status || 'Pending' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '0.64rem',
          fontWeight: 600,
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          textTransform: 'capitalize',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div className="user-page-container">
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '8px' }}>
        <Link
          to="/home"
          style={{
            fontSize: '0.74rem',
            color: 'var(--color-text-muted, #716c62)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={13} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header Bar */}
      <div className="user-title-row">
        <div>
          <h1 className="user-page-title">
            Previous Boxes & Selections
          </h1>
          <p className="user-page-subtitle">
            Browse your past meal boxes, review menu choices, and quickly re-pack favourite selections.
          </p>
        </div>

        {selectedVisit && (
          <div className="user-title-actions">
            <button
              type="button"
              className="user-action-btn"
              onClick={() => useMenuAgain(selectedVisit)}
              disabled={detailsLoading}
              title="Re-pack this box"
              style={{ padding: '0 12px' }}
            >
              <RotateCcw size={13} />
              <span className="user-btn-text">Re-pack This Box</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State when no boxes exist at all */}
      {!loadingCards && cards.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <Package size={38} color="#9ca3af" />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#1a1814', marginBottom: '6px', fontWeight: 600 }}>
            No Previous Boxes Yet
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #716c62)', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.45 }}>
            Once you place your first meal box order, your full menu choices, chef preparation notes, and box details will appear here.
          </p>
          <Link to="/cart">
            <button
              type="button"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-primary, #2e3b12)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'none',
              }}
            >
              Pack Your Box &rarr;
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Horizontal Toggler Carousel with Left/Right Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              position: 'relative',
            }}
          >
            {/* Left Chevron Button */}
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              title="Previous boxes"
              className="history-carousel-btn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #dcd5ca',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                zIndex: 2,
                color: 'var(--color-primary, #2e3b12)',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#faf8f4';
                e.currentTarget.style.borderColor = '#c5bea8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#dcd5ca';
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Scrollable Track with x-axis pagination detection */}
            <div
              ref={scrollRef}
              className="history-carousel-track"
              onScroll={handleTrackScroll}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '4px 2px',
                flex: 1,
                minWidth: 0,
                scrollBehavior: 'smooth',
              }}
            >
              {loadingCards ? (
                /* Initial loading skeletons for top cards */
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="history-nav-card-skeleton"
                    style={{
                      height: '84px',
                      borderRadius: '10px',
                      border: '1px solid #ece7de',
                      backgroundColor: '#ffffff',
                      padding: '12px 14px',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div className="skeleton-box" style={{ width: '100px', height: '14px' }} />
                      <div className="skeleton-box" style={{ width: '55px', height: '14px', borderRadius: '4px' }} />
                    </div>
                    <div className="skeleton-box" style={{ width: '130px', height: '12px', marginBottom: '6px' }} />
                    <div className="skeleton-box" style={{ width: '90px', height: '11px' }} />
                  </div>
                ))
              ) : (
                cards.map((v, index) => {
                  const isSelected = selectedVisitId === v._id;
                  const dateObj = new Date(v.visitDate);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const shortDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={v._id}
                      onClick={() => setSelectedVisitId(v._id)}
                      className={`history-nav-card ${isSelected ? 'active' : ''}`}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--color-primary, #2e3b12)' : '1px solid var(--color-border, #ece7de)',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                        outline: isSelected ? '2px solid rgba(46, 59, 18, 0.12)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = '#c5bea8';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border, #ece7de)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '6px', minWidth: 0 }}>
                        <strong className="history-nav-card-title" style={{ fontSize: '0.80rem', color: '#1a1814', fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span className="history-date-desktop">{formattedDate}</span>
                          <span className="history-date-mobile">{shortDate}</span>
                        </strong>
                        <div style={{ flexShrink: 0 }}>
                          {getStatusBadge(v.status)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted, #716c62)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          marginBottom: '4px',
                        }}
                      >
                        <Package size={12} color="#716c62" style={{ flexShrink: 0 }} />
                        <span>
                          {v.guests || 2} portions &bull; {v.dishes?.length || 0} dishes
                        </span>
                      </div>

                      {v.arrivalWindow && (
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: '#065f46',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={11} color="#065f46" style={{ flexShrink: 0 }} />
                          <span>Window: {formatArrivalWindow(v.arrivalWindow)}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Loader Card when fetching next 10 items */}
              {loadingMore && (
                <div
                  style={{
                    minWidth: '240px',
                    height: '84px',
                    borderRadius: '10px',
                    border: '1px solid #ece7de',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton-box" style={{ width: '90px', height: '14px' }} />
                    <div className="skeleton-box" style={{ width: '50px', height: '14px' }} />
                  </div>
                  <div className="skeleton-box" style={{ width: '130px', height: '12px' }} />
                </div>
              )}
            </div>

            {/* Right Chevron Button */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              title="Next boxes"
              className="history-carousel-btn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #dcd5ca',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                zIndex: 2,
                color: 'var(--color-primary, #2e3b12)',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#faf8f4';
                e.currentTarget.style.borderColor = '#c5bea8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#dcd5ca';
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Details Section: Shows Skeleton while fetching, otherwise renders full details */}
          {detailsLoading || !selectedVisit ? (
            <BoxDetailsSkeleton />
          ) : (
            <div>
              {/* 3 Metric Cards Row (Box Date, Box Portions, Delivery/Pickup Window) */}
              <div className="user-metric-3col" style={{ marginBottom: '16px' }}>
                {/* 1. Box Date */}
                <div
                  className="history-metric-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'none',
                  }}
                >
                  <div
                    className="history-metric-icon"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      backgroundColor: '#f5eee3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={17} color="var(--color-primary, #2e3b12)" />
                  </div>
                  <div>
                    <span className="history-metric-label" style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
                      Box Date
                    </span>
                    <strong className="history-metric-value" style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
                      {new Date(selectedVisit.visitDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                </div>

                {/* 2. Box Portions */}
                <div
                  className="history-metric-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'none',
                  }}
                >
                  <div
                    className="history-metric-icon"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      backgroundColor: '#f5eee3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Users size={17} color="var(--color-primary, #2e3b12)" />
                  </div>
                  <div>
                    <span className="history-metric-label" style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
                      Box Portions
                    </span>
                    <strong className="history-metric-value" style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
                      {selectedVisit.guests || 2} Portions
                    </strong>
                  </div>
                </div>

                {/* 3. Delivery / Pickup Window */}
                <div
                  className="history-metric-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'none',
                  }}
                >
                  <div
                    className="history-metric-icon"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      backgroundColor: '#fffbeb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={17} color="#b45309" />
                  </div>
                  <div>
                    <span className="history-metric-label" style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
                      Delivery / Pickup Window
                    </span>
                    <strong className="history-metric-value" style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
                      {formatArrivalWindow(selectedVisit.arrivalWindow) || (selectedVisit.status === 'confirmed' ? 'Scheduled' : '11:00 AM – 1:00 PM')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Main Content Layout: Left Box Dishes List + Right Box Order Summary & Actions */}
              <div className="user-split-2col">
                {/* Left: Box Dishes List */}
                <div>
                  {/* Section Title with View Details Link */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={16} color="var(--color-primary, #2e3b12)" />
                      <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                        Box Dishes ({selectedVisit.dishes?.length || 0})
                      </h3>
                    </div>

                    <Link
                      to={`/visits/${selectedVisit._id}`}
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--color-primary, #2e3b12)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <span>View Details</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  {/* Dish Cards (NO portions on card) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedVisit.dishes?.map((item, idx) => {
                      const dish = item.dishId && typeof item.dishId === 'object' ? item.dishId : {};
                      const dishId = dish._id || item.dishId;
                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border, #ece7de)',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            boxShadow: 'none',
                          }}
                        >
                          {/* Dish Image Thumbnail */}
                          <div
                            onClick={() => dishId && navigate(`/dishes/${dishId}`)}
                            style={{
                              width: '74px',
                              height: '58px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              backgroundColor: '#f5eee3',
                              cursor: dishId ? 'pointer' : 'default',
                            }}
                          >
                            <img
                              src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                              alt={dish.name || 'Dish'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                              }}
                            />
                          </div>

                          {/* Dish Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4
                              onClick={() => dishId && navigate(`/dishes/${dishId}`)}
                              style={{
                                fontSize: '0.86rem',
                                color: '#1a1814',
                                margin: '0 0 3px',
                                fontWeight: 700,
                                cursor: dishId ? 'pointer' : 'default',
                              }}
                              onMouseEnter={(e) => {
                                if (dishId) e.currentTarget.style.color = 'var(--color-primary, #2e3b12)';
                              }}
                              onMouseLeave={(e) => {
                                if (dishId) e.currentTarget.style.color = '#1a1814';
                              }}
                            >
                              {dish.name || 'Custom Menu Item'}
                            </h4>
                            <p
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--color-text-muted, #716c62)',
                                margin: '0 0 6px',
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {dish.description || 'Special private chef preparation.'}
                            </p>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.64rem',
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  backgroundColor: '#f5eee3',
                                  color: '#594f42',
                                  fontWeight: 600,
                                }}
                              >
                                {item.course || dish.course || 'main'}
                              </span>
                              {dish.cuisine && (
                                <span
                                  style={{
                                    fontSize: '0.64rem',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1d4ed8',
                                  }}
                                >
                                  {dish.cuisine}
                                </span>
                              )}
                              {dish.dietary && (
                                <span
                                  style={{
                                    fontSize: '0.64rem',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    backgroundColor: '#ecfdf5',
                                    color: '#047857',
                                  }}
                                >
                                  {dish.dietary}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Box Order Summary Card & Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Client Notes if any */}
                  {selectedVisit.notes && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #ece7de)',
                        padding: '12px',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <FileText size={14} color="var(--color-primary, #2e3b12)" />
                        <h4 style={{ fontSize: '0.82rem', margin: 0, color: '#1a1814', fontWeight: 600 }}>
                          Your Special Requests
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#655e53', lineHeight: 1.45, margin: 0 }}>
                        {selectedVisit.notes}
                      </p>
                    </div>
                  )}

                  {/* Chef Notes if any */}
                  {selectedVisit.chefNotes && (
                    <div
                      style={{
                        backgroundColor: '#fcfaf7',
                        borderRadius: '8px',
                        border: '1px solid #ebdccb',
                        padding: '12px',
                        boxShadow: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <ChefHat size={15} color="var(--color-primary, #2e3b12)" />
                        <h4 style={{ fontSize: '0.82rem', margin: 0, color: 'var(--color-primary, #2e3b12)', fontWeight: 600 }}>
                          Chef Missy's Note
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#4a4338', lineHeight: 1.45, margin: 0 }}>
                        {selectedVisit.chefNotes}
                      </p>
                    </div>
                  )}

                  {/* Box Order Summary Card */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #ece7de)',
                      overflow: 'hidden',
                      boxShadow: 'none',
                    }}
                  >
                    {/* Header Bar in Dark Olive */}
                    <div
                      style={{
                        backgroundColor: 'var(--color-primary, #2e3b12)',
                        color: '#ffffff',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FileText size={15} color="#ffffff" />
                      <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>
                        Box Order Summary
                      </h4>
                    </div>

                    {/* Summary Body */}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      {/* Total Dishes */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                          <Utensils size={13} color="#716c62" />
                          <span>Total Dishes</span>
                        </div>
                        <strong style={{ fontSize: '0.82rem', color: '#1a1814' }}>
                          {selectedVisit.dishes?.length || 0}
                        </strong>
                      </div>

                      {/* Box Portions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                          <Package size={13} color="#716c62" />
                          <span>Box Portions</span>
                        </div>
                        <strong style={{ fontSize: '0.82rem', color: '#1a1814' }}>
                          {selectedVisit.guests || 2}
                        </strong>
                      </div>

                      {/* Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: selectedVisit.status === 'confirmed' ? '#059669' : '#d97706',
                            }}
                          />
                          <span>Status</span>
                        </div>
                        {getStatusBadge(selectedVisit.status)}
                      </div>

                      {/* Delivery / Pickup Window */}
                      {selectedVisit.arrivalWindow && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                            <Clock size={13} color="#716c62" />
                            <span>Delivery / Pickup Window</span>
                          </div>
                          <strong style={{ fontSize: '0.74rem', color: '#1a1814' }}>
                            {formatArrivalWindow(selectedVisit.arrivalWindow)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3 Stacked Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* 1. Re-pack This Box (Primary Dark Olive) */}
                    <button
                      type="button"
                      onClick={() => useMenuAgain(selectedVisit)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-primary, #2e3b12)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: 'none',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <RotateCcw size={14} />
                      <span>Re-pack This Box</span>
                    </button>

                    {/* 2. View Full Box Details (White Card Button) */}
                    <Link to={`/visits/${selectedVisit._id}`} style={{ textDecoration: 'none' }}>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          color: '#1a1814',
                          border: '1px solid var(--color-border, #ece7de)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: 'none',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf8f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <Eye size={14} color="var(--color-primary, #2e3b12)" />
                        <span>View Full Box Details</span>
                      </button>
                    </Link>

                    {/* 3. Pack a New Box (White Card Button) */}
                    <Link to="/cart" style={{ textDecoration: 'none' }}>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          color: '#1a1814',
                          border: '1px solid var(--color-border, #ece7de)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: 'none',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf8f4')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <Package size={14} color="var(--color-primary, #2e3b12)" />
                        <span>Pack a New Box</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
