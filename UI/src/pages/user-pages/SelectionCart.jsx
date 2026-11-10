import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Check,
  Eye,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Package,
  ArrowLeft,
  Search,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/shared/api';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import {
  formatLocalDate,
  toDateInputValue,
  formatArrivalWindow,
  convert24To12,
  parseTo24Time,
} from '../../utils/formatters';

export default function SelectionCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const visitIdParam = searchParams.get('visitId');
  const dateParam = searchParams.get('date');
  const { user, loading: authLoading, cart, addToCart, removeFromCart, updateCartDetails, clearCart } = useAuth();

  const todayStr = toDateInputValue(new Date()) || new Date().toISOString().split('T')[0];

  // Steps: 1: Pack Your Box, 2: Select Dishes, 3: Review Your Box, 4: Box Confirmed
  const [activeStep, setActiveStep] = useState(cart.visitDate ? 2 : 1);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [datePastError, setDatePastError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedVisit, setConfirmedVisit] = useState(null);

  // Appointment states
  const [linkedVisit, setLinkedVisit] = useState(null);
  const [isPartialVisit, setIsPartialVisit] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetchingDishes, setFetchingDishes] = useState(true);

  // Dish details dialog modal state
  const [viewingDish, setViewingDish] = useState(null);

  // Timeslot state (start & end time in 24h for pickers, formatted to 12h for user display)
  const [startTime, setStartTime] = useState(cart.startTime || '11:00');
  const [endTime, setEndTime] = useState(cart.endTime || '13:00');
  const [timeslotChosenByUser, setTimeslotChosenByUser] = useState(false);

  // Unauthenticated user redirect if deep link visitId or date is present
  useEffect(() => {
    if (!authLoading && !user && (visitIdParam || dateParam)) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    }
  }, [user, authLoading, visitIdParam, dateParam, location, navigate]);

  // Dynamic date-based appointment fetch and prefill
  const fetchVisitForDate = async (targetDate, fallbackVisitId = null) => {
    if (!targetDate) {
      setLinkedVisit(null);
      setIsPartialVisit(false);
      setDatePastError('');
      return;
    }

    // Block back dates
    if (targetDate < todayStr) {
      setDatePastError('This date is in the past. Back dates are blocked — please select an upcoming date.');
      setLinkedVisit(null);
      setIsPartialVisit(false);
      return;
    }

    setDatePastError('');
    try {
      setCheckingDate(true);
      let v = null;
      let partialFlag = false;

      // 1. Primary lookup by date
      const res = await api.get(`/visits/by-date?date=${targetDate}`);
      if (res.data?.visit) {
        v = res.data.visit;
        partialFlag = res.data.isPartial;
      } else if (fallbackVisitId) {
        // Fallback lookup by visitId if deep link provided
        const idRes = await api.get(`/visits/${fallbackVisitId}`);
        if (idRes.data?.visit) {
          v = idRes.data.visit;
          const hasDishes = Array.isArray(v.dishes) && v.dishes.length > 0;
          const hasWindow = Boolean(
            v.arrivalWindow &&
            !v.arrivalWindow.toLowerCase().includes('confirm') &&
            !v.arrivalWindow.toLowerCase().includes('tbd') &&
            v.arrivalWindow.trim().length > 0
          );
          partialFlag = !hasDishes || !hasWindow;
        }
      }

      if (v) {
        const vDateStr = v.visitDate ? toDateInputValue(v.visitDate) : targetDate;
        if (vDateStr < todayStr) {
          setDatePastError('This appointment is in the past and cannot be modified.');
          setLinkedVisit(null);
          setIsPartialVisit(false);
          return;
        }

        setLinkedVisit(v);
        setIsPartialVisit(partialFlag);

        const hasAdminWindow = Boolean(
          v.arrivalWindow &&
          !v.arrivalWindow.toLowerCase().includes('confirm') &&
          !v.arrivalWindow.toLowerCase().includes('tbd') &&
          v.arrivalWindow.trim().length > 0
        );

        let sTime = '11:00';
        let eTime = '13:00';
        if (hasAdminWindow) {
          const parts = v.arrivalWindow.split(/-|–/);
          if (parts.length >= 2) {
            sTime = parseTo24Time(parts[0], '11:00');
            eTime = parseTo24Time(parts[1], '13:00');
          }
          setTimeslotChosenByUser(true);
        } else {
          setTimeslotChosenByUser(false);
        }
        setStartTime(sTime);
        setEndTime(eTime);

        // Preload dishes if present in visit
        let visitDishes = [];
        if (Array.isArray(v.dishes) && v.dishes.length > 0) {
          visitDishes = v.dishes
            .map((item) => (typeof item.dishId === 'object' ? item.dishId : null))
            .filter(Boolean);
        }

        updateCartDetails({
          visitDate: vDateStr,
          startTime: sTime,
          endTime: eTime,
          arrivalWindow: hasAdminWindow ? v.arrivalWindow : '',
          guests: v.guests || (v.adults || 2) + (v.children || 0),
          adults: v.adults || 2,
          children: v.children || 0,
          childrenAges: v.childrenAges || '',
          notes: v.notes || v.specialRequests || '',
          dishes: visitDishes.length > 0 ? visitDishes : cart.dishes,
        });

        // Do not auto-advance to Step 2 on date selection; wait for user's manual Next button click
        if (partialFlag && (!hasAdminWindow || !vDateStr)) {
          setActiveStep(1);
        }
      } else {
        // No appointment on this date: clear prefilled linked visit & partial status
        setLinkedVisit(null);
        setIsPartialVisit(false);
        updateCartDetails({ visitDate: targetDate });
      }
    } catch (err) {
      console.error('Failed to load box for date:', err);
      setLinkedVisit(null);
      setIsPartialVisit(false);
    } finally {
      setCheckingDate(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    if (authLoading || !user) return;
    const initialDate = dateParam || cart.visitDate || '';
    if (initialDate || visitIdParam) {
      fetchVisitForDate(initialDate, visitIdParam);
    }
  }, [user, authLoading, dateParam, visitIdParam]);

  useEffect(() => {
    let mounted = true;
    const fetchCatalogue = async () => {
      try {
        setFetchingDishes(true);
        const [dishesRes, catRes] = await Promise.allSettled([
          api.get('/dishes'),
          api.get('/dishes/categories/all'),
        ]);

        if (mounted) {
          if (dishesRes.status === 'fulfilled') {
            setDishes(dishesRes.value.data?.dishes || []);
          } else {
            setDishes([]);
          }

          if (catRes.status === 'fulfilled' && catRes.value.data?.categories?.length > 0) {
            setCategories(catRes.value.data.categories);
          }
        }
      } catch (err) {
        if (mounted) setDishes([]);
      } finally {
        if (mounted) setFetchingDishes(false);
      }
    };

    fetchCatalogue();
    return () => {
      mounted = false;
    };
  }, []);

  const mainsCount = cart.dishes.filter((d) => (d.type || '').toLowerCase() === 'main').length;
  const timeIntensiveCount = cart.dishes.filter((d) => d.isTimeIntensive).length;

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesCat =
      activeCat === 'all' ||
      dish.type?.toLowerCase() === activeCat.toLowerCase() ||
      (dish.categoryId?._id || dish.categoryId) === activeCat;
    const matchesSearch =
      !search ||
      dish.name?.toLowerCase().includes(search.toLowerCase()) ||
      dish.description?.toLowerCase().includes(search.toLowerCase()) ||
      dish.cuisineTags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Allergen Conflict Analysis
  const clientAllergies = (user?.allergies || []).map((a) => a.toLowerCase().trim());

  const getDishConflict = (dish) => {
    if (!dish?.allergens || !clientAllergies.length) return null;
    const dishAllergens = dish.allergens.map((a) => a.toLowerCase().trim());
    const matched = dishAllergens.filter((a) => clientAllergies.includes(a));
    return matched.length > 0 ? matched : null;
  };

  const allergenConflicts = cart.dishes.reduce((acc, dish) => {
    const matched = getDishConflict(dish);
    if (matched) {
      acc.push({ dishId: dish._id, dishName: dish.name, conflicts: matched });
    }
    return acc;
  }, []);

  const handleTimeChange = (newStart, newEnd) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    setTimeslotChosenByUser(true);
    const windowStr = `${convert24To12(newStart)} - ${convert24To12(newEnd)}`;
    updateCartDetails({ startTime: newStart, endTime: newEnd, arrivalWindow: windowStr });
  };

  const hasValidAdminWindow = Boolean(
    linkedVisit?.arrivalWindow &&
    !linkedVisit.arrivalWindow.toLowerCase().includes('confirm') &&
    !linkedVisit.arrivalWindow.toLowerCase().includes('tbd') &&
    linkedVisit.arrivalWindow.trim().length > 0
  );

  // Missing fields determination: ONLY highlight if linkedVisit exists AND is partial
  const isDateMissing = Boolean(linkedVisit && isPartialVisit && !cart.visitDate);
  const isTimeslotMissing = Boolean(linkedVisit && isPartialVisit && !hasValidAdminWindow && !timeslotChosenByUser);
  const isDishesMissing = Boolean(linkedVisit && isPartialVisit && cart.dishes.length === 0);
  const hasMissingDetails = Boolean(linkedVisit && isPartialVisit && (isDateMissing || isTimeslotMissing || isDishesMissing));

  const handleConfirmReservation = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!cart.visitDate) {
      setError('Please set your box preparation/delivery date.');
      setActiveStep(1);
      return;
    }
    if (cart.visitDate < todayStr) {
      setError('Past dates cannot be selected for box preparation.');
      setActiveStep(1);
      return;
    }
    if (isTimeslotMissing) {
      setError('Please select a delivery / pickup timeslot for Chef Missy.');
      setActiveStep(1);
      return;
    }
    if (cart.dishes.length === 0) {
      setError('Please select at least one dish for your box.');
      setActiveStep(2);
      return;
    }
    if (mainsCount > 7) {
      setError('Maximum of 7 main courses allowed per box.');
      return;
    }
    if (timeIntensiveCount > 2) {
      setError('Maximum of 2 time-intensive dishes allowed per box.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formattedWindow =
        cart.arrivalWindow || (startTime && endTime ? `${convert24To12(startTime)} - ${convert24To12(endTime)}` : '11:00 AM - 1:00 PM');

      const payload = {
        visitId: linkedVisit?._id || visitIdParam || undefined,
        visitDate: cart.visitDate,
        arrivalWindow: formattedWindow,
        adults: cart.adults || 2,
        children: cart.children || 0,
        childrenAges: cart.childrenAges || '',
        guests: cart.guests || (cart.adults || 2) + (cart.children || 0),
        notes: cart.notes || '',
        dishes: cart.dishes.map((d) => ({ dishId: d._id, course: d.type || 'main' })),
      };
      const res = await api.post('/visits', payload);
      setConfirmedVisit(res.data.visit || { visitDate: cart.visitDate, arrivalWindow: formattedWindow, guests: cart.guests || 2 });
      clearCart();
      setActiveStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit your box order.');
    } finally {
      setLoading(false);
    }
  };

  const formattedTimeslotPreview =
    cart.arrivalWindow || (startTime && endTime ? `${convert24To12(startTime)} – ${convert24To12(endTime)}` : '11:00 AM – 1:00 PM');

  return (
    <div className="user-page-container">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Section / Step Transitions */
        @keyframes stepFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-transition {
          animation: stepFadeInUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Category Grid Transitions */
        @keyframes gridFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .course-grid-transition {
          animation: gridFadeIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Dish Card Hover & Selection Feedback */
        .dish-card-anim {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background-color 0.2s ease !important;
        }

        .dish-card-anim:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(46, 59, 18, 0.08) !important;
        }

        .dish-card-anim:active {
          transform: scale(0.985);
        }

        /* Pop animation for checkmark selection indicator */
        @keyframes checkmarkPopIn {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          70% {
            transform: scale(1.18);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pop-check {
          animation: checkmarkPopIn 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* Large Green Success Icon Bounce (Menu Submitted) */
        @keyframes successIconBounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.22);
            opacity: 1;
          }
          72% {
            transform: scale(0.92);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-success-bounce {
          animation: successIconBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* Stagger animation for the 5 Next Steps */
        @keyframes staggerStepSlide {
          0% {
            opacity: 0;
            transform: translateX(-12px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .stagger-step {
          animation: staggerStepSlide 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Side Cart Item Slide-in */
        @keyframes sideItemSlideIn {
          0% {
            opacity: 0;
            transform: translateX(14px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .side-cart-item {
          animation: sideItemSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Interactive Button Feel */
        .btn-anim {
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease !important;
        }

        .btn-anim:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(46, 59, 18, 0.14) !important;
        }

        .btn-anim:active:not(:disabled) {
          transform: scale(0.97);
        }

        /* Submitting pulse effect */
        @keyframes submitPulseAnim {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 59, 18, 0.35);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(46, 59, 18, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 59, 18, 0);
          }
        }

        .btn-submitting {
          animation: submitPulseAnim 1.4s infinite !important;
        }
      `}</style>
      {/* Back Link */}
      <div style={{ marginBottom: '10px' }}>
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

      {/* Pre-Scheduled Box Banner */}
      {linkedVisit && (
        hasMissingDetails ? (
          /* Amber Incomplete Details Alert Banner */
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #d97706',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertTriangle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>
                  Chef Missy Pre-Scheduled Box &bull; Missing Details Required
                </span>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    backgroundColor: '#fde68a',
                    color: '#78350f',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  Action Required
                </span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '0.74rem', color: '#78350f', lineHeight: 1.45 }}>
                Chef Missy initiated this meal box for you. The fields highlighted in <strong>amber</strong> below need to be completed before your box order can be confirmed.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {isDateMissing && (
                  <span
                    onClick={() => setActiveStep(1)}
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: '#92400e',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    ⚠ Box Date Missing (Step 1)
                  </span>
                )}
                {isTimeslotMissing && (
                  <span
                    onClick={() => setActiveStep(1)}
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: '#92400e',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    ⚠ Timeslot Missing (Step 1)
                  </span>
                )}
                {isDishesMissing && (
                  <span
                    onClick={() => {
                      if (cart.visitDate) setActiveStep(2);
                    }}
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: '#92400e',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                  >
                    ⚠ Dishes Missing ({cart.dishes.length}/7 packed &bull; Step 2)
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* All Details Present - Clean Green/Olive Banner */
          <div
            style={{
              backgroundColor: '#fbf9f5',
              border: '1px solid #d5cebf',
              borderRadius: '4px',
              padding: '10px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--color-primary, #2e3b12)" />
              <div>
                <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--color-primary, #2e3b12)' }}>
                  Chef Missy Pre-Scheduled Box
                </span>
                <p style={{ margin: 0, fontSize: '0.73rem', color: '#4a463e' }}>
                  Scheduled for{' '}
                  <strong>
                    {formatLocalDate(linkedVisit.visitDate, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                  {linkedVisit.arrivalWindow ? ` (${formatArrivalWindow(linkedVisit.arrivalWindow)})` : ''} •{' '}
                  <strong>{linkedVisit.guests || 2} Portions</strong>. Review or customize your box menu below.
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Page Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '1.45rem',
            color: 'var(--color-primary, #2e3b12)',
            margin: '0 0 3px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            letterSpacing: '-0.3px',
          }}
        >
          {activeStep === 1
            ? 'Pack Your Box'
            : activeStep === 2
            ? 'Select Dishes'
            : activeStep === 3
            ? 'Review Your Box'
            : 'Order Confirmation'}
        </h1>
        <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.78rem', margin: 0 }}>
          {activeStep === 1
            ? 'Set your preferred preparation date, timeslot, and box portions for Chef Missy.'
            : activeStep === 2
            ? 'Select fresh chef-crafted dishes to pack into your customized meal box.'
            : activeStep === 3
            ? 'Review your selected dishes, portion limits, and allergy safety alerts before confirming.'
            : 'Your menu selection has been successfully submitted to Chef Missy.'}
        </p>
      </div>

      {/* Stepper with Lucide Tick */}
      <div
        className="user-stepper-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '620px',
          margin: '0 auto 24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15px',
            left: '12%',
            right: '12%',
            height: '2px',
            backgroundColor: '#ece7de',
            zIndex: 1,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--color-primary, #2e3b12)',
              width: activeStep === 1 ? '0%' : activeStep === 2 ? '33%' : activeStep === 3 ? '66%' : '100%',
              transition: 'width 250ms ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
          {/* Step 1 */}
          <div
            className="user-stepper-item"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '25%' }}
            onClick={() => setActiveStep(1)}
          >
            <div
              className="user-stepper-circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: activeStep >= 1 ? '#2e3b12' : '#ffffff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.80rem',
                fontWeight: 700,
                border: '2px solid #2e3b12',
                boxShadow: 'none',
              }}
            >
              {activeStep > 1 ? <Check size={16} color="#ffffff" strokeWidth={3} /> : '1'}
            </div>
            <span
              className="user-stepper-label"
              style={{
                fontSize: '0.74rem',
                marginTop: '6px',
                fontWeight: activeStep === 1 ? 700 : 500,
                color: activeStep === 1 ? 'var(--color-primary, #2e3b12)' : '#4a463e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textAlign: 'center',
              }}
            >
              <span className="user-stepper-text-desktop">Pack Your Box</span>
              <span className="user-stepper-text-mobile">Pack Box</span>
              {(isDateMissing || isTimeslotMissing) && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#d97706',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                  title="Required details missing"
                />
              )}
            </span>
          </div>

          {/* Step 2 */}
          <div
            className="user-stepper-item"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '25%' }}
            onClick={() => {
              if (!cart.visitDate) {
                setError('Please select a box preparation/delivery date first.');
                return;
              }
              if (isTimeslotMissing) {
                setError('Please select a delivery / pickup timeslot first.');
                return;
              }
              setError('');
              setActiveStep(2);
            }}
          >
            <div
              className="user-stepper-circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: activeStep >= 2 ? '#2e3b12' : '#ffffff',
                color: activeStep >= 2 ? '#ffffff' : '#716c62',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.80rem',
                fontWeight: 700,
                border: `2px solid ${activeStep >= 2 ? '#2e3b12' : '#dcd5ca'}`,
                boxShadow: 'none',
              }}
            >
              {activeStep > 2 ? <Check size={16} color="#ffffff" strokeWidth={3} /> : '2'}
            </div>
            <span
              className="user-stepper-label"
              style={{
                fontSize: '0.74rem',
                marginTop: '6px',
                fontWeight: activeStep === 2 ? 700 : 500,
                color: activeStep === 2 ? 'var(--color-primary, #2e3b12)' : '#4a463e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textAlign: 'center',
              }}
            >
              <span className="user-stepper-text-desktop">Select Dishes</span>
              <span className="user-stepper-text-mobile">Dishes</span>
              {isDishesMissing && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#d97706',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                  title="Dishes required"
                />
              )}
            </span>
          </div>

          {/* Step 3 */}
          <div
            className="user-stepper-item"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '25%' }}
            onClick={() => {
              if (!cart.visitDate) {
                setError('Please select a box preparation/delivery date first.');
                return;
              }
              if (isTimeslotMissing) {
                setError('Please select a delivery / pickup timeslot first.');
                return;
              }
              if (cart.dishes.length === 0) {
                setError('Please select at least one dish for your box.');
                return;
              }
              setError('');
              setActiveStep(3);
            }}
          >
            <div
              className="user-stepper-circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: activeStep >= 3 ? '#2e3b12' : '#ffffff',
                color: activeStep >= 3 ? '#ffffff' : '#716c62',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.80rem',
                fontWeight: 700,
                border: `2px solid ${activeStep >= 3 ? '#2e3b12' : '#dcd5ca'}`,
                boxShadow: 'none',
              }}
            >
              {activeStep > 3 ? <Check size={16} color="#ffffff" strokeWidth={3} /> : '3'}
            </div>
            <span
              className="user-stepper-label"
              style={{
                fontSize: '0.74rem',
                marginTop: '6px',
                fontWeight: activeStep === 3 ? 700 : 500,
                color: activeStep === 3 ? 'var(--color-primary, #2e3b12)' : '#4a463e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <span className="user-stepper-text-desktop">Review Your Box</span>
              <span className="user-stepper-text-mobile">Review</span>
            </span>
          </div>

          {/* Step 4 */}
          <div
            className="user-stepper-item"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}
          >
            <div
              className="user-stepper-circle"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: activeStep === 4 ? '#2e3b12' : '#ffffff',
                color: activeStep === 4 ? '#ffffff' : '#716c62',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.80rem',
                fontWeight: 700,
                border: `2px solid ${activeStep === 4 ? '#2e3b12' : '#dcd5ca'}`,
                boxShadow: 'none',
              }}
            >
              {activeStep === 4 ? <Check size={16} color="#ffffff" strokeWidth={3} /> : '4'}
            </div>
            <span
              className="user-stepper-label"
              style={{
                fontSize: '0.74rem',
                marginTop: '6px',
                fontWeight: activeStep === 4 ? 700 : 500,
                color: activeStep === 4 ? 'var(--color-primary, #2e3b12)' : '#4a463e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <span className="user-stepper-text-desktop">Menu Submitted</span>
              <span className="user-stepper-text-mobile">Submitted</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '9px 12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '4px',
            marginBottom: '14px',
            fontSize: '0.76rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertTriangle size={14} color="#b91c1c" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 4: Menu Submitted / Confirmation Receipt */}
      {activeStep === 4 ? (
        <div
          key="step-4"
          className="step-transition"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '36px 30px',
            maxWidth: '520px',
            margin: '20px auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Top Green Check Icon */}
          <div
            className="animate-success-bounce"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2.5px solid #16a34a',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Check size={22} color="#16a34a" strokeWidth={3} />
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 8px',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              fontFamily: 'inherit',
            }}
          >
            Menu Submitted!
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '0.86rem',
              color: '#6b7280',
              margin: '0 0 20px',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            Your menu selection has been successfully submitted.
          </p>

          {/* Thin Light Divider */}
          <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '0 0 20px' }} />

          {/* Thank You Note */}
          <p
            style={{
              fontSize: '0.84rem',
              color: '#4b5563',
              lineHeight: 1.55,
              textAlign: 'center',
              margin: '0 0 24px',
            }}
          >
            Thank you for selecting your dishes! Chef Missy will personally review your menu and any special requests before confirming your selection.
          </p>

          {/* What Happens Next Section */}
          <h3
            style={{
              fontSize: '0.90rem',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 12px',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            What happens next?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {[
              {
                num: 1,
                en: 'Your menu and special requests will be reviewed.',
                jp: 'メニューと特別なリクエストを確認します。',
              },
              {
                num: 2,
                en: "We'll contact you if any adjustments are needed.",
                jp: '調整が必要な場合のみご連絡します。',
              },
              {
                num: 3,
                en: 'Your menu will be confirmed once approved by Chef Missy.',
                jp: 'Chef Missy が承認するとメニューが確定します。',
              },
              {
                num: 4,
                en: "You'll receive a shopping list once your menu is confirmed.",
                jp: 'メニュー確定後に買い出しリストをお送りします。',
              },
              {
                num: 5,
                en: 'Your meals will be freshly prepared for your scheduled visit.',
                jp: '予定された訪問日に合わせて、心を込めて調理します。',
              },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="stagger-step"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  textAlign: 'left',
                  animationDelay: `${0.08 + idx * 0.08}s`,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    color: '#111827',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#111827', lineHeight: 1.35 }}>
                    {step.en}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#6b7280', marginTop: '2px', lineHeight: 1.35 }}>
                    {step.jp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary Box */}
          <div
            className="cart-submitted-summary"
            style={{
              padding: '10px 14px',
              backgroundColor: '#fbf9f5',
              borderRadius: '6px',
              border: '1px solid #ece7de',
              marginBottom: '18px',
              textAlign: 'left',
              fontSize: '0.72rem',
              color: '#4a463e',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#716c62', fontSize: '0.69rem' }}>Status</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>Submitted</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#716c62', fontSize: '0.69rem' }}>Target Date</span>
              <span style={{ fontWeight: 600, color: '#1a1814' }}>
                {confirmedVisit?.visitDate
                  ? new Date(confirmedVisit.visitDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Selected Date'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#716c62', fontSize: '0.69rem' }}>Timeslot / Window</span>
              <span style={{ fontWeight: 600, color: '#1a1814' }}>
                {confirmedVisit?.arrivalWindow || formattedTimeslotPreview}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div
            className="cart-submitted-actions"
            style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/history"
              className="btn-anim cart-submitted-btn-primary"
              style={{
                padding: '7px 14px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-primary, #2e3b12)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>View in Box History</span>
              <ArrowRight size={12} />
            </Link>
            <Link
              to="/catalogue"
              className="btn-anim cart-submitted-btn-secondary"
              style={{
                padding: '7px 14px',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: 'var(--color-primary, #2e3b12)',
                border: '1px solid var(--color-border, #ece7de)',
                fontSize: '0.72rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              Browse Menu
            </Link>
          </div>
        </div>
      ) : activeStep === 3 ? (
        /* Step 3: Review Your Box */
        <div key="step-3" className="step-transition user-split-2col">
          <div>
            {/* Selected Courses Grouped */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '16px',
                boxShadow: 'none',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.94rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
                  Dishes in Your Box ({cart.dishes.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #2e3b12)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  + Add / Edit Dishes
                </button>
              </div>

              {cart.dishes.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.78rem' }}>No dishes selected yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...cart.dishes]
                    .sort((a, b) => (getDishConflict(b) ? 1 : 0) - (getDishConflict(a) ? 1 : 0))
                    .map((dish) => {
                      const conflicts = getDishConflict(dish);
                      return (
                        <div
                          key={dish._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: conflicts ? '1px solid #fca5a5' : '1px solid #ede8df',
                            backgroundColor: conflicts ? '#fef2f2' : '#fbf9f5',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                              <img
                                src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                                alt={dish.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a1814' }}>{dish.name}</span>
                                {conflicts && (
                                  <span
                                    style={{
                                      fontSize: '0.66rem',
                                      padding: '1.5px 6px',
                                      borderRadius: '3px',
                                      backgroundColor: '#fee2e2',
                                      border: '1px solid #fca5a5',
                                      color: '#991b1b',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                    }}
                                  >
                                    <AlertTriangle size={11} color="#991b1b" />
                                    Allergy Conflict: contains {conflicts.join(', ')}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#716c62', display: 'flex', gap: '6px', marginTop: '2px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{dish.type || 'Main'}</span>
                                {dish.isTimeIntensive && <span style={{ color: '#d97706', fontWeight: 600 }}>• Time-Intensive</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {dish.allergens?.length > 0 && !conflicts && (
                              <span style={{ fontSize: '0.66rem', color: '#716c62' }}>
                                Allergens: {dish.allergens.join(', ')}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFromCart(dish._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#b91c1c',
                                fontSize: '0.80rem',
                                cursor: 'pointer',
                                padding: '3px 6px',
                              }}
                              title="Remove dish"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Limits & Rules Status */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '14px 16px',
                boxShadow: 'none',
              }}
            >
              <h4 style={{ fontSize: '0.84rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 700 }}>
                Box Limits Checklist
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: mainsCount <= 7 ? '#059669' : '#b91c1c' }}>
                  <Check size={14} color={mainsCount <= 7 ? '#059669' : '#b91c1c'} strokeWidth={2.5} />
                  <span>
                    Main Courses: {mainsCount}/7 {mainsCount > 7 && '(Limit exceeded)'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: timeIntensiveCount <= 2 ? '#059669' : '#b91c1c',
                  }}
                >
                  <Check size={14} color={timeIntensiveCount <= 2 ? '#059669' : '#b91c1c'} strokeWidth={2.5} />
                  <span>
                    Time-Intensive Dishes: {timeIntensiveCount}/2 {timeIntensiveCount > 2 && '(Limit exceeded)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '16px',
                boxShadow: 'none',
              }}
            >
              <h3 style={{ fontSize: '0.90rem', color: '#1a1814', margin: '0 0 12px', fontWeight: 700 }}>
                Box Summary
              </h3>

              <div
                style={{
                  fontSize: '0.74rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '16px',
                  color: '#4a463e',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#716c62' }}>Date:</span>
                  <span style={{ fontWeight: 600 }}>
                    {cart.visitDate
                      ? new Date(cart.visitDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Not set'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#716c62' }}>Timeslot / Window:</span>
                  <span style={{ fontWeight: 600 }}>{formattedTimeslotPreview}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#716c62' }}>Portions:</span>
                  <span style={{ fontWeight: 600 }}>{cart.guests || 2} persons</span>
                </div>
                {cart.notes && (
                  <div style={{ marginTop: '4px', borderTop: '1px solid #ece7de', paddingTop: '6px' }}>
                    <span style={{ color: '#716c62', display: 'block', marginBottom: '2px' }}>Kitchen Notes:</span>
                    <span style={{ fontStyle: 'italic', color: '#57534e' }}>"{cart.notes}"</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={loading || cart.dishes.length === 0 || mainsCount > 7 || timeIntensiveCount > 2}
                  className={`btn-anim ${loading ? 'btn-submitting' : ''}`}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-primary, #2e3b12)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: loading || cart.dishes.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Submitting Menu...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Submit Your Box</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn-anim"
                  style={{
                    width: '100%',
                    height: '34px',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: '#4a463e',
                    border: '1px solid var(--color-border, #ece7de)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  &larr; Back to Select Dishes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Steps 1 & 2: Form & Dish Catalogue Grid */
        <div className="user-split-2col">
          {/* Left Column */}
          <div>
            {/* Step 1: Pack Your Box Details Form */}
            {activeStep === 1 ? (
              <div
                key="step-1"
                className="step-transition"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #ece7de)',
                  padding: '22px 24px',
                  boxShadow: 'none',
                  marginBottom: '18px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.15rem',
                    color: 'var(--color-primary, #2e3b12)',
                    marginBottom: '16px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                  }}
                >
                  Pack Your Box
                </h3>

                {/* Date & Portions Row */}
                <div className="user-form-2col" style={{ marginBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <label
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#1a1814',
                          margin: 0,
                        }}
                      >
                        Box Preparation / Delivery Date *
                      </label>
                      {isDateMissing && (
                        <span
                          style={{
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            color: '#b45309',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fcd34d',
                            padding: '1px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          ⚠ Required — Missing
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <CustomDatePicker
                        min={todayStr}
                        value={cart.visitDate || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCartDetails({ visitDate: val });
                          fetchVisitForDate(val);
                        }}
                        style={{
                          height: '36px',
                          border: isDateMissing
                            ? '1.5px solid #d97706'
                            : datePastError
                            ? '1.5px solid #dc2626'
                            : '1px solid var(--color-border, #ece7de)',
                          backgroundColor: isDateMissing ? '#fffbeb' : datePastError ? '#fef2f2' : '#ffffff',
                          fontSize: '0.80rem',
                        }}
                      />
                      {checkingDate && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.68rem',
                            color: 'var(--color-primary, #2e3b12)',
                            pointerEvents: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '1px 4px',
                            borderRadius: '3px',
                          }}
                        >
                          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Checking date...</span>
                        </div>
                      )}
                    </div>
                    {datePastError && (
                      <div style={{ fontSize: '0.69rem', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
                        ⚠ {datePastError}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '5px',
                        color: '#1a1814',
                      }}
                    >
                      Servings / Box Portions *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={cart.guests || 2}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 2;
                        updateCartDetails({ guests: val, adults: val });
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border, #ece7de)',
                        fontSize: '0.80rem',
                        boxShadow: 'none',
                        backgroundColor: '#ffffff',
                        color: '#1e1b16',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Timeslot Window Section */}
                <div
                  style={{
                    marginBottom: '18px',
                    padding: '14px',
                    backgroundColor: isTimeslotMissing ? '#fffbeb' : '#fbf9f5',
                    borderRadius: '4px',
                    border: isTimeslotMissing ? '1.5px solid #d97706' : '1px solid var(--color-border, #ece7de)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div className="cart-timeslot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} color={isTimeslotMissing ? '#d97706' : 'var(--color-primary, #2e3b12)'} />
                      <label
                        className="cart-timeslot-label"
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#1a1814',
                          margin: 0,
                        }}
                      >
                        Delivery / Pickup Timeslot *
                      </label>
                      {isTimeslotMissing && (
                        <span
                          style={{
                            fontSize: '0.67rem',
                            fontWeight: 700,
                            color: '#b45309',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fcd34d',
                            padding: '1px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          ⚠ Required — Select Window
                        </span>
                      )}
                    </div>
                    <span
                      className="cart-timeslot-badge"
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        color: isTimeslotMissing ? '#92400e' : 'var(--color-primary, #2e3b12)',
                        backgroundColor: isTimeslotMissing ? '#fde68a' : '#ede8df',
                        padding: '2px 8px',
                        borderRadius: '3px',
                      }}
                    >
                      {isTimeslotMissing ? 'Pending Selection' : formattedTimeslotPreview}
                    </span>
                  </div>

                  {/* Custom Delivery / Pickup Timepicker Inputs */}
                  <div className="user-form-2col" style={{ marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.69rem', color: '#57534e', display: 'block', marginBottom: '3px', fontWeight: 500 }}>
                        From Time
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => handleTimeChange(e.target.value, endTime)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: isTimeslotMissing ? '1.5px solid #d97706' : '1px solid var(--color-border, #ece7de)',
                          backgroundColor: isTimeslotMissing ? '#fffbeb' : '#ffffff',
                          fontSize: '0.80rem',
                          outline: 'none',
                          color: '#1e1b16',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.69rem', color: '#57534e', display: 'block', marginBottom: '3px', fontWeight: 500 }}>
                        To Time
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => handleTimeChange(startTime, e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: isTimeslotMissing ? '1.5px solid #d97706' : '1px solid var(--color-border, #ece7de)',
                          backgroundColor: isTimeslotMissing ? '#fffbeb' : '#ffffff',
                          fontSize: '0.80rem',
                          outline: 'none',
                          color: '#1e1b16',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Notes & Requests */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '5px',
                      color: '#1a1814',
                    }}
                  >
                    Special Packaging & Preparation Notes
                  </label>
                  <textarea
                    rows={3}
                    value={cart.notes || ''}
                    onChange={(e) => updateCartDetails({ notes: e.target.value })}
                    placeholder="Notes for Chef Missy (e.g. delivery drop-off instructions, extra sauce separate, portioning preferences)..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border, #ece7de)',
                      fontSize: '0.78rem',
                      boxShadow: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1e1b16',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!cart.visitDate) {
                      setError('Please select a box preparation/delivery date to proceed.');
                      return;
                    }
                    if (isTimeslotMissing) {
                      setError('Please select a delivery / pickup timeslot to proceed.');
                      return;
                    }
                    setError('');
                    setActiveStep(2);
                  }}
                  className="btn-anim"
                  style={{
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-primary, #2e3b12)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Proceed to Select Dishes</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : null}

            {/* Step 2 Content: Search & Catalogue Selection */}
            {activeStep === 2 && (
              <div key="step-2" className="step-transition">
                {/* Amber notification if dishes are missing in pre-scheduled box */}
                {isDishesMissing && (
                  <div
                    style={{
                      padding: '9px 12px',
                      backgroundColor: '#fffbeb',
                      border: '1.5px solid #d97706',
                      borderRadius: '4px',
                      color: '#92400e',
                      fontSize: '0.76rem',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Dishes Required:</strong> Chef Missy is waiting for your dish selections. Click any dish card below to pack it into your box (up to 7 courses).
                    </span>
                  </div>
                )}

                {/* Search bar inside Select Dishes */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border, #ece7de)',
                    borderRadius: '4px',
                    padding: '0 12px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    boxShadow: 'none',
                  }}
                >
                  <Search size={14} color="#716c62" />
                  <input
                    type="text"
                    placeholder="Search dishes, cuisines, or ingredients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '0.78rem',
                      width: '100%',
                      color: '#1e1b16',
                    }}
                  />
                </div>

                {/* Filter pill buttons */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveCat('all')}
                    className="btn-anim"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '3px',
                      border: `1px solid ${activeCat === 'all' ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
                      backgroundColor: activeCat === 'all' ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: activeCat === 'all' ? '#ffffff' : '#1e1b16',
                      fontSize: '0.72rem',
                      fontWeight: activeCat === 'all' ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                    }}
                  >
                    All Dishes ({dishes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCat('main')}
                    className="btn-anim"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '3px',
                      border: `1px solid ${activeCat === 'main' ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
                      backgroundColor: activeCat === 'main' ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: activeCat === 'main' ? '#ffffff' : '#1e1b16',
                      fontSize: '0.72rem',
                      fontWeight: activeCat === 'main' ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                    }}
                  >
                    Mains
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCat('dessert')}
                    className="btn-anim"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '3px',
                      border: `1px solid ${activeCat === 'dessert' ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
                      backgroundColor: activeCat === 'dessert' ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: activeCat === 'dessert' ? '#ffffff' : '#1e1b16',
                      fontSize: '0.72rem',
                      fontWeight: activeCat === 'dessert' ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                    }}
                  >
                    Desserts
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCat('kids')}
                    className="btn-anim"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '3px',
                      border: `1px solid ${activeCat === 'kids' ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
                      backgroundColor: activeCat === 'kids' ? 'var(--color-primary, #2e3b12)' : '#ffffff',
                      color: activeCat === 'kids' ? '#ffffff' : '#1e1b16',
                      fontSize: '0.72rem',
                      fontWeight: activeCat === 'kids' ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                    }}
                  >
                    Kids' Meals
                  </button>
                  {categories.map((c) => {
                    const active = activeCat === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setActiveCat(c._id)}
                        className="btn-anim"
                        style={{
                          padding: '5px 12px',
                          borderRadius: '3px',
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
                        {c.name}
                      </button>
                    );
                  })}
                </div>

                {/* Course Selection Cards Grid */}
                {fetchingDishes ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted, #716c62)', fontSize: '0.80rem' }}>
                    Loading fresh seasonal dishes...
                  </div>
                ) : filteredDishes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted, #716c62)', fontSize: '0.80rem' }}>
                    No dishes found matching your search.
                  </div>
                ) : (
                  <div key={activeCat + '_' + search} className="course-grid-transition cart-dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                    {filteredDishes.map((dish) => {
                      const inCart = cart.dishes.some((d) => d._id === dish._id);
                      const dishConflict = getDishConflict(dish);
                      return (
                        <div
                          key={dish._id}
                          className="dish-card-anim cart-dish-card"
                          onClick={() => (inCart ? removeFromCart(dish._id) : addToCart(dish))}
                          style={{
                            backgroundColor: inCart ? (dishConflict ? '#fef2f2' : '#fbfaf6') : '#ffffff',
                            borderRadius: '4px',
                            border: inCart
                              ? (dishConflict ? '2px solid #ef4444' : '2px solid var(--color-primary, #2e3b12)')
                              : (dishConflict ? '1px solid #fca5a5' : '1px solid var(--color-border, #ece7de)'),
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          onMouseEnter={(e) => {
                            if (!inCart) e.currentTarget.style.borderColor = dishConflict ? '#f87171' : '#c5bea8';
                          }}
                          onMouseLeave={(e) => {
                            if (!inCart) e.currentTarget.style.borderColor = dishConflict ? '#fca5a5' : 'var(--color-border, #ece7de)';
                          }}
                        >
                          {/* Image Box */}
                          <div className="cart-dish-card-img-wrap" style={{ height: '140px', position: 'relative', backgroundColor: '#f5eee3' }}>
                            <img
                              src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                              alt={dish.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                              }}
                            />

                            {/* Eye Icon to View Details in Modal */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingDish(dish);
                              }}
                              title="View dish details"
                              className="cart-dish-eye-btn"
                              style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                margin: 0,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                                border: '1px solid #ece7de',
                                color: '#1e1b16',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                transition: 'all 0.12s ease',
                                lineHeight: 1,
                                boxSizing: 'border-box',
                                zIndex: 2,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.transform = 'scale(1.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.96)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <Eye size={14} color="#2e3b12" style={{ display: 'block', flexShrink: 0 }} />
                            </button>

                            {/* Selection Checkmark Indicator (Top Right) */}
                            <div
                              className={`cart-dish-check-btn ${inCart ? 'animate-pop-check' : ''}`}
                              key={inCart ? `checked-${dish._id}` : `plus-${dish._id}`}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                margin: 0,
                                borderRadius: '50%',
                                backgroundColor: inCart ? 'var(--color-primary, #2e3b12)' : 'rgba(255, 255, 255, 0.96)',
                                color: inCart ? '#ffffff' : '#716c62',
                                border: inCart ? '2px solid var(--color-primary, #2e3b12)' : '1px solid #dcd5ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: inCart ? '0 2px 8px rgba(46, 59, 18, 0.25)' : 'none',
                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                lineHeight: 1,
                                boxSizing: 'border-box',
                                zIndex: 2,
                              }}
                              title={inCart ? 'Selected in box (click to remove)' : 'Click card to pack into box'}
                            >
                              {inCart ? (
                                <Check size={14} color="#ffffff" strokeWidth={3} style={{ display: 'block', flexShrink: 0 }} />
                              ) : (
                                <Plus size={14} color="#716c62" strokeWidth={2.4} style={{ display: 'block', flexShrink: 0 }} />
                              )}
                            </div>

                            {/* Time-Intensive Badge */}
                            {dish.isTimeIntensive && (
                              <span
                                className="cart-dish-time-badge"
                                style={{
                                  position: 'absolute',
                                  bottom: '6px',
                                  left: '6px',
                                  padding: '1.5px 6px',
                                  borderRadius: '2px',
                                  backgroundColor: 'rgba(180, 83, 9, 0.94)',
                                  color: '#ffffff',
                                  fontSize: '0.62rem',
                                  fontWeight: 600,
                                }}
                              >
                                Time-Intensive (30+ min)
                              </span>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="cart-dish-card-body" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '6px',
                                marginBottom: '4px',
                              }}
                            >
                              <h4 className="cart-dish-card-title" style={{ fontSize: '0.86rem', color: '#1a1814', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
                                {dish.name}
                              </h4>
                              <span
                                className="cart-dish-card-type"
                                style={{
                                  fontSize: '0.62rem',
                                  padding: '1.5px 5px',
                                  borderRadius: '2px',
                                  backgroundColor: '#f5eee3',
                                  color: '#594f42',
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                  flexShrink: 0,
                                }}
                              >
                                {dish.type || 'Main'}
                              </span>
                            </div>

                            {/* Tags */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              {dishConflict && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    padding: '1px 5px',
                                    borderRadius: '2px',
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    border: '1px solid #fca5a5',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                >
                                  <AlertTriangle size={9} color="#991b1b" />
                                  Allergy ({dishConflict.join(', ')})
                                </span>
                              )}
                              {dish.cuisineTags?.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: '0.62rem',
                                    padding: '1px 5px',
                                    borderRadius: '2px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1e40af',
                                    fontWeight: 500,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                              {dish.spiceLevel && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    padding: '1px 5px',
                                    borderRadius: '2px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    fontWeight: 500,
                                  }}
                                >
                                  {dish.spiceLevel} spice
                                </span>
                              )}
                            </div>

                            <p
                              style={{
                                fontSize: '0.73rem',
                                color: 'var(--color-text-muted, #716c62)',
                                lineHeight: 1.4,
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

                            {/* Bottom Info Bar */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.68rem',
                                color: 'var(--color-text-muted, #716c62)',
                                paddingTop: '8px',
                                borderTop: '1px solid #f2ede4',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} color="#716c62" />
                                <span>{dish.time || '30 mins'}</span>
                              </div>

                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  color: inCart ? 'var(--color-primary, #2e3b12)' : '#716c62',
                                }}
                              >
                                {inCart ? '✓ In Your Box' : '+ Click to Select'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: "Your Box" Selection Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0, maxWidth: '100%' }}>
            <div
              className="cart-your-box-panel"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: isDishesMissing ? '1.5px solid #d97706' : '1px solid var(--color-border, #ece7de)',
                padding: '16px',
                boxShadow: 'none',
                transition: 'border-color 0.15s ease',
                overflowX: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={15} color={isDishesMissing ? '#d97706' : 'var(--color-primary, #2e3b12)'} />
                  <h3 style={{ fontSize: '0.90rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>Your Box</h3>
                </div>
                {isDishesMissing ? (
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fcd34d',
                      padding: '1px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    ⚠ Required
                  </span>
                ) : cart.dishes.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearCart}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.70rem',
                      color: '#716c62',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                ) : null}
              </div>

              <span
                style={{
                  fontSize: '0.72rem',
                  color: mainsCount > 7 ? '#b91c1c' : isDishesMissing ? '#b45309' : 'var(--color-text-muted, #716c62)',
                  display: 'block',
                  marginBottom: '12px',
                  fontWeight: isDishesMissing ? 600 : 400,
                }}
              >
                {cart.dishes.length} dishes in your box (Mains: {mainsCount}/7 • Time: {timeIntensiveCount}/2)
              </span>

              {cart.dishes.length === 0 ? (
                isDishesMissing ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#92400e',
                      backgroundColor: '#fffbeb',
                      border: '1px dashed #fcd34d',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      padding: '14px 10px',
                      lineHeight: 1.4,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>0 / 7 dishes packed</strong>
                    <div style={{ fontSize: '0.70rem', color: '#b45309', marginTop: '4px' }}>
                      Please click any dish card to pack it into your box.
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted, #716c62)', fontSize: '0.76rem', padding: '18px 0' }}>
                    No dishes packed yet. Click any dish card to add to your box.
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {[...cart.dishes]
                    .sort((a, b) => (getDishConflict(b) ? 1 : 0) - (getDishConflict(a) ? 1 : 0))
                    .map((dish) => {
                      const conflicts = getDishConflict(dish);
                      return (
                        <div
                          key={dish._id}
                          className="side-cart-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            border: conflicts ? '1px solid #fca5a5' : '1px solid #ede8df',
                            backgroundColor: conflicts ? '#fef2f2' : '#fbf9f5',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                            <img
                              src={dish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                              alt={dish.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5
                              style={{
                                fontSize: '0.78rem',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 600,
                                color: '#1a1814',
                              }}
                            >
                              {dish.name}
                            </h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.67rem', color: 'var(--color-text-muted, #716c62)', textTransform: 'capitalize' }}>
                                {dish.type || 'Main'}
                              </span>
                              {conflicts && (
                                <span
                                  style={{
                                    fontSize: '0.60rem',
                                    fontWeight: 600,
                                    color: '#991b1b',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '2px',
                                    padding: '0 4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                >
                                  <AlertTriangle size={9} color="#991b1b" />
                                  Allergy ({conflicts.join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(dish._id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '0.90rem',
                              color: conflicts ? '#b91c1c' : '#716c62',
                              cursor: 'pointer',
                              padding: '2px 5px',
                            }}
                            title="Remove from box"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    if (!cart.visitDate) {
                      setError('Please set a box preparation date first.');
                      return;
                    }
                    setActiveStep(2);
                  } else {
                    if (cart.dishes.length === 0) {
                      setError('Please select at least one dish for your box.');
                      return;
                    }
                    setActiveStep(3);
                  }
                }}
                disabled={loading}
                className="btn-anim"
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary, #2e3b12)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: 'none',
                }}
              >
                <span>{activeStep === 1 ? 'Select Dishes \u2192' : 'Continue to Review Your Box \u2192'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISH DETAILS DIALOG BOX MODAL */}
      {viewingDish &&
        typeof document !== 'undefined' &&
        createPortal(
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
            onClick={() => setViewingDish(null)}
          >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #ece7de)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'none',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--color-border, #ece7de)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fbf9f5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    color: 'var(--color-primary, #2e3b12)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {viewingDish.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.64rem',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    backgroundColor: '#f5eee3',
                    color: '#594f42',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {viewingDish.type || 'Main'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDish(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#716c62',
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Scrollable Body with Defined Sections */}
            <div
              style={{
                padding: '16px 18px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Section 1: Hero Image */}
              <div
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: '#f5eee3',
                }}
              >
                <img
                  src={viewingDish.photoUrl || '/assets/dishes/lemon-herb-salmon.png'}
                  alt={viewingDish.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/assets/dishes/lemon-herb-salmon.png';
                  }}
                />
                {viewingDish.isTimeIntensive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(180, 83, 9, 0.94)',
                      color: '#ffffff',
                      fontSize: '0.66rem',
                      fontWeight: 600,
                    }}
                  >
                    Time-Intensive (30+ min prep)
                  </span>
                )}
              </div>

              {/* Section 2: Chef's Culinary Notes */}
              {viewingDish.description && (
                <div>
                  <h4
                    style={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--color-primary, #2e3b12)',
                      margin: '0 0 6px',
                      fontWeight: 700,
                    }}
                  >
                    Chef's Culinary Notes
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.77rem', color: '#4a463e', lineHeight: 1.5 }}>
                    {viewingDish.description}
                  </p>
                </div>
              )}

              {/* Section 3: Dietary & Flavour Profile */}
              <div>
                <h4
                  style={{
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-primary, #2e3b12)',
                    margin: '0 0 8px',
                    fontWeight: 700,
                  }}
                >
                  Dietary & Flavour Profile
                </h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {viewingDish.cuisineTags?.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #dbeafe',
                        color: '#1e40af',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {viewingDish.dietaryTags?.map((d, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        fontWeight: 600,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                  {viewingDish.spiceLevel && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        fontWeight: 600,
                      }}
                    >
                      Spice: {viewingDish.spiceLevel}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      backgroundColor: '#fbf9f5',
                      border: '1px solid #ede8df',
                      color: '#57534e',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={11} color="#57534e" />
                    {viewingDish.time || '30 mins'}
                  </span>
                </div>
              </div>

              {/* Section 4: Allergen Information */}
              <div>
                <h4
                  style={{
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-primary, #2e3b12)',
                    margin: '0 0 8px',
                    fontWeight: 700,
                  }}
                >
                  Allergen Information
                </h4>
                {viewingDish.allergens && viewingDish.allergens.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {viewingDish.allergens.map((alg) => {
                      const isConflict = clientAllergies.includes(alg.toLowerCase().trim());
                      return (
                        <span
                          key={alg}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            backgroundColor: isConflict ? '#fee2e2' : '#fbf9f5',
                            border: `1px solid ${isConflict ? '#fca5a5' : '#ede8df'}`,
                            color: isConflict ? '#991b1b' : '#57534e',
                            fontWeight: isConflict ? 700 : 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isConflict && <AlertTriangle size={11} color="#991b1b" />}
                          {alg}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 500 }}>
                    No declared allergens.
                  </span>
                )}
              </div>

              {/* Section 5: Ingredients Table */}
              {Array.isArray(viewingDish.ingredients) && viewingDish.ingredients.length > 0 && (
                <div>
                  <h4
                    style={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--color-primary, #2e3b12)',
                      margin: '0 0 8px',
                      fontWeight: 700,
                    }}
                  >
                    Key Fresh Ingredients
                  </h4>
                  <div style={{ border: '1px solid #ece7de', borderRadius: '4px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fbf9f5', borderBottom: '1px solid #ece7de' }}>
                          <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600, color: '#716c62' }}>Ingredient</th>
                          <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 600, color: '#716c62' }}>Quantity</th>
                          <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600, color: '#716c62' }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingDish.ingredients.map((ing, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: idx < viewingDish.ingredients.length - 1 ? '1px solid #f2ede4' : 'none',
                            }}
                          >
                            <td style={{ padding: '6px 10px', color: '#1a1814' }}>{ing.name}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#1a1814' }}>
                              {ing.qtyPer2 ?? ing.quantity ?? ing.qty ?? '-'}
                            </td>
                            <td style={{ padding: '6px 10px', color: '#716c62' }}>{ing.unit || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--color-border, #ece7de)',
                backgroundColor: '#fbf9f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const isCurrentlyIn = cart.dishes.some((d) => d._id === viewingDish._id);
                  if (isCurrentlyIn) {
                    removeFromCart(viewingDish._id);
                  } else {
                    addToCart(viewingDish);
                  }
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '4px',
                  backgroundColor: cart.dishes.some((d) => d._id === viewingDish._id) ? '#ffffff' : 'var(--color-primary, #2e3b12)',
                  color: cart.dishes.some((d) => d._id === viewingDish._id) ? '#b91c1c' : '#ffffff',
                  border: cart.dishes.some((d) => d._id === viewingDish._id) ? '1px solid #fca5a5' : 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {cart.dishes.some((d) => d._id === viewingDish._id) ? (
                  <>
                    <span>✕</span>
                    <span>Remove from Your Box</span>
                  </>
                ) : (
                  <>
                    <span>+</span>
                    <span>Pack into Your Box</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewingDish(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '4px',
                  border: '1px solid #dcd5ca',
                  backgroundColor: '#ffffff',
                  color: '#4a463e',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
