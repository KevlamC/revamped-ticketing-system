// Movies dataset (title, genres, rating, releaseDate, poster, formats, showtimes)
const MOVIES = [
  {
    title: 'Dune: Part Two',
    genres: ['Sci-Fi','Adventure','Drama'],
    rating: 8.7,
    releaseDate: '2024-03-01',
    poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    formats: ['IMAX','3D','DOLBY'],
    times: ['12:30 PM','2:00 PM','5:30 PM','9:00 PM']
  },
  {
    title: 'Oppenheimer',
    genres: ['Drama','Biography','History'],
    rating: 8.5,
    releaseDate: '2023-07-21',
    poster: 'https://images.pexels.com/photos/4668513/pexels-photo-4668513.jpeg',
    formats: ['70MM','IMAX'],
    times: ['1:00 PM','4:30 PM','8:00 PM']
  },
  {
    title: 'The Batman',
    genres: ['Action','Crime','Thriller'],
    rating: 8.2,
    releaseDate: '2022-03-04',
    poster: 'https://images.pexels.com/photos/7991388/pexels-photo-7991388.jpeg',
    formats: ['DOLBY','4DX'],
    times: ['3:00 PM','6:30 PM','10:00 PM']
  },
  {
    title: 'Barbie',
    genres: ['Comedy','Fantasy','Adventure'],
    rating: 7.9,
    releaseDate: '2023-07-21',
    poster: 'https://images.pexels.com/photos/8263336/pexels-photo-8263336.jpeg',
    formats: ['STANDARD'],
    times: ['11:45 AM','1:30 PM','4:00 PM','7:30 PM']
  },
  {
    title: 'A Quiet Place: Day One',
    genres: ['Horror','Thriller','Sci-Fi'],
    rating: 7.8,
    releaseDate: '2024-06-28',
    poster: 'https://images.pexels.com/photos/6896424/pexels-photo-6896424.jpeg',
    formats: ['3D','DOLBY'],
    times: ['12:15 PM','3:30 PM','7:00 PM','10:30 PM']
  }
];

const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('globalSearch');
const sortSelect = document.getElementById('sortSelect');

let currentGenre = 'all';
let filtered = [...MOVIES];

function renderCards(list){
  moviesGrid.innerHTML = list.map(m => `
    <div class="movie-card" data-title="${m.title}">
      <div class="movie-poster">
        <img src="${m.poster}" alt="${m.title}" />
        <div class="movie-overlay">
          <button class="btn-primary" data-action="book" data-title="${m.title}">Book Now</button>
        </div>
        <div class="format-badges">
          ${m.formats.map(f => `<span class="format-badge ${f.toLowerCase()}">${f}</span>`).join('')}
        </div>
      </div>
      <div class="movie-info">
        <h3>${m.title}</h3>
        <div class="movie-meta">
          <span class="rating">★ ${m.rating}</span>
          <div class="genre-tags">
            ${m.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
        </div>
        <div class="showtimes">
          ${m.times.slice(0,3).map(t => `<button class="showtime-btn" data-action="book" data-title="${m.title}" data-time="${t}">${t}</button>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}
renderCards(filtered);

// Filter by genre
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGenre = btn.getAttribute('data-genre');
    applyFilters();
  });
});

// Search
searchInput?.addEventListener('input', applyFilters);

// Sort
sortSelect?.addEventListener('change', applyFilters);

function applyFilters(){
  const q = (searchInput?.value || '').toLowerCase();
  filtered = MOVIES.filter(m => {
    const matchQ = m.title.toLowerCase().includes(q) || m.genres.join(' ').toLowerCase().includes(q);
    const matchG = currentGenre === 'all' || m.genres.includes(currentGenre);
    return matchQ && matchG;
  });
  const sortBy = sortSelect?.value || 'title';
  filtered.sort((a,b) => {
    if(sortBy === 'title') return a.title.localeCompare(b.title);
    if(sortBy === 'rating') return b.rating - a.rating;
    if(sortBy === 'release') return new Date(b.releaseDate) - new Date(a.releaseDate);
    return 0;
  });
  renderCards(filtered);
}

// Booking modal + calendar/date
const bookingRoot = document.getElementById('bookingRoot');
const timesContainer = document.getElementById('timesContainer');
const bookingDate = document.getElementById('bookingDate');
const bookingLocation = document.getElementById('bookingLocation');
const bookingFormat = document.getElementById('bookingFormat');

function openBooking(movieTitle, preselectedTime=null){
  bookingRoot.classList.remove('hidden');
  bookingRoot.querySelector('#bookingTitle').textContent = `Select your showtime — ${movieTitle}`;
  const movie = MOVIES.find(m => m.title === movieTitle) || filtered[0];
  // populate formats based on movie
  bookingFormat.innerHTML = (movie.formats || ['STANDARD']).map(f => `<option>${f}</option>`).join('');
  // dates: default today
  const today = new Date().toISOString().slice(0,10);
  bookingDate.value = today;
  renderTimes(movie.times, preselectedTime);
}

function closeBooking(){ bookingRoot.classList.add('hidden'); }

function renderTimes(list, preselect=null){
  timesContainer.innerHTML = '';
  list.forEach(t => {
    const b = document.createElement('button');
    b.className = 'time-btn' + (t === preselect ? ' active' : '');
    b.textContent = t;
    b.dataset.time = t;
    b.addEventListener('click', () => {
      timesContainer.querySelectorAll('.time-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
    timesContainer.appendChild(b);
  });
}

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="book"]');
  if(btn){
    openBooking(btn.getAttribute('data-title'), btn.getAttribute('data-time') || null);
  }
  if(e.target.matches('[data-action="open-booking"]')){
    const first = filtered[0] || MOVIES[0];
    openBooking(first.title);
  }
});

bookingRoot?.addEventListener('click', (e) => {
  if(e.target.matches('[data-close]')) closeBooking();
});

document.getElementById('proceedPayment')?.addEventListener('click', () => {
  const activeTime = timesContainer.querySelector('.time-btn.active');
  const time = activeTime?.dataset.time;
  if(!time){ alert('Please choose a showtime.'); return; }
  const payload = {
    movie: bookingRoot.querySelector('#bookingTitle').textContent.replace('Select your showtime — ', ''),
    date: bookingDate.value,
    time,
    location: bookingLocation.value,
    format: bookingFormat.value,
  };
  // In a real app, send to backend
  alert(`Tickets for ${payload.movie}\n${payload.date} • ${payload.time}\n${payload.location} • ${payload.format}`);
  closeBooking();
});
