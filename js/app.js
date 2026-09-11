/**
 * App — Entry point for هناء مصطفى السيد غزل رحمها الله memorial site
 * Initializes all components on DOMContentLoaded.
 */

import { initNavigation } from './components/navigation.js';
import { initDuaSection } from './components/duas-section.js';
import { initDhikr } from './components/dhikr.js';
import { initVisitorDuas } from './components/visitor-duas.js';
import { initLightbox } from './components/lightbox.js';
import { initShare } from './components/share.js';
import { getDhikrTotal, getVisitorDuas, toArabicNumerals } from './utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initNavigation();
  initDuaSection();
  initDhikr();
  initVisitorDuas();
  initLightbox();
  initShare();

  // Scroll reveal animations
  initScrollReveal();

  // Load personal stats
  loadPersonalStats();
});

/**
 * Scroll Reveal — uses IntersectionObserver to animate elements into view
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    },
    {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * Load personal stats from localStorage
 */
function loadPersonalStats() {
  const statDhikr = document.getElementById('stat-dhikr');
  const statDuas = document.getElementById('stat-duas');

  if (statDhikr) {
    statDhikr.textContent = toArabicNumerals(getDhikrTotal());
  }

  if (statDuas) {
    statDuas.textContent = toArabicNumerals(getVisitorDuas().length);
  }
}
