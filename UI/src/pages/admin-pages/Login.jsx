import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UsersIcon,
} from '../../components/shared/Icons';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
  const { user, loginAdmin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated as admin, redirect to target dashboard or subpage
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(formData.email.trim(), formData.password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Side: Brand Crest, Tagline & Aesthetics */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          {/* Logo Crest with mixBlendMode to remove white background */}
          <div style={{ marginBottom: '16px' }}>
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Logo"
              style={{
                width: '120px',
                height: 'auto',
                display: 'block',
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          <span
            style={{
              fontSize: '0.64rem',
              letterSpacing: '2px',
              color: '#7a7366',
              fontWeight: 600,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Management &bull; Culinary Operations
          </span>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.25rem',
              fontWeight: 600,
              color: '#2c3917',
              lineHeight: 1.15,
              margin: '0 0 14px',
            }}
          >
            Healthy Meals.<br />
            Happier Lives.
          </h1>

          {/* Gold Accent Divider Bar */}
          <div
            style={{
              width: '40px',
              height: '3px',
              backgroundColor: '#c5a059',
              marginBottom: '16px',
            }}
          />

          {/* Subtext */}
          <p
            style={{
              fontSize: '0.85rem',
              color: '#5c564c',
              lineHeight: 1.5,
              margin: '0 0 28px',
              maxWidth: '320px',
            }}
          >
            Fresh ingredients. Thoughtful menus.<br />
            Made for you.
          </p>

          {/* Admin Pillars */}
          <div className="auth-left-pillars" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f0e6',
                  border: '1px solid #e8dfcf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UsersIcon size={15} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Client Ordering & Coordination
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Review submitted menus, servings and dietary preferences.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f0e6',
                  border: '1px solid #e8dfcf',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LockIcon size={14} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Secure Administrative Control
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Protected chef console and inventory orchestration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Admin Login Form (No Floating Card Border) */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {/* Mobile Brand Crest (Visible only on mobile when left panel is hidden) */}
          <div className="auth-mobile-brand" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Logo"
              style={{
                width: '64px',
                height: 'auto',
                margin: '0 auto 6px',
                display: 'block',
                mixBlendMode: 'multiply',
              }}
            />
            <span
              style={{
                fontSize: '0.62rem',
                letterSpacing: '2px',
                color: '#7a7366',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
              }}
            >
              Chef Missy &bull; Admin Console
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="auth-form-header" style={{ marginBottom: '20px' }}>
            <h2
              className="auth-form-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.85rem',
                fontWeight: 600,
                color: '#2c3917',
                margin: 0,
              }}
            >
              Admin Login
            </h2>
            <p
              className="auth-form-subtitle"
              style={{
                fontSize: '0.82rem',
                color: '#78716c',
                margin: '6px 0 0',
                maxWidth: '320px',
                lineHeight: 1.45,
              }}
            >
              Access the Private Chef Missy admin panel using your administrative credentials.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                fontSize: '0.75rem',
                marginBottom: '14px',
                lineHeight: 1.35,
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div style={{ marginBottom: '11px' }}>
              <label
                htmlFor="admin-email"
                className="auth-form-label"
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '4px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <MailIcon size={14} color="#485c24" />
                </span>
                <input
                  id="admin-email"
                  className="auth-form-input"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1.5px solid #8c8273',
                    fontSize: '0.8rem',
                    color: '#1c1917',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#485c24';
                    e.target.style.boxShadow = '0 0 0 1px #485c24';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#8c8273';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="admin-password"
                className="auth-form-label"
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '4px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <LockIcon size={14} color="#485c24" />
                </span>
                <input
                  id="admin-password"
                  className="auth-form-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 34px 8px 34px',
                    borderRadius: '8px',
                    border: '1.5px solid #8c8273',
                    fontSize: '0.8rem',
                    color: '#1c1917',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#485c24';
                    e.target.style.boxShadow = '0 0 0 1px #485c24';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#8c8273';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon size={15} color="#78716c" /> : <EyeIcon size={15} color="#78716c" />}
                </button>
              </div>
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#485c24',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 3px 10px rgba(72, 92, 36, 0.25)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#3b4c1c';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#485c24';
              }}
            >
              {loading ? 'Authenticating...' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
