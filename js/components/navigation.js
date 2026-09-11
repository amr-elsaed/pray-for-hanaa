/**
 * Navigation — mobile-first hamburger menu + smooth scroll + active section tracking
 */

export function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');
  const links = menu.querySelectorAll('a[href^="#"]');
  const header = document.querySelector('.site-header');

  // Toggle mobile menu
  function openMenu() {
    menu.classList.add('is-open');
    overlay.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Smooth scroll on link click + close mobile menu
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      const targetId = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const headerHeight = header.offsetHeight;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Active section tracking via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    rootMargin: `-${header.offsetHeight + 20}px 0px -60% 0px`,
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        const activeLink = menu.querySelector(`a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('is-active');
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Shrink header on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    lastScroll = scroll;
  }, { passive: true });
}
