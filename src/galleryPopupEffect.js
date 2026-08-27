const POPUP_SELECTOR = '.lightbox img';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function playGalleryPopup(image) {
  if (!(image instanceof HTMLImageElement) || prefersReducedMotion()) return;

  image.getAnimations?.().forEach((animation) => animation.cancel());
  image.animate(
    [
      { opacity: 0, transform: 'scale(0.72) translateY(24px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'scale(1.045) translateY(0)', filter: 'blur(0)' },
      { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
    ],
    {
      duration: 460,
      easing: 'cubic-bezier(.18,.85,.22,1)',
      fill: 'both',
    },
  );
}

function watchGalleryPopup() {
  const root = document.body;
  if (!root || typeof MutationObserver === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const image = mutation.target;
        if (image.matches?.(POPUP_SELECTOR)) {
          requestAnimationFrame(() => playGalleryPopup(image));
        }
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(POPUP_SELECTOR)) {
          requestAnimationFrame(() => playGalleryPopup(node));
          continue;
        }
        const image = node.querySelector?.(POPUP_SELECTOR);
        if (image) requestAnimationFrame(() => playGalleryPopup(image));
      }
    }
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchGalleryPopup, { once: true });
} else {
  watchGalleryPopup();
}
