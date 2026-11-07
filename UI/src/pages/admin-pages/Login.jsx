import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
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
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleSharedAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const defaultEmail = 'admin@privatechefmissy.com';
      const defaultPass = 'admin123';
      setFormData({ email: defaultEmail, password: defaultPass });
      await loginAdmin(defaultEmail, defaultPass);
      navigate(redirectUrl, { replace: true });
    } catch {
      setError('Shared authentication failed. Please enter your credentials manually.');
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
              color: '#1a240e',
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
        {/* Top-Right Language Switcher */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '28px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '9999px',
              border: '1px solid #e7e5e4',
              fontSize: '0.76rem',
              color: '#292524',
              fontWeight: 500,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="Language: English"
          >
            <GlobeIcon size={14} color="#445428" />
            <span>English</span>
            <span style={{ fontSize: '0.58rem', color: '#78716c', marginLeft: '1px' }}>▼</span>
          </div>
        </div>

        <div className="auth-form-container">
          {/* Title & Subtitle */}
          <div style={{ marginBottom: '22px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.85rem',
                fontWeight: 600,
                color: '#1a240e',
                margin: 0,
              }}
            >
              Admin Login
            </h2>
            <p
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
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.8rem',
                    color: '#1c1917',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#36441c')}
                  onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="admin-password"
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
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 34px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.8rem',
                    color: '#1c1917',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#36441c')}
                  onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
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

            {/* Remember Me & Forgot Password Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                fontSize: '0.74rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#292524',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#36441c', cursor: 'pointer' }}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                style={{
                  color: '#36441c',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
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
              {loading ? 'Authenticating...' : 'Login →'}
            </button>

            {/* Divider "or" */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '14px 0',
                color: '#a8a29e',
                fontSize: '0.72rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e5e4' }} />
              <span style={{ padding: '0 10px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e5e4' }} />
            </div>

            {/* Shared Authentication Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleSharedAuth}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: '#ffffff',
                color: '#292524',
                border: '1px solid #78716c',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fbf9f5';
                e.currentTarget.style.borderColor = '#36441c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#78716c';
              }}
            >
              <UsersIcon size={14} color="#36441c" />
              <span>Continue with Shared Authentication →</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
