/**
 * Du'a Section — simple list of all du'as + random du'a feature
 * No tabs, no cards, no filtering — just a clean list that renders instantly.
 */

import { DUAS } from '../data/duas.js';

let currentRandomIndex = -1;

export function initDuaSection() {
  renderDuaList();
  initRandomDua();
}

/**
 * Render all du'as as a simple flat list — no cards, no categories, instant render
 */
function renderDuaList() {
  const list = document.getElementById('dua-list');
  if (!list) return;

  list.innerHTML = DUAS.map((dua) => {
    const sourceHtml = dua.source
      ? `<cite class="dua-item__source">${dua.source}</cite>`
      : '';

    return `
      <div class="dua-item${dua.isQuranic ? ' dua-item--quranic' : ''}">
        <p class="dua-item__text">${dua.text}</p>
        ${sourceHtml}
      </div>
    `;
  }).join('');
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
