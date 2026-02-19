// ==UserScript==
// @name           Last.fm: Toolbox
// @namespace      https://github.com/deathrashed/lastfm-userscript
// @description    Quick-access popup ⁖ for external links on Last.fm artist pages. Creates a small ⁖ in front of each artist link on www.last.fm. Clicking it opens a popup menu with external services, updated based on the clicked artist.
// @icon           https://cdn.icon-icons.com/icons2/808/PNG/512/lastfm_icon-icons.com_66107.png
// @match          https://www.last.fm/*
// @match          https://www.lastfm.*/*
// @match          https://cn.last.fm/*
// @version        2
// @license        MIT
// @grant          GM_addStyle
// @author         deathrashed
// @downloadGIT    https://raw.githubusercontent.com/deathrashed/lastfm-userscript/main/lastfm-toolbox.user.js
// @updateGIT      https://raw.githubusercontent.com/deathrashed/lastfm-userscript/main/lastfm-toolbox.user.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js
// @resource       https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @downloadURL https://update.greasyfork.org/scripts/563609/Lastfm%3A%20Toolbox.user.js
// @updateURL https://update.greasyfork.org/scripts/563609/Lastfm%3A%20Toolbox.meta.js
// ==/UserScript==

(function () {
  "use strict";

  // Add Font Awesome styles
  const faLink = document.createElement("link");
  faLink.rel = "stylesheet";
  faLink.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
  document.head.appendChild(faLink);

  // Include popup styling and logic from the expanded script
  GM_addStyle(`
        .LMAa {
            font-size: 70% !important;
            display: inline-block;
            padding-right: 2px;
            cursor: pointer;
            position: relative;
            z-index: 10;
            user-select: none;
        }
        .grid-items-item-aux-text .LMAa, .featured-item-details .LMAa {
            float: left;
            margin-right: 0.5em;
        }
        #external-music-button {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: #282828;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            z-index: 9999;
        }
        #external-music-button:hover {
            background: #3a3a3a;
        }
        #external-music-button:hover {
            background: #3a3a3a;
        }
        #external-music-menu {
            position: fixed;
            bottom: 70px;
            left: 20px;
            background: #282828;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            padding: 10px 0;
            display: none;
            z-index: 9999;
            min-width: 200px;
            max-height: 600px; /* Increased for more links */
            overflow-y: auto;
            direction: rtl; /* Puts scrollbar on the left */
        }
        #external-music-menu::-webkit-scrollbar {
            width: 6px; /* Thinner scrollbar */
        }
        #external-music-menu::-webkit-scrollbar-track {
            background: #282828; /* Dark track */
        }
        #external-music-menu::-webkit-scrollbar-thumb {
            background: #666; /* Dark thumb */
        }
        #external-music-menu::-webkit-scrollbar-thumb:hover {
            background: #999; /* Lighter on hover */
        }
        #external-music-menu.visible {
            display: block;
        }
        #external-music-menu p {
            margin: 0;
            padding: 5px 15px;
            color: #999;
            font-size: 12px;
            direction: ltr; /* Keep text left-to-right */
        }
        #external-music-menu .menu-section {
            color: #DA2323 !important; /* Last.fm red for subheadings */
        }
        #current-context {
            color: #FF1B20 !important; /* Red for the selection, with !important to override */
            font-size: 20px; /* Increased for better visibility */
            font-weight: bold;
            direction: ltr; /* Keep text left-to-right */
        }
        .menu-section {
            cursor: pointer;
            display: flex;
            align-items: center;
            user-select: none;
        }
        .menu-section::after {
            content: '▼';
            margin-left: auto;
            font-size: 10px;
            transition: transform 0.2s;
        }
        .menu-section.collapsed::after {
            transform: rotate(-90deg);
        }
        .section-content {
            display: none;
        }
        .section-content.visible {
            display: block;
        }
        .settings-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 15px;
            color: white;
            font-size: 13px;
        }
        .toggle-switch {
            position: relative;
            width: 40px;
            height: 20px;
            background: #555;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .toggle-switch.active {
            background: #DA2323;
        }
        .toggle-switch::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
        }
        .toggle-switch.active::after {
            transform: translateX(20px);
        }
        .toggle-switch::before {
            content: attr(data-text);
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 10px;
            font-weight: bold;
            z-index: 1;
            text-align: center;
            width: 100%;
        }
        .hidden-section {
            display: none !important;
        }
        #external-music-menu a {
            display: block;
            padding: 8px 15px;
            color: white !important;
            text-decoration: none !important;
            font-size: 13px; /* Slightly smaller font for options */
            direction: ltr; /* Keep text left-to-right */
        }
        #external-music-menu a:hover {
            background: #3a3a3a;
            color: #DA2323 !important; /* Last.fm red */
        }
        #external-music-menu hr {
            margin: 8px 0;
            border: none;
            height: 1px;
            background: #444;
            direction: ltr; /* Keep horizontal rule normal */
        }
        #external-music-menu a.disabled {
            color: #666 !important;
            pointer-events: none;
        }
        #search-input-container {
            padding: 10px 15px;
            display: flex;
            justify-content: center;
            direction: ltr;
        }
        #search-input {
            width: 150px;
            background: #3a3a3a;
            border: 1px solid #555;
            border-radius: 3px;
            padding: 6px 10px;
            color: white;
            font-size: 13px;
            box-sizing: border-box;
        }
        #search-input:focus {
            outline: none;
            border-color: #DA2323;
        }

    `);

  // Variables for current context (from popup script)
  let currentArtist = "";
  let currentAlbum = "";

  // Setup popup UI (adapted from expanded script)
  function setupUI() {
    // Create button
    const button = document.createElement("div");
    button.id = "external-music-button";
    button.innerHTML = '<i class="fa-brands fa-lastfm"></i>';
    button.title = "External Music Services";
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const menu = document.getElementById("external-music-menu");
      menu.classList.toggle("visible");
    });
    document.body.appendChild(button);

    // Create menu with expanded and categorized links (added Fanart.tv and Musixmatch, separator before Databases)
    const menu = document.createElement("div");
    menu.id = "external-music-menu";
    menu.innerHTML = `
            <p id="current-context"></p>
            <hr>
            <a href="#" id="search-link" target="_blank" title="Search">Search</a>
            <hr>
            <p class="menu-section" data-section="databases">Databases</p>
            <div class="section-content" data-section="databases">
                <a href="#" id="google-band-link" target="_blank" title="Search Google for Band">Google</a>
                <a href="#" id="metal-archives-link" target="_blank" title="Search on Metal Archives">Metal Archives</a>
                <a href="#" id="rym-link" target="_blank" title="Search on Rate Your Music">Rate Your Music</a>
                <a href="#" id="discogs-link" target="_blank" title="Search on Discogs">Discogs</a>
                <a href="#" id="musicbrainz-link" target="_blank" title="Search on MusicBrainz">MusicBrainz</a>
                <a href="#" id="wikipedia-link" target="_blank" title="Search on Wikipedia">Wikipedia</a>
            </div>
            <hr>
            <p class="menu-section" data-section="streaming">Streaming</p>
            <div class="section-content" data-section="streaming">
                <a href="#" id="spotify-link" target="_blank" title="Search on Spotify">Spotify</a>
                <a href="#" id="youtube-link" target="_blank" title="Search on YouTube">YouTube</a>
                <a href="#" id="youtube-music-link" target="_blank" title="Search on YouTube Music">YouTube Music</a>
                <a href="#" id="apple-music-link" target="_blank" title="Search on Apple Music">Apple</a>
                <a href="#" id="bandcamp-link" target="_blank" title="Search on Bandcamp">Bandcamp</a>
                <a href="#" id="soundcloud-link" target="_blank" title="Search on SoundCloud">SoundCloud</a>
                <a href="#" id="deezer-link" target="_blank" title="Search on Deezer">Deezer</a>
                <a href="#" id="tidal-link" target="_blank" title="Search on Tidal">Tidal</a>
                <a href="#" id="amazon-link" target="_blank" title="Search on Amazon Music">Amazon</a>
            </div>
            <hr>
            <p class="menu-section" data-section="lyrics">Lyrics</p>
            <div class="section-content" data-section="lyrics">
                <a href="#" id="genius-link" target="_blank" title="Search on Genius">Genius</a>
                <a href="#" id="darklyrics-link" target="_blank" title="Search on DarkLyrics">Dark Lyrics</a>
                <a href="#" id="google-lyrics-link" target="_blank" title="Search Google for Lyrics">Google</a>
                <a href="#" id="musixmatch-link" target="_blank" title="Search on Musixmatch">Musixmatch</a>
            </div>
            <hr>
            <p class="menu-section" data-section="covers">Covers & Images</p>
            <div class="section-content" data-section="covers">
                <a href="#" id="cov-musichoarderz-link" target="_blank" title="Search Covers on MusicHoarderz">COV - MusicHoarders</a>
                <a href="#" id="google-images-link" target="_blank" title="Search Large Images on Google">Google</a>
                <a href="#" id="yahoo-images-link" target="_blank" title="Search Images on Yahoo">Yahoo</a>
                <a href="#" id="bing-images-link" target="_blank" title="Search Images on Bing">Bing</a>
            </div>
            <hr>
            <p class="menu-section" data-section="social">Social Media</p>
            <div class="section-content" data-section="social">
                <a href="#" id="instagram-link" target="_blank" title="Explore Tag on Instagram">Instagram</a>
                <a href="#" id="facebook-link" target="_blank" title="Search on Facebook">Facebook</a>
                <a href="#" id="reddit-link" target="_blank" title="Search on Reddit">Reddit</a>
            </div>
            <hr>
            <p class="menu-section" data-section="additional">Additional</p>
            <div class="section-content" data-section="additional">
                <a href="#" id="allmusic-link" target="_blank" title="Search on AllMusic">AllMusic</a>
                <a href="#" id="chosic-link" target="_blank" title="Search on Chosic">Chosic</a>
                <a href="#" id="spirit-of-metal-link" target="_blank" title="Search on Spirit of Metal">Spirit of Metal</a>
                <a href="#" id="metalstorm-link" target="_blank" title="Search on MetalStorm">Metal Storm</a>
                <a href="#" id="fanart-tv-link" target="_blank" title="Search on Fanart.tv">Fanart.tv</a>
                <a href="#" id="lucida-link" target="_blank" title="Search on Lucida">Lucida</a>
            </div>
            <hr>
            <p class="menu-section" data-section="ai">AI</p>
            <div class="section-content" data-section="ai">
                <a href="#" id="perplexity-link" target="_blank" title="Search on Perplexity">Perplexity</a>
                <a href="#" id="chatgpt-link" target="_blank" title="Search on ChatGPT">ChatGPT</a>
                <a href="#" id="you-link" target="_blank" title="Search on You">You</a>
                <a href="#" id="grok-link" target="_blank" title="Search on Grok">Grok</a>
            </div>
            <hr>
            <p class="menu-section" data-section="settings">Settings</p>
            <div class="section-content" data-section="settings">
                <div class="settings-item">
                    <span>Artist symbol</span>
                    <div id="toggle-artist-symbol" class="toggle-switch active" data-text="Hide"></div>
                </div>
                <div class="settings-item">
                    <span>Album symbol</span>
                    <div id="toggle-album-symbol" class="toggle-switch active" data-text="Hide"></div>
                </div>
                <div class="settings-item">
                    <span>Databases</span>
                    <div id="toggle-section-databases" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>Streaming</span>
                    <div id="toggle-section-streaming" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>Lyrics</span>
                    <div id="toggle-section-lyrics" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>Covers & Images</span>
                    <div id="toggle-section-covers" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>Social Media</span>
                    <div id="toggle-section-social" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>Additional</span>
                    <div id="toggle-section-additional" class="toggle-switch" data-text="Show"></div>
                </div>
                <div class="settings-item">
                    <span>AI</span>
                    <div id="toggle-section-ai" class="toggle-switch" data-text="Show"></div>
                </div>
            </div>
            <hr>
            <p class="menu-section" data-section="custom">Custom</p>
            <div class="section-content" data-section="custom">
                <div id="search-input-container">
                    <input type="text" id="search-input" placeholder="Artist or Artist - Album">
                </div>
            </div>
        `;
    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      const menu = document.getElementById("external-music-menu");
      const button = document.getElementById("external-music-button");
      if (
        e.target !== button &&
        !menu.contains(e.target) &&
        !e.target.classList.contains("LMAa")
      ) {
        menu.classList.remove("visible");
      }
    });

    // Close menu on link click for better UX
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("visible");
      }
    });

    // Handle search input
    const searchInput = document.getElementById("search-input");

    function handleSearch() {
      const query = searchInput.value.trim();
      if (query) {
        // Try to detect if it's an album format (Artist - Album)
        const albumMatch = query.match(/^(.+)\s+-\s+(.+)$/i);
        if (albumMatch) {
          currentArtist = albumMatch[1].trim();
          currentAlbum = albumMatch[2].trim();
        } else {
          // Default to treating as artist
          currentArtist = query;
          currentAlbum = "";
        }
        updateMenuLinks(currentArtist, currentAlbum);
        searchInput.value = "";
      }
    }

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleSearch();
      }
    });

    // Handle section toggle
    const sectionHeaders = document.querySelectorAll(".menu-section");

    // Load saved state from localStorage
    sectionHeaders.forEach((header) => {
      const sectionName = header.getAttribute("data-section");
      if (sectionName) {
        const savedState = localStorage.getItem(`menu-section-${sectionName}`);
        if (savedState === "expanded") {
          header.classList.remove("collapsed");
          const content = document.querySelector(
            `.section-content[data-section="${sectionName}"]`,
          );
          if (content) {
            content.classList.add("visible");
          }
        } else {
          header.classList.add("collapsed");
        }
      }
    });

    // Load toggle states and update labels
    const artistToggle = document.getElementById("toggle-artist-symbol");
    const albumToggle = document.getElementById("toggle-album-symbol");

    if (localStorage.getItem("setting-artist-symbol") === "false") {
      artistToggle.classList.remove("active");
      artistToggle.dataset.text = "Show";
    }
    if (localStorage.getItem("setting-album-symbol") === "false") {
      albumToggle.classList.remove("active");
      albumToggle.dataset.text = "Show";
    }

    // Add toggle event listeners for symbol settings
    artistToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      const isActive = this.classList.contains("active");
      localStorage.setItem(
        "setting-artist-symbol",
        isActive ? "true" : "false",
      );
      this.dataset.text = isActive ? "Hide" : "Show";
    });

    albumToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      const isActive = this.classList.contains("active");
      localStorage.setItem("setting-album-symbol", isActive ? "true" : "false");
      this.dataset.text = isActive ? "Hide" : "Show";
    });

    // Load and apply section visibility settings
    const sections = [
      "databases",
      "streaming",
      "lyrics",
      "covers",
      "social",
      "additional",
      "ai",
    ];
    sections.forEach((section) => {
      const toggle = document.getElementById(`toggle-section-${section}`);
      const label = document.getElementById(`label-section-${section}`);
      const sectionHeader = document.querySelector(
        `.menu-section[data-section="${section}"]`,
      );
      const sectionContent = document.querySelector(
        `.section-content[data-section="${section}"]`,
      );
      const prevSectionHR = sectionHeader.previousElementSibling;

      if (localStorage.getItem(`setting-section-${section}`) === "true") {
        toggle.classList.add("active");
        if (sectionHeader) sectionHeader.classList.add("hidden-section");
        if (sectionContent) sectionContent.classList.add("hidden-section");
        if (prevSectionHR && prevSectionHR.tagName === "HR")
          prevSectionHR.classList.add("hidden-section");
      }

      toggle.addEventListener("click", function () {
        this.classList.toggle("active");
        const isHidden = this.classList.contains("active");
        localStorage.setItem(
          `setting-section-${section}`,
          isHidden ? "true" : "false",
        );
        this.dataset.text = isHidden ? "Show" : "Hide";

        if (sectionHeader)
          sectionHeader.classList.toggle("hidden-section", isHidden);
        if (sectionContent)
          sectionContent.classList.toggle("hidden-section", isHidden);
        if (prevSectionHR && prevSectionHR.tagName === "HR")
          prevSectionHR.classList.toggle("hidden-section", isHidden);
      });
    });

    sectionHeaders.forEach((header) => {
      header.addEventListener("click", function () {
        const sectionName = this.getAttribute("data-section");
        if (sectionName) {
          this.classList.toggle("collapsed");
          const content = document.querySelector(
            `.section-content[data-section="${sectionName}"]`,
          );
          if (content) {
            content.classList.toggle("visible");

            // Save state to localStorage
            const isExpanded = content.classList.contains("visible");
            localStorage.setItem(
              `menu-section-${sectionName}`,
              isExpanded ? "expanded" : "collapsed",
            );
          }
        }
      });
    });
  }

  // Update menu links (from popup script, adapted)
  function updateMenuLinks(artist, album) {
    const encodedArtist = encodeURIComponent(artist || "");
    const encodedAlbum = encodeURIComponent(album || "");
    const query = album ? `${encodedAlbum} ${encodedArtist}` : encodedArtist;

    // Update menu header with just the selection in red
    const contextEl = document.getElementById("current-context");
    if (artist && album) {
      contextEl.textContent = `Album: ${album}`;
    } else if (artist) {
      contextEl.textContent = artist;
    } else {
      contextEl.textContent = "No artist/album detected";
    }

    // Disable links if no artist
    const links = document.querySelectorAll("#external-music-menu a");
    links.forEach((link) => {
      if (!artist) {
        link.classList.add("disabled");
        link.href = "#";
      } else {
        link.classList.remove("disabled");
      }
    });

    if (!artist) return;

    // Update each link (prioritize album + artist where supported)
    if (album) {
      document.getElementById("metal-archives-link").href =
        `https://www.metal-archives.com/search?type=album_title&searchString=${encodeURIComponent(album)}`;
    } else {
      document.getElementById("metal-archives-link").href =
        `https://www.metal-archives.com/search?type=band_name&searchString=${encodedArtist}`;
    }
    document.getElementById("rym-link").href =
      `https://rateyourmusic.com/search?searchtype=${album ? "l" : "a"}&searchterm=${query}`;
    document.getElementById("discogs-link").href =
      `https://www.discogs.com/search/?q=${query}&type=${album ? "release" : "artist"}`;
    document.getElementById("musicbrainz-link").href =
      `https://musicbrainz.org/search?query=${query}&type=${album ? "release" : "artist"}`;
    document.getElementById("spotify-link").href =
      `https://open.spotify.com/search/${query}`;
    document.getElementById("youtube-link").href =
      `https://www.youtube.com/results?search_query=${query}`;
    document.getElementById("apple-music-link").href =
      `https://music.apple.com/us/search?term=${query}`;
    document.getElementById("bandcamp-link").href =
      `https://bandcamp.com/search?q=${query}`;
    document.getElementById("soundcloud-link").href =
      `https://soundcloud.com/search?q=${query}`;
    document.getElementById("deezer-link").href =
      `https://www.deezer.com/search/${query}`;
    document.getElementById("youtube-music-link").href =
      `https://music.youtube.com/search?q=${query}`;
    document.getElementById("tidal-link").href =
      `https://tidal.com/search?q=${query}`;
    document.getElementById("amazon-link").href =
      `https://music.amazon.com.au/search?k=${query}`;
    // Lyrics section
    document.getElementById("genius-link").href =
      `https://genius.com/search?q=${query}`;
    document.getElementById("darklyrics-link").href =
      `http://www.darklyrics.com/search?q=${query}`;
    document.getElementById("google-lyrics-link").href =
      `https://www.google.com/search?q=${query}+lyrics`;
    document.getElementById("musixmatch-link").href =
      `https://www.musixmatch.com/search?query=${query}`;
    // COV - MusicHoarderz: Artist-focused, but include album if present
    if (album) {
      document.getElementById("cov-musichoarderz-link").href =
        `https://covers.musichoarders.xyz/?artist=${encodedArtist}&album=${encodedAlbum}`;
    } else {
      document.getElementById("cov-musichoarderz-link").href =
        `https://covers.musichoarders.xyz/?artist=${encodedArtist}`;
    }
    // Social and general: Use query (album + artist or artist)
    document.getElementById("instagram-link").href =
      `https://www.instagram.com/explore/search/keyword/?q=${encodedArtist}+${album ? "album" : "band"}`;
    document.getElementById("facebook-link").href =
      `https://www.facebook.com/search/top?q=${query}`;
    document.getElementById("reddit-link").href =
      `https://www.reddit.com/search/?q=${query}`;
    document.getElementById("google-band-link").href =
      `https://www.google.com/search?q=${query}+${album ? "album" : "band"}`;
    document.getElementById("google-images-link").href =
      `https://www.google.com/search?tbm=isch&q=${query}+${album ? "album" : "band"}&tbs=isz:l`;
    document.getElementById("yahoo-images-link").href =
      `https://images.search.yahoo.com/search/images;_ylt=Awr93q4OWZBps5MqfGaJzbkF?p=${query}&fr2=p%3As%2Cv%3Ai`;
    document.getElementById("bing-images-link").href =
      `https://www.bing.com/images/search?q=${query}`;
    // Additional section
    // For albums, search Wikipedia instead of direct link
    if (album) {
      document.getElementById("wikipedia-link").href =
        `https://en.wikipedia.org/w/index.php?search=${query}`;
    } else {
      document.getElementById("wikipedia-link").href =
        `https://en.wikipedia.org/wiki/${encodedArtist}`;
    }
    document.getElementById("allmusic-link").href =
      `https://www.allmusic.com/search/all/${query}`;
    document.getElementById("chosic-link").href =
      `https://www.chosic.com/search-results/?q=${query}`;
    document.getElementById("spirit-of-metal-link").href =
      `https://www.spirit-of-metal.com/liste_groupe.php?recherche_groupe=${encodedArtist}&lettre=&id_pays_recherche=0&id_style_recherge=0&dateCrea=0&nb_etoile=0`;
    if (album) {
      document.getElementById("metalstorm-link").href =
        `https://metalstorm.net/bands/albums.php?a_where=a.albumname&a_what=${encodedAlbum}`;
    } else {
      document.getElementById("metalstorm-link").href =
        `https://metalstorm.net/bands/index.php?b_where=b.bandname&b_what=${encodedArtist}`;
    }
    document.getElementById("fanart-tv-link").href =
      `https://fanart.tv/add-entry/?tab=music&search=${encodedArtist}${album ? `+${encodedAlbum}` : ""}#music`;
    // Lucida
    document.getElementById("lucida-link").href =
      `https://lucida.to/search?query=${query}&service=qobuz`;
    // Search link
    document.getElementById("search-link").href =
      `https://www.google.com/search?udm=50&source=searchlabs&q=${query}`;
    // AI section
    let aiPrompt;
    if (album) {
      aiPrompt = encodeURIComponent(
        `give me a comprehensive overview of the album ${album} by ${artist}`,
      );
    } else {
      aiPrompt = encodeURIComponent(
        `give me a comprehensive overview of the band ${artist}`,
      );
    }
    document.getElementById("perplexity-link").href =
      `https://www.perplexity.ai/search/new?q=${aiPrompt}`;
    document.getElementById("chatgpt-link").href =
      `https://chatgpt.com/?prompt=${aiPrompt}`;
    document.getElementById("you-link").href =
      `https://you.com/search?q=${aiPrompt}`;
    document.getElementById("grok-link").href =
      `https://grok.com?q=${aiPrompt}`;
  }

  // Function to show popup with artist context
  function showPopupForArtist(artistName) {
    currentArtist = artistName.replace(/\+/g, " "); // Removed .toLowerCase() to preserve case
    currentAlbum = ""; // Dots are for artists, so no album
    updateMenuLinks(currentArtist, currentAlbum);
    const menu = document.getElementById("external-music-menu");
    menu.classList.add("visible");
  }

  const selector =
    'a:not(.auth-dropdown-menu-item):not([aria-hidden="true"])[href^="/music/"]';
  const headerSelector = 'h1.header-new-title[itemprop="name"]';

  function addDotLink(artistLink) {
    const artistPath = new URL(artistLink.href).pathname;

    // Skip track pages (three segments after /music/)
    const trackMatch = artistPath.match(/\/music\/[^/]+\/[^/]+\/[^/]+$/i);
    if (trackMatch) return;

    // Skip internal Last.fm pages (contain /+)
    if (artistPath.includes("/+")) return;

    // Check settings for showing symbols
    const showArtistSymbol =
      localStorage.getItem("setting-artist-symbol") !== "false";
    const showAlbumSymbol =
      localStorage.getItem("setting-album-symbol") !== "false";

    const albumMatch = artistPath.match(/\/music\/([^/#]+)\/([^/#]+)$/i);
    const artistMatch = artistPath.match(/\/music\/([^/#]+)$/i);

    if (albumMatch && showAlbumSymbol) {
      // Album page: /music/Artist/Album
      const artistName = decodeURIComponent(albumMatch[1]);
      const albumName = decodeURIComponent(albumMatch[2]);
      if (!artistName || !albumName) return;

      const dotLink = createDotLink(albumName, artistLink, true);
      dotLink.dataset.artist = artistName;
      dotLink.dataset.album = albumName;
      artistLink.insertAdjacentElement("afterend", dotLink);
    } else if (artistMatch && showArtistSymbol) {
      // Artist page: /music/Artist
      const artistName = decodeURIComponent(artistMatch[1]);
      if (!artistName) return;

      const dotLink = createDotLink(artistName, artistLink, false);
      artistLink.parentNode.insertBefore(dotLink, artistLink);
    }
  }

  function createDotLink(name, anchorEl, isAlbum) {
    const dotLink = document.createElement("span");
    dotLink.className = "LMAa";
    dotLink.title = `Open external music services for ${isAlbum ? "album" : "artist"}: ${name}`;
    dotLink.innerText = isAlbum ? "≫ " : "⁖ ";
    dotLink.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (isAlbum) {
        showPopupForAlbum(dotLink.dataset.artist, dotLink.dataset.album);
      } else {
        showPopupForArtist(name);
      }
    };

    const computedStyle = getComputedStyle(anchorEl);
    dotLink.style.color = computedStyle.color;
    dotLink.style.fontSize = computedStyle.fontSize;

    return dotLink;
  }

  function showPopupForAlbum(artistName, albumName) {
    currentArtist = artistName.replace(/\+/g, " ");
    currentAlbum = albumName.replace(/\+/g, " ");
    updateMenuLinks(currentArtist, currentAlbum);
    const menu = document.getElementById("external-music-menu");
    menu.classList.add("visible");
  }

  function addDotLinks(node) {
    const nodeListA = node.querySelectorAll(selector);
    for (const artistLink of nodeListA) {
      addDotLink(artistLink);
    }

    const nodeListH1 = node.querySelectorAll(headerSelector);
    for (const headerElement of nodeListH1) {
      const headerText = headerElement.innerText;
      const dotLink = createDotLink(headerText, headerElement);
      headerElement.parentNode.insertBefore(dotLink, headerElement);
    }
  }

  // Initialize popup and dots (matching original exactly)
  setupUI();
  addDotLinks(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          addDotLinks(node);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
