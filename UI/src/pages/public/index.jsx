import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ChefHat,
  Leaf,
  Clock,
  ArrowRight,
  Menu as MenuIcon,
  X as CloseIcon,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
  Heart,
  Truck,
} from 'lucide-react';

export default function PublicWebsite() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const plateRef = useRef(null);
  const plateAnchorRef = useRef(null);
  const plateTargetRef = useRef(null);
  const heroPlateLayerRef = useRef(null);
  const secondPlateLayerRef = useRef(null);
  const sprigRef = useRef(null);
  const heroContentRef = useRef(null);
  const backdropRef = useRef(null);
  const taglineRef = useRef(null);

  const taglineWords = [
    'Fresh',
    'seasonal',
    'ingredients,',
    'wholesome',
    'home-cooked',
    'meals,',
    'and',
    'more',
    'quality',
    'time',
    'for',
    'your',
    'family.',
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      if (taglineRef.current) {
        const words = taglineRef.current.querySelectorAll('.public-tagline-word');
        words.forEach((span) => {
          span.style.color = '#2c3917';
          span.style.opacity = '1';
        });
      }
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowH = window.innerHeight || 800;

          // 1. Hero Left Text Dissolve (fades out as user scrolls through hero)
          const textFadeStart = 60;
          const textFadeEnd = windowH * 0.65;
          const textProgress = Math.min(1, Math.max(0, (scrollY - textFadeStart) / (textFadeEnd - textFadeStart)));
          const textOpacity = Math.max(0, 1 - textProgress);
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = textOpacity.toFixed(3);
            heroContentRef.current.style.transform = `translateY(${(textProgress * 30).toFixed(1)}px)`;
            heroContentRef.current.style.pointerEvents = textOpacity <= 0.05 ? 'none' : 'auto';
          }

          // 2. Dissolve backdrop watermark text
          if (backdropRef.current) {
            backdropRef.current.style.opacity = (0.07 * textOpacity).toFixed(3);
          }

          // 3. Plate Jump & Shape-Shift to Section 2
          // Starts as hero scrolls past middle, completely landed and settled by 30% into Section 2
          const jumpStart = windowH * 0.28;
          const jumpEnd = windowH * 0.68;
          const jumpProgress = Math.min(1, Math.max(0, (scrollY - jumpStart) / (jumpEnd - jumpStart)));

          // Smooth Hermite cubic ease-in-out per animation guidelines
          const eased = jumpProgress * jumpProgress * (3 - 2 * jumpProgress);

          if (plateRef.current && plateAnchorRef.current && plateTargetRef.current) {
            const anchorRect = plateAnchorRef.current.getBoundingClientRect();
            const targetRect = plateTargetRef.current.getBoundingClientRect();

            // Vector between hero plate anchor and section 2 target
            const deltaX = (targetRect.left + window.scrollX) - (anchorRect.left + window.scrollX);
            const deltaY = (targetRect.top + window.scrollY) - (anchorRect.top + window.scrollY);

            // Leaping parabolic arc (lifts slightly at peak of jump, zero at endpoints)
            const jumpArc = Math.sin(eased * Math.PI) * 24;
            const currentX = eased * deltaX;
            const currentY = eased * deltaY - jumpArc;
            const currentScale = 1 + Math.sin(eased * Math.PI) * 0.04;

            // Rotation: spins in hero, smoothly unwinds to 0deg (properly aligned) in Section 2,
            // strictly locked at 0deg when scrolled further down; reverses when scrolled back up
            const currentRotation = eased >= 1 ? 0 : (1 - eased) * (scrollY * 0.18);

            plateRef.current.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0) scale(${currentScale.toFixed(3)}) rotate(${currentRotation.toFixed(2)}deg)`;

            // Cross-fade: hero-plate fades out completely before crossing the green ribbon
            // so beneath the green line in Section 2, hero-plate is 100% hidden
            const heroAlpha = Math.max(0, 1 - (jumpProgress / 0.40));
            const secondAlpha = Math.min(1, jumpProgress / 0.40);

            if (heroPlateLayerRef.current) {
              heroPlateLayerRef.current.style.opacity = heroAlpha.toFixed(3);
              heroPlateLayerRef.current.style.display = heroAlpha <= 0.005 ? 'none' : 'block';
            }
            if (secondPlateLayerRef.current) {
              secondPlateLayerRef.current.style.opacity = secondAlpha.toFixed(3);
              secondPlateLayerRef.current.style.display = secondAlpha <= 0.005 ? 'none' : 'block';
            }

            // Green sprig behind plate dissolves as plate leaps away
            if (sprigRef.current) {
              sprigRef.current.style.opacity = Math.max(0, 0.95 * (1 - eased * 2)).toFixed(3);
            }
          }

          // 4. Word-by-word reveal for the Tagline section
          if (taglineRef.current) {
            const rect = taglineRef.current.getBoundingClientRect();
            const startY = windowH * 0.85;
            const endY = windowH * 0.45;
            const tagProgress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY)));
            const words = taglineRef.current.querySelectorAll('.public-tagline-word');
            const activeCount = Math.floor(tagProgress * (words.length + 1));
            words.forEach((span, idx) => {
              if (idx < activeCount) {
                span.style.color = '#2c3917';
                span.style.opacity = '1';
              } else {
                span.style.color = '#716c62';
                span.style.opacity = '0.3';
              }
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Chef Missy’s in-home cooking service work?',
      a: 'Chef Missy comes directly to your home to prepare wholesome, fresh meals tailored to your family. She brings fresh ingredients, cooks your selected dishes in your kitchen, packages them neatly in your refrigerator, and leaves the kitchen spotless.',
    },
    {
      q: 'How are food allergies and dietary needs handled?',
      a: 'When you create an account, you can let us know if anyone in your family has food allergies. Chef Missy discusses any allergies or ingredient dislikes directly with each family to ensure all meals are prepared safely.',
    },
    {
      q: 'Can family members choose different dishes?',
      a: 'Yes. You can select a variety of mains, sides, soups, desserts, and kid-friendly dishes for your visit, making it easy to satisfy everyone at the table.',
    },
    {
      q: 'How long do the prepared meals stay fresh?',
      a: 'Dishes are prepared fresh in your kitchen during Chef Missy’s visit and remain delicious and ready to enjoy in your refrigerator for three to five days.',
    },
    {
      q: 'Is there a recurring contract or minimum weekly commitment?',
      a: 'No forced contracts or commitments. You can schedule a cooking visit whenever you need help, whether on a regular weekly basis or for busy periods.',
    },
    {
      q: 'How do I choose dishes and book my first visit?',
      a: 'Create an account to browse the seasonal dishes, choose up to 7 dishes, pick your preferred cooking date (Morning or Afternoon), and submit your request. Exact arrival times are confirmed directly with Chef Missy.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1a1814', minHeight: '100vh', overflowX: 'hidden', fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)" }}>
      
      {/* =========================================================================
          Top Header Navigation (Floating Capsule per hero-design.png)
          ========================================================================= */}
      <div
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 100,
          padding: '0 20px',
          margin: '0 auto',
          maxWidth: '1280px',
        }}
      >
        <header
          style={{
            backgroundColor: 'rgba(252, 249, 243, 0.39)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            border: '1px solid rgba(220, 213, 202, 0.8)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
            padding: '3px 14px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          {/* Logo & Identity */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
              paddingLeft: '2px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1.5px solid #d9d2c5',
                flexShrink: 0,
              }}
            >
              <img
                src="/assets/logo-crest.png"
                alt="Chef Missy"
                style={{
                  width: '38px',
                  height: '38px',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply',
                }}
              />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  color: '#1c301d',
                  display: 'block',
                  lineHeight: 1.15,
                }}
              >
                Chef Missy
              </span>
              <span
                style={{
                  fontSize: '0.52rem',
                  letterSpacing: '1.4px',
                  color: '#716c62',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                Private Chef Service
              </span>
            </div>
          </Link>

          {/* Thin vertical separator */}
          <div className="public-nav-divider" style={{ width: '1px', height: '18px', backgroundColor: '#dcd5ca', margin: '0 2px' }} />

          {/* Desktop Nav Links */}
          <nav className="public-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <a
              href="#service"
              style={{
                fontSize: '0.76rem',
                color: '#ffffff',
                backgroundColor: '#1e3320',
                padding: '4px 12px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              The Service
            </a>
            <a
              href="#philosophy"
              style={{
                fontSize: '0.76rem',
                color: '#1c301d',
                padding: '4px 9px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Philosophy
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: '0.76rem',
                color: '#1c301d',
                padding: '4px 9px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              How It Works
            </a>
            <a
              href="#faq"
              style={{
                fontSize: '0.76rem',
                color: '#1c301d',
                padding: '4px 9px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Questions
            </a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to="/home"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 13px',
                    backgroundColor: '#1e3320',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <User size={13} />
                  <span>Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dcd5ca',
                    borderRadius: '9999px',
                    color: '#716c62',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 13px',
                    backgroundColor: '#f5f3ec',
                    color: '#1c301d',
                    border: '1px solid #dcd5ca',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <User size={12} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 15px',
                    backgroundColor: '#1e3320',
                    color: '#ffffff',
                    border: '1px solid #1e3320',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(30, 51, 32, 0.25)',
                  }}
                >
                  <span>Create Account</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="public-mobile-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: '1px solid #dcd5ca',
                borderRadius: '9999px',
                padding: '6px',
                color: '#1e3320',
                cursor: 'pointer',
              }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              marginTop: '8px',
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #ece7de',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <a
              href="#service"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.875rem', color: '#1a1814', textDecoration: 'none', fontWeight: 500 }}
            >
              The Service
            </a>
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.875rem', color: '#1a1814', textDecoration: 'none', fontWeight: 500 }}
            >
              Philosophy
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.875rem', color: '#1a1814', textDecoration: 'none', fontWeight: 500 }}
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.875rem', color: '#1a1814', textDecoration: 'none', fontWeight: 500 }}
            >
              Questions
            </a>
            <div style={{ paddingTop: '8px', borderTop: '1px solid #f0ede6', display: 'flex', gap: '8px' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '9999px',
                  border: '1px solid #dcd5ca',
                  backgroundColor: '#ffffff',
                  color: '#1e3320',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#1e3320',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          Hero Section: Exact Replica of hero-design.png
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          marginTop: '-64px',
          paddingTop: '80px',
          backgroundColor: '#f7f4ec',
          overflowX: 'clip',
          overflowY: 'visible',
          minHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Deep Forest Green Organic Backdrop with Cream Frame & Shadow (Image 4) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '58%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          className="hero-green-curve-container"
        >
          <svg
            viewBox="0 0 900 1000"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              {/* Soft Drop Shadow for the Cream Frame Structure */}
              <filter id="creamFrameShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="-14" dy="18" stdDeviation="22" floodColor="#000000" floodOpacity="0.10" />
              </filter>

              {/* Translucent Warm Cream Gradient for Frame Ribbon (Image 4) */}
              <linearGradient id="creamFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ede3d1" stopOpacity="0.80" />
                <stop offset="50%" stopColor="#e5dcce" stopOpacity="0.74" />
                <stop offset="100%" stopColor="#ded2bf" stopOpacity="0.68" />
              </linearGradient>

              {/* Deep Olive/Forest Green Gradient */}
              <linearGradient id="heroGreenBase" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#2c4c2f" />
                <stop offset="50%" stopColor="#223d26" />
                <stop offset="100%" stopColor="#142617" />
              </linearGradient>

              {/* Lighter Sage Facet Gradient (Image 4 top right corner) */}
              <linearGradient id="heroFacetLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5a7b5a" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#3c5b3d" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Layer A: Outer Cream Frame Ribbon / Structure with Soft Shadow & Translucency */}
            <path
              d="M 310 0
                 C 140 160, 20 400, 70 650
                 C 115 840, 260 950, 480 975
                 C 670 996, 820 965, 900 935
                 L 900 0 Z"
              fill="url(#creamFrameGrad)"
              filter="url(#creamFrameShadow)"
            />

            {/* Layer B: Main Organic Forest Green Shape */}
            <path
              d="M 360 0
                 C 200 170, 80 410, 130 655
                 C 170 835, 310 935, 520 955
                 C 690 970, 830 945, 900 920
                 L 900 0 Z"
              fill="url(#heroGreenBase)"
            />

            {/* Layer C: Top-Right Diagonal Geometric Facet (per Image 4) */}
            <path
              d="M 580 0 L 900 0 L 900 260 L 710 180 Z"
              fill="url(#heroFacetLight)"
            />
          </svg>
        </div>

        {/* 2. Botanical Foliage Leaves from /assets/leaf.png */}
        {/* Top-Right Hanging Branch (Tuned matte botanical filter & framing angle) */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-20px',
            width: '360px',
            transform: 'rotate(185deg) scaleX(-1)',
            pointerEvents: 'none',
            zIndex: 12,
            filter: 'brightness(0.85) contrast(1.18) saturate(0.82) sepia(0.06) drop-shadow(0 18px 30px rgba(0,0,0,0.36))',
          }}
          className="hero-leaf-top-right"
        />

        {/* Bottom-Right Emerging Branch (Tuned matte botanical filter & framing angle) */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '-40px',
            width: '380px',
            transform: 'rotate(-28deg) scaleX(-1)',
            pointerEvents: 'none',
            zIndex: 12,
            filter: 'brightness(0.85) contrast(1.18) saturate(0.82) sepia(0.06) drop-shadow(0 18px 28px rgba(0,0,0,0.4))',
          }}
          className="hero-leaf-bottom-right"
        />

        {/* Faint Mid-Left Floating Branch (Rotated 20deg anti-clockwise per user instruction) */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '180px',
            left: '-80px',
            width: '320px',
            transform: 'rotate(22deg)',
            opacity: 0.22,
            pointerEvents: 'none',
            zIndex: 1,
            filter: 'blur(0.5px)',
          }}
          className="hero-leaf-left"
        />

        {/* 3. Main Hero Content Row (Left Copy, Center Plate) */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            padding: '32px 24px 48px',
          }}
        >
          <div className="hero-main-layout">
            
            {/* Left Column: Heading, Subhead, CTAs & Proof Row (Fades out with scroll) */}
            <div
              ref={heroContentRef}
              className="hero-left-column"
              style={{
                display: 'flex',
                flexDirection: 'column',
                willChange: 'transform, opacity',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '2.5px',
                  color: '#2c3917',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '14px',
                }}
              >
                Private Chef Service
              </span>

              <h1
                className="hero-main-heading"
                style={{
                  fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                  fontSize: 'clamp(2.5rem, 3.7vw, 3.6rem)',
                  fontWeight: 600,
                  color: '#162215',
                  lineHeight: 1.14,
                  margin: '0 0 18px',
                  letterSpacing: '-0.02em',
                }}
              >
                Bespoke culinary
                <br />
                service prepared
                <br />
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#1e3320', textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '6px' }}>
                  fresh
                </span>{' '}
                for your home.
              </h1>

              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#5c564c',
                  lineHeight: 1.65,
                  margin: '0 0 32px',
                  maxWidth: '440px',
                  textWrap: 'pretty',
                }}
              >
                Chef Missy creates seasonal organic meals customized to your household dossier and portion needs. Sourced fresh from local growers, prepared in small batches, and delivered directly to your door.
              </p>

              {/* 3-Part Proof Row on Left */}
              <div
                className="hero-left-proof-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e7e2d6',
                  maxWidth: '520px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#edf3e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Leaf size={16} color="#254228" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>100% Organic</strong>
                    <span style={{ fontSize: '0.68rem', color: '#716c62' }}>Farm Fresh Ingredients</span>
                  </div>
                </div>

                <div style={{ width: '1px', height: '26px', backgroundColor: '#dcd5ca' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChefHat size={16} color="#1c301d" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>Expert Chef</strong>
                    <span style={{ fontSize: '0.68rem', color: '#716c62' }}>Professional Quality</span>
                  </div>
                </div>

                <div style={{ width: '1px', height: '26px', backgroundColor: '#dcd5ca' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={16} color="#1c301d" />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>On-Time Delivery</strong>
                    <span style={{ fontSize: '0.68rem', color: '#716c62' }}>Freshly Prepared</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Traveling & Shape-Shifting Plate with sprig behind */}
            <div
              ref={plateAnchorRef}
              className="hero-center-plate-container"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 15,
              }}
            >
              {/* Green sprig peeking out behind upper left rim of plate */}
              <img
                ref={sprigRef}
                src="/assets/leaf.png"
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '-35px',
                  width: '170px',
                  transform: 'rotate(-55deg)',
                  opacity: 0.95,
                  pointerEvents: 'none',
                  zIndex: 0,
                  filter: 'brightness(0.85) contrast(1.18) saturate(0.82) sepia(0.06) drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
                  willChange: 'opacity',
                }}
              />

              {/* Master Traveling & Morphing Plate Container */}
              <div
                ref={plateRef}
                className="hero-rotating-plate"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '450px',
                  height: '450px',
                  maxWidth: '85vw',
                  maxHeight: '85vw',
                  willChange: 'transform',
                  transformOrigin: '50% 50%',
                }}
              >
                {/* Layer 1: Hero Plate (Round photo with clip & circular shadow) */}
                <div
                  ref={heroPlateLayerRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    boxShadow:
                      '0 32px 75px -12px rgba(0, 0, 0, 0.45), 0 14px 30px -6px rgba(0, 0, 0, 0.25)',
                    opacity: 1,
                    zIndex: 5,
                    willChange: 'opacity',
                  }}
                >
                  <img
                    src="/assets/hero-plate.jpg"
                    alt="Chef Missy signature culinary plate"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scale(1.04)',
                      display: 'block',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/public-hero-culinary.jpg';
                    }}
                  />
                </div>

                {/* Layer 2: 2nd Section Plate (Shape-shifted Salmon Plate on Transparent Canvas) */}
                <div
                  ref={secondPlateLayerRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    zIndex: 15,
                    filter: 'drop-shadow(0 32px 50px rgba(0, 0, 0, 0.35))',
                    willChange: 'opacity',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src="/assets/2nd-section-plate.png"
                    alt="Chef Missy in-home grilled salmon plate"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      transform: 'scale(1.14)',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Full-Width Bottom Dark Forest Green Ribbon Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#162817',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px 24px',
          }}
        >
          <div
            style={{
              maxWidth: '1240px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              alignItems: 'center',
            }}
            className="hero-bottom-ribbon-grid"
          >
            {/* Col 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <Leaf size={28} color="#a6bc9f" strokeWidth={1.8} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Fresh &amp; Organic</strong>
                <span style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Always</span>
              </div>
            </div>

            {/* Col 2 */}
            <div
              className="hero-ribbon-divider-col"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Award size={28} color="#a6bc9f" strokeWidth={1.8} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Premium Quality</strong>
                <span style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Guaranteed</span>
              </div>
            </div>

            {/* Col 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <Heart size={28} color="#a6bc9f" strokeWidth={1.8} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Made with Care</strong>
                <span style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Just for you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Tagline Reveal Section with Plate Landing Target (Our Commitment)
          ========================================================================= */}
      <section
        style={{
          padding: '96px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ece7de',
          position: 'relative',
          overflowX: 'clip',
        }}
      >
        <div
          className="tagline-section-layout"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            alignItems: 'center',
            gap: '48px',
            minHeight: '460px',
          }}
        >
          {/* Left Column: Commitment Tagline */}
          <div className="tagline-text-col" style={{ textAlign: 'left' }}>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '2px',
                color: '#716c62',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '20px',
              }}
            >
              Our Commitment
            </span>
            <p
              ref={taglineRef}
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                color: '#1a240e',
                lineHeight: 1.32,
                fontWeight: 600,
                margin: '0 0 20px',
                textWrap: 'balance',
              }}
              className="public-tagline-text"
            >
              {taglineWords.map((word, idx) => (
                <span
                  key={idx}
                  className="public-tagline-word"
                  style={{
                    display: 'inline-block',
                    marginRight: '0.3em',
                    color: '#716c62',
                    opacity: 0.3,
                    transition: 'color 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'color, opacity',
                  }}
                >
                  {word}
                </span>
              ))}
            </p>
            <span style={{ fontSize: '0.88rem', color: '#716c62', fontStyle: 'italic', display: 'block' }}>
              Wild-caught seafood, pasture-raised meats &amp; local organic harvest.
            </span>
          </div>

          {/* Right Column: Destination Landing Target for the Jumping Plate */}
          <div
            ref={plateTargetRef}
            className="plate-landing-target"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '450px',
              position: 'relative',
            }}
          >
            {/* Tilted Oval Circles around 2nd-section-plate */}
            <svg
              viewBox="0 0 600 500"
              style={{
                position: 'absolute',
                width: '124%',
                maxWidth: '580px',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'visible',
              }}
            >
              {/* Outer Tilted Oval Ring */}
              <ellipse
                cx="300"
                cy="250"
                rx="285"
                ry="195"
                transform="rotate(-8 300 250)"
                fill="none"
                stroke="#e2dacb"
                strokeWidth="1.2"
                opacity="0.6"
              />
              {/* Middle Tilted Oval Ring (subtle dashed accent) */}
              <ellipse
                cx="300"
                cy="250"
                rx="258"
                ry="178"
                transform="rotate(-18 300 250)"
                fill="none"
                stroke="#c7baa4"
                strokeWidth="1.2"
                strokeDasharray="8 6"
                opacity="0.45"
              />
              {/* Inner Tilted Oval Ring */}
              <ellipse
                cx="300"
                cy="250"
                rx="232"
                ry="158"
                transform="rotate(-13 300 250)"
                fill="none"
                stroke="#d3c7b2"
                strokeWidth="1.5"
                opacity="0.65"
              />
            </svg>

            {/* Soft ambient pedestal ring beneath the plate */}
            <div
              style={{
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)',
                position: 'absolute',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          The Service Pillars: Problem to Solution
          ========================================================================= */}
      <section id="service" style={{ padding: '80px 24px', backgroundColor: '#faf8f4', borderBottom: '1px solid #ece7de' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1.5px', color: '#716c62', fontWeight: 600, textTransform: 'uppercase' }}>
              The Private Chef Difference
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: '2.25rem',
                color: '#2c3917',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              Fresh, home-cooked food without the shopping or kitchen stress
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5, textWrap: 'pretty' }}>
              Unlike takeout or commercial meal kits, Chef Missy prepares wholesome dinners right in your kitchen, customized directly to your family’s tastes and portion needs.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
            className="public-pillars-grid"
          >
            {/* Pillar 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '32px 24px',
                border: '1px solid #ece7de',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f4',
                  border: '1px solid #e2dacd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#485c24',
                  marginBottom: '20px',
                }}
              >
                <Leaf size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Whole Food Farm Sourcing
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Pasture raised meats, wild caught seafood, and seasonal produce sourced from regional organic growers. No factory processed ingredients or chemical additives.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '32px 24px',
                border: '1px solid #ece7de',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f4',
                  border: '1px solid #e2dacd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#485c24',
                  marginBottom: '20px',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Individual Allergen Care
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Every meal is prepared according to your dietary needs and allergies, discussed directly with each family to ensure complete peace of mind.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '32px 24px',
                border: '1px solid #ece7de',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  backgroundColor: '#faf8f4',
                  border: '1px solid #e2dacd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#485c24',
                  marginBottom: '20px',
                }}
              >
                <ChefHat size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Family-Sized Portions
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Choose dishes that suit everyone at your table, from wholesome family mains to options suitable for young children (ages 1–5).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          How It Works: 3 Steps
          ========================================================================= */}
      <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #ece7de' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1.5px', color: '#716c62', fontWeight: 600, textTransform: 'uppercase' }}>
              Service Overview
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: '2.25rem',
                color: '#2c3917',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              How our in-home cooking service works
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', maxWidth: '540px', margin: '0 auto', lineHeight: 1.5, textWrap: 'pretty' }}>
              Three simple steps to fresh meals cooked in your kitchen.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
            }}
            className="public-steps-grid"
          >
            {/* Step 1 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#485c24',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                1
              </div>
              <h4 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Register your profile
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Create your family account and let us know if anyone has food allergies or ingredient preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#485c24',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                2
              </div>
              <h4 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Plan your menu
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Browse our seasonal dishes and select up to 7 delicious meals for your upcoming cooking visit.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#485c24',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                3
              </div>
              <h4 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Cooked fresh in your home
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Chef Missy brings fresh ingredients to your home, prepares your meals, and leaves your refrigerator stocked and kitchen clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Philosophy Section: Culinary Craft & Health Integrity
          ========================================================================= */}
      <section id="philosophy" style={{ padding: '80px 24px', backgroundColor: '#faf8f4', borderBottom: '1px solid #ece7de' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1.5px', color: '#716c62', fontWeight: 600, textTransform: 'uppercase' }}>
              Kitchen Standards
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: '2.25rem',
                color: '#2c3917',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              Real ingredients, traditional techniques
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', maxWidth: '580px', margin: '0 auto', lineHeight: 1.55, textWrap: 'pretty' }}>
              Every sauce, marinade, and broth is made in house from scratch. We believe food should nourish your family with complete transparency.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
            className="public-standards-grid"
          >
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '8px', border: '1px solid #ece7de' }}>
              <h4 style={{ fontSize: '1rem', color: '#1a1814', margin: '0 0 8px', fontWeight: 600 }}>
                What we use exclusively
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Certified organic produce, grass fed meats, wild seafood, single origin extra virgin olive oil, sea salt, and fresh garden herbs.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '8px', border: '1px solid #ece7de' }}>
              <h4 style={{ fontSize: '1rem', color: '#1a1814', margin: '0 0 8px', fontWeight: 600 }}>
                What we never permit
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Refined industrial seed oils, artificial flavor enhancers, chemical preservatives, refined sugars, or factory farmed meats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ Section: Objection Handling
          ========================================================================= */}
      <section id="faq" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #ece7de' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '1.5px', color: '#716c62', fontWeight: 600, textTransform: 'uppercase' }}>
              Clear Answers
            </span>
            <h2
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: '2.25rem',
                color: '#2c3917',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              Frequently asked questions
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', margin: 0, textWrap: 'pretty' }}>
              Details on food preparation, dietary safeguards, and scheduling.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ece7de',
                    borderRadius: '8px',
                    backgroundColor: isOpen ? '#faf8f4' : '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '16px',
                    }}
                  >
                    <span style={{ fontSize: '0.9375rem', color: '#1a1814', fontWeight: 600 }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      color="#716c62"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', fontSize: '0.875rem', color: '#5c564c', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          Final Call to Action: Risk Reversal & Access
          ========================================================================= */}
      <section style={{ padding: '80px 24px', backgroundColor: '#faf8f4', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
              fontSize: '2.25rem',
              color: '#2c3917',
              margin: '0 0 16px',
              fontWeight: 600,
              textWrap: 'balance',
            }}
          >
            Experience fresh in-home cooking for your family
          </h2>
          <p style={{ fontSize: '1rem', color: '#5c564c', lineHeight: 1.6, margin: '0 0 32px', textWrap: 'pretty' }}>
            Create an account to browse the seasonal menu, select your favorite dishes, and choose your preferred cooking date.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/home' : '/register'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                backgroundColor: '#485c24',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(72, 92, 36, 0.25)',
              }}
            >
              <span>{user ? 'Plan Your Menu' : 'Create an Account'}</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#485c24',
                borderRadius: '6px',
                border: '1px solid #dcd5ca',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Client Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Footer
          ========================================================================= */}
      <footer style={{ backgroundColor: '#243013', color: '#c5d1b3', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              paddingBottom: '32px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/assets/logo-crest.png"
                alt="Chef Missy Logo"
                style={{
                  width: '42px',
                  height: 'auto',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                    fontSize: '1.25rem',
                    color: '#ffffff',
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  Chef Missy
                </h3>
                <span style={{ fontSize: '0.625rem', color: '#8fa079', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Private Chef Culinary Service
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500 }}>
                Sign In
              </Link>
              <Link to="/register" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500 }}>
                Create Account
              </Link>
              <Link
                to="/admin/login"
                style={{
                  color: '#c5a059',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Chef Portal</span> &rarr;
              </Link>
            </div>
          </div>

          <div
            style={{
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.75rem',
              color: '#7b8c66',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Private Chef Missy. All rights reserved.
            </div>
            <div>
              Fresh Ingredients &bull; Thoughtful Menus &bull; Prepared For You
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 1025px) {
          .hero-main-layout {
            display: grid !important;
            grid-template-columns: 1.15fr 1fr !important;
            align-items: center !important;
            gap: 40px !important;
          }
          .hero-center-plate-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .tagline-section-layout {
            display: grid !important;
            grid-template-columns: 1.15fr 1fr !important;
            align-items: center !important;
            gap: 48px !important;
          }
          .tagline-text-col {
            text-align: left !important;
          }
        }
        @media (max-width: 1024px) {
          .public-desktop-nav {
            display: none !important;
          }
          .public-nav-divider {
            display: none !important;
          }
          .public-mobile-button {
            display: inline-flex !important;
          }
          .hero-green-curve-container {
            width: 100% !important;
            height: 52% !important;
            top: auto !important;
            bottom: 0 !important;
          }
          .hero-main-layout {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 36px !important;
          }
          .hero-left-column {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-left-proof-row {
            justify-content: center !important;
          }
          .tagline-section-layout {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 32px !important;
          }
          .tagline-text-col {
            text-align: center !important;
          }
          .plate-landing-target {
            min-height: 320px !important;
            width: 100% !important;
          }
          .hero-rotating-plate {
            width: 320px !important;
            height: 320px !important;
          }
          .hero-leaf-top-right {
            width: 240px !important;
          }
          .hero-leaf-bottom-right {
            width: 250px !important;
          }
        }
        @media (max-width: 768px) {
          .hero-bottom-ribbon-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .hero-ribbon-divider-col {
            border-left: none !important;
            border-right: none !important;
            border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
            padding: 12px 0 !important;
          }
          .hero-left-proof-row {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .hero-left-proof-row > div:nth-child(even) {
            display: none !important;
          }
          .hero-main-heading {
            font-size: 2.1rem !important;
          }
          .public-tagline-text {
            font-size: 1.75rem !important;
          }
          .public-pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .public-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .public-standards-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 520px) {
          .hero-rotating-plate {
            width: 260px !important;
            height: 260px !important;
          }
          .hero-main-heading {
            font-size: 1.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
