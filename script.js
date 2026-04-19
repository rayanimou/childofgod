const sections = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.16 }
);

sections.forEach((section) => observer.observe(section));

const imageExtensions = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

const isImageHref = (href) => {
  if (!href) {
    return false;
  }
  return imageExtensions.test(href);
};

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('aria-hidden', 'true');
lightbox.innerHTML = `
  <button class="lightbox-control lightbox-close" type="button" aria-label="Fermer">✕</button>
  <button class="lightbox-control lightbox-prev" type="button" aria-label="Image precedente">‹</button>
  <figure class="lightbox-figure">
    <img class="lightbox-image" alt="" />
    <figcaption class="lightbox-caption"></figcaption>
  </figure>
  <button class="lightbox-control lightbox-next" type="button" aria-label="Image suivante">›</button>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');

const items = [];
let currentIndex = -1;

const updateLightbox = () => {
  if (currentIndex < 0 || currentIndex >= items.length) {
    return;
  }

  const item = items[currentIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt || '';
  lightboxCaption.textContent = item.alt || '';
  lightboxCaption.hidden = !item.alt;
  lightboxPrev.hidden = items.length < 2;
  lightboxNext.hidden = items.length < 2;
};

const openLightbox = (index) => {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
};

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  currentIndex = -1;
  lightboxImg.removeAttribute('src');
};

const showNext = () => {
  if (items.length < 2) {
    return;
  }
  currentIndex = (currentIndex + 1) % items.length;
  updateLightbox();
};

const showPrev = () => {
  if (items.length < 2) {
    return;
  }
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  updateLightbox();
};

const allImages = Array.from(document.querySelectorAll('main img')).filter(
  (img) => !img.closest('#music, #videos')
);

allImages.forEach((img) => {
  const anchor = img.closest('a');
  const anchorHref = anchor?.getAttribute('href') || '';
  const usesImageLink = anchor && isImageHref(anchorHref);

  if (anchor && !usesImageLink) {
    return;
  }

  const fullSrc = usesImageLink ? anchorHref : img.currentSrc || img.src;
  const alt = (img.getAttribute('alt') || '').trim();
  const index = items.push({ src: fullSrc, alt }) - 1;

  const trigger = usesImageLink ? anchor : img;
  trigger.classList.add('lightbox-trigger');
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openLightbox(index);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) {
    return;
  }

  if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'ArrowRight') {
    showNext();
  } else if (event.key === 'ArrowLeft') {
    showPrev();
  }
});
