# CineSpace 🍿 // Premium Movie Finder

CineSpace is a premium, feature-rich movie search and curating application built purely using vanilla **HTML5, CSS3, and modern JavaScript**. It connects to the **OMDb API** to search the global cinematic databases, enrich metadata in real-time, and allow users to curate watchlists, store favorites, rate movies, and write persistent reviews.

---

## Key Features

1. **Vibrant & Glassmorphic UI:** A dark mode interface with neon purple accents, backdrop-blur components, hover transformations, and micro-animations.
2. **Dual Data Modes:**
   - **Mock Mode (Default):** Ready to test immediately without any setup. Serves a pre-selected set of critically acclaimed movies.
   - **OMDb Live Mode:** Connects to the live OMDb API using an API key.
3. **Smart Detail Enrichment:** When searching, CineSpace retrieves full details for all matching movies in parallel. This enables instant client-side filtering by genre and sorting by rating/year.
4. **Interactive Modal View:** Clicking on any movie displays a detailed profile including runtime, ratings (IMDb, Rotten Tomatoes, Metacritic), plot, cast, and custom reviews.
5. **Personal Watchlist & Favorites:** Save films to your list with bookmark/heart badges that persist across page reloads.
6. **Local Reviews Engine:** Write star ratings and reviews that are stored and rendered dynamically.

---

## File Structure

```
Movie Finder/
├── index.html           # Main structure, modals, templates, and SVG icons
├── style.css            # Custom CSS theme, variables, grid layouts, and animations
├── app.js               # Main business logic, API routing, and localStorage controllers
├── mockData.js          # Seed database containing mock popular movies for offline testing
├── config.js            # [NEW] Local configuration file containing OMDb API Key (Git-ignored)
├── .gitignore           # [NEW] Tells Git to ignore sensitive configuration files
└── README.md            # App manual
```

---

## How to Get an OMDb API Key

An API key is required to query live movies outside the mock database.
1. Visit [OMDb API Key Request](http://www.omdbapi.com/apikey.aspx).
2. Choose the **Free** tier (which allows up to 1,000 requests per day).
3. Fill out the form with your email.
4. Open the verification email sent to you to activate your key.

---

## Setup & Running Instructions

### Method 1: Secure Backend Server (Recommended)
This runs the Express backend proxy to secure your OMDb API key and serves the frontend assets:
1. Open a terminal in the project directory.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the server in development mode:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Method 2: Running a Local Static Server
To run without the backend proxy:
1. Open a terminal in the project directory.
2. Run http-server:
   ```powershell
   npx http-server
   ```
3. Open your browser and navigate to `http://localhost:8080`.

### Method 3: Double-click (Instant Preview)
Since this is a client-side static application, you can run it without any server:
1. Open the project folder.
2. Double-click [index.html](file:///c:/Users/TUF/Desktop/Movie%20Finder/index.html) in your browser.
3. The app will load in Mock Mode (or live mode if configured in `config.js`).

---

## Configuring Your API Key

You can configure your OMDb API Key using one of the following methods:

### Method A: Environment Variable File (Recommended for Servers/Backends)
1. Copy/rename `.env.example` to `.env`.
2. Add your key inside the `.env` file:
   ```env
   OMDB_API_KEY=your_key_here
   ```
3. Restart the backend server. The frontend will automatically detect the backend and run in **Server Backend (Secured)** mode. The settings modal will lock the input field to prevent exposure. Note that `.env` is ignored by git.

### Method B: Local Configuration File (Client-Only Dev Mode)
1. Create/Open [config.js](file:///c:/Users/TUF/Desktop/Movie%20Finder/config.js) in the project root.
2. Add your key inside the `CONFIG` object:
   ```javascript
   const CONFIG = {
     OMDB_API_KEY: 'your_key_here'
   };
   ```
3. The application will detect this file on startup.

### Method C: Settings Modal (In-Browser)
1. When running without a backend server, click the **Gear Icon** (⚙️) in the top-right corner.
2. Enter your OMDb API Key.
3. Click **Save Settings** to persist it in your browser's local storage.

