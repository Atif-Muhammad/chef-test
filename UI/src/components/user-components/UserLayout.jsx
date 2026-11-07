import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarCulinaryArt from '../shared/SidebarCulinaryArt';
import CulinaryWatermarks from '../shared/CulinaryWatermarks';
import api from '../../config/shared/api';

export default function UserLayout() {
  const { user, cart } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('notifications-updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-updated', handleUpdate);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // Ignored
    }
  };

  const navLinks = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      to: '/catalogue',
      label: 'Browse Menu',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20M14 2v20M6 2v6a4 4 0 0 0 4 4v10M6 2a4 4 0 0 1 4 4v2"></path>
        </svg>
      ),
    },
    {
      to: '/cart',
      label: 'Pack Your Box',
      badge: cart.dishes.length > 0 ? cart.dishes.length : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      to: '/favourites',
      label: 'Favourites',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'Previous Selections',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 14 14"></polyline>
        </svg>
      ),
    },
    {
      to: '/notifications',
      label: 'Notifications',
      badge: unreadCount > 0 ? unreadCount : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];

  return (
    <div className="grain-texture" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
      {/* Background Culinary Watermarks (Herbs, Fork, Knife, Plate/Cloche, Pepper Mill, Crest) */}
      <CulinaryWatermarks />

      {/* Client Left Sidebar - Compact 210px with zero vertical overflow */}
      <aside
        style={{
          width: '210px',
          minWidth: '210px',
          backgroundColor: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          maxHeight: '100vh',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        {/* Logo Crest */}
        <div style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Link to="/" style={{ display: 'block', textAlign: 'center' }}>
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Meal Prep"
              style={{ width: '74px', height: 'auto', display: 'block', margin: '0 auto' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* User Navigation Links - Matching admin typography scale and prominence */}
        <nav style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#4a463e',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#ffffff' : '#6b665c' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#ffffff' : 'var(--color-primary)',
                        color: isActive ? 'var(--color-primary)' : '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Bottom Culinary Art Card - Anchored at bottom */}
        <div style={{ marginTop: 'auto', padding: '4px 10px 10px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <SidebarCulinaryArt />
        </div>
      </aside>

      {/* Main Container - Full Height without topbar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* View Content */}
        <main style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
