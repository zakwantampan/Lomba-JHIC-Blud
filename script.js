/**
 * BLUD Smakensa - Main Script
 * Handles navigation, carousel slider with dynamic edge fades,
 * animated stats counter, scroll reveal animations, and touch gestures.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initProductsSlider();
  initStatsCounter();
  initScrollReveal();
  initContactForm();
});

/* ==========================================================================
   1. NAVBAR & NAVIGATION
   ========================================================================== */
function initNavbar() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navlinks');
  const navShell = document.querySelector('.nav-shell');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when clicking a link
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.querySelectorAll('a').forEach((el) => el.classList.remove('active'));
        link.classList.add('active');
        if (window.innerWidth <= 880) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (links.classList.contains('is-open') && !navShell.contains(e.target)) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll spy & navbar elevation effect
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navItems = document.querySelectorAll('.navlinks a');

  window.addEventListener('scroll', () => {
    // Elevate navbar on scroll
    if (navShell) {
      if (window.scrollY > 25) {
        navShell.classList.add('scrolled');
      } else {
        navShell.classList.remove('scrolled');
      }
    }

    // Active link highlighting
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navItems.forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentId}`) {
          item.classList.add('active');
        }
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   2. PRODUK & JASA SLIDER (WITH DYNAMIC GRADIENTS & PREV/NEXT)
   ========================================================================== */
function initProductsSlider() {
  const row = document.getElementById('productsRow');
  const btnNext = document.getElementById('productsNext');
  const btnPrev = document.getElementById('productsPrev');
  const fadeLeft = document.getElementById('productsFadeLeft');
  const fadeRight = document.getElementById('productsFadeRight');

  if (!row) return;

  let currentIndex = 0;

  function getVisibleCount() {
    const card = row.children[0];
    if (!card) return 1;
    const cardWidth = card.getBoundingClientRect().width;
    const viewportWidth = row.parentElement.getBoundingClientRect().width;
    const gap = getGap();
    if (cardWidth <= 0) return 1;
    return Math.max(1, Math.min(row.children.length, Math.round((viewportWidth + gap) / (cardWidth + gap))));
  }

  function getMaxIndex() {
    const totalCards = row.children.length;
    return Math.max(0, totalCards - getVisibleCount());
  }

  function getGap() {
    const style = window.getComputedStyle(row);
    return parseFloat(style.gap) || 24;
  }

  function updateSlider(smooth = true) {
    const card = row.children[0];
    if (!card) return;

    // Set transition
    row.style.transition = smooth ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';

    // Slide position
    const cardWidth = card.getBoundingClientRect().width;
    const step = cardWidth + getGap();
    const translateX = -(currentIndex * step);
    row.style.transform = `translateX(${translateX}px)`;

    const maxIdx = getMaxIndex();

    // 1. Left fade gradient & Back button state
    if (currentIndex > 0) {
      if (fadeLeft) fadeLeft.classList.add('is-visible');
      if (btnPrev) {
        btnPrev.classList.add('is-visible');
        btnPrev.removeAttribute('disabled');
      }
    } else {
      if (fadeLeft) fadeLeft.classList.remove('is-visible');
      if (btnPrev) {
        btnPrev.classList.remove('is-visible');
        btnPrev.setAttribute('disabled', 'true');
      }
    }

    // 2. Right fade gradient & Next button state
    if (currentIndex < maxIdx) {
      if (fadeRight) fadeRight.classList.add('is-visible');
      if (btnNext) {
        btnNext.classList.add('is-visible');
        btnNext.removeAttribute('disabled');
      }
    } else {
      if (fadeRight) fadeRight.classList.remove('is-visible');
      if (btnNext) {
        btnNext.classList.remove('is-visible');
        btnNext.setAttribute('disabled', 'true');
      }
    }
  }

  // Next Button Click
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const maxIdx = getMaxIndex();
      if (currentIndex < maxIdx) {
        currentIndex++;
        updateSlider();
      }
    });
  }

  // Prev Button Click
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });
  }

  // Window Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) {
        currentIndex = maxIdx;
      }
      updateSlider(false);
    }, 100);
  });

  // Touch Swipe Support for mobile devices
  let startX = 0;
  let endX = 0;
  let isSwiping = false;

  row.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
    isSwiping = true;
  }, { passive: true });

  row.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    endX = e.changedTouches[0].screenX;
    const diff = startX - endX;

    if (Math.abs(diff) > 45) {
      const maxIdx = getMaxIndex();
      if (diff > 0 && currentIndex < maxIdx) {
        // Swiped Left -> Next
        currentIndex++;
        updateSlider();
      } else if (diff < 0 && currentIndex > 0) {
        // Swiped Right -> Prev
        currentIndex--;
        updateSlider();
      }
    }
  }, { passive: true });

  // Initial update
  updateSlider(false);
}

/* ==========================================================================
   3. ANIMATED STATISTICS COUNTER
   ========================================================================= */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-num');
  if (!statNumbers.length) return;

  // Store original target values
  statNumbers.forEach((el) => {
    const rawVal = el.textContent.trim().replace(/[^0-9]/g, '');
    const target = parseInt(rawVal, 10);
    el.setAttribute('data-target', target || 0);
    el.textContent = '0';
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateNumbers();
        obs.disconnect(); // Trigger once only
      }
    });
  }, { threshold: 0.25 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    observer.observe(statsSection);
  }

  function animateNumbers() {
    statNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const duration = 1600; // ms
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease Out Cubic function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
  }
}

/* ==========================================================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .cta-card');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   5. CONTACT FORM & EMAIL INTEGRATION (info@smkn1bondowoso.sch.id)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const emailInput = document.getElementById('email');
  const replyToField = document.getElementById('replytoField');
  const btnSubmit = document.getElementById('btnSubmit') || (form ? form.querySelector('button[type="submit"]') : null);
  const btnLabel = btnSubmit ? btnSubmit.querySelector('.btn-label') : null;

  if (!form) return;

  // Synchronize _replyto with email input value
  if (emailInput && replyToField) {
    emailInput.addEventListener('input', () => {
      replyToField.value = emailInput.value.trim();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = (document.getElementById('nama')?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const pesan = (document.getElementById('pesan')?.value || '').trim();

    if (!nama || !email || !pesan) {
      showStatus('Harap lengkapi semua kolom: Nama, Email, dan Pesan.', 'warning');
      return;
    }

    // Set loading state
    if (btnSubmit) btnSubmit.classList.add('loading');
    if (btnLabel) btnLabel.textContent = 'Mengirim…';
    showStatus('Sedang mengirim pesan ke info@smkn1bondowoso.sch.id…', 'loading');

    const schoolEmail = 'info@smkn1bondowoso.sch.id';
    const mailtoSubject = encodeURIComponent(`[BLUD Smakensa] Pesan dari ${nama}`);
    const mailtoBody = encodeURIComponent(
      `Yth. Tim BLUD SMK Negeri 1 Bondowoso,\n\n` +
      `Perkenalkan, saya ${nama} (${email}).\n\n` +
      `Pesan / Pertanyaan:\n${pesan}\n\n` +
      `----------------------------------------\n` +
      `Dikirim melalui Formulir Website BLUD Smakensa\n` +
      `Waktu: ${new Date().toLocaleString('id-ID')}`
    );
    const mailtoUrl = `mailto:${schoolEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // If opened directly from local filesystem (file://), FormSubmit is blocked by origin policy
    if (window.location.protocol === 'file:') {
      window.location.href = mailtoUrl;
      showStatus(
        `✉️ Pesan Anda disiapkan di aplikasi email untuk dikirim ke <strong>${schoolEmail}</strong>.<br>` +
        `<a href="${mailtoUrl}" class="status-mailto-btn">Klik di sini jika aplikasi email belum terbuka otomatis</a>`,
        'info'
      );
      resetBtn();
      return;
    }

    try {
      const formData = new FormData(form);

      const res = await fetch(`https://formsubmit.co/ajax/${schoolEmail}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === true || data.success === 'true')) {
        showStatus(
          `✅ <strong>Pesan berhasil terkirim!</strong> Pesan Anda telah diteruskan ke email resmi sekolah (<strong>${schoolEmail}</strong>). Pihak sekolah akan segera menghubungi Anda.`,
          'success'
        );
        form.reset();
        if (replyToField) replyToField.value = '';
      } else {
        // In case FormSubmit needs one-time admin activation or returned an info notice
        console.warn('FormSubmit notice:', data);
        window.location.href = mailtoUrl;
        showStatus(
          `✉️ Pesan Anda disiapkan untuk dikirim langsung ke <strong>${schoolEmail}</strong> melalui aplikasi email Anda.<br>` +
          `<a href="${mailtoUrl}" class="status-mailto-btn">Buka Aplikasi Email Sekarang</a>`,
          'info'
        );
      }
    } catch (err) {
      console.error('Submit error:', err);
      // Fallback directly to mailto
      window.location.href = mailtoUrl;
      showStatus(
        `✉️ Membuka aplikasi email untuk mengirim pesan ke <strong>${schoolEmail}</strong>...<br>` +
        `<a href="${mailtoUrl}" class="status-mailto-btn">Klik di sini untuk buka email</a>`,
        'info'
      );
    } finally {
      resetBtn();
    }
  });

  function resetBtn() {
    if (btnSubmit) btnSubmit.classList.remove('loading');
    if (btnLabel) btnLabel.textContent = 'Kirim';
  }

  function showStatus(html, type) {
    if (!status) return;
    status.innerHTML = html;
    status.className = `form-status is-${type}`;
    status.style.opacity = '1';
  }
}

