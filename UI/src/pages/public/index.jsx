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
  UserPlus,
  Calendar,
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
  const serviceSectionRef = useRef(null);
  const serviceCircleOverlayRef = useRef(null);
  const serviceContentRef = useRef(null);
  const lastServiceClipRef = useRef('');
  const lastServiceRevealedRef = useRef(null);
  const howItWorksRef = useRef(null);
  const lastHowItWorksRevealedRef = useRef(null);

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

  const taglineWordsRef = useRef([]);
  const lastActiveWordsRef = useRef(-1);
  const metricsRef = useRef({
    deltaX: 0,
    deltaY: 680,
    taglineTop: 800,
    serviceTop: 1500,
    serviceHeight: 560,
    serviceMaxRadius: 1000,
    howItWorksTop: 2200,
    howItWorksHeight: 620,
    windowH: 800,
    maxScroll: 2000,
  });

  useEffect(() => {
    const SERVICE_DOT_RADIUS = 6;
    const SERVICE_DOT_Y = 34;

    if (taglineRef.current) {
      taglineWordsRef.current = Array.from(
        taglineRef.current.querySelectorAll('.public-tagline-word')
      );
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      taglineWordsRef.current.forEach((span) => {
        span.style.color = '#2c3917';
        span.style.opacity = '1';
      });
      if (serviceCircleOverlayRef.current) {
        const settledClip = `circle(150% at 50% ${SERVICE_DOT_Y}px)`;
        serviceCircleOverlayRef.current.style.clipPath = settledClip;
        serviceCircleOverlayRef.current.style.WebkitClipPath = settledClip;
      }
      if (serviceSectionRef.current) {
        serviceSectionRef.current.classList.add('service-revealed');
      }
      if (serviceContentRef.current) {
        serviceContentRef.current.style.pointerEvents = 'auto';
      }
      if (howItWorksRef.current) {
        howItWorksRef.current.classList.add('steps-revealed');
      }
      return;
    }

    // Measure document-space positions strictly on mount/resize (never inside scroll frames)
    const measureMetrics = () => {
      const windowH = window.innerHeight || 800;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - windowH);
      let deltaX = 0;
      let deltaY = windowH * 0.85;
      let taglineTop = windowH;
      let serviceTop = windowH * 2;
      let serviceHeight = 560;
      let serviceMaxRadius = 1100;
      let howItWorksTop = windowH * 3;
      let howItWorksHeight = 620;

      if (plateAnchorRef.current && plateTargetRef.current) {
        const anchorRect = plateAnchorRef.current.getBoundingClientRect();
        const targetRect = plateTargetRef.current.getBoundingClientRect();
        const anchorCenterX = anchorRect.left + window.scrollX + anchorRect.width / 2;
        const anchorCenterY = anchorRect.top + window.scrollY + anchorRect.height / 2;
        const targetCenterX = targetRect.left + window.scrollX + targetRect.width / 2;
        const targetCenterY = targetRect.top + window.scrollY + targetRect.height / 2;
        deltaX = targetCenterX - anchorCenterX;
        deltaY = targetCenterY - anchorCenterY;
      }

      if (taglineRef.current) {
        taglineTop = taglineRef.current.getBoundingClientRect().top + window.scrollY;
      }

      if (serviceSectionRef.current) {
        const serviceRect = serviceSectionRef.current.getBoundingClientRect();
        serviceTop = serviceRect.top + window.scrollY;
        serviceHeight = serviceRect.height || 560;
        const halfW = (serviceRect.width || window.innerWidth || 1200) * 0.5;
        const bottomDist = Math.max(SERVICE_DOT_Y, serviceHeight - SERVICE_DOT_Y);
        serviceMaxRadius = Math.hypot(halfW, bottomDist) + 12;
      }

      if (howItWorksRef.current) {
        const howRect = howItWorksRef.current.getBoundingClientRect();
        howItWorksTop = howRect.top + window.scrollY;
        howItWorksHeight = howRect.height || 620;
      }

      metricsRef.current = {
        deltaX,
        deltaY,
        taglineTop,
        serviceTop,
        serviceHeight,
        serviceMaxRadius,
        howItWorksTop,
        howItWorksHeight,
        windowH,
        maxScroll,
      };
    };

    const applyAnimations = (scrollY) => {
      const {
        deltaX,
        deltaY,
        taglineTop,
        serviceTop,
        serviceHeight,
        serviceMaxRadius,
        howItWorksTop,
        howItWorksHeight,
        windowH,
      } = metricsRef.current;

      // 1. Hero Left Text Dissolve
      const textFadeStart = 60;
      const textFadeEnd = windowH * 0.65;
      const textProgress = Math.min(1, Math.max(0, (scrollY - textFadeStart) / (textFadeEnd - textFadeStart)));
      const textOpacity = Math.max(0, 1 - textProgress);
      if (heroContentRef.current) {
        heroContentRef.current.style.opacity = textOpacity.toFixed(3);
        heroContentRef.current.style.transform = `translate3d(0, ${(textProgress * 30).toFixed(2)}px, 0)`;
        heroContentRef.current.style.pointerEvents = textOpacity <= 0.05 ? 'none' : 'auto';
      }

      // 2. Dissolve backdrop watermark text
      if (backdropRef.current) {
        backdropRef.current.style.opacity = (0.07 * textOpacity).toFixed(3);
      }

      // 3. Plate Jump & Shape-Shift to Section 2
      const jumpStart = windowH * 0.28;
      const jumpEnd = windowH * 0.68;
      const jumpProgress = Math.min(1, Math.max(0, (scrollY - jumpStart) / (jumpEnd - jumpStart)));
      const eased = jumpProgress * jumpProgress * (3 - 2 * jumpProgress);

      if (plateRef.current) {
        const jumpArc = Math.sin(eased * Math.PI) * 24;
        const currentX = eased * deltaX;
        const currentY = eased * deltaY - jumpArc;
        const currentScale = 1 + Math.sin(eased * Math.PI) * 0.04;
        const currentRotation = eased >= 1 ? 0 : (1 - eased) * (scrollY * 0.18);

        plateRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(${currentScale.toFixed(4)}) rotate(${currentRotation.toFixed(3)}deg)`;

        // Cross-fade using GPU opacity + visibility (avoids display none/block GPU texture drops)
        const heroAlpha = Math.max(0, 1 - (jumpProgress / 0.40));
        const secondAlpha = Math.min(1, jumpProgress / 0.40);

        if (heroPlateLayerRef.current) {
          heroPlateLayerRef.current.style.opacity = heroAlpha.toFixed(3);
          heroPlateLayerRef.current.style.visibility = heroAlpha <= 0.005 ? 'hidden' : 'visible';
        }
        if (secondPlateLayerRef.current) {
          secondPlateLayerRef.current.style.opacity = secondAlpha.toFixed(3);
          secondPlateLayerRef.current.style.visibility = secondAlpha <= 0.005 ? 'hidden' : 'visible';
        }

        if (sprigRef.current) {
          sprigRef.current.style.opacity = Math.max(0, 0.95 * (1 - eased * 2)).toFixed(3);
        }
      }

      // 4. Word-by-word reveal for the Tagline section (zero layout reads; only mutates when count changes)
      if (taglineWordsRef.current.length > 0) {
        const rectTop = taglineTop - scrollY;
        const startY = windowH * 0.85;
        const endY = windowH * 0.45;
        const tagProgress = Math.min(1, Math.max(0, (startY - rectTop) / (startY - endY)));
        const words = taglineWordsRef.current;
        const activeCount = Math.floor(tagProgress * (words.length + 1));

        if (activeCount !== lastActiveWordsRef.current) {
          lastActiveWordsRef.current = activeCount;
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
      }

      // 5. Section 3 Olive Circle Reveal (starts at 30%, finishes at 100% section visible; text fades in after)
      if (serviceCircleOverlayRef.current) {
        const visibleInViewport = (scrollY + windowH) - serviceTop;
        const endVisible = Math.min(serviceHeight, windowH * 0.94);
        const startVisible = Math.min(serviceHeight * 0.30, endVisible * 0.55);
        const range = Math.max(40, endVisible - startVisible);
        const rawProgress = Math.min(1, Math.max(0, (visibleInViewport - startVisible) / range));
        const curved = rawProgress <= 0 ? 0 : Math.pow(rawProgress, 1.3);
        const radius = SERVICE_DOT_RADIUS + (serviceMaxRadius - SERVICE_DOT_RADIUS) * curved;
        const nextClip = `circle(${radius.toFixed(1)}px at 50% ${SERVICE_DOT_Y}px)`;

        if (lastServiceClipRef.current !== nextClip) {
          lastServiceClipRef.current = nextClip;
          serviceCircleOverlayRef.current.style.clipPath = nextClip;
          serviceCircleOverlayRef.current.style.WebkitClipPath = nextClip;
        }

        const isDone = rawProgress >= 0.998;
        if (lastServiceRevealedRef.current !== isDone) {
          lastServiceRevealedRef.current = isDone;
          if (serviceSectionRef.current) {
            serviceSectionRef.current.classList.toggle('service-revealed', isDone);
          }
          if (serviceContentRef.current) {
            serviceContentRef.current.style.pointerEvents = isDone ? 'auto' : 'none';
          }
        }
      }

      // 6. Section 4 How-It-Works Reveal (enters smoothly once scrolled in; cleanly reversible when scrolled above)
      if (howItWorksRef.current) {
        const visibleHow = (scrollY + windowH) - howItWorksTop;
        const threshold = Math.min(howItWorksHeight * 0.25, windowH * 0.25);
        const resetThreshold = Math.min(howItWorksHeight * 0.08, 40);
        let nextReveal = lastHowItWorksRevealedRef.current;
        if (visibleHow >= threshold) nextReveal = true;
        else if (visibleHow < resetThreshold) nextReveal = false;

        if (nextReveal !== lastHowItWorksRevealedRef.current) {
          lastHowItWorksRevealedRef.current = nextReveal;
          howItWorksRef.current.classList.toggle('steps-revealed', Boolean(nextReveal));
        }
      }
    };

    // Crisp smooth-scroll wheel engine ("smooth but not the smoothest")
    // Locks scroll offset + image transform into the exact same main-thread frame commit
    let currentScroll = window.scrollY;
    let targetScroll = currentScroll;
    let expectedScrollY = currentScroll;
    let isWheelAnimating = false;
    let scrollTicking = false;
    let wheelRafId = null;
    let lastTime = performance.now();

    const stepScrollLoop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) < 0.35) {
        currentScroll = targetScroll;
        window.scrollTo({ top: currentScroll, behavior: 'instant' });
        const actualY = window.scrollY;
        expectedScrollY = actualY;
        applyAnimations(actualY);
        isWheelAnimating = false;
        wheelRafId = null;
        return;
      }

      // Exponential damping k = 15: crisp & responsive (~200ms settle), removes tick jitter without floaty lag
      const alpha = 1 - Math.exp(-15 * dt);
      currentScroll += diff * alpha;

      window.scrollTo({ top: currentScroll, behavior: 'instant' });
      const actualY = window.scrollY;
      expectedScrollY = actualY;
      applyAnimations(actualY);

      wheelRafId = window.requestAnimationFrame(stepScrollLoop);
    };

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (metricsRef.current.maxScroll <= 0) return;

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 18;
      else if (e.deltaMode === 2) deltaY *= metricsRef.current.windowH;

      const base = isWheelAnimating ? targetScroll : window.scrollY;
      const nextTarget = Math.min(metricsRef.current.maxScroll, Math.max(0, base + deltaY));

      if (!isWheelAnimating && Math.abs(nextTarget - window.scrollY) < 0.5) {
        return;
      }

      e.preventDefault();
      targetScroll = nextTarget;

      if (!isWheelAnimating) {
        currentScroll = window.scrollY;
        lastTime = performance.now();
        isWheelAnimating = true;
        wheelRafId = window.requestAnimationFrame(stepScrollLoop);
      }
    };

    const onScroll = () => {
      // Ignore scroll callbacks triggered synchronously by our wheel loop
      if (isWheelAnimating && Math.abs(window.scrollY - expectedScrollY) <= 2) {
        return;
      }
      if (isWheelAnimating && wheelRafId) {
        window.cancelAnimationFrame(wheelRafId);
        isWheelAnimating = false;
        wheelRafId = null;
      }
      currentScroll = window.scrollY;
      targetScroll = currentScroll;
      expectedScrollY = currentScroll;

      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          applyAnimations(window.scrollY);
          scrollTicking = false;
        });
      }
    };

    const onResize = () => {
      measureMetrics();
      applyAnimations(window.scrollY);
    };

    measureMetrics();
    applyAnimations(window.scrollY);

    const resizeObserver = new ResizeObserver(() => {
      measureMetrics();
      applyAnimations(window.scrollY);
    });
    resizeObserver.observe(document.documentElement);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (wheelRafId) window.cancelAnimationFrame(wheelRafId);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does Chef Missy’s private chef service work?',
      a: 'Chef Missy sources wholesome, fresh ingredients and prepares nutritious, home-cooked meals tailored to your family’s menu selections and dietary needs.',
    },
    {
      q: 'How are food allergies and dietary needs handled?',
      a: 'When you create an account, you can let us know if anyone in your family has food allergies. Chef Missy discusses any allergies or ingredient dislikes directly with each family to ensure all meals are prepared safely.',
    },
    {
      q: 'Can family members choose different dishes?',
      a: 'Yes. You can select a variety of mains, sides, soups, desserts, and kid-friendly dishes for your menu, making it easy to satisfy everyone at the table.',
    },
    {
      q: 'How long do the prepared meals stay fresh?',
      a: 'Dishes are prepared fresh by Chef Missy and stay flavorful and ready to enjoy for three to five days.',
    },
    {
      q: 'Is there a recurring contract or minimum weekly commitment?',
      a: 'No forced contracts or commitments. You can schedule meals whenever you need help, whether on a regular weekly basis or for busy periods.',
    },
    {
      q: 'How do I choose dishes and place my first order?',
      a: 'Create an account to browse the seasonal dishes, choose up to 7 dishes, pick your preferred preparation date (Morning or Afternoon), and submit your request. All meal details are confirmed directly with Chef Missy.',
    },
  ];

  const navSections = [
    { id: 'service', label: 'The Service', isPrimary: true },
    { id: 'how-it-works', label: 'How It Works', isPrimary: false },
    { id: 'faq', label: 'Questions', isPrimary: false },
  ];

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const scrollToSection = (sectionId, closeMobile = false) => {
    if (closeMobile) setMobileMenuOpen(false);
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1a1814', minHeight: '100vh', overflowX: 'hidden', fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)" }}>
      
      {/* =========================================================================
          Top Header Navigation (Floating Capsule per hero-design.png)
          ========================================================================= */}
      <div
        className="public-navbar-wrapper"
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
          className="public-navbar-header"
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
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Logo & Identity */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            className="navbar-brand-link"
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
              className="navbar-brand-logo-wrap"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                overflow: 'hidden',
                clipPath: 'circle(50%)',
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
                className="navbar-brand-logo-img"
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
                className="navbar-brand-title"
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
                className="navbar-brand-subtitle"
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
            {navSections.map(({ id, label, isPrimary }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                style={{
                  fontSize: '0.76rem',
                  color: isPrimary ? '#ffffff' : '#1c301d',
                  backgroundColor: isPrimary ? '#1e3320' : 'transparent',
                  padding: isPrimary ? '4px 12px' : '4px 9px',
                  borderRadius: isPrimary ? '9999px' : '6px',
                  border: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {user ? (
              <div className="public-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              <div className="public-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
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

        {/* Mobile Navigation Overlay Dropdown (floats cleanly without shifting Hero; unfolds from top) */}
        <div
          aria-hidden={!mobileMenuOpen}
          className={`public-mobile-dropdown ${mobileMenuOpen ? 'is-open' : ''}`}
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid #ece7de',
            boxShadow: '0 14px 32px rgba(20, 30, 12, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {navSections.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              tabIndex={mobileMenuOpen ? 0 : -1}
              onClick={() => scrollToSection(id, true)}
              style={{
                fontSize: '0.9rem',
                color: '#1a1814',
                background: 'none',
                border: 'none',
                padding: '4px 0',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #f0ede6', display: 'flex', gap: '8px' }}>
            {user ? (
              <>
                <Link
                  to="/home"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '9px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#1e3320',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '9999px',
                    border: '1px solid #dcd5ca',
                    backgroundColor: '#ffffff',
                    color: '#1e3320',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '9px',
                    borderRadius: '9999px',
                    border: '1px solid #dcd5ca',
                    backgroundColor: '#ffffff',
                    color: '#1e3320',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '9px',
                    borderRadius: '9999px',
                    backgroundColor: '#1e3320',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          Hero Section: Exact Replica of hero-design.png
          ========================================================================= */}
      <section
        className="hero-section"
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
        {/* 1. Deep Forest Green Organic Backdrop with Cream Frame & Shadow (Desktop Right Sweep) */}
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

        {/* Mobile/Small-Screen Smooth Green Bottom Mound Backdrop (per mobile reference) */}
        <div
          aria-hidden="true"
          className="hero-green-curve-mobile"
          style={{
            display: 'none',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '44%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <svg
            viewBox="0 0 600 420"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <linearGradient id="creamFrameGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ede3d1" stopOpacity="0.82" />
                <stop offset="55%" stopColor="#e5dcce" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#ded2bf" stopOpacity="0.65" />
              </linearGradient>
              <linearGradient id="heroGreenBaseMobile" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#2c4c2f" />
                <stop offset="50%" stopColor="#223d26" />
                <stop offset="100%" stopColor="#142617" />
              </linearGradient>
              <linearGradient id="heroFacetLightMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f6f4f" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#2a472b" stopOpacity="0.82" />
              </linearGradient>
            </defs>
            <path
              d="M 0 185 C 145 78, 435 55, 600 135 L 600 420 L 0 420 Z"
              fill="url(#creamFrameGradMobile)"
            />
            <path
              d="M 0 218 C 160 112, 435 92, 600 164 L 600 420 L 0 420 Z"
              fill="url(#heroGreenBaseMobile)"
            />
            <path
              d="M 380 124 C 465 130, 540 144, 600 164 L 600 280 L 460 220 Z"
              fill="url(#heroFacetLightMobile)"
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
          className="hero-container"
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
              <div
                className="hero-kicker-row"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <span
                  className="hero-kicker-text"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '2.5px',
                    color: '#2c3917',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Private Chef Service
                </span>
                <span
                  aria-hidden="true"
                  className="hero-kicker-line"
                  style={{
                    width: '36px',
                    height: '1px',
                    backgroundColor: '#7a8764',
                    opacity: 0.7,
                  }}
                />
              </div>

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
                className="hero-body-copy"
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
                <div className="hero-proof-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="hero-proof-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#edf3e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Leaf size={16} color="#254228" />
                  </div>
                  <div>
                    <strong className="hero-proof-title" style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>100% Organic</strong>
                    <span className="hero-proof-sub" style={{ fontSize: '0.68rem', color: '#716c62' }}>Farm Fresh Ingredients</span>
                  </div>
                </div>

                <div className="hero-proof-divider" style={{ width: '1px', height: '26px', backgroundColor: '#dcd5ca' }} />

                <div className="hero-proof-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="hero-proof-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChefHat size={16} color="#1c301d" />
                  </div>
                  <div>
                    <strong className="hero-proof-title" style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>Expert Chef</strong>
                    <span className="hero-proof-sub" style={{ fontSize: '0.68rem', color: '#716c62' }}>Professional Quality</span>
                  </div>
                </div>

                <div className="hero-proof-divider" style={{ width: '1px', height: '26px', backgroundColor: '#dcd5ca' }} />

                <div className="hero-proof-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="hero-proof-icon" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f4efe6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={16} color="#1c301d" />
                  </div>
                  <div>
                    <strong className="hero-proof-title" style={{ display: 'block', fontSize: '0.80rem', color: '#1c301d', fontWeight: 700 }}>On-Time Delivery</strong>
                    <span className="hero-proof-sub" style={{ fontSize: '0.68rem', color: '#716c62' }}>Freshly Prepared</span>
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
                className="hero-sprig-behind"
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
                  backfaceVisibility: 'hidden',
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
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                >
                  <img
                    src="/assets/hero-plate.jpg"
                    alt="Chef Missy signature culinary plate"
                    loading="eager"
                    decoding="sync"
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
                    visibility: 'hidden',
                    zIndex: 15,
                    willChange: 'opacity',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src="/assets/2nd-section-plate.png"
                    alt="Chef Missy grilled salmon plate"
                    loading="eager"
                    decoding="sync"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      transform: 'scale(1.14) translateZ(0)',
                      filter: 'drop-shadow(0 28px 44px rgba(0, 0, 0, 0.32))',
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
          className="hero-bottom-ribbon"
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
            <div className="hero-ribbon-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <Leaf size={28} color="#a6bc9f" strokeWidth={1.8} className="hero-ribbon-icon" />
              <div>
                <strong className="hero-ribbon-title" style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Fresh &amp; Organic</strong>
                <span className="hero-ribbon-sub" style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Always</span>
              </div>
            </div>

            {/* Col 2 */}
            <div
              className="hero-ribbon-item hero-ribbon-divider-col"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Award size={28} color="#a6bc9f" strokeWidth={1.8} className="hero-ribbon-icon" />
              <div>
                <strong className="hero-ribbon-title" style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Premium Quality</strong>
                <span className="hero-ribbon-sub" style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Guaranteed</span>
              </div>
            </div>

            {/* Col 3 */}
            <div className="hero-ribbon-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <Heart size={28} color="#a6bc9f" strokeWidth={1.8} className="hero-ribbon-icon" />
              <div>
                <strong className="hero-ribbon-title" style={{ display: 'block', fontSize: '0.96rem', color: '#ffffff', fontWeight: 600 }}>Made with Care</strong>
                <span className="hero-ribbon-sub" style={{ fontSize: '0.72rem', color: '#a6bc9f' }}>Just for you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Tagline Reveal Section with Plate Landing Target (Our Commitment)
          ========================================================================= */}
      <section
        className="tagline-section"
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
              className="tagline-kicker"
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
            <span className="tagline-caption" style={{ fontSize: '0.88rem', color: '#716c62', fontStyle: 'italic', display: 'block' }}>
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
              className="tagline-ovals-svg"
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
      <section
        ref={serviceSectionRef}
        id="service"
        className="service-section"
        style={{
          padding: '72px 24px 84px',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* Expanding circle stage: starts as olive dot (30% -> 100%), opens into botanical cream canvas */}
        <div
          ref={serviceCircleOverlayRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #faf7ef 0%, #f5f0e2 52%, #f8f4ea 100%)',
            clipPath: 'circle(6px at 50% 34px)',
            WebkitClipPath: 'circle(6px at 50% 34px)',
            pointerEvents: 'none',
            zIndex: 1,
            willChange: 'clip-path',
          }}
        >
          {/* Ambient soft blurred botanical leaf shadows matching reference */}
          <img
            src="/assets/leaf.png"
            alt=""
            style={{
              position: 'absolute',
              top: '-18px',
              left: '50px',
              width: '270px',
              transform: 'rotate(24deg)',
              opacity: 0.08,
              filter: 'blur(7px) brightness(0.2)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          <img
            src="/assets/leaf.png"
            alt=""
            style={{
              position: 'absolute',
              top: '130px',
              left: '-20px',
              width: '215px',
              transform: 'rotate(54deg)',
              opacity: 0.06,
              filter: 'blur(9px) brightness(0.2)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          <img
            src="/assets/leaf.png"
            alt=""
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '-32px',
              width: '320px',
              transform: 'rotate(-18deg) scaleX(-1)',
              opacity: 0.09,
              filter: 'blur(6px) brightness(0.25)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />

          {/* Top-right dark olive wave + cream shade crescent (anchored top-right so tall mobile never stretches behind centered copy) */}
          <svg
            viewBox="0 0 476 298"
            preserveAspectRatio="none"
            className="service-corner-curves-svg service-top-curve-svg"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '33.0556%',
              height: 'clamp(56px, 20.7vw, 298px)',
              display: 'block',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="serviceTopShadeGrad" x1="15%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#efe7d6" stopOpacity="0.58" />
                <stop offset="55%" stopColor="#e6dac4" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#ddd0b8" stopOpacity="0.62" />
              </linearGradient>
              <linearGradient id="serviceTopGreenGrad" x1="15%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#26401c" />
                <stop offset="55%" stopColor="#2d4821" />
                <stop offset="100%" stopColor="#1e3416" />
              </linearGradient>
              <filter id="serviceCurveShadow" x="-15%" y="-15%" width="130%" height="140%">
                <feDropShadow dx="-2" dy="6" stdDeviation="8" floodColor="#182411" floodOpacity="0.16" />
              </filter>
            </defs>

            {/* Top-Right Cream Shade Arc Crescent */}
            <path
              d="M 41 0 C 104 142, 224 278, 476 298 L 476 0 Z"
              fill="url(#serviceTopShadeGrad)"
            />

            {/* Top-Right Deep Olive Curved Shape */}
            <path
              d="M 0 0 C 90 62, 170 162, 282 164 C 358 165, 420 152, 476 156 L 476 0 Z"
              fill="url(#serviceTopGreenGrad)"
              filter="url(#serviceCurveShadow)"
            />
          </svg>

          {/* Bottom-left deep olive hill (matches Section 4 inverted seam height & width at all viewports) */}
          <svg
            viewBox="0 0 428 168"
            preserveAspectRatio="none"
            className="service-corner-curves-svg service-bottom-curve-svg"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '29.7222%',
              height: 'clamp(48px, 11.67vw, 168px)',
              display: 'block',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="serviceBottomGreenGrad" x1="0%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#3b542a" />
                <stop offset="45%" stopColor="#2b431f" />
                <stop offset="100%" stopColor="#1e3316" />
              </linearGradient>
            </defs>
            <path
              d="M 0 0 C 134 30, 314 92, 428 168 L 0 168 Z"
              fill="url(#serviceBottomGreenGrad)"
            />
            <path
              d="M 0 44 C 94 76, 166 120, 234 168 L 0 168 Z"
              fill="#ffffff"
              opacity="0.06"
            />
          </svg>

          {/* Olive fill wash: makes growing/shrinking dot solid olive #485c24, parts cleanly when 100% visible */}
          <div
            className="service-olive-wash"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#485c24',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Crisp Corner Foliage Branches (Top-Left, Top-Right, Bottom-Right overlapping Card 3 corner) */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="service-corner-branch service-corner-branch-tl"
          style={{
            position: 'absolute',
            top: '-22px',
            left: '-38px',
            width: '240px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 3,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 12px 20px rgba(24, 34, 14, 0.22))',
          }}
        />
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="service-corner-branch service-corner-branch-tr"
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-28px',
            width: '255px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 3,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 12px 22px rgba(16, 26, 10, 0.34))',
          }}
        />
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="service-corner-branch service-corner-branch-br"
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '-42px',
            width: '230px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 4,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 14px 24px rgba(20, 30, 12, 0.28))',
          }}
        />

        <div
          ref={serviceContentRef}
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            {/* Eyebrow flanked by tapered horizontal lines */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                marginBottom: '12px',
              }}
            >
              <span
                aria-hidden="true"
                className="service-divider-line service-divider-line-left"
                style={{
                  width: '92px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #62744a)',
                }}
              />
              <span className="service-reveal-line-mask">
                <span
                  className="service-eyebrow service-reveal-step service-step-0"
                  style={{ fontSize: '0.75rem', letterSpacing: '1.8px', color: '#2b3b19', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  The Private Chef Difference
                </span>
              </span>
              <span
                aria-hidden="true"
                className="service-divider-line service-divider-line-right"
                style={{
                  width: '92px',
                  height: '1px',
                  background: 'linear-gradient(90deg, #62744a, transparent)',
                }}
              />
            </div>

            <h2
              className="service-heading"
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(1.95rem, 3.1vw, 2.55rem)',
                lineHeight: 1.2,
                color: '#172010',
                margin: '0 0 14px',
                fontWeight: 600,
              }}
            >
              <span className="service-reveal-line-mask">
                <span className="service-reveal-step service-step-1">
                  <span style={{ color: '#455c24', fontStyle: 'italic', fontWeight: 500 }}>Fresh,</span> home-cooked food without
                </span>
              </span>
              <span className="service-reveal-line-mask">
                <span className="service-reveal-step service-step-2">
                  the shopping or kitchen <span style={{ color: '#455c24', fontStyle: 'italic', fontWeight: 500 }}>stress</span>
                </span>
              </span>
            </h2>

            <p className="service-subtitle" style={{ fontSize: '0.9375rem', color: '#565147', maxWidth: '680px', margin: '0 auto', lineHeight: 1.55 }}>
              <span className="service-reveal-line-mask">
                <span className="service-reveal-step service-step-3">
                  Unlike takeout or commercial meal kits, Chef Missy prepares wholesome
                </span>
              </span>
              <span className="service-reveal-line-mask">
                <span className="service-reveal-step service-step-4">
                  dinners from scratch with care, customized directly to your family’s tastes
                </span>
              </span>
              <span className="service-reveal-line-mask">
                <span className="service-reveal-step service-step-5">
                  and portion needs.
                </span>
              </span>
            </p>

            {/* Centered olive sprig divider */}
            <div
              className="service-reveal-step service-step-6"
              aria-hidden="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '18px',
              }}
            >
              <span
                className="service-sprig-line"
                style={{
                  width: '88px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(160, 146, 108, 0.7))',
                }}
              />
              <img
                src="/assets/leaf.png"
                alt=""
                style={{
                  width: '28px',
                  height: 'auto',
                  transform: 'rotate(12deg)',
                  filter: 'brightness(0.85) contrast(1.1) saturate(0.9)',
                  display: 'block',
                }}
              />
              <span
                className="service-sprig-line"
                style={{
                  width: '88px',
                  height: '1px',
                  background: 'linear-gradient(90deg, rgba(160, 146, 108, 0.7), transparent)',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
            className="public-pillars-grid"
          >
            {[
              {
                Icon: Leaf,
                title: 'Whole Food Farm Sourcing',
                desc: 'Pasture raised meats, wild caught seafood, and seasonal produce sourced from regional organic growers. No factory processed ingredients or chemical additives.',
                img: '/assets/service-card-farm.jpg',
                imgWidth: '94%',
                imgBottom: '-4px',
                imgRight: '-2px',
                cardStep: 7,
                titleStep: 8,
                descStep: 9,
              },
              {
                Icon: ShieldCheck,
                title: 'Individual Allergen Care',
                desc: 'Every meal is prepared according to your dietary needs and allergies, discussed directly with each family to ensure complete peace of mind.',
                img: '/assets/service-card-allergen.jpg',
                imgWidth: '92%',
                imgBottom: '-2px',
                imgRight: '-2px',
                cardStep: 8,
                titleStep: 9,
                descStep: 10,
              },
              {
                Icon: ChefHat,
                title: 'Family-Sized Portions',
                desc: 'Choose dishes that suit everyone at your table, from wholesome family mains to options suitable for young children (ages 1–5).',
                img: '/assets/service-card-portions.jpg',
                imgWidth: '88%',
                imgBottom: '-26px',
                imgRight: '-12px',
                cardStep: 9,
                titleStep: 10,
                descStep: 11,
              },
            ].map(({ Icon, title, desc, img, imgWidth, imgBottom, imgRight, cardStep, titleStep, descStep }) => (
              <div
                key={title}
                className={`service-pillar-card service-reveal-card service-reveal-step service-step-${cardStep}`}
                style={{
                  background: 'linear-gradient(165deg, #fdfcf8 0%, #f8f4ea 100%)',
                  borderRadius: '14px',
                  padding: '28px 26px 104px',
                  border: '1px solid rgba(208, 200, 180, 0.85)',
                  boxShadow: '0 12px 28px rgba(34, 42, 22, 0.08), 0 2px 6px rgba(34, 42, 22, 0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Faint top-right botanical leaf watermark inside card */}
                <img
                  src="/assets/leaf.png"
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    right: '-24px',
                    width: '150px',
                    opacity: 0.14,
                    transform: 'rotate(-18deg)',
                    filter: 'saturate(0.6) brightness(1.02)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />

                {/* Generated photorealistic culinary corner image */}
                <img
                  src={img}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="sync"
                  className="service-pillar-photo"
                  style={{
                    position: 'absolute',
                    right: imgRight,
                    bottom: imgBottom,
                    width: imgWidth,
                    height: 'auto',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 0,
                    mixBlendMode: 'multiply',
                    WebkitMaskImage: 'radial-gradient(ellipse 84% 78% at 82% 88%, #000 42%, rgba(0,0,0,0.8) 62%, transparent 90%)',
                    maskImage: 'radial-gradient(ellipse 84% 78% at 82% 88%, #000 42%, rgba(0,0,0,0.8) 62%, transparent 90%)',
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    className="service-pillar-icon"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      backgroundColor: '#e7ebda',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2b411c',
                      marginBottom: '20px',
                    }}
                  >
                    <Icon size={21} strokeWidth={1.7} />
                  </div>
                  <div className="service-reveal-line-mask" style={{ marginBottom: '6px' }}>
                    <h3
                      className={`service-pillar-title service-reveal-step service-step-${titleStep}`}
                      style={{
                        fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                        fontSize: '1.22rem',
                        color: '#192212',
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {title}
                    </h3>
                  </div>
                  <div className="service-reveal-line-mask">
                    <p
                      className={`service-pillar-desc service-reveal-step service-step-${descStep}`}
                      style={{ fontSize: '0.845rem', color: '#5b564c', lineHeight: 1.52, margin: 0 }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Bottom-left short olive accent bar */}
                <span
                  aria-hidden="true"
                  className="service-pillar-bar"
                  style={{
                    position: 'absolute',
                    left: '26px',
                    bottom: '28px',
                    width: '66px',
                    height: '1.5px',
                    backgroundColor: '#6f8150',
                    opacity: 0.65,
                    zIndex: 1,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          How It Works: 3 Steps
          ========================================================================= */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="how-section"
        style={{
          padding: '84px 24px 96px',
          background: 'linear-gradient(180deg, #f8f4ea 0%, #f6f2e5 55%, #f9f6ed 100%)',
          borderBottom: '1px solid #ece7de',
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* Soft blurred ambient leaf shadows */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '90px',
            left: '28px',
            width: '230px',
            transform: 'rotate(42deg)',
            opacity: 0.06,
            filter: 'blur(7px) brightness(0.25)',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20px',
            right: '60px',
            width: '210px',
            transform: 'rotate(-24deg) scaleX(-1)',
            opacity: 0.05,
            filter: 'blur(8px) brightness(0.25)',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />

        {/* Top-left deep olive inverted curve (mirrors Section 3 bottom-left seam seamlessly) */}
        <svg
          viewBox="0 0 428 168"
          preserveAspectRatio="none"
          className="how-corner-curves-svg how-top-curve-svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '29.7222%',
            height: 'clamp(48px, 11.67vw, 168px)',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <linearGradient id="howTopGreenGrad" x1="0%" y1="100%" x2="85%" y2="0%">
              <stop offset="0%" stopColor="#3b542a" />
              <stop offset="45%" stopColor="#2b431f" />
              <stop offset="100%" stopColor="#1e3316" />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 428 0 C 314 76, 134 138, 0 168 Z"
            fill="url(#howTopGreenGrad)"
          />
          <path
            d="M 0 0 L 234 0 C 166 48, 94 92, 0 124 Z"
            fill="#ffffff"
            opacity="0.06"
          />
        </svg>

        {/* Bottom-right soft warm cream hill */}
        <svg
          viewBox="0 0 700 126"
          preserveAspectRatio="none"
          className="how-corner-curves-svg how-bottom-cream-svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '48.6111%',
            height: 'clamp(50px, 8.75vw, 126px)',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <linearGradient id="howBottomCreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#efe8d6" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#e5dbc3" stopOpacity="0.52" />
            </linearGradient>
          </defs>
          <path
            d="M 0 126 C 210 24, 480 0, 700 26 L 700 126 Z"
            fill="url(#howBottomCreamGrad)"
          />
        </svg>

        {/* Bottom-left deep olive curve & accent line */}
        <svg
          viewBox="0 0 496 168"
          preserveAspectRatio="none"
          className="how-corner-curves-svg how-bottom-left-svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '34.4444%',
            height: 'clamp(56px, 11.67vw, 168px)',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <linearGradient id="howBottomGreenGrad" x1="0%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#354d26" />
              <stop offset="55%" stopColor="#263d1b" />
              <stop offset="100%" stopColor="#1b2d13" />
            </linearGradient>
          </defs>
          <path
            d="M 0 14 C 48 22, 92 38, 125 62 L 0 62 Z"
            fill="#e3d8c1"
            opacity="0.65"
          />
          <path
            d="M 0 12 C 142 0, 314 96, 496 168"
            fill="none"
            stroke="#738354"
            strokeWidth="1.25"
            opacity="0.65"
          />
          <path
            d="M 0 34 C 136 22, 294 112, 464 168 L 0 168 Z"
            fill="url(#howBottomGreenGrad)"
          />
        </svg>

        {/* Crisp corner foliage branches (/assets/leaf.png) */}
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="how-corner-branch how-corner-branch-tl"
          style={{
            position: 'absolute',
            top: '28px',
            left: '-40px',
            width: '215px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 12px 20px rgba(24, 34, 14, 0.2))',
          }}
        />
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="how-corner-branch how-corner-branch-tr"
          style={{
            position: 'absolute',
            top: '8px',
            right: '-42px',
            width: '230px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 12px 20px rgba(24, 34, 14, 0.22))',
          }}
        />
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="how-corner-branch how-corner-branch-br"
          style={{
            position: 'absolute',
            bottom: '-34px',
            right: '-24px',
            width: '245px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
            filter: 'brightness(0.88) contrast(1.12) saturate(0.86) drop-shadow(0 14px 22px rgba(24, 34, 14, 0.24))',
          }}
        />

        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Header Block: Chef Hat flanked by lines -> SERVICE OVERVIEW -> Headline -> Subtitle -> Short dash */}
          <div style={{ textAlign: 'center', marginBottom: '68px' }}>
            <div
              className="how-reveal-step how-step-0"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '18px',
                marginBottom: '10px',
              }}
            >
              <span
                aria-hidden="true"
                className="how-divider-line how-divider-line-left"
                style={{
                  width: '132px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #6f7d57)',
                }}
              />
              <ChefHat size={27} strokeWidth={1.6} color="#2d401e" />
              <span
                aria-hidden="true"
                className="how-divider-line how-divider-line-right"
                style={{
                  width: '132px',
                  height: '1px',
                  background: 'linear-gradient(90deg, #6f7d57, transparent)',
                }}
              />
            </div>

            <span
              className="how-eyebrow how-reveal-step how-step-1"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                letterSpacing: '3px',
                color: '#384923',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Service Overview
            </span>

            <h2
              className="how-heading how-reveal-step how-step-2"
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(1.95rem, 3.2vw, 2.6rem)',
                lineHeight: 1.22,
                color: '#182012',
                margin: '10px 0 12px',
                fontWeight: 500,
                textWrap: 'balance',
              }}
            >
              How our private chef{' '}
              <span style={{ fontStyle: 'italic', color: '#455c24', fontWeight: 500 }}>
                cooking service
              </span>{' '}
              works
            </h2>

            <p
              className="how-subtitle how-reveal-step how-step-3"
              style={{
                fontSize: '0.9375rem',
                color: '#5a554c',
                maxWidth: '540px',
                margin: '0 auto',
                lineHeight: 1.5,
                textWrap: 'pretty',
              }}
            >
              Three simple steps to fresh, chef-prepared meals for your family.
            </p>

            <span
              aria-hidden="true"
              className="how-reveal-step how-step-3"
              style={{
                display: 'block',
                width: '48px',
                height: '1.5px',
                backgroundColor: '#566838',
                opacity: 0.72,
                margin: '16px auto 0',
              }}
            />
          </div>

          {/* 3 Scalloped Step Cards + Connecting Arches */}
          <div style={{ position: 'relative' }}>
            {/* Dual curved arches connecting Badge 1 -> Badge 2 -> Badge 3 */}
            <svg
              viewBox="0 0 1120 72"
              preserveAspectRatio="none"
              className="how-steps-arches-svg"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-34px',
                left: 0,
                width: '100%',
                height: '72px',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'visible',
              }}
            >
              <path
                d="M 177 26 Q 368 -4 560 26"
                fill="none"
                stroke="#788858"
                strokeWidth="1.2"
                className="how-arch-path"
              />
              <path
                d="M 560 26 Q 752 -4 943 26"
                fill="none"
                stroke="#788858"
                strokeWidth="1.2"
                className="how-arch-path how-arch-2"
              />
            </svg>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '28px',
                position: 'relative',
                zIndex: 1,
              }}
              className="public-steps-grid"
            >
              {[
                {
                  num: '1',
                  title: 'Register your profile',
                  desc: 'Create your family account and let us know if anyone has food allergies or ingredient preferences.',
                  stepIdx: 4,
                  icon: <UserPlus size={29} strokeWidth={1.6} color="#2d401e" />,
                },
                {
                  num: '2',
                  title: 'Plan your menu',
                  desc: 'Browse our seasonal dishes and select up to 7 delicious meals for your upcoming meal preparation.',
                  stepIdx: 5,
                  icon: <Calendar size={28} strokeWidth={1.6} color="#2d401e" />,
                },
                {
                  num: '3',
                  title: 'Prepared fresh by Chef Missy',
                  desc: 'Chef Missy sources fresh ingredients and prepares your selected meals from scratch, thoughtfully portioned and packaged for your family.',
                  stepIdx: 6,
                  icon: (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2d401e"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M7.8 8v2.2a1.45 1.45 0 0 0 2.9 0V8" />
                      <path d="M9.25 8v8.5" />
                      <path d="M14.75 8v8.5" />
                      <path d="M14.75 8c1.25 0 1.75 1.2 1.75 2.7 0 1.1-.6 1.8-1.75 1.8" />
                    </svg>
                  ),
                },
              ].map(({ num, title, desc, stepIdx, icon }) => (
                <div
                  key={num}
                  className={`how-step-card how-reveal-step how-step-${stepIdx}`}
                  style={{
                    backgroundColor: '#fdfcf8',
                    borderRadius: '14px',
                    padding: '32px 26px 34px',
                    border: '1px solid rgba(208, 200, 180, 0.85)',
                    borderBottom: '2px solid rgba(68, 88, 34, 0.45)',
                    boxShadow: '0 10px 26px rgba(34, 42, 22, 0.08), 0 2px 6px rgba(34, 42, 22, 0.04)',
                    position: 'relative',
                    textAlign: 'center',
                  }}
                >
                  {/* Smooth scalloped curved top crown around step badge */}
                  <svg
                    viewBox="0 0 216 24"
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '-22px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '216px',
                      height: '24px',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    <path
                      d="M 0 23 C 46 23, 66 2, 108 2 C 150 2, 170 23, 216 23 L 216 25 L 0 25 Z"
                      fill="#fdfcf8"
                    />
                    <path
                      d="M 0 23 C 46 23, 66 2, 108 2 C 150 2, 170 23, 216 23"
                      fill="none"
                      stroke="rgba(208, 200, 180, 0.85)"
                      strokeWidth="1.2"
                    />
                  </svg>

                  {/* Circular solid olive step number badge straddling crown */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-26px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#2d411c',
                      color: '#ffffff',
                      fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(26, 38, 16, 0.22)',
                      zIndex: 3,
                    }}
                  >
                    {num}
                  </div>

                  {/* Soft warm cream circle icon pedestal */}
                  <div
                    className="how-pedestal"
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      backgroundColor: '#efe9d8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '4px auto 20px',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {icon}
                  </div>

                  <h4
                    className="how-step-title"
                    style={{
                      fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                      fontSize: '1.22rem',
                      color: '#192112',
                      margin: '0 0 10px',
                      fontWeight: 600,
                    }}
                  >
                    {title}
                  </h4>
                  <p className="how-step-desc" style={{ fontSize: '0.84rem', color: '#5b564c', lineHeight: 1.55, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ Section: Objection Handling
          ========================================================================= */}
      <section id="faq" className="faq-section" style={{ padding: '80px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #ece7de' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div className="faq-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="faq-eyebrow" style={{ fontSize: '0.75rem', letterSpacing: '1.5px', color: '#716c62', fontWeight: 600, textTransform: 'uppercase' }}>
              Clear Answers
            </span>
            <h2
              className="faq-heading"
              style={{
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: 'clamp(1.55rem, 3.2vw, 2.25rem)',
                color: '#2c3917',
                margin: '8px 0 12px',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              Frequently asked questions
            </h2>
            <p className="faq-subtitle" style={{ fontSize: '0.9375rem', color: '#5c564c', margin: 0, textWrap: 'pretty' }}>
              Details on food preparation, dietary safeguards, and scheduling.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="faq-item"
                  style={{
                    border: '1px solid #ece7de',
                    borderRadius: '8px',
                    backgroundColor: isOpen ? '#faf8f4' : '#ffffff',
                    transition: 'background-color 200ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                    className="faq-trigger"
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
                      fontFamily: 'inherit',
                    }}
                  >
                    <span className="faq-question-text" style={{ fontSize: '0.9375rem', color: '#1a1814', fontWeight: 600, lineHeight: 1.4 }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      color="#716c62"
                      className="faq-chevron"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  <div className={`faq-answer-collapse ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
                    <div style={{ overflow: 'hidden' }}>
                      <div className="faq-answer-inner" style={{ padding: '0 20px 20px', fontSize: '0.875rem', color: '#5c564c', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          Final Call to Action: Risk Reversal & Access
          ========================================================================= */}
      <section className="cta-section" style={{ padding: '80px 24px', backgroundColor: '#faf8f4', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            className="cta-heading"
            style={{
              fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)",
              fontSize: 'clamp(1.55rem, 3.2vw, 2.25rem)',
              color: '#2c3917',
              margin: '0 0 16px',
              fontWeight: 600,
              textWrap: 'balance',
            }}
          >
            Experience fresh, chef-prepared meals for your family
          </h2>
          <p className="cta-subtitle" style={{ fontSize: '1rem', color: '#5c564c', lineHeight: 1.6, margin: '0 0 32px', textWrap: 'pretty' }}>
            Create an account to browse the seasonal menu, select your favorite dishes, and choose your preferred date.
          </p>

          <div className="cta-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/home' : '/register'}
              className="cta-primary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              className="cta-secondary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
      <footer
        className="footer-section"
        style={{
          background: 'linear-gradient(165deg, #253615 0%, #1d2b10 60%, #17230d 100%)',
          borderTop: '2px solid rgba(197, 160, 89, 0.3)',
          color: '#dbe4cc',
          padding: '56px 24px 36px',
          fontFamily: "var(--font-family-sans, 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif)",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/leaf.png"
          alt=""
          aria-hidden="true"
          className="footer-ambient-leaf"
          style={{
            position: 'absolute',
            bottom: '-24px',
            right: '-34px',
            width: '215px',
            transform: 'rotate(-14deg) scaleX(-1)',
            opacity: 0.08,
            filter: 'brightness(0.35) contrast(1.1)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
        <div style={{ maxWidth: '1160px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            className="footer-top-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              paddingBottom: '36px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
            }}
          >
            {/* Column 1: Brand Crest & Title */}
            <div className="footer-col footer-brand-col">
              <button
                type="button"
                onClick={scrollToTop}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="footer-medallion"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    clipPath: 'circle(50%)',
                    backgroundColor: '#fcfaf4',
                    border: '1.5px solid rgba(197, 160, 89, 0.55)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/assets/logo-crest.png"
                    alt="Chef Missy Logo"
                    className="footer-medallion-img"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'contain',
                      display: 'block',
                      mixBlendMode: 'multiply',
                    }}
                  />
                </div>
                <div>
                  <h3
                    className="footer-brand-title"
                    style={{
                      fontFamily: "var(--font-heading, 'Cormorant Garamond', Georgia, serif)",
                      fontSize: '1.68rem',
                      lineHeight: 1.05,
                      letterSpacing: '0.015em',
                      color: '#faf6ec',
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    Chef Missy
                  </h3>
                  <span
                    className="footer-brand-subtitle"
                    style={{
                      display: 'block',
                      marginTop: '5px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#c9d4b8',
                      letterSpacing: '2.2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Private Chef Culinary Service
                  </span>
                </div>
              </button>
            </div>

            {/* Column 2: Section Navigation */}
            <nav
              aria-label="Footer Section Navigation"
              className="footer-col footer-nav-col"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '22px',
              }}
            >
              {navSections.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="footer-link"
                >
                  {label}
                </button>
              ))}
              <span
                className="footer-links-divider"
                aria-hidden="true"
                style={{
                  width: '1px',
                  height: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                }}
              />
            </nav>

            {/* Column 3: Account & Chef Portal */}
            <div
              className="footer-col footer-actions-col"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '22px',
              }}
            >
              <Link to="/login" className="footer-link">
                Sign In
              </Link>
              <Link to="/register" className="footer-link">
                Create Account
              </Link>
              <Link to="/admin/login" className="footer-portal-btn">
                <span>Chef Portal</span>
                <ArrowRight size={14} strokeWidth={2.1} />
              </Link>
            </div>
          </div>

          <div
            className="footer-bottom-row"
            style={{
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.8125rem',
              color: '#b5c2a3',
              letterSpacing: '0.01em',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Private Chef Missy. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>Fresh Ingredients</span>
              <span aria-hidden="true" style={{ color: '#c5a059' }}>&bull;</span>
              <span>Thoughtful Menus</span>
              <span aria-hidden="true" style={{ color: '#c5a059' }}>&bull;</span>
              <span>Prepared For You</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive & Stepper Reveal Styles */}
      <style>{`
        .service-olive-wash {
          opacity: 1;
          transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity;
        }
        .service-revealed .service-olive-wash {
          opacity: 0;
          transition-duration: 620ms;
          transition-delay: 80ms;
        }
        .service-corner-branch {
          opacity: 0;
          transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1), transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity, transform;
        }
        .service-corner-branch-tl { transform: translate3d(-24px, -16px, 0) rotate(18deg); }
        .service-corner-branch-tr { transform: translate3d(24px, -16px, 0) rotate(-14deg) scaleX(-1); }
        .service-corner-branch-br { transform: translate3d(24px, 24px, 0) rotate(18deg) scaleX(-1); }
        .service-revealed .service-corner-branch {
          opacity: 1;
          transition-duration: 680ms;
          transition-delay: 320ms;
        }
        .service-revealed .service-corner-branch-tl { transform: translate3d(0, 0, 0) rotate(18deg); }
        .service-revealed .service-corner-branch-tr { transform: translate3d(0, 0, 0) rotate(-14deg) scaleX(-1); }
        .service-revealed .service-corner-branch-br { transform: translate3d(0, 0, 0) rotate(18deg) scaleX(-1); }
        .service-divider-line {
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity, transform;
        }
        .service-divider-line-left { transform-origin: right center; }
        .service-divider-line-right { transform-origin: left center; }
        .service-revealed .service-divider-line {
          opacity: 1;
          transform: scaleX(1);
          transition-duration: 520ms;
          transition-delay: 980ms;
        }
        .service-reveal-line-mask {
          display: block;
          overflow: hidden;
          padding-bottom: 4px;
          margin-bottom: -4px;
        }
        .service-reveal-step {
          display: block;
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity, transform;
        }
        .service-reveal-card.service-reveal-step {
          transform: translate3d(0, 22px, 0);
        }
        .service-revealed .service-reveal-step {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition-duration: 540ms;
        }
        .service-revealed .service-reveal-card,
        .service-revealed .service-reveal-card:hover {
          transform: translate3d(0, 0, 0);
        }
        .service-revealed .service-step-0 { transition-delay: 950ms; }
        .service-revealed .service-step-1 { transition-delay: 1040ms; }
        .service-revealed .service-step-2 { transition-delay: 1130ms; }
        .service-revealed .service-step-3 { transition-delay: 1220ms; }
        .service-revealed .service-step-4 { transition-delay: 1310ms; }
        .service-revealed .service-step-5 { transition-delay: 1400ms; }
        .service-revealed .service-step-6 { transition-delay: 1480ms; }
        .service-revealed .service-step-7 { transition-delay: 1560ms; }
        .service-revealed .service-step-8 { transition-delay: 1640ms; }
        .service-revealed .service-step-9 { transition-delay: 1720ms; }
        .service-revealed .service-step-10 { transition-delay: 1800ms; }
        .service-revealed .service-step-11 { transition-delay: 1880ms; }
        .how-corner-branch {
          opacity: 0;
          transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1), transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity, transform;
        }
        .how-corner-branch-tl { transform: translate3d(-20px, -14px, 0) rotate(16deg) scaleY(-1); }
        .how-corner-branch-tr { transform: translate3d(20px, -14px, 0) rotate(-18deg) scaleX(-1) scaleY(-1); }
        .how-corner-branch-br { transform: translate3d(20px, 20px, 0) rotate(-6deg) scaleX(-1); }
        .steps-revealed .how-corner-branch {
          opacity: 1;
          transition-duration: 620ms;
          transition-delay: 60ms;
        }
        .steps-revealed .how-corner-branch-tl { transform: translate3d(0, 0, 0) rotate(16deg) scaleY(-1); }
        .steps-revealed .how-corner-branch-tr { transform: translate3d(0, 0, 0) rotate(-18deg) scaleX(-1) scaleY(-1); }
        .steps-revealed .how-corner-branch-br { transform: translate3d(0, 0, 0) rotate(-6deg) scaleX(-1); }
        .how-divider-line {
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
          will-change: opacity, transform;
        }
        .how-divider-line-left { transform-origin: right center; }
        .how-divider-line-right { transform-origin: left center; }
        .steps-revealed .how-divider-line {
          opacity: 1;
          transform: scaleX(1);
          transition-duration: 500ms;
          transition-delay: 80ms;
        }
        .how-arch-path {
          stroke-dasharray: 420;
          stroke-dashoffset: 420;
          opacity: 0;
          transition: stroke-dashoffset 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .steps-revealed .how-arch-path {
          stroke-dashoffset: 0;
          opacity: 0.78;
          transition-duration: 680ms;
          transition-delay: 260ms;
        }
        .steps-revealed .how-arch-path.how-arch-2 {
          transition-delay: 380ms;
        }
        .how-reveal-step {
          opacity: 0;
          transform: translate3d(0, 22px, 0);
          transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-delay: 0ms;
          will-change: opacity, transform;
        }
        .steps-revealed .how-reveal-step {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition-duration: 520ms;
        }
        .steps-revealed .how-step-card,
        .steps-revealed .how-step-card:hover {
          transform: translate3d(0, 0, 0);
        }
        .steps-revealed .how-step-0 { transition-delay: 40ms; }
        .steps-revealed .how-step-1 { transition-delay: 110ms; }
        .steps-revealed .how-step-2 { transition-delay: 180ms; }
        .steps-revealed .how-step-3 { transition-delay: 250ms; }
        .steps-revealed .how-step-4 { transition-delay: 320ms; }
        .steps-revealed .how-step-5 { transition-delay: 420ms; }
        .steps-revealed .how-step-6 { transition-delay: 520ms; }
        /* Mobile Overlay Dropdown: slides & unfolds cleanly from top without pushing Hero */
        .public-mobile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 20px;
          right: 20px;
          z-index: 95;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform-origin: top center;
          transform: translate3d(0, -14px, 0) scaleY(0.94);
          clip-path: inset(0 0 100% 0 round 16px);
          transition:
            transform 260ms cubic-bezier(0.23, 1, 0.32, 1),
            opacity 210ms cubic-bezier(0.23, 1, 0.32, 1),
            clip-path 260ms cubic-bezier(0.23, 1, 0.32, 1),
            visibility 0s linear 260ms;
          will-change: transform, opacity, clip-path;
        }
        .public-mobile-dropdown.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translate3d(0, 0, 0) scaleY(1);
          clip-path: inset(0 0 0 0 round 16px);
          transition:
            transform 260ms cubic-bezier(0.23, 1, 0.32, 1),
            opacity 210ms cubic-bezier(0.23, 1, 0.32, 1),
            clip-path 260ms cubic-bezier(0.23, 1, 0.32, 1),
            visibility 0s linear 0s;
        }
        /* FAQ Smooth Click-to-Reveal Accordion */
        .faq-answer-collapse {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition:
            grid-template-rows 250ms cubic-bezier(0.23, 1, 0.32, 1),
            opacity 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .faq-answer-collapse.is-open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .service-olive-wash {
            opacity: 0 !important;
            transition: none !important;
          }
          .public-mobile-dropdown,
          .faq-answer-collapse,
          .faq-chevron {
            transition: none !important;
          }
          .service-corner-branch,
          .service-divider-line,
          .service-reveal-step,
          .how-corner-branch,
          .how-divider-line,
          .how-reveal-step,
          .how-arch-path {
            opacity: 1 !important;
            transition: none !important;
          }
          .service-divider-line,
          .service-reveal-step,
          .how-divider-line,
          .how-reveal-step {
            transform: none !important;
          }
          .how-arch-path {
            stroke-dashoffset: 0 !important;
          }
        }
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
          .hero-kicker-line {
            display: none !important;
          }
          .footer-brand-col {
            margin-right: auto;
          }
          .public-mobile-dropdown {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          .public-desktop-nav,
          .public-nav-divider,
          .public-desktop-actions {
            display: none !important;
          }
          .public-mobile-button {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
          }
          .navbar-brand-logo-wrap {
            width: 36px !important;
            height: 36px !important;
          }
          .navbar-brand-logo-img {
            width: 30px !important;
            height: 30px !important;
          }
          .navbar-brand-title {
            font-size: 0.92rem !important;
          }
          .navbar-brand-subtitle {
            font-size: 0.45rem !important;
            letter-spacing: 1px !important;
          }
          .hero-green-curve-container {
            display: none !important;
          }
          .hero-green-curve-mobile {
            display: block !important;
            height: 44% !important;
          }
          .hero-container {
            padding: 26px 22px 28px !important;
          }
          .hero-main-layout {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: left !important;
            gap: 28px !important;
          }
          .hero-left-column {
            width: 100% !important;
            max-width: 560px !important;
            align-items: flex-start !important;
            text-align: left !important;
          }
          .hero-body-copy {
            max-width: 100% !important;
            margin-bottom: 24px !important;
          }
          .hero-left-proof-row {
            width: 100% !important;
            max-width: 100% !important;
            justify-content: space-between !important;
            gap: 10px !important;
          }
          .hero-proof-item {
            flex: 1 1 0 !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 6px !important;
          }
          .hero-proof-divider {
            height: 38px !important;
            flex-shrink: 0 !important;
          }
          .hero-rotating-plate {
            width: 330px !important;
            height: 330px !important;
          }
          .hero-leaf-top-right {
            width: 230px !important;
            top: -30px !important;
            right: -24px !important;
          }
          .hero-leaf-bottom-right {
            width: 225px !important;
            bottom: 112px !important;
            right: -36px !important;
            z-index: 2 !important;
          }
          .hero-leaf-left {
            width: 190px !important;
            bottom: 120px !important;
            left: -62px !important;
            opacity: 0.36 !important;
          }
          .hero-bottom-ribbon {
            padding: 18px 16px !important;
          }
          .hero-bottom-ribbon-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .hero-ribbon-item {
            flex-direction: column !important;
            text-align: center !important;
            gap: 6px !important;
            padding: 0 6px !important;
          }
          /* Section 2 follows Hero mobile layout */
          .tagline-section {
            padding: 68px 22px !important;
          }
          .tagline-section-layout {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 32px !important;
            min-height: auto !important;
          }
          .tagline-text-col {
            width: 100% !important;
            max-width: 560px !important;
            text-align: left !important;
          }
          .plate-landing-target {
            min-height: 330px !important;
            width: 100% !important;
          }
          .tagline-ovals-svg {
            width: 108% !important;
            max-width: 440px !important;
          }
          /* Section 3 & Section 4 vertical cards on smaller/medium/mobile screens */
          .service-section {
            padding: 92px 20px 80px !important;
          }
          .service-top-curve-svg {
            width: clamp(140px, 24vw, 230px) !important;
            height: clamp(58px, 10vw, 92px) !important;
          }
          .service-bottom-curve-svg,
          .how-top-curve-svg {
            width: clamp(150px, 28vw, 250px) !important;
            height: clamp(54px, 10vw, 88px) !important;
          }
          .public-pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            max-width: 520px !important;
            margin: 0 auto !important;
          }
          .service-pillar-card {
            padding: 24px 22px 96px !important;
          }
          .service-pillar-photo {
            width: 68% !important;
            max-width: 265px !important;
          }
          .how-section {
            padding: 90px 20px 84px !important;
          }
          .public-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 46px !important;
            max-width: 520px !important;
            margin: 0 auto !important;
          }
          .how-steps-arches-svg {
            display: none !important;
          }
          .faq-section {
            padding: 64px 20px !important;
          }
          .faq-header {
            margin-bottom: 36px !important;
          }
          .cta-section {
            padding: 64px 20px !important;
          }
          /* Footer stacks 3 columns cleanly into 3 rows */
          .footer-section {
            padding: 46px 20px 30px !important;
          }
          .footer-top-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
            padding-bottom: 28px !important;
          }
          .footer-links-divider {
            display: none !important;
          }
          .footer-brand-title {
            font-size: 1.44rem !important;
          }
          .footer-brand-subtitle {
            font-size: 0.625rem !important;
            letter-spacing: 1.9px !important;
          }
          .footer-link {
            font-size: 0.82rem !important;
          }
          .footer-portal-btn {
            font-size: 0.78rem !important;
            padding: 7px 14px !important;
          }
          .footer-bottom-row {
            font-size: 0.76rem !important;
          }
        }
        @media (max-width: 768px) {
          .hero-section {
            padding-top: 68px !important;
          }
          .hero-container {
            padding: 18px 18px 22px !important;
          }
          .hero-kicker-text {
            font-size: 0.68rem !important;
            letter-spacing: 2px !important;
          }
          .hero-main-heading {
            font-size: clamp(1.92rem, 8.2vw, 2.5rem) !important;
            margin-bottom: 14px !important;
          }
          .hero-body-copy {
            font-size: 0.86rem !important;
            line-height: 1.56 !important;
            margin-bottom: 20px !important;
          }
          .hero-left-proof-row {
            padding-top: 16px !important;
            gap: 6px !important;
          }
          .hero-proof-icon {
            width: 28px !important;
            height: 28px !important;
          }
          .hero-proof-title {
            font-size: clamp(0.66rem, 2.7vw, 0.78rem) !important;
            white-space: nowrap !important;
          }
          .hero-proof-sub {
            font-size: 0.61rem !important;
            line-height: 1.25 !important;
          }
          .hero-sprig-behind {
            width: 118px !important;
            top: -10px !important;
            left: -18px !important;
          }
          .hero-rotating-plate {
            width: clamp(248px, 70vw, 310px) !important;
            height: clamp(248px, 70vw, 310px) !important;
          }
          .hero-green-curve-mobile {
            height: 39% !important;
          }
          .hero-ribbon-title {
            font-size: 0.78rem !important;
          }
          .hero-ribbon-sub {
            font-size: 0.66rem !important;
          }
          .hero-ribbon-icon {
            width: 22px !important;
            height: 22px !important;
          }
          .tagline-section {
            padding: 56px 18px !important;
          }
          .tagline-kicker {
            font-size: 0.68rem !important;
            margin-bottom: 14px !important;
          }
          .public-tagline-text {
            font-size: clamp(1.48rem, 5.5vw, 1.9rem) !important;
          }
          .tagline-caption {
            font-size: 0.82rem !important;
          }
          .plate-landing-target {
            min-height: clamp(256px, 72vw, 318px) !important;
          }
          .tagline-ovals-svg {
            width: 116% !important;
            max-width: 390px !important;
          }
          .service-section {
            padding: 74px 16px 72px !important;
          }
          .service-top-curve-svg {
            width: clamp(112px, 29vw, 175px) !important;
            height: clamp(50px, 12vw, 76px) !important;
          }
          .service-bottom-curve-svg,
          .how-top-curve-svg {
            width: clamp(132px, 34vw, 195px) !important;
            height: clamp(48px, 11.67vw, 68px) !important;
          }
          .service-eyebrow {
            font-size: 0.68rem !important;
            letter-spacing: 1.5px !important;
          }
          .service-heading {
            font-size: clamp(1.38rem, 5vw, 1.95rem) !important;
          }
          .service-subtitle {
            font-size: 0.86rem !important;
          }
          .service-pillar-card {
            padding: 22px 20px 88px !important;
          }
          .service-pillar-icon {
            width: 40px !important;
            height: 40px !important;
            margin-bottom: 14px !important;
          }
          .service-pillar-title {
            font-size: 1.12rem !important;
          }
          .service-pillar-desc {
            font-size: 0.815rem !important;
          }
          .service-pillar-bar {
            left: 20px !important;
            bottom: 22px !important;
            width: 54px !important;
          }
          .service-pillar-photo {
            width: 66% !important;
            max-width: 235px !important;
          }
          .service-corner-branch {
            width: 98px !important;
          }
          .service-corner-branch-tl {
            top: -12px !important;
            left: -24px !important;
          }
          .service-corner-branch-tr {
            top: -16px !important;
            right: -20px !important;
          }
          .service-corner-branch-br {
            bottom: 4px !important;
            right: -24px !important;
          }
          .service-divider-line {
            width: 40px !important;
          }
          .service-corner-curves-svg {
            opacity: 0.9;
          }
          .how-section {
            padding: 76px 16px 76px !important;
          }
          .how-eyebrow {
            font-size: 0.68rem !important;
            letter-spacing: 2.2px !important;
          }
          .how-heading {
            font-size: clamp(1.42rem, 5vw, 1.95rem) !important;
          }
          .how-subtitle {
            font-size: 0.86rem !important;
          }
          .how-step-card {
            padding: 28px 20px 28px !important;
          }
          .how-pedestal {
            width: 64px !important;
            height: 64px !important;
            margin-bottom: 16px !important;
          }
          .how-step-title {
            font-size: 1.12rem !important;
          }
          .how-step-desc {
            font-size: 0.815rem !important;
          }
          .how-corner-branch {
            width: 98px !important;
          }
          .how-corner-branch-tl {
            top: 12px !important;
            left: -24px !important;
          }
          .how-corner-branch-tr {
            top: 4px !important;
            right: -24px !important;
          }
          .how-divider-line {
            width: 48px !important;
          }
          .faq-section {
            padding: 50px 16px !important;
          }
          .faq-header {
            margin-bottom: 30px !important;
          }
          .faq-eyebrow {
            font-size: 0.68rem !important;
          }
          .faq-heading {
            font-size: clamp(1.45rem, 5.2vw, 1.85rem) !important;
          }
          .faq-subtitle {
            font-size: 0.84rem !important;
          }
          .faq-trigger {
            padding: 15px 16px !important;
            gap: 12px !important;
          }
          .faq-question-text {
            font-size: 0.875rem !important;
          }
          .faq-answer-inner {
            padding: 0 16px 16px !important;
            font-size: 0.82rem !important;
            line-height: 1.55 !important;
          }
          .cta-section {
            padding: 48px 16px !important;
          }
          .cta-heading {
            font-size: clamp(1.45rem, 5.2vw, 1.9rem) !important;
          }
          .cta-subtitle {
            font-size: 0.875rem !important;
            margin-bottom: 24px !important;
          }
          .cta-primary-btn,
          .cta-secondary-btn {
            font-size: 0.825rem !important;
            padding: 10px 18px !important;
          }
          .footer-section {
            padding: 40px 16px 28px !important;
          }
          .footer-ambient-leaf {
            width: 160px !important;
          }
          .footer-medallion {
            width: 46px !important;
            height: 46px !important;
          }
          .footer-medallion-img {
            width: 40px !important;
            height: 40px !important;
          }
          .footer-brand-title {
            font-size: 1.28rem !important;
          }
          .footer-brand-subtitle {
            font-size: 0.58rem !important;
            letter-spacing: 1.6px !important;
          }
          .footer-nav-col,
          .footer-actions-col {
            gap: 14px 18px !important;
          }
          .footer-link {
            font-size: 0.78rem !important;
          }
          .footer-portal-btn {
            font-size: 0.74rem !important;
            padding: 6px 13px !important;
          }
          .footer-bottom-row {
            padding-top: 18px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 520px) {
          .public-navbar-wrapper {
            padding: 0 12px !important;
          }
          .public-navbar-header {
            padding: 3px 10px !important;
            min-height: 44px !important;
          }
          .public-mobile-dropdown {
            left: 12px !important;
            right: 12px !important;
          }
          .navbar-brand-title {
            font-size: 0.86rem !important;
          }
          .navbar-brand-subtitle {
            font-size: 0.42rem !important;
            letter-spacing: 0.85px !important;
          }
          .hero-rotating-plate {
            width: clamp(232px, 68vw, 275px) !important;
            height: clamp(232px, 68vw, 275px) !important;
          }
          .plate-landing-target {
            min-height: clamp(240px, 70vw, 285px) !important;
          }
          .hero-leaf-top-right {
            width: 180px !important;
            top: -24px !important;
            right: -24px !important;
          }
          .hero-leaf-bottom-right {
            width: 175px !important;
            bottom: 100px !important;
            right: -34px !important;
          }
          .hero-bottom-ribbon {
            padding: 14px 8px !important;
          }
          .hero-ribbon-title {
            font-size: 0.72rem !important;
          }
          .hero-ribbon-sub {
            font-size: 0.6rem !important;
          }
          .service-section {
            padding: 68px 16px 68px !important;
          }
          .how-section {
            padding: 70px 16px 72px !important;
          }
          .service-top-curve-svg {
            width: 108px !important;
            height: 48px !important;
          }
          .service-bottom-curve-svg,
          .how-top-curve-svg {
            width: 128px !important;
            height: 46px !important;
          }
          .service-corner-branch,
          .how-corner-branch {
            width: 84px !important;
          }
          .service-divider-line,
          .how-divider-line {
            width: 28px !important;
          }
          .service-sprig-line {
            width: 52px !important;
          }
          .cta-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          .cta-primary-btn,
          .cta-secondary-btn {
            width: 100% !important;
            max-width: 280px !important;
          }
        }
        .footer-link {
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          cursor: pointer;
          color: #eef3e6;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: color 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .footer-link:hover {
          color: #e0be78;
        }
        .footer-portal-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 9999px;
          border: 1px solid rgba(197, 160, 89, 0.5);
          background-color: rgba(197, 160, 89, 0.1);
          color: #e4c37e;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: background-color 180ms cubic-bezier(0.23, 1, 0.32, 1), border-color 180ms cubic-bezier(0.23, 1, 0.32, 1), color 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        .footer-portal-btn:hover {
          background-color: rgba(197, 160, 89, 0.2);
          border-color: rgba(228, 195, 126, 0.78);
          color: #f4dca6;
        }
      `}</style>
    </div>
  );
}
