const navMenu = document.getElementById('nav-menu'),
navToggle = document.getElementById('nav-toggle');

/*menu show- hidden*/
navToggle.addEventListener('click', () =>{

    navMenu.classList.toggle('show-menu');
    navToggle.classList.toggle('animate-toggle');
});


/*const styleSwitcher = document.getElementById('style-switcher'),
switcherToggle = document.getElementById('switcher-toggle'),
switcherClose = document.getElementById('switcher-close');

switcherToggle.addEventListener('click', () =>{
    styleSwitcher.classList.add('show-switcher');
}
)*/ 



/* ===== Year in footer ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Works filter (simple) ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.filter;
    workCards.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? '' : 'none';
    });
  });
});

/* ===== Testimonials slider (auto-rotate) ===== */
const testiCards = document.querySelectorAll('.testi-card');
if (testiCards.length) {
  let i = 0;
  setInterval(() => {
    testiCards[i].classList.remove('is-active');
    i = (i + 1) % testiCards.length;
    testiCards[i].classList.add('is-active');
  }, 5000);
}

/* ===== Optional: close menu on link click (works if you later add hrefs with #ids) ===== */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (navMenu && navMenu.classList.contains('show-menu')) {
      navMenu.classList.remove('show-menu');
      if (navToggle) navToggle.classList.remove('animate-toggle');
    }
  });
});








(function(){
  const grid = document.querySelector('#services .services-grid');
  if(!grid) return;

  // --- STOP vertical jump reasons ---

  // 1) Ако има #services в URL, махни го тихо
  if (location.hash === '#services') {
    history.replaceState(null, '', location.pathname + location.search);
  }

  // 2) Изключи browser scroll restoration при зареждане без хеш
  if ('scrollRestoration' in history && !location.hash) {
    history.scrollRestoration = 'manual';
  }

  // 3) Ако страницата се зарежда (navigate/reload) и няма хеш → скрол до топ
  try {
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    const isReloadOrNavigate = nav ? (nav.type === 'reload' || nav.type === 'navigate') : true;
    if (isReloadOrNavigate && !location.hash) {
      // временно изключи smooth scroll глобално (ако имаш html{scroll-behavior:smooth})
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      // върни предишното поведение след кадър
      requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
    }
  } catch(_) {}

  // --- Carousel logic (без vertical jump) ---

  const cards  = Array.from(grid.querySelectorAll('.service-card'));
  const prevBtn = document.querySelector('#services .services-arrow--prev');
  const nextBtn = document.querySelector('#services .services-arrow--next');

  const getActiveIndex = () => {
    const viewportCenter = grid.getBoundingClientRect().left + grid.clientWidth / 2;
    let best = {i: 0, d: Infinity};
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const d = Math.abs(cardCenter - viewportCenter);
      if (d < best.d) best = {i, d};
    });
    return best.i;
  };

  const getScrollIndex = () => getActiveIndex();

  const setActiveClasses = () => {
    const idx = getActiveIndex();
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === idx);
      c.classList.toggle('is-prev',   i === idx - 1);
      c.classList.toggle('is-next',   i === idx + 1);
    });
    prevBtn?.toggleAttribute('disabled', getScrollIndex() <= 0);
    nextBtn?.toggleAttribute('disabled', getScrollIndex() >= cards.length - 1);
  };

  const scrollToIndex = (targetIndex) => {
    const target = cards[Math.max(0, Math.min(cards.length - 1, targetIndex))];
    // вътрешно хоризонтално прелистване (block:'nearest' предотвратява вертикален скрол)
    target?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  };

  // *** ВАЖНО: НЯМА scrollIntoView при init! Само хоризонтално центриране с scrollTo ***
  if (cards[0]) {
    const first = cards[0];
    const left = first.offsetLeft - (grid.clientWidth / 2 - first.clientWidth / 2);
    grid.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
  }

  // listeners
  grid.addEventListener('scroll', () => { requestAnimationFrame(setActiveClasses); }, {passive:true});
  window.addEventListener('resize', () => { requestAnimationFrame(setActiveClasses); });

  prevBtn?.addEventListener('click', () => scrollToIndex(getScrollIndex() - 1));
  nextBtn?.addEventListener('click', () => scrollToIndex(getScrollIndex() + 1));

  grid.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn?.click(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prevBtn?.click(); }
  });

  // маркирай активната след като layout-a се стабилизира
  setTimeout(setActiveClasses, 50);
})();








(function(){
  const root = document.querySelector('#skills');
  if(!root) return;

  // 👉 Настройка: колко бавно да брои (в милисекунди)
  const DURATION_MS = 2200; // пробвай 1800–3000 за вкус

  const items  = Array.from(root.querySelectorAll('.skills-list li'));
  const floats = new Map();

  // Observer: стартира анимация, когато елемента е ~60% в изгледа
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      createOrUpdateFloat(entry.target, /*animate=*/true);
      io.unobserve(entry.target); // анимираме веднъж; махни реда ако искаш многократно
    });
  }, { root: null, threshold: 0.6 });

  items.forEach(li => io.observe(li));

  function createOrUpdateFloat(li, animate=false){
    const prog = li.querySelector('progress');
    if(!prog) return;

    const max = Number(prog.getAttribute('max') || 100);
    const val = Math.min(max, Math.max(0, Number(prog.getAttribute('value') || 0)));
    const pct = Math.round((val / max) * 100);

    let label = floats.get(li);
    if(!label){
      label = document.createElement('span');
      label.className = 'progress-float';
      label.setAttribute('aria-hidden', 'true');
      floats.set(li, label);
      li.appendChild(label);
    }

    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animateCount(label, pct, DURATION_MS);
    } else {
      label.textContent = pct + '%';
      label.classList.add('is-visible');
    }

    positionLabelOverProgress(li, prog, label, pct);
  }

  function positionLabelOverProgress(li, prog, label, pct){
    const liRect   = li.getBoundingClientRect();
    const pRect    = prog.getBoundingClientRect();
    const ratio    = pct / 100;
    const x        = (pRect.left - liRect.left) + (pRect.width * ratio);

    const pad = 8;
    const minX = (pRect.left - liRect.left) + pad;
    const maxX = (pRect.left - liRect.left) + pRect.width - pad;

    const clamped = Math.max(minX, Math.min(maxX, x));
    label.style.left = clamped + 'px';
  }

  function animateCount(el, target, dur){
    const start = 0;
    const t0 = performance.now();
    const easeOutCubic = k => 1 - Math.pow(1 - k, 3);

    function tick(t){
      const k = Math.min(1, (t - t0) / dur);
      const eased = easeOutCubic(k);
      const now = Math.round(start + (target - start) * eased);
      el.textContent = now + '%';
      if (k < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + '%';
      }
    }
    // показваме плавно балончето
    el.classList.add('is-visible');
    requestAnimationFrame(tick);
  }

  // При resize прецизираме позициите
  let rAF;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      items.forEach(li => {
        const prog = li.querySelector('progress');
        const label = floats.get(li);
        if(prog && label){
          const max = Number(prog.getAttribute('max') || 100);
          const val = Number(prog.getAttribute('value') || 0);
          const pct = Math.round((val / max) * 100);
          positionLabelOverProgress(li, prog, label, pct);
        }
      });
    });
  }, {passive:true});

  // Публичен хук, ако по-късно променяш стойности динамично
  window.updateSkillsPercents = () => {
    items.forEach(li => createOrUpdateFloat(li, /*animate=*/true));
  };
})();

