import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ClocheIcon,
  HeartIcon,
  CalendarIcon,
  UserIcon,
} from '../../components/shared/Icons';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/home';
  const { user, registerClient } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
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

    if (!formData.name.trim()) {
      return setError('Please enter your full name.');
    }
    if (!formData.email.trim()) {
      return setError('Please enter your email address.');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters with a number and a letter.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!agreeTerms) {
      return setError('Please agree to the Terms & Conditions and Privacy Policy.');
    }

    setLoading(true);
    try {
      await registerClient(formData.name.trim(), formData.email.trim(), formData.password);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
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
            Create Your<br />
            Account
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
            Join Private Chef Missy and start creating personalised menus for your upcoming visits.
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
                <ClocheIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Browse &amp; Select
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Explore a curated menu of seasonal dishes.
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
                <HeartIcon size={15} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Save Your Favourites
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Keep track of the dishes you love.
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
                <CalendarIcon size={15} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Plan Your Visit
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Select dishes, specify servings and add special requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Create Account Form (Seamless, No Floating Card Border) */}
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
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.85rem',
                fontWeight: 600,
                color: '#1a240e',
                margin: 0,
              }}
            >
              Create Your Account
            </h2>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#78716c',
                margin: '5px 0 0',
                lineHeight: 1.4,
              }}
            >
              Join Private Chef Missy and start planning your menus.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: '7px 9px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                fontSize: '0.74rem',
                marginBottom: '12px',
                lineHeight: 1.35,
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '9px' }}>
              <label
                htmlFor="register-name"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '3px',
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <UserIcon size={14} color="#445428" />
                </span>
                <input
                  id="register-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 11px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.78rem',
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

            {/* Email Address */}
            <div style={{ marginBottom: '9px' }}>
              <label
                htmlFor="register-email"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '3px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <MailIcon size={14} color="#445428" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 11px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.78rem',
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
            <div style={{ marginBottom: '9px' }}>
              <label
                htmlFor="register-password"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '3px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <LockIcon size={14} color="#445428" />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 32px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.78rem',
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
                  {showPassword ? <EyeOffIcon size={14} color="#78716c" /> : <EyeIcon size={14} color="#78716c" />}
                </button>
              </div>
              <span style={{ display: 'block', fontSize: '0.64rem', color: '#78716c', marginTop: '2px' }}>
                Must be at least 8 characters with a number and a letter.
              </span>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="register-confirm-password"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#292524',
                  marginBottom: '3px',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <LockIcon size={14} color="#445428" />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 32px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #e7e5e4',
                    fontSize: '0.78rem',
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon size={14} color="#78716c" /> : <EyeIcon size={14} color="#78716c" />}
                </button>
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  fontSize: '0.71rem',
                  color: '#57534e',
                  lineHeight: 1.35,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginTop: '1px', accentColor: '#36441c', cursor: 'pointer' }}
                />
                <span>
                  I agree to the{' '}
                  <span style={{ color: '#292524', textDecoration: 'underline', fontWeight: 600 }}>
                    Terms &amp; Conditions
                  </span>{' '}
                  and{' '}
                  <span style={{ color: '#292524', textDecoration: 'underline', fontWeight: 600 }}>
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
            </div>

            {/* Primary Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: '#36441c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
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
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>

            {/* Divider "OR" */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '12px 0',
                color: '#a8a29e',
                fontSize: '0.7rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e5e4' }} />
              <span style={{ padding: '0 8px', letterSpacing: '1px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e5e4' }} />
            </div>

            {/* Already have an account? Log In Button */}
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '8px',
                backgroundColor: '#ffffff',
                color: '#292524',
                border: '1px solid #78716c',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 500,
                textDecoration: 'none',
                boxSizing: 'border-box',
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
              <UserIcon size={14} color="#36441c" />
              <span>Already have an account? Log In</span>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
