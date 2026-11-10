import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ChefHatIcon,
  UtensilsIcon,
  HeartIcon,
} from '../../components/shared/Icons';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/home';
  const { user, loginClient } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    searchParams.get('terminated') === '1'
      ? 'Your account has been terminated by administrator. Access revoked.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  // If already authenticated as client, redirect to catalogue or target subpage
  useEffect(() => {
    if (user && user.role === 'client') {
      navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginClient(formData.email.trim(), formData.password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Side: Brand Story, Taglines & 3 Highlight Pillars */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          {/* Logo Crest with mixBlendMode to remove white background */}
          <div style={{ marginBottom: '16px' }}>
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Logo"
              style={{
                width: '115px',
                height: 'auto',
                display: 'block',
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* Kicker */}
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
            Fresh Ingredients &bull; Thoughtful Menus &bull; Made For You
          </span>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.25rem',
              fontWeight: 600,
              color: '#1a240e',
              lineHeight: 1.15,
              margin: '0 0 12px',
            }}
          >
            Your Personal<br />
            Menu Experience
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '0.85rem',
              color: '#5c564c',
              lineHeight: 1.5,
              margin: '0 0 28px',
              maxWidth: '380px',
            }}
          >
            Browse, select and personalise your menu for an unforgettable private dining experience.
          </p>

          {/* 3 Value Pillars */}
          <div className="auth-left-pillars" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Pillar 1 */}
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
                <UtensilsIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Curated Dishes
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  A wide selection of seasonal dishes, full of flavour.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
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
                <ChefHatIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Personalised for You
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Select your favourites and add special requests.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
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
                <HeartIcon size={15} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  A Seamless Experience
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Thoughtfully prepared, just for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form (Seamless, No Floating Card Border) */}
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
              Fresh &bull; Thoughtful &bull; Curated
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="auth-form-header" style={{ marginBottom: '20px' }}>
            <h2
              className="auth-form-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.85rem',
                fontWeight: 600,
                color: '#1a240e',
                margin: 0,
              }}
            >
              Welcome Back
            </h2>
            <p
              className="auth-form-subtitle"
              style={{
                fontSize: '0.82rem',
                color: '#78716c',
                margin: '6px 0 0',
                lineHeight: 1.45,
              }}
            >
              Log in to your account to continue
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

          {/* Box Invitation Notice */}
          {redirectUrl.includes('visitId=') && (
            <div
              style={{
                padding: '9px 12px',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                borderRadius: '4px',
                border: '1px solid #fde68a',
                fontSize: '0.75rem',
                marginBottom: '14px',
                lineHeight: 1.4,
              }}
            >
              Chef Missy has invited you to complete your meal box reservation. Please sign in to review and pack your box.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div style={{ marginBottom: '11px' }}>
              <label
                htmlFor="client-email"
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
                  <MailIcon size={14} color="#445428" />
                </span>
                <input
                  id="client-email"
                  className="auth-form-input"
                  type="email"
                  required
                  placeholder="your@email.com"
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
                    e.target.style.borderColor = '#36441c';
                    e.target.style.boxShadow = '0 0 0 1px #36441c';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#8c8273';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '6px' }}>
              <label
                htmlFor="client-password"
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
                  <LockIcon size={14} color="#445428" />
                </span>
                <input
                  id="client-password"
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
                    e.target.style.borderColor = '#36441c';
                    e.target.style.boxShadow = '0 0 0 1px #36441c';
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

            {/* Forgot Password Link */}
            <div className="auth-forgot-row" style={{ textAlign: 'right', marginBottom: '16px' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.72rem',
                  color: '#57534e',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Primary Log In Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#36441c',
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
                boxShadow: '0 3px 10px rgba(54, 68, 28, 0.2)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#293515';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#36441c';
              }}
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>

            {/* Bottom Register Link */}
            <div className="auth-footer-text" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.74rem', color: '#78716c' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#292524',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
