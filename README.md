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
  A context-aware popup with <strong>60 curated music services</strong> across <strong>8 categories</strong>, injected into every artist, album, and track link on Last.fm. Includes an AI prompt generator, granular per-service visibility, and a live JSON power-user editor.
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

- **Context-Aware Popup** — right-click any music link or click the hover bubble icon to open a toolbox pre-loaded with the correct artist, album, or track
- **60 Services across 8 categories** — Databases, Streaming, Lyrics, Covers & Images, Social Media, Utilities, **LFM Tools** (Last.fm-specific), and AI
- **Inline Sub-Actions** — Google exposes Images / Video / AI Mode shortcuts; Album of the Year exposes Tags / Lists / Global Search shortcuts; TheAudioDB exposes JSON download and Markdown download buttons
- **AI Prompt Modal** — context-aware presets in 5 categories (Overview, Analysis, Discovery, Historical, Technical), per-preset overrides per context type, 8 AI providers, Default Provider + Default Category settings, Auto-Copy setting, and Copy / Open / Copy & Open actions
- **Inline Toolbox Toggle** — choose Bubble (default), Minimal (transparent floating icon), or Highlight-Only (no inline icons; eligible links highlight on hover instead)
- **Hover Highlight** — independent toggle that turns eligible text and grid links red on hover to denote right-click capacity; uses strict `> a` child selectors so play counts and subtitle lines are not affected
- **Granular Per-Service Visibility** — every individual service has its own 14×14 px checkmark toggle in the Sections tab (3-column card layout per category); a per-category Open All sub-toggle replaces the old global switch and defaults to off
- **Last.fm Username Setting** — drives dynamic profile URLs for the LFM Tools category (Bijou, Stats, Live Dashboard, Explr, TapMusic, Time Capsule)
- **Light & Dark Mode** — toggle from Settings or the footer icon; persists in localStorage; sun/moon icon stays in sync
- **Power-User JSON Editor** — live serialisation of every `setting-*`, `musicengine.*`, and `lfm-custom-services` key inside the Advanced tab; Apply Live Edits clears and rewrites the entire scope from the parsed JSON
- **Export / Import / Reset** — download a `.json` backup, paste JSON to restore, or reset to defaults (preserves the custom services list)
- **Link Opening Behavior** — services default to opening in a new browser tab; switch to a centered popup window in Settings
- **Customizable Positioning** — move the toggle button to any of the 4 corners via right-click, Settings, or the userscript manager command
- **Menu Close Behavior** — Close on Select (default), Keep Open, or Auto-Close with a configurable delay (1–60 seconds)
- **Track Support** — full context detection for `/music/Artist/_/Track` pages and links; AI prompts adapt for tracks
- **Manual Search** — set context manually via `Artist`, `Artist - Album`, or `Artist - Album - Track` formats; `fa-question` info icon inside the search box toggles a popup listing accepted formats
- **Custom Services** — add your own URLs with `{artist}`, `{album}`, `{track}`, `{query}`, `{type}` template variables
- **Collapsible Categories** — all sections collapse/expand; state persisted in localStorage
- **Keyboard Shortcuts** — `Ctrl+Shift+E` to toggle the popup; `Esc` to close the popup or any modal
- **Chartlist Integration** — the "..." menu on scrobble rows includes a toolbox entry
- **SPA Navigation** — title-mutation observer re-detects context on pushState navigation
- **Debounced MutationObserver** — 250 ms debounce batches DOM mutations to prevent main-thread jank; visibilitychange handler re-injects on tab refocus
- **Userscript Manager Commands** — Toggle, Settings, and Cycle Popup registered in Tampermonkey/Violentmonkey
- **Toast Notifications** — auto-dismissing overlay replaces `alert()` / `prompt()` for all settings actions
- **Accessibility** — `prefers-reduced-motion` disables animations and transitions
- **Security** — `rel="noopener noreferrer"` on every `window.open` call

---

## Services

| Category | Services |
|----------|----------|
| **Primary** | Search (Google), Listen (Monochrome), AI Prompt |
| **Databases** (11) | [Google](https://www.google.com/) (+ Images / Video / AI Mode), [TheAudioDB](https://www.theaudiodb.com/) (smart resolution + JSON/MD downloads), [Metal Archives](https://www.metal-archives.com/), [Rate Your Music](https://rateyourmusic.com/), [Discogs](https://www.discogs.com/), [MusicBrainz](https://musicbrainz.org/), [Wikipedia](https://en.wikipedia.org/), [Album of the Year](https://www.albumoftheyear.org/) (+ Tags / Lists / Global Search), [AllMusic](https://www.allmusic.com/), [ListenBrainz](https://listenbrainz.org/), [Every Noise at Once](https://everynoise.com/) |
| **Streaming** (12) | [Spotify](https://open.spotify.com/), [YouTube](https://www.youtube.com/), [YouTube Music](https://music.youtube.com/), [Apple Music](https://music.apple.com/), [Bandcamp](https://bandcamp.com/), [SoundCloud](https://soundcloud.com/), [Deezer](https://www.deezer.com/), [Tidal](https://tidal.com/), [Qobuz](https://www.qobuz.com/), [Amazon Music](https://music.amazon.com/), [Audiomack](https://audiomack.com/), [Monochrome](https://monochrome.tf/) |
| **Lyrics** (4) | [Genius](https://genius.com/), [DarkLyrics](http://www.darklyrics.com/), [Google](https://www.google.com/), [Musixmatch](https://www.musixmatch.com/) |
| **Covers & Images** (5) | [COV MusicHoarders](https://covers.musichoarders.xyz/), [Google Images](https://images.google.com/), [Yahoo Images](https://images.search.yahoo.com/), [Bing Images](https://www.bing.com/images/search), [Fanart.tv](https://fanart.tv/) |
| **Social Media** (4) | [Instagram](https://www.instagram.com/), [Facebook](https://www.facebook.com/), [Reddit](https://www.reddit.com/), [X (Twitter)](https://x.com/) |
| **Utilities** (8) | [Chosic](https://www.chosic.com/), [Spirit of Metal](https://www.spirit-of-metal.com/), [Metal Storm](https://metalstorm.net/), [Lucida](https://lucida.to/), [Sputnikmusic](https://www.sputnikmusic.com/), [Audio Archive](https://archive.org/), [WhoSampled](https://www.whosampled.com/), [MusicMap](https://musicmap.info/) |
| **LFM Tools** (8) | [Bijou](https://www.bijou.fm/), [Stats](https://lastfmstats.com/), [Live Dashboard](https://lastfm.live/), [Explr.fm - Regions](https://mold.github.io/explr/), [TapMusic - Collage](https://www.tapmusic.net/), [Universal Scrobbler](https://universalscrobbler.com/), [Time Capsule](https://bxh9261.github.io/last-fm-time-capsule/), [Manual Scrobbler](https://www.bijou.fm/manual-scrobbler) |
| **AI** (8) | [Perplexity](https://www.perplexity.ai/), [ChatGPT](https://chatgpt.com/), [Claude](https://claude.ai/), [Brave AI](https://search.brave.com/ask), [Mistral](https://chat.mistral.ai/), [HuggingChat](https://huggingface.co/chat/), [You.com](https://you.com/), [Grok](https://grok.com/) |

The five LFM Tools profile services (Bijou, Stats, Live Dashboard, Explr, TapMusic) plus Time Capsule auto-fill the username from the **Last.fm Username** setting in the General tab.

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
| Open popup with page context | Click the floating Last.fm icon (bottom-left by default) or press `Ctrl+Shift+E` |
| Reposition toggle button | Right-click the toggle button, use Settings > General > Toggle Position, or run the `Cycle Popup` userscript manager command |
| Open popup for any link | Right-click the link, or click its hover bubble icon |
| Open via grid card | Hover an image card and click the Last.fm bubble icon |
| Open from scrobble rows | Click the "..." menu on any track row, then click the toolbox entry |
| Search manually | Expand **Manual Search** and type `Artist`, `Artist - Album`, or `Artist - Album - Track` (click the `?` icon in the search box for help) |
| Open all services in a category | Click the **Open All** link at the bottom of any section (must be enabled per-category in Settings > Sections; hidden by default) |
| Open a single service | Click the service row (opens via Popup or Tab per Link Opening Behavior) |
| Force a new tab | Hover the service row and click the **+** button |
| Open Google / AOTY sub-actions | Click the inline action icons next to the service row (Images, Video, AI Mode, Tags, Lists, Global Search) |
| Download TheAudioDB data | Click the `</>` (JSON) or Markdown icon next to TheAudioDB |
| Open AI prompt modal | Click the **AI** quick action button in the popup header, or the flask icon next to any AI provider row |
| Use AI presets | Pick a Category (Overview / Analysis / Discovery / Historical / Technical), pick a Prompt Preset, edit if needed, then Copy / Open / Copy & Open |
| Toggle light/dark mode | Click the sun/moon icon in the footer, or go to Settings > General > Color Theme Mode |
| Open Settings | Click the gear icon in the footer, or use the `Settings` userscript manager command |
| Add a custom service | Go to Settings > Custom, fill in Label + URL with `{artist}`, `{album}`, `{track}`, `{query}`, `{type}` |
| Hide a single service | Go to Settings > Sections and uncheck the small box next to the service name |
| Show Open All for one category only | Go to Settings > Sections and check the "Open All" box at the bottom of that category card |
| Edit raw settings JSON | Go to Settings > Advanced, edit the JSON in the power-user editor, click **Apply Live Edits** |
| Backup / restore settings | Settings > Advanced > Export (downloads `.json`) / Import (paste JSON) / Reset |
| Close menu or modal | Press `Esc` |

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
| **General** | Last.fm Username, Inline Toolbox Toggle (Bubble/Minimal/Highlight-Only), Link Opening Behavior (Popup/Tab), Global Button Position, Menu Close Behavior (+ Auto-Close Delay), Hover Highlight, Color Theme Mode |
| **Sections** | Per-category cards in a 3-column grid; each service has its own 14×14 px checkmark toggle; per-category "Open All" sub-toggle (off by default) |
| **AI** | Popup Behavior, Auto-Copy Prompt, Default AI Provider, Default Prompt Category, Prompt Preview & Editor (per-preset overrides per context type), Custom Instruction Suffix |
| **Custom** | Add / edit / remove custom service URLs |
| **Advanced** | Power-User JSON Editor, Export (downloads `.json`), Import (paste JSON), Reset (preserves `lfm-custom-services`), Apply Live Edits |
| **Info** | Version line, Greasy Fork / GitHub / Issue-tracker links, Recommended Resources |

### Inline Icon Styles

| Style | Behaviour |
|-------|-----------|
| **Bubble** (default) | Dark round bubble icon next to eligible links and image cards |
| **Minimal** | Transparent floating icon — no background or shadow |
| **Highlight Only** | No inline icons at all; eligible links highlight red on hover instead (the Hover Highlight layer is auto-activated) |

### AI Prompt Categories

| Category | Has presets for |
|----------|------------------|
| **Overview** | Overview, Summary, Background |
| **Analysis** | Themes, Lyrics, Genre, Compare |
| **Discovery** | Similar, Hidden Gems, Recommendations |
| **Historical** | Context, Reception, Legacy |
| **Technical** | Production, Personnel, Songwriting |

Each preset prompt is context-aware — it adapts whether you have a track, an album, or just an artist. Custom per-preset overrides can be saved from the AI tab's Prompt Preview & Editor; modified presets are marked with ✎ in the AI modal's dropdown.

---

## Limitations

- The AI prompt modal generates prompts and opens provider URLs; it does not make API calls or scrape AI websites
- TheAudioDB uses the free API key `123`; if the key changes, update `SERVICE_URLS["theaudiodb-link"]` in the source
- If a service changes its search URL format, links may break — report it via GitHub issues
- Zero tracking, no ads, pure client-side JS with localStorage for preferences

---

## Changelog


<details>
<summary>v6 (2026-09-06) — Current release</summary>

- **AI Prompts Overhauled**: Replaced all `AI_CATEGORIES` presets with structured XML-tagged prompts (`<role>`/`<task>`/`<constraints>`/`<output_format>`). Categories reorganized: Overview (Summary, Guide, Timeline, Commercial), Analysis (Theory, Lyrics, Sonic, Technical, Vocals), Discovery (Niche, Samples, Playlist, Live), Context (Impact, Lore, Aesthetics, Trivia, Philosophy) — replaces the old Overview/Analysis/Discovery/Historical/Technical set
- **Fix**: TheAudioDB JSON download no longer saves a near-empty `{"artists": null}` file when no match is found — shows a toast instead
- **Settings AI/Info Cohesion**: New shared `.settings-card` primitive; Prompt Preview & Editor and Custom Instructions now use consistent card styling and typography
- **UI**: Replaced heavy settings-group background cards with subtle dividers and border-only hover highlights; `Sections` tab visual style preserved
- **Fix**: AI prompt modal action buttons no longer overflow; the `Copy & Open` button displays correctly
- **Fix**: Settings modal now opens with the General tab content visible by default
- **Info Tab**: Removed the standalone "Did you know?" tip and consolidated Recommended Resources into the Info tab
- **New Docs Tab**: In-app reference tab in Settings covering shortcuts, right-click hooks, search formats, sections, service rows, TheAudioDB, AI generator, menu behavior, and troubleshooting
- **Category Reorganization**: AllMusic moved to Databases, Fanart.tv moved to Covers & Images, Additional category renamed to Utilities
- **New Services**: TheAudioDB (with webpage resolution, JSON download, and Markdown download), ListenBrainz (context-aware search per type), Monochrome in Streaming, X (Twitter) in Social Media
- **AOTY Sub-Actions**: Album of the Year row now exposes three inline action buttons — Tags (`fa-tags`), Lists (`fa-list`), and Global Search (`fa-earth-europe`) — mirroring Google's quick-action pattern
- **Google Sub-Actions**: Google row exposes inline quick actions for Images (`fa-image`), Video (`fa-video`), and AI Mode (`fa-flask`)
- **LFM Tools Category**: New 8th category dedicated to Last.fm-specific profile and scrobble tools — Bijou, Stats (lastfmstats.com), Live Dashboard (lastfm.live), Explr.fm - Regions, TapMusic - Collage, Universal Scrobbler, Time Capsule, and Manual Scrobbler. The five profile tools auto-fill the username from the new "Last.fm Username" general setting
- **Every Noise at Once**: New database service with type-aware URL routing (track/album/artist modes)
- **MusicMap**: New utilities service (musicmap.info)
- **60 Total Services** across 8 categories (Databases, Streaming, Lyrics, Covers & Images, Social Media, Utilities, LFM Tools, AI)
- **Last.fm Username Setting**: A new General settings field (`setting-lfm-username`) that drives the dynamic profile URLs for Bijou, Stats, Live Dashboard, Explr, TapMusic, and Time Capsule
- **Inline Toolbox Toggle**: New General dropdown replacing the binary on/off toggle — choose Bubble (default), Minimal (transparent floating icon), or Highlight Only (no inline icons; eligible links highlight on hover instead)
- **Hover Highlight**: A new General toggle (separate from the inline-icon toggle) that turns eligible text/grid links red on hover to denote right-click capability. Activates automatically when the inline toggle is set to "Highlight Only"
- **Strict Grid Targeting**: The hover-highlight layer now uses explicit child selectors (`> a`) and main-text wrappers so play counts, subtitles, and metadata lines in album/artist grids are no longer highlighted
- **Granular Per-Service Visibility**: The Sections tab now renders a 3-column card layout per category, with a small 14×14px checkmark toggle next to every individual service. Each service can be hidden independently (`setting-svc-hidden-{id}`), and a per-category "Open All" toggle (`setting-openall-{cat}`) replaces the old global Open All switch
- **Power-User JSON Editor**: The Advanced tab has been redesigned into a maximized monospace JSON editor with thin-profile action buttons. The editor live-serializes all `setting-` / `musicengine.` / `lfm-custom-services` keys (with auto-refresh while no field is focused), and the Apply Live Edits button clears and rewrites the entire configuration scope from the parsed JSON
- **Export/Import/Reset Scope Fix**: All three Advanced actions now correctly include every key starting with `setting-` (covering the new `setting-svc-hidden-*`, `setting-openall-*`, `setting-ai-*`, `setting-close-delay`, and `setting-lfm-username` keys). Export downloads a `.json` file; Import accepts pasted JSON and reloads; Reset preserves `lfm-custom-services`
- **Info Tab**: New settings tab with the script version, Greasy Fork / GitHub / Issue-tracker links, and a Recommended Resources section linking out to Bijou and the Last.fm Artwork Upload Helper. The standalone "Did you know?" tip has been removed.
- **AI Auto-Copy Setting**: New AI tab toggle (`setting-ai-autocopy`) — when enabled, the Open button automatically copies the prompt to the clipboard before launching the provider
- **AI Default Category Setting**: New AI tab dropdown (`setting-default-ai-category`) that preselects the prompt category in the AI modal (Overview, Analysis, Discovery, Historical, or Technical)
- **AI Prompt Preset Overrides**: The AI tab now includes a Prompt Preview & Editor that lets you customize individual preset prompts per context type (track/album/artist). Modified presets are marked with a ✎ and persist via `setting-ai-preset-override-{cat}-{idx}-{ctxType}`
- **AI Modal Polish**: Redesigned with a centered brand-colored eyebrow header, absolute-positioned close button, gear icon jumping to the AI settings tab, and thin `.settings-tab`-style buttons (Copy, Open, Copy & Open)
- **Checkbox Toggle Switches**: All toggle switches are now 20×20px bordered checkboxes (4px radius) showing a `fa-radiation` icon when active (parent/primary toggles) or a `fa-check` icon (sub-item toggles, 14×14px / 3px radius). Icons are hidden when inactive to keep the unchecked box empty. Icon color follows `--text-primary` so it stays white in dark mode and black in light mode
- **Default Open Mode**: Services now default to opening in a new browser tab (`musicengine.defaultOpenMode = "tab"`) instead of a popup window
- **Debounced MutationObserver**: Replaced the requestAnimationFrame observer pattern with a 250ms debounce timer that batches DOM mutations and prevents main-thread jank on heavily-mutating Last.fm pages
- **Theme Variables**: Added `--brand-rgb` (218, 35, 35) for use in `rgba()` chip and active-state tints; toggle color now driven by `--brand` rather than the legacy `--toggle-off`/`--toggle-on` pair
- **Accessibility**: `prefers-reduced-motion` continues to disable all animations and transitions
- **Category Reorganization**: AllMusic moved to Databases, Fanart.tv moved to Covers & Images, Additional category renamed to Utilities
- **New Services**: TheAudioDB (with webpage resolution, JSON download, and Markdown download), ListenBrainz (context-aware search per type), Monochrome in Streaming, X (Twitter) in Social Media
- **TheAudioDB Smart Resolution**: Clicking the service link fetches the API JSON, extracts the artist ID, and redirects to the actual visual webpage. Also includes dedicated buttons to download raw JSON or formatted Markdown files.
- **Icon Updates**: Tidal (`fa-water`), Grok (`fa-x-twitter`), Search quick action (`fa-search`), plus icons for all new services
- **Manual Search Info Popup**: Replaced text with a `fa-question` icon inside the search box that toggles a small popup above showing accepted formats
- **AI Provider Popup Toggle**: Each AI service now has a robot icon button that opens the AI prompt modal with that provider pre-selected
- **Settings Modal Redesign**: Vertical collapsible sidebar tabs (icon-only or expanded), centered "Settings" title (22px), footer showing current tab name, less button padding, improved hover/active states, Open Toolbox button removed
- **Menu Close Behavior**: New setting with three options — Close on Select (default), Keep Open, Auto-close (3s)
- **Open All Off by Default**: Open All links are now hidden by default; must be enabled in Settings > Sections
- **Light/Dark Icon Sync**: Toggling light mode via settings modal now also updates the footer sun/moon icon
- **Toast Notifications**: Replaced all `alert()`/`prompt()` calls with an auto-dismissing toast overlay for settings actions
- **CSS Cleanup**: Removed duplicate `#external-music-menu a` rule; scrollbar colors now use CSS variables (`--scrollbar-bg`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`)
- **Security Fixes**: Added `rel="noopener noreferrer"` to all `window.open` calls; fixed Amazon Music domain (`.com.au` → `.com`)
- **Performance**: Removed redundant `setInterval` (3s) and `setTimeout` (2s) — MutationObserver + visibilitychange handler suffice

</details>

<details>
<summary>v5 (2026-06-27)</summary>

- **Toggle Button Positioning**: Reposition the toggle button to Top Left, Top Right, Bottom Left, or Bottom Right (via right-click, Settings, or the userscript command menu).
- **Fixed Header Compatibility**: Top button positions are aligned to `top: 75px` to clear the fixed Last.fm header bar.
- **Z-Index Improvements**: Increased z-index to `99999999` to ensure the button/menu sits above all page UI and cookie toggles.
- **Menu Bottom Alignment**: The menu remains bottom-aligned (left-to-right movement only) for a consistent layout.
- **Open Toolbox in Settings**: Added an "Open Toolbox" button directly in the Settings modal header.
- **Settings Modal Polish**: Set modal box to a fixed `650px` width by `650px` height. Inner panels are scrollable while tabs and the title header remain fixed.
- **Unified Visual Style**: Added a custom `CONFIG` badge (which adapts in light/dark modes) and styled tabs as custom outline pills.
- **Advanced Preference Actions**: Implemented settings backup operations (Export to clipboard, Import from clipboard, and Reset preferences to defaults).
- **Userscript Manager Command Integration**: Registered `Toggle`, `Settings`, and `Cycle Popup` commands in Violentmonkey/Tampermonkey.

</details>

<details>
<summary>v4 (2026-06-11)</summary>

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

[**Bijou**](https://www.bijou.fm/tools?service=Last.fm)
- a collection of Last.fm tools and utilities

---
