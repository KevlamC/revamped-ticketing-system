/**
 * Hero Carousel Slider Logic
 * Handles image and content switching for the featured banner.
 */

document.addEventListener("DOMContentLoaded", () => {
  // slides for the hero carousel
  // The asset paths here must match your repository structure
  const slides = [
    {
    image:
      "Pictures/dune2-poster.jpg",
      title: "DUNE: PART TWO",
      subtitle: "THEATRES ONLY NOW PLAYING",
      cta: "GET TICKETS",
    },
    {
    image:
      "Pictures/opp-poster.jpg",
      title: "OPPENHEIMER",
      subtitle: "EXPERIENCE IN 70MM",
      cta: "BOOK SEATS",
    },
    {
    image:
      "Pictures/sonic2-poster.jpg",
      title: "SONIC THE HEDGEHOG 2",
      subtitle: "UltraAVX",
      cta: "VIEW SHOWTIMES",
    },
    {
    image:
      "Pictures/deadpool&wolverine-poster.jpg",
      title: "DEADPOOL & WOLVERINE",
      subtitle: "EXPERIENCE IN IMAX",
      cta: "GET TICKETS",
    },
  ];

  let currentSlide = 0;

  // DOM refs (may be missing on some pages)
  const heroImageEl = document.getElementById("hero-image"); // now a background div
  const heroTitleEl = document.getElementById("hero-title");
  const heroSubtitleEl = document.getElementById("hero-subtitle");
  const heroCtaEl = document.getElementById("hero-cta");

  const heroPrevEl = document.getElementById("hero-prev");
  const heroNextEl = document.getElementById("hero-next");
  const heroDotsEl = document.getElementById("hero-dots");

  /**
   * Renders the navigation dots based on the current slide index.
   */
  function renderDots() {
  if (!heroDotsEl) return;
  heroDotsEl.innerHTML = "";
    slides.forEach((_, idx) => {
      const dot = document.createElement("span");
      dot.className = "hero-dot" + (idx === currentSlide ? " hero-dot-active" : "");
      dot.addEventListener("click", () => {
        currentSlide = idx;
        updateSlide();
      });
      heroDotsEl.appendChild(dot);
    });
  }

  /**
   * Updates the content of the hero banner to display the current slide.
   */
  function updateSlide() {
    const slide = slides[currentSlide];
    // If hero background exists, fade it via opacity and set background-image
    if (heroImageEl) {
      heroImageEl.style.opacity = 0;
      setTimeout(() => {
        heroImageEl.style.backgroundImage = `url(${slide.image})`;
        heroImageEl.setAttribute('aria-label', slide.title + ' Banner');
        heroImageEl.style.opacity = 1;
      }, 150);
    }

    if (heroTitleEl) heroTitleEl.textContent = slide.title;
    if (heroSubtitleEl) heroSubtitleEl.textContent = slide.subtitle;
    if (heroCtaEl) heroCtaEl.textContent = slide.cta;

    renderDots();
  }

  // Hook up 'Previous' arrow click handler
  heroPrevEl?.addEventListener("click", () => {
    // Navigate to the previous slide, wrapping around if needed
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlide();
  });

  // Hook up 'Next' arrow click handler
  heroNextEl?.addEventListener("click", () => {
    // Navigate to the next slide, wrapping around if needed
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide();
  });

  // Initialize the slider on page load (only if hero exists)
  if (heroImageEl || heroTitleEl || heroSubtitleEl) updateSlide();
});
