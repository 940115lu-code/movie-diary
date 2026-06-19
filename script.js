let currentFilter = "all";
let currentSlide = 0;
let carouselTimer = null;

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function posterPath(movie) {
  return movie.poster || `posters/${slugifyTitle(movie.title)}.jpg`;
}

function posterImage(movie) {
  return `<img src="${posterPath(movie)}" alt="${movie.title} poster" loading="lazy" onerror="this.classList.add('is-missing')" />`;
}

function getScoreClass(rating) {
  if (!rating) return "score-empty";
  if (rating >= 9) return "score-master";
  if (rating >= 7) return "score-good";
  return "score-low";
}

function scoreLabel(rating) {
  return rating ? rating.toFixed(1) : "TBA";
}

function getWatchedMovies() {
  return movies.filter(movie => typeof movie.rating === "number" && movie.rating > 0);
}

function getTopFive() {
  return [...getWatchedMovies()]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
}

function updateStats() {
  const watched = getWatchedMovies();
  const avg = watched.reduce((sum, movie) => sum + movie.rating, 0) / (watched.length || 1);
  const highest = watched.reduce((max, movie) => Math.max(max, movie.rating), 0);

  document.getElementById("movieCount").textContent = watched.length;
  document.getElementById("averageRating").textContent = avg.toFixed(1);
  document.getElementById("highestRating").textContent = highest.toFixed(1);
}

function renderTopFive() {
  const top = getTopFive();
  const carousel = document.getElementById("topCarousel");
  const dots = document.getElementById("carouselDots");

  carousel.innerHTML = `
    <div class="top-track">
      ${top.map((movie, index) => `
        <article class="top-slide">
          <div class="top-poster">${posterImage(movie)}</div>
          <div>
            <p class="top-rank">No. ${index + 1}</p>
            <h3>${movie.title}</h3>
            <span class="rating ${getScoreClass(movie.rating)}">${scoreLabel(movie.rating)}</span>
            <p class="review">${movie.review || "No notes yet."}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  dots.innerHTML = top.map((_, index) => `
    <button class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Go to slide ${index + 1}"></button>
  `).join("");

  dots.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      currentSlide = Number(button.dataset.slide);
      updateCarousel();
      restartCarousel();
    });
  });

  document.querySelector(".prev").addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + top.length) % top.length;
    updateCarousel();
    restartCarousel();
  });

  document.querySelector(".next").addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % top.length;
    updateCarousel();
    restartCarousel();
  });

  startCarousel();
}

function updateCarousel() {
  const track = document.querySelector(".top-track");
  const dots = document.querySelectorAll(".carousel-dots button");

  if (!track) return;

  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

function startCarousel() {
  const topLength = getTopFive().length;

  if (topLength <= 1) return;

  carouselTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % topLength;
    updateCarousel();
  }, 3600);
}

function restartCarousel() {
  clearInterval(carouselTimer);
  startCarousel();
}

function renderMovies() {
  const grid = document.getElementById("movieGrid");
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

  let filtered = movies.filter(movie => {
    const matchesKeyword =
      movie.title.toLowerCase().includes(keyword) ||
      (movie.review || "").toLowerCase().includes(keyword);

    const isWatched = typeof movie.rating === "number" && movie.rating > 0;

    if (currentFilter === "top") return matchesKeyword && isWatched && movie.rating >= 8;
    if (currentFilter === "watched") return matchesKeyword && isWatched;

    return matchesKeyword;
  }).sort((a, b) => (b.rating || 0) - (a.rating || 0));

  grid.innerHTML = filtered.map(movie => `
    <article class="movie-card" data-title="${movie.title}">
      <div class="poster-wrap">${posterImage(movie)}</div>

      <div class="movie-info">
        <h3>${movie.title}</h3>

        <div class="movie-meta">
          <span>${movie.date || "TBA"}</span>
          <span class="movie-score ${getScoreClass(movie.rating)}">${scoreLabel(movie.rating)}</span>
        </div>

        <p class="mini-review">${movie.review || "No notes yet."}</p>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", () => {
      const movie = movies.find(item => item.title === card.dataset.title);
      openDialog(movie);
    });
  });
}

function openDialog(movie) {
  const dialog = document.getElementById("movieDialog");

  document.getElementById("dialogContent").innerHTML = `
    <div class="dialog-layout">
      <div class="poster-wrap">${posterImage(movie)}</div>

      <div>
        <p class="eyebrow">Film notes</p>
        <h3>${movie.title}</h3>
        <span class="rating ${getScoreClass(movie.rating)}">${scoreLabel(movie.rating)}</span>
        <p class="review">${movie.review || "No notes yet."}</p>
        <p class="movie-meta">${movie.date || "TBA"}</p>
      </div>
    </div>
  `;

  dialog.showModal();
}

document.getElementById("closeDialog").addEventListener("click", () => {
  document.getElementById("movieDialog").close();
});

document.getElementById("searchInput").addEventListener("input", renderMovies);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderMovies();
  });
});

updateStats();
renderTopFive();
renderMovies();