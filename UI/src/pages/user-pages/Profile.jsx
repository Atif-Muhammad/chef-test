import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Utensils,
  ShieldAlert,
  Camera,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  Heart,
  Edit3,
  X,
  Leaf,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/shared/api';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import { formatLocalDate } from '../../utils/formatters';

const DIETARY_PRESETS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Pescatarian',
  'Halal',
  'Kosher',
  'Keto',
  'Low Carb',
  'Low Sodium',
];

const DEFAULT_FALLBACK_ALLERGENS = [
  'Gluten',
  'Dairy',
  'Shellfish',
  'Fish',
  'Eggs',
  'Peanuts',
  'Tree Nuts',
  'Soy',
  'Sesame',
  'Celery',
  'Mustard',
  'Sulphites',
  'Lupin',
  'Molluscs',
];

const DIETARY_PALETTES = [
  { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
];

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Master Allergens from Admin Catalog
  const [masterAllergens, setMasterAllergens] = useState([]);
  const [loadingAllergens, setLoadingAllergens] = useState(false);

  // Profile Stats & Favorites Preview
  const [totalVisits, setTotalVisits] = useState(0);
  const [favourites, setFavourites] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // UI state for photo upload & notifications
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('personal'); // 'personal' | 'dietary' | 'allergies' | 'notes'
  const [savingProfile, setSavingProfile] = useState(false);
  const [modalError, setModalError] = useState('');

  // Editable form state inside modal
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    dob: '',
    gender: '',
    specialRequests: '',
    dislikedIngredients: '',
  });
  const [editSelectedDietary, setEditSelectedDietary] = useState([]);
  const [editOtherDietary, setEditOtherDietary] = useState('');
  const [editSelectedAllergens, setEditSelectedAllergens] = useState([]);
  const [editOtherAllergies, setEditOtherAllergies] = useState('');

  // Fetch Master Allergens from backend admin collection
  useEffect(() => {
    let mounted = true;
    const fetchAllergens = async () => {
      setLoadingAllergens(true);
      try {
        const res = await api.get('/allergens');
        if (mounted && res.data?.allergens && res.data.allergens.length > 0) {
          setMasterAllergens(res.data.allergens.map((a) => (typeof a === 'string' ? a : a.name)));
        } else if (mounted) {
          setMasterAllergens(DEFAULT_FALLBACK_ALLERGENS);
        }
      } catch (err) {
        if (mounted) {
          setMasterAllergens(DEFAULT_FALLBACK_ALLERGENS);
        }
      } finally {
        if (mounted) setLoadingAllergens(false);
      }
    };

    fetchAllergens();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Visits count & Favourites preview
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [visitsRes, favsRes] = await Promise.allSettled([
          api.get('/visits/history'),
          api.get('/favourites'),
        ]);

        if (mounted) {
          if (visitsRes.status === 'fulfilled') {
            const list = visitsRes.value.data?.visits || [];
            setTotalVisits(list.length);
          }
          if (favsRes.status === 'fulfilled') {
            const favList = favsRes.value.data?.favourites || [];
            setFavourites(favList);
          }
        }
      } catch {
        // Quiet fallback
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync / populate edit modal fields whenever modal opens or user updates
  const syncEditFields = (targetTab = 'personal') => {
    if (!user) return;

    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      dob: user.dob || '',
      gender: user.gender || '',
      specialRequests: user.specialRequests || '',
      dislikedIngredients: Array.isArray(user.dislikedIngredients)
        ? user.dislikedIngredients.join(', ')
        : '',
    });

    // Populate Dietary
    if (Array.isArray(user.dietaryPreferences)) {
      const matched = [];
      const unmatched = [];
      user.dietaryPreferences.forEach((pref) => {
        if (!pref) return;
        const found = DIETARY_PRESETS.find((p) => p.toLowerCase() === pref.toLowerCase().trim());
        if (found) {
          matched.push(found);
        } else {
          unmatched.push(pref.trim());
        }
      });
      setEditSelectedDietary([...new Set(matched)]);
      setEditOtherDietary(unmatched.join(', '));
    } else {
      setEditSelectedDietary([]);
      setEditOtherDietary('');
    }

    // Populate Allergens
    if (Array.isArray(user.allergies)) {
      const matched = [];
      const unmatched = [];
      const targetList = masterAllergens.length > 0 ? masterAllergens : DEFAULT_FALLBACK_ALLERGENS;
      user.allergies.forEach((alg) => {
        if (!alg) return;
        const clean = alg.trim();
        const found = targetList.find(
          (m) =>
            m.toLowerCase() === clean.toLowerCase() ||
            clean.toLowerCase().includes(m.toLowerCase()) ||
            m.toLowerCase().includes(clean.toLowerCase())
        );
        if (found) {
          matched.push(found);
        } else {
          unmatched.push(clean);
        }
      });
      setEditSelectedAllergens([...new Set(matched)]);
      setEditOtherAllergies(unmatched.join(', '));
    } else {
      setEditSelectedAllergens([]);
      setEditOtherAllergies('');
    }

    setModalError('');
    setModalTab(targetTab);
    setIsEditModalOpen(true);
  };

  // Open modal at specific tab
  const handleOpenEdit = (tab = 'personal') => {
    syncEditFields(tab);
  };

  // Close modal
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setModalError('');
  };

  // Keyboard escape listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        handleCloseEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen]);

  // Handle Client Profile Photo Upload -> /uploads/clients/[clientid]/[filename]
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setErrorMessage('');
    setSavedMessage('');

    try {
      const data = new FormData();
      data.append('photo', file);

      const res = await api.post('/profile/photo', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = res.data?.user || { ...user, photoUrl: res.data?.photoUrl };
      setUser(updatedUser);
      setAvatarImgError(false);
      setSavedMessage('Profile photo updated successfully.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Toggle dietary preset inside modal
  const toggleEditDietary = (preset) => {
    setEditSelectedDietary((prev) =>
      prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]
    );
  };

  // Toggle allergen inside modal
  const toggleEditAllergen = (allergen) => {
    setEditSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  // Save profile changes via API
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.name.trim()) {
      setModalError('Full Name is required.');
      return;
    }

    setSavingProfile(true);
    setModalError('');

    try {
      // Disliked ingredients array
      const dislikedList = editFormData.dislikedIngredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Dietary preferences array
      const customDietary = editOtherDietary
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const combinedDietary = [...new Set([...editSelectedDietary, ...customDietary])];

      // Allergies array
      const customAllergies = editOtherAllergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const combinedAllergies = [...new Set([...editSelectedAllergens, ...customAllergies])];

      const payload = {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        location: editFormData.location.trim(),
        dob: editFormData.dob.trim(),
        gender: editFormData.gender.trim(),
        specialRequests: editFormData.specialRequests.trim(),
        dislikedIngredients: dislikedList,
        dietaryPreferences: combinedDietary,
        allergies: combinedAllergies,
      };

      const res = await api.put('/profile', payload);

      if (res.data?.user) {
        setUser(res.data.user);
      } else if (user) {
        setUser({ ...user, ...payload });
      }

      setSavedMessage('Profile and dining preferences updated successfully.');
      setIsEditModalOpen(false);
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Client';
  const initial = displayName.charAt(0).toUpperCase();
  const allergenListToRender =
    masterAllergens.length > 0 ? masterAllergens : DEFAULT_FALLBACK_ALLERGENS;

  const userDietaryList = Array.isArray(user?.dietaryPreferences) ? user.dietaryPreferences : [];
  const userAllergiesList = Array.isArray(user?.allergies) ? user.allergies : [];
  const userDislikedList = Array.isArray(user?.dislikedIngredients) ? user.dislikedIngredients : [];

  const memberSince = user?.createdAt
    ? formatLocalDate(user.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Member';

  return (
    <div className="user-page-container">
      {/* Page Title & Breadcrumb Header */}
      <div className="user-title-row">
        <div>
          <h1 className="user-page-title">
            My Profile & Preferences
          </h1>
          <p className="user-page-subtitle">
            Manage your personal dossier, dietary regimen, allergen safeguards, and bespoke culinary notes.
          </p>
        </div>

        {/* Quick Edit Profile Action Button */}
        <div className="user-title-actions">
          <button
            type="button"
            className="user-action-btn"
            onClick={() => handleOpenEdit('personal')}
            title="Edit Profile"
            style={{ padding: '0 12px' }}
          >
            <Edit3 size={14} />
            <span className="user-btn-text">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {savedMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '4px',
            backgroundColor: '#f1f6ec',
            color: '#2e3b12',
            fontSize: '0.78rem',
            marginBottom: '16px',
            border: '1px solid #d9e4cf',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#2e3b12" />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '4px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontSize: '0.78rem',
            marginBottom: '16px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TOP PROFILE CARD (Clean, Full-Width, Luxurious - No Squished Right Promo Image) */}
      <div
        className="profile-top-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '20px 22px',
          marginBottom: '20px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div
          className="profile-top-card-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '18px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Avatar & Identity */}
          <div className="profile-identity-wrap" style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: '1 1 auto' }}>
            {/* Avatar with Photo Upload */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                className="profile-avatar-wrap"
                style={{
                  width: '66px',
                  height: '66px',
                  borderRadius: '50%',
                  backgroundColor: '#2e3b12',
                  color: '#ffffff',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}
              >
                {user?.photoUrl && !avatarImgError ? (
                  <img
                    src={user.photoUrl}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setAvatarImgError(true)}
                  />
                ) : (
                  initial
                )}

                {uploadingPhoto && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.55)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                )}
              </div>

              {/* Camera icon button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Upload Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4cdc5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#2e3b12',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              >
                <Camera size={12} />
              </button>

              {/* Hidden Photo File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* User Meta Information */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2
                  className="profile-name-title"
                  style={{
                    fontSize: '1.25rem',
                    color: '#1a1814',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  {displayName}
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Active Client
                </span>
              </div>

              <div className="profile-meta-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {user?.email && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      color: '#655e53',
                      minWidth: 0,
                    }}
                  >
                    <Mail size={12} color="#716c62" style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {user.email}
                    </span>
                  </div>
                )}

                {(user?.location || user?.phone) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                      fontSize: '0.72rem',
                      color: '#655e53',
                      marginTop: '1px',
                    }}
                  >
                    {user?.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={12} color="#716c62" style={{ flexShrink: 0 }} />
                        <span>{user.location}</span>
                      </span>
                    )}
                    {user?.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={12} color="#716c62" style={{ flexShrink: 0 }} />
                        <span>{user.phone}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="profile-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="profile-btn-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ece7de',
                backgroundColor: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#2e3b12',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf8f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Camera size={13} /> Change Photo
                </>
              )}
            </button>

            <button
              type="button"
              className="profile-btn-edit"
              onClick={() => handleOpenEdit('personal')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                backgroundColor: '#2e3b12',
                border: '1px solid #2e3b12',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3b4b18')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2e3b12')}
            >
              <Edit3 size={13} /> Edit Profile
            </button>

            <button
              type="button"
              className="profile-btn-signout"
              onClick={handleLogout}
              title="Sign Out of Account"
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: '1px solid #fecaca',
                backgroundColor: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#dc2626',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* 4-Metric Summary Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: '#fbf9f5',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            marginTop: '16px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#716c62',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <Calendar size={11} /> Client Since
            </span>
            <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a1814' }}>
              {memberSince}
            </span>
          </div>

          <div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#716c62',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <Utensils size={11} /> Total Orders / Boxes
            </span>
            <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a1814' }}>
              {loadingStats ? '—' : `${totalVisits} ${totalVisits === 1 ? 'Box' : 'Boxes'}`}
            </span>
          </div>

          <div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#716c62',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <Leaf size={11} /> Dietary Regimens
            </span>
            <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a1814' }}>
              {userDietaryList.length > 0
                ? `${userDietaryList.length} Active`
                : 'Standard Gourmet'}
            </span>
          </div>

          <div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#716c62',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <ShieldAlert size={11} /> Allergy Safeguards
            </span>
            {userAllergiesList.length > 0 ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#991b1b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                  }}
                />
                {userAllergiesList.length} Declared
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} color="#15803d" /> No Conflicts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* READ-ONLY DOSSIER CARDS (Multi-Column Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
          marginBottom: '20px',
        }}
      >
        {/* CARD 1: Personal & Contact Details */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #f2ede4',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <User size={15} color="#2e3b12" />
                <h3
                  style={{
                    fontSize: '0.92rem',
                    color: '#1a1814',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  Personal Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit('personal')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3b12',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 14px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                  Full Name
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#1a1814', wordBreak: 'break-word' }}>
                  {user?.name || '—'}
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                    Email Address
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: '#065f46',
                      backgroundColor: '#ecfdf5',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Lock size={8} /> Verified
                  </span>
                </div>
                <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#1a1814', wordBreak: 'break-all' }}>
                  {user?.email || '—'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                  Phone Number
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#1a1814', wordBreak: 'break-word' }}>
                  {user?.phone || 'Not provided'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                  Delivery Location
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#1a1814', wordBreak: 'break-word' }}>
                  {user?.location || 'Not provided'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                  Date of Birth
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#1a1814' }}>
                  {user?.dob || 'Not specified'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block' }}>
                  Gender
                </span>
                <span style={{ fontSize: '0.80rem', fontWeight: 500, color: '#1a1814' }}>
                  {user?.gender || 'Prefer not to say'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Dietary Preferences & Regimens */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #f2ede4',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Leaf size={15} color="#2e3b12" />
                <h3
                  style={{
                    fontSize: '0.92rem',
                    color: '#1a1814',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  Dietary Preferences
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit('dietary')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3b12',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>

            {userDietaryList.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {userDietaryList.map((pref, idx) => {
                  const style = DIETARY_PALETTES[idx % DIETARY_PALETTES.length];
                  return (
                    <span
                      key={pref}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '4px',
                        backgroundColor: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      {pref}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '4px',
                  backgroundColor: '#faf8f5',
                  border: '1px solid #ece7de',
                  fontSize: '0.74rem',
                  color: '#716c62',
                  marginBottom: '12px',
                }}
              >
                Standard Gourmet — No specific dietary restrictions specified. All menus and dishes are available.
              </div>
            )}
          </div>

          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid #f2ede4',
              fontSize: '0.70rem',
              color: '#8c857b',
            }}
          >
            Menus and seasonal box recommendations automatically prioritize recipes adhering to your dietary regimen.
          </div>
        </div>

        {/* CARD 3: Allergy Profile & Kitchen Safeguards */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #f2ede4',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <ShieldAlert size={15} color="#dc2626" />
                <h3
                  style={{
                    fontSize: '0.92rem',
                    color: '#1a1814',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  Allergy Profile & Safeguards
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit('allergies')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>

            {userAllergiesList.length > 0 ? (
              <>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#991b1b', lineHeight: 1.4 }}>
                    <strong>Kitchen Safeguard Active:</strong> All selected dishes are scanned against these allergens.
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {userAllergiesList.map((alg) => (
                    <span
                      key={alg}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '4px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#dc2626',
                        }}
                      />
                      {alg}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '4px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <CheckCircle2 size={16} color="#166534" />
                <span>No declared food allergies. Standard kitchen ingredients and seasonings permitted.</span>
              </div>
            )}
          </div>

          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid #f2ede4',
              fontSize: '0.70rem',
              color: '#8c857b',
            }}
          >
            Chef Missy inspects packaging and enforces sanitized prep surfaces for all declared allergens.
          </div>
        </div>

        {/* CARD 4: Culinary Notes & Exclusions */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #f2ede4',
                paddingBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <FileText size={15} color="#2e3b12" />
                <h3
                  style={{
                    fontSize: '0.92rem',
                    color: '#1a1814',
                    margin: 0,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  Culinary Notes & Dislikes
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit('notes')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3b12',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>

            {/* Disliked Ingredients */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block', marginBottom: '5px' }}>
                Disliked Ingredients
              </span>
              {userDislikedList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {userDislikedList.map((item) => (
                    <span
                      key={item}
                      style={{
                        fontSize: '0.70rem',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: '#f6f3eb',
                        border: '1px solid #ede8df',
                        color: '#57534e',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#a8a29e', fontStyle: 'italic' }}>
                  None specified
                </span>
              )}
            </div>

            {/* Special Culinary Requests */}
            <div>
              <span style={{ fontSize: '0.68rem', color: '#716c62', display: 'block', marginBottom: '5px' }}>
                Special Preparation Requests
              </span>
              {user?.specialRequests ? (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: '#faf8f5',
                    border: '1px solid #ece7de',
                    fontSize: '0.74rem',
                    color: '#292524',
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                  }}
                >
                  "{user.specialRequests}"
                </div>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#a8a29e', fontStyle: 'italic' }}>
                  No special client preparation notes recorded.
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid #f2ede4',
              fontSize: '0.70rem',
              color: '#8c857b',
            }}
          >
            Special instructions are forwarded directly to Chef Missy for every bespoke order.
          </div>
        </div>
      </div>

      {/* CARD 5: Curated Favorite Dishes Preview (Full Width Bottom Card) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '18px 20px',
        }}
      >
        <div
          className="profile-fav-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            borderBottom: '1px solid #f2ede4',
            paddingBottom: '8px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            <Heart size={15} color="#dc2626" style={{ flexShrink: 0 }} />
            <h3
              style={{
                fontSize: '0.90rem',
                color: '#1a1814',
                margin: 0,
                fontWeight: 700,
                fontFamily: 'var(--font-heading, serif)',
                whiteSpace: 'nowrap',
              }}
            >
              My Saved Favorites
            </h3>
            {favourites.length > 0 && (
              <span
                className="profile-fav-badge"
                style={{
                  fontSize: '0.66rem',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {favourites.length} {favourites.length === 1 ? 'Dish' : 'Dishes'}
              </span>
            )}
          </div>

          <Link
            to="/favourites"
            className="profile-fav-link"
            style={{
              color: '#2e3b12',
              fontSize: '0.74rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            <span className="profile-fav-link-desktop">View All Favorites</span>
            <span className="profile-fav-link-mobile">View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loadingStats ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#716c62', fontSize: '0.78rem' }}>
            <Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', marginRight: '6px' }} />
            Loading favorites...
          </div>
        ) : favourites.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {favourites.slice(0, 4).map((dish) => (
              <Link
                key={dish._id}
                to={`/dishes/${dish._id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ece7de',
                  backgroundColor: '#ffffff',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2e3b12';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ece7de';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '4px',
                    backgroundColor: '#f6f3eb',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a8a29e',
                      }}
                    >
                      <Utensils size={16} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1a1814',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {dish.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.68rem',
                      color: '#716c62',
                      marginTop: '3px',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      {dish.category || 'Main'}
                    </span>
                    {dish.isTimeIntensive && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          color: '#b45309',
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: '0 4px',
                          borderRadius: '2px',
                        }}
                      >
                        30+ min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              textAlign: 'center',
              backgroundColor: '#faf8f5',
              borderRadius: '4px',
              border: '1px dashed #d4cdc5',
            }}
          >
            <p style={{ fontSize: '0.76rem', color: '#716c62', margin: '0 0 8px' }}>
              You haven't saved any favorite dishes yet.
            </p>
            <Link
              to="/dishes"
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#2e3b12',
                textDecoration: 'underline',
              }}
            >
              Explore Menu Catalog & Save Favorites
            </Link>
          </div>
        )}
      </div>

      {/* CARD 6: Account Session & Security */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ece7de',
          padding: '16px 20px',
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <ShieldCheck size={16} color="#2e3b12" />
            <h4 style={{ fontSize: '0.88rem', color: '#1a1814', margin: 0, fontWeight: 700 }}>
              Account Session & Security
            </h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#716c62', margin: 0 }}>
            Signed in as <strong>{user?.email}</strong>. Logging out ends your current session on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '7px 16px',
            borderRadius: '4px',
            border: '1px solid #dc2626',
            backgroundColor: '#ffffff',
            color: '#dc2626',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          <LogOut size={13} /> Sign Out of Account
        </button>
      </div>

      {/* =========================================================================
       * EDIT PROFILE MODAL (PRE-LOADED FORM SECTIONS)
       * ========================================================================= */}
      {isEditModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="profile-edit-modal-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(30, 27, 22, 0.55)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
              animation: 'fadeIn 0.15s ease-out',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseEdit();
            }}
          >
          <div
            className="profile-edit-modal-card"
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '88vh',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              border: '1px solid #ece7de',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              className="profile-edit-modal-header"
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #ece7de',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fbf9f5',
                gap: '10px',
              }}
            >
              <div>
                <h2
                  className="profile-edit-modal-title"
                  style={{
                    fontSize: '1.05rem',
                    color: '#1a1814',
                    margin: '0 0 2px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading, serif)',
                  }}
                >
                  Edit Profile & Dining Preferences
                </h2>
                <p className="profile-edit-modal-subtitle" style={{ fontSize: '0.72rem', color: '#716c62', margin: 0 }}>
                  Pre-loaded with your current client details, dietary regimen, and safety safeguards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#716c62',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              className="profile-edit-modal-tabs"
              style={{
                display: 'flex',
                borderBottom: '1px solid #ece7de',
                backgroundColor: '#ffffff',
                padding: '0 20px',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <button
                type="button"
                onClick={() => setModalTab('personal')}
                className="profile-edit-tab-btn"
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: modalTab === 'personal' ? '2px solid #2e3b12' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: modalTab === 'personal' ? '#2e3b12' : '#716c62',
                  fontWeight: modalTab === 'personal' ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <User size={13} />
                <span className="profile-tab-text-desktop">Personal Info</span>
                <span className="profile-tab-text-mobile">Personal</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('dietary')}
                className="profile-edit-tab-btn"
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: modalTab === 'dietary' ? '2px solid #2e3b12' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: modalTab === 'dietary' ? '#2e3b12' : '#716c62',
                  fontWeight: modalTab === 'dietary' ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Leaf size={13} />
                <span className="profile-tab-text-desktop">Dietary Preferences</span>
                <span className="profile-tab-text-mobile">Dietary</span>
                {editSelectedDietary.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: '#2e3b12',
                      color: '#ffffff',
                    }}
                  >
                    {editSelectedDietary.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModalTab('allergies')}
                className="profile-edit-tab-btn"
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: modalTab === 'allergies' ? '2px solid #dc2626' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: modalTab === 'allergies' ? '#dc2626' : '#716c62',
                  fontWeight: modalTab === 'allergies' ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={13} />
                <span className="profile-tab-text-desktop">Allergies & Safety</span>
                <span className="profile-tab-text-mobile">Allergies</span>
                {editSelectedAllergens.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                    }}
                  >
                    {editSelectedAllergens.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModalTab('notes')}
                className="profile-edit-tab-btn"
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: modalTab === 'notes' ? '2px solid #2e3b12' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: modalTab === 'notes' ? '#2e3b12' : '#716c62',
                  fontWeight: modalTab === 'notes' ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <FileText size={13} />
                <span className="profile-tab-text-desktop">Culinary Notes</span>
                <span className="profile-tab-text-mobile">Notes</span>
              </button>
            </div>

            {/* Modal Error Banner */}
            {modalError && (
              <div
                style={{
                  margin: '12px 22px 0',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '4px',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={14} /> {modalError}
              </div>
            )}

            {/* Modal Body / Scrollable Content */}
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div
                className="profile-edit-modal-body"
                style={{
                  padding: '20px 22px',
                  overflowY: 'auto',
                  flex: 1,
                  maxHeight: 'calc(88vh - 180px)',
                }}
              >
                {/* TAB 1: PERSONAL INFO */}
                {modalTab === 'personal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="user-form-2col">
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #ece7de',
                            fontSize: '0.80rem',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', margin: 0 }}>
                            Email Address (Fixed ID)
                          </label>
                          <span style={{ fontSize: '0.64rem', color: '#716c62' }}>Verified</span>
                        </div>
                        <input
                          type="email"
                          disabled
                          value={editFormData.email}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #ece7de',
                            fontSize: '0.80rem',
                            backgroundColor: '#faf8f5',
                            color: '#716c62',
                            cursor: 'not-allowed',
                          }}
                        />
                      </div>
                    </div>

                    <div className="user-form-2col">
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +44 7700 900077"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #ece7de',
                            fontSize: '0.80rem',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                          Delivery Address / Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kensington, London"
                          value={editFormData.location}
                          onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #ece7de',
                            fontSize: '0.80rem',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div className="user-form-2col">
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                          Date of Birth
                        </label>
                        <CustomDatePicker
                          value={editFormData.dob}
                          onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                          placeholder="YYYY-MM-DD"
                          style={{
                            height: '36px',
                            fontSize: '0.80rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                          Gender
                        </label>
                        <select
                          value={editFormData.gender}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #ece7de',
                            fontSize: '0.80rem',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                          }}
                        >
                          <option value="">Prefer not to say</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DIETARY PREFERENCES */}
                {modalTab === 'dietary' && (
                  <div>
                    <p style={{ fontSize: '0.74rem', color: '#716c62', margin: '0 0 12px' }}>
                      Select the dietary regimens you follow. Menus and weekly box recommendations are tailored to your choices.
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      {DIETARY_PRESETS.map((preset) => {
                        const isChecked = editSelectedDietary.includes(preset);
                        return (
                          <div
                            key={preset}
                            onClick={() => toggleEditDietary(preset)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '4px',
                              border: isChecked ? '1px solid #2e3b12' : '1px solid #ece7de',
                              backgroundColor: isChecked ? '#f1f6ec' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              userSelect: 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: isChecked ? 700 : 500,
                                color: isChecked ? '#2e3b12' : '#1a1814',
                              }}
                            >
                              {preset}
                            </span>
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '3px',
                                border: isChecked ? '1px solid #2e3b12' : '1px solid #d4cdc5',
                                backgroundColor: isChecked ? '#2e3b12' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                              }}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ borderTop: '1px solid #ece7de', paddingTop: '14px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                        Other Custom Dietary Regimens
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Low FODMAP, Mediterranean, Diabetic-friendly"
                        value={editOtherDietary}
                        onChange={(e) => setEditOtherDietary(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid #ece7de',
                          fontSize: '0.80rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#8c857b', marginTop: '4px', display: 'block' }}>
                        Separate multiple regimens with commas.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: ALLERGIES & SAFETY */}
                {modalTab === 'allergies' && (
                  <div>
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '14px',
                      }}
                    >
                      <ShieldAlert size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', color: '#991b1b', lineHeight: 1.4 }}>
                        <strong>Culinary Safety Protocol:</strong> Selected allergens trigger automated dish conflict alerts and safe ingredient substitutions by Chef Missy.
                      </span>
                    </div>

                    {loadingAllergens ? (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: '#716c62', fontSize: '0.78rem' }}>
                        <Loader2 size={16} className="animate-spin" style={{ display: 'inline-block', marginRight: '6px' }} />
                        Loading allergen catalog...
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: '8px',
                          marginBottom: '16px',
                        }}
                      >
                        {allergenListToRender.map((allergenName) => {
                          const isChecked = editSelectedAllergens.includes(allergenName);
                          return (
                            <div
                              key={allergenName}
                              onClick={() => toggleEditAllergen(allergenName)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '4px',
                                border: isChecked ? '1px solid #dc2626' : '1px solid #ece7de',
                                backgroundColor: isChecked ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                userSelect: 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: isChecked ? 700 : 500,
                                  color: isChecked ? '#991b1b' : '#1a1814',
                                }}
                              >
                                {allergenName}
                              </span>
                              <div
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '3px',
                                  border: isChecked ? '1px solid #dc2626' : '1px solid #d4cdc5',
                                  backgroundColor: isChecked ? '#dc2626' : '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                }}
                              >
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #ece7de', paddingTop: '14px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                        Other Specific Allergens or Intolerances
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Coriander allergy, nightshades, stone fruit"
                        value={editOtherAllergies}
                        onChange={(e) => setEditOtherAllergies(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid #ece7de',
                          fontSize: '0.80rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#8c857b', marginTop: '4px', display: 'block' }}>
                        Separate multiple allergens with commas.
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 4: CULINARY NOTES & DISLIKES */}
                {modalTab === 'notes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                        Disliked Ingredients
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cilantro, bell peppers, capers, anchovies"
                        value={editFormData.dislikedIngredients}
                        onChange={(e) => setEditFormData({ ...editFormData, dislikedIngredients: e.target.value })}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '4px',
                          border: '1px solid #ece7de',
                          fontSize: '0.80rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#8c857b', marginTop: '4px', display: 'block' }}>
                        Separate ingredients with commas. Recipes featuring these will be highlighted with a cautionary badge.
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a1814', display: 'block', marginBottom: '5px' }}>
                        Special Culinary Requests & Exclusions
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Dressing on the side, no raw red onions, extra crispy finish on roast items"
                        value={editFormData.specialRequests}
                        onChange={(e) => setEditFormData({ ...editFormData, specialRequests: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ece7de',
                          fontSize: '0.80rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#8c857b', marginTop: '4px', display: 'block' }}>
                        Chef Missy directly inspects these preparation notes for all your orders.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div
                className="profile-edit-modal-footer"
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid #ece7de',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#fbf9f5',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={savingProfile}
                  className="profile-edit-cancel-btn"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ece7de',
                    backgroundColor: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#716c62',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="profile-edit-save-btn"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '4px',
                    backgroundColor: '#2e3b12',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(46, 59, 18, 0.2)',
                  }}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
