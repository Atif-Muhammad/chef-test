import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/shared/api';
import {
  MailIcon,
  ShieldIcon,
  UtensilsIcon,
} from '../../components/shared/Icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email.trim()) {
      return setError('Please enter your email address.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setStatusMessage(res.data.message || 'If an account exists, a reset link has been dispatched to your email.');
    } catch (err) {
      setError(err.message || 'Error requesting password reset. Please try again.');
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
            Reset Your<br />
            Password
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
            No worries! Enter your email address and we'll send you a link to reset your password.
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
                <MailIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Secure Process
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  We'll send a secure reset link to your email.
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
                <ShieldIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Keep Your Account Safe
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Your information is always protected.
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
                <UtensilsIcon size={16} color="#36441c" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#1a240e' }}>
                  Get Back to Your Menus
                </h4>
                <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#656056' }}>
                  Reset your password and continue planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Forgot Your Password Form (Seamless, No Floating Card Border) */}
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
              Forgot Your Password?
            </h2>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#78716c',
                margin: '6px 0 0',
                lineHeight: 1.45,
              }}
            >
              Enter the email address associated with your account and we'll send you a link to reset your password.
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

          {/* Status / Success Banner */}
          {statusMessage ? (
            <div>
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.78rem',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                }}
              >
                {statusMessage}
              </div>

              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '9px',
                  backgroundColor: '#ffffff',
                  color: '#292524',
                  border: '1px solid #78716c',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <span>&larr; Back to Log In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Email Address */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="forgot-email"
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
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              {/* Send Reset Link Button */}
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
                {loading ? 'Sending link...' : 'Send Reset Link →'}
              </button>

              {/* Divider "OR" */}
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
                <span style={{ padding: '0 10px', letterSpacing: '1px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e5e4' }} />
              </div>

              {/* Back to Log In Button */}
              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '9px',
                  backgroundColor: '#ffffff',
                  color: '#292524',
                  border: '1px solid #78716c',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
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
                <span>&larr; Back to Log In</span>
              </Link>
            </form>
          )}

          
        </div>
      </div>
    </div>
  );
}
