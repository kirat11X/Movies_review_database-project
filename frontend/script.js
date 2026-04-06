const config = window.MovieAppConfig;

const elements = {
    filter: document.getElementById("filter"),
    list: document.querySelector(".list"),
    order: document.getElementById("order"),
    search: document.getElementById("search-input"),
    summaryKicker: document.getElementById("summary-kicker"),
    summaryText: document.getElementById("summary-text"),
    summaryTitle: document.getElementById("summary-title"),
    form: document.getElementById("form"),
};

const state = {
    order: elements.order.value,
    rawMovies: [],
    searchTerm: "",
    sort: elements.filter.value,
};

elements.form.addEventListener("submit", handleSearchSubmit);
elements.filter.addEventListener("change", handleSortChange);
elements.order.addEventListener("change", handleSortChange);
elements.search.addEventListener("search", handleSearchReset);
elements.search.addEventListener("input", handleSearchReset);

loadMovies();

async function loadMovies() {
    renderState("Loading movies...");

    try {
        const url = state.searchTerm
            ? config.buildSearchUrl(state.searchTerm)
            : config.buildDiscoverUrl(state.sort, state.order);
        const payload = await config.fetchJson(url);

        state.rawMovies = Array.isArray(payload.results) ? payload.results : [];
        renderMovies(sortMovies(state.rawMovies));
    } catch (error) {
        renderState("We couldn't load movies right now. Please try again in a moment.", true);
        console.error(error);
    }
}

function handleSearchSubmit(event) {
    event.preventDefault();

    state.searchTerm = elements.search.value.trim();
    loadMovies();
}

function handleSearchReset() {
    if (elements.search.value.trim() || !state.searchTerm) {
        return;
    }

    state.searchTerm = "";
    loadMovies();
}

function handleSortChange() {
    state.sort = elements.filter.value;
    state.order = elements.order.value;

    if (state.searchTerm) {
        renderMovies(sortMovies(state.rawMovies));
        return;
    }

    loadMovies();
}

function sortMovies(movies) {
    const direction = state.order === "ascending" ? 1 : -1;

    return [...movies].sort((leftMovie, rightMovie) => {
        const leftValue = getSortValue(leftMovie);
        const rightValue = getSortValue(rightMovie);

        if (leftValue === rightValue) {
            return 0;
        }

        return leftValue > rightValue ? direction : -direction;
    });
}

function getSortValue(movie) {
    switch (state.sort) {
        case "release_date":
            return movie.release_date ? new Date(movie.release_date).getTime() : 0;
        case "rating":
            return Number.isFinite(movie.vote_average) ? movie.vote_average : 0;
        case "popularity":
        default:
            return Number.isFinite(movie.popularity) ? movie.popularity : 0;
    }
}

function renderMovies(movies) {
    updateSummary(movies.length);

    if (!movies.length) {
        renderState("No movies matched that search. Try another title or clear the search bar.");
        return;
    }

    const row = document.createElement("div");
    row.className = "row";

    movies.forEach((movie) => {
        row.appendChild(createMovieCard(movie));
    });

    elements.list.replaceChildren(row);
}

function createMovieCard(movie) {
    const column = document.createElement("article");
    column.className = "column";

    const link = document.createElement("a");
    link.className = "movie-card-link";
    link.href = config.buildMoviePageUrl(movie.id);
    link.setAttribute("aria-label", `Open ${movie.title} details and reviews`);
    link.addEventListener("click", () => {
        config.saveSelectedMovie(movie);
    });

    const card = document.createElement("div");
    card.className = "card";

    const posterShell = document.createElement("div");
    posterShell.className = "poster-shell";

    const movieYear = document.createElement("span");
    movieYear.className = "movie-year";
    movieYear.textContent = config.getReleaseYear(movie.release_date);
    posterShell.appendChild(movieYear);

    if (movie.poster_path) {
        const image = document.createElement("img");
        image.className = "thumbnail";
        image.src = config.buildImageUrl(movie.poster_path, "w780");
        image.alt = `${movie.title} poster`;
        posterShell.appendChild(image);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "thumbnail thumbnail--placeholder";
        placeholder.textContent = "Poster unavailable";
        posterShell.appendChild(placeholder);
    }

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const meta = document.createElement("div");
    meta.className = "movie-meta";

    const ratingChip = document.createElement("span");
    ratingChip.className = "chip";
    ratingChip.textContent = `TMDB ${config.formatRating(movie.vote_average)}`;

    const releaseChip = document.createElement("span");
    releaseChip.className = "chip";
    releaseChip.textContent = config.formatDate(movie.release_date);

    meta.append(ratingChip, releaseChip);

    const overview = document.createElement("p");
    overview.className = "movie-overview";
    overview.textContent = config.truncate(
        movie.overview || "Open the detail page to add your own review and see what other viewers are saying.",
        120
    );

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const footerLabel = document.createElement("span");
    footerLabel.textContent = "Expanded details and reviews";

    const callToAction = document.createElement("span");
    callToAction.className = "cta";
    callToAction.textContent = "Open movie";

    footer.append(footerLabel, callToAction);

    card.append(posterShell, title, meta, overview, footer);
    link.appendChild(card);
    column.appendChild(link);

    return column;
}

function updateSummary(movieCount) {
    if (state.searchTerm) {
        elements.summaryKicker.textContent = "Search results";
        elements.summaryTitle.textContent = `${movieCount} result${movieCount === 1 ? "" : "s"} for "${state.searchTerm}"`;
        elements.summaryText.textContent = "Pick a title to open the larger movie view, then read, post, or delete reviews through your backend API.";
        return;
    }

    const filterLabels = {
        popularity: "Most talked-about picks",
        release_date: "Fresh release radar",
        rating: "High-score shortlist",
    };

    const orderLabel = state.order === "ascending" ? "sorted low to high" : "sorted high to low";

    elements.summaryKicker.textContent = "Now browsing";
    elements.summaryTitle.textContent = `${filterLabels[state.sort]} with ${orderLabel}`;
    elements.summaryText.textContent = "Every card opens a dedicated movie page with an enlarged hero treatment and a live review feed backed by MongoDB.";
}

function renderState(message, isError = false) {
    const stateCard = document.createElement("div");
    stateCard.className = isError ? "list-state list-state--error" : "list-state";
    stateCard.textContent = message;

    elements.list.replaceChildren(stateCard);
}
