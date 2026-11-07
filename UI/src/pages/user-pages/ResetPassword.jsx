import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import FormInput from '../../components/shared/FormInput';
import Button from '../../components/shared/Button';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      if (res.data?.user) {
        setUser(res.data.user);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 12px' }}>
      <Card style={{ width: '100%', maxWidth: '360px', padding: '14px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0 }}>Set New Password</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem', marginTop: '2px' }}>
            Choose a strong password for your client account
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.76rem',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.78rem',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Password updated successfully! You are now logged in.
            </div>
            <Link to="/catalogue">
              <Button variant="primary" style={{ width: '100%' }}>
                Proceed to Menu Catalogue &rarr;
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="New Password"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <FormInput
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
