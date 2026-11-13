import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  RotateCcw,
  Package,
  Utensils,
  FileText,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Hash,
} from 'lucide-react';
import api from '../../config/shared/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/shared/Loader';
import { formatArrivalWindow } from '../../utils/formatters';

export default function VisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateCartDetails } = useAuth();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchVisit();
  }, [id]);

  const fetchVisit = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/visits/${id}`);
      setVisit(res.data.visit);
    } catch {
      try {
        const histRes = await api.get('/visits/history');
        const found = histRes.data.visits?.find((v) => v._id === id);
        setVisit(found || null);
      } catch (err2) {
        console.error('Error fetching box details', err2);
      }
    } finally {
      setLoading(false);
    }
  };


  const useMenuAgain = () => {
    if (!visit || !visit.dishes) return;

    if (updateCartDetails) {
      updateCartDetails({
        guests: visit.guests || 2,
        notes: visit.notes || '',
      });
    }

    visit.dishes.forEach((item) => {
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
      ready: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'Ready for Pickup / Dispatch' },
      pending: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', label: 'Pending Review' },
      completed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Completed' },
      cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled' },
    };
    const c = config[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', label: status || 'Pending' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.66rem',
          fontWeight: 600,
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          textTransform: 'capitalize',
        }}
      >
        {c.label}
      </span>
    );
  };

  if (loading) return <Loader message="Loading visit details..." />;

  if (!visit) {
    return (
      <div style={{ width: '100%', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ece7de', padding: '30px 20px' }}>
          <Package size={38} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.15rem', color: '#1a1814', marginBottom: '6px', fontWeight: 700 }}>
            Menu Details Not Found
          </h2>
          <p style={{ color: 'var(--color-text-muted, #716c62)', fontSize: '0.78rem', margin: '0 0 16px', lineHeight: 1.45 }}>
            We couldn't locate the requested menu details. It may have been removed.
          </p>
          <Link to="/history">
            <button
              type="button"
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-primary, #2e3b12)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              &larr; Back to Past Menus
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const visitDate = new Date(visit.visitDate);
  const formattedDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="user-page-container">
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '8px' }}>
        <Link
          to="/history"
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
          <span>Back to Past Menus</span>
        </Link>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            fontSize: '0.78rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="user-title-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <h1 className="user-page-title">
              Menu Details
            </h1>
            <span
              style={{
                fontSize: '0.70rem',
                color: 'var(--color-text-muted, #716c62)',
                backgroundColor: '#f5eee3',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              #{visit._id?.slice(-6).toUpperCase()}
            </span>
          </div>
          <p className="user-page-subtitle">
            Full menu selections, special requests, time preference, and status.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="user-title-actions">
          <button
            type="button"
            className="user-action-btn"
            onClick={useMenuAgain}
            title="Re-plan this menu"
            style={{ padding: '0 12px' }}
          >
            <RotateCcw size={13} />
            <span className="user-btn-text">Re-plan This Menu</span>
          </button>
        </div>
      </div>

      {/* Status Notice Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          border:
            visit.status === 'confirmed'
              ? '1px solid #a7f3d0'
              : visit.status === 'ready'
              ? '1px solid #ddd6fe'
              : visit.status === 'pending'
              ? '1.5px solid #fcd34d'
              : visit.status === 'cancelled'
              ? '1px solid #fecaca'
              : '1px solid #bfdbfe',
          backgroundColor:
            visit.status === 'confirmed'
              ? '#f0fdf4'
              : visit.status === 'ready'
              ? '#f5f3ff'
              : visit.status === 'pending'
              ? '#fffbeb'
              : visit.status === 'cancelled'
              ? '#fef2f2'
              : '#eff6ff',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div style={{ marginTop: '2px', flexShrink: 0 }}>
          {visit.status === 'confirmed' ? (
            <CheckCircle2 size={18} color="#059669" />
          ) : visit.status === 'ready' ? (
            <Package size={18} color="#6d28d9" />
          ) : visit.status === 'pending' ? (
            <AlertCircle size={18} color="#d97706" />
          ) : visit.status === 'cancelled' ? (
            <XCircle size={18} color="#dc2626" />
          ) : (
            <CheckCircle2 size={18} color="#1d4ed8" />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color:
                  visit.status === 'confirmed'
                    ? '#065f46'
                    : visit.status === 'ready'
                    ? '#5b21b6'
                    : visit.status === 'pending'
                    ? '#92400e'
                    : visit.status === 'cancelled'
                    ? '#991b1b'
                    : '#1e40af',
              }}
            >
              {visit.status === 'confirmed'
                ? 'Confirmed Menu'
                : visit.status === 'ready'
                ? 'Menu Confirmed'
                : visit.status === 'pending'
                ? 'Pending Chef Review'
                : visit.status === 'completed'
                ? 'Completed Menu'
                : 'Cancelled Menu'}
            </span>
            {getStatusBadge(visit.status)}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.74rem',
              color:
                visit.status === 'confirmed'
                  ? '#047857'
                  : visit.status === 'ready'
                  ? '#6d28d9'
                  : visit.status === 'pending'
                  ? '#78350f'
                  : visit.status === 'cancelled'
                  ? '#b91c1c'
                  : '#1d4ed8',
              lineHeight: 1.45,
            }}
          >
            {visit.status === 'confirmed' && (
              <>
                Chef Missy will prepare your meals during your preferred window:{' '}
                <strong>{visit.arrivalWindow?.toLowerCase().includes('afternoon') ? 'Afternoon' : 'Morning'}</strong>.
              </>
            )}
            {visit.status === 'ready' &&
              'Your menu plan is confirmed. Chef Missy will prepare your meals on your scheduled date!'}
            {visit.status === 'pending' &&
              'Your menu selection has been submitted to Chef Missy. She will confirm the exact preparation time directly with you.'}
            {visit.status === 'completed' &&
              'This menu has been completed. We hope your family enjoyed every dish!'}
            {visit.status === 'cancelled' && (
              <>
                This menu was cancelled{visit.cancelledBy ? ` by ${visit.cancelledBy}` : ''}.
                {visit.cancellationReason && ` Reason: "${visit.cancellationReason}"`}
              </>
            )}
          </p>
        </div>
      </div>

      {/* 3 Metric Overview Cards (Box Date, Box Portions, Delivery/Pickup Window) */}
      <div className="user-metric-3col" style={{ marginBottom: '16px' }}>
        {/* 1. Box Date */}
        <div
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
            <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
              Preparation Date
            </span>
            <strong style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
              {formattedDate}
            </strong>
          </div>
        </div>

        {/* 2. Family Portions */}
        <div
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
            <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
              Family Portions
            </span>
            <strong style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
              {visit.guests || 2} Portions
            </strong>
          </div>
        </div>

        {/* 3. Time Preference */}
        <div
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
            <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted, #716c62)', display: 'block', fontWeight: 500 }}>
              Time Preference
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.84rem', color: '#1a1814', fontWeight: 700 }}>
                {visit.arrivalWindow?.toLowerCase().includes('afternoon') ? 'Afternoon' : 'Morning'}
              </strong>
              {/\d/.test(visit.arrivalWindow || '') && (
                <span style={{ fontSize: '0.72rem', color: '#524d43', fontWeight: 500 }}>
                  ({formatArrivalWindow(visit.arrivalWindow)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Dishes on Left, Summary & Notes on Right */}
      <div className="user-split-2col">
        {/* Left Column: Dishes in Menu Plan */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Package size={16} color="var(--color-primary, #2e3b12)" />
            <h3 style={{ fontSize: '0.96rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
              Selected Menu Dishes ({visit.dishes?.length || 0})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visit.dishes?.map((item, idx) => {
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
                  {/* Dish Thumbnail */}
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

                  {/* Dish Info (NO portions on card!) */}
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

        {/* Right Column: Order Summary, Notes, Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Client Notes if any */}
          {visit.notes && (
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
                {visit.notes}
              </p>
            </div>
          )}

          {/* Chef Preparation Notes if any */}
          {visit.chefNotes && (
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
                {visit.chefNotes}
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
                Menu Summary
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
                  {visit.dishes?.length || 0}
                </strong>
              </div>

              {/* Family Portions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                  <Package size={13} color="#716c62" />
                  <span>Family Portions</span>
                </div>
                <strong style={{ fontSize: '0.82rem', color: '#1a1814' }}>
                  {visit.guests || 2}
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
                      backgroundColor:
                        visit.status === 'confirmed'
                          ? '#059669'
                          : visit.status === 'pending'
                          ? '#d97706'
                          : visit.status === 'cancelled'
                          ? '#dc2626'
                          : '#1d4ed8',
                    }}
                  />
                  <span>Status</span>
                </div>
                {getStatusBadge(visit.status)}
              </div>

              {/* Time Preference */}
              {visit.arrivalWindow && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                    <Clock size={13} color="#716c62" />
                    <span>Time Preference</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.74rem', color: '#1a1814' }}>
                      {visit.arrivalWindow.toLowerCase().includes('afternoon') ? 'Afternoon' : 'Morning'}
                    </strong>
                    {/\d/.test(visit.arrivalWindow) && (
                      <span style={{ display: 'block', fontSize: '0.67rem', fontWeight: 500, color: 'var(--color-text-muted, #524d43)', marginTop: '1px' }}>
                        ({formatArrivalWindow(visit.arrivalWindow)})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reference ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f6f3ed', paddingTop: '8px', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#57534e', fontSize: '0.76rem' }}>
                  <Hash size={13} color="#716c62" />
                  <span>Order Ref</span>
                </div>
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#716c62', fontWeight: 600 }}>
                  #{visit._id?.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={useMenuAgain}
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
  );
}
