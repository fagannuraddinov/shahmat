/* =============================================
   ZAQATALA SHAHMAT YARISHI 2026
   JavaScript — Tab switching, Parallax, Animations
   ============================================= */

'use strict';

// ===== PARALLAX EFFECT =====
const parallaxBg = document.getElementById('parallaxBg');

// Disable parallax on touch/mobile devices to prevent jitter
const isMobile = () => window.innerWidth <= 768 || ('ontouchstart' in window);

let rafPending = false;
function handleParallax() {
  if (isMobile()) {
    // On mobile: lock the background, no transform
    if (parallaxBg) parallaxBg.style.transform = 'translateY(0)';
    return;
  }
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    if (parallaxBg) {
      parallaxBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    }
    rafPending = false;
  });
}

window.addEventListener('scroll', handleParallax, { passive: true });
window.addEventListener('resize', handleParallax, { passive: true });

// ===== STICKY NAV SCROLL BEHAVIOR =====
const mainNav = document.getElementById('mainNav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > lastScroll && current > 300) {
    mainNav.style.transform = 'translateY(-100%)';
    mainNav.style.transition = 'transform 0.3s ease';
  } else {
    mainNav.style.transform = 'translateY(0)';
  }
  lastScroll = current;
}, { passive: true });

// ===== MAIN TAB SWITCHER =====
function switchTab(targetId, clickedBtn) {
  // Hide all sections
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.remove('active');
  });
  // Deactivate all nav tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate target section
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.add('active');
    // Scroll to nav top
    document.getElementById('mainNav').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Activate clicked button
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  // Trigger training bar animations if training tab
  if (targetId === 'training-section') {
    animateTrainingBars();
  }
}

// ===== DAY SWITCHER (MEALS) =====
function switchDay(dayId, clickedBtn) {
  // Hide all day-meals
  document.querySelectorAll('.day-meals').forEach(panel => {
    panel.classList.remove('active');
  });
  // Deactivate all day buttons
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  // Show selected day
  const panel = document.getElementById('meals-' + dayId);
  if (panel) {
    panel.classList.add('active');
  }

  // Activate clicked button
  if (clickedBtn) {
    clickedBtn.classList.add('active');
    clickedBtn.setAttribute('aria-selected', 'true');
    // Scroll day button into view
    clickedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Start food image slideshow for selected day
  if (typeof startDaySlideshows === 'function') {
    startDaySlideshows(dayId);
  }
}

// ===== TRAINING BARS ANIMATION =====
function animateTrainingBars() {
  const bars = document.querySelectorAll('.train-bar');
  bars.forEach((bar, i) => {
    bar.style.animation = 'none';
    bar.offsetHeight; // trigger reflow
    bar.style.animation = `barGrow 0.8s ease ${i * 0.1}s forwards`;
  });
}

// ===== INTERSECTION OBSERVER for card reveal =====
const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      entry.target.dataset.revealed = 'true';
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

function setupCardReveal() {
  const activeSection = document.querySelector('.tab-section.active');
  if (!activeSection) return;

  activeSection.querySelectorAll('.glass-card, .special-event-card, .closing-banner, .training-summary').forEach((card, i) => {
    if (card.dataset.revealed === 'true') {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      return;
    }
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
    revealObserver.observe(card);
  });
}

// ===== ACTIVE DAY AUTO-HIGHLIGHT =====
function highlightCurrentDay() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-indexed
  const day = today.getDate();

  // Only highlight if we're in August 2026
  if (month !== 8) return;

  if (day >= 2 && day <= 11) {
    const padded = day.toString().padStart(2, '0');
    const btn = document.getElementById(`day-btn-${padded}`);
    const schedCard = document.getElementById(`sched-aug${padded}`);

    if (btn) {
      // Auto-switch to current day
      switchDay(`d${padded}`, btn);
    }

    if (schedCard) {
      schedCard.style.borderColor = 'rgba(212,168,67,0.45)';
      schedCard.style.boxShadow = '0 0 24px rgba(212,168,67,0.15), 0 8px 32px rgba(0,0,0,0.45)';
    }
  }
}

// ===== GOLD SHIMMER ANIMATION on piece icons =====
function addPieceInteraction() {
  document.querySelectorAll('.piece').forEach(piece => {
    piece.addEventListener('click', () => {
      piece.style.opacity = '0.5';
      piece.style.transform = 'scale(1.5)';
      piece.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        piece.style.opacity = '';
        piece.style.transform = '';
      }, 600);
    });
  });
}

// ===== TOUCH SWIPE for Day Selector =====
let touchStartX = 0;
let touchEndX = 0;

function setupSwipeGestures() {
  const mealsSection = document.getElementById('meals-section');
  if (!mealsSection) return;

  mealsSection.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  mealsSection.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < 60) return; // Min swipe distance

  const activeDayBtn = document.querySelector('.day-btn.active');
  if (!activeDayBtn) return;

  const allBtns = Array.from(document.querySelectorAll('.day-btn'));
  const currentIndex = allBtns.indexOf(activeDayBtn);

  if (diff > 0 && currentIndex < allBtns.length - 1) {
    // Swipe left → next day
    const nextBtn = allBtns[currentIndex + 1];
    const nextDayId = nextBtn.getAttribute('data-day');
    switchDay(nextDayId, nextBtn);
  } else if (diff < 0 && currentIndex > 0) {
    // Swipe right → prev day
    const prevBtn = allBtns[currentIndex - 1];
    const prevDayId = prevBtn.getAttribute('data-day');
    switchDay(prevDayId, prevBtn);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setupCardReveal();
  highlightCurrentDay();
  addPieceInteraction();
  setupSwipeGestures();

  // Initial parallax call
  handleParallax();

  // Animate training bars initially if training tab starts visible
  const trainingSection = document.getElementById('training-section');
  if (trainingSection && trainingSection.classList.contains('active')) {
    animateTrainingBars();
  }

  // Re-run card reveal when tabs switch
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(setupCardReveal, 50);
    });
  });
});

// ===== KEYBOARD NAVIGATION for day buttons =====
document.addEventListener('keydown', (e) => {
  const focused = document.activeElement;
  if (!focused || !focused.classList.contains('day-btn')) return;

  const allBtns = Array.from(document.querySelectorAll('.day-btn'));
  const idx = allBtns.indexOf(focused);

  if (e.key === 'ArrowRight' && idx < allBtns.length - 1) {
    allBtns[idx + 1].focus();
    allBtns[idx + 1].click();
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' && idx > 0) {
    allBtns[idx - 1].focus();
    allBtns[idx - 1].click();
    e.preventDefault();
  }
});

// ===== HOUSE GALLERY LOGIC =====
const houseImages = {
  girls: Array.from({ length: 26 }, (_, i) => `house 1/MaMHouse-${i + 1}.jpg`),
  boys: Array.from({ length: 24 }, (_, i) => `house 2/ScMHouse-${i + 1}.jpg`)
};

const houseIndexes = {
  girls: 0,
  boys: 0
};

window.updateHouseImage = function(type) {
  const imgEl = document.getElementById(`house-${type}-img`);
  const counterEl = document.getElementById(`${type}-current`);
  if (imgEl && counterEl) {
    const idx = houseIndexes[type];
    imgEl.src = houseImages[type][idx];
    counterEl.textContent = idx + 1;
  }
};

window.nextHouseImage = function(type) {
  houseIndexes[type] = (houseIndexes[type] + 1) % houseImages[type].length;
  window.updateHouseImage(type);
};

window.prevHouseImage = function(type) {
  houseIndexes[type] = (houseIndexes[type] - 1 + houseImages[type].length) % houseImages[type].length;
  window.updateHouseImage(type);
};


// ===== FOOD IMAGE SLIDESHOW =====
const dayFoodImages = {
  d02: ['2 avqust/2 avqust +.png','2 avqust/2 avqust + (2).png'],
  d03: ['3 avqust/3 avqust +.png','3 avqust/3 avqust + (2).png','3 avqust/3 avqust + (3).png','3 avqust/3 avqust + (4).png'],
  d04: ['4 avqust/4 avqust.png','4 avqust/4 avqust +.png','4 avqust/4 avqust (2).png'],
  d05: ['5 avqust/5 avqust.png','5 avqust/5 avqust (2).png','5 avqust/5 avqust (3).png','5 avqust/5avqust.png'],
  d06: ['6 avqust/6 avqust.png','6 avqust/6 avqust (2).png','6 avqust/6 avqust (3).png'],
  d07: ['7 avqust/7 avqust.png','7 avqust/7 avqust (2).png','7 avqust/7 avqust (3).png','7 avqust/7 avqust (4).png'],
  d08: ['8 avqust/8 avqust.png','8 avqust/8 avqust (2).png','8 avqust/8 avqust (3).png'],
  d09: ['9 avqust/9 avqust.png','9 avqust/9 avqust (2).png','9 avqust/9 avqust (3).png','9 avqust/9 avqust (4).png'],
  d10: ['10 avqust/10 avqust.png','10 avqust/10 avqust (2).png','10 avqust/10 avqust (3).png','10 avqust/10 avqust (4).png'],
  d11: ['11 avqust/11 avqust.png','11 avqust/11 avqust (2).png','11 avqust/11 avqust (3).png']
};

let activeSlideshowIntervals = [];

function initCardSlideshow(card, images) {
  if (!card.querySelector('.meal-bg-slide')) {
    var slideA = document.createElement('div');
    slideA.className = 'meal-bg-slide';
    var slideB = document.createElement('div');
    slideB.className = 'meal-bg-slide';
    card.insertBefore(slideB, card.firstChild);
    card.insertBefore(slideA, card.firstChild);
    var overlay = document.createElement('div');
    overlay.className = 'meal-bg-overlay';
    card.insertBefore(overlay, slideB.nextSibling);
  }
  var slides = card.querySelectorAll('.meal-bg-slide');
  var slideA = slides[0];
  var slideB = slides[1];
  var idx = 0;
  var useA = true;

  function showNext() {
    var img = images[idx % images.length];
    var encodedImg = img.split('/').map(function(p){ return encodeURIComponent(p); }).join('/');
    var url = 'url("' + encodedImg + '")';
    if (useA) {
      slideA.style.backgroundImage = url;
      slideA.classList.add('visible');
      slideB.classList.remove('visible');
    } else {
      slideB.style.backgroundImage = url;
      slideB.classList.add('visible');
      slideA.classList.remove('visible');
    }
    useA = !useA;
    idx++;
  }
  showNext();
  var intervalId = setInterval(showNext, 2300);
  activeSlideshowIntervals.push(intervalId);
}

function startDaySlideshows(dayId) {
  activeSlideshowIntervals.forEach(function(id){ clearInterval(id); });
  activeSlideshowIntervals = [];
  var images = dayFoodImages[dayId];
  if (!images || images.length === 0) return;
  var panel = document.getElementById('meals-' + dayId);
  if (!panel) return;
  var cards = panel.querySelectorAll('.meal-card');
  cards.forEach(function(card, i) {
    var offset = (i * Math.floor(images.length / Math.max(cards.length, 1))) % images.length;
    var rotatedImages = images.slice(offset).concat(images.slice(0, offset));
    initCardSlideshow(card, rotatedImages);
  });
}

// Start slideshow for initially active day on load
document.addEventListener('DOMContentLoaded', function() {
  var activeBtn = document.querySelector('.day-btn.active');
  if (activeBtn) {
    var dayId = activeBtn.getAttribute('data-day');
    if (dayId) startDaySlideshows(dayId);
  }
});

// ===== FAMILY DISCOUNT MODAL TOGGLE =====
document.addEventListener('DOMContentLoaded', () => {
  const familyBanner = document.getElementById('hero-family-banner');
  const familyModal = document.getElementById('familyModal');
  const closeBtnTop = document.getElementById('modalCloseBtnTop');
  const closeBtnBottom = document.getElementById('modalCloseBtnBottom');

  if (!familyBanner || !familyModal) return;

  function openModal() {
    familyModal.classList.add('active');
    familyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus the top close button or container for accessibility
    if (closeBtnTop) closeBtnTop.focus();
  }

  function closeModal() {
    familyModal.classList.remove('active');
    familyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scrolling
    familyBanner.focus(); // Return focus to the trigger
  }

  // Open events
  familyBanner.addEventListener('click', openModal);
  familyBanner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  });

  // Close events
  if (closeBtnTop) closeBtnTop.addEventListener('click', closeModal);
  if (closeBtnBottom) closeBtnBottom.addEventListener('click', closeModal);

  // Close when clicking outside the modal content
  familyModal.addEventListener('click', (e) => {
    if (e.target === familyModal) {
      closeModal();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && familyModal.classList.contains('active')) {
      closeModal();
    }
  });
});
