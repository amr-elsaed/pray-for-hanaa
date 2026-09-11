/**
 * Dhikr Counters — tap to count, persist to localStorage
 */

import { getDhikrCounts, incrementDhikr, getDhikrTotal, toArabicNumerals } from '../utils/storage.js';

const DHIKR_ITEMS = [
  { key: 'subhanallah', text: 'سُبْحَانَ اللَّه' },
  { key: 'alhamdulillah', text: 'الْحَمْدُ لِلَّه' },
  { key: 'astaghfirullah', text: 'أَسْتَغْفِرُ اللَّه' },
  { key: 'lahawla', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه' },
];

export function initDhikr() {
  renderDhikrCards();
  updateDhikrTotal();
}

function renderDhikrCards() {
  const grid = document.getElementById('dhikr-grid');
  if (!grid) return;

  const counts = getDhikrCounts();

  grid.innerHTML = DHIKR_ITEMS.map((item) => `
    <div class="dhikr-card" data-dhikr="${item.key}">
      <p class="dhikr-card__text">${item.text}</p>
      <p class="dhikr-card__count" id="dhikr-count-${item.key}">
        ${toArabicNumerals(counts[item.key] || 0)}
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

  // Event delegation for increment buttons
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.dhikr-card__btn--increment');
    if (!btn) return;

    const key = btn.dataset.dhikrKey;
    const counts = incrementDhikr(key);

    // Update count display
    const countEl = document.getElementById(`dhikr-count-${key}`);
    if (countEl) countEl.textContent = toArabicNumerals(counts[key]);

    // Pulse animation
    const card = btn.closest('.dhikr-card');
    if (card) {
      card.classList.remove('is-pulsed');
      // Force reflow to restart animation
      void card.offsetWidth;
      card.classList.add('is-pulsed');
    }

    // Update total
    updateDhikrTotal();

    // Update personal stats
    updatePersonalDhikrStat();
  });
}

function updateDhikrTotal() {
  const totalEl = document.getElementById('dhikr-total');
  if (totalEl) {
    totalEl.textContent = toArabicNumerals(getDhikrTotal());
  }
}

/**
 * Updates the personal stats section if present
 */
function updatePersonalDhikrStat() {
  const statEl = document.getElementById('stat-dhikr');
  if (statEl) {
    statEl.textContent = toArabicNumerals(getDhikrTotal());
  }
}
