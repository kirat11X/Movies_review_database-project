const config = window.MovieAppConfig;
const movieId = new URLSearchParams(window.location.search).get("id");

const elements = {
    formStatus: document.getElementById("form-status"),
    movieBackdrop: document.getElementById("movie-backdrop"),
    movieFacts: document.getElementById("movie-facts"),
    movieKicker: document.getElementById("movie-kicker"),
    movieOverview: document.getElementById("movie-overview"),
    moviePoster: document.getElementById("movie-poster"),
    movieTagline: document.getElementById("movie-tagline"),
    movieTitle: document.getElementById("movie-title"),
    pageTitle: document.getElementById("page-title"),
    posterButton: document.getElementById("poster-button"),
    posterHint: document.getElementById("poster-hint"),
    posterModal: document.getElementById("poster-modal"),
    posterModalBackdrop: document.getElementById("poster-modal-backdrop"),
    posterModalImage: document.getElementById("poster-modal-image"),
    modalCloseButton: document.getElementById("modal-close-button"),
    reviewCount: document.getElementById("review-count"),
    reviewForm: document.getElementById("review-form"),
    reviewIntro: document.getElementById("review-intro"),
    reviewSubmit: document.getElementById("review-submit"),
    reviewText: document.getElementById("review-text"),
    reviewUser: document.getElementById("review-user"),
    reviewsList: document.getElementById("reviews-list"),
    reviewsState: document.getElementById("reviews-state"),
};

const state = {
    currentUser: config.getReviewUser(),
    movie: null,
    reviews: [],
};

elements.reviewUser.value = state.currentUser;

elements.reviewForm.addEventListener("submit", handleReviewSubmit);
elements.reviewUser.addEventListener("input", handleReviewUserInput);
elements.posterButton.addEventListener("click", openPosterModal);
elements.posterModalBackdrop.addEventListener("click", closePosterModal);
elements.modalCloseButton.addEventListener("click", closePosterModal);
window.addEventListener("keydown", handleKeydown);

initializePage();

async function initializePage() {
    if (!movieId) {
        renderMovieError("No movie was selected. Go back and choose a movie from the catalogue.");
        setReviewsState("Select a movie from the main page to load reviews.", true);
        return;
    }

    const storedMovie = config.getSelectedMovie();

    if (storedMovie && String(storedMovie.id) === movieId) {
        state.movie = storedMovie;
        renderMovie(storedMovie);
    }

    await Promise.all([loadMovie(), loadReviews()]);
}

async function loadMovie() {
    try {
        const movie = await config.fetchJson(config.buildMovieDetailsUrl(movieId));
        state.movie = movie;
        config.saveSelectedMovie(movie);
        renderMovie(movie);
    } catch (error) {
        if (!state.movie) {
            renderMovieError("We couldn't load this movie from TMDB right now.");
        }

        console.error(error);
    }
}

async function loadReviews() {
    setReviewsState("Loading reviews from the backend...");

    try {
        const reviews = await config.fetchJson(config.buildReviewsApiUrl(`/movie/${movieId}`));
        state.reviews = Array.isArray(reviews) ? reviews : [];
        renderReviews();
    } catch (error) {
        state.reviews = [];
        elements.reviewCount.textContent = "Reviews unavailable";
        elements.reviewIntro.textContent = "The movie page is ready, but the review API could not be reached. Make sure the backend server is running on port 8000.";
        setReviewsState("Couldn't reach the review API. Start the backend and reload this page.", true);
        console.error(error);
    }
}

function renderMovie(movie) {
    const title = movie.title || "Movie detail";
    const tagline = movie.tagline || "A focused movie page with a bigger visual treatment and live reviews from your backend.";
    const overview = movie.overview || "No overview was provided for this title, but you can still use the review tools below.";
    const backdropPath = movie.backdrop_path || movie.poster_path;
    const genres = Array.isArray(movie.genres) && movie.genres.length
        ? movie.genres.map((genre) => genre.name).join(" / ")
        : "Featured title";

    document.title = `${title} | Movie Site`;
    elements.pageTitle.textContent = title;
    elements.movieKicker.textContent = genres;
    elements.movieTitle.textContent = title;
    elements.movieTagline.textContent = tagline;
    elements.movieTagline.classList.toggle("is-muted", !movie.tagline);
    elements.movieOverview.textContent = overview;

    renderMovieFacts(movie);
    renderPoster(movie);

    if (backdropPath) {
        const backdropUrl = config.buildImageUrl(backdropPath, "w1280");
        elements.movieBackdrop.style.backgroundImage = `linear-gradient(180deg, rgba(6, 12, 21, 0.18), rgba(6, 12, 21, 0.18)), url("${backdropUrl}")`;
    } else {
        elements.movieBackdrop.style.backgroundImage = "linear-gradient(135deg, rgba(20, 46, 78, 0.78), rgba(6, 12, 21, 0.96))";
    }
}

function renderMovieFacts(movie) {
    const facts = [
        `TMDB ${config.formatRating(movie.vote_average)}`,
        config.formatDate(movie.release_date),
        config.formatRuntime(movie.runtime),
        movie.original_language ? movie.original_language.toUpperCase() : "Language n/a",
    ];

    elements.movieFacts.replaceChildren(
        ...facts.map((fact) => {
            const chip = document.createElement("span");
            chip.className = "fact-chip";
            chip.textContent = fact;
            return chip;
        })
    );
}

function renderPoster(movie) {
    const posterUrl = config.buildImageUrl(movie.poster_path, "w780");
    const fullPosterUrl = config.buildImageUrl(movie.poster_path, "original");
    const posterAlt = movie.title ? `${movie.title} poster` : "Movie poster";

    if (!posterUrl) {
        elements.posterButton.classList.add("is-placeholder", "is-disabled");
        elements.posterHint.textContent = "Poster unavailable";
        elements.moviePoster.removeAttribute("src");
        elements.moviePoster.alt = "Poster unavailable";
        elements.posterModalImage.removeAttribute("src");
        elements.posterModalImage.alt = "Poster unavailable";
        return;
    }

    elements.posterButton.classList.remove("is-placeholder", "is-disabled");
    elements.posterHint.textContent = "Click to enlarge";
    elements.moviePoster.src = posterUrl;
    elements.moviePoster.alt = posterAlt;
    elements.posterModalImage.src = fullPosterUrl;
    elements.posterModalImage.alt = posterAlt;
}

function renderMovieError(message) {
    document.title = "Movie Detail | Movie Site";
    elements.pageTitle.textContent = "Movie detail unavailable";
    elements.movieKicker.textContent = "Missing movie";
    elements.movieTitle.textContent = "We couldn't load that movie";
    elements.movieTagline.textContent = "Head back to the catalogue and pick another title.";
    elements.movieTagline.classList.add("is-muted");
    elements.movieOverview.textContent = message;
    elements.movieFacts.replaceChildren();
    elements.posterButton.classList.add("is-placeholder", "is-disabled");
    elements.posterHint.textContent = "Poster unavailable";
    elements.movieBackdrop.style.backgroundImage = "linear-gradient(135deg, rgba(20, 46, 78, 0.78), rgba(6, 12, 21, 0.96))";
}

function renderReviews() {
    const count = state.reviews.length;
    elements.reviewCount.textContent = `${count} review${count === 1 ? "" : "s"}`;
    elements.reviewIntro.textContent = count
        ? "Fresh from your MongoDB-backed API. Use the same name to delete your own review from this screen."
        : "No reviews yet. Start the conversation with the first one.";

    elements.reviewsList.replaceChildren();

    if (!count) {
        setReviewsState("No reviews yet. Be the first person to post one for this movie.");
        return;
    }

    elements.reviewsState.hidden = true;
    elements.reviewsState.classList.remove("is-error");
    elements.reviewsState.textContent = "";

    const reviewCards = state.reviews.map((review, index) => createReviewCard(review, index));
    elements.reviewsList.replaceChildren(...reviewCards);
}

function createReviewCard(review, index) {
    const card = document.createElement("article");
    card.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-card-header";

    const author = document.createElement("div");
    author.className = "review-author";

    const avatar = document.createElement("div");
    avatar.className = "review-avatar";
    avatar.textContent = (review.user || "?").trim().charAt(0).toUpperCase() || "?";

    const meta = document.createElement("div");
    meta.className = "review-meta";

    const userName = document.createElement("h4");
    userName.textContent = review.user || "Anonymous viewer";

    const reviewLabel = document.createElement("p");
    reviewLabel.textContent = `Review ${index + 1}`;

    meta.append(userName, reviewLabel);
    author.append(avatar, meta);
    header.appendChild(author);

    if (canDeleteReview(review)) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "review-delete";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete review";
        deleteButton.addEventListener("click", () => handleDeleteReview(review._id, deleteButton));
        header.appendChild(deleteButton);
    }

    const body = document.createElement("p");
    body.className = "review-body";
    body.textContent = review.review || "No review text was saved for this entry.";

    card.append(header, body);
    return card;
}

function canDeleteReview(review) {
    if (!state.currentUser) {
        return false;
    }

    return review.user && review.user.trim().toLowerCase() === state.currentUser.trim().toLowerCase();
}

async function handleReviewSubmit(event) {
    event.preventDefault();

    const user = elements.reviewUser.value.trim();
    const reviewText = elements.reviewText.value.trim();

    if (!user || !reviewText) {
        setFormStatus("Add your name and a review before posting.", true);
        return;
    }

    const payload = {
        movieId: Number(movieId),
        review: reviewText,
        user,
    };

    if (Number.isNaN(payload.movieId)) {
        setFormStatus("This movie id is invalid, so the review could not be posted.", true);
        return;
    }

    state.currentUser = user;
    config.setReviewUser(user);
    setSubmittingState(true, "Posting review...");

    try {
        await config.fetchJson(config.buildReviewsApiUrl("/new"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        elements.reviewText.value = "";
        setFormStatus("Review posted. Reloading the review feed...");
        await loadReviews();
    } catch (error) {
        setFormStatus("Couldn't post the review. Make sure the backend is running and try again.", true);
        console.error(error);
    } finally {
        setSubmittingState(false);
    }
}

async function handleDeleteReview(reviewId, button) {
    const shouldDelete = window.confirm("Delete this review?");

    if (!shouldDelete) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        await config.fetchJson(config.buildReviewsApiUrl(`/${reviewId}`), {
            method: "DELETE",
        });

        setFormStatus("Review deleted.");
        await loadReviews();
    } catch (error) {
        setFormStatus("Couldn't delete that review. Please try again.", true);
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = "Delete review";
    }
}

function handleReviewUserInput(event) {
    state.currentUser = event.target.value.trim();
    config.setReviewUser(state.currentUser);

    if (state.reviews.length) {
        renderReviews();
    }
}

function setReviewsState(message, isError = false) {
    elements.reviewsState.hidden = false;
    elements.reviewsState.textContent = message;
    elements.reviewsState.classList.toggle("is-error", isError);
    elements.reviewsList.replaceChildren();
}

function setFormStatus(message, isError = false) {
    elements.formStatus.textContent = message;
    elements.formStatus.classList.toggle("is-error", isError);
}

function setSubmittingState(isSubmitting, statusMessage = "") {
    elements.reviewSubmit.disabled = isSubmitting;
    elements.reviewSubmit.textContent = isSubmitting ? "Posting..." : "Post review";

    if (statusMessage) {
        setFormStatus(statusMessage, false);
    }
}

function openPosterModal() {
    if (elements.posterButton.classList.contains("is-disabled")) {
        return;
    }

    elements.posterModal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closePosterModal() {
    elements.posterModal.hidden = true;
    document.body.style.overflow = "";
}

function handleKeydown(event) {
    if (event.key === "Escape" && !elements.posterModal.hidden) {
        closePosterModal();
    }
}
