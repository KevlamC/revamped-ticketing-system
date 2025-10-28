// scripts/hero.js

document.addEventListener("DOMContentLoaded", () => {
  // slides for the hero carousel
  // feel free to swap these images/texts
  const slides = [
    {
      image:
        "assets/dune2-poster.jpg",
      title: "DUNE: PART TWO",
      subtitle: "THEATRES ONLY NOW PLAYING",
      cta: "GET TICKETS",
    },
    {
      image:
        "assets/opp-poster.jpg",
      title: "OPPENHEIMER",
      subtitle: "EXPERIENCE IN 70MM",
      cta: "BOOK SEATS",
    },
    {
      image:
        "assets/sonic2-poster.jpg",
      title: "SONIC THE HEDGEHOG 2",
      subtitle: "UltraAVX",
      cta: "VIEW SHOWTIMES",
    },
    {
      image:
        "assets/deadpool&wolverine-poster.jpg",
      title: "DEADPOOL & WOLVERINE",
      subtitle: "EXPERIENCE IN IMAX",
      cta: "GET TICKETS",
    },
  ];

  let currentSlide = 0;

  // DOM refs
  const heroImageEl = document.getElementById("hero-image");
  const heroTitleEl = document.getElementById("hero-title");
  const heroSubtitleEl = document.getElementById("hero-subtitle");
  const heroCtaEl = document.getElementById("hero-cta");

  const heroPrevEl = document.getElementById("hero-prev");
  const heroNextEl = document.getElementById("hero-next");
  const heroDotsEl = document.getElementById("hero-dots");

  function renderDots() {
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

  function updateSlide() {
    const slide = slides[currentSlide];

    // simple fade: set opacity 0, swap, fade in
    heroImageEl.style.opacity = 0;

    setTimeout(() => {
      heroImageEl.src = slide.image;
      heroImageEl.alt = slide.title + " Banner";
      heroTitleEl.textContent = slide.title;
      heroSubtitleEl.textContent = slide.subtitle;
      heroCtaEl.textContent = slide.cta;

      heroImageEl.style.opacity = 1;
    }, 150);

    renderDots();
  }

  // hook up arrows
  heroPrevEl.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlide();
  });

  heroNextEl.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide();
  });

  // first paint
  updateSlide();
});
