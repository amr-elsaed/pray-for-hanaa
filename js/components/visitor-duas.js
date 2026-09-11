/**
 * Visitor Du'as — shared across all visitors via API
 * Every visitor sees everyone's du'as.
 */

import { fetchVisitorDuas, submitVisitorDua, toArabicNumerals } from '../utils/storage.js';
import { escapeHtml, sanitizeInput, isRateLimited } from '../utils/sanitize.js';

let allDuas = [];

export async function initVisitorDuas() {
  initVisitorForm();

  // Fetch all shared du'as from API and render
  allDuas = await fetchVisitorDuas();
  renderVisitorList(allDuas);
  updateDuasStat(allDuas);
}

function initVisitorForm() {
  const form = document.getElementById('visitor-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    // Rate limit check (client-side)
    if (isRateLimited('visitor-dua', 10000)) {
      showError('يرجى الانتظار قليلاً قبل إضافة دعاء آخر');
      return;
    }

    const nameInput = document.getElementById('visitor-name');
    const messageInput = document.getElementById('visitor-message');
    const submitBtn = document.getElementById('visitor-submit');

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

    // Disable button while submitting
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الإرسال...';
    }

    try {
      // Submit to API (saved to shared KV store)
      const newDua = await submitVisitorDua(name, message);

      // Add to local list and re-render
      allDuas.unshift(newDua);
      renderVisitorList(allDuas);
      updateDuasStat(allDuas);

      // Clear form and show success
      form.reset();
      showSuccess('جزاك الله خيرًا — تمت إضافة دعائك');
      setTimeout(hideMessages, 4000);
    } catch (err) {
      showError(err.message || 'حدث خطأ — يرجى المحاولة مرة أخرى');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'أضف دعاءك';
      }
    }
  });
}

function renderVisitorList(duas) {
  const listContainer = document.getElementById('visitor-list');
  if (!listContainer) return;

  if (!duas || duas.length === 0) {
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
  const el = document.getElementById('visitor-error');
  if (el) { el.textContent = message; el.style.display = 'block'; }
}

function showSuccess(message) {
  const el = document.getElementById('visitor-success');
  if (el) { el.textContent = message; el.style.display = 'block'; }
}

function hideMessages() {
  const errorEl = document.getElementById('visitor-error');
  const successEl = document.getElementById('visitor-success');
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
}

function updateDuasStat(duas) {
  const statEl = document.getElementById('stat-duas');
  if (statEl) {
    statEl.textContent = toArabicNumerals(duas.length);
  }
}
