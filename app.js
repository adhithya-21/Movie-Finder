const state = {
  apiKey: localStorage.getItem('cinespace_api_key') || (typeof CONFIG !== 'undefined' ? CONFIG.OMDB_API_KEY : '') || '',
  currentTab: 'discover', 
  searchQuery: '',
  movies: [],          
  enrichedMovies: {},  
  watchlist: JSON.parse(localStorage.getItem('cinespace_watchlist')) || [],
  favorites: JSON.parse(localStorage.getItem('cinespace_favorites')) || [],
  reviews: JSON.parse(localStorage.getItem('cinespace_reviews')) || {}, 
  selectedMovieId: null,
  activeReviewRating: 0
};
const elements = {
  logoBtn: document.getElementById('logo-btn'),
  tabDiscover: document.getElementById('tab-discover'),
  tabWatchlist: document.getElementById('tab-watchlist'),
  tabFavorites: document.getElementById('tab-favorites'),
  settingsBtn: document.getElementById('settings-btn'),
  welcomeBanner: document.getElementById('welcome-banner'),
  searchSection: document.getElementById('search-section'),
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  filterGenre: document.getElementById('filter-genre'),
  sortBy: document.getElementById('sort-by'),
  searchStatus: document.getElementById('search-status'),
  movieGrid: document.getElementById('movie-grid'),
  detailModal: document.getElementById('detail-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalPoster: document.getElementById('modal-poster'),
  modalTitle: document.getElementById('modal-title'),
  modalRated: document.getElementById('modal-rated'),
  modalYear: document.getElementById('modal-year'),
  modalRuntime: document.getElementById('modal-runtime'),
  modalGenre: document.getElementById('modal-genre'),
  modalPlot: document.getElementById('modal-plot'),
  modalDirector: document.getElementById('modal-director'),
  modalWriter: document.getElementById('modal-writer'),
  modalActors: document.getElementById('modal-actors'),
  modalAwards: document.getElementById('modal-awards'),
  modalRatingsContainer: document.getElementById('modal-ratings-container'),
  modalWatchlistBtn: document.getElementById('modal-watchlist-btn'),
  modalFavoriteBtn: document.getElementById('modal-favorite-btn'),
  btnTabInfo: document.getElementById('btn-tab-info'),
  btnTabReviews: document.getElementById('btn-tab-reviews'),
  modalTabInfo: document.getElementById('modal-tab-info'),
  modalTabReviews: document.getElementById('modal-tab-reviews'),
  reviewsCount: document.getElementById('reviews-count'),
  reviewForm: document.getElementById('review-form'),
  reviewInput: document.getElementById('review-input'),
  starInputGroup: document.getElementById('star-input-group'),
  reviewsListContainer: document.getElementById('reviews-list-container'),
  settingsModal: document.getElementById('settings-modal'),
  apiKeyInput: document.getElementById('api-key-input'),
  apiStatusDisplay: document.getElementById('api-status-display'),
  settingsSaveBtn: document.getElementById('settings-save-btn'),
  settingsResetBtn: document.getElementById('settings-reset-btn'),
  settingsCloseBtn: document.getElementById('settings-close-btn'),
  toastContainer: document.getElementById('toast-container')
};
function init() {
  setupEventListeners();
  updateAPIStatusUI();
  loadDiscoverMovies();
}

function setupEventListeners() {
  elements.tabDiscover.addEventListener('click', () => switchTab('discover'));
  elements.tabWatchlist.addEventListener('click', () => switchTab('watchlist'));
  elements.tabFavorites.addEventListener('click', () => switchTab('favorites'));
  elements.logoBtn.addEventListener('click', resetToDiscover);
  elements.searchForm.addEventListener('submit', handleSearchSubmit);
  elements.filterGenre.addEventListener('change', renderMoviesGrid);
  elements.sortBy.addEventListener('change', renderMoviesGrid);
  elements.settingsBtn.addEventListener('click', openSettingsModal);
  elements.settingsCloseBtn.addEventListener('click', closeSettingsModal);
  elements.settingsSaveBtn.addEventListener('click', saveSettings);
  elements.settingsResetBtn.addEventListener('click', resetSettings);
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) closeSettingsModal();
  });
  elements.modalCloseBtn.addEventListener('click', closeDetailModal);
  elements.detailModal.addEventListener('click', (e) => {
    if (e.target === elements.detailModal) closeDetailModal();
  });
  
  elements.modalWatchlistBtn.addEventListener('click', toggleModalWatchlist);
  elements.modalFavoriteBtn.addEventListener('click', toggleModalFavorite);
  elements.btnTabInfo.addEventListener('click', () => switchModalTab('info'));
  elements.btnTabReviews.addEventListener('click', () => switchModalTab('reviews'));
  elements.starInputGroup.addEventListener('click', handleStarRatingInput);
  elements.reviewForm.addEventListener('submit', handleReviewSubmit);
}
function switchTab(tabName) {
  state.currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabName === 'discover') {
    elements.welcomeBanner.style.display = 'block';
    elements.searchSection.style.display = 'block';
    loadDiscoverMovies();
  } else {
    elements.welcomeBanner.style.display = 'none';
    elements.searchSection.style.display = 'none';
    if (tabName === 'watchlist') {
      loadWatchlistMovies();
    } else if (tabName === 'favorites') {
      loadFavoritesMovies();
    }
  }
}

function resetToDiscover() {
  elements.searchInput.value = '';
  state.searchQuery = '';
  elements.filterGenre.value = 'all';
  elements.sortBy.value = 'relevance';
  switchTab('discover');
}

async function loadDiscoverMovies() {
  if (state.searchQuery) {
    executeMovieSearch(state.searchQuery);
    return;
  }
  
  showSkeletonLoaders();
  if (state.apiKey) {
    const popularTitles = ['Inception', 'The Dark Knight', 'Interstellar', 'Spirited Away', 'Pulp Fiction', 'Parasite', 'The Matrix', 'Gladiator'];
    try {
      elements.searchStatus.textContent = 'Curating trending list...';
      const moviePromises = popularTitles.map(title => fetchMovieByTitle(title));
      const results = await Promise.all(moviePromises);
      state.movies = results.filter(movie => movie !== null);
      
      state.movies.forEach(movie => {
        state.enrichedMovies[movie.imdbID] = movie;
      });
      elements.searchStatus.textContent = 'Showing popular recommendations';
      renderMoviesGrid();
    } catch (err) {
      console.error('Error fetching popular recommendations: ', err);
      
      useMockMoviesFallback('Unable to load recommendations. Showing offline selection.');
    }
  } else {
    useMockMoviesFallback('Offline Mock Mode: enter an API key for live search');
  }
}
function useMockMoviesFallback(statusMessage) {
  state.movies = [...window.mockMovies];
  state.movies.forEach(movie => {
    state.enrichedMovies[movie.imdbID] = movie;
  });
  elements.searchStatus.textContent = statusMessage;
  renderMoviesGrid();
}

async function loadWatchlistMovies() {
  showSkeletonLoaders();
  elements.searchStatus.textContent = `Watchlist: ${state.watchlist.length} movies`;
  if (state.watchlist.length === 0) {
    state.movies = [];
    renderMoviesGrid();
    return;
  }
  
  try {
    const moviePromises = state.watchlist.map(id => getMovieDetails(id));
    const results = await Promise.all(moviePromises);
    state.movies = results.filter(movie => movie !== null);
    renderMoviesGrid();
  } catch (err) {
    showToast('Failed to load watchlist details.', 'error');
    state.movies = [];
    renderMoviesGrid();
  }
}
async function loadFavoritesMovies() {
  showSkeletonLoaders();
  elements.searchStatus.textContent = `Favorites: ${state.favorites.length} movies`;
  if (state.favorites.length === 0) {
    state.movies = [];
    renderMoviesGrid();
    return;
  }
  
  try {
    const moviePromises = state.favorites.map(id => getMovieDetails(id));
    const results = await Promise.all(moviePromises);
    state.movies = results.filter(movie => movie !== null);
    renderMoviesGrid();
  } catch (err) {
    showToast('Failed to load favorites details.', 'error');
    state.movies = [];
    renderMoviesGrid();
  }
}
async function handleSearchSubmit(e) {
  e.preventDefault();
  const query = elements.searchInput.value.trim();
  if (!query) return;
  state.searchQuery = query;
  executeMovieSearch(query);
}

async function executeMovieSearch(query) {
  showSkeletonLoaders();
  elements.searchStatus.textContent = `Searching for "${query}"...`;
  if (!state.apiKey) {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = window.mockMovies.filter(m => 
        m.Title.toLowerCase().includes(lowerQuery) || 
        m.Genre.toLowerCase().includes(lowerQuery) ||
        m.Actors.toLowerCase().includes(lowerQuery)
      );
      state.movies = filtered;
      filtered.forEach(movie => {
        state.enrichedMovies[movie.imdbID] = movie;
      });
      elements.searchStatus.textContent = `Mock search for "${query}" (${filtered.length} found)`;
      renderMoviesGrid();
    }, 400); 
    return;
  }
  try {
    const url = `https://www.omdbapi.com/?apikey=${state.apiKey}&s=${encodeURIComponent(query)}&type=movie`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === 'True') {
      const basicResults = data.Search;
      elements.searchStatus.textContent = `Enriching cinematic data for ${basicResults.length} movies...`;
      
      const detailPromises = basicResults.map(movie => getMovieDetails(movie.imdbID));
      const fullDetails = await Promise.all(detailPromises);
      state.movies = fullDetails.filter(movie => movie !== null);
      elements.searchStatus.textContent = `Search results for "${query}" (${state.movies.length} found)`;
      renderMoviesGrid();
    } else {
      state.movies = [];
      elements.searchStatus.textContent = `No results found for "${query}"`;
      renderMoviesGrid();
      showToast(data.Error || 'Search failed', 'error');
    }
  } catch (err) {
    console.error('Search error:', err);
    showToast('Network error while searching.', 'error');
    useMockMoviesFallback('Network error. Falling back to offline dataset.');
  }
}
async function fetchMovieByTitle(title) {
  try {
    const url = `https://www.omdbapi.com/?apikey=${state.apiKey}&t=${encodeURIComponent(title)}&plot=short`;
    const response = await fetch(url);
    const data = await response.json();
    return data.Response === 'True' ? data : null;
  } catch (e) {
    return null;
  }
}

async function getMovieDetails(imdbID) {
  if (state.enrichedMovies[imdbID]) {
    return state.enrichedMovies[imdbID];
  }
  if (!state.apiKey) {
    const mock = window.mockMovies.find(m => m.imdbID === imdbID);
    if (mock) {
      state.enrichedMovies[imdbID] = mock;
      return mock;
    }
    return null;
  }
  try {
    const url = `https://www.omdbapi.com/?apikey=${state.apiKey}&i=${imdbID}&plot=full`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === 'True') {
      state.enrichedMovies[imdbID] = data; 
      return data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching movie details for ${imdbID}:`, err);
    return null;
  }
}

function renderMoviesGrid() {
  const selectedGenre = elements.filterGenre.value.toLowerCase();
  const selectedSort = elements.sortBy.value;
  let filteredMovies = [...state.movies];
  if (selectedGenre !== 'all') {
    filteredMovies = filteredMovies.filter(movie => {
      if (!movie.Genre) return false;
      return movie.Genre.toLowerCase().includes(selectedGenre);
    });
  }
  filteredMovies.sort((a, b) => {
    if (selectedSort === 'year-desc') {
      return parseInt(b.Year) - parseInt(a.Year);
    }
    if (selectedSort === 'year-asc') {
      return parseInt(a.Year) - parseInt(b.Year);
    }
    if (selectedSort === 'rating-desc') {
      const ratingA = parseFloat(a.imdbRating) || 0;
      const ratingB = parseFloat(b.imdbRating) || 0;
      return ratingB - ratingA;
    }
    
    return 0;
  });
  elements.movieGrid.innerHTML = '';
  if (filteredMovies.length === 0) {
    elements.movieGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; color: var(--text-dark);"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
        <p style="font-size: 16px; font-weight: 500;">No matching movies found.</p>
        <p style="font-size: 14px; margin-top: 4px; color: var(--text-dark);">Try clearing your search or updating filters.</p>
      </div>
    `;
    return;
  }
  
  filteredMovies.forEach(movie => {
    const card = createMovieCard(movie);
    elements.movieGrid.appendChild(card);
  });
}
function createMovieCard(movie) {
  const isWatchlist = state.watchlist.includes(movie.imdbID);
  const isFavorite = state.favorites.includes(movie.imdbID);
  const ratingVal = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=350&auto=format&fit=crop'; 
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.id = movie.imdbID;
  card.innerHTML = `
    <div class="card-poster-wrapper">
      <img src="${posterUrl}" alt="${movie.Title}" class="card-poster" loading="lazy">
      <div class="card-overlay">
        <button class="card-action-btn ${isWatchlist ? 'watchlist-active' : ''}" data-action="watchlist" title="Add to Watchlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
        <button class="card-action-btn ${isFavorite ? 'favorite-active' : ''}" data-action="favorite" title="Add to Favorites">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
    </div>
    <div class="card-info">
      <div class="card-rating-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>${ratingVal}</span>
      </div>
      <h3 class="card-title">${movie.Title}</h3>
      <div class="card-footer">
        <span>${movie.Year}</span>
        <span>${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</span>
      </div>
    </div>
  `;
  card.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.card-action-btn');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'watchlist') {
        toggleWatchlist(movie.imdbID);
      } else if (action === 'favorite') {
        toggleFavorite(movie.imdbID);
      }
      return;
    }
    
    openDetailModal(movie.imdbID);
  });
  return card;
}
function showSkeletonLoaders() {
  elements.movieGrid.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    elements.movieGrid.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-poster"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text" style="width: 35%;"></div>
        </div>
      </div>
    `;
  }
}
function toggleWatchlist(imdbID) {
  const index = state.watchlist.indexOf(imdbID);
  let isAdded = false;
  if (index === -1) {
    state.watchlist.push(imdbID);
    isAdded = true;
    showToast('Added to Watchlist', 'success');
  } else {
    state.watchlist.splice(index, 1);
    showToast('Removed from Watchlist', 'success');
  }
  
  localStorage.setItem('cinespace_watchlist', JSON.stringify(state.watchlist));
  if (state.currentTab === 'watchlist') {
    loadWatchlistMovies();
  } else {
    renderMoviesGrid();
  }
  if (state.selectedMovieId === imdbID) {
    updateModalActionButtons();
  }
}
function toggleFavorite(imdbID) {
  const index = state.favorites.indexOf(imdbID);
  let isAdded = false;
  if (index === -1) {
    state.favorites.push(imdbID);
    isAdded = true;
    showToast('Added to Favorites', 'success');
  } else {
    state.favorites.splice(index, 1);
    showToast('Removed from Favorites', 'success');
  }
  localStorage.setItem('cinespace_favorites', JSON.stringify(state.favorites));
  
  if (state.currentTab === 'favorites') {
    loadFavoritesMovies();
  } else {
    renderMoviesGrid();
  }
  if (state.selectedMovieId === imdbID) {
    updateModalActionButtons();
  }
}
function toggleModalWatchlist() {
  if (state.selectedMovieId) {
    toggleWatchlist(state.selectedMovieId);
  }
}
function toggleModalFavorite() {
  if (state.selectedMovieId) {
    toggleFavorite(state.selectedMovieId);
  }
}
function updateModalActionButtons() {
  const isWatchlist = state.watchlist.includes(state.selectedMovieId);
  const isFavorite = state.favorites.includes(state.selectedMovieId);
  
  elements.modalWatchlistBtn.classList.toggle('watchlist-active', isWatchlist);
  elements.modalWatchlistBtn.querySelector('svg').setAttribute('fill', isWatchlist ? 'currentColor' : 'none');
  elements.modalFavoriteBtn.classList.toggle('favorite-active', isFavorite);
  elements.modalFavoriteBtn.querySelector('svg').setAttribute('fill', isFavorite ? 'currentColor' : 'none');
}
async function openDetailModal(imdbID) {
  state.selectedMovieId = imdbID;
  const movie = await getMovieDetails(imdbID);
  
  if (!movie) {
    showToast('Failed to load movie details.', 'error');
    return;
  }
  switchModalTab('info');
  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=350&auto=format&fit=crop';
  elements.modalPoster.src = posterUrl;
  elements.modalPoster.alt = movie.Title;
  elements.modalTitle.textContent = movie.Title;
  elements.modalRated.textContent = movie.Rated !== 'N/A' ? movie.Rated : 'Unrated';
  elements.modalYear.textContent = movie.Year;
  elements.modalRuntime.textContent = movie.Runtime;
  elements.modalGenre.textContent = movie.Genre;
  elements.modalPlot.textContent = movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No description plot available.';
  elements.modalDirector.textContent = movie.Director || '-';
  elements.modalWriter.textContent = movie.Writer || '-';
  elements.modalActors.textContent = movie.Actors || '-';
  elements.modalAwards.textContent = movie.Awards !== 'N/A' ? movie.Awards : 'None';
  elements.modalRatingsContainer.innerHTML = '';
  if (movie.Ratings && movie.Ratings.length > 0) {
    movie.Ratings.forEach(rating => {
      let pillClass = '';
      if (rating.Source === 'Internet Movie Database') pillClass = 'imdb';
      else if (rating.Source === 'Rotten Tomatoes') pillClass = 'rt';
      else if (rating.Source === 'Metacritic') pillClass = 'mc';
      const sourceShort = rating.Source === 'Internet Movie Database' ? 'IMDb' : rating.Source;
      elements.modalRatingsContainer.innerHTML += `
        <div class="rating-pill ${pillClass}">
          ${sourceShort}: <span>${rating.Value}</span>
        </div>
      `;
    });
  } else if (movie.imdbRating && movie.imdbRating !== 'N/A') {
    elements.modalRatingsContainer.innerHTML = `
      <div class="rating-pill imdb">
        IMDb: <span>${movie.imdbRating}/10</span>
      </div>
    `;
  } else {
    elements.modalRatingsContainer.innerHTML = `<span style="color: var(--text-dark); font-size: 13px;">No scores available</span>`;
  }
  
  updateModalActionButtons();
  renderReviewsList();
  elements.detailModal.classList.add('open');
  document.body.style.overflow = 'hidden'; 
}
function closeDetailModal() {
  elements.detailModal.classList.remove('open');
  document.body.style.overflow = '';
  state.selectedMovieId = null;
}
function switchModalTab(tabName) {
  elements.btnTabInfo.classList.toggle('active', tabName === 'info');
  elements.btnTabReviews.classList.toggle('active', tabName === 'reviews');
  
  elements.modalTabInfo.classList.toggle('active', tabName === 'info');
  elements.modalTabReviews.classList.toggle('active', tabName === 'reviews');
}
function renderReviewsList() {
  const imdbID = state.selectedMovieId;
  const movieReviews = state.reviews[imdbID] || [];
  elements.reviewsCount.textContent = movieReviews.length;
  elements.reviewsListContainer.innerHTML = '';
  if (movieReviews.length === 0) {
    elements.reviewsListContainer.innerHTML = `
      <div class="no-reviews-msg">
        Be the first to share your thoughts on this film!
      </div>
    `;
    return;
  }
  
  const sortedReviews = [...movieReviews].reverse();
  sortedReviews.forEach(review => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= review.rating ? '★' : '☆';
    }
    
    elements.reviewsListContainer.innerHTML += `
      <div class="review-item">
        <div class="review-item-header">
          <span class="review-item-stars">${stars}</span>
          <span>${review.date}</span>
        </div>
        <p class="review-item-text">${escapeHTML(review.text)}</p>
      </div>
    `;
  });
}
function handleStarRatingInput(e) {
  const star = e.target.closest('.star-icon');
  if (!star) return;
  const rating = parseInt(star.dataset.rating);
  state.activeReviewRating = rating;
  
  document.querySelectorAll('#star-input-group .star-icon').forEach(item => {
    const starRating = parseInt(item.dataset.rating);
    item.classList.toggle('active', starRating <= rating);
  });
}
function handleReviewSubmit(e) {
  e.preventDefault();
  const imdbID = state.selectedMovieId;
  const reviewText = elements.reviewInput.value.trim();
  const rating = state.activeReviewRating;
  
  if (!imdbID) return;
  if (rating === 0) {
    showToast('Please select a star rating first.', 'error');
    return;
  }
  
  const newReview = {
    rating: rating,
    text: reviewText,
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  };
  if (!state.reviews[imdbID]) {
    state.reviews[imdbID] = [];
  }
  state.reviews[imdbID].push(newReview);
  localStorage.setItem('cinespace_reviews', JSON.stringify(state.reviews));
  
  elements.reviewInput.value = '';
  state.activeReviewRating = 0;
  document.querySelectorAll('#star-input-group .star-icon').forEach(item => {
    item.classList.remove('active');
  });
  showToast('Review submitted successfully!', 'success');
  renderReviewsList();
}
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
function openSettingsModal() {
  elements.apiKeyInput.value = state.apiKey;
  elements.settingsModal.classList.add('open');
}
function closeSettingsModal() {
  elements.settingsModal.classList.remove('open');
}
function updateAPIStatusUI() {
  if (state.apiKey) {
    elements.apiStatusDisplay.className = 'api-status-badge status-connected';
    elements.apiStatusDisplay.textContent = 'OMDb API Key Connected';
  } else {
    elements.apiStatusDisplay.className = 'api-status-badge status-disconnected';
    elements.apiStatusDisplay.textContent = 'Mock Mode Active';
  }
}

function saveSettings() {
  const newKey = elements.apiKeyInput.value.trim();
  state.apiKey = newKey;
  if (newKey) {
    localStorage.setItem('cinespace_api_key', newKey);
    showToast('API Key saved successfully.', 'success');
  } else {
    localStorage.removeItem('cinespace_api_key');
    showToast('Switched to Mock Mode.', 'success');
  }
  
  updateAPIStatusUI();
  closeSettingsModal();
  loadDiscoverMovies();
}
function resetSettings() {
  elements.apiKeyInput.value = '';
  state.apiKey = '';
  localStorage.removeItem('cinespace_api_key');
  updateAPIStatusUI();
  closeSettingsModal();
  showToast('API Settings cleared.', 'success');
  loadDiscoverMovies();
}
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`;
  }
  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  toast.offsetHeight;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
document.addEventListener('DOMContentLoaded', init);