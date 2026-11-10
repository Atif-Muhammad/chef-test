import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, Calendar, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../config/shared/api';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', {
        params: {
          limit: 50,
          unreadOnly: filter === 'unread',
        },
      });
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || actionLoading) return;
    setActionLoading(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return '';
    }
  };

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div style={{ maxWidth: '100%', margin: '0', padding: '0 2px 16px' }}>
      {/* Title Row with Action Buttons at the End (justify-between) */}
      <div className="admin-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <h1
          className="admin-page-title"
          style={{
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.64rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              {unreadCount} unread
            </span>
          )}
        </h1>

        <div className="admin-title-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={fetchNotifications}
            title="Refresh notifications"
            className="admin-action-btn-outline"
            aria-label="Refresh notifications"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              title="Mark all as read"
              className="admin-action-btn"
              aria-label="Mark all as read"
            >
              <CheckCheck size={15} />
            </button>
          )}
        </div>
      </div>
      <p className="admin-page-subtitle">
        Operational updates for client box orders, appointment confirmations, and menu preferences.
      </p>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--color-border, #ece7de)',
          marginBottom: '10px',
          paddingBottom: '1px',
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '5px 10px',
            borderRadius: '4px 4px 0 0',
            border: 'none',
            borderBottom: filter === 'all' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: filter === 'all' ? 'var(--color-primary, #2e3b12)' : '#716c62',
            fontSize: '0.74rem',
            fontWeight: filter === 'all' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '5px 10px',
            borderRadius: '4px 4px 0 0',
            border: 'none',
            borderBottom: filter === 'unread' ? '2px solid var(--color-primary, #2e3b12)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: filter === 'unread' ? 'var(--color-primary, #2e3b12)' : '#716c62',
            fontSize: '0.74rem',
            fontWeight: filter === 'unread' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.60rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0 5px',
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '16px', backgroundColor: '#f0eee8', borderRadius: '3px' }} />
                <div style={{ width: '70px', height: '12px', backgroundColor: '#f5f3ed', borderRadius: '3px' }} />
              </div>
              <div style={{ width: '50%', height: '14px', backgroundColor: '#ede8df', borderRadius: '3px' }} />
              <div style={{ width: '85%', height: '11px', backgroundColor: '#f5f3ed', borderRadius: '3px' }} />
            </div>
          ))}
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid var(--color-border, #ece7de)',
            padding: '24px 16px',
            textAlign: 'center',
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#f7f5ed',
              border: '1px solid #ede8df',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              color: 'var(--color-primary, #2e3b12)',
            }}
          >
            <Bell size={17} />
          </div>
          <h3 style={{ fontSize: '0.88rem', color: '#1a1814', margin: '0 0 4px', fontWeight: 600 }}>
            {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #716c62)', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            {filter === 'unread'
              ? 'All in-system notifications have been read. Switch to "All Notifications" to browse previous alerts.'
              : 'When clients book boxes, adjust meal selections, or update requirements, notifications will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {displayedNotifications.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif._id}
                onClick={() => handleCardClick(notif)}
                style={{
                  backgroundColor: isUnread ? '#fcfbf8' : '#ffffff',
                  borderRadius: '4px',
                  border: isUnread ? '1px solid #cbd5e1' : '1px solid var(--color-border, #ece7de)',
                  borderLeft: isUnread ? '3px solid var(--color-primary, #2e3b12)' : '1px solid var(--color-border, #ece7de)',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7f4ec';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isUnread ? '#fcfbf8' : '#ffffff';
                }}
              >
                {/* Header row: Preview badge, timestamp, unread dot */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Date / Time Preview Highlight Badge */}
                    {(notif.previewDate || notif.previewTime) && (
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          color: '#065f46',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '1.5px 6px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Calendar size={10} color="#065f46" />
                        <span>{notif.previewDate}</span>
                        {notif.previewTime && <span>• {notif.previewTime}</span>}
                      </span>
                    )}

                    {isUnread && (
                      <span
                        style={{
                          fontSize: '0.60rem',
                          fontWeight: 700,
                          color: '#b91c1c',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fca5a5',
                          padding: '0.5px 5px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                        Unseen
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8c857b', fontSize: '0.68rem' }}>
                    <Clock size={10} />
                    <span>{formatTimestamp(notif.createdAt)}</span>
                  </div>
                </div>

                {/* Notification Title & Body */}
                <div style={{ marginBottom: notif.link ? '4px' : '0' }}>
                  <h4
                    style={{
                      fontSize: '0.82rem',
                      color: isUnread ? '#1a1814' : '#332f28',
                      fontWeight: isUnread ? 700 : 600,
                      margin: '0 0 2px',
                    }}
                  >
                    {notif.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.74rem',
                      color: '#57534e',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {notif.message}
                  </p>
                </div>

                {/* Footer deep-link navigation hint */}
                {notif.link && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      color: 'var(--color-primary, #2e3b12)',
                    }}
                  >
                    <span>View Details</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
