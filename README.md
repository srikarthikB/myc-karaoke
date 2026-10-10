# myc (my-mic)

> Personal, local-first karaoke web app for Windows laptops. Designed for singing with family and friends without cloud dependencies, subscriptions, or accounts.

---

## Quick Start (How to Run Locally)

### Prerequisites
- Node.js (v18 or higher recommended)
- A modern web browser (Google Chrome, Microsoft Edge, Firefox)

### Steps to Run on Your Laptop

1. Open PowerShell or Command Prompt in the project folder:
   ```bash
   cd myc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Adding Your Instrumental Audio & Lyrics

### 1. Audio Tracks
Place your instrumental audio files in the `public/audio/` directory:
- `public/audio/The A Team.mp3`
- `public/audio/Drunk.mp3`
- `public/audio/Lego House.mp3`
- `public/audio/You Need Me, I Don't Need You.mp3`
- `public/audio/BLOW.mp3`

### 2. Synchronized `.lrc` Lyrics
Place timestamped lyric files in `public/lyrics/`:
- `public/lyrics/The A Team.lrc`
- `public/lyrics/Drunk.lrc`
- `public/lyrics/Lego House.lrc`
- `public/lyrics/You Need Me, I Don't Need You.lrc`
- `public/lyrics/BLOW.lrc`

### 3. Song Metadata Catalogue
Edit `src/data/songs.json` to change titles, artists, vocal keys, tags, or file paths.

---

## Project Structure & Architecture

```
myc/
├── public/
│   ├── audio/              # Place your 5 instrumental files here
│   └── lyrics/             # Synchronized .lrc lyric files
├── src/
│   ├── types/
│   │   └── song.ts         # Strongly-typed song, queue & catalogue models
│   ├── engine/
│   │   ├── audioTypes.ts   # Audio engine contract (decoupled from UI)
│   │   └── lyricTypes.ts   # LRC parser and sync synchronization contracts
│   ├── data/
│   │   ├── songs.json      # Local song catalogue
│   │   └── songs.ts        # Typed catalogue exports and filters
│   ├── context/
│   │   └── PlayerContext.tsx # Central state management & LocalStorage persistence
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx    # Top Bar (Title, Nav links, Action)
│   │   │   └── PlayerBar.tsx    # Persistent bottom bar across all views
│   │   ├── library/
│   │   │   ├── SongLibrary.tsx  # Searchable library with filters & sorting
│   │   │   ├── SongCard.tsx     # Grid card with quick stage/queue actions
│   │   │   ├── SongRow.tsx      # High-density laptop table row
│   │   │   ├── SongArtwork.tsx  # Resilient artwork loader
│   │   │   └── ArtworkFallback.tsx # Procedural vinyl/gradient fallback
│   │   ├── queue/
│   │   │   └── QueueView.tsx    # Upcoming party queue management
│   │   ├── player/
│   │   │   └── KaraokeStage.tsx # Prepared player foundation screen
│   │   └── common/
│   │       └── LocalSetupModal.tsx # In-app local setup instructions
│   ├── App.tsx             # Main view router and layout container
│   ├── main.tsx
│   └── index.css           # Tailwind CSS styling and theme
└── package.json
```

---

## Foundation Highlights (Milestone 1)
- **Local-first**: Zero remote databases or authentication requirements.
- **Procedural Vinyl Artwork Fallback**: Procedurally generated vinyl grooves, center labels, and deterministic color palettes for missing cover art.
- **Laptop-optimized UI**: High density table view and grid view, responsive keyboard-friendly controls, dark lounge aesthetic.
- **Persistent State**: Favorites and view preferences stored directly in browser `localStorage`.
- **Decoupled Architecture**: Audio engine and lyric parser contracts isolated in `src/engine/` for subsequent milestone implementation.
