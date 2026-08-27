const LIGHTBOX_IMAGE_SELECTOR = '.lightbox img';
const GALLERY_IMAGE_SELECTOR = '.gallery-card img';
let slideDirection = 1;
const preloadCache = new Map();

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function normalizeSource(image) {
  return image?.currentSrc || image?.src || '';
}

function preloadSource(src) {
  if (!src) return Promise.resolve();
  if (preloadCache.has(src)) return preloadCache.get(src);

  const promise = new Promise((resolve) => {
    const preload = new Image();
    preload.decoding = 'async';
    preload.onload = async () => {
      try {
        await preload.decode?.();
      } catch {
        // Loaded image can still be used even if decode() is unavailable or rejects.
      }
      resolve();
    };
    preload.onerror = resolve;
    preload.src = src;
    if (preload.complete) preload.onload();
  });

  preloadCache.set(src, promise);
  return promise;
}

function preloadGalleryImages() {
  document.querySelectorAll(GALLERY_IMAGE_SELECTOR).forEach((image) => {
    preloadSource(normalizeSource(image));
  });
}

function setDirectionFromControl(target) {
  const button = target?.closest?.('button');
  if (!button) return;
  const label = button.getAttribute('aria-label');
  if (label === 'Previous image') slideDirection = -1;
  if (label === 'Next image') slideDirection = 1;
}

async function playSlideIn(image) {
  if (!(image instanceof HTMLImageElement) || prefersReducedMotion()) return;

  image.getAnimations?.().forEach((animation) => animation.cancel());
  const src = normalizeSource(image);
  await preloadSource(src);

  if (!image.isConnected || normalizeSource(image) !== src) return;

  try {
    await image.decode?.();
  } catch {
    // Continue with the transition if the browser cannot explicitly decode.
  }

  if (!image.isConnected || normalizeSource(image) !== src) return;

  const offset = slideDirection * 22;
  requestAnimationFrame(() => {
    if (!image.isConnected || normalizeSource(image) !== src) return;
    image.animate(
      [
        { transform: `translate3d(${offset}px, 0, 0)` },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(.25,.8,.25,1)',
      },
    );
  });
}

function watchSliderChanges() {
  if (!document.body || typeof MutationObserver === 'undefined') return;

  document.addEventListener('click', (event) => {
    setDirectionFromControl(event.target);
    if (event.target?.closest?.('.gallery-card') || event.target?.closest?.('.lightbox')) {
      preloadGalleryImages();
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') slideDirection = -1;
    if (event.key === 'ArrowRight') slideDirection = 1;
  }, true);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const image = mutation.target;
        if (image.matches?.(LIGHTBOX_IMAGE_SELECTOR)) {
          playSlideIn(image);
        } else if (image.matches?.(GALLERY_IMAGE_SELECTOR)) {
          preloadSource(normalizeSource(image));
        }
        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.(GALLERY_IMAGE_SELECTOR)) preloadSource(normalizeSource(node));
        node.querySelectorAll?.(GALLERY_IMAGE_SELECTOR).forEach((image) => preloadSource(normalizeSource(image)));
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  const warmGallery = () => preloadGalleryImages();
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warmGallery, { timeout: 1400 });
  } else {
    window.setTimeout(warmGallery, 700);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchSliderChanges, { once: true });
} else {
  watchSliderChanges();
}
