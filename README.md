````md
# CineSpace 🍿 // Premium Movie Finder

CineSpace is a premium, feature-rich movie search and curating application built purely using vanilla HTML5, CSS3, and modern JavaScript. It connects to the OMDb API to search the global cinematic databases, enrich metadata in real-time, and allow users to curate watchlists, store favorites, rate movies, and write persistent reviews.

---

# ✨ Key Features

- **Vibrant Glassmorphic UI**  
  Stunning dark neon interface with backdrop blur, smooth hover effects, glowing accents, and micro-animations.

- **Dual Theme Support** 🌗  
  Switch seamlessly between:
  - Dark Neon Glassmorphic Mode
  - Clean Light Mode

- **Dual Data Modes**
  - **Mock Mode (Default):** Instantly test the app offline with curated movie data.
  - **OMDb Live Mode:** Fetch live movie data directly from the OMDb API.

- **Secure Express Backend Proxy** 🔒  
  Integrated Express.js backend proxy for secure OMDb API communication without exposing API keys.

- **Smart Detail Enrichment**  
  Retrieves complete movie metadata in parallel for enhanced filtering and sorting by genre, IMDb rating, and release year.

- **Interactive Movie Modal**  
  View detailed movie information including:
  - Runtime
  - Plot
  - Cast
  - IMDb / Rotten Tomatoes / Metacritic ratings
  - User reviews

- **Personal Watchlist & Favorites**  
  Save favorite movies and bookmarks with persistent local storage support.

- **Local Reviews Engine**  
  Add custom star ratings and reviews that remain stored between sessions.

- **Dynamic Theme Persistence**  
  User-selected theme preferences are automatically saved in local storage.

---

# 📁 File Structure

```plaintext
Movie Finder/
├── backend/
│   ├── server.js          # Express backend proxy server
│   ├── routes/            # API route handlers
│   └── .env               # Environment variables (Git-ignored)
├── index.html             # Main structure, modals, and templates
├── style.css              # UI themes, layouts, animations, and variables
├── app.js                 # Core application logic and API controllers
├── mockData.js            # Offline mock movie dataset
├── config.js              # Local frontend configuration (Git-ignored)
├── .gitignore             # Prevents sensitive files from being committed
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
````

---

# 🎬 How to Get an OMDb API Key

An API key is required for live movie searching.

1. Visit the OMDb API Key Request page.
2. Choose the **Free Tier** (1,000 requests/day).
3. Submit your email address.
4. Verify and activate your API key through the email link.

---

# ⚙️ Setup & Running Instructions

## Method 1: Secure Backend Server (Recommended)

Run CineSpace with the secure Express backend proxy.

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Open in browser

```bash
http://localhost:3000
```

Benefits:

* Secure API handling
* Environment variable support
* Automatic backend detection
* Production-ready architecture

---

## Method 2: Local Static Server

Run the frontend without backend proxy.

```bash
npx http-server
```

Open:

```bash
http://localhost:8080
```

---

## Method 3: Instant Preview

Simply double-click:

```plaintext
index.html
```

The application launches in Mock Mode automatically.

---

# 🔑 Configuring Your API Key

## Method A: Environment Variables (Recommended)

Create a `.env` file:

```env
OMDB_API_KEY=your_key_here
```

Advantages:

* Prevents API exposure
* Secure for deployment
* Cleaner backend architecture

---

## Method B: Local Frontend Config

Create a `config.js` file:

```javascript
const CONFIG = {
  OMDB_API_KEY: 'your_key_here'
};
```

---

## Method C: In-App Settings Modal

1. Click the ⚙️ Settings icon.
2. Enter your OMDb API key.
3. Save settings.

The key will persist using local storage.

---

# 🚀 Latest Update

## New Features Added

* Implemented an **Express.js backend proxy** for secure OMDb API communication.
* Added **environment variable support** using `.env` to safely manage API keys.
* Introduced a fully functional **Light Mode Theme** alongside the existing dark glassmorphic interface.
* Enhanced theme switching with smoother transitions and improved accessibility.
* Added automatic backend/server mode detection.
* Improved responsive UI behavior and animations.

---

# 🔒 Secure API Key Management

CineSpace now supports secure backend architecture using Express.js.

Instead of exposing your OMDb API key directly in frontend JavaScript, requests can now be routed securely through the backend proxy server.

### Benefits

* Prevents API key exposure
* Improves deployment security
* Supports `.env` configuration
* Cleaner separation between frontend and backend

---

# 🌗 Theme Support

Users can now switch between:

* **Dark Neon Glassmorphic Theme**
* **Modern Light Theme**

Theme preferences are automatically persisted using local storage.

---

# 🛠 Updated Development Workflow

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 📘 README Improvements

Documentation now includes:

* Backend proxy setup instructions
* Environment variable configuration
* Theme support documentation
* Secure deployment recommendations
* Updated project architecture
* Improved setup workflow guidance

```
```
