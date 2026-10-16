/**
* Vivek Dahal — portfolio
*/
(function() {
  "use strict";

  const select = (el, all = false) =>
    all ? [...document.querySelectorAll(el.trim())] : document.querySelector(el.trim());

  const on = (type, el, listener, all = false) => {
    const target = select(el, all);
    if (!target) return;
    if (all) target.forEach(e => e.addEventListener(type, listener));
    else target.addEventListener(type, listener);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Scroll reveal — staggered within [data-reveal-group]
   */
  const revealEls = select('[data-reveal]', true);
  if (revealEls.length) {
    select('[data-reveal-group]', true).forEach(group => {
      [...group.children].forEach((child, i) => {
        child.querySelectorAll('[data-reveal]').forEach(el => {
          el.style.setProperty('--d', (i * 90) + 'ms');
        });
      });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /**
   * Scroll progress bar
   */
  const progress = select('.scroll-progress span');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max) * 100 + '%' : '0%';
  };

  /**
   * Header state + back-to-top + active nav link
   */
  const header = select('#header');
  const backToTop = select('.back-to-top');
  const navLinks = select('#navbar .nav-link', true);
  const sections = select('section[id]', true);

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('header-scrolled', y > 80);
    if (backToTop) backToTop.classList.toggle('active', y > 320);
    updateProgress();

    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', onScroll);

  /**
   * Smooth scroll with header offset
   */
  const scrollto = (hash) => {
    const el = select(hash);
    if (!el) return;
    const offset = (header ? header.offsetHeight : 0) - 1;
    window.scrollTo({
      top: el.offsetTop - offset,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  };

  on('click', '.scrollto', function(e) {
    const hash = this.hash;
    if (!hash || !select(hash)) return;
    e.preventDefault();

    const navbar = select('#navbar');
    if (navbar && navbar.classList.contains('navbar-mobile')) closeMobileNav();
    scrollto(hash);
  }, true);

  window.addEventListener('load', () => {
    if (window.location.hash && select(window.location.hash)) {
      setTimeout(() => scrollto(window.location.hash), 80);
    }
  });

  /**
   * Mobile navigation
   */
  const toggleBtn = select('.mobile-nav-toggle');

  function closeMobileNav() {
    const navbar = select('#navbar');
    if (!navbar) return;
    navbar.classList.remove('navbar-mobile');
    if (header) header.classList.remove('mobile-nav-open');
    if (toggleBtn) {
      toggleBtn.classList.add('bi-list');
      toggleBtn.classList.remove('bi-x');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  on('click', '.mobile-nav-toggle', function() {
    const navbar = select('#navbar');
    const opened = navbar.classList.toggle('navbar-mobile');
    if (header) header.classList.toggle('mobile-nav-open', opened);
    this.classList.toggle('bi-list', !opened);
    this.classList.toggle('bi-x', opened);
    this.setAttribute('aria-expanded', String(opened));
    document.body.style.overflow = opened ? 'hidden' : '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const navbar = select('#navbar');
    if (navbar && navbar.classList.contains('navbar-mobile')) closeMobileNav();
  });

  /**
   * Contact form -> Formspree (AJAX, no page reload)
   */
  const contactForm = select('.php-email-form');
  if (contactForm) {
    const loadingEl = contactForm.querySelector('.loading');
    const errorEl = contactForm.querySelector('.error-message');
    const sentEl = contactForm.querySelector('.sent-message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const show = (el, msg) => {
      if (!el) return;
      if (msg) el.textContent = msg;
      el.classList.add('d-block');
    };
    const hideAll = () => [loadingEl, errorEl, sentEl]
      .forEach(el => el && el.classList.remove('d-block'));

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      hideAll();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const action = contactForm.getAttribute('action') || '';
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        show(errorEl, 'This form is not connected yet. Please email vivekdahal2017@gmail.com or use the WhatsApp button.');
        return;
      }

      const subjectField = contactForm.querySelector('#subject');
      const subjectHidden = contactForm.querySelector('input[name="_subject"]');
      if (subjectField && subjectHidden && subjectField.value.trim()) {
        subjectHidden.value = `Portfolio enquiry: ${subjectField.value.trim()}`;
      }

      show(loadingEl);
      if (submitBtn) submitBtn.disabled = true;

      fetch(action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(r => r.json().catch(() => ({})).then(data => ({ ok: r.ok, data })))
        .then(({ ok, data }) => {
          hideAll();
          if (ok) {
            show(sentEl);
            contactForm.reset();
          } else {
            const detail = data && data.errors && data.errors.length
              ? data.errors.map(err => err.message).join(', ')
              : 'Something went wrong. Please email vivekdahal2017@gmail.com or use WhatsApp.';
            show(errorEl, detail);
          }
        })
        .catch(() => {
          hideAll();
          show(errorEl, 'Could not reach the server. Please check your connection, or use the WhatsApp button.');
        })
        .finally(() => { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  /**
   * Dynamic age from birth date
   */
  window.addEventListener('load', () => {
    const ageEl = document.getElementById('age');
    if (!ageEl) return;
    const birth = new Date('2001-03-26T00:00:00Z');
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const m = today.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
    ageEl.textContent = String(age);
  });

})();
