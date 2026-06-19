const grid = document.querySelector("#movieGrid");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter");
const dialog = document.querySelector("#movieDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector("#closeDialog");

let currentFilter = "all";

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

function posterHTML(movie, extraClass = "") {
  const tone = movie.posterTone || "mono";
  return `
    <div class="poster-wrap poster-${tone} ${extraClass}">
      <img src="${posterPath(movie)}" alt="${movie.title} poster" loading="lazy" onerror="this.classList.add('is-missing')" />
      <span>${movie.title}</span>
    </div>
  `;
}


function scoreClass(rating) {
  if (rating >= 9) return "score legendary";
  if (rating >= 8) return "score great";
  if (rating >= 7) return "score good";
  return "score low";
}

function renderStats() {
  const total = movies.length;
  const avg = movies.reduce((sum, movie) => sum + movie.rating, 0) / total;
  const waitCount = juneWatchlist.filter(item => !item.done).length;

  document.querySelector("#totalMovies").textContent = total;
  document.querySelector("#avgRating").textContent = avg.toFixed(1);
  document.querySelector("#watchlistCount").textContent = waitCount;
}

function renderSchedule() {
  document.querySelector("#scheduleList").innerHTML = schedule.map(item => `
    <article class="schedule-card">
      <div>
        <p class="date-text">${item.date}</p>
        <h3>${item.time}</h3>
      </div>
      <div>
        <p>${item.place}</p>
        <span class="pill">$${item.price}</span>
      </div>
      <small>${item.note}</small>
    </article>
  `).join("");
}

function renderJune() {
  document.querySelector("#juneList").innerHTML = juneWatchlist.map(item => `
    <article class="check-item ${item.done ? "done" : ""}">
      <span>${item.done ? "✓" : ""}</span>
      <div>
        <p>${item.date}</p>
        <h3>${item.title}</h3>
      </div>
    </article>
  `).join("");

  document.querySelector("#budgetList").innerHTML = budgetList.map((item, index) => `
    <article class="budget-item">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div>
        <p>${item.date}</p>
        <h3>${item.title}</h3>
        ${item.note ? `<small>${item.note}</small>` : ""}
      </div>
    </article>
  `).join("");
}

function renderTopList() {
  const topFive = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 5);
  document.querySelector("#topList").innerHTML = topFive.map((movie, index) => `
    <article class="top-row" onclick="openMovie(${movies.indexOf(movie)})">
      <span class="rank">#${index + 1}</span>
      <div>
        <h3>${movie.title}</h3>
        <p>${movie.date} · ${movie.review || "尚未寫心得"}</p>
      </div>
      <strong>${movie.rating}</strong>
    </article>
  `).join("");
}

function renderMovies() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filtered = movies.filter(movie => {
    const matchesFilter = currentFilter === "all" || movie.tags.includes(currentFilter);
    const searchable = `${movie.title} ${movie.date} ${movie.rating} ${movie.review}`.toLowerCase();
    return matchesFilter && searchable.includes(keyword);
  });

  grid.innerHTML = filtered.map(movie => `
    <article class="movie-card" onclick="openMovie(${movies.indexOf(movie)})">
      ${posterHTML(movie)}
      <div class="movie-info">
        <p>${movie.date}</p>
        <h3>${movie.title}</h3>
        <div class="${scoreClass(movie.rating)}">${movie.rating}</div>
        <p class="mini-review">${movie.review || "尚未寫心得"}</p>
      </div>
    </article>
  `).join("");
}

function openMovie(index) {
  const movie = movies[index];
  dialogContent.innerHTML = `
    <div class="dialog-layout">
      ${posterHTML(movie)}
      <div>
        <p class="eyebrow">${movie.date}</p>
        <h2>${movie.title}</h2>
        <div class="${scoreClass(movie.rating)}">${movie.rating}</div>
        <p class="review">${movie.review || "這部還沒有補心得。"}</p>
      </div>
    </div>
  `;
  dialog.showModal();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderMovies();
  });
});

searchInput.addEventListener("input", renderMovies);
closeDialog.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

renderStats();
renderSchedule();
renderJune();
renderTopList();
renderMovies();
