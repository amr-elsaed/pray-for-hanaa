/**
 * Du'a Section — category filter, cards display, random Du'a feature, copy
 */

import { DUAS, DUA_CATEGORIES } from '../data/duas.js';

let currentCategory = 'all';
let currentRandomIndex = -1;

export function initDuaSection() {
  renderCategoryTabs();
  renderDuaCards();
  initRandomDua();
}

function renderCategoryTabs() {
  const tabsContainer = document.getElementById('dua-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = DUA_CATEGORIES.map((cat) => `
    <button
      class="dua-tab${cat.id === 'all' ? ' is-active' : ''}"
      data-category="${cat.id}"
      aria-pressed="${cat.id === 'all'}"
    >${cat.label}</button>
  `).join('');

  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.dua-tab');
    if (!tab) return;

    currentCategory = tab.dataset.category;

    // Update active states
    tabsContainer.querySelectorAll('.dua-tab').forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-pressed', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-pressed', 'true');

    renderDuaCards();
  });
}

function renderDuaCards() {
  const grid = document.getElementById('dua-grid');
  if (!grid) return;

  const filtered = currentCategory === 'all'
    ? DUAS
    : DUAS.filter((d) => d.category === currentCategory);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state">لم نجد دعاءً مطابقًا</p>';
    return;
  }

  grid.innerHTML = filtered.map((dua) => createDuaCardHTML(dua)).join('');
}

function createDuaCardHTML(dua) {
  const quranClass = dua.isQuranic ? ' dua-card--quranic' : '';
  const sourceHtml = dua.source
    ? `<cite class="dua-card__source">${dua.source}</cite>`
    : '';

  return `
    <div class="dua-card${quranClass}" data-id="${dua.id}">
      ${dua.isQuranic ? '<span class="dua-card__quran-badge">آية قرآنية</span>' : ''}
      <p class="dua-card__text">${dua.text}</p>
      ${sourceHtml}
      <button class="dua-card__copy" aria-label="نسخ الدعاء" data-dua-text="${encodeURIComponent(dua.text)}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <span class="dua-card__copy-label">نسخ</span>
      </button>
    </div>
  `;
}

function initRandomDua() {
  const card = document.getElementById('random-dua-card');
  const btn = document.getElementById('random-dua-btn');
  if (!card || !btn) return;

  showRandomDua();

  btn.addEventListener('click', () => {
    card.classList.add('is-fading');
    setTimeout(() => {
      showRandomDua();
      card.classList.remove('is-fading');
    }, 250);
  });
}

function showRandomDua() {
  const card = document.getElementById('random-dua-card');
  if (!card) return;

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * DUAS.length);
  } while (newIndex === currentRandomIndex && DUAS.length > 1);

  currentRandomIndex = newIndex;
  const dua = DUAS[newIndex];

  const textEl = card.querySelector('.random-dua__text');
  const sourceEl = card.querySelector('.random-dua__source');

  if (textEl) textEl.textContent = dua.text;
  if (sourceEl) {
    sourceEl.textContent = dua.source || '';
    sourceEl.style.display = dua.source ? '' : 'none';
  }
}

// Copy Du'a — event delegation on document
document.addEventListener('click', (e) => {
  const copyBtn = e.target.closest('.dua-card__copy');
  if (!copyBtn) return;

  const text = decodeURIComponent(copyBtn.dataset.duaText);
  const label = copyBtn.querySelector('.dua-card__copy-label');

  navigator.clipboard.writeText(text).then(() => {
    if (label) {
      const original = label.textContent;
      label.textContent = 'تم النسخ';
      setTimeout(() => { label.textContent = original; }, 1500);
    }
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(textarea);
    if (label) {
      const original = label.textContent;
      label.textContent = 'تم النسخ';
      setTimeout(() => { label.textContent = original; }, 1500);
    }
  });
});
