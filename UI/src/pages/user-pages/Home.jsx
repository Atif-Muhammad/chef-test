import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/shared/api';
import {
  HeartIcon,
  CheckCircleIcon,
  WarningIcon,
  HerbIcon,
  UtensilsIcon,
  CalendarIcon,
  UsersIcon,
  ChefHatIcon,
  ClipboardIcon,
} from '../../components/shared/Icons';
import { Clock, UtensilsCrossed } from 'lucide-react';
import { formatArrivalWindow } from '../../utils/formatters';
import { HomeSkeleton } from '../../components/skeletons';

export default function Home() {
  const { user, cart, addToCart } = useAuth();
  const navigate = useNavigate();

  const [allVisits, setAllVisits] = useState([]);
  const [upcomingVisit, setUpcomingVisit] = useState(null);
  const [pastVisits, setPastVisits] = useState([]);
  const [favourites, setFavourites] = useState(new Set());
  const [favouriteDishes, setFavouriteDishes] = useState([]);
  const [animatingFavId, setAnimatingFavId] = useState(null);
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
        setAllVisits(list);

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
        const past = list.filter((v) => {
          if (v.status === 'completed') return true;
          if (v.status === 'cancelled') return false;
          const vDate = parseDateSafe(v.visitDate);
          return vDate < todayStart;
        });

        // Sort upcoming ascending (nearest visit date first)
        upcoming.sort((a, b) => parseDateSafe(a.visitDate) - parseDateSafe(b.visitDate));
        // Sort past descending (most recent past visit first)
        past.sort((a, b) => parseDateSafe(b.visitDate) - parseDateSafe(a.visitDate));

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
        setPastVisits(past.slice(0, 3));
      } catch (e) {
        console.error('Failed to load visit history', e);
      }

      // 2. Fetch favourites
      try {
        const favRes = await api.get('/favourites');
        const favs = favRes.data?.favourites || [];
        setFavouriteDishes(favs);
        setFavourites(new Set(favs.map((f) => f._id)));
      } catch (e) {
        console.error('Failed to load favourites', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (dishId) => {
    const next = new Set(favourites);
    const exists = next.has(dishId);
    if (exists) next.delete(dishId);
    else next.add(dishId);
    setFavourites(next);

    setAnimatingFavId(dishId);
    setTimeout(() => {
      setAnimatingFavId((prev) => (prev === dishId ? null : prev));
    }, 450);

    try {
      if (exists) {
        await api.delete(`/favourites/${dishId}`);
        setFavouriteDishes((prev) => prev.filter((d) => d._id !== dishId));
      } else {
        await api.post(`/favourites/${dishId}`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error('Failed to toggle favourite', e);
    }
  };

  // Re-order entire menu from a past visit in one click
  const handleReorderPastVisit = (visit) => {
    if (!visit.dishes || visit.dishes.length === 0) return;
    visit.dishes.forEach((d) => {
      const dishObj = d.dishId && typeof d.dishId === 'object' ? d.dishId : null;
      if (dishObj) addToCart(dishObj);
    });
    navigate('/cart');
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

  const isDishInCart = (dishId) => cart?.dishes?.some((d) => d._id === dishId);
  const visitDateInfo = upcomingVisit ? getVisitDateInfo(upcomingVisit.visitDate) : null;

  if (loading) return <HomeSkeleton />;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. First-Time Concierge Guide (Dismissible) */}
      {showOnboarding && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-lg, 14px)',
            border: '1px solid #ebdccb',
            boxShadow: 'var(--shadow-card)',
            padding: '20px 24px',
            marginBottom: '20px',
            position: 'relative',
            background: 'linear-gradient(135deg, #ffffff 0%, #faf6f0 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--color-accent, #c49e5d)',
                }}
              >
                Welcome to Private Chef Missy
              </span>
              <h2 style={{ fontSize: '1.25rem', color: '#1a1814', marginTop: '2px', fontWeight: 600 }}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
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
              <h4 style={{ fontSize: '0.86rem', color: '#1a1814', marginBottom: '4px', fontWeight: 600 }}>Curate Your Menu</h4>
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
                Pick your preferred cooking day, guest numbers, and note family allergies. Deadlines lock 48h prior.
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
              <h4 style={{ fontSize: '0.86rem', color: '#1a1814', marginBottom: '4px', fontWeight: 600 }}>Chef Missy Cooks</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                Missy sources fresh ingredients, arrives at your home, cooks, labels dishes, and leaves your kitchen spotless.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Banner: Full Salmon Image Cover Welcome Banner with link to Dishes Catalog */}
      <div
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(235, 220, 203, 0.5)',
          backgroundImage: `linear-gradient(135deg, rgba(20, 26, 12, 0.92) 0%, rgba(20, 26, 12, 0.80) 45%, rgba(20, 26, 12, 0.40) 100%), url("/assets/auth-hero-salmon.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          padding: '36px 36px',
          minHeight: '210px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
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
          Private Dining &bull; Bespoke Meal Prep
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
          Curate your bespoke weekly dishes. Chef Missy handles the ingredient sourcing, in-home culinary preparation, and complete kitchen cleanup.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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

          <Link to="/history" style={{ textDecoration: 'none' }}>
            <button
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--border-radius-full, 999px)',
                padding: '10px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>View Dining Schedule</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 3. Quick Overview KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        {/* Next Dining Session */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ece7de',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#f1f6ec',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={20} color="var(--color-primary)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: '0.70rem', color: '#716c62', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Next Appointment
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1b16', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {upcomingVisit ? (
                <>
                  {visitDateInfo?.relativeLabel && (
                    <span style={{ color: 'var(--color-primary)', marginRight: '6px' }}>
                      [{visitDateInfo.relativeLabel}]
                    </span>
                  )}
                  {visitDateInfo?.full}
                </>
              ) : (
                'No Visit Scheduled'
              )}
            </div>
            {upcomingVisit && (
              <span
                style={{
                  fontSize: '0.68rem',
                  color:
                    upcomingVisit.status === 'confirmed'
                      ? '#065f46'
                      : upcomingVisit.status === 'ready'
                      ? '#6d28d9'
                      : '#b45309',
                  fontWeight: 600,
                }}
              >
                {upcomingVisit.status === 'confirmed'
                  ? `Confirmed ${upcomingVisit.arrivalWindow ? `(${formatArrivalWindow(upcomingVisit.arrivalWindow)})` : ''}`
                  : upcomingVisit.status === 'ready'
                  ? `Ingredients Ready ${upcomingVisit.arrivalWindow ? `(${formatArrivalWindow(upcomingVisit.arrivalWindow)})` : ''}`
                  : 'Pending Chef Review'}
              </span>
            )}
          </div>
        </div>

        {/* Lifetime Visits */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ece7de',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#faf6eb',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            {allVisits.length}
          </div>
          <div>
            <span style={{ fontSize: '0.70rem', color: '#716c62', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Curated Dinners
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1b16', marginTop: '2px' }}>
              {allVisits.length} {allVisits.length === 1 ? 'Visit' : 'Visits'} Recorded
            </div>
            <Link to="/history" style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View History &rarr;
            </Link>
          </div>
        </div>

        {/* Family Favourites */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ece7de',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartIcon filled={true} size={20} color="#dc2626" />
          </div>
          <div>
            <span style={{ fontSize: '0.70rem', color: '#716c62', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Family Favourites
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1b16', marginTop: '2px' }}>
              {favouriteDishes.length} Saved {favouriteDishes.length === 1 ? 'Dish' : 'Dishes'}
            </div>
            <Link to="/favourites" style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Manage Favourites &rarr;
            </Link>
          </div>
        </div>

        {/* Dietary Safeguard */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #ece7de',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircleIcon size={20} color="#15803d" />
          </div>
          <div>
            <span style={{ fontSize: '0.70rem', color: '#716c62', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dietary Safeguard
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1b16', marginTop: '2px' }}>
              {user?.allergies?.length > 0 ? `${user.allergies.length} Allergens Guarded` : 'Allergies Protected'}
            </div>
            <Link to="/profile" style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Household Profile &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Main Executive Boards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '22px' }}>
        {/* Left Column: Upcoming Dining Session & Past Dining History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* UPCOMING DINING APPOINTMENT HUB BOARD */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #ece7de',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UtensilsCrossed size={18} color="var(--color-primary, #2e3b12)" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                    Your Upcoming Dining Session
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                    Chef Missy will prepare this curated meal in your kitchen.
                  </span>
                </div>
              </div>

              {upcomingVisit && (
                <Link to={`/visits/${upcomingVisit._id}`} style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  View Full Details &rarr;
                </Link>
              )}
            </div>

            {upcomingVisit ? (
              <div>
                {/* Visit Summary Card Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: '#fbf9f5',
                    padding: '16px 18px',
                    borderRadius: '8px',
                    border: '1px solid #ece7de',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Calendar Date Block */}
                  <div
                    style={{
                      width: '58px',
                      height: '60px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #ebdccb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#8c7b68' }}>{visitDateInfo?.month}</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{visitDateInfo?.day}</span>
                    {visitDateInfo?.relativeLabel && (
                      <span
                        style={{
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          textTransform: 'uppercase',
                          marginTop: '1px',
                        }}
                      >
                        {visitDateInfo.relativeLabel}
                      </span>
                    )}
                  </div>

                  {/* Visit Details */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.94rem', color: '#1a1814' }}>{visitDateInfo?.full}</strong>
                      {(() => {
                        const statusBadge = getVisitStatusBadge(upcomingVisit.status);
                        return (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 'var(--border-radius-full)',
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.color,
                              border: `1px solid ${statusBadge.border}`,
                            }}
                          >
                            {statusBadge.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#655e53', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>
                        {upcomingVisit.guests || 2} Guests
                        {upcomingVisit.adults || upcomingVisit.children ? (
                          <span style={{ fontWeight: 400, color: '#8c857b' }}>
                            {' '}
                            ({upcomingVisit.adults || 2} Adults{upcomingVisit.children ? `, ${upcomingVisit.children} Kids` : ''})
                          </span>
                        ) : null}
                      </span>
                      <span>&bull;</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Arrival: {formatArrivalWindow(upcomingVisit.arrivalWindow)}
                      </span>
                      <span>&bull;</span>
                      <span>{user?.location || 'Residence Kitchen'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section: Chef Notes & Client Requests */}
                {(upcomingVisit.chefNotes || upcomingVisit.specialRequests || upcomingVisit.notes) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {upcomingVisit.chefNotes && (
                      <div
                        style={{
                          backgroundColor: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '0.78rem',
                          color: '#854d0e',
                          lineHeight: 1.45,
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
                          padding: '10px 14px',
                          fontSize: '0.78rem',
                          color: '#57534e',
                          lineHeight: 1.45,
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
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2e3b12', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Selected Menu ({upcomingVisit.dishes?.length || 0} {upcomingVisit.dishes?.length === 1 ? 'Dish' : 'Dishes'})
                    </span>
                    <Link to="/catalogue" style={{ fontSize: '0.72rem', color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      Browse Menu Catalog
                    </Link>
                  </div>

                  {upcomingVisit.dishes && upcomingVisit.dishes.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                      {upcomingVisit.dishes.map((item, idx) => {
                        const dish = item.dishId && typeof item.dishId === 'object' ? item.dishId : null;
                        const dishName = dish?.name || `Dish #${idx + 1}`;
                        const dishImg = dish?.photoUrl || '/assets/dishes/lemon-herb-salmon.png';
                        const dishCourse = dish?.type || item.course || 'Main Course';

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #ede8df',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            }}
                          >
                            <img
                              src={dishImg}
                              alt={dishName}
                              style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
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
                                }}
                                title={dishName}
                              >
                                {dishName}
                              </h5>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    fontSize: '0.64rem',
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
                                      fontSize: '0.60rem',
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
                                <p style={{ fontSize: '0.66rem', color: '#8c7b68', fontStyle: 'italic', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: '0.80rem', color: '#92400e', margin: '0 0 10px', fontWeight: 500 }}>
                        No dishes selected yet for this scheduled appointment date.
                      </p>
                      <Link to="/catalogue">
                        <button
                          style={{
                            padding: '7px 16px',
                            borderRadius: 'var(--border-radius-full)',
                            backgroundColor: 'var(--color-primary)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.76rem',
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

                {/* 4-Step Dining Preparation Journey Progress Bar */}
                <div
                  style={{
                    backgroundColor: '#fbf9f5',
                    borderRadius: '8px',
                    border: '1px solid #ece7de',
                    padding: '12px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#716c62', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                    Dining Prep Journey
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { step: '1. Menu Curated', active: Boolean(upcomingVisit.dishes?.length) },
                      { step: '2. Confirmed Date', active: ['confirmed', 'ready', 'completed'].includes(upcomingVisit.status) },
                      { step: '3. Grocery Sourcing', active: ['ready', 'completed'].includes(upcomingVisit.status) || Boolean(upcomingVisit.shoppingListShared) },
                      { step: '4. In-Home Cooking', active: upcomingVisit.status === 'completed' || Boolean(visitDateInfo?.isToday) },
                    ].map((st, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            height: '4px',
                            borderRadius: '2px',
                            backgroundColor: st.active ? 'var(--color-primary)' : '#e7e2d8',
                            marginBottom: '4px',
                          }}
                        />
                        <span style={{ fontSize: '0.64rem', color: st.active ? 'var(--color-primary)' : '#8c857b', fontWeight: st.active ? 700 : 500 }}>
                          {st.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Stack */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to={`/visits/${upcomingVisit._id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <button
                      style={{
                        width: '100%',
                        height: '36px',
                        borderRadius: 'var(--border-radius-full)',
                        backgroundColor: 'var(--color-primary)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(46, 59, 18, 0.2)',
                      }}
                    >
                      <span>View Full Visit Dossier</span>
                      <span>&rarr;</span>
                    </button>
                  </Link>

                  <Link to="/catalogue" style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        height: '36px',
                        padding: '0 16px',
                        borderRadius: 'var(--border-radius-full)',
                        backgroundColor: '#ffffff',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
                  No Upcoming Dining Session
                </h4>
                <p style={{ fontSize: '0.80rem', color: 'var(--color-text-muted)', margin: '0 0 16px', maxWidth: '380px', marginInline: 'auto', lineHeight: 1.45 }}>
                  Chef Missy is ready to prepare your next personal dining experience. Select your preferred dishes and reserve your preferred cooking day.
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
                    Schedule Next Visit &rarr;
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* PAST DINING EXPERIENCES & 1-CLICK REORDER MEMORY BOARD */}
          {pastVisits.length > 0 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #ece7de',
                padding: '22px 24px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardIcon size={16} color="var(--color-primary, #2e3b12)" />
                  <h3 style={{ fontSize: '1.02rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                    Recent Dining Experiences
                  </h3>
                </div>
                <Link to="/history" style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  View All History &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pastVisits.map((pv) => {
                  const dateInfo = getVisitDateInfo(pv.visitDate);
                  const dishNames = (pv.dishes || [])
                    .map((d) => (d.dishId && typeof d.dishId === 'object' ? d.dishId.name : ''))
                    .filter(Boolean);

                  return (
                    <div
                      key={pv._id}
                      style={{
                        backgroundColor: '#fbf9f5',
                        borderRadius: '8px',
                        border: '1px solid #ece7de',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.84rem', color: '#1e1b16' }}>{dateInfo?.full}</strong>
                          <span style={{ fontSize: '0.66rem', color: '#716c62', backgroundColor: '#f0ece1', padding: '1px 6px', borderRadius: '3px' }}>
                            {pv.guests} Guests
                          </span>
                        </div>
                        {dishNames.length > 0 && (
                          <div style={{ fontSize: '0.74rem', color: '#655e53', marginTop: '3px', lineHeight: 1.35 }}>
                            {dishNames.join(' &bull; ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {pv.dishes && pv.dishes.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReorderPastVisit(pv)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '4px',
                              backgroundColor: '#2e3b12',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Re-order Menu
                          </button>
                        )}
                        <Link to={`/visits/${pv._id}`}>
                          <button
                            type="button"
                            style={{
                              padding: '5px 10px',
                              borderRadius: '4px',
                              backgroundColor: '#ffffff',
                              color: '#4a463e',
                              border: '1px solid #dcd5ca',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Family Favourites & Household Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* YOUR FAMILY FAVOURITES BOARD */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #ece7de',
              padding: '22px 20px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartIcon filled={true} size={18} color="#dc2626" />
                <h3 style={{ fontSize: '1.02rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                  Your Family Favourites
                </h3>
              </div>
              <Link to="/favourites" style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                View All ({favouriteDishes.length}) &rarr;
              </Link>
            </div>

            {favouriteDishes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favouriteDishes.slice(0, 4).map((fav) => {
                  const favId = fav._id || fav.id;
                  const inCart = isDishInCart(favId);

                  return (
                    <div
                      key={favId}
                      style={{
                        backgroundColor: '#fbf9f5',
                        borderRadius: '8px',
                        border: '1px solid #ece7de',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'box-shadow 0.15s ease',
                      }}
                    >
                      <Link to={`/dishes/${favId}`} style={{ flexShrink: 0 }}>
                        <img
                          src={fav.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                          alt={fav.name}
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                          }}
                        />
                      </Link>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/dishes/${favId}`} style={{ textDecoration: 'none' }}>
                          <h4
                            style={{
                              fontSize: '0.82rem',
                              color: '#1a1814',
                              margin: 0,
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {fav.name}
                          </h4>
                        </Link>

                        <div style={{ display: 'flex', gap: '4px', margin: '3px 0 6px', flexWrap: 'wrap' }}>
                          {fav.type && (
                            <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: '#ede8df', color: '#4a463e' }}>
                              {fav.type}
                            </span>
                          )}
                          {fav.dietary && (
                            <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: '#eef6ec', color: '#15803d' }}>
                              {fav.dietary}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => addToCart(fav)}
                            style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--border-radius-full)',
                              backgroundColor: inCart ? '#ecfdf5' : '#2e3b12',
                              color: inCart ? '#065f46' : '#ffffff',
                              border: inCart ? '1px solid #a7f3d0' : 'none',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {inCart ? '✓ In Selection' : '+ Add to Selection'}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleFav(favId)}
                            title="Remove favourite"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <HeartIcon
                              filled={true}
                              animating={animatingFavId === favId}
                              size={14}
                              color="#dc2626"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link to="/catalogue" style={{ textAlign: 'center', marginTop: '4px' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      border: '1px dashed #dcd5ca',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    + Browse Catalogue to Save More Favourites
                  </button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  backgroundColor: '#fbf9f5',
                  borderRadius: '8px',
                  border: '1px dashed #dcd5ca',
                }}
              >
                <div style={{ marginBottom: '6px' }}>
                  <HeartIcon size={24} filled={false} color="#9ca3af" />
                </div>
                <h4 style={{ fontSize: '0.86rem', color: '#1a1814', margin: '0 0 4px', fontWeight: 600 }}>
                  No Saved Favourites Yet
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: '0 0 14px', lineHeight: 1.4 }}>
                  While browsing dishes, tap the heart icon on any meal your family loves to build your fast re-ordering board.
                </p>
                <Link to="/catalogue">
                  <button
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--border-radius-full)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Explore Menu &rarr;
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* HOUSEHOLD CULINARY DOSSIER SNAPSHOT */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #ece7de',
              padding: '20px 20px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UsersIcon size={16} color="var(--color-primary, #2e3b12)" />
                <h3 style={{ fontSize: '0.94rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                  Household Dossier
                </h3>
              </div>
              <Link to="/profile" style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Edit &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f6f3eb' }}>
                <span style={{ color: '#716c62' }}>Household Size:</span>
                <strong style={{ color: '#1e1b16' }}>
                  {user?.adultsCount || 2} Adults{user?.childrenCount ? `, ${user.childrenCount} Children` : ''}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f6f3eb' }}>
                <span style={{ color: '#716c62' }}>Kitchen Location:</span>
                <strong style={{ color: '#1e1b16', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.location || 'Client Residence'}
                </strong>
              </div>

              <div style={{ padding: '6px 0' }}>
                <span style={{ color: '#716c62', display: 'block', marginBottom: '4px' }}>Allergen Safeguards:</span>
                {user?.allergies && user.allergies.length > 0 ? (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {user.allergies.map((alg, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          fontWeight: 600,
                        }}
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.72rem' }}>
                    No food allergies recorded
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
