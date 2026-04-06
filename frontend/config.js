(function attachMovieAppConfig() {
    const runtimeConfig = window.__MOVIE_APP_CONFIG__ || {};
    const TMDB_API_KEY = runtimeConfig.tmdbApiKey || "";
    const TMDB_BASE_URL = "https://api.themoviedb.org/3";
    const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    const SELECTED_MOVIE_KEY = "movie-app:selected-movie";
    const REVIEW_USER_KEY = "movie-app:review-user";

    function getBackendOrigin() {
        if (runtimeConfig.backendOrigin) {
            return String(runtimeConfig.backendOrigin).replace(/\/$/, "");
        }

        const protocol = window.location.protocol === "file:" ? "http:" : window.location.protocol;
        const hostname = window.location.hostname || "localhost";
        return `${protocol}//${hostname}:8000`;
    }

    function buildReviewsApiUrl(path = "") {
        return `${getBackendOrigin()}/api/v1/reviews${path}`;
    }

    function buildDiscoverUrl(sort, order) {
        assertTmdbApiKey();

        const sortMap = {
            popularity: "popularity",
            release_date: "primary_release_date",
            rating: "vote_average",
        };

        const normalizedSort = sortMap[sort] || sortMap.popularity;
        const normalizedOrder = order === "ascending" ? "asc" : "desc";
        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
            page: "1",
            sort_by: `${normalizedSort}.${normalizedOrder}`,
        });

        if (normalizedSort === "vote_average") {
            params.set("vote_count.gte", "200");
        }

        return `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    }

    function buildSearchUrl(query) {
        assertTmdbApiKey();

        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
            query,
        });

        return `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
    }

    function buildMovieDetailsUrl(movieId) {
        assertTmdbApiKey();

        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
        });

        return `${TMDB_BASE_URL}/movie/${encodeURIComponent(movieId)}?${params.toString()}`;
    }

    function buildMoviePageUrl(movieId) {
        return `movie.html?id=${encodeURIComponent(movieId)}`;
    }

    function buildImageUrl(path, size = "w780") {
        return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : "";
    }

    function assertTmdbApiKey() {
        if (!TMDB_API_KEY) {
            throw new Error("TMDB API key missing. Create frontend/config.local.js from frontend/config.local.example.js.");
        }
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, options);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = payload.error || payload.status_message || "Request failed.";
            throw new Error(message);
        }

        return payload;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Release date unavailable";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Release date unavailable";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    }

    function formatRuntime(runtime) {
        if (!Number.isFinite(runtime) || runtime <= 0) {
            return "Runtime unavailable";
        }

        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;

        if (!hours) {
            return `${minutes}m`;
        }

        if (!minutes) {
            return `${hours}h`;
        }

        return `${hours}h ${minutes}m`;
    }

    function formatRating(voteAverage) {
        if (!Number.isFinite(voteAverage) || voteAverage <= 0) {
            return "N/A";
        }

        return voteAverage.toFixed(1);
    }

    function truncate(text, maxLength = 160) {
        if (!text || text.length <= maxLength) {
            return text || "";
        }

        return `${text.slice(0, maxLength).trimEnd()}...`;
    }

    function getReleaseYear(releaseDate) {
        return releaseDate ? releaseDate.slice(0, 4) : "TBA";
    }

    function saveSelectedMovie(movie) {
        try {
            window.sessionStorage.setItem(SELECTED_MOVIE_KEY, JSON.stringify(movie));
        } catch (error) {
            console.warn("Unable to store selected movie in session storage.", error);
        }
    }

    function getSelectedMovie() {
        try {
            const rawMovie = window.sessionStorage.getItem(SELECTED_MOVIE_KEY);
            return rawMovie ? JSON.parse(rawMovie) : null;
        } catch (error) {
            console.warn("Unable to read selected movie from session storage.", error);
            return null;
        }
    }

    function setReviewUser(user) {
        try {
            if (user) {
                window.localStorage.setItem(REVIEW_USER_KEY, user);
            } else {
                window.localStorage.removeItem(REVIEW_USER_KEY);
            }
        } catch (error) {
            console.warn("Unable to store review user locally.", error);
        }
    }

    function getReviewUser() {
        try {
            return window.localStorage.getItem(REVIEW_USER_KEY) || "";
        } catch (error) {
            console.warn("Unable to read saved review user.", error);
            return "";
        }
    }

    window.MovieAppConfig = {
        buildDiscoverUrl,
        buildImageUrl,
        buildMovieDetailsUrl,
        buildMoviePageUrl,
        buildReviewsApiUrl,
        buildSearchUrl,
        fetchJson,
        formatDate,
        formatRating,
        formatRuntime,
        getReleaseYear,
        getReviewUser,
        getSelectedMovie,
        saveSelectedMovie,
        setReviewUser,
        truncate,
    };
})();
