/**
 * Visitor Du'as — form submission, localStorage storage, card rendering
 */

import { getVisitorDuas, addVisitorDua, toArabicNumerals } from '../utils/storage.js';
import { escapeHtml, sanitizeInput, isRateLimited } from '../utils/sanitize.js';

export function initVisitorDuas() {
  renderVisitorList();
  initVisitorForm();
}

function initVisitorForm() {
  const form = document.getElementById('visitor-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessages();

    // Rate limit check
    if (isRateLimited('visitor-dua', 10000)) {
      showError('يرجى الانتظار قليلاً قبل إضافة دعاء آخر');
      return;
    }

    const nameInput = document.getElementById('visitor-name');
    const messageInput = document.getElementById('visitor-message');

    const name = sanitizeInput(nameInput.value, 100);
    const message = sanitizeInput(messageInput.value, 500);

    // Validation
    if (!name) {
      showError('يرجى كتابة اسمك');
      nameInput.focus();
      return;
    }

    if (!message) {
      showError('يرجى كتابة دعاءك');
      messageInput.focus();
      return;
    }

    // Save to localStorage
    addVisitorDua(name, message);

    // Re-render list
    renderVisitorList();

    // Update personal stats
    updateDuasStat();

    // Clear form and show success
    form.reset();
    showSuccess('جزاك الله خيرًا — تمت إضافة دعائك');

    // Auto-hide success after 4 seconds
    setTimeout(hideMessages, 4000);
  });
}

function renderVisitorList() {
  const listContainer = document.getElementById('visitor-list');
  if (!listContainer) return;

  const duas = getVisitorDuas();

  if (duas.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>لم يُضَف أي دعاء بعد</p>
        <p class="empty-state__sub">كن أول من يدعو لها — رحمها الله</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = duas.map((dua) => `
    <div class="visitor-card">
      <p class="visitor-card__name">${escapeHtml(dua.name)}</p>
      <p class="visitor-card__message">${escapeHtml(dua.message)}</p>
      <p class="visitor-card__date">${formatDate(dua.createdAt)}</p>
    </div>
  `).join('');
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

// === Form feedback helpers ===

function showError(message) {
  const errorEl = document.getElementById('visitor-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function showSuccess(message) {
  const successEl = document.getElementById('visitor-success');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
}

function hideMessages() {
  const errorEl = document.getElementById('visitor-error');
  const successEl = document.getElementById('visitor-success');
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
}

function updateDuasStat() {
  const statEl = document.getElementById('stat-duas');
  if (statEl) {
    const duas = getVisitorDuas();
    statEl.textContent = toArabicNumerals(duas.length);
  }
}
