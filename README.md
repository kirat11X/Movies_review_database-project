# Movies Review Database Project

This project is a movie browser with a review backend backed by MongoDB. The frontend lets users browse movies from TMDB, open a dedicated movie page, read reviews from the backend API, post reviews, and delete their own reviews by matching the display name they entered.

## Run locally

Frontend:
- Open `frontend/index.html`
- Create `frontend/config.local.js` from `frontend/config.local.example.js`

Backend:
- Add your MongoDB connection settings in `backend/.env`
- Start the API from `backend/` with `npm run dev`

## Before you publish or deploy

These are the main security and repo-hygiene issues that still matter before GitHub, Render, or Vercel:

- The review API is not authenticated. Anyone who can reach the backend can post, update, or delete reviews by calling the endpoints directly.
- Delete and update authorization are not enforced server-side. The frontend hides delete buttons for other users, but the API itself does not verify ownership.
- CORS is fully open in the backend right now, so any origin can call the review API.
- There is no rate limiting, abuse protection, or input validation on review routes yet.
- A pure static frontend cannot truly keep a TMDB key secret. Moving the key out of tracked source helps GitHub hygiene, but for real secrecy you would need a backend or serverless proxy.
- `backend/node_modules` was committed to git. It should be removed from version control before publishing.
- `npm audit` currently reports 0 known production dependency vulnerabilities for the backend packages, but that does not fix the application-level issues listed above.

## Honest authorship note

What you did:
- You created the basic movie review project idea and repo.
- You already had the backend review API, MongoDB setup direction, and the split between frontend and backend.
- You made the original frontend and backend parts that this work builds on.

What AI did:
- I built the newer frontend movie-detail experience, including the enlarged movie page, review UI, review fetch/post/delete flow, and the newer styling system.
- I added frontend configuration helpers and moved the TMDB key out of tracked frontend source into a local config pattern.
- I added repo ignore rules and this README guidance.

Brutally honest version:
- This is not a production-secure app yet.
- The current backend is still the weak point, not the frontend.
- The new frontend polish and review UX are heavily AI-assisted.
- If you claim the whole implementation was fully hand-written by you, that would not be accurate.
