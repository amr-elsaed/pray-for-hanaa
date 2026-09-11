/**
 * Lightbox — accessible image viewer
 */

export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector('.lightbox__img');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  let previousFocus = null;

  function open(src, alt) {
    previousFocus = document.activeElement;
    img.src = src;
    img.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.src = '';
    if (previousFocus) previousFocus.focus();
  }

  // Close handlers
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      close();
    }
  });

  // Attach to gallery images
  document.querySelectorAll('.gallery__img').forEach((imgEl) => {
    imgEl.style.cursor = 'pointer';
    imgEl.setAttribute('tabindex', '0');
    imgEl.setAttribute('role', 'button');
    imgEl.setAttribute('aria-label', 'افتح الصورة بالحجم الكامل');

    const handler = () => open(imgEl.src, imgEl.alt);
    imgEl.addEventListener('click', handler);
    imgEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
}
