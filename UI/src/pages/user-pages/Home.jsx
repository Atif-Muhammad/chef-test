import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/shared/api';
import {
  WarningIcon,
  HerbIcon,
  UtensilsIcon,
  CalendarIcon,
  ChefHatIcon,
} from '../../components/shared/Icons';
import { UtensilsCrossed } from 'lucide-react';
import { formatArrivalWindow } from '../../utils/formatters';
import { HomeSkeleton } from '../../components/skeletons';

export default function Home() {
  const { user } = useAuth();

  const [upcomingVisit, setUpcomingVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Concierge onboarding banner dismissal state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('pcm_dismiss_onboarding') !== 'true';
    } catch {
      return true;
    }
  });

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem('pcm_dismiss_onboarding', 'true');
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch visits history
      try {
        const visitRes = await api.get('/visits/history');
        const list = visitRes.data?.visits || [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Parse date helper without timezone day-shift
        const parseDateSafe = (dStr) => {
          if (!dStr) return new Date();
          if (typeof dStr === 'string' && dStr.includes('-')) {
            const parts = dStr.split('T')[0].split('-').map(Number);
            if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
              return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
            }
          }
          return new Date(dStr);
        };

        // Upcoming visits: today or future, not cancelled, not completed
        const upcoming = list.filter((v) => {
          if (v.status === 'cancelled' || v.status === 'completed') return false;
          const vDate = parseDateSafe(v.visitDate);
          return vDate >= todayStart;
        });

        // Past visits: earlier than today, or completed
        // Sort upcoming ascending (nearest visit date first)
        upcoming.sort((a, b) => parseDateSafe(a.visitDate) - parseDateSafe(b.visitDate));

        // Nearest upcoming visit; fallback to any active pending/confirmed visit
        let nextVisit = upcoming[0] || list.find((v) => v.status === 'pending' || v.status === 'confirmed' || v.status === 'ready') || null;

        // Fetch full populated visit details for nextVisit to guarantee 100% complete data
        if (nextVisit?._id) {
          try {
            const detailRes = await api.get(`/visits/${nextVisit._id}`);
            if (detailRes.data?.visit) {
              nextVisit = detailRes.data.visit;
            }
          } catch {
            // Keep nextVisit from list
          }
        }

        setUpcomingVisit(nextVisit);
      } catch (e) {
        console.error('Failed to load visit history', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format visit date helpers with timezone preservation & relative day
  const getVisitDateInfo = (dateString) => {
    if (!dateString) return null;
    let year, monthIdx, dayNum;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const parts = dateString.split('T')[0].split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        year = parts[0];
        monthIdx = parts[1] - 1;
        dayNum = parts[2];
      }
    }
    const d = year !== undefined ? new Date(year, monthIdx, dayNum) : new Date(dateString);
    if (isNaN(d.getTime())) return null;

    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const full = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Calculate relative day indicator
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    let relativeLabel = '';
    if (diffDays === 0) relativeLabel = 'Today';
    else if (diffDays === 1) relativeLabel = 'Tomorrow';
    else if (diffDays > 1 && diffDays <= 7) relativeLabel = `In ${diffDays} days`;

    return { month, day, weekday, full, relativeLabel, isToday: diffDays === 0 };
  };

  const getVisitStatusBadge = (status) => {
    const map = {
      confirmed: {
        bg: '#ecfdf5',
        color: '#065f46',
        border: '#a7f3d0',
        label: 'Confirmed',
      },
      ready: {
        bg: '#f5f3ff',
        color: '#6d28d9',
        border: '#ddd6fe',
        label: 'Ingredients Ready',
      },
      pending: {
        bg: '#fffbeb',
        color: '#b45309',
        border: '#fde68a',
        label: 'Pending Chef Review',
      },
      completed: {
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
        label: 'Completed',
      },
      cancelled: {
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fecaca',
        label: 'Cancelled',
      },
    };
    return map[status] || map.pending;
  };

  const visitDateInfo = upcomingVisit ? getVisitDateInfo(upcomingVisit.visitDate) : null;

  if (loading) return <HomeSkeleton />;

  return (
    <div className="user-page-container">
      {/* 1. First-Time Concierge Guide (Dismissible) */}
      {showOnboarding && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-lg, 14px)',
            border: '1px solid #ebdccb',
            boxShadow: 'var(--shadow-card)',
            padding: '16px 18px',
            marginBottom: '18px',
            position: 'relative',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf6f0 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--color-accent, #c49e5d)',
                }}
              >
                Welcome to Private Chef Missy
              </span>
              <h2 style={{ fontSize: '1.15rem', color: '#1a1814', marginTop: '2px', fontWeight: 600 }}>
                How Your Personal Meal Prep Experience Works
              </h2>
            </div>

            <button
              onClick={dismissOnboarding}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Dismiss onboarding banner"
            >
              <span>Got it</span>
              <span style={{ fontSize: '0.9rem' }}>&times;</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f0eee8' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  marginBottom: '8px',
                }}
              >
                1
              </div>
              <h4 style={{ fontSize: '0.86rem', color: '#1a1814', marginBottom: '4px', fontWeight: 600 }}>Plan Your Menu</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                Explore chef-crafted seasonal specialties, salads, and kid-friendly favourites tailored to your tastes.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f0eee8' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  marginBottom: '8px',
                }}
              >
                2
              </div>
              <h4 style={{ fontSize: '0.86rem', color: '#1a1814', marginBottom: '4px', fontWeight: 600 }}>Reserve Your Date</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                Pick your preferred preparation date, portions, and note family allergies. Deadlines lock 48h prior.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f0eee8' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f6ec',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  marginBottom: '8px',
                }}
              >
                3
              </div>
              <h4 style={{ fontSize: '0.86rem', color: '#1a1814', marginBottom: '4px', fontWeight: 600 }}>Prepared Fresh by Chef Missy</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                Chef Missy sources fresh ingredients and prepares your selected meals from scratch, thoughtfully portioned and packaged for your family.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Banner: Full Salmon Image Cover Welcome Banner with link to Dishes Catalog */}
      <div
        className="user-home-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(20, 26, 12, 0.92) 0%, rgba(20, 26, 12, 0.80) 45%, rgba(20, 26, 12, 0.40) 100%), url("/assets/auth-hero-salmon.jpg")`,
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            color: '#e2b874',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '6px',
          }}
        >
          Fresh Meal Prep &bull; Private Chef Service
        </span>

        <h1
          style={{
            fontSize: '1.95rem',
            color: '#ffffff',
            lineHeight: 1.2,
            margin: '0 0 10px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Welcome back, {user?.name?.split(' ')[0] || 'Client'}!
        </h1>

        <p
          style={{
            fontSize: '0.86rem',
            color: 'rgba(255, 255, 255, 0.92)',
            marginBottom: '20px',
            maxWidth: '520px',
            lineHeight: 1.5,
          }}
        >
          Plan your menu. Chef Missy sources fresh ingredients and prepares wholesome meals tailored to your family.
        </p>

        <div className="user-home-hero-actions">
          <Link to="/catalogue" style={{ textDecoration: 'none' }}>
            <button
              style={{
                backgroundColor: '#2e3b12',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--border-radius-full, 999px)',
                padding: '10px 22px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Explore Seasonal Menu</span>
              <span>&rarr;</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Executive Boards Stack */}
      <div className="user-home-boards-grid">
        {/* UPCOMING COOKING VISIT HUB BOARD */}
        <div className="user-dashboard-card">
            <div className="user-upcoming-header">
              <div className="user-upcoming-title-group">
                <UtensilsCrossed size={18} color="var(--color-primary, #2e3b12)" className="user-upcoming-icon" />
                <div>
                  <h3 className="user-upcoming-heading">
                    Your Upcoming Menu
                  </h3>
                  <span className="user-upcoming-subtext">
                    Chef Missy will prepare this menu for your family.
                  </span>
                </div>
              </div>

              {upcomingVisit && (
                <Link to={`/visits/${upcomingVisit._id}`} className="user-upcoming-top-link">
                  View Details &rarr;
                </Link>
              )}
            </div>

            {upcomingVisit ? (
              <div>
                {/* Visit Summary Card Header */}
                <div className="user-upcoming-date-card">
                  {/* Calendar Date Block */}
                  <div className="user-upcoming-calendar-block">
                    <span className="cal-month">{visitDateInfo?.month}</span>
                    <span className="cal-day">{visitDateInfo?.day}</span>
                    {visitDateInfo?.relativeLabel && (
                      <span className="cal-rel">{visitDateInfo.relativeLabel}</span>
                    )}
                  </div>

                  {/* Visit Details */}
                  <div className="user-upcoming-date-info">
                    <div className="user-upcoming-date-row">
                      <strong className="user-upcoming-date-title">{visitDateInfo?.full}</strong>
                      {(() => {
                        const statusBadge = getVisitStatusBadge(upcomingVisit.status);
                        return (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 600,
                              padding: '1px 7px',
                              borderRadius: 'var(--border-radius-full)',
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.color,
                              border: `1px solid ${statusBadge.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {statusBadge.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="user-upcoming-meta-row">
                      <span style={{ fontWeight: 600 }}>
                        {upcomingVisit.guests || 2} Guests
                        {upcomingVisit.adults || upcomingVisit.children ? (
                          <span style={{ fontWeight: 400, color: '#8c857b' }}>
                            {' '}({upcomingVisit.adults || 2} Adults{upcomingVisit.children ? `, ${upcomingVisit.children} Kids` : ''})
                          </span>
                        ) : null}
                      </span>
                      <span>&bull;</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Window: {upcomingVisit.arrivalWindow?.toLowerCase().includes('afternoon') ? 'Afternoon' : 'Morning'}
                        {/\d/.test(upcomingVisit.arrivalWindow || '') && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #524d43)', marginLeft: '4px' }}>
                            ({formatArrivalWindow(upcomingVisit.arrivalWindow)})
                          </span>
                        )}
                      </span>
                      {user?.location && (
                        <>
                          <span>&bull;</span>
                          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Section: Chef Notes & Client Requests */}
                {(upcomingVisit.chefNotes || upcomingVisit.specialRequests || upcomingVisit.notes) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {upcomingVisit.chefNotes && (
                      <div
                        style={{
                          backgroundColor: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.74rem',
                          color: '#854d0e',
                          lineHeight: 1.4,
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <strong style={{ flexShrink: 0 }}>Chef Missy:</strong>
                        <span>"{upcomingVisit.chefNotes}"</span>
                      </div>
                    )}
                    {(upcomingVisit.specialRequests || upcomingVisit.notes) && (
                      <div
                        style={{
                          backgroundColor: '#fcfbf8',
                          border: '1px solid #ede8df',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.74rem',
                          color: '#57534e',
                          lineHeight: 1.4,
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <strong style={{ color: '#2e3b12', flexShrink: 0 }}>Special Requests:</strong>
                        <span>{upcomingVisit.specialRequests || upcomingVisit.notes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dishes Selected for this Visit */}
                <div style={{ marginBottom: '14px' }}>
                  <div className="user-upcoming-menu-header">
                    <span className="user-upcoming-menu-title">
                      Selected Menu ({upcomingVisit.dishes?.length || 0} {upcomingVisit.dishes?.length === 1 ? 'Dish' : 'Dishes'})
                    </span>
                    <Link to="/catalogue" className="user-upcoming-menu-link">
                      Browse Catalog &rarr;
                    </Link>
                  </div>

                  {upcomingVisit.dishes && upcomingVisit.dishes.length > 0 ? (
                    <div className="user-upcoming-dish-grid">
                      {upcomingVisit.dishes.map((item, idx) => {
                        const dish = item.dishId && typeof item.dishId === 'object' ? item.dishId : null;
                        const dishName = dish?.name || `Dish #${idx + 1}`;
                        const dishImg = dish?.photoUrl || '/assets/dishes/lemon-herb-salmon.png';
                        const dishCourse = dish?.type || item.course || 'Main Course';

                        return (
                          <div key={idx} className="user-upcoming-dish-card">
                            <img
                              src={dishImg}
                              alt={dishName}
                              onError={(e) => {
                                e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                              }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h5
                                style={{
                                  fontSize: '0.80rem',
                                  margin: 0,
                                  color: '#1e1b16',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.25,
                                }}
                                title={dishName}
                              >
                                {dishName}
                              </h5>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    backgroundColor: '#f6f3eb',
                                    color: '#57534e',
                                    textTransform: 'capitalize',
                                    display: 'inline-block',
                                    fontWeight: 500,
                                  }}
                                >
                                  {dishCourse}
                                </span>
                                {dish?.isTimeIntensive && (
                                  <span
                                    style={{
                                      fontSize: '0.58rem',
                                      padding: '1px 4px',
                                      borderRadius: '3px',
                                      backgroundColor: '#fffbeb',
                                      color: '#b45309',
                                      fontWeight: 600,
                                    }}
                                  >
                                    30+ min
                                  </span>
                                )}
                              </div>
                              {item.customNotes && (
                                <p style={{ fontSize: '0.64rem', color: '#8c7b68', fontStyle: 'italic', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  Note: {item.customNotes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: '0.78rem', color: '#92400e', margin: '0 0 10px', fontWeight: 500 }}>
                        No dishes selected yet for this scheduled appointment date.
                      </p>
                      <Link to="/catalogue">
                        <button
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--border-radius-full)',
                            backgroundColor: 'var(--color-primary)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Select Dishes Now &rarr;
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4-Step Preparation Journey Progress Bar */}
                <div className="user-upcoming-journey-card">
                  <span className="user-upcoming-journey-title">
                    Menu Prep Journey
                  </span>
                  <div className="user-upcoming-journey-track">
                    {[
                      { short: 'Planned', full: '1. Menu Planned', active: Boolean(upcomingVisit.dishes?.length) },
                      { short: 'Confirmed', full: '2. Confirmed Date', active: ['confirmed', 'ready', 'completed'].includes(upcomingVisit.status) },
                      { short: 'Sourcing', full: '3. Grocery Sourcing', active: ['ready', 'completed'].includes(upcomingVisit.status) || Boolean(upcomingVisit.shoppingListShared) },
                      { short: 'Ready', full: '4. Ready / Prepared', active: upcomingVisit.status === 'completed' || Boolean(visitDateInfo?.isToday) },
                    ].map((st, i) => (
                      <div key={i} className="user-upcoming-journey-node">
                        <div
                          className="user-upcoming-journey-bar"
                          style={{
                            backgroundColor: st.active ? 'var(--color-primary)' : '#e7e2d8',
                          }}
                        />
                        <span
                          className="user-upcoming-journey-label"
                          style={{
                            color: st.active ? 'var(--color-primary)' : '#8c857b',
                            fontWeight: st.active ? 700 : 500,
                          }}
                        >
                          <span className="user-journey-label-full">{st.full}</span>
                          <span className="user-journey-label-short">{i + 1}. {st.short}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Stack (Symmetrical & Clean) */}
                <div className="user-upcoming-actions">
                  <Link to={`/visits/${upcomingVisit._id}`}>
                    <button type="button" className="user-upcoming-btn-primary">
                      <span>View Menu Details</span>
                      <span>&rarr;</span>
                    </button>
                  </Link>

                  <Link to="/catalogue">
                    <button type="button" className="user-upcoming-btn-secondary">
                      Modify Selection
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px 20px',
                  backgroundColor: '#fbf9f5',
                  borderRadius: '8px',
                  border: '1px dashed #dcd5ca',
                }}
              >
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                  <ChefHatIcon size={32} color="#8c857b" />
                </div>
                <h4 style={{ fontSize: '0.96rem', color: '#1a1814', margin: '0 0 6px', fontWeight: 600 }}>
                  No Upcoming Menu Planned
                </h4>
                <p style={{ fontSize: '0.80rem', color: 'var(--color-text-muted)', margin: '0 0 16px', maxWidth: '380px', marginInline: 'auto', lineHeight: 1.45 }}>
                  Chef Missy is ready to prepare your next meals. Select your preferred dishes and choose your preparation date.
                </p>
                <Link to="/catalogue">
                  <button
                    style={{
                      padding: '9px 22px',
                      borderRadius: 'var(--border-radius-full)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Plan Your Menu &rarr;
                  </button>
                </Link>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
