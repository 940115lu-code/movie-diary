let currentFilter = "all";

let currentSlide = 0;
let upcomingSlide = 0;

let carouselTimer = null;
let upcomingTimer = null;

/* =========================
   Helpers
========================= */

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
  return `
    <img
      src="${posterPath(movie)}"
      alt="${movie.title} poster"
      loading="lazy"
      onerror="this.classList.add('is-missing')"
    />
  `;
}

function getScoreClass(rating) {
  if (!rating) return "score-empty";
  if (rating >= 9) return "score-master";
  if (rating >= 7) return "score-good";
  if (rating >= 6) return "score-mid";
  return "score-low";
}

function scoreLabel(rating) {
  return rating ? rating.toFixed(1) : "TBA";
}

function hypeStars(hype) {
  const safeHype = Math.max(0, Math.min(5, Number(hype) || 0));
  const fullStars = Math.floor(safeHype);
  const hasHalfStar = safeHype % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return `
    <span class="hype-stars" aria-label="${safeHype} out of 5">
      ${"<span class='star full'>★</span>".repeat(fullStars)}
      ${hasHalfStar ? "<span class='star half'>★</span>" : ""}
      ${"<span class='star empty'>★</span>".repeat(emptyStars)}
    </span>
  `;
}

function parseMovieDate(dateText) {
  const timestamp = Date.parse(dateText);

  if (Number.isNaN(timestamp)) {
    return Infinity;
  }

  return timestamp;
}

/* =========================
   Movie Data
========================= */

function getWatchedMovies() {
  return movies.filter(movie => typeof movie.rating === "number" && movie.rating > 0);
}

function getTopFive() {
  return [...getWatchedMovies()]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;

      const dateDiff = parseMovieDate(b.date) - parseMovieDate(a.date);
      if (dateDiff !== 0) return dateDiff;

      return a.title.localeCompare(b.title);
    })
    .slice(0, 5);
}

function getSortedUpcomingMovies() {
  if (typeof upcomingMovies === "undefined") return [];

  return [...upcomingMovies].sort((a, b) => {
    const dateA = parseMovieDate(a.releaseDate);
    const dateB = parseMovieDate(b.releaseDate);

    if (dateA !== dateB) return dateA - dateB;

    return a.title.localeCompare(b.title);
  });
}

/* =========================
   Stats
========================= */

function updateStats() {
  const watched = getWatchedMovies();

  const avg =
    watched.reduce((sum, movie) => sum + movie.rating, 0) /
    (watched.length || 1);

  const highest = watched.reduce(
    (max, movie) => Math.max(max, movie.rating),
    0
  );

  document.getElementById("movieCount").textContent = watched.length;
  document.getElementById("averageRating").textContent = avg.toFixed(1);
  document.getElementById("highestRating").textContent = highest.toFixed(1);
}

/* =========================
   Upcoming Carousel
========================= */

function renderUpcoming() {
  const carousel = document.getElementById("upcomingCarousel");
  const dots = document.getElementById("upcomingDots");
  const sortedUpcoming = getSortedUpcomingMovies();

  if (!carousel || !dots || sortedUpcoming.length === 0) return;

  upcomingSlide = 0;

  carousel.innerHTML = `
    <div class="upcoming-track">
      ${sortedUpcoming.map(movie => `
        <article class="top-slide">
          <div class="top-poster">
            ${posterImage(movie)}
          </div>

          <div>
            <p class="top-rank">Coming Soon</p>
            <h3>${movie.title}</h3>

            <p class="review">
              Release Date · ${movie.releaseDate}
            </p>

            <p class="hype-label">HYPE LEVEL</p>
            ${hypeStars(movie.hype)}
          </div>
        </article>
      `).join("")}
    </div>
  `;

  dots.innerHTML = sortedUpcoming.map((_, index) => `
    <button
      class="${index === 0 ? "active" : ""}"
      data-upcoming="${index}"
      aria-label="Go to upcoming movie ${index + 1}"
    ></button>
  `).join("");

  dots.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      upcomingSlide = Number(button.dataset.upcoming);
      updateUpcomingCarousel(sortedUpcoming.length);
      restartUpcomingCarousel(sortedUpcoming.length);
    });
  });

  const prevButton = document.querySelector(".upcoming-prev");
  const nextButton = document.querySelector(".upcoming-next");

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      upcomingSlide =
        (upcomingSlide - 1 + sortedUpcoming.length) % sortedUpcoming.length;

      updateUpcomingCarousel(sortedUpcoming.length);
      restartUpcomingCarousel(sortedUpcoming.length);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      upcomingSlide = (upcomingSlide + 1) % sortedUpcoming.length;

      updateUpcomingCarousel(sortedUpcoming.length);
      restartUpcomingCarousel(sortedUpcoming.length);
    });
  }

  startUpcomingCarousel(sortedUpcoming.length);
}

function updateUpcomingCarousel(total = getSortedUpcomingMovies().length) {
  const track = document.querySelector(".upcoming-track");
  const dots = document.querySelectorAll("#upcomingDots button");

  if (!track || total <= 0) return;

  upcomingSlide = upcomingSlide % total;

  track.style.transform = `translateX(-${upcomingSlide * 100}%)`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === upcomingSlide);
  });
}

function startUpcomingCarousel(total = getSortedUpcomingMovies().length) {
  if (total <= 1) return;

  upcomingTimer = setInterval(() => {
    upcomingSlide = (upcomingSlide + 1) % total;
    updateUpcomingCarousel(total);
  }, 4200);
}

function restartUpcomingCarousel(total = getSortedUpcomingMovies().length) {
  clearInterval(upcomingTimer);
  startUpcomingCarousel(total);
}

/* =========================
   Top Five Carousel
========================= */

function renderTopFive() {
  const top = getTopFive();
  const carousel = document.getElementById("topCarousel");
  const dots = document.getElementById("carouselDots");

  carousel.innerHTML = `
    <div class="top-track">
      ${top.map((movie, index) => `
        <article class="top-slide">
          <div class="top-poster">
            ${posterImage(movie)}
          </div>

          <div>
            <p class="top-rank">No. ${index + 1}</p>
            <h3>${movie.title}</h3>
            <span class="rating ${getScoreClass(movie.rating)}">
              ${scoreLabel(movie.rating)}
            </span>
            <p class="review">${movie.review || "No notes yet."}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  dots.innerHTML = top.map((_, index) => `
    <button
      class="${index === 0 ? "active" : ""}"
      data-slide="${index}"
      aria-label="Go to slide ${index + 1}"
    ></button>
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
  const dots = document.querySelectorAll("#carouselDots button");

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

/* =========================
   Movie Diary
========================= */

function renderMovies() {
  const grid = document.getElementById("movieGrid");
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

  let filtered = movies
    .filter(movie => {
      const matchesKeyword =
        movie.title.toLowerCase().includes(keyword) ||
        (movie.review || "").toLowerCase().includes(keyword);

      const isWatched =
        typeof movie.rating === "number" &&
        movie.rating > 0;

      if (currentFilter === "masterpiece") {
        return matchesKeyword && isWatched && movie.rating >= 9;
      }

      if (currentFilter === "great") {
        return matchesKeyword && isWatched && movie.rating >= 7 && movie.rating < 9;
      }

      if (currentFilter === "mid") {
        return matchesKeyword && isWatched && movie.rating >= 6 && movie.rating < 7;
      }

      if (currentFilter === "low") {
        return matchesKeyword && isWatched && movie.rating < 6;
      }

      return matchesKeyword;
    })
    .sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }

      const dateDiff = parseMovieDate(b.date) - parseMovieDate(a.date);
      if (dateDiff !== 0) return dateDiff;

      return a.title.localeCompare(b.title);
    });

  grid.innerHTML = filtered.map(movie => `
    <article class="movie-card" data-title="${movie.title}">
      <div class="poster-wrap">
        ${posterImage(movie)}
      </div>

      <div class="movie-info">
        <h3>${movie.title}</h3>

        <div class="movie-meta">
          <span>${movie.date || "TBA"}</span>
          <span class="movie-score ${getScoreClass(movie.rating)}">
            ${scoreLabel(movie.rating)}
          </span>
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
  
/*hhhhhhhhhh
  
*/
document.querySelectorAll(".movie-info h3").forEach(title => {

  let size = 16;

  title.style.fontSize = size + "px";

  while (
    title.scrollWidth > title.clientWidth &&
    size > 11
  ) {
    size--;
    title.style.fontSize = size + "px";
  }

});
}

/* =========================
   Dialog
========================= */

function openDialog(movie) {
  const dialog = document.getElementById("movieDialog");

  document.getElementById("dialogContent").innerHTML = `
    <div class="dialog-layout">
      <div class="poster-wrap">
        ${posterImage(movie)}
      </div>

      <div>
        <p class="eyebrow">Film notes</p>
        <h3>${movie.title}</h3>
        <span class="rating ${getScoreClass(movie.rating)}">
          ${scoreLabel(movie.rating)}
        </span>
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

/* =========================
   Filters / Search
========================= */

document.getElementById("searchInput").addEventListener("input", renderMovies);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderMovies();
  });
});

/* =========================
   Init
========================= */

updateStats();
renderUpcoming();
renderTopFive();
renderMovies();