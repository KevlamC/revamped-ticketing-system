/**
 * Hero Carousel Slider Logic
 * Handles image, content, and background video switching.
 */

document.addEventListener("DOMContentLoaded", () => {
  const slides = [
    {
      image: "Pictures/Apple_TV_F1_key_art_graphic_header_4_1_show_home.jpg", 
      title: "F1",
      description: "Brad Pitt stars as a former Formula 1 driver who returns to the sport to race for APXGP, a fictional 11th team on the grid.",
      rating: "NR",
      duration: "Coming Soon",
      genre: "Sport, Drama",
      score: "Anticipated",
      videoId: "TZGY2CWPXeU",
      ctaAction: () => alert("Bookings opening soon for F1!")
    },
    {
      image: "Pictures/maxresdefault.jpg", 
      title: "AVATAR: FIRE AND ASH",
      description: "Jake Sully and Neytiri encounter the Ash People, a volatile Na'vi clan, as the saga continues on Pandora.",
      rating: "NR",
      duration: "Coming Soon",
      genre: "Sci-Fi, Adventure",
      score: "Anticipated",
      videoId: "nb_fFj_0rq8",
      ctaAction: () => alert("Bookings opening soon!")
    },
    {
      image: "Pictures/Apple_TV_The_Family_Plan_2_Key_Art_graphic_header_4_1_show_home.jpg.large_2x.jpg", 
      title: "THE FAMILY PLAN 2",
      description: "Dan Morgan's past comes calling again in this action-packed sequel to the hit family comedy.",
      rating: "PG-13",
      duration: "Coming Soon",
      genre: "Action, Comedy",
      score: "Anticipated",
      videoId: "dqolYtJGuf4", 
      ctaAction: () => alert("Bookings opening soon!")
    },
    {
      image: "Pictures/dune-part-two-8k-4480x2520-15003.jpg",
      title: "DUNE: PART TWO",
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
      rating: "PG-13",
      duration: "2h 46m",
      genre: "Sci-Fi, Adventure",
      score: "★ 8.7/10",
      videoId: "Way9Dexny3w",
      ctaAction: () => openBooking("Dune: Part Two")
    },
    {
      image: "Pictures/zootopia-2-wallpaper-i-made-v0-7wzwlfltszuf1.png", 
      title: "ZOOTOPIA 2",
      description: "Judy Hopps and Nick Wilde return for a new mystery that takes them to parts of the city we've never seen before.",
      rating: "PG",
      duration: "Coming Soon",
      genre: "Animation, Comedy",
      score: "Anticipated",
      videoId: "BjkIOU5PhyQ",
      ctaAction: () => alert("Bookings opening soon!")
    },
    {
      image: "Pictures/MV5BZjczNjMxYTgtZTMxOS00MTg5LWFiMjYtYzIwMDQ5MTQ3ODU0XkEyXkFqcGdeQWFybm8@._V1_.jpg", 
      title: "FIVE NIGHTS AT FREDDY'S 2",
      description: "Security Breach: The animatronics are back and more terrifying than ever in this sequel to the box office smash.",
      rating: "PG-13",
      duration: "Coming Soon",
      genre: "Horror, Mystery",
      score: "Anticipated",
      videoId: "eGV7zwjvxKs",
      ctaAction: () => alert("Bookings opening soon!")
    }
  ];

  let currentSlide = 0;
  let videoTimer = null;

  // DOM refs
  const heroSection = document.querySelector('.hero');
  const heroImageEl = document.getElementById("hero-image");
  const heroVideoEl = document.getElementById("hero-video");
  
  const heroTitleEl = document.getElementById("hero-title");
  const heroSubtitleEl = document.getElementById("hero-subtitle");
  
  const heroCtaEl = document.getElementById("hero-cta");
  const heroTrailerEl = document.getElementById("hero-trailer");
  
  const heroRatingEl = document.getElementById("hero-rating");
  const heroDurationEl = document.getElementById("hero-duration");
  const heroGenreEl = document.getElementById("hero-genre");
  const heroScoreEl = document.getElementById("hero-score");

  const heroPrevEl = document.getElementById("hero-prev");
  const heroNextEl = document.getElementById("hero-next");
  const heroDotsEl = document.getElementById("hero-dots");

  // Helper to trigger booking
  function openBooking(movieTitle) {
    const bookingSheet = document.getElementById('bookingSheet');
    const sheetTitle = document.getElementById('sheetTitle');
    
    if (bookingSheet && sheetTitle && typeof show === 'function') {
        sheetTitle.textContent = movieTitle;
        if(typeof prepDates === 'function') prepDates(); 
        
        const timesRow = document.getElementById('timesRow');
        if(timesRow) timesRow.innerHTML = '';
        const confirmMsg = document.getElementById('confirmMsg');
        if(confirmMsg) confirmMsg.classList.remove('show');
        
        show(bookingSheet);
    } else {
        window.location.href = 'index.html#now-playing';
    }
  }

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

  function updateSlide() {
    const slide = slides[currentSlide];
    
    // 1. Reset Video State immediately
    if (videoTimer) clearTimeout(videoTimer);
    heroVideoEl.innerHTML = ''; // Remove iframe
    heroVideoEl.classList.remove('active');
    heroSection.classList.remove('video-active');
    heroImageEl.style.opacity = 1; // Show image

    // 2. Update Image
    if (heroImageEl) {
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
          heroImageEl.style.backgroundImage = `url(${slide.image})`;
          heroImageEl.setAttribute('aria-label', slide.title + ' Banner');
      };
    }

    // 3. Update Text
    if (heroTitleEl) heroTitleEl.textContent = slide.title;
    if (heroSubtitleEl) heroSubtitleEl.textContent = slide.description;
    
    // 4. Update Badges
    if (heroRatingEl) heroRatingEl.textContent = slide.rating;
    if (heroDurationEl) heroDurationEl.textContent = slide.duration;
    if (heroGenreEl) heroGenreEl.textContent = slide.genre;
    if (heroScoreEl) heroScoreEl.textContent = slide.score;

    // 5. Update Buttons
    if (heroCtaEl) heroCtaEl.onclick = slide.ctaAction;
    if (heroTrailerEl) heroTrailerEl.onclick = () => window.open(`https://www.youtube.com/watch?v=${slide.videoId}`, '_blank');

    renderDots();

    // 6. Set Timer for Video Background (2 seconds)
    videoTimer = setTimeout(() => {
        playBackgroundVideo(slide.videoId);
    }, 2500); // 2.5s delay
  }

  function playBackgroundVideo(videoId) {
      if (!videoId) return;
      
      // Embed YouTube Iframe
      // Autoplay, Mute, Loop, Controls=0, ModestBranding, HD1080 hint
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&vq=hd1080`;
      
      heroVideoEl.innerHTML = `
        <iframe class="hero-video-iframe" 
                src="${embedUrl}" 
                title="Trailer" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>
      `;
      
      // Fade in video container
      heroVideoEl.classList.add('active');
      
      // Trigger Dimming of content
      heroSection.classList.add('video-active');
  }

  // Event Listeners
  heroPrevEl?.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlide();
  });

  heroNextEl?.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide();
  });
  
  // NOTE: Auto-advance removed per user request to allow watching trailer

  // Initial Render
  if (heroImageEl) updateSlide();
});
