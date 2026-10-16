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
   * Hero background: animated node network with travelling packets.
   * Pauses when the hero scrolls out of view; renders a single static
   * frame when the visitor prefers reduced motion.
   */
  const netCanvas = select('.hero-net');
  if (netCanvas && netCanvas.getContext) {
    const ctx = netCanvas.getContext('2d');
    const LINK_DIST = 150;
    // Mix of web-dev and networking fragments: the two halves of the work.
    const SNIPPETS = [
      '<div>', '</>', '{ }', '=>', 'const', '</html>', ':hover', '#root',
      'async', 'function()', '</script>', 'flex', 'git push', 'npm run',
      '200 OK', 'ping', 'DNS', 'TCP/IP', 'ssh', 'VLAN', 'curl', 'return'
    ];
    let w = 0, h = 0, dpr = 1, nodes = [], packets = [], tokens = [], rafId = null, running = false;

    const nodeCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.max(22, Math.min(78, Math.round(area / 22000)));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = netCanvas.clientWidth;
      h = netCanvas.clientHeight;
      netCanvas.width = Math.round(w * dpr);
      netCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const build = () => {
      const n = nodeCount();
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 1
      }));
      packets = Array.from({ length: Math.min(8, Math.floor(n / 7)) }, () => ({
        a: 0, b: 1, t: Math.random(), speed: 0.0035 + Math.random() * 0.004
      }));
      packets.forEach(assignPacket);

      const tokenCount = w < 620 ? 7 : w < 1100 ? 11 : 16;
      tokens = Array.from({ length: tokenCount }, () => makeToken(true));
    };

    function makeToken(anywhere) {
      return {
        text: SNIPPETS[(Math.random() * SNIPPETS.length) | 0],
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 30,
        vy: -(0.16 + Math.random() * 0.26),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.006,
        size: 11 + Math.random() * 7,
        alpha: 0.10 + Math.random() * 0.16,
        violet: Math.random() < 0.35
      };
    }

    function assignPacket(p) {
      // pick a pair that is currently linked, so packets ride visible edges
      for (let tries = 0; tries < 24; tries++) {
        const a = (Math.random() * nodes.length) | 0;
        const b = (Math.random() * nodes.length) | 0;
        if (a === b) continue;
        const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
          p.a = a; p.b = b; p.t = 0;
          return;
        }
      }
      p.t = 0;
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // drifting code fragments (behind the network)
      for (const t of tokens) {
        ctx.font = t.size.toFixed(1) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        ctx.fillStyle = t.violet
          ? 'rgba(167, 139, 250, ' + t.alpha.toFixed(3) + ')'
          : 'rgba(34, 211, 238, ' + t.alpha.toFixed(3) + ')';
        ctx.fillText(t.text, t.x + Math.sin(t.sway) * 10, t.y);
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.33;
          ctx.strokeStyle = 'rgba(34, 211, 238, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(125, 226, 245, 0.75)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // travelling packets
      for (const p of packets) {
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) { assignPacket(p); continue; }
        const dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy > LINK_DIST * LINK_DIST) { assignPacket(p); continue; }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.fillStyle = 'rgba(167, 139, 250, 0.95)';
        ctx.shadowColor = 'rgba(167, 139, 250, 0.9)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (const p of packets) {
        p.t += p.speed;
        if (p.t >= 1) assignPacket(p);
      }
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        t.y += t.vy;
        t.sway += t.swaySpeed;
        if (t.y < -20) tokens[i] = makeToken(false);
      }
      draw();
      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      rafId = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const init = () => { resize(); build(); draw(); };
    init();

    if (reduceMotion) {
      // single static frame only
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0 }).observe(netCanvas);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : (netCanvas.getBoundingClientRect().bottom > 0 && start());
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 180);
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
