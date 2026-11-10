import React, { useState } from 'react';
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

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Chef Missy differ from standard meal delivery services?',
      a: 'Standard meal delivery services produce food in commercial factories on assembly lines. Chef Missy operates as your dedicated private chef, sourcing fresh organic ingredients and preparing individual meals specifically tailored to your household portion counts and dietary requirements.',
    },
    {
      q: 'How are household allergies and dietary requirements managed?',
      a: 'During client registration, you record your household allergy dossier. Chef Missy strictly isolates ingredients for severe allergies, including nuts, gluten, dairy, nightshades, and Halal specifications, ensuring zero cross contamination during food preparation.',
    },
    {
      q: 'Can family members with different preferences share the same box?',
      a: 'Yes. You can select different dishes and portion quantities for individual members of your home. Each meal is packaged and labeled individually with complete reheating guidance.',
    },
    {
      q: 'How are meals delivered and how long do they stay fresh?',
      a: 'Meals are prepared on the morning of dispatch and delivered in insulated, temperature regulated containers. Dishes remain at peak freshness in your refrigerator for three to five days.',
    },
    {
      q: 'Is there a recurring contract or minimum weekly commitment?',
      a: 'There are no forced contracts. You can pack a meal box whenever you need private chef service, whether on a regular weekly schedule or for specific busy weeks.',
    },
    {
      q: 'How do I review the seasonal dishes and place my first order?',
      a: 'Create a client account to access the private seasonal catalog. Once registered, you can choose your dishes, configure portion counts, and select your delivery window.',
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
                  color: '#2e3b12',
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
                    backgroundColor: '#2e3b12',
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
                    color: '#2e3b12',
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
                    backgroundColor: '#2e3b12',
                    color: '#ffffff',
                    border: '1px solid #2e3b12',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
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
                color: '#2e3b12',
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
                  color: '#2e3b12',
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
                  backgroundColor: '#2e3b12',
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
          Hero Section: Introductory Narrative & One Polished Visual Moment
          ========================================================================= */}
      <section
        style={{
          padding: '64px 24px 80px',
          backgroundColor: '#faf8f4',
          borderBottom: '1px solid #ece7de',
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: '48px',
            alignItems: 'center',
          }}
          className="public-hero-layout"
        >
          {/* Left Narrative Block */}
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '1.5px',
                color: '#5c564c',
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
              }}
            >
              Private Chef Meal Preparation
            </span>

            <h1
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: '3rem',
                fontWeight: 600,
                color: '#1a240e',
                lineHeight: 1.15,
                margin: '0 0 20px',
                maxWidth: '620px',
                textWrap: 'balance',
              }}
              className="public-hero-heading"
            >
              Bespoke culinary service prepared fresh for your home.
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: '#5c564c',
                lineHeight: 1.6,
                margin: '0 0 32px',
                maxWidth: '540px',
                textWrap: 'pretty',
              }}
            >
              Chef Missy creates seasonal organic meals customized to your dietary regimen and portion needs. Sourced from local growers, prepared fresh in small batches, and delivered directly to your door.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link
                to={user ? '/home' : '/register'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#2e3b12',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>{user ? 'View Client Dashboard' : 'Create an Account'}</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#2e3b12',
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

            {/* Quiet Proof Points */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                paddingTop: '24px',
                borderTop: '1px solid #e8e2d5',
              }}
              className="public-proof-strip"
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600 }}>
                  100% Organic
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62' }}>
                  Regional farm produce
                </span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600 }}>
                  Zero Seed Oils
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62' }}>
                  Pure cold pressed olive oil
                </span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#1a1814', fontWeight: 600 }}>
                  Strict Isolation
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#716c62' }}>
                  Complete allergen safety
                </span>
              </div>
            </div>
          </div>

          {/* Right Image: Single Polished Craft Visual */}
          <div>
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2dacd',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 30px rgba(46, 59, 18, 0.08)',
              }}
            >
              <img
                src="/assets/public-hero-culinary.jpg"
                alt="Chef Missy private culinary preparation"
                style={{
                  width: '100%',
                  height: '440px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.currentTarget.src = '/assets/auth-hero-salmon.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Tagline Reveal Section (Mandatory B11 per LandingPageDesignSkill)
          ========================================================================= */}
      <section
        style={{
          padding: '80px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ece7de',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '2px',
              color: '#716c62',
              fontWeight: 600,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px',
            }}
          >
            Our Commitment
          </span>
          <p
            style={{
              fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
              fontSize: '2.25rem',
              color: '#1a240e',
              lineHeight: 1.3,
              fontWeight: 600,
              margin: '0 auto',
              textWrap: 'balance',
            }}
            className="public-tagline-text"
          >
            Fresh seasonal ingredients and thoughtful recipes, prepared with care exclusively for your household table.
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
                color: '#1a240e',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              Personal culinary attention without mass production
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5, textWrap: 'pretty' }}>
              Unlike commercial subscription boxes, Chef Missy tailors cooking techniques, ingredients, and portions to your individual household dossier.
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
                  color: '#2e3b12',
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
                  color: '#2e3b12',
                  marginBottom: '20px',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Individual Allergen Care
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Every meal is prepared according to your household dietary safety profile. Strict isolation for nuts, gluten, dairy, nightshades, and Halal specifications.
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
                  color: '#2e3b12',
                  marginBottom: '20px',
                }}
              >
                <ChefHat size={20} />
              </div>
              <h3 style={{ fontSize: '1.125rem', color: '#1a1814', margin: '0 0 10px', fontWeight: 600 }}>
                Custom Household Portions
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Specify exact serving counts per dish. Whether providing dinner for two, a growing family, or high protein training diets, your meal box arrives calibrated to your needs.
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
                color: '#1a240e',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              How our private dining service works
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#5c564c', maxWidth: '540px', margin: '0 auto', lineHeight: 1.5, textWrap: 'pretty' }}>
              Three steps from household registration to chilled doorstep delivery.
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
                  backgroundColor: '#2e3b12',
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
                Create your client dossier detailing food allergies, dietary restrictions, and household portion preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#2e3b12',
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
                Select your dishes
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Access the private client portal to browse rotating seasonal options and pick the exact meals for your box.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#2e3b12',
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
                Delivered fresh
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#655e53', lineHeight: 1.55, margin: 0 }}>
                Chef Missy sources the ingredients, cooks your meals fresh, and delivers chilled boxes in temperature regulated packaging.
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
                color: '#1a240e',
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
                color: '#1a240e',
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
              color: '#1a240e',
              margin: '0 0 16px',
              fontWeight: 600,
              textWrap: 'balance',
            }}
          >
            Experience private chef dining in your home
          </h2>
          <p style={{ fontSize: '1rem', color: '#5c564c', lineHeight: 1.6, margin: '0 0 32px', textWrap: 'pretty' }}>
            Create your household dossier to access the seasonal catalog, set custom portions, and reserve your meal box delivery.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/home' : '/register'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                backgroundColor: '#2e3b12',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>{user ? 'Go to Client Dashboard' : 'Create an Account'}</span>
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
                color: '#2e3b12',
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
      <footer style={{ backgroundColor: '#1a240e', color: '#c5d1b3', padding: '48px 24px 32px' }}>
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
        @media (max-width: 900px) {
          .public-desktop-nav {
            display: none !important;
          }
          .public-mobile-button {
            display: inline-flex !important;
          }
          .public-hero-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .public-hero-heading {
            font-size: 2.25rem !important;
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
          .public-hero-heading {
            font-size: 1.875rem !important;
          }
          .public-proof-strip {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
