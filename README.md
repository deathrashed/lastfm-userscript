# Last.fm: External Links Popup

A lightweight userscript that adds a quick-access popup with **20+ curated music services** to any artist link or header on Last.fm.  

Tired of copying artist names and juggling tabs just to check streaming sites, databases, lyrics, or socials?  
This script fixes that.

It adds a small **⁖** icon beside artist names across the site.  
Click it to open a sleek, dark popup from the bottom-left — packed with neatly grouped links.

Access everything instantly:
- Streaming services  
- Databases & archives  
- Wikipedia & Bandcamp  
- YouTube & socials  
- AI summaries, lyrics, and more  

No more tab chaos — everything you need for any artist, one click away.

---

## Features
- Discreet **⁖** indicator added to artist links and artist-page headers  
- Dark popup that blends with Last.fm’s aesthetic (red section headers, highlighted selections)  
- Thin left scrollbar, auto-closes on outside click or link selection  
- Preserves artist name case — no forced lowercase  
- Lightweight: no external dependencies, uses native `MutationObserver` for dynamic content  
- 20+ services grouped logically:

  **Databases:**  
  [Google](https://www.google.com/search?q=%s+band), [Metal Archives](https://www.metal-archives.com/), [Rate Your Music](https://rateyourmusic.com/), [Discogs](https://www.discogs.com/), [MusicBrainz](https://musicbrainz.org/)  

  **Streaming:**  
  [Spotify](https://open.spotify.com/search/), [YouTube](https://www.youtube.com/results?search_query=), [Apple Music](https://music.apple.com/us/search?term=), [Bandcamp](https://bandcamp.com/search?q=), [SoundCloud](https://soundcloud.com/search?q=), [Deezer](https://www.deezer.com/search/)  

  **Lyrics:**  
  [Genius](https://genius.com/search?q=), [DarkLyrics](http://www.darklyrics.com/search?q=), [Google Lyrics](https://www.google.com/search?q=+lyrics), [Musixmatch](https://www.musixmatch.com/search?query=)  

  **Covers & Images:**  
  [COV MusicHoarders](https://covers.musichoarders.xyz?artist=), [Google Images (Large)](https://www.google.com/search?tbm=isch&q=+band&tbs=isz:l), [Fanart.tv](https://fanart.tv/)  

  **Social Media:**  
  [Instagram](https://www.instagram.com/explore/search/keyword/?q=+band), [Facebook](https://www.facebook.com/search/top?q=), [Reddit](https://www.reddit.com/search/?q=)  

  **Additional Info:**  
  [Wikipedia](https://en.wikipedia.org/wiki/), [AllMusic](https://www.allmusic.com/search/all/), [Chosic](https://www.chosic.com/search-results/?q=), [Spirit of Metal](https://www.spirit-of-metal.com/), [Metal Storm](https://metalstorm.net/)  

  **AI Overviews:**  
  [Perplexity](https://www.perplexity.ai/), [ChatGPT](https://chatgpt.com/), [You.com](https://you.com/), [Phind](https://www.phind.com/)

---

## Perfect for
- Music fans who deep-dive into new artists  
- Library builders cleaning up metadata, credits, and covers  
- Anyone sick of opening endless tabs for each discovery  
- Power users comparing RYM, Discogs, and MusicBrainz entries at once  
- Listeners who want instant lyrics, previews, or fanart  

![Demo GIF](https://raw.githubusercontent.com/deathrashed/Gupload/main/Uploads/Images/lastfm-userscript.gif)

---

## Installation

1. Install a userscript manager:  
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Safari…)  
   - [Violentmonkey](https://violentmonkey.github.io/) (great Firefox option)  

2. Click **Install this script** on Greasy Fork (or drag the `.user.js` file into your manager)

---

## Notes & Limitations
- Currently supports **artist** links and headers only (album support planned — PRs welcome)  
- If a service changes its search URL format, links may break — report it and I’ll update  
- Zero tracking, no ads, no external `@require` — pure client-side JS  

---

## Source & Contributing

Full source:  
[github.com/deathrashed/userscripts/blob/main/lastfm-external-links-popup.user.js](https://github.com/deathrashed/userscripts/blob/main/lastfm-external-links-popup.user.js)

Bugs, feature requests, or “add X” suggestions → open an issue on GitHub.

---

**Fewer tabs. Faster lookups. More time actually listening. 🤘**
