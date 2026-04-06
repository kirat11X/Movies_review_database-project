# Movies Review Database Project

A movie review web app with:

- a static frontend for browsing movies and opening a dedicated movie page
- a Node.js / Express backend API for reviews
- MongoDB for storing user reviews

## Live Links

- Frontend: https://movies-review-database-project-fv93.onrender.com/
- Backend: https://movies-review-database-project.onrender.com/

## Project Structure

- `frontend/`
  Static frontend files for the movie catalogue and movie detail page.
- `backend/`
  Express API for creating, fetching, updating, and deleting movie reviews.

## Features

- Browse and search movies using TMDB
- Open an individual movie page with a larger poster and detailed layout
- Fetch reviews for a movie from the backend API
- Post new reviews
- Delete reviews from the frontend flow
- Store reviews in MongoDB

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Deployment: Render

## Local Setup

### Backend

1. Go to the backend folder:

```bash
cd backend
```

2. Create a local `.env` file.

3. Add:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

4. Install dependencies and run:

```bash
npm install
npm run dev
```

### Frontend

1. Go to the frontend folder.
2. Create `config.local.js` from `config.local.example.js`.
3. Add your values:

```js
window.__MOVIE_APP_CONFIG__ = {
    tmdbApiKey: "YOUR_TMDB_API_KEY",
    backendOrigin: "http://localhost:8000",
};
```

4. Open `frontend/index.html` in the browser.

## Render Deployment

### Backend Service

- Root Directory: leave empty or use repo root with commands below
- Build Command:

```bash
cd backend && npm install
```

- Start Command:

```bash
cd backend && npm start
```

- Environment Variables:

```env
MONGODB_URI=your_mongodb_connection_string
```

### Frontend Static Site

- Root Directory:

```txt
frontend
```

- Build Command:

```bash
printf 'window.__MOVIE_APP_CONFIG__ = {\n  tmdbApiKey: "%s",\n  backendOrigin: "%s"\n};\n' "$TMDB_API_KEY" "$BACKEND_ORIGIN" > config.local.js
```

- Publish Directory:

```txt
./
```

- Environment Variables:

```env
TMDB_API_KEY=your_tmdb_key
BACKEND_ORIGIN=https://movies-review-database-project.onrender.com
```

## What I Built Myself

These are the parts that are reasonably yours to claim:

- The original project idea and repo setup
- The frontend/backend split for the app
- The base movie review project direction
- The MongoDB-backed review API structure already present in the backend
- The original basic frontend and backend work this version builds on

## What AI Helped With

These are the parts that were significantly AI-assisted:

- The improved frontend structure and UI polish
- The dedicated `movie.html` detail experience
- The review section integration on the movie page
- The frontend logic for fetching reviews, posting reviews, and deleting reviews
- The frontend config setup for deployment
- The repo hygiene improvements like ignore rules and README cleanup

## Brutally Honest Authorship Note

- This is not a fully hand-written-from-scratch project by one person anymore.
- The backend idea and original project direction came from me.
- The newer frontend experience and deployment cleanup were heavily assisted by AI.
- If i describe this project publicly, the most accurate statement is:
  "I built the original movie review project and used AI assistance to improve the frontend, deployment setup, and project polish."

## Security and Deployment Notes

Before calling this production-ready, these issues still matter:

- The backend review API does not have real authentication.
- Ownership checks for update/delete are not enforced server-side.
- CORS is open in the backend.
- There is no rate limiting or abuse protection yet.
- A static frontend cannot truly hide a TMDB API key from browser users.

`npm audit` currently reports 0 known production dependency vulnerabilities for the backend packages, but that does not solve the application-level issues above.
