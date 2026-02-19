# Last.fm: External Links Popup

A powerful userscript that adds a quick-access popup with **30+ curated music services** to any **artist** or **album** link on Last.fm.  

Tired of copying names and juggling tabs just to check streaming sites, databases, lyrics, or socials?  
This script fixes that.

It adds smart symbols beside artist names and albums across the site:
- **⁖** for artists (appears **before** the link)
- **≫** for albums (appears **after** the link)

Click either symbol to open a sleek, dark popup from the bottom-left — packed with neatly grouped links that intelligently adapt to whether you selected an artist or an album.

---

## Features
- **Album & Artist Support**: Smart detection of artist links and album links with different visual indicators
- **Album-Aware Services**: 30+ services intelligently adapt their search queries:
  - Artist pages: Search for `{artist}`
  - Album pages: Search for `{album} {artist}` with context-aware keywords (e.g., "album" instead of "band")
- **Collapsible Sections**: All menu sections can be collapsed/expanded — state is remembered
- **Settings Panel**: Toggle visibility of individual sections and link symbols
- **Custom Search**: Manually type "Artist" or "Artist - Album" in the Custom section to search without navigating
- **Dark popup** that blends with Last.fm's aesthetic (red section headers, highlighted selections)
- **Thin left scrollbar**, auto-closes on outside click or link selection
- **Preserves artist name case** — no forced lowercase
- **Lightweight**: uses native `MutationObserver` for dynamic content

### 30+ Services grouped logically:

**Databases:**  
[Google](https://www.google.com/search?q=%s+band), [Metal Archives](https://www.metal-archives.com/), [Rate Your Music](https://rateyourmusic.com/), [Discogs](https://www.discogs.com/), [MusicBrainz](https://musicbrainz.org/), [Wikipedia](https://en.wikipedia.org/wiki/)

**Streaming:**  
[Spotify](https://open.spotify.com/search/), [YouTube](https://www.youtube.com/results?search_query=), [YouTube Music](https://music.youtube.com/search?q=), [Apple Music](https://music.apple.com/us/search?term=), [Bandcamp](https://bandcamp.com/search?q=), [SoundCloud](https://soundcloud.com/search?q=), [Deezer](https://www.deezer.com/search/), [Tidal](https://tidal.com/search?q=), [Amazon](https://music.amazon.com.au/search/)

**Lyrics:**  
[Genius](https://genius.com/search?q=), [DarkLyrics](http://www.darklyrics.com/search?q=), [Google Lyrics](https://www.google.com/search?q=+lyrics), [Musixmatch](https://www.musixmatch.com/search?query=)

**Covers & Images:**  
[COV MusicHoarders](https://covers.musichoarders.xyz?artist=), [Google Images (Large)](https://www.google.com/search?tbm=isch&q=+band&tbs=isz:l), [Yahoo Images](https://images.search.yahoo.com/search/images), [Bing Images](https://www.bing.com/images/search), [Fanart.tv](https://fanart.tv/)

**Social Media:**  
[Instagram](https://www.instagram.com/explore/search/keyword/?q=+band), [Facebook](https://www.facebook.com/search/top?q=), [Reddit](https://www.reddit.com/search/?q=)

**Additional Info:**  
[AllMusic](https://www.allmusic.com/search/all/), [Chosic](https://www.chosic.com/search-results/?q=), [Spirit of Metal](https://www.spirit-of-metal.com/), [Metal Storm](https://metalstorm.net/), [Fanart.tv](https://fanart.tv/), [Lucida](https://lucida.to/search)

**AI Overviews:**  
[Perplexity](https://www.perplexity.ai/), [ChatGPT](https://chatgpt.com/), [You.com](https://you.com/), [Grok](https://grok.com/)

**Smart Search & Quick Access:**  
- [Listen (Monochrome)](https://monochrome.tf/) — quick access button at the top
- Custom search box supports "Artist" or "Artist - Album" format to update all services at once

**Settings:**  
Toggle visibility of individual sections and link symbols — all preferences are saved

---

## Perfect for
- Music fans who deep-dive into new artists and albums
- Library builders cleaning up metadata, credits, and covers
- Anyone sick of opening endless tabs for each discovery
- Power users comparing RYM, Discogs, and MusicBrainz entries at once
- Listeners who want instant lyrics, previews, or fanart

---

## Installation

1. Install a userscript manager:  
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari…)  
   - [Violentmonkey](https://violentmonkey.github.io/) (great Firefox option)  

2. Click **Install this script** on Greasy Fork (or drag the `.user.js` file into your manager)

---

## Download

- [Greasy Fork](https://greasyfork.org/en/scripts/563609-last-fm-external-links-popup)
- [GitHub](https://raw.githubusercontent.com/deathrashed/lastfm-userscript/main/lastfm-external-links-popup.user.js)
- [Source](https://github.com/deathrashed/lastfm-userscript/blob/main/lastfm-external-links-popup.user.js)

---

## Notes & Limitations
- Supports **artist** and **album** links and headers  
- Skips track pages and internal Last.fm pages (wiki, events, etc.)  
- If a service changes its search URL format, links may break — report it and I'll update  
- Zero tracking, no ads, pure client-side JS with localStorage for preferences

---

## Source & Contributing

Full source:  
[github.com/deathrashed/lastfm-userscript/blob/main/lastfm-external-links-popup.user.js](https://github.com/deathrashed/lastfm-userscript/blob/main/lastfm-external-links-popup.user.js)

Bugs, feature requests, or "add X" suggestions → open an issue on GitHub.

---

**Fewer tabs. Faster lookups. More time actually listening. 🤘**