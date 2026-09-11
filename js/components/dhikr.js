/**
 * Dhikr Counters — shared across all visitors via API
 * Tap to count, see everyone's combined total.
 */

import { fetchDhikrCounts, incrementDhikrAPI, getDhikrTotal, toArabicNumerals } from '../utils/storage.js';

const DHIKR_ITEMS = [
  { key: 'subhanallah', text: 'سُبْحَانَ اللَّه' },
  { key: 'alhamdulillah', text: 'الْحَمْدُ لِلَّه' },
  { key: 'astaghfirullah', text: 'أَسْتَغْفِرُ اللَّه' },
  { key: 'lahawla', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه' },
];

let currentCounts = {};

export async function initDhikr() {
  renderDhikrCards();
  attachEventListeners();

  // Fetch shared counts from API and update display
  currentCounts = await fetchDhikrCounts();
  updateAllDisplays(currentCounts);
}

function renderDhikrCards() {
  const grid = document.getElementById('dhikr-grid');
  if (!grid) return;

  grid.innerHTML = DHIKR_ITEMS.map((item) => `
    <div class="dhikr-card" data-dhikr="${item.key}">
      <p class="dhikr-card__text">${item.text}</p>
      <p class="dhikr-card__count" id="dhikr-count-${item.key}">
        ${toArabicNumerals(0)}
      </p>
      <div class="dhikr-card__actions">
        <button
          class="dhikr-card__btn dhikr-card__btn--increment"
          data-dhikr-key="${item.key}"
          aria-label="زيادة عدد ${item.text}"
        >
          سَبِّحْ
        </button>
      </div>
    </div>
  `).join('');
}

function attachEventListeners() {
  const grid = document.getElementById('dhikr-grid');
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.dhikr-card__btn--increment');
    if (!btn) return;

    const key = btn.dataset.dhikrKey;

    // Optimistic UI: increment visually immediately
    currentCounts[key] = (currentCounts[key] || 0) + 1;
    updateCountDisplay(key, currentCounts[key]);
    updateTotals(currentCounts);

    // Pulse animation
    const card = btn.closest('.dhikr-card');
    if (card) {
      card.classList.remove('is-pulsed');
      void card.offsetWidth; // force reflow
      card.classList.add('is-pulsed');
    }

    // Send to API (updates with real server count)
    const serverCounts = await incrementDhikrAPI(key);
    currentCounts = serverCounts;
    updateAllDisplays(serverCounts);
  });
}

function updateCountDisplay(key, count) {
  const el = document.getElementById(`dhikr-count-${key}`);
  if (el) el.textContent = toArabicNumerals(count || 0);
}

function updateAllDisplays(counts) {
  DHIKR_ITEMS.forEach((item) => {
    updateCountDisplay(item.key, counts[item.key] || 0);
  });
  updateTotals(counts);
}

function updateTotals(counts) {
  const total = getDhikrTotal(counts);

  const totalEl = document.getElementById('dhikr-total');
  if (totalEl) totalEl.textContent = toArabicNumerals(total);

  const statEl = document.getElementById('stat-dhikr');
  if (statEl) statEl.textContent = toArabicNumerals(total);
}
