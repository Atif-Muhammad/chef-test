import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/shared/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import FormInput from '../../components/shared/FormInput';
import Loader from '../../components/shared/Loader';
import Table from '../../components/shared/Table';
import { CheckCircleIcon } from '../../components/shared/Icons';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Test Email state
  const [testEmail, setTestEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      setData(res.data);
      setName(res.data.admin?.name || '');
      setEmail(res.data.admin?.email || '');
      setTestEmail(res.data.admin?.email || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.put('/admin/settings/profile', {
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setProfileMsg(res.data.message || 'Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setSendingTest(true);
    setEmailMsg('');
    try {
      const res = await api.post('/admin/settings/test-email', { targetEmail: testEmail });
      setEmailMsg(res.data.message);
    } catch (err) {
      setEmailMsg(`Error: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) return <Loader message="Loading system settings..." />;

  const reminderColumns = [
    {
      header: 'Client & Scheduled Visit',
      accessor: 'userId',
      render: (row) => (
        <div>
          <strong style={{ fontSize: '0.80rem', color: '#1a1814', display: 'block' }}>
            {row.userId?.name || 'Private Client'}
          </strong>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
            {new Date(row.visitDate).toLocaleDateString()} &bull; {row.guests || 2} guests
          </span>
        </div>
      ),
    },
    {
      header: 'Reminder Status',
      accessor: 'reminderSent',
      render: (row) => (
        <span
          className={`badge ${row.reminderSent ? 'badge-primary' : 'badge-time-intensive'}`}
          style={{ fontSize: '0.66rem', padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {row.reminderSent ? (
            <>
              <CheckCircleIcon size={11} color="#ffffff" /> Reminder Sent
            </>
          ) : (
            <>
              <Clock size={11} color="#92400e" style={{ flexShrink: 0 }} /> Queued (48h Window)
            </>
          )}
        </span>
      ),
    },
    {
      header: '',
      accessor: '_id',
      width: '38px',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/selections?visit=${row._id}`)}
          title="View Visit Details"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            border: '1px solid #e7e2d8',
            backgroundColor: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Clock size={13} color="#4a453e" />
        </button>
      ),
    },
  ];

  return (
    <div className="admin-page-container" style={{ maxWidth: '900px' }}>
      {/* Title Row with Action Button at the End (justify-between) */}
      <div className="admin-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          System Settings
        </h1>
        <div className="admin-title-actions">
          <button
            type="button"
            onClick={handleLogout}
            className="admin-action-btn"
            title="Sign Out of Admin"
            aria-label="Sign Out of Admin"
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
      <p className="admin-page-subtitle">
        Chef Missy admin credentials, email notification provider & automatic reminder monitor.
      </p>

      <div className="admin-two-col-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
        {/* Admin Account Settings */}
        <Card>
          <h3 style={{ fontSize: '0.92rem', color: '#1a1814', marginBottom: 'var(--spacing-sm)' }}>
            Admin Profile & Security
          </h3>
          {profileMsg && (
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: profileMsg.startsWith('Error') ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                color: profileMsg.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.74rem',
                marginBottom: '8px',
              }}
            >
              {profileMsg}
            </div>
          )}
          <form onSubmit={handleUpdateProfile}>
            <FormInput
              label="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginBottom: '6px' }}
            />
            <FormInput
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: '6px' }}
            />
            <FormInput
              label="Current Password (leave blank if keeping unchanged)"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={{ marginBottom: '6px' }}
            />
            <FormInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              style={{ marginBottom: '10px' }}
            />
            <Button type="submit" variant="primary" size="sm" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </Card>

        {/* Email Provider Status */}
        <Card>
          <h3 style={{ fontSize: '0.92rem', color: '#1a1814', marginBottom: 'var(--spacing-sm)' }}>
            Email Notifications (PRD § 26)
          </h3>
          <div style={{ padding: '8px 10px', backgroundColor: '#faf8f4', border: '1px solid #f0eee8', borderRadius: 'var(--border-radius-sm)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
              <strong>{data?.emailConfig?.provider}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Sender From:</span>
              <code>{data?.emailConfig?.fromEmail}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>SMTP Host:</span>
              <span>{data?.emailConfig?.smtpHost}</span>
            </div>
          </div>

          <h4 style={{ fontSize: '0.82rem', color: '#1a1814', marginBottom: '6px' }}>Dispatch Test Notification</h4>
          {emailMsg && (
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: emailMsg.startsWith('Error') ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                color: emailMsg.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.74rem',
                marginBottom: '8px',
              }}
            >
              {emailMsg}
            </div>
          )}
          <form onSubmit={handleSendTestEmail}>
            <FormInput
              label="Recipient Email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              required
              style={{ marginBottom: '8px' }}
            />
            <Button type="submit" variant="secondary" size="sm" disabled={sendingTest}>
              {sendingTest ? 'Sending...' : 'Send Test Diagnostic Email'}
            </Button>
          </form>
        </Card>
      </div>

      {/* 48-Hour Reminder Scheduler Monitor */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', color: '#1a1814', margin: 0 }}>
              48-Hour Automated Reminders Schedule (Next 7 Days)
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', margin: '2px 0 0' }}>
              Cron daemon runs daily. Reminders are idempotently marked to prevent duplicate emails (PRD § 49)
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchSettings} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            ↻ Refresh
          </Button>
        </div>

        <Table
          columns={reminderColumns}
          data={data?.upcomingReminders || []}
          emptyMessage="No upcoming visits scheduled in the next 7 days."
        />
      </Card>
    </div>
  );
}
