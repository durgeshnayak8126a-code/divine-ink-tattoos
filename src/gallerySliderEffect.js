const LIGHTBOX_IMAGE_SELECTOR = '.lightbox img';
let slideDirection = 1;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function setDirectionFromControl(target) {
  const button = target?.closest?.('button');
  if (!button) return;
  const label = button.getAttribute('aria-label');
  if (label === 'Previous image') slideDirection = -1;
  if (label === 'Next image') slideDirection = 1;
}

function playSlideIn(image) {
  if (!(image instanceof HTMLImageElement) || prefersReducedMotion()) return;

  image.getAnimations?.().forEach((animation) => animation.cancel());
  const offset = slideDirection * 34;

  image.animate(
    [
      { opacity: 0.72, transform: `translate3d(${offset}px, 0, 0)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    ],
    {
      duration: 420,
      easing: 'cubic-bezier(.22,.61,.36,1)',
      fill: 'both',
    },
  );
}

function watchSliderChanges() {
  if (!document.body || typeof MutationObserver === 'undefined') return;

  document.addEventListener('click', (event) => setDirectionFromControl(event.target), true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') slideDirection = -1;
    if (event.key === 'ArrowRight') slideDirection = 1;
  }, true);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'attributes' || mutation.attributeName !== 'src') continue;
      const image = mutation.target;
      if (image.matches?.(LIGHTBOX_IMAGE_SELECTOR)) {
        requestAnimationFrame(() => playSlideIn(image));
      }
    }
  });

  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchSliderChanges, { once: true });
} else {
  watchSliderChanges();
}
