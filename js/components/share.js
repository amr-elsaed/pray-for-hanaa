/**
 * Share — Web Share API with clipboard fallback
 */

export function initShare() {
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'هناء مصطفى السيد غزل — رحمها الله',
      text: 'صفحة تذكارية لروح هناء مصطفى السيد غزل رحمها الله — ادعوا لها بالرحمة والمغفرة',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error — ignore
        if (err.name !== 'AbortError') {
          fallbackCopy();
        }
      }
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('تم نسخ الرابط — شارك الصفحة واحتسب الأجر');
    }).catch(() => {
      showToast('يمكنك نسخ الرابط من شريط العنوان');
    });
  }
}

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
