<p align="center">
  <img src="assets/icon.png" alt="Last.fm Toolbox" width="100">
</p>

<h1 align="center">Last.fm: Toolbox</h1>

<p align="center">
  <a href="https://greasyfork.org/en/scripts/563609-last-fm-toolbox">
    <img src="https://img.shields.io/badge/Install-Greasy%20Fork-DA2323?style=for-the-badge&logo=greasyfork&logoColor=white" alt="Greasy Fork">
  </a>
  <a href="https://github.com/deathrashed/lastfm-userscript">
    <img src="https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="MIT License">
</p>

<p align="center">
  A context-aware popup with <strong>35+ curated music services</strong> injected into every artist, album, and track link on Last.fm.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#services">Services</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#changelog">Changelog</a>
</p>

---

## Features

- **Context-Aware Popup** – Right-click any music link or click the hover bubble icon to open a toolbox with the correct artist, album, or track pre-loaded
- **35+ Services** across 7 categories: Databases, Streaming, Lyrics, Covers & Images, Social Media, Additional, AI
- **Light & Dark Mode** – Toggle from Settings or the footer icon; persists in localStorage
- **AI Prompt Modal** – Context-aware presets for ChatGPT, Claude, Perplexity, Grok, Brave AI, Mistral, HuggingChat, and You.com; Copy, Open, or Copy & Open in a popup or new tab
- **Popup Window Mode** – Services open in a centered popup (1200x900) by default; switch to a regular tab in Settings
- **Quick Actions** – Search, Listen, and AI buttons pinned in the popup header; icon-only by default, labels appear on hover
- **Track Support** – Full context detection for track pages (`/music/Artist/_/Track`) and links; AI prompts adapt for tracks
- **Manual Search** – Set context manually via `Artist`, `Artist - Album`, or `Artist - Album - Track` formats
- **Custom Services** – Add your own URLs with `{artist}`, `{album}`, `{track}`, `{query}`, `{type}` template variables
- **Collapsible Categories** – All sections collapse/expand; state persisted in localStorage
- **Keyboard Shortcut** – Ctrl+Shift+E to open/close the popup with auto-detected page context
- **Chartlist Integration** – The "..." menu on scrobble rows includes a toolbox entry
- **SPA Navigation** – Automatically re-detects context on Last.fm's pushState navigation
- **Hover & Grid Icons** – Small Last.fm bubble icons on artist/album/track links across the site

---

## Services

| Category | Services |
|----------|----------|
| **Primary** | Search (Google), Listen (Monochrome), AI Prompt |
| **Databases** | [Google](https://www.google.com/search?udm=50), [Metal Archives](https://www.metal-archives.com/), [Rate Your Music](https://rateyourmusic.com/), [Discogs](https://www.discogs.com/), [MusicBrainz](https://musicbrainz.org/), [Wikipedia](https://en.wikipedia.org/), [Album of the Year](https://www.albumoftheyear.org/) |
| **Streaming** | [Spotify](https://open.spotify.com/), [YouTube](https://www.youtube.com/), [YouTube Music](https://music.youtube.com/), [Apple Music](https://music.apple.com/), [Bandcamp](https://bandcamp.com/), [SoundCloud](https://soundcloud.com/), [Deezer](https://www.deezer.com/), [Tidal](https://tidal.com/), [Qobuz](https://www.qobuz.com/), [Amazon Music](https://music.amazon.com/) |
| **Lyrics** | [Genius](https://genius.com/), [DarkLyrics](http://www.darklyrics.com/), [Google](https://www.google.com/), [Musixmatch](https://www.musixmatch.com/) |
| **Covers & Images** | [COV MusicHoarders](https://covers.musichoarders.xyz/), [Google Images](https://images.google.com/), [Yahoo Images](https://images.search.yahoo.com/), [Bing Images](https://www.bing.com/images/search) |
| **Social Media** | [Instagram](https://www.instagram.com/), [Facebook](https://www.facebook.com/), [Reddit](https://www.reddit.com/) |
| **Additional** | [AllMusic](https://www.allmusic.com/), [Chosic](https://www.chosic.com/), [Spirit of Metal](https://www.spirit-of-metal.com/), [Metal Storm](https://metalstorm.net/), [Fanart.tv](https://fanart.tv/), [Lucida](https://lucida.to/), [Sputnikmusic](https://www.sputnikmusic.com/) |
| **AI** | [Perplexity](https://www.perplexity.ai/), [ChatGPT](https://chatgpt.com/), [Claude](https://claude.ai/), [Brave AI](https://search.brave.com/ask), [Mistral](https://chat.mistral.ai/), [HuggingChat](https://huggingface.co/chat/), [You.com](https://you.com/), [Grok](https://grok.com/) |

---

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari)
   - [Violentmonkey](https://violentmonkey.github.io/) (Firefox, Chrome)

2. Click **Install this script** on Greasy Fork:

   <p><a href="https://greasyfork.org/en/scripts/563609-last-fm-toolbox"><img src="https://img.shields.io/badge/Install%20on-Greasy%20Fork-DA2323?style=for-the-badge&logo=greasyfork&logoColor=white" alt="Install"></a></p>

---

## Usage

| Action | Method |
|--------|--------|
| Open popup with page context | Click the floating Last.fm icon (bottom-left) or press Ctrl+Shift+E |
| Open popup for any link | Right-click the link, or click its hover bubble icon |
| Open via grid card | Hover an image card and click the Last.fm bubble icon |
| Open from scrobble rows | Click the "..." menu on any track row, then click the toolbox entry |
| Search manually | Expand **Manual Search** and type `Artist`, `Artist - Album`, or `Artist - Album - Track` |
| Open all services in a category | Click the **Open All** link at the bottom of any section |
| Open a single service | Click the service row (opens via popup or tab per Default Open Mode) |
| Force a new tab | Hover the service row and click the **+** button |
| Open AI prompt modal | Click the **AI** quick action button in the popup header |
| Toggle light/dark mode | Click the sun/moon icon in the footer, or go to Settings > General |
| Open Settings | Click the gear icon in the footer |
| Add a custom service | Go to Settings > Custom, fill in Label + URL with `{artist}`, `{album}`, `{track}` |

---

## Configuration

### URL Template Variables

For custom services in Settings > Custom:

| Variable | Replaced with |
|----------|---------------|
| `{artist}` | URL-encoded artist name |
| `{album}` | URL-encoded album name (empty for artist context) |
| `{track}` | URL-encoded track name (empty for non-track contexts) |
| `{query}` | URL-encoded track + album + artist, or album + artist, or just artist |
| `{type}` | `track`, `album`, or `band` |

Example: `https://mysite.com/search?q={query}`

### Settings Tabs

| Tab | Options |
|-----|---------|
| **General** | Hover & grid icons, Open All links, Light mode, Default Open Mode |
| **Sections** | Show/hide entire categories (Databases, Streaming, etc.) |
| **AI** | AI open mode (popup window or new tab) |
| **Custom** | Add/edit/remove custom service URLs |
| **Advanced** | Reserved for future use |

---

## Limitations

- AI prompt modal generates prompts and opens provider URLs; it does not make API calls or scrape AI websites
- If a service changes its search URL format, links may break — report it via GitHub issues
- Zero tracking, no ads, pure client-side JS with localStorage for preferences

---

## Changelog

<details>
<summary>v4 (2026-06-11) — Current release</summary>

- Light & dark mode with CSS custom properties
- Settings modal with tabs (General, Sections, AI, Custom, Advanced)
- AI prompt modal with dropdown presets, provider selection, Copy/Copy & Open/Open
- Service popup system: main row opens centered popup, hover + forces new tab
- Default Open Mode setting: Popup Window or New Tab for all services
- AI providers: ChatGPT, Claude, Perplexity, Brave AI, Mistral, HuggingChat, You.com, Grok
- Track context support: detect `/music/Artist/_/Track` pages and links
- Context badges with distinct colors for artist/album/track
- Quick actions: icon-only with text revealed on hover
- Footer with gear settings and light/dark toggle icons
- Manual Search with Artist, Artist - Album, and Artist - Album - Track support
- Custom services with `{artist}`, `{album}`, `{track}`, `{query}`, `{type}` templates
- Collapsible categories with state persistence in localStorage
- Unified scrollbar system across all panels
- Keyboard shortcut: Ctrl+Shift+E
- 35+ services across 7 categories
- Hover and grid toolbox icons on artist/album/track links
- Right-click context menu support
- Chartlist integration
- Open All per category
- SPA navigation detection
- MutationObserver for dynamic content

</details>

<details>
<summary>v3 — Initial public release</summary>

- 30+ services, hover icons, right-click support, collapsible sections, manual search

</details>

---

## Source

[github.com/deathrashed/lastfm-userscript](https://github.com/deathrashed/lastfm-userscript)

Bugs, feature requests, or suggestions — open an issue on GitHub.

## Recommended

[**Last.fm Artwork Upload Helper**](https://github.com/chr1sx/Last.fm-Artwork-Upload-Helper/) by chr1sx
- a userscript that streamlines uploading album artwork
- Using [COV](https://covers.musichoarders.xyz/) integration to find high-quality covers, then opens the Last.fm upload page with the image pre-filled and ready to submit
- This is a must-have tool.

---
