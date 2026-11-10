import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import CulinaryWatermarks from '../shared/CulinaryWatermarks';
import api from '../../config/shared/api';

export default function AdminLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Screen size detection for responsive mobile drawer
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('notifications-updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-updated', handleUpdate);
    };
  }, []);

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
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      to: '/admin/dishes',
      label: 'Dishes',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20M14 2v20M6 2v6a4 4 0 0 0 4 4v10M6 2a4 4 0 0 1 4 4v2"></path>
        </svg>
      ),
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
    },
    {
      to: '/admin/ingredients',
      label: 'Ingredients',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
    },
    {
      to: '/admin/allergens',
      label: 'Allergens',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <line x1="12" y1="8" x2="12" y2="14"></line>
          <line x1="9" y1="11" x2="15" y2="11"></line>
        </svg>
      ),
    },
    {
      to: '/admin/recipes',
      label: 'Private Recipes',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
    },
    {
      to: '/admin/selections',
      label: 'Client Selections',
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
      to: '/admin/shopping-lists',
      label: 'Shopping Lists',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 12h6M9 16h6"></path>
        </svg>
      ),
    },
    {
      to: '/admin/clients',
      label: 'Clients',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      to: '/admin/notifications',
      label: 'Notifications',
      badge: unreadCount > 0 ? unreadCount : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="grain-texture" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
      {/* Background Culinary Watermarks (Herbs, Fork, Knife, Plate/Cloche, Pepper Mill, Crest) */}
      <CulinaryWatermarks />

      {/* Mobile Backdrop Overlay - Fades in when drawer is revealed */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 26, 12, 0.48)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 90,
            transition: 'opacity 0.25s ease',
            animation: 'fadeIn 0.25s ease forwards',
          }}
        />
      )}

      {/* Sidebar - Desktop Docked (210px) / Mobile Off-Canvas Drawer (260px) animated from left */}
      <aside
        style={{
          width: isMobile ? '260px' : '210px',
          minWidth: isMobile ? '260px' : '210px',
          maxWidth: '85vw',
          backgroundColor: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: isMobile ? 0 : 'auto',
          height: '100vh',
          maxHeight: '100vh',
          zIndex: isMobile ? 100 : 50,
          overflow: 'hidden',
          boxShadow: isMobile && mobileOpen ? '6px 0 28px rgba(46, 59, 18, 0.22)' : 'none',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: isMobile ? 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease' : 'none',
          willChange: isMobile ? 'transform' : 'auto',
        }}
      >
        {/* Brand Crest Header + Mobile Close Button */}
        <div
          style={{
            padding: isMobile ? '12px 14px 10px' : '10px 14px 4px',
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'center',
            alignItems: 'center',
            flexShrink: 0,
            borderBottom: isMobile ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <Link
            to="/admin/dashboard"
            onClick={() => isMobile && setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Meal Prep"
              style={{ width: isMobile ? '52px' : '74px', height: 'auto', display: 'block', margin: isMobile ? '0' : '0 auto' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {isMobile && (
              <div>
                <div style={{ fontFamily: "var(--font-heading, 'Cormorant Garamond', Georgia, serif)", fontStyle: 'italic', fontSize: '1.02rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.1 }}>
                  Chef Missy
                </div>
                <div style={{ fontSize: '0.62rem', color: '#8c7b68', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Admin Portal
                </div>
              </div>
            )}
          </Link>

          {/* Close drawer 'X' button on mobile */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: '#655e53',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Navigation items - flexShrink 0 to keep all items perfectly visible */}
        <nav style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0, overflowY: isMobile ? 'auto' : 'visible' }}>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.84rem',
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
                        backgroundColor: isActive ? '#ffffff' : '#dc2626',
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
      </aside>

      {/* Main Content Area - Full height with mobile header bar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Mobile Sticky Header Bar with Burger Menu Button (visible on mobile only) */}
        <header
          className="admin-mobile-header"
          style={{
            height: '52px',
            backgroundColor: 'var(--color-sidebar-bg)',
            borderBottom: '1px solid var(--color-border)',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 8px' : '0 14px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            flexShrink: 0,
          }}
        >
          {/* Burger Menu Button - Reveals Sidebar Animated from Left */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(46, 59, 18, 0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Center Brand Title */}
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy"
              style={{ width: '38px', height: 'auto', display: 'block' }}
            />
            <span style={{ fontFamily: "var(--font-heading, 'Cormorant Garamond', Georgia, serif)", fontStyle: 'italic', fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Chef Missy Admin
            </span>
          </Link>

          {/* Right Notifications Shortcut */}
          <Link
            to="/admin/notifications"
            aria-label="Notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#ffffff',
              color: '#4a463e',
              position: 'relative',
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(46, 59, 18, 0.05)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  border: '1.5px solid #ffffff',
                }}
              />
            )}
          </Link>
        </header>

        {/* View Outlet - Responsive padding for mobile and desktop */}
        <main style={{ padding: isMobile ? '6px 4px 14px' : '16px 20px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
