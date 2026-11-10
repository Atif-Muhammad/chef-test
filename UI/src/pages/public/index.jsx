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
} from 'lucide-react';

export default function PublicWebsite() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const plateRef = useRef(null);
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

          // Dissolve smoothly over hero exit (between 50px and 85% of viewport)
          const startFade = 50;
          const endFade = windowH * 0.85;
          const progress = Math.min(1, Math.max(0, (scrollY - startFade) / (endFade - startFade)));
          const opacity = Math.max(0, 1 - progress);

          // 1. Rotate the plate smoothly as user scrolls
          if (plateRef.current) {
            const rotation = scrollY * 0.18;
            plateRef.current.style.transform = `rotate(${rotation.toFixed(2)}deg)`;
          }

          // 2. Dissolve both text and plate downwards together with scroll
          if (heroContentRef.current) {
            const translateY = progress * 40;
            heroContentRef.current.style.opacity = opacity.toFixed(3);
            heroContentRef.current.style.transform = `translateY(${translateY.toFixed(1)}px)`;
            heroContentRef.current.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
          }

          // 3. Dissolve backdrop watermark text
          if (backdropRef.current) {
            backdropRef.current.style.opacity = (0.07 * opacity).toFixed(3);
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
    <div style={{ backgroundColor: '#ffffff', color: '#1a1814', minHeight: '100vh', fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)" }}>
      
      {/* =========================================================================
          Top Header Navigation (Quiet Chrome)
          ========================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #ece7de',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Identity */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src="/assets/logo-crest.png"
              alt="Private Chef Missy Crest"
              style={{
                width: '38px',
                height: 'auto',
                display: 'block',
                mixBlendMode: 'multiply',
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#485c24',
                  display: 'block',
                  lineHeight: 1.15,
                }}
              >
                Chef Missy
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  letterSpacing: '1.5px',
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

          {/* Desktop Nav Links */}
          <nav className="public-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a
              href="#service"
              style={{
                fontSize: '0.875rem',
                color: '#5c564c',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              The Service
            </a>
            <a
              href="#philosophy"
              style={{
                fontSize: '0.875rem',
                color: '#5c564c',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Philosophy
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: '0.875rem',
                color: '#5c564c',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              How It Works
            </a>
            <a
              href="#faq"
              style={{
                fontSize: '0.875rem',
                color: '#5c564c',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Questions
            </a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/home"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#485c24',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <User size={14} />
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  style={{
                    padding: '8px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dcd5ca',
                    borderRadius: '6px',
                    color: '#716c62',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: '#ffffff',
                    color: '#485c24',
                    border: '1px solid #dcd5ca',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#485c24',
                    color: '#ffffff',
                    border: '1px solid #485c24',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(72, 92, 36, 0.25)',
                  }}
                >
                  <span>Create Account</span>
                  <ArrowRight size={14} />
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
                borderRadius: '6px',
                padding: '6px',
                color: '#485c24',
                cursor: 'pointer',
              }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #ece7de',
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
                  borderRadius: '6px',
                  border: '1px solid #dcd5ca',
                  backgroundColor: '#ffffff',
                  color: '#485c24',
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
                  borderRadius: '6px',
                  backgroundColor: '#485c24',
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
      </header>

      {/* =========================================================================
          Hero Section: Centered Rotating Plate with Flanking Text & Backdrop Typography
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '48px 24px 64px',
          backgroundColor: '#faf8f4',
          borderBottom: '1px solid #ece7de',
          overflow: 'hidden',
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '820px',
            height: '820px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(72, 92, 36, 0.07) 0%, rgba(250, 248, 244, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Large Editorial Watermark Typography Behind Plate */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
            fontSize: 'clamp(4.5rem, 13vw, 10rem)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#485c24',
            opacity: 0.07,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1,
            willChange: 'opacity',
          }}
        >
          Chef Missy
        </div>

        {/* Hero Content Container (Flanking Text on Left/Right & Rotating Plate in Center) */}
        <div
          ref={heroContentRef}
          className="public-hero-container"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1240px',
            margin: '0 auto',
            width: '100%',
            willChange: 'transform, opacity',
            transformOrigin: 'top center',
          }}
        >
          {/* Left Wing: Headline & Introductory Narrative */}
          <div className="public-hero-left" style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              className="public-hero-heading"
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(2.1rem, 2.9vw, 2.85rem)',
                fontWeight: 600,
                color: '#2c3917',
                lineHeight: 1.18,
                margin: '0 0 16px',
                textWrap: 'balance',
                letterSpacing: '-0.015em',
              }}
            >
              Fresh, home-cooked meals prepared in your kitchen.
            </h1>

            <p
              style={{
                fontSize: '0.9375rem',
                color: '#5c564c',
                lineHeight: 1.6,
                margin: '0 0 24px',
                maxWidth: '440px',
                textWrap: 'pretty',
              }}
            >
              Chef Missy prepares wholesome dinners tailored to your family’s tastes and dietary needs. Made with fresh organic ingredients, cooked in your home, and ready whenever you are.
            </p>

            <div>
              <Link
                to={user ? '/home' : '/register'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  backgroundColor: '#485c24',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(72, 92, 36, 0.25)',
                  transition: 'background-color 200ms ease, transform 150ms ease',
                }}
              >
                <span>{user ? 'Plan Your Menu' : 'Create an Account'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Center Element: Centered Rotating Plate */}
          <div
            className="public-hero-plate-wrapper"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Soft frosted halo rim */}
            <div
              style={{
                padding: '10px',
                borderRadius: '50%',
                border: '1px solid rgba(72, 92, 36, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 16px 36px rgba(72, 92, 36, 0.14)',
              }}
            >
              <div
                ref={plateRef}
                className="public-hero-plate"
                style={{
                  width: '380px',
                  height: '380px',
                  maxWidth: '75vw',
                  maxHeight: '75vw',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow:
                    '0 24px 60px -12px rgba(72, 92, 36, 0.28), 0 8px 24px -4px rgba(0, 0, 0, 0.1)',
                  willChange: 'transform',
                  transformOrigin: '50% 50%',
                }}
              >
                <img
                  src="/assets/hero-plate.jpg"
                  alt="Chef Missy signature culinary tasting plate"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scale(1.05)',
                    display: 'block',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/public-hero-culinary.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Wing: Secondary Sign In & Quiet Proof Points */}
          <div className="public-hero-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                  transition: 'background-color 200ms ease, border-color 200ms ease',
                }}
              >
                <span>Client Sign In</span>
              </Link>
              <span style={{ fontSize: '0.75rem', color: '#716c62' }}>
                No contracts &bull; Book anytime
              </span>
            </div>

            {/* Quiet Proof Points Box */}
            <div
              className="public-proof-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                border: '1px solid #ece7de',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                boxShadow: '0 4px 16px rgba(46, 59, 18, 0.04)',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600, marginBottom: '2px' }}>
                  100% Organic Ingredients
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62', lineHeight: 1.4 }}>
                  Local organic produce &amp; pasture-raised meats
                </span>
              </div>
              <div style={{ borderTop: '1px solid #f0ede6', paddingTop: '10px' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600, marginBottom: '2px' }}>
                  Zero Seed Oils
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62', lineHeight: 1.4 }}>
                  Cold-pressed extra virgin olive oil and butter only
                </span>
              </div>
              <div style={{ borderTop: '1px solid #f0ede6', paddingTop: '10px' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600, marginBottom: '2px' }}>
                  Family &amp; Kid-Friendly
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62', lineHeight: 1.4 }}>
                  Mild flavours, toddler options (ages 1–5), and careful allergen care
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Tagline Reveal Section (Mandatory B11 per LandingPageDesignSkill)
          ========================================================================= */}
      <section
        style={{
          padding: '96px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ece7de',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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
              fontSize: '2.5rem',
              color: '#1a240e',
              lineHeight: 1.35,
              fontWeight: 600,
              margin: '0 auto',
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
        @media (min-width: 901px) {
          .public-hero-container {
            display: grid !important;
            grid-template-columns: 1.05fr minmax(320px, 400px) 0.95fr !important;
            align-items: center !important;
            gap: 40px !important;
          }
          .public-hero-left {
            text-align: left !important;
            align-items: flex-start !important;
          }
          .public-hero-right {
            text-align: left !important;
            align-items: flex-start !important;
          }
        }
        @media (max-width: 900px) {
          .public-desktop-nav {
            display: none !important;
          }
          .public-mobile-button {
            display: inline-flex !important;
          }
          .public-hero-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 28px !important;
          }
          .public-hero-plate {
            width: 280px !important;
            height: 280px !important;
          }
          .public-hero-heading {
            font-size: 2.25rem !important;
          }
          .public-tagline-text {
            font-size: 1.875rem !important;
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
          .public-hero-left,
          .public-hero-right {
            align-items: center !important;
            text-align: center !important;
          }
        }
        @media (max-width: 520px) {
          .public-hero-plate {
            width: 230px !important;
            height: 230px !important;
          }
          .public-hero-heading {
            font-size: 1.75rem !important;
          }
          .public-proof-card {
            padding: 16px !important;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
}
