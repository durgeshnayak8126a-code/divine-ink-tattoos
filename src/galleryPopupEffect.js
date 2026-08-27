const POPUP_SELECTOR = '.lightbox img';
const popupTokens = new WeakMap();

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

async function playGalleryPopup(image) {
  if (!(image instanceof HTMLImageElement)) return;

  const token = Symbol('gallery-popup');
  popupTokens.set(image, token);
  image.getAnimations?.().forEach((animation) => animation.cancel());

  if (prefersReducedMotion()) {
    image.style.visibility = 'visible';
    image.style.opacity = '';
    return;
  }

  // Hide the image immediately while the next source is decoding so the browser
  // never exposes a temporary placeholder/baseline line between gallery images.
  image.style.visibility = 'hidden';
  image.style.opacity = '0';

  try {
    if (typeof image.decode === 'function') {
      await image.decode();
    }
  } catch {
    // If decoding fails or is unsupported, still allow the visual transition.
  }

  if (!image.isConnected || popupTokens.get(image) !== token) return;

  requestAnimationFrame(() => {
    if (!image.isConnected || popupTokens.get(image) !== token) return;

    image.style.visibility = 'visible';
    image.style.opacity = '';

    image.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 8px, 0) scale(0.94)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
      ],
      {
        duration: 820,
        easing: 'cubic-bezier(.22,.61,.36,1)',
        fill: 'both',
      },
    );
  });
}

function watchGalleryPopup() {
  const root = document.body;
  if (!root || typeof MutationObserver === 'undefined') return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const image = mutation.target;
        if (image.matches?.(POPUP_SELECTOR)) {
          playGalleryPopup(image);
        }
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(POPUP_SELECTOR)) {
          playGalleryPopup(node);
          continue;
        }
        const image = node.querySelector?.(POPUP_SELECTOR);
        if (image) playGalleryPopup(image);
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
