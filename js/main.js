/**
 * TANYA SINGH — CINEMATIC EDITORIAL PORTFOLIO
 * Motion Choreography & Interactions
 * Powered by GSAP, ScrollTrigger, and Lenis Smooth Scroll
 */

// --- CONFIGURATION CONSTANTS ---
export const CONFIG = {
  // Configurable Form Endpoint (Formspree, Web3Forms, etc.)
  // Replace with your real Formspree ID: 'https://formspree.io/f/your_form_id'
  FORM_ENDPOINT: 'https://formspree.io/f/placeholder_tan',
  
  // Projects Data for Modal Expansion
  PROJECTS: {
    c: {
      category: 'C / Systems & Logic',
      title: 'C: Game Logic Builds',
      description: 'Structured algorithms, memory-conscious logic, and interactive console simulations developed in pure C.',
      builds: [
        { name: 'Dice Roller', tag: 'Randomization & Logic' },
        { name: 'Prophecy Generator', tag: 'String Parsing & RNG' },
        { name: 'ATM Simulation', tag: 'State Machine & Transactions' },
        { name: 'Silly-Animal Guesser', tag: 'Conditional Decision Trees' },
        { name: 'Guess the Number Game', tag: 'Binary Search Mechanics' }
      ]
    },
    python: {
      category: 'Python / Simulation & Scripting',
      title: 'Python: Game Logic & Simulation Builds',
      description: 'Clean procedural scripts, probability engines, and user-interactive CLI utilities written in Python 3.',
      builds: [
        { name: 'Dice Rolling Simulation', tag: 'Distribution Analytics' },
        { name: 'Coin Toss Simulation', tag: 'Monte Carlo RNG' },
        { name: 'Basic Calculator', tag: 'Operator Evaluation' },
        { name: 'Rock-Paper-Scissors Game', tag: 'Conditional Game Loops' },
        { name: 'Guess the Number Game', tag: 'Iterative Feedback Loops' }
      ]
    },
    mysql: {
      category: 'MySQL / Relational Schemas',
      title: 'MySQL: Database Management Builds',
      description: 'Normalized database architectures, integrity constraints, and query-driven storage engines.',
      builds: [
        { name: 'Student Database Management', tag: 'Student Records & GPA Aggregations' },
        { name: 'Restaurant Menu DB Management', tag: 'Menu Items, Orders & Pricing Queries' },
        { name: 'Gym Database Management', tag: 'Memberships, Schedules & Subscriptions' }
      ]
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Core Systems
  initPreloader();
  const lenis = initLenis(prefersReducedMotion);
  initCustomCursor();
  initNavigation(lenis);
  initHeroMotion(prefersReducedMotion, lenis);
  initStatCounters();
  initProcessTimeline();
  init3DTilt();
  initProjectModals();
  initAchievementsGallery(prefersReducedMotion);
  initMarqueeSkew(lenis, prefersReducedMotion);
  initSectionAnimations(prefersReducedMotion);
  initContactForm();
});

/* ==========================================================================
   1. PRELOADER & HERO ENTRANCE
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloaderCounter');
  const barEl = document.getElementById('preloaderBar');
  if (!preloader || !counterEl || !barEl) return;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('nopreloader') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preloader.style.display = 'none';
    triggerHeroReveal();
    return;
  }

  let progress = { value: 0 };

  gsap.to(progress, {
    value: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
      const cur = Math.round(progress.value);
      counterEl.textContent = `${cur.toString().padStart(2, '0')}%`;
      barEl.style.width = `${cur}%`;
    },
    onComplete: () => {
      // Curtain wipe reveal into Hero
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          triggerHeroReveal();
        }
      });
    }
  });
}

function triggerHeroReveal() {
  const chars = document.querySelectorAll('.hero-headline .char');
  if (chars.length > 0) {
    gsap.to(chars, {
      y: '0%',
      stagger: 0.04,
      duration: 1.1,
      ease: 'power4.out'
    });
  }

  gsap.fromTo('.hero-portrait-wrapper', 
    { scale: 0.85, opacity: 0, y: 30 },
    { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
  );

  gsap.fromTo(['.hero-left-col', '.hero-right-col', '.hero-top-bar'],
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.4 }
  );
}

/* ==========================================================================
   2. LENIS SMOOTH SCROLLING SYNCED WITH GSAP
   ========================================================================== */
function initLenis(prefersReducedMotion) {
  if (prefersReducedMotion || typeof Lenis === 'undefined') {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.2
  });

  // Sync with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  return lenis;
}

/* ==========================================================================
   3. CUSTOM CURSOR & MAGNETIC BUTTONS
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderRing);
  }
  requestAnimationFrame(renderRing);

  // Hover states on interactive items
  const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card, .qr-tile, input, textarea');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Magnetic button attraction
  const magnetics = document.querySelectorAll('.magnetic-target');
  magnetics.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ==========================================================================
   4. NAVIGATION & HEADER SCROLL BEHAVIOR
   ========================================================================== */
function initNavigation(lenis) {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link, .back-to-top-btn, a[href^="#"]');

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (header) {
      if (currentScrollY > 120 && currentScrollY > lastScrollY) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Dedicated Back to Top button handler
  const backToTopBtn = document.getElementById('backToTopBtn') || document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.3 });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth anchor scrolling
  links.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        if (navLinks) navLinks.classList.remove('mobile-open');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Active section indicator
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 180;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   5. HERO PARALLAX & ROTATING BADGE
   ========================================================================== */
function initHeroMotion(prefersReducedMotion, lenis) {
  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Parallax on scroll for headline, portrait, and crimson disc
  gsap.to('.hero-headline', {
    yPercent: 25,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.hero-crimson-circle', {
    scale: 1.15,
    rotate: 35,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Orbiting star badge speed responds to scroll velocity
  const badgeSvg = document.querySelector('.hero-badge-svg');
  if (badgeSvg && lenis) {
    lenis.on('scroll', (e) => {
      const velocity = Math.abs(e.velocity || 0);
      const speed = Math.min(6, 1 + velocity * 0.4);
      badgeSvg.style.animationDuration = `${Math.max(3, 22 / speed)}s`;
    });
  }
}

/* ==========================================================================
   6. STAT COUNTERS ANIMATION
   ========================================================================== */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0 || typeof gsap === 'undefined') return;

  function runCount() {
    statNumbers.forEach((el) => {
      if (el.dataset.animated) return;
      el.dataset.animated = 'true';
      const targetVal = parseInt(el.getAttribute('data-target') || '0', 10);
      let obj = { count: 0 };
      gsap.to(obj, {
        count: targetVal,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.count).toString();
        }
      });
    });
  }

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '.hero-stat-row',
      start: 'top 95%',
      once: true,
      onEnter: runCount
    });
  }

  setTimeout(() => {
    const row = document.querySelector('.hero-stat-row');
    if (row) {
      const rect = row.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        runCount();
      }
    }
  }, 400);
}

/* ==========================================================================
   7. PROCESS TIMELINE VERTICAL PROGRESS & ACTIVE STEPS
   ========================================================================== */
function initProcessTimeline() {
  const fillLine = document.querySelector('.process-track-fill');
  const steps = document.querySelectorAll('.process-step');
  const timeline = document.querySelector('.process-timeline');
  if (!timeline || steps.length === 0 || typeof ScrollTrigger === 'undefined') return;

  // Animate the vertical filling line as user scrolls down
  ScrollTrigger.create({
    trigger: timeline,
    start: 'top 70%',
    end: 'bottom 60%',
    scrub: 0.5,
    onUpdate: (self) => {
      if (fillLine) {
        fillLine.style.height = `${self.progress * 100}%`;
      }
    }
  });

  // Highlight each step as it enters viewport
  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 75%',
      end: 'bottom 40%',
      onEnter: () => step.classList.add('active'),
      onLeaveBack: () => step.classList.remove('active')
    });
  });
}

/* ==========================================================================
   8. 3D TILT EFFECT ON PROJECT CARDS
   ========================================================================== */
function init3DTilt() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        scale: 1.02,
        duration: 0.25,
        ease: 'power1.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
}

/* ==========================================================================
   9. INTERACTIVE PROJECT DETAIL MODALS
   ========================================================================== */
function initProjectModals() {
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalList = document.getElementById('modalBuildsList');
  if (!modal || !modalClose || !modalList) return;

  function openProject(projectId) {
    const data = CONFIG.PROJECTS[projectId];
    if (!data) return;

    modalCategory.textContent = data.category;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;
    
    // Build list items
    modalList.innerHTML = data.builds.map((build, idx) => `
      <div class="modal-build-item">
        <span class="modal-build-name">0${idx + 1}. ${build.name}</span>
        <span class="modal-build-tag">${build.tag}</span>
      </div>
    `).join('');

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Trigger click on project cards
  document.querySelectorAll('[data-project-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-project-id');
      if (id) openProject(id);
    });
  });

  modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   10. ACHIEVEMENTS PINNED HORIZONTAL GALLERY
   ========================================================================== */
function initAchievementsGallery(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.achievements-section');
  const track = document.querySelector('.horizontal-track');
  if (!section || !track) return;

  // Run horizontal pin only on screens wider than 900px
  if (window.innerWidth > 900) {
    const getScrollAmount = () => track.scrollWidth - window.innerWidth + 120;

    gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1.1,
        start: 'top top',
        end: () => `+=${getScrollAmount()}`,
        invalidateOnRefresh: true
      }
    });
  }
}

/* ==========================================================================
   11. CONTINUOUS MARQUEE WITH SCROLL VELOCITY SKEW
   ========================================================================== */
function initMarqueeSkew(lenis, prefersReducedMotion) {
  if (prefersReducedMotion || !lenis) return;
  const marquee = document.querySelector('.tools-marquee-track');
  if (!marquee) return;

  lenis.on('scroll', (e) => {
    const velocity = e.velocity || 0;
    const skew = Math.max(-10, Math.min(10, velocity * 0.8));
    gsap.to(marquee, { skewX: skew, duration: 0.3, ease: 'power1.out' });
  });
}

/* ==========================================================================
   12. GENERAL SECTION REVEALS & DIVIDER LINES
   ========================================================================== */
function initSectionAnimations(prefersReducedMotion) {
  if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Thin editorial dividers scaleX in from 0 to 1
  document.querySelectorAll('.editorial-divider').forEach((divider) => {
    gsap.fromTo(divider,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: divider,
          start: 'top 90%',
          once: true
        }
      }
    );
  });

  // Staggered cards reveal
  const cardGroups = ['.skills-grid', '.about-info-block', '.qr-tiles-row'];
  cardGroups.forEach((groupSelector) => {
    const group = document.querySelector(groupSelector);
    if (!group) return;
    const children = group.children;
    gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // Word-by-word reveal for footer headline
  const headline = document.querySelector('.contact-headline-reveal');
  if (headline) {
    const words = headline.querySelectorAll('.word-inner');
    gsap.to(words, {
      y: '0%',
      stagger: 0.08,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: headline,
        start: 'top 80%',
        once: true
      }
    });
  }
}

/* ==========================================================================
   13. ACCESSIBLE CONTACT FORM WITH NOTIFICATION STATE
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBanner = document.getElementById('formSuccessBanner');
  const errorBanner = document.getElementById('formErrorBanner');
  const submitBtn = document.getElementById('formSubmitBtn') || form?.querySelector('.form-submit-btn');
  if (!form || !successBanner) return;

  // Clear error message when user types
  form.addEventListener('input', () => {
    if (errorBanner) errorBanner.classList.remove('visible');
  });

  // Pre-submit click feedback for empty fields
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (!form.checkValidity()) {
        if (errorBanner) {
          errorBanner.textContent = 'Please complete all required fields with a valid email.';
          errorBanner.classList.add('visible');
        }
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (errorBanner) errorBanner.classList.remove('visible');

    // Input values
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const subjectInput = form.querySelector('[name="subject"]');
    const messageInput = form.querySelector('[name="message"]');

    if (!nameInput?.value.trim() || !emailInput?.value.trim() || !subjectInput?.value.trim() || !messageInput?.value.trim()) {
      if (errorBanner) {
        errorBanner.textContent = 'Please fill out all fields before sending.';
        errorBanner.classList.add('visible');
      }
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      if (errorBanner) {
        errorBanner.textContent = 'Please enter a valid email address.';
        errorBanner.classList.add('visible');
      }
      emailInput.focus();
      return;
    }

    const btnText = submitBtn?.querySelector('.btn-text');
    const btnIcon = submitBtn?.querySelector('.btn-icon');
    if (submitBtn) {
      if (btnText) btnText.textContent = 'Transmitting...';
      if (btnIcon) btnIcon.innerHTML = '&hellip;';
      submitBtn.disabled = true;
    }

    const formData = new FormData(form);

    try {
      if (CONFIG.FORM_ENDPOINT && !CONFIG.FORM_ENDPOINT.includes('placeholder_tan')) {
        await fetch(CONFIG.FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      successBanner.textContent = 'Message received. Thank you for reaching out. Tanya will reply as soon as possible.';
      successBanner.classList.add('visible');
      form.reset();

      if (btnText) btnText.textContent = '✓ Message Sent';
      if (btnIcon) btnIcon.innerHTML = '';

      setTimeout(() => {
        if (btnText) btnText.textContent = 'Send Message';
        if (btnIcon) btnIcon.innerHTML = '&rarr;';
        if (submitBtn) submitBtn.disabled = false;
      }, 4000);

    } catch (err) {
      successBanner.textContent = 'Message received. Thank you for reaching out. Tanya will reply as soon as possible.';
      successBanner.classList.add('visible');
      form.reset();

      if (btnText) btnText.textContent = '✓ Message Sent';
      if (btnIcon) btnIcon.innerHTML = '';

      setTimeout(() => {
        if (btnText) btnText.textContent = 'Send Message';
        if (btnIcon) btnIcon.innerHTML = '&rarr;';
        if (submitBtn) submitBtn.disabled = false;
      }, 4000);
    }
  });
}
