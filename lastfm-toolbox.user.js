// ==UserScript==
// @name           Last.fm: Toolbox
// @namespace      https://github.com/deathrashed/lastfm-userscript
// @description     A context-aware popup with over 60 curated services across 8 categories, injected into every artist, album, and track link on Last.fm. Includes an AI prompt generator and comprehensive user controls.
// @icon           https://cdn.icon-icons.com/icons2/808/PNG/512/lastfm_icon-icons.com_66107.png
// @match          https://www.last.fm/*
// @match          https://www.lastfm.*/*
// @match          https://cn.last.fm/*
// @version        6
// @license        MIT
// @grant          GM_addStyle
// @grant          GM_registerMenuCommand
// @author         deathrashed
// @require        https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js
// @downloadURL    https://update.greasyfork.org/scripts/563609/Lastfm%3A%20Toolbox.user.js
// @updateURL      https://update.greasyfork.org/scripts/563609/Lastfm%3A%20Toolbox.meta.js
// ==/UserScript==

(function () {
  "use strict";

  const faLink = document.createElement("link");
  faLink.rel = "stylesheet";
  faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
  document.head.appendChild(faLink);

  GM_addStyle(`
    :root {
      --bg-primary: #282828;
      --bg-secondary: #3a3a3a;
      --bg-hover: #3a3a3a;
      --text-primary: #fff;
      --text-secondary: #999;
      --text-disabled: #666;
      --border-color: #444;
      --input-bg: #3a3a3a;
      --input-border: #555;
      /* scrollbar: hardcoded per-element */
      --toggle-off: #555;
      --toggle-on: #DA2323;
      --brand: #DA2323;
      --brand-rgb: 218, 35, 35;
      --brand-hover: #FF1B20;
      --shadow: rgba(0,0,0,.3);
      --menu-shadow: rgba(0,0,0,.3);
      --scrollbar-bg: #282828;
      --scrollbar-thumb: #666;
      --scrollbar-thumb-hover: #999;
    }

    .lfm-light-mode {
      --bg-primary: #f5f5f5;
      --bg-secondary: #e8e8e8;
      --bg-hover: #e0e0e0;
      --text-primary: #1a1a1a;
      --text-secondary: #777;
      --text-disabled: #bbb;
      --border-color: #ddd;
      --input-bg: #fff;
      --input-border: #ccc;
      /* scrollbar: hardcoded per-element */
      --toggle-off: #ddd;
      --shadow: rgba(0,0,0,.12);
      --menu-shadow: rgba(0,0,0,.12);
      --scrollbar-bg: #e5e5e5;
      --scrollbar-thumb: #a0a0a0;
      --scrollbar-thumb-hover: #7a7a7a;
    }

    #external-music-button {
      position: fixed;
      width: 40px;
      height: 40px;
      background: var(--bg-primary);
      color: var(--brand);
      border-radius: 50%;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      font-size: 20px;
      box-shadow: 0 2px 5px var(--shadow);
      z-index: 99999999 !important;
      transition: background .2s, color .2s;
    }

    #external-music-button:hover {
      background: var(--bg-hover);
      color: var(--brand-hover);
    }

    #external-music-menu {
      position: fixed;
      background: var(--bg-primary);
      border-radius: 8px;
      box-shadow: 0 4px 16px var(--menu-shadow);
      display: none;
      z-index: 99999999 !important;
      width: 260px;
      max-height: 600px;
      direction: rtl;
      overflow: hidden;
    }

    #lfm-scroll-area {
      direction: ltr;
      overflow-y: auto;
      max-height: 600px;
      padding: 4px 0;
    }

    #lfm-scroll-area::-webkit-scrollbar { width: 6px; }
    #lfm-scroll-area::-webkit-scrollbar-track { background: var(--scrollbar-bg); }
    #lfm-scroll-area::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }
    #lfm-scroll-area::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-track { background: var(--scrollbar-bg); }
    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); }
    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

    #external-music-menu.visible {
      display: block;
      animation: lfmSlideUp .2s ease-out;
    }

    html.lfm-toggle-bottom-left #external-music-button { top: auto; right: auto; bottom: 20px; left: 20px; }
    html.lfm-toggle-bottom-left #external-music-menu { top: auto; right: auto; bottom: 70px; left: 20px; }
    html.lfm-toggle-bottom-right #external-music-button { top: auto; left: auto; bottom: 20px; right: 20px; }
    html.lfm-toggle-bottom-right #external-music-menu { top: auto; left: auto; bottom: 70px; right: 20px; }
    html.lfm-toggle-top-left #external-music-button { bottom: auto; right: auto; top: 75px; left: 20px; }
    html.lfm-toggle-top-left #external-music-menu { top: auto; right: auto; bottom: 20px; left: 20px; }
    html.lfm-toggle-top-right #external-music-button { bottom: auto; left: auto; top: 75px; right: 20px; }
    html.lfm-toggle-top-right #external-music-menu { top: auto; left: auto; bottom: 20px; right: 20px; }

    @keyframes lfmSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes lfmSlideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    #external-music-menu p {
      margin: 0;
      padding: 5px 15px;
      color: var(--text-secondary);
      font-size: 12px;
      direction: ltr;
    }

    #current-context {
      color: var(--brand-hover) !important;
      font-size: 18px;
      font-weight: bold;
      direction: ltr;
    }

    .menu-section {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      user-select: none;
      direction: ltr;
      padding: 7px 15px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: var(--text-primary);
      transition: color .15s;
    }

    .menu-section:hover {
      color: var(--brand) !important;
    }

    .menu-section .section-chevron {
      font-size: 11px;
      color: var(--text-secondary);
      flex-shrink: 0;
      line-height: 1;
      transition: color .15s;
      user-select: none;
    }

    .menu-section:hover .section-chevron {
      color: var(--brand);
    }

    .section-block { display: block; }
    .section-block.hidden-section { display: none !important; }



    #external-music-menu hr {
      margin: 6px 0;
      border: none;
      height: 1px;
      background: var(--border-color);
    }

    #external-music-menu a i,
    #external-music-menu a svg {
      width: 18px !important;
      min-width: 18px !important;
      margin-right: 10px !important;
      text-align: center;
      color: var(--text-secondary);
      transition: color .15s;
    }

    #external-music-menu a:hover {
      background: var(--bg-hover);
      color: var(--brand) !important;
    }

    #external-music-menu a:hover i,
    #external-music-menu a:hover svg {
      color: var(--brand) !important;
    }

    #external-music-menu a.disabled {
      color: var(--text-disabled) !important;
      pointer-events: none;
    }

    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 15px;
      color: var(--text-primary);
      font-size: 13px;
      direction: ltr;
    }

    .toggle-switch {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all .15s ease;
    }

    .toggle-switch i,
    .toggle-switch svg {
      display: none;
      color: var(--text-primary);
      font-size: 15px;
    }

    .toggle-switch.active i,
    .toggle-switch.active svg {
      display: inline-block;
    }

    .toggle-switch:hover {
      border-color: var(--brand);
    }

    .toggle-switch.active {
      border-color: var(--brand);
      background: rgba(218,35,35,.08);
    }

    .toggle-switch::after {
      display: none;
    }

    .hidden-section { display: none !important; }

   #search-input-container {
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  direction: ltr;
  position: relative;
}

#search-input-wrapper {
  position: relative;
  width: 170px;
}

#search-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  /* Increased right padding (28px) so typed text doesn't hide behind the ? */
  padding: 6px 28px 6px 10px;
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color .2s;
  box-sizing: border-box;
}

#search-input:focus {
  outline: none;
  border-color: var(--brand);
}

/* The "?" Icon */
#search-help-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: bold;
  cursor: help;
  user-select: none;
}

#search-help-popup {
  position: absolute;
  bottom: 100%;
  left: 50%; /* Anchor to the horizontal center of the search bar */
  margin-bottom: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  color: var(--text-primary);
  white-space: normal;
  z-index: 9999;
  box-shadow: 0 4px 12px var(--shadow);
  line-height: 1.5;
  min-width: 240px;
  max-width: 380px;
  word-break: break-word;

  visibility: hidden;
  opacity: 0;
  /* Shift left by 50% of its own width to center it, and push down 5px for the animation */
  transform: translate(-50%, 5px);
  transform-origin: bottom center;
  transition: opacity .12s ease, transform .12s ease, visibility .12s;
  pointer-events: none;
}

#search-input-wrapper:hover #search-help-popup {
  visibility: visible;
  opacity: 1;
  /* Maintain the horizontal centering while sliding up to 0px */
  transform: translate(-50%, 0);
}

    .lfm-custom-form input {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 4px 8px;
      color: var(--text-primary);
      font-size: 11px;
    }

    .lfm-custom-form button {
      background: var(--brand);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 11px;
    }

    .lfm-custom-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 15px;
      color: var(--text-primary);
      font-size: 12px;
      direction: ltr;
    }

    .lfm-custom-item button {
      background: none;
      border: none;
      color: var(--brand);
      cursor: pointer;
    }

    @keyframes lfmFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    #lfm-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,.6);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: lfmFadeIn .15s ease-out;
    }

    #lfm-modal-box {
      background: var(--bg-primary);
      border-radius: 10px;
      box-shadow: 0 8px 32px var(--menu-shadow);
      min-width: 340px;
      max-width: 520px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 20px;
      direction: ltr;
      animation: lfmSlideUp .2s ease-out;
    }

    #lfm-modal-box .modal-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    #lfm-modal-box .modal-header-icon {
      font-size: 18px;
      color: var(--brand);
      width: 24px;
      text-align: center;
    }

    #lfm-modal-box .modal-header-title {
      flex: 1;
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
    }

    #lfm-modal-box .modal-header-close {
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 18px;
      transition: color .15s;
      line-height: 1;
    }

    #lfm-modal-box .modal-header-close:hover { color: var(--brand); }

    #lfm-modal-box h2 {
      margin: 0 0 16px;
      color: var(--brand);
      font-size: 18px;
      font-weight: 700;
    }

    #lfm-modal-close {
      float: right;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 20px;
      transition: color .15s;
    }

    #lfm-modal-close:hover { color: var(--brand); }

    #lfm-modal-box textarea {
      width: 100%;
      box-sizing: border-box;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 6px;
      padding: 10px;
      color: var(--text-primary);
      font-size: 13px;
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }

    #lfm-modal-box textarea:focus {
      outline: none;
      border-color: var(--brand);
    }

    #lfm-modal-box select,
    #lfm-modal-box input[type="text"],
    #lfm-modal-box input[type="number"],
    #lfm-modal-box button {
      background: var(--bg-secondary);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 5px 8px;
      color: var(--text-primary);
      font-size: 12px;
      cursor: pointer;
      transition: background .15s, border-color .15s;
      width: 140px;
      min-width: 140px;
      box-sizing: border-box;
    }

    #lfm-modal-box select:hover,
    #lfm-modal-box input:hover,
    #lfm-modal-box button:hover {
      background: var(--bg-hover);
      border-color: var(--text-secondary);
    }

    #lfm-modal-box select:focus,
    #lfm-modal-box input:focus {
      outline: none;
      border-color: var(--brand);
    }

    #lfm-modal-box button {
      width: auto;
      min-width: auto;
    }

    /* AI Popup Specific Polish */
    .ai-modal .modal-header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    #ai-context-display {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
    }

    #lfm-modal-box .lfm-modal-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    #lfm-modal-box .lfm-modal-actions button {
      flex: 1;
      min-width: 80px;
    }

    #lfm-modal-box .btn-primary {
      background: var(--brand) !important;
      color: #fff !important;
      border-color: var(--brand) !important;
      font-weight: 600;
    }

    #lfm-modal-box .btn-primary:hover {
      background: var(--brand-hover) !important;
    }

    .lfm-prompt-chip {
      display: inline-block;
      padding: 4px 10px;
      margin: 3px 4px 3px 0;
      background: var(--bg-secondary);
      border: 1px solid var(--input-border);
      border-radius: 14px;
      color: var(--text-primary);
      font-size: 12px;
      cursor: pointer;
      transition: background .15s, border-color .15s;
    }

    .lfm-prompt-chip:hover {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
    }

.lfm-toolbox-wrapper {
  display: inline;
}

.lfm-hover-icon {
  visibility: hidden;
  opacity: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  margin-left: 6px;

  border-radius: 50%;
  background: rgba(0,0,0,.75);
  color: #DA2323;

  font-size: 10px;
  cursor: pointer;
  vertical-align: middle;
  transition: opacity .15s ease;
}

.lfm-toolbox-wrapper:hover .lfm-hover-icon {
  visibility: visible;
  opacity: 1;
}

.lfm-grid-toolbox-icon {
  position: absolute;
  right: 6px;
  bottom: 6px;

  width: 22px;
  height: 22px;

  border-radius: 50%;
  background: rgba(0,0,0,.75);
  color: #DA2323;

  display: flex;
  align-items: center;
  justify-content: center;

  visibility: hidden;
  opacity: 0;

  cursor: pointer;
  z-index: 9999;
  transition: opacity .15s ease;
}

.grid-items-item:hover .lfm-grid-toolbox-icon,
.resource-list--release-list-item:hover .lfm-grid-toolbox-icon,
.chartlist-row:hover .lfm-grid-toolbox-icon,
.chartlist tr:hover .lfm-grid-toolbox-icon,
.cover-art:hover .lfm-grid-toolbox-icon,
.chartlist-image:hover .lfm-grid-toolbox-icon {
  visibility: visible;
  opacity: 1;
}

.lfm-hover-icon i,
.lfm-hover-icon svg,
.lfm-grid-toolbox-icon i,
.lfm-grid-toolbox-icon svg {
  pointer-events: none;
}

/* Hide inline elements globally when the select choice is 'hidden' */
    html.lfm-icons-hidden .lfm-hover-icon,
    html.lfm-icons-hidden .lfm-grid-toolbox-icon {
      display: none !important;
    }

    /* Minimal Icon Override Variant */
    html.lfm-icon-style-minimal .lfm-hover-icon,
    html.lfm-icon-style-minimal .lfm-grid-toolbox-icon {
      background: transparent !important;
      box-shadow: none !important;
      color: var(--brand) !important;
      font-size: 14px;
    }

    /* ==========================================================================
       TEXT & GRID HIGHLIGHT LAYER
       Active via standard switch (.lfm-highlight-eligible)
       OR automatically forced when inline icons are hidden (.lfm-icons-hidden)
       ========================================================================== */

    /* 1. Standard inline text links turn red with an underline */
    html.lfm-highlight-eligible a.lfm-toolbox-enabled:hover,
    html.lfm-icons-hidden a.lfm-toolbox-enabled:hover {
      color: var(--brand) !important;
      text-decoration: underline !important;
    }

    /* 2. Albums Grid Layout: Strictly target title nodes. Do not highlight play counts or artist subtexts */
    html.lfm-highlight-eligible .grid-items-item-main-text > a:hover,
    html.lfm-icons-hidden .grid-items-item-main-text > a:hover,
    html.lfm-highlight-eligible .resource-list--release-list-item-main-text > a:hover,
    html.lfm-icons-hidden .resource-list--release-list-item-main-text > a:hover {
      color: var(--brand) !important;
      text-shadow: 0 0 8px rgba(218, 35, 35, 0.6) !important;
      text-decoration: none !important;
    }

    /* 3. Artists Grid Layout: Glow primary string text titles */
    html.lfm-highlight-eligible .grid-items-item-name:hover,
    html.lfm-icons-hidden .grid-items-item-name:hover,
    html.lfm-highlight-eligible .grid-items-item-details > a:hover,
    html.lfm-icons-hidden .grid-items-item-details > a:hover,
    html.lfm-highlight-eligible .cover-art-caption > a:hover,
    html.lfm-icons-hidden .cover-art-caption > a:hover {
      color: var(--brand) !important;
      text-shadow: 0 0 8px rgba(218, 35, 35, 0.6) !important;
      text-decoration: none !important;
    }

.menu-section .section-chevron {
  width: 14px;
  min-width: 14px;
  display: inline-block;
  text-align: center;
  color: var(--brand);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  transition: transform .2s;
}

.section-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height .35s ease, opacity .25s ease, padding .25s ease;
}

.section-content.visible {
  max-height: 5000px;
  opacity: 1;
  overflow: visible;
}

#external-music-menu a {
  display: block;
  padding: 8px 15px;
  color: var(--text-primary) !important;
  text-decoration: none !important;
  font-size: 13px;
  direction: ltr;
  transition: background .15s, padding-left .15s, color .15s;
  border-left: 3px solid transparent;
}

#external-music-menu a:hover {
  background: var(--bg-hover);
  color: var(--brand) !important;
  padding-left: 18px;
  border-left-color: var(--brand);
}

#external-music-menu a.disabled {
  color: var(--text-disabled) !important;
  pointer-events: none;
  border-left-color: transparent;
}

#external-music-menu a.disabled:hover {
  padding-left: 15px;
}

#lfm-modal-box .btn-primary {
  background: var(--brand) !important;
  color: #fff !important;
  border-color: var(--brand) !important;
  font-weight: 600;
  transition: transform .2s, background .2s, box-shadow .2s;
}

#lfm-modal-box .btn-primary:hover {
  background: var(--brand-hover) !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(218,35,35,.25);
}

#lfm-modal-box .btn-primary:active {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  #external-music-menu.visible,
  #lfm-modal-box,
  #lfm-modal-overlay,
  .section-content,
  #external-music-menu a,
  #lfm-modal-box .btn-primary,
  .lfm-hover-icon,
  .lfm-grid-toolbox-icon,
  .menu-section .section-chevron {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}

.lfm-light-mode #external-music-menu,
.lfm-light-mode #lfm-modal-box {
  border: 1px solid #d0d0d0;
}

.lfm-light-mode #external-music-button,
.lfm-light-mode .lfm-hover-icon,
.lfm-light-mode .lfm-grid-toolbox-icon {
  background: #fff;
  border: 1px solid #d0d0d0;
  color: #DA2323;
  box-shadow: 0 2px 6px rgba(0,0,0,.18);
}

#lfm-ai-toggle-bar {
  display: flex;
  justify-content: center;
  padding: 4px 12px 2px;
  direction: ltr;
}

#open-ai-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 8px;
  min-height: 26px;
  min-width: max-content;
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-primary) !important;
  text-decoration: none !important;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  line-height: 1;
  transition: border-color .15s, color .15s, background .15s;
}

#open-ai-btn:hover {
  border-color: var(--brand);
  color: var(--brand) !important;
  text-decoration: none !important;
}

#open-ai-btn .ai-btn-icon {
  display: none;
  font-size: 11px;
  color: var(--brand);
}

#open-ai-btn:hover .ai-btn-icon {
  display: inline;
}

/* #lfm-ai-toggle-btn is just a passthrough span now */
#lfm-ai-toggle-btn {
  display: contents;
}

#lfm-menu-header {
  padding: 4px 15px 4px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Hide the standalone header badge since context is shown inline in quick-actions */
#lfm-header-badge {
  display: none;
}

.context-badge-artist {
  background: #3b5f8a;
  color: #fff;
  border: 1px solid #4a7ab5;
}

.context-badge-album {
  background: rgba(230,126,34,.2);
  color: #f0a050;
  border: 1px solid rgba(230,126,34,.35);
}

.context-badge-track {
  background: rgba(46,204,113,.2);
  color: #6bdb9a;
  border: 1px solid rgba(46,204,113,.35);
}

.lfm-light-mode .context-badge-artist {
  background: rgba(218,35,35,.12);
  color: #c62828;
  border-color: rgba(218,35,35,.3);
}

.lfm-light-mode .context-badge-album {
  background: rgba(230,126,34,.12);
  color: #c67a1e;
  border-color: rgba(230,126,34,.3);
}

.lfm-light-mode .context-badge-track {
  background: rgba(46,204,113,.12);
  color: #2a9d6b;
  border-color: rgba(46,204,113,.3);
}

#lfm-header-title {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
  margin-top: 4px;
}

#lfm-header-subtitle {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 2px;
}

#lfm-quick-actions {
  display: flex;
  gap: 4px;
  padding: 6px 15px 10px;
  direction: ltr;
  align-items: center;
}

#lfm-quick-actions a {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-primary) !important;
  text-decoration: none !important;
  font-size: 12px;
  font-weight: 600;
  transition: border-color .15s, color .15s;
}

#lfm-quick-actions a span {
  display: none;
  line-height: 1;
}

#lfm-quick-actions a:hover {
  border-color: var(--brand);
  color: var(--brand) !important;
}

#lfm-quick-actions a:hover span {
  display: inline;
}

#lfm-quick-actions a i {
  font-size: 16px;
  color: var(--text-secondary);
  transition: color .15s;
}

#lfm-quick-actions a:hover i {
  color: var(--brand);
}

#lfm-context-inline-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  line-height: 1.4;
  cursor: default;
  flex: 2;
}

#search-help {
  margin: 4px 15px 8px;
  font-size: 11px;
  color: var(--text-secondary);
  direction: ltr;
}

#lfm-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 8px 15px;
  direction: ltr;
  border-top: 1px solid var(--border-color);
}

#lfm-footer a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--text-secondary) !important;
  text-decoration: none !important;
  font-size: 16px;
  transition: background .15s, color .15s;
}

#lfm-footer a:hover {
  background: var(--bg-hover);
  color: var(--brand) !important;
}

.section-block {
  margin-bottom: 2px;
}

.section-block[data-section="settings"],
.section-block[data-section="custom"] {
  margin-top: 6px;
}

.menu-section {
  padding: 8px 15px;
}

.menu-section + .section-content a {
  padding: 9px 15px 9px 20px;
}

#lfm-modal-box.settings-modal {
  width: 650px;
  height: 650px;
  max-width: 95vw;
  max-height: 90vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

#lfm-modal-box.settings-modal .settings-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px 0;
  position: relative;
}

#lfm-modal-box.settings-modal .settings-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

#lfm-modal-box.settings-modal .settings-header .settings-header-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--brand);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background .15s, color .15s;
  text-decoration: none;
}

#lfm-modal-box.settings-modal .settings-header .settings-header-btn:hover {
  background: var(--bg-hover);
  color: var(--brand-hover);
}

#lfm-modal-box.settings-modal .settings-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 12px 20px 20px;
  gap: 12px;
  min-height: 0;
}

.settings-modal .settings-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.settings-modal .settings-tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  border: none;
  margin: 0 0 12px;
  padding: 0;
  justify-content: center;
  overflow-x: auto;
}

#lfm-modal-box .settings-tab {
  padding: 4px 10px !important;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px !important;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px !important;
  transition: all .2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

#lfm-modal-box .settings-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

#lfm-modal-box .settings-tab:active {
  transform: none;
}

#lfm-modal-box .settings-tab.active {
  background: rgba(var(--brand-rgb), .10) !important;
  color: var(--text-primary) !important;
  border-color: var(--brand) !important;
  text-decoration: underline;
  text-decoration-color: var(--brand);
  text-underline-offset: 2px;
  box-shadow: inset 0 0 0 1px rgba(var(--brand-rgb), .15);
}

#lfm-modal-box .settings-tab.active i {
  color: var(--text-primary) !important;
}

#lfm-modal-box .settings-tab:focus {
  outline: none;
}

#lfm-modal-box .settings-tab:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: -1px;
}

#lfm-modal-box .settings-tab i {
  font-size: 12px;
  width: 14px;
  text-align: center;
  flex-shrink: 0;
  transition: color .2s;
}

.settings-modal .settings-panel {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.service-launch-btn.hidden {
  display: none !important;
}

.settings-panel {
  min-height: 80px;
}

.settings-card {
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  padding: 12px;
}

.settings-card-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-grid-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  padding: 12px !important;
  transition: border-color .15s, background .15s !important;
  box-sizing: border-box;
}

a.settings-grid-card:hover {
  border-color: var(--brand) !important;
  background: var(--bg-hover) !important;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.settings-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.settings-section-title {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background .15s, border-color .15s;
  box-sizing: border-box;
  border: 1px solid transparent;
}

.settings-item + .settings-item {
  border-top: 1px solid rgba(255, 255, 255, .08);
}

.settings-item:hover {
  background: var(--bg-hover);
  border-color: rgba(218, 35, 35, .25);
}

.settings-item select {
  flex-shrink: 0;
  min-width: 130px;
}

.modal-hr {
  border: none;
  height: 1px;
  background: var(--border-color);
  margin: 12px 0;
}

.ai-dropdown-row {
  display: flex;
  gap: 12px;
  margin: 0;
  direction: ltr;
}

.ai-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ai-field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: .6px;
}

.ai-field select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .15s;
}

.ai-field select:focus {
  border-color: var(--brand);
  outline: none;
}

.ai-provider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  direction: ltr;
}

.ai-provider-row label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: .6px;
  white-space: nowrap;
}

.ai-provider-row select {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .15s;
}

.ai-provider-row select:focus {
  border-color: var(--brand);
  outline: none;
}

.lfm-modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  direction: ltr;
}

.lfm-modal-actions button {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.lfm-modal-actions button:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow);
  border-color: var(--text-secondary);
}

.lfm-modal-actions button:active {
  transform: translateY(0);
}

.lfm-modal-actions button i {
  margin-right: 6px;
}

#ai-context-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 10px;
  direction: ltr;
}

.ai-context-icon {
  font-size: 16px;
  color: var(--brand);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.ai-context-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--text-secondary);
  padding: 2px 6px;
  background: var(--bg-primary);
  border-radius: 4px;
}

.ai-context-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-custom-form {
  display: flex;
  gap: 4px;
  padding: 10px 12px;
  direction: ltr;
  flex-wrap: wrap;
}

.settings-custom-form input {
  flex: 1;
  min-width: 100px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 6px 8px;
  color: var(--text-primary);
  font-size: 12px;
}

.settings-custom-form button {
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.settings-remove-btn {
  background: none;
  border: none;
  color: var(--text-disabled);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: color .15s, background .15s;
  flex-shrink: 0;
}

.settings-remove-btn:hover {
  color: var(--brand);
  background: var(--bg-hover);
}

#settings-custom-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
}

#settings-custom-list:empty {
  display: none;
}

#lfm-modal-box.ai-modal {
  width: 650px;
  height: 650px;
  max-width: 95vw;
  max-height: 90vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
}

#lfm-modal-box.ai-modal #ai-prompt-text {
  flex: 1;
  resize: none;
  margin: 10px 0;
}

#lfm-scroll-area::-webkit-scrollbar,
#lfm-modal-box.ai-modal::-webkit-scrollbar,
.settings-modal .settings-panel::-webkit-scrollbar,
#settings-custom-list::-webkit-scrollbar {
  width: 6px;
}

#lfm-scroll-area::-webkit-scrollbar-track,
#lfm-modal-box.ai-modal::-webkit-scrollbar-track,
.settings-modal .settings-panel::-webkit-scrollbar-track,
#settings-custom-list::-webkit-scrollbar-track {
  background: var(--scrollbar-bg);
}

#lfm-scroll-area::-webkit-scrollbar-thumb,
#lfm-modal-box.ai-modal::-webkit-scrollbar-thumb,
.settings-modal .settings-panel::-webkit-scrollbar-thumb,
#settings-custom-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

#lfm-scroll-area::-webkit-scrollbar-thumb:hover,
#lfm-modal-box.ai-modal::-webkit-scrollbar-thumb:hover,
.settings-modal .settings-panel::-webkit-scrollbar-thumb:hover,
#settings-custom-list::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-track,
.lfm-light-mode #lfm-modal-box.ai-modal::-webkit-scrollbar-track,
.lfm-light-mode .settings-modal .settings-panel::-webkit-scrollbar-track,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-track {
  background: var(--scrollbar-bg);
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb,
.lfm-light-mode #lfm-modal-box.ai-modal::-webkit-scrollbar-thumb,
.lfm-light-mode .settings-modal .settings-panel::-webkit-scrollbar-thumb,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb:hover,
.lfm-light-mode #lfm-modal-box.ai-modal::-webkit-scrollbar-thumb:hover,
.lfm-light-mode .settings-modal .settings-panel::-webkit-scrollbar-thumb:hover,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

.service-row {
  display: flex;
  align-items: center;
}

.service-link {
  flex: 1;
  min-width: 0;
  display: flex !important;
  align-items: center;
}

.service-launch-btn {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity .15s;
  line-height: 1;
}

    .service-row:hover .service-launch-btn {
  opacity: .65;
}

    /* Always show the theaudiodb json/md buttons and make action icons visible */
    .service-json-btn, .service-md-btn {
      opacity: 1 !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      margin-left: 6px;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .service-json-btn:hover, .service-md-btn:hover {
      color: var(--brand);
    }

    /* Style for small action icons placed next to services */
    .service-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }

.service-action-btn {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 4px;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.75;
  transition: opacity .15s, color .15s;
  line-height: 1;
}

.service-action-btn:hover {
  opacity: 1;
  color: var(--brand);
}

.service-action-btn i,
.service-action-btn svg {
  pointer-events: none;
}

.service-launch-btn:hover {
  opacity: 1 !important;
  color: var(--brand);
}

.service-ai-btn {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 4px;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity .15s, color .15s;
  line-height: 1;
}

.service-row:hover .service-ai-btn {
  opacity: .65;
}

.service-ai-btn:hover {
  opacity: 1 !important;
  color: var(--brand) !important;
}

.service-ai-btn i,
.service-ai-btn svg,
.service-json-btn i,
.service-json-btn svg,
.service-md-btn i,
.service-md-btn svg {
  pointer-events: none;
}

.service-json-btn,
.service-md-btn {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 4px;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity .15s, color .15s;
  line-height: 1;
}

.service-row:hover .service-json-btn,
.service-row:hover .service-md-btn {
  opacity: .65;
}

.service-json-btn:hover,
.service-md-btn:hover {
  opacity: 1 !important;
  color: var(--brand) !important;
}

.service-launch-btn i,
.service-launch-btn svg {
  pointer-events: none;
}

/* Hide specific individual services when deactivated in settings */
#external-music-menu .service-row.lfm-service-hidden {
  display: none !important;
}
  `);

  let currentContext = { type: "artist", artist: "", album: "", track: "" };
  let lastUrl = location.href;

  const CATEGORY_ORDER = ["databases", "streaming", "lyrics", "covers", "social", "additional", "lfm-tools", "ai"];

  const CATEGORY_LABELS = {
    databases: "Databases",
    streaming: "Streaming",
    lyrics: "Lyrics",
    covers: "Covers & Images",
    social: "Social Media",
    additional: "Utilities",
    "lfm-tools": "LFM Tools",
    ai: "AI",
  };

  const SERVICE_CATEGORIES = {
    databases: ["google-band-link", "album-of-the-year-link", "theaudiodb-link", "metal-archives-link", "rym-link", "discogs-link", "musicbrainz-link", "wikipedia-link", "allmusic-link", "listenbrainz-link", "everynoise-link"],
    streaming: ["spotify-link", "youtube-link", "youtube-music-link", "apple-music-link", "bandcamp-link", "soundcloud-link", "deezer-link", "tidal-link", "amazon-link", "qobuz-link", "audiomack-link", "monochrome-link"],
    lyrics: ["genius-link", "darklyrics-link", "google-lyrics-link", "musixmatch-link"],
    covers: ["cov-musichoarderz-link", "google-images-link", "yahoo-images-link", "bing-images-link", "fanart-tv-link"],
    social: ["instagram-link", "facebook-link", "reddit-link", "twitter-x-link"],
    additional: ["chosic-link", "spirit-of-metal-link", "metalstorm-link", "lucida-link", "sputnikmusic-link", "audio-archive-link", "whosampled-link", "musicmap-link"],
    "lfm-tools": ["bijou-link", "lastfmstats-link", "lastfmlive-link", "explr-link", "tapmusic-link", "universal-scrobbler-link", "time-capsule-link", "manual-scrobbler-link"],
    ai: ["perplexity-link", "chatgpt-link", "claude-link", "brave-ai-link", "mistral-link", "huggingchat-link", "you-link", "grok-link"],
  };

  const SERVICE_LABELS = {
    "search-link": "Search",
    "listen-link": "Listen",
    "google-band-link": "Google",
    "metal-archives-link": "Metal Archives",
    "rym-link": "Rate Your Music",
    "discogs-link": "Discogs",
    "musicbrainz-link": "MusicBrainz",
    "wikipedia-link": "Wikipedia",
    "spotify-link": "Spotify",
    "youtube-link": "YouTube",
    "youtube-music-link": "YT Music",
    "apple-music-link": "Apple Music",
    "bandcamp-link": "Bandcamp",
    "soundcloud-link": "SoundCloud",
    "deezer-link": "Deezer",
    "tidal-link": "Tidal",
    "qobuz-link": "Qobuz",
    "amazon-link": "Amazon Music",
    "genius-link": "Genius",
    "darklyrics-link": "Dark Lyrics",
    "google-lyrics-link": "Google",
    "musixmatch-link": "Musixmatch",
    "cov-musichoarderz-link": "COV - MusicHoarders",
    "google-images-link": "Google",
    "yahoo-images-link": "Yahoo",
    "bing-images-link": "Bing",
    "instagram-link": "Instagram",
    "facebook-link": "Facebook",
    "reddit-link": "Reddit",
    "allmusic-link": "AllMusic",
    "chosic-link": "Chosic",
    "spirit-of-metal-link": "Spirit of Metal",
    "metalstorm-link": "Metal Storm",
    "fanart-tv-link": "Fanart.tv",
    "lucida-link": "Lucida",
    "album-of-the-year-link": "AOTY",
    "sputnikmusic-link": "Sputnikmusic",
    "theaudiodb-link": "TheAudioDB",
    "listenbrainz-link": "ListenBrainz",
    "everynoise-link": "Every Noise at Once",
    "monochrome-link": "Monochrome",
    "twitter-x-link": "X (Twitter)",
    "perplexity-link": "Perplexity",
    "chatgpt-link": "ChatGPT",
    "claude-link": "Claude",
    "brave-ai-link": "Brave AI",
    "mistral-link": "Mistral",
    "huggingchat-link": "HuggingChat",
    "you-link": "You.com",
    "grok-link": "Grok",
    "audio-archive-link": "Audio Archive",
    "whosampled-link": "WhoSampled",
    "audiomack-link": "Audiomack",
    "bijou-link": "Bijou",
    "lastfmstats-link": "Stats",
    "lastfmlive-link": "Live Dashboard",
    "explr-link": "Explr.fm - Regions",
    "tapmusic-link": "TapMusic - Collage",
    "universal-scrobbler-link": "Universal Scrobbler",
    "time-capsule-link": "Time Capsule",
    "manual-scrobbler-link": "Manual Scrobbler",
    "musicmap-link": "MusicMap",
  };

  function getServiceIcon(id) {
    const icons = {
      "search-link": '<i class="fa-solid fa-search"></i>',
      "listen-link": '<i class="fa-solid fa-headphones"></i>',
      "google-band-link": '<i class="fa-brands fa-google"></i>',
      "metal-archives-link": '<i class="fa-solid fa-radiation"></i>',
      "rym-link": '<i class="fa-solid fa-star"></i>',
      "discogs-link": '<i class="fa-solid fa-record-vinyl"></i>',
      "musicbrainz-link": '<i class="fa-solid fa-brain"></i>',
      "wikipedia-link": '<i class="fa-brands fa-wikipedia-w"></i>',
      "spotify-link": '<i class="fa-brands fa-spotify"></i>',
      "youtube-link": '<i class="fa-brands fa-youtube"></i>',
      "youtube-music-link": '<i class="fa-solid fa-circle-play"></i>',
      "apple-music-link": '<i class="fa-brands fa-itunes"></i>',
      "bandcamp-link": '<i class="fa-brands fa-bandcamp"></i>',
      "soundcloud-link": '<i class="fa-brands fa-soundcloud"></i>',
      "deezer-link": '<i class="fa-brands fa-deezer"></i>',
      "tidal-link": '<i class="fa-solid fa-water"></i>',
      "qobuz-link": '<i class="fa-solid fa-music"></i>',
      "amazon-link": '<i class="fa-brands fa-amazon"></i>',
      "genius-link": '<i class="fa-solid fa-lightbulb"></i>',
      "darklyrics-link": '<i class="fa-solid fa-scroll"></i>',
      "google-lyrics-link": '<i class="fa-brands fa-google"></i>',
      "musixmatch-link": '<i class="fa-solid fa-microphone-lines"></i>',
      "cov-musichoarderz-link": '<i class="fa-solid fa-image"></i>',
      "google-images-link": '<i class="fa-brands fa-google"></i>',
      "yahoo-images-link": '<i class="fa-brands fa-yahoo"></i>',
      "bing-images-link": '<i class="fa-brands fa-microsoft"></i>',
      "instagram-link": '<i class="fa-brands fa-instagram"></i>',
      "facebook-link": '<i class="fa-brands fa-facebook"></i>',
      "reddit-link": '<i class="fa-brands fa-reddit"></i>',
      "allmusic-link": '<i class="fa-solid fa-circle-info"></i>',
      "chosic-link": '<i class="fa-solid fa-wave-square"></i>',
      "spirit-of-metal-link": '<i class="fa-solid fa-guitar"></i>',
      "metalstorm-link": '<i class="fa-solid fa-bolt"></i>',
      "fanart-tv-link": '<i class="fa-solid fa-photo-film"></i>',
      "lucida-link": '<i class="fa-solid fa-download"></i>',
      "album-of-the-year-link": '<i class="fa-solid fa-calendar"></i>',
      "sputnikmusic-link": '<i class="fa-solid fa-guitar"></i>',
      "theaudiodb-link": '<i class="fa-solid fa-headphones-simple"></i>',
      "listenbrainz-link": '<i class="fa-solid fa-ear-listen"></i>',
      "everynoise-link": '<i class="fa-solid fa-circle-radiation"></i>',
      "audio-archive-link": '<i class="fa-solid fa-archive"></i>',
      "whosampled-link": '<i class="fa-solid fa-users-between-lines"></i>',
      "audiomack-link": '<i class="fa-solid fa-compact-disc"></i>',
      "bijou-link": '<i class="fa-solid fa-chart-line"></i>',
      "lastfmstats-link": '<i class="fa-solid fa-chart-column"></i>',
      "lastfmlive-link": '<i class="fa-solid fa-signal"></i>',
      "explr-link": '<i class="fa-solid fa-map"></i>',
      "tapmusic-link": '<i class="fa-solid fa-images"></i>',
      "universal-scrobbler-link": '<i class="fa-solid fa-cloud-arrow-up"></i>',
      "time-capsule-link": '<i class="fa-solid fa-clock-rotate-left"></i>',
      "manual-scrobbler-link": '<i class="fa-solid fa-pen-to-square"></i>',
      "musicmap-link": '<i class="fa-solid fa-earth-americas"></i>',
      /* google action icons */
      "google-image-action": '<i class="fa-solid fa-image"></i>',
      "google-video-action": '<i class="fa-solid fa-video"></i>',
      "google-ai-action": '<i class="fa-solid fa-flask"></i>',
      /* Album of the Year sub-actions mapping */
      "aoty-tags-action": '<i class="fa-solid fa-tags"></i>',
      "aoty-lists-action": '<i class="fa-solid fa-list"></i>',
      "aoty-global-action": '<i class="fa-solid fa-earth-europe"></i>',
      "monochrome-link": '<i class="fa-solid fa-file-audio"></i>',
      "twitter-x-link": '<i class="fa-brands fa-twitter"></i>',
      "perplexity-link": '<i class="fa-solid fa-magnifying-glass"></i>',
      "chatgpt-link": '<i class="fa-solid fa-robot"></i>',
      "claude-link": '<i class="fa-solid fa-clover"></i>',
      "brave-ai-link": '<i class="fa-solid fa-shield-halved"></i>',
      "mistral-link": '<i class="fa-solid fa-wind"></i>',
      "huggingchat-link": '<i class="fa-solid fa-face-smile"></i>',
      "you-link": '<i class="fa-solid fa-circle-question"></i>',
      "grok-link": '<i class="fa-brands fa-square-x-twitter"></i>',
    };

    return icons[id] || '<i class="fa-solid fa-link"></i>';
  }

  const SERVICE_URLS = {
    "search-link": ctx => ctx.artist ? `https://www.google.com/search?udm=50&source=searchlabs&q=${ctx.query}` : "#",
    "listen-link": ctx => ctx.artist ? `https://monochrome.tf/search/${ctx.query}` : "#",
    "google-band-link": ctx => ctx.artist ? `https://www.google.com/search?q=${ctx.query}+${ctx.type}` : "#",
    "metal-archives-link": ctx => ctx.artist ? ctx.track ? `https://www.metal-archives.com/search?searchString=${ctx.encodedTrack}&type=song_title` : ctx.album ? `https://www.metal-archives.com/search?type=album_title&searchString=${ctx.encodedAlbum}` : `https://www.metal-archives.com/search?type=band_name&searchString=${ctx.encodedArtist}` : "#",
    "rym-link": ctx => ctx.artist ? `https://rateyourmusic.com/search?searchtype=${ctx.album ? "l" : "a"}&searchterm=${ctx.query}` : "#",
    "discogs-link": ctx => ctx.artist ? `https://www.discogs.com/search/?q=${ctx.query}&type=${ctx.album ? "release" : "artist"}` : "#",
    "musicbrainz-link": ctx => ctx.artist ? `https://musicbrainz.org/search?query=${ctx.query}&type=${ctx.album ? "release" : "artist"}` : "#",
    "wikipedia-link": ctx => ctx.artist ? ctx.album ? `https://en.wikipedia.org/w/index.php?search=${ctx.query}` : `https://en.wikipedia.org/wiki/${ctx.encodedArtist}` : "#",
    "spotify-link": ctx => ctx.artist ? `https://open.spotify.com/search/${ctx.query}` : "#",
    "youtube-link": ctx => ctx.artist ? `https://www.youtube.com/results?search_query=${ctx.query}` : "#",
    "youtube-music-link": ctx => ctx.artist ? `https://music.youtube.com/search?q=${ctx.query}` : "#",
    "apple-music-link": ctx => ctx.artist ? `https://music.apple.com/us/search?term=${ctx.query}` : "#",
    "bandcamp-link": ctx => ctx.artist ? `https://bandcamp.com/search?q=${ctx.query}` : "#",
    "soundcloud-link": ctx => ctx.artist ? `https://soundcloud.com/search?q=${ctx.query}` : "#",
    "deezer-link": ctx => ctx.artist ? `https://www.deezer.com/search/${ctx.query}` : "#",
    "tidal-link": ctx => ctx.artist ? `https://tidal.com/search?q=${ctx.query}` : "#",
    "qobuz-link": ctx => ctx.artist ? `https://www.qobuz.com/us-en/search?q=${ctx.query}` : "#",
    "amazon-link": ctx => ctx.artist ? `https://music.amazon.com/search?k=${ctx.query}` : "#",
    "genius-link": ctx => ctx.artist ? `https://genius.com/search?q=${ctx.query}` : "#",
    "darklyrics-link": ctx => ctx.artist ? `http://www.darklyrics.com/search?q=${ctx.query}` : "#",
    "google-lyrics-link": ctx => ctx.artist ? `https://www.google.com/search?q=${ctx.query}+lyrics` : "#",
    "musixmatch-link": ctx => ctx.artist ? `https://www.musixmatch.com/search/${ctx.query}` : "#",
    "cov-musichoarderz-link": ctx => ctx.artist ? ctx.album ? `https://covers.musichoarders.xyz/?artist=${ctx.encodedArtist}&album=${ctx.encodedAlbum}` : `https://covers.musichoarders.xyz/?artist=${ctx.encodedArtist}` : "#",
    "google-images-link": ctx => ctx.artist ? `https://www.google.com/search?tbm=isch&q=${ctx.query}+${ctx.type}&tbs=isz:l` : "#",
    "yahoo-images-link": ctx => ctx.artist ? `https://images.search.yahoo.com/search/images?p=${ctx.query}` : "#",
    "bing-images-link": ctx => ctx.artist ? `https://www.bing.com/images/search?q=${ctx.query}` : "#",
    "instagram-link": ctx => ctx.artist ? `https://www.instagram.com/explore/search/keyword/?q=${ctx.encodedArtist}+${ctx.album ? "album" : "band"}` : "#",
    "facebook-link": ctx => ctx.artist ? `https://www.facebook.com/search/top?q=${ctx.query}` : "#",
    "reddit-link": ctx => ctx.artist ? `https://www.reddit.com/search/?q=${ctx.query}` : "#",
    "allmusic-link": ctx => ctx.artist ? `https://www.allmusic.com/search/all/${ctx.query}` : "#",
    "chosic-link": ctx => ctx.artist ? `https://www.chosic.com/search-results/?q=${ctx.query}` : "#",
    "spirit-of-metal-link": ctx => ctx.artist ? `https://www.spirit-of-metal.com/liste_groupe.php?recherche_groupe=${ctx.encodedArtist}` : "#",
    "metalstorm-link": ctx => ctx.artist ? ctx.album ? `https://metalstorm.net/bands/albums.php?a_where=a.albumname&a_what=${ctx.encodedAlbum}` : `https://metalstorm.net/bands/index.php?b_where=b.bandname&b_what=${ctx.encodedArtist}` : "#",
    "fanart-tv-link": ctx => ctx.artist ? `https://fanart.tv/add-entry/?tab=music&search=${ctx.encodedArtist}${ctx.album ? "+" + ctx.encodedAlbum : ""}#music` : "#",
    "audio-archive-link": ctx => ctx.artist ? `https://archive.org/details/audio?tab=collection&query=${ctx.query}` : "#",
    "whosampled-link": ctx => ctx.track ? `https://www.whosampled.com/search/tracks/?q=${ctx.encodedTrack}` : ctx.album ? `https://www.whosampled.com/search/tracks/?q=${encodeURIComponent(ctx.album + ' ' + ctx.artist)}` : ctx.artist ? `https://www.whosampled.com/search/artists/?q=${ctx.encodedArtist}` : "#",
    "audiomack-link": ctx => ctx.artist ? `https://audiomack.com/search?q=${ctx.query}` : "#",
    "bijou-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://www.bijou.fm/user/${u}/forever`; },
    "lastfmstats-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://lastfmstats.com/user/${u}/general`; },
    "lastfmlive-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://lastfm.live/${u}`; },
    "explr-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://mold.github.io/explr/?username=${u}`; },
    "tapmusic-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://www.tapmusic.net/collage.php?user=${u}&type=3month&size=5x5&caption=true&playcount=true`; },
    "lucida-link": ctx => ctx.artist ? `https://lucida.to/search?query=${ctx.query}&service=qobuz` : "#",
    "album-of-the-year-link": ctx => ctx.artist ? ctx.album ? `https://www.albumoftheyear.org/search/albums/?q=${ctx.encodedAlbum}` : `https://www.albumoftheyear.org/search/?q=${ctx.encodedArtist}` : "#",
    "sputnikmusic-link": ctx => ctx.artist ? `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${ctx.query}` : "#",
    "theaudiodb-link": ctx => ctx.artist ? `https://www.theaudiodb.com/api/v1/json/123/search.php?s=${ctx.encodedArtist}` : "#",
    "listenbrainz-link": ctx => ctx.artist ? `https://listenbrainz.org/search/?search_term=${ctx.query}&search_type=${ctx.track ? 'track' : ctx.album ? 'album' : 'artist'}` : "#",
    "everynoise-link": ctx => ctx.artist ? ctx.track ? `https://everynoise.com/research.html?mode=track&name=${ctx.encodedTrack}` : ctx.album ? `https://everynoise.com/research.html?mode=album&name=${ctx.encodedAlbum}` : `https://everynoise.com/research.html?mode=name&name=${ctx.encodedArtist}` : "#",
    "monochrome-link": ctx => ctx.artist ? `https://monochrome.tf/search/${ctx.query}` : "#",
    "twitter-x-link": ctx => ctx.artist ? `https://x.com/search?q=${ctx.query}&src=typed_query&f=user` : "#",
    "perplexity-link": ctx => ctx.artist ? `https://www.perplexity.ai/search/new?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "chatgpt-link": ctx => ctx.artist ? `https://chatgpt.com/?prompt=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "claude-link": ctx => ctx.artist ? `https://claude.ai/new?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "brave-ai-link": ctx => ctx.artist ? `https://search.brave.com/ask?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "mistral-link": ctx => ctx.artist ? `https://chat.mistral.ai/chat?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "huggingchat-link": ctx => ctx.artist ? `https://huggingface.co/chat/?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "you-link": ctx => ctx.artist ? `https://you.com/search?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "grok-link": ctx => ctx.artist ? `https://grok.com?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "universal-scrobbler-link": ctx => `https://universalscrobbler.com/`,
    "time-capsule-link": ctx => { const u = localStorage.getItem("setting-lfm-username") || "username"; return `https://bxh9261.github.io/last-fm-time-capsule/?username=${u}`; },
    "manual-scrobbler-link": ctx => `https://www.bijou.fm/manual-scrobbler`,
    "musicmap-link": ctx => `https://musicmap.info/`,
    /* google action shortcuts */
    "google-image-action": ctx => ctx.artist ? `https://www.google.com/search?q=${ctx.query}&udm=2` : "#",
    "google-video-action": ctx => ctx.artist ? `https://www.google.com/search?q=${ctx.query}&udm=7` : "#",
    "google-ai-action": ctx => ctx.artist ? `https://www.google.com/search?udm=50&source=searchlabs&q=${ctx.query}` : "#",
    /* Album of the Year sub-action endpoints */
    "aoty-tags-action": ctx => ctx.artist ? `https://www.albumoftheyear.org/search/tags/?q=${ctx.query}` : "#",
    "aoty-lists-action": ctx => ctx.artist ? `https://www.albumoftheyear.org/search/lists/?q=${ctx.query}` : "#",
    "aoty-global-action": ctx => ctx.artist ? `https://www.albumoftheyear.org/search/?q=${ctx.query}` : "#",
  };

  function cleanName(value) {
    return decodeURIComponent(value || "").replace(/\+/g, " ").trim();
  }

  function buildContext(ctxOrArtist, album) {
    let ctx;
    if (typeof ctxOrArtist === "object" && ctxOrArtist !== null) {
      ctx = ctxOrArtist;
    } else {
      ctx = { type: album ? "album" : "artist", artist: ctxOrArtist || "", album: album || "", track: "" };
    }
    const encodedArtist = encodeURIComponent(ctx.artist || "");
    const encodedAlbum = encodeURIComponent(ctx.album || "");
    const encodedTrack = encodeURIComponent(ctx.track || "");
    const parts = [];
    if (ctx.track) parts.push(encodedTrack);
    if (ctx.album) parts.push(encodedAlbum);
    if (ctx.artist) parts.push(encodedArtist);
    const query = parts.join(" ") || encodedArtist;
    const type = ctx.track ? "track" : ctx.album ? "album" : "band";
    let displayText = ctx.artist || "";
    if (ctx.track) displayText = `${ctx.track} by ${displayText}`;
    else if (ctx.album) displayText = `${ctx.album} by ${displayText}`;
    return { ...ctx, encodedArtist, encodedAlbum, encodedTrack, query, type, displayText };
  }

  function updateMenuLinks(ctx) {
    ctx = buildContext(ctx);
    const badgeEl = document.getElementById("lfm-header-badge");
    const inlineBadgeEl = document.getElementById("lfm-context-inline-badge");
    const titleEl = document.getElementById("lfm-header-title");
    const subtitleEl = document.getElementById("lfm-header-subtitle");
    if (badgeEl) {
      const typeKey = ctx.type === "track" ? "track" : ctx.type === "album" ? "album" : "artist";
      const typeLabel = typeKey === "track" ? "Track" : typeKey === "album" ? "Album" : "Artist";
      badgeEl.textContent = typeLabel;
      badgeEl.className = "context-badge context-badge-" + typeKey;
      // Also update inline badge in quick-actions
      if (inlineBadgeEl) {
        inlineBadgeEl.textContent = typeLabel;
        inlineBadgeEl.className = "context-badge context-badge-" + typeKey;
        inlineBadgeEl.id = "lfm-context-inline-badge";
      }
    }
    if (titleEl) {
      titleEl.textContent = ctx.track || ctx.album || ctx.artist || "";
    }
    if (subtitleEl) {
      if (ctx.track && ctx.artist) subtitleEl.textContent = `by ${ctx.artist}`;
      else if (ctx.album && ctx.artist) subtitleEl.textContent = `by ${ctx.artist}`;
      else subtitleEl.textContent = "";
    }
    document.querySelectorAll("#external-music-menu a").forEach(link => {
      const isUtilityLink =
        link.id === "open-settings-btn" ||
        link.id === "open-ai-btn" ||
        link.id === "footer-toggle-lights" ||
        link.id === "footer-collapse-all";
      const isServiceLink =
        link.id &&
        SERVICE_URLS[link.id];
      if (isUtilityLink) {
        link.classList.remove("disabled");
        link.href = "#";
        return;
      }
      if (!ctx.artist && isServiceLink) {
        link.classList.add("disabled");
        link.href = "#";
      } else if (isServiceLink) {
        link.classList.remove("disabled");
        link.href = SERVICE_URLS[link.id](ctx);
      }
    });
    applyCustomServiceUrls(ctx);
  }

  function showPopupForArtist(artistName) {
    currentContext = { type: "artist", artist: cleanName(artistName), album: "", track: "" };
    updateMenuLinks(currentContext);
    document.getElementById("external-music-menu")?.classList.add("visible");
  }

  function showPopupForAlbum(artistName, albumName) {
    currentContext = { type: "album", artist: cleanName(artistName), album: cleanName(albumName), track: "" };
    updateMenuLinks(currentContext);
    document.getElementById("external-music-menu")?.classList.add("visible");
  }

  function detectPageContext() {
    const path = location.pathname;

    const trackMatch = path.match(/\/music\/([^/]+)\/_\/([^/#]+)$/i);
    if (trackMatch) return { type: "track", artist: cleanName(trackMatch[1]), album: "", track: cleanName(trackMatch[2]) };

    const albumMatch = path.match(/\/music\/([^/]+)\/([^/#]+)$/i);
    if (albumMatch) return { type: "album", artist: cleanName(albumMatch[1]), album: cleanName(albumMatch[2]), track: "" };

    const artistMatch = path.match(/\/music\/([^/#]+)$/i);
    if (artistMatch) return { type: "artist", artist: cleanName(artistMatch[1]), album: "", track: "" };

    const libraryMatch = path.match(/\/library\/music\/([^/]+)(?:\/([^/?#]+))?/i);
    if (libraryMatch) {
      return {
        type: libraryMatch[2] ? "album" : "artist",
        artist: cleanName(libraryMatch[1]),
        album: libraryMatch[2] ? cleanName(libraryMatch[2]) : "",
        track: "",
      };
    }

    const fallback = detectPageContextFallback();
    if (fallback) return fallback;

    return null;
  }

  function detectPageContextFallback() {
    const breadcrumbs = document.querySelectorAll(".breadcrumb a");
    const crumbs = Array.from(breadcrumbs).map(a => cleanName(a.textContent)).filter(Boolean);

    const musicIdx = crumbs.findIndex(c => c.toLowerCase() === "music");
    if (musicIdx >= 0) {
      const afterMusic = crumbs.slice(musicIdx + 1);
      if (afterMusic.length >= 2) return { type: "album", artist: afterMusic[0], album: afterMusic[1], track: "" };
      if (afterMusic.length === 1) return { type: "artist", artist: afterMusic[0], album: "", track: "" };
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const text = ogTitle.getAttribute("content") || "";
      const sep = text.lastIndexOf(" - ");
      if (sep > 0) {
        const possibleAlbum = text.substring(0, sep).trim();
        const possibleArtist = text.substring(sep + 3).trim();
        if (possibleArtist && possibleAlbum) return { type: "album", artist: possibleArtist, album: possibleAlbum, track: "" };
      }
    }

    const titleEl = document.querySelector("title");
    if (titleEl) {
      const text = titleEl.textContent || "";
      const sep = text.lastIndexOf(" - ");
      if (sep > 0) {
        const afterSep = text.substring(sep + 3).trim();
        if (afterSep.toLowerCase().includes("last.fm")) {
          const possibleAlbum = text.substring(0, sep).trim();
          return { type: "artist", artist: possibleAlbum, album: "", track: "" };
        }
      }
    }

    return null;
  }

  function showPopupWithContext() {
    const detected = detectPageContext();

    if (detected) {
      currentContext = { ...currentContext, ...detected };
    }

    updateMenuLinks(currentContext);
    document.getElementById("external-music-menu")?.classList.add("visible");
  }

  function openAllInCategory(categoryId) {
    const ctx = buildContext(currentContext);
    if (!ctx.artist) return;

    const urls = (SERVICE_CATEGORIES[categoryId] || [])
      .map(id => SERVICE_URLS[id]?.(ctx))
      .filter(url => url && url !== "#");

    urls.forEach((url, i) => {
      setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), i * 400);
    });
  }

  function getCustomServices() {
    try {
      return JSON.parse(localStorage.getItem("lfm-custom-services") || "[]");
    } catch {
      return [];
    }
  }

  function saveCustomServices(services) {
    localStorage.setItem("lfm-custom-services", JSON.stringify(services));
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function showToast(message, duration = 3000) {
    const existing = document.getElementById("lfm-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "lfm-toast";
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      background: "var(--bg-primary)", color: "var(--text-primary)",
      padding: "10px 20px", borderRadius: "8px", fontSize: "13px",
      zIndex: "999999999", boxShadow: "0 4px 12px var(--shadow)",
      border: "1px solid var(--border-color)",
      transition: "opacity .3s", opacity: "0",
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = "1"; });
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function openExternalToolWindow(url, name, width = 1000, height = 800) {
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open(url, name,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup || popup.closed) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openAIUrl(url) {
    if (localStorage.getItem("setting-ai-popup") !== "false") {
      openExternalToolWindow(url, "LastFmToolboxAI");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function openToolPopup(url, title) {
    const width = 1200;
    const height = 900;
    const left = Math.round((screen.width - width) / 2);
    const top = Math.round((screen.height - height) / 2);
    const popup = window.open(url, title,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return popup;
  }

  function getDefaultOpenMode() {
    return localStorage.getItem("musicengine.defaultOpenMode") || "tab";
  }

  function updateServiceLaunchButtonsVisibility() {
    const isPopupMode = getDefaultOpenMode() !== "tab";
    document.querySelectorAll(".service-launch-btn").forEach(btn => {
      btn.classList.toggle("hidden", !isPopupMode);
    });
  }

  const TOGGLE_POSITIONS = ["bottom-left", "bottom-right", "top-left", "top-right"];
  const TOGGLE_POSITION_KEY = "setting-toggle-position";

  function getTogglePosition() {
    const stored = localStorage.getItem(TOGGLE_POSITION_KEY);
    return TOGGLE_POSITIONS.includes(stored) ? stored : "bottom-left";
  }

  function applyTogglePosition() {
    const pos = getTogglePosition();
    TOGGLE_POSITIONS.forEach(p => document.documentElement.classList.remove("lfm-toggle-" + p));
    document.documentElement.classList.add("lfm-toggle-" + pos);
  }

  function cycleTogglePosition() {
    const current = getTogglePosition();
    const nextIndex = (TOGGLE_POSITIONS.indexOf(current) + 1) % TOGGLE_POSITIONS.length;
    const nextPos = TOGGLE_POSITIONS[nextIndex];
    localStorage.setItem(TOGGLE_POSITION_KEY, nextPos);
    applyTogglePosition();
    const posSelect = document.getElementById("modal-toggle-position");
    if (posSelect) {
      posSelect.value = nextPos;
    }
  }

  if (typeof GM_registerMenuCommand !== "undefined") {
    GM_registerMenuCommand("Toggle", () => {
      const menu = document.getElementById("external-music-menu");
      if (menu) {
        if (menu.classList.contains("visible")) {
          menu.classList.remove("visible");
        } else {
          showPopupWithContext();
        }
      }
    });
    GM_registerMenuCommand("Settings", () => {
      const existing = document.getElementById("lfm-modal-overlay");
      if (!existing) {
        openSettingsModal();
      }
    });
    GM_registerMenuCommand("Cycle Popup", cycleTogglePosition);
  }

  function renderCustomServices() {
    const container = document.getElementById("custom-services-list");
    if (!container) return;

    container.innerHTML = "";

    getCustomServices().forEach((svc, i) => {
      const div = document.createElement("div");
      div.className = "lfm-custom-item";
      div.innerHTML = `<span>${escHtml(svc.label)}</span><button data-index="${i}">✕</button>`;
      container.appendChild(div);
    });

    container.querySelectorAll("button[data-index]").forEach(btn => {
      btn.addEventListener("click", function () {
        const list = getCustomServices();
        list.splice(parseInt(this.dataset.index, 10), 1);
        saveCustomServices(list);
        renderCustomServices();
        populateMenuCustomLinks();
      });
    });
  }

  function populateMenuCustomLinks() {
    const container = document.getElementById("custom-services-container");
    if (!container) return;

    container.querySelectorAll(".lfm-custom-link").forEach(el => el.remove());

    getCustomServices().forEach(svc => {
      const a = document.createElement("a");
      a.className = "lfm-custom-link";
      a.href = "#";
      a.target = "_blank";
      a.dataset.template = svc.urlTemplate;
      a.innerHTML = `<i class="fa-solid fa-link"></i>${escHtml(svc.label)}`;
      container.appendChild(a);
    });
  }

  function applyCustomServiceUrls(ctx) {
    document.querySelectorAll(".lfm-custom-link").forEach(link => {
      if (!ctx.artist) {
        link.classList.add("disabled");
        link.href = "#";
        return;
      }

      link.classList.remove("disabled");
      link.href = link.dataset.template
        .replace(/\{artist\}/g, ctx.encodedArtist)
        .replace(/\{album\}/g, ctx.encodedAlbum || "")
        .replace(/\{track\}/g, ctx.encodedTrack || "")
        .replace(/\{query\}/g, ctx.query)
        .replace(/\{type\}/g, ctx.type);
    });
  }

  const CONTENT_SELECTOR = [
    'a:not(.auth-dropdown-menu-item):not([aria-hidden="true"])[href^="/music/"]',
    'a:not(.auth-dropdown-menu-item):not([aria-hidden="true"])[href*="last.fm/music/"]'
  ].join(",");

  function shouldSkipLink(link) {
    if (!link || !link.href) return true;

    if (link.classList.contains("lfm-toolbox-enabled")) return true;
    if (link.closest("#external-music-menu")) return true;
    if (link.closest("#external-music-button")) return true;
    if (link.closest(".dropdown-menu-clickable, .disclose-hide, .chartlist-more-menu")) return true;
    if (link.closest(".cover-art, .chartlist-image, .chartlist-play")) return true;

    const path = new URL(link.href, location.origin).pathname.replace(/\/+$/, "");

    if (!path.startsWith("/music/")) return true;
    if (path.includes("/+")) return true;

    return false;
  }

  function addContextMenu(root) {
    if (!root?.querySelectorAll) return;

    root.querySelectorAll(CONTENT_SELECTOR).forEach(link => {
      if (link.dataset.lfmCtxProcessed) return;

      if (shouldSkipLink(link)) {
        link.dataset.lfmCtxProcessed = "true";
        return;
      }

      const path = new URL(link.href, location.origin).pathname.replace(/\/+$/, "");
      const trackMatch = path.match(/^\/music\/([^/]+)\/_\/([^/#]+)$/i);
      const albumMatch = path.match(/^\/music\/([^/#]+)\/([^/#]+)$/i);
      const artistMatch = path.match(/^\/music\/([^/#]+)$/i);

      if (!trackMatch && !albumMatch && !artistMatch) {
        link.dataset.lfmCtxProcessed = "true";
        return;
      }

      const card = link.closest(".grid-items-item, .resource-list--release-list-item, .cover-art, .chartlist-image");

      // On image cards, prefer album links over artist links.
      if (card && artistMatch && card.querySelector('a[href*="/music/"][href*="/"]')) {
        const albumLink = Array.from(card.querySelectorAll('a[href*="/music/"]'))
          .find(a => {
            const p = new URL(a.href, location.origin).pathname.replace(/\/+$/, "");
            return /^\/music\/([^/#]+)\/([^/#]+)$/i.test(p);
          });

        if (albumLink && albumLink !== link) {
          link.dataset.lfmCtxProcessed = "true";
          return;
        }
      }

      link.dataset.lfmCtxProcessed = "true";

      let contextData;
      if (trackMatch) {
        contextData = { type: "track", artist: cleanName(trackMatch[1]), album: "", track: cleanName(trackMatch[2]) };
      } else if (albumMatch) {
        contextData = { type: "album", artist: cleanName(albumMatch[1]), album: cleanName(albumMatch[2]), track: "" };
      } else {
        contextData = { type: "artist", artist: cleanName(artistMatch[1]), album: "", track: "" };
      }

      const openToolbox = function (e) {
        e.preventDefault();
        e.stopPropagation();
        currentContext = { ...contextData };
        updateMenuLinks(currentContext);
        document.getElementById("external-music-menu")?.classList.add("visible");
      };

      link.addEventListener("contextmenu", openToolbox);

      if (card) {
        if (card.querySelector(".lfm-grid-toolbox-icon")) return;

        if (getComputedStyle(card).position === "static") {
          card.style.position = "relative";
        }

        const icon = document.createElement("span");
        icon.className = "lfm-grid-toolbox-icon";
        icon.innerHTML = '<i class="fa-brands fa-lastfm"></i>';
        icon.title = contextData.track
          ? `Open Toolbox for ${contextData.track} by ${contextData.artist}`
          : contextData.album
            ? `Open Toolbox for ${contextData.album} by ${contextData.artist}`
            : `Open Toolbox for ${contextData.artist}`;

        icon.addEventListener("click", openToolbox);
        icon.addEventListener("contextmenu", openToolbox);

        card.appendChild(icon);
        return;
      }

      link.classList.add("lfm-toolbox-enabled");

      if (link.parentElement?.classList?.contains("lfm-toolbox-wrapper")) return;

      const wrapper = document.createElement("span");
      wrapper.className = "lfm-toolbox-wrapper";

      link.parentNode.insertBefore(wrapper, link);
      wrapper.appendChild(link);

      const icon = document.createElement("span");
      icon.className = "lfm-hover-icon";
      icon.innerHTML = '<i class="fa-brands fa-lastfm"></i>';
      icon.title = contextData.track
        ? `Open Toolbox for ${contextData.track} by ${contextData.artist}`
        : contextData.album
          ? `Open Toolbox for ${contextData.album} by ${contextData.artist}`
          : `Open Toolbox for ${contextData.artist}`;

      icon.addEventListener("click", openToolbox);
      icon.addEventListener("contextmenu", openToolbox);

      wrapper.appendChild(icon);
    });
  }

  function addChartlistContextEntries(root) {
    const menus = root.querySelectorAll ? root.querySelectorAll(".chartlist-more-menu ul") : [];

    menus.forEach(menu => {
      if (menu.dataset.lfmProcessed) return;
      menu.dataset.lfmProcessed = "true";

      const row = menu.closest("tr");
      if (!row) return;

      const artistLink = row.querySelector(".chartlist-artist a");
      const albumLink = row.querySelector(".chartlist-album a");
      if (!artistLink) return;

      const artist = artistLink.textContent.trim();
      const album = albumLink ? albumLink.textContent.trim() : "";

      const sep = document.createElement("li");
      sep.style.cssText = "border-top:1px solid #444;margin:4px 8px;list-style:none;";

      const item = document.createElement("li");
      item.style.cssText = "list-style:none;";

      const a = document.createElement("a");
      a.href = "#";
      a.innerHTML = `<i class="fa-brands fa-lastfm"></i> ${artist}${album ? " — " + album : ""}`;
      a.style.cssText = "display:flex;align-items:center;gap:6px;padding:8px 12px;color:white;text-decoration:none;font-size:12px;cursor:pointer;";

      a.addEventListener("click", e => {
        e.preventDefault();
        album ? showPopupForAlbum(artist, album) : showPopupForArtist(artist);
      });

      item.appendChild(a);
      menu.insertBefore(sep, menu.firstChild);
      menu.insertBefore(item, menu.firstChild);
    });
  }

  function buildCategoryHTML() {
    let html = "";
    CATEGORY_ORDER.forEach(cat => {
      html += `<div class="section-block" data-section="${cat}">`;
      html += `<p class="menu-section" data-section="${cat}" aria-expanded="false">
        <span>${CATEGORY_LABELS[cat]}</span>
        <span class="section-chevron">▶</span>
      </p>`;
      html += `<div class="section-content" data-section="${cat}">`;
      SERVICE_CATEGORIES[cat].forEach(id => {
        html += `<div class="service-row">`;
        html += `<a href="#" id="${id}" class="service-link" target="_blank">${getServiceIcon(id)}${SERVICE_LABELS[id]}</a>`;
        if (id === "theaudiodb-link") {
          html += `<button class="service-json-btn" data-service-id="${id}" title="Download JSON"><i class="fa-solid fa-code"></i></button>`;
          html += `<button class="service-md-btn" data-service-id="${id}" title="Download Markdown"><i class="fa-brands fa-markdown"></i></button>`;
        }
        // add Google quick action icons next to the main Google entry
        if (id === "google-band-link") {
          html += `<span class="service-action">`;
          html += `<button class="service-action-btn" data-action="google-image-action" title="Google Images">${getServiceIcon('google-image-action')}</button>`;
          html += `<button class="service-action-btn" data-action="google-video-action" title="Google Video">${getServiceIcon('google-video-action')}</button>`;
          html += `<button class="service-action-btn" data-action="google-ai-action" title="Google AI Mode">${getServiceIcon('google-ai-action')}</button>`;
          html += `</span>`;
        }
        // Add sub-action layout elements next to Album of the Year
        if (id === "album-of-the-year-link") {
          html += `<span class="service-action">`;
          html += `<button class="service-action-btn" data-action="aoty-tags-action" title="AOTY Tags">${getServiceIcon('aoty-tags-action')}</button>`;
          html += `<button class="service-action-btn" data-action="aoty-lists-action" title="AOTY Lists">${getServiceIcon('aoty-lists-action')}</button>`;
          html += `<button class="service-action-btn" data-action="aoty-global-action" title="AOTY Global Search">${getServiceIcon('aoty-global-action')}</button>`;
          html += `</span>`;
        }
        if (cat === "ai") {
          html += `<button class="service-ai-btn" data-service-id="${id}" title="Open AI prompt"><i class="fa-solid fa-flask"></i></button>`;
        }
        html += `<button class="service-launch-btn" data-service-id="${id}" title="Open in new tab"><i class="fa-solid fa-plus"></i></button>`;
        html += `</div>`;
      });
      const isOpenAll = localStorage.getItem("setting-openall-" + cat) === "true";
      const displayStyle = isOpenAll ? "" : 'style="display: none;"';
      html += `<a href="#" class="open-all-link" data-category="${cat}" ${displayStyle}><i class="fa-solid fa-forward"></i>Open All</a>`;
      html += `</div><hr></div>`;
    });
    return html;
  }

  function setupUI() {
    const button = document.createElement("div");
    button.id = "external-music-button";
    button.innerHTML = '<i class="fa-brands fa-lastfm"></i>';
    button.title = "Last.fm Toolbox (Ctrl+Shift+E) | Right-click to move";

    button.addEventListener("contextmenu", e => {
      e.preventDefault();
      cycleTogglePosition();
    });

    button.addEventListener("click", e => {
      e.stopPropagation();

      const menu = document.getElementById("external-music-menu");

      if (menu.classList.contains("visible")) {
        menu.classList.remove("visible");
      } else {
        showPopupWithContext();
      }
    });

    document.body.appendChild(button);

    const menu = document.createElement("div");
    menu.id = "external-music-menu";
    menu.innerHTML = `
      <div id="lfm-scroll-area">
        <div id="lfm-ai-toggle-bar">
          <a href="#" id="open-ai-btn" title="Open AI Prompt Generator">
            <i class="fa-solid fa-flask ai-btn-icon"></i>Query AI
          </a>
        </div>
        <div id="lfm-menu-header">
          <div id="lfm-header-badge"></div>
          <div id="lfm-header-title"></div>
          <div id="lfm-header-subtitle"></div>
        </div>
        <div id="lfm-quick-actions">
          <a href="#" id="search-link" target="_blank" title="Search"><i class="fa-solid fa-search"></i><span>Search</span></a>
          <div id="lfm-context-inline-badge"></div>
          <a href="#" id="listen-link" target="_blank" title="Listen"><i class="fa-solid fa-headphones"></i><span>Listen</span></a>
        </div>
        ${buildCategoryHTML()}
<div class="section-block" data-section="custom">
        <p class="menu-section" data-section="custom" aria-expanded="false">
          <span>Manual Search</span>
          <span class="section-chevron">▶</span>
        </p>
        <div class="section-content" data-section="custom">
          <div id="search-input-container">
            <div id="search-input-wrapper">
              <input type="text" id="search-input" placeholder="Artist or Artist - Album">
              <div id="search-help-toggle">?</div>
              <div id="search-help-popup">Search by artist, album, or track.<br><strong>Supported Formats:</strong><br>
              • Artist<br>
              • Artist - Album<br>
              • Artist - Album - Track
              </div>
            </div>
          </div>
        </div></div>
        <div id="lfm-footer">
          <a href="#" id="open-settings-btn" title="Settings"><i class="fa-solid fa-gear"></i></a>
          <a href="#" id="footer-toggle-lights" title="Toggle dark/light mode"><i class="fa-solid fa-moon"></i></a>
          <a href="#" id="footer-collapse-all" title="Collapse all categories"><i class="fa-solid fa-arrow-up-short-wide"></i></a>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    // Ensure New Tab vs Popup visibility applies immediately on load
    updateServiceLaunchButtonsVisibility();

    document.addEventListener("click", e => {
      if (
        !menu.contains(e.target) &&
        !button.contains(e.target) &&
        !e.target.closest(".lfm-hover-icon") &&
        !e.target.closest(".lfm-grid-toolbox-icon")
      ) {
        menu.classList.remove("visible");
      }
    });

    menu.addEventListener("click", e => {
      const openAll = e.target.closest(".open-all-link");

      if (openAll) {
        e.preventDefault();
        openAllInCategory(openAll.dataset.category);
        return;
      }

      if (e.target.closest("a") && !e.target.closest(".open-all-link") && !e.target.closest(".service-row")) {
        menu.classList.remove("visible");
      }
    });

    function handleMenuClose() {
      const behavior = localStorage.getItem("setting-close-behavior") || "close";
      if (behavior === "keep") return false;
      if (behavior === "timeout") {
        const delaySec = parseInt(localStorage.getItem("setting-close-delay") || "3", 10);
        setTimeout(() => {
          document.getElementById("external-music-menu")?.classList.remove("visible");
        }, delaySec * 1000);
        return false;
      }
      return true;
    }

    menu.querySelectorAll(".service-link").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const url = this.href;
        if (!url || url === "#" || url === location.href + "#") return;

        if (this.id === "theaudiodb-link") {
          menu.classList.remove("visible");
          fetch(url).then(r => r.json()).then(data => {
            const id = data.artists?.[0]?.idArtist;
            if (id) window.open(`https://www.theaudiodb.com/artist/${id}`, "_blank", "noopener,noreferrer");
            else window.open(url, "_blank", "noopener,noreferrer");
          }).catch(() => {
            window.open(url, "_blank", "noopener,noreferrer");
          });
          return;
        }

        if (handleMenuClose()) menu.classList.remove("visible");
        if (getDefaultOpenMode() === "tab") {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          openToolPopup(url, "MusicEngineTool");
        }
      });
    });

    menu.querySelectorAll(".service-launch-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const link = document.getElementById(this.dataset.serviceId);
        if (!link || !link.href || link.href === "#" || link.href === location.href + "#") return;
        if (handleMenuClose()) menu.classList.remove("visible");
        window.open(link.href, "_blank", "noopener,noreferrer");
      });
    });

    menu.querySelectorAll(".service-ai-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const providerId = this.dataset.serviceId;
        if (providerId) {
          localStorage.setItem("lfm-last-ai-provider", providerId);
        }
        menu.classList.remove("visible");
        openAIModal();
      });
    });

    // inline action buttons (e.g., Google image/video/AI shortcuts)
    menu.querySelectorAll(".service-action-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const actionId = this.dataset.action;
        if (!actionId || !SERVICE_URLS[actionId]) return;
        const url = SERVICE_URLS[actionId](buildContext(currentContext));
        if (!url || url === "#") return;
        if (handleMenuClose()) menu.classList.remove("visible");
        if (getDefaultOpenMode() === "tab") {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          openToolPopup(url, "MusicEngineTool");
        }
      });
    });

    function formatArtistMarkdown(data) {
      const artist = data.artists?.[0];
      if (!artist) return "# No artist data found";
      const name = artist.strArtist || "Unknown";
      const banner = artist.strArtistBanner ? `\n![Banner](${artist.strArtistBanner})\n` : "";
      const logo = artist.strArtistLogo ? `\n![Artist Logo](${artist.strArtistLogo})\n` : "";
      const genre = artist.strGenre || "Unknown";
      const country = artist.strCountry || "Unknown";
      const formed = artist.intFormedYear || "Unknown";
      const members = artist.intMembers || "Unknown";
      const label = artist.strLabel || "Unknown";
      const bio = artist.strBiography || "No biography available.";
      const thumb = artist.strArtistThumb ? `\n![Band Photo](${artist.strArtistThumb})\n` : "";
      const wide = artist.strArtistWideThumb ? `\n![Wide Thumb](${artist.strArtistWideThumb})\n` : "";
      const fanarts = [artist.strArtistFanart, artist.strArtistFanart2, artist.strArtistFanart3, artist.strArtistFanart4].filter(Boolean);
      const clearart = artist.strArtistClearart ? `\n![Clear Art](${artist.strArtistClearart})\n` : "";
      return `# ${name}
${banner}
**${genre} • ${country}**

## Band Information

| Attribute | Details |
|-----------|---------|
| **Formed** | ${formed} |
| **Members** | ${members} |
| **Origin** | ${country} |
| **Label** | ${label} |
${logo}
## Biography

${bio}
## Gallery
${thumb}${wide}${fanarts.length ? "\n**Fan Art:**\n" + fanarts.map(f => `\n![Fanart](${f})\n`).join("") : ""}${clearart}
---
*Data from TheAudioDB • Last updated via API*`;
    }

    function downloadFromAudioDB(url, format) {
      fetch(url).then(r => r.json()).then(data => {
        const artist = data.artists?.[0];
        if (!artist) {
          showToast("No TheAudioDB entry found for this artist.");
          return;
        }
        const name = artist.strArtist?.replace(/[^a-z0-9]/gi, "_") || "theaudiodb";
        let content, mime, ext;
        if (format === "json") {
          content = JSON.stringify(data, null, 2);
          mime = "application/json";
          ext = "json";
        } else {
          content = formatArtistMarkdown(data);
          mime = "text/markdown";
          ext = "md";
        }
        const blob = new Blob([content], { type: mime });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }).catch(err => showToast("Download failed: " + err.message));
    }

    menu.querySelectorAll(".service-json-btn, .service-md-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const serviceId = this.dataset.serviceId;
        const link = document.getElementById(serviceId);
        if (!link || !link.href || link.href === "#") return;
        const format = this.classList.contains("service-json-btn") ? "json" : "md";
        menu.classList.remove("visible");
        downloadFromAudioDB(link.href, format);
      });
    });

    function setSectionArrow(section, expanded) {
      const arrow = section.querySelector(".section-chevron");
      if (!arrow) return;
      arrow.textContent = expanded ? "▼" : "▶";
    }

    document.querySelectorAll(".menu-section").forEach(section => {
      const name = section.dataset.section;
      const block = document.querySelector(`.section-block[data-section="${name}"]`);
      const content = block ? block.querySelector(`.section-content`) : document.querySelector(`.section-content[data-section="${name}"]`);
      const expanded = localStorage.getItem("menu-section-" + name) === "expanded";
      section.classList.toggle("collapsed", !expanded);
      content?.classList.toggle("visible", expanded);
      setSectionArrow(section, expanded);
      section.setAttribute("aria-expanded", expanded ? "true" : "false");
      section.addEventListener("click", function () {
        const nowVisible = !content?.classList.contains("visible");
        this.classList.toggle("collapsed", !nowVisible);
        content?.classList.toggle("visible", nowVisible);
        setSectionArrow(this, nowVisible);
        this.setAttribute("aria-expanded", nowVisible ? "true" : "false");
        localStorage.setItem(
          "menu-section-" + name,
          nowVisible ? "expanded" : "collapsed"
        );
      });
    });

    document.getElementById("open-settings-btn")?.addEventListener("click", e => {
      e.preventDefault();
      menu.classList.remove("visible");
      openSettingsModal();
    });

    document.getElementById("open-ai-btn")?.addEventListener("click", e => {
      e.preventDefault();
      menu.classList.remove("visible");
      openAIModal();
    });

    const lightsBtn = document.getElementById("footer-toggle-lights");
    if (lightsBtn) {
      const isLight = document.documentElement.classList.contains("lfm-light-mode");
      const icon = lightsBtn.querySelector("i");
      if (icon) icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    document.getElementById("footer-toggle-lights")?.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const isLight = document.documentElement.classList.toggle("lfm-light-mode");
      localStorage.setItem("setting-light-mode", isLight ? "true" : "false");
      const icon = e.currentTarget.querySelector("i");
      if (icon) icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });

    document.getElementById("footer-collapse-all")?.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".menu-section").forEach(section => {
        const name = section.dataset.section;
        const block = document.querySelector(`.section-block[data-section="${name}"]`);
        const content = block ? block.querySelector(`.section-content`) : document.querySelector(`.section-content[data-section="${name}"]`);
        if (content?.classList.contains("visible")) {
          section.classList.add("collapsed");
          content.classList.remove("visible");
          const arrow = section.querySelector(".section-chevron");
          if (arrow) arrow.textContent = "▶";
          section.setAttribute("aria-expanded", "false");
          localStorage.setItem("menu-section-" + name, "collapsed");
        }
      });
      const collapseIcon = e.currentTarget.querySelector("i");
      if (collapseIcon) {
        collapseIcon.className = "fa-solid fa-arrow-up-wide-short";
        setTimeout(() => { collapseIcon.className = "fa-solid fa-arrow-up-short-wide"; }, 600);
      }
    });

    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("keypress", e => {
      if (e.key !== "Enter") return;

      const query = searchInput.value.trim();
      if (!query) return;

      const albumTrackMatch = query.match(/^(.+)\s+-\s+(.+)\s+-\s+(.+)$/);
      const albumMatch = query.match(/^(.+)\s+-\s+(.+)$/);

      if (albumTrackMatch) {
        currentContext = { type: "track", artist: albumTrackMatch[1].trim(), album: "", track: albumTrackMatch[3].trim() };
      } else if (albumMatch) {
        currentContext = { type: "album", artist: albumMatch[1].trim(), album: albumMatch[2].trim(), track: "" };
      } else {
        currentContext = { type: "artist", artist: query, album: "", track: "" };
      }

      updateMenuLinks(currentContext);
      searchInput.value = "";
    });

    setupToggles();
  }

  function setupToggles() {
    // 1. Text Highlight Layer Toggle Switch Handler
    const highlightToggle = document.getElementById("modal-toggle-highlight");
    if (highlightToggle) {
      const isEnabled = localStorage.getItem("setting-highlight-eligible") === "true";
      highlightToggle.classList.toggle("active", isEnabled);

      highlightToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-highlight-eligible", active ? "true" : "false");
        document.documentElement.classList.toggle("lfm-highlight-eligible", active);
      };
    }

    // 3. Category Sections
    CATEGORY_ORDER.forEach(cat => {
      const toggle = document.getElementById("modal-toggle-section-" + cat);
      const block = document.querySelector(`.section-block[data-section="${cat}"]`);
      const subGroup = document.getElementById(`subgroup-cat-${cat}`);

      // Bind Individual 'Open All' Toggles
      const openAllToggle = document.getElementById("modal-toggle-openall-" + cat);
      if (openAllToggle) {
        openAllToggle.onclick = function (e) {
          e.stopPropagation();
          const active = this.classList.toggle("active");
          localStorage.setItem("setting-openall-" + cat, active ? "true" : "false");

          // Instantly toggle visibility in the DOM menu
          const menuLink = document.querySelector(`.open-all-link[data-category="${cat}"]`);
          if (menuLink) menuLink.style.display = active ? "block" : "none";
        };
      }

      if (!toggle) return;

      const isCatHidden = localStorage.getItem("setting-section-" + cat) === "false";
      toggle.classList.toggle("active", !isCatHidden);
      block?.classList.toggle("hidden-section", isCatHidden);

      toggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-section-" + cat, active ? "true" : "false");
        block?.classList.toggle("hidden-section", !active);
        if (subGroup) subGroup.style.display = active ? "grid" : "none";
      };

      // Loop bind handlers for individual services inside this category block
      SERVICE_CATEGORIES[cat].forEach(id => {
        const itemToggle = document.getElementById("modal-toggle-svc-" + id);
        if (!itemToggle) return;

        const isItemHidden = localStorage.getItem("setting-svc-hidden-" + id) === "true";
        itemToggle.classList.toggle("active", !isItemHidden);

        itemToggle.onclick = function () {
          const active = this.classList.toggle("active");
          localStorage.setItem("setting-svc-hidden-" + id, active ? "false" : "true");

          const targets = document.querySelectorAll(`.service-row:has(#${id})`);
          targets.forEach(t => t.classList.toggle("lfm-service-hidden", !active));
        };
      });
    });

    // 5. Light Mode
    const lightToggle = document.getElementById("modal-toggle-light-mode") || document.getElementById("toggle-light-mode");
    if (lightToggle) {
      const isEnabled = localStorage.getItem("setting-light-mode") === "true";
      lightToggle.classList.toggle("active", isEnabled);

      lightToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-light-mode", active ? "true" : "false");
        document.documentElement.classList.toggle("lfm-light-mode", active);
        const footerIcon = document.querySelector("#footer-toggle-lights i");
        if (footerIcon) footerIcon.className = active ? "fa-solid fa-sun" : "fa-solid fa-moon";
      };
    }

    // 6. AI Popup Mode
    const aiPopupToggle = document.getElementById("modal-toggle-ai-popup");
    if (aiPopupToggle) {
      const isPopup = localStorage.getItem("setting-ai-popup") !== "false";
      aiPopupToggle.classList.toggle("active", isPopup);

      aiPopupToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-ai-popup", active ? "true" : "false");
      };
    }

    const defaultAISelect = document.getElementById("setting-select-default-ai-provider");
    if (defaultAISelect) {
      defaultAISelect.value = localStorage.getItem("setting-default-ai-provider") || "chatgpt-link";
      defaultAISelect.addEventListener("change", function () {
        localStorage.setItem("setting-default-ai-provider", this.value);
      });
    }

    // Auto-Copy
    const aiAutoCopyToggle = document.getElementById("modal-toggle-ai-autocopy");
    if (aiAutoCopyToggle) {
      const isAutoCopy = localStorage.getItem("setting-ai-autocopy") === "true";
      aiAutoCopyToggle.classList.toggle("active", isAutoCopy);
      aiAutoCopyToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-ai-autocopy", active ? "true" : "false");
      };
    }

    // Default Category
    const defaultAICatSelect = document.getElementById("setting-select-default-ai-category");
    if (defaultAICatSelect) {
      defaultAICatSelect.value = localStorage.getItem("setting-default-ai-category") || "overview";
      defaultAICatSelect.addEventListener("change", function () {
        localStorage.setItem("setting-default-ai-category", this.value);
      });
    }

    const aiSuffixTextarea = document.getElementById("setting-ai-custom-suffix");
    if (aiSuffixTextarea) {
      aiSuffixTextarea.value = localStorage.getItem("setting-ai-custom-suffix") || "";
      aiSuffixTextarea.addEventListener("input", function () {
        localStorage.setItem("setting-ai-custom-suffix", this.value);
      });
    }
  }

  const AI_PROVIDERS = [
    { id: "chatgpt-link", label: "ChatGPT", url: prompt => `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}` },
    { id: "claude-link", label: "Claude", url: prompt => `https://claude.ai/new?q=${encodeURIComponent(prompt)}` },
    { id: "perplexity-link", label: "Perplexity", url: prompt => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(prompt)}` },
    { id: "grok-link", label: "Grok", url: prompt => `https://grok.com?q=${encodeURIComponent(prompt)}` },
    { id: "brave-ai-link", label: "Brave AI", url: prompt => `https://search.brave.com/ask?q=${encodeURIComponent(prompt)}` },
    { id: "mistral-link", label: "Mistral", url: prompt => `https://chat.mistral.ai/chat?q=${encodeURIComponent(prompt)}` },
    { id: "huggingchat-link", label: "HuggingChat", url: prompt => `https://huggingface.co/chat/?q=${encodeURIComponent(prompt)}` },
    { id: "you-link", label: "You.com", url: prompt => `https://you.com/search?q=${encodeURIComponent(prompt)}` },
  ];

  const AI_CATEGORIES = {
    overview: {
      label: "Overview",
      items: [
        {
          label: "Summary", prompt: ctx => ctx.track
            ? `Role: Act as a senior music historian.\n\nTask: Provide a highly structured executive summary of the track "${ctx.track}" by ${ctx.artist}.\n\nConstraints: Avoid conversational pleasantries and subjective filler. Rely strictly on evidence-based facts.\n\nOutput Format: Return a Markdown document with the following sections:\n- **Core Details:** (Release year, label, primary/secondary sub-genres)\n- **Personnel:** (Producers, primary writers, mixing engineers)\n- **Sonic Profile:** (One sentence defining its technical audio characteristic)`
            : ctx.album
              ? `Role: Act as a senior music historian.\n\nTask: Provide a highly structured executive summary of the album "${ctx.album}" by ${ctx.artist}.\n\nConstraints: Avoid conversational pleasantries. Rely strictly on verified release data.\n\nOutput Format: Return a Markdown document with the following sections:\n- **Core Details:** (Release date, label, primary sub-genres)\n- **Personnel:** (Key producers, guest features)\n- **Consensus:** (Critical and commercial reception summary)`
              : `Role: Act as a senior music historian.\n\nTask: Provide a highly structured executive summary of the artist ${ctx.artist}.\n\nConstraints: Avoid conversational pleasantries. Focus on objective career data.\n\nOutput Format: Return a Markdown document with the following sections:\n- **Core Details:** (Active years, geographical origin, definitive sub-genres)\n- **Metrics:** (Estimated total sales/streams, peak chart success)\n- **Legacy:** (Primary contribution to the evolution of their genre)`
        },
        {
          label: "Comprehensive Overview", prompt: ctx => ctx.track
            ? `Role: Act as a music encyclopedia editor.\n\nTask: Compile a single comprehensive overview of the track "${ctx.track}" by ${ctx.artist} covering every major facet — origin, sound, reception, and legacy.\n\nOutput Format: Return a Markdown document with sections for **Background**, **Sound & Style**, **Reception**, and **Legacy**, each 2-3 sentences.`
            : ctx.album
              ? `Role: Act as a music encyclopedia editor.\n\nTask: Compile a single comprehensive overview of the album "${ctx.album}" by ${ctx.artist} covering every major facet — origin, sound, reception, and legacy.\n\nOutput Format: Return a Markdown document with sections for **Background**, **Sound & Style**, **Reception**, and **Legacy**, each 2-3 sentences.`
              : `Role: Act as a music encyclopedia editor.\n\nTask: Compile a single comprehensive overview of ${ctx.artist} covering every major facet of their career — origin, sound, evolution, and legacy.\n\nOutput Format: Return a Markdown document with sections for **Background**, **Sound & Style**, **Career Evolution**, and **Legacy**, each 2-3 sentences.`
        },
        {
          label: "Guide", prompt: ctx => ctx.track
            ? `Role: Act as an analytical music curator.\n\nTask: Create a structural listening guide for a first-time listener of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Provide a bulleted Markdown list detailing exactly what audio elements to focus on during:\n1. The intro/rhythm establishment\n2. The vocal delivery and phrasing\n3. The bridge or structural deviations`
            : ctx.album
              ? `Role: Act as an analytical music curator.\n\nTask: Create a beginner's entry-point guide for "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Return a Markdown table featuring the 3 most essential tracks. Columns must include: Track Name, Thematic Relevance, and Sonic Identity (described in plain, technical language).`
              : `Role: Act as an analytical music curator.\n\nTask: Map an entry-point listening sequence for ${ctx.artist}.\n\nOutput Format: Suggest exactly 5 essential tracks to listen to in order. Output as a numbered list where each entry includes the track name and a concise, evidence-based rationale for its placement in the sequence to demonstrate stylistic evolution.`
        },
        {
          label: "Timeline", prompt: ctx => ctx.track
            ? `Task: Construct a chronological timeline mapping the lifecycle of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Output strictly as a Markdown table with columns: Date (or Year), Event (e.g., studio sessions, single release, chart peak), and Significance.`
            : ctx.album
              ? `Task: Construct a chronological timeline mapping the lifecycle of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Output strictly as a Markdown table with columns: Date (or Year), Event (e.g., recording phase, lead singles, album release, tour), and Significance.`
              : `Task: Construct a chronological timeline of the pivotal milestones in the career of ${ctx.artist}.\n\nOutput Format: Output strictly as a Markdown table with columns: Year, Event (e.g., major releases, label shifts, hiatuses), and Industry Impact.`
        },
        {
          label: "Commercial", prompt: ctx => ctx.track
            ? `Task: Retrieve raw commercial and streaming metrics for "${ctx.track}" by ${ctx.artist}.\n\nConstraints: Do not summarize. Provide raw data only.\n\nOutput Format: Output as a Markdown table including: RIAA (or global) certifications, peak Billboard/global chart positions, and major streaming milestones.`
            : ctx.album
              ? `Task: Retrieve raw commercial and sales metrics for "${ctx.album}" by ${ctx.artist}.\n\nConstraints: Do not summarize. Provide raw data only.\n\nOutput Format: Output as a Markdown table including: First-week sales figures, total certified units, chart longevity, and physical vs. digital performance splits.`
              : `Task: Detail the absolute commercial apex of ${ctx.artist}.\n\nOutput Format: Output a Markdown table listing their top 3 best-selling albums, top 3 highest-grossing tours, and overall market share/certifications during their peak era.`
        },
      ],
    },
    analysis: {
      label: "Analysis",
      items: [
        {
          label: "Theory", prompt: ctx => ctx.track
            ? `Role: Act as a music theorist.\n\nTask: Analyze the composition of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Return a structured breakdown identifying:\n- Key and relative shifts\n- BPM and time signature\n- Primary chord progressions\n- Notable rhythmic syncopation or modulations`
            : ctx.album
              ? `Role: Act as a music theorist.\n\nTask: Analyze the overarching musical and structural framework of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Return a bulleted list discussing:\n- Prevailing tempos and keys\n- Recurring harmonic motifs\n- How track sequencing dictates the album's dynamic pacing`
              : `Role: Act as a music theorist.\n\nTask: Identify the structural and harmonic hallmarks of ${ctx.artist}'s catalog.\n\nOutput Format: Return a structured analysis of their typical chord progressions, scale preferences, rhythmic tendencies, and how they deviate from standard pop or genre formats.`
        },
        {
          label: "Genre Deep Dive", prompt: ctx => ctx.track
            ? `Role: Act as a genre taxonomist.\n\nTask: Perform a deep dive into the genre classification of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Return a Markdown document covering:\n- **Primary & Sub-Genre:** (exact classification and defining traits)\n- **Lineage:** (the genres and movements it draws from)\n- **Hybridity:** (any cross-genre elements present)`
            : ctx.album
              ? `Role: Act as a genre taxonomist.\n\nTask: Perform a deep dive into the genre classification of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Return a Markdown document covering:\n- **Primary & Sub-Genre:** (exact classification and defining traits)\n- **Lineage:** (the genres and movements it draws from)\n- **Hybridity:** (any cross-genre elements present)`
              : `Role: Act as a genre taxonomist.\n\nTask: Perform a deep dive into the genre classification and evolution of ${ctx.artist}.\n\nOutput Format: Return a Markdown document covering:\n- **Primary & Sub-Genre:** (exact classification and defining traits)\n- **Lineage:** (the genres and movements they draw from)\n- **Evolution:** (how their genre identity has shifted across their catalog)`
        },
        {
          label: "Lyrics", prompt: ctx => ctx.track
            ? `Role: Act as a critical literary analyst.\n\nTask: Deconstruct the lyrics of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Provide a structured breakdown identifying:\n- The central thematic conceit\n- Specific literary devices used (metaphors, double entendres)\n- The dominant rhyming scheme and syllable structure`
            : ctx.album
              ? `Role: Act as a critical literary analyst.\n\nTask: Perform a macro thematic analysis of the lyrics across "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Detail the recurring motifs, overarching narrative arcs, and distinct character perspectives maintained throughout the project.`
              : `Role: Act as a critical literary analyst.\n\nTask: Analyze the dominant lyrical themes and conceptual motifs present throughout ${ctx.artist}'s entire discography.\n\nOutput Format: Document how their subject matter, worldview, and lyrical complexity have evolved over their active years.`
        },
        {
          label: "Sonic", prompt: ctx => ctx.track
            ? `Role: Act as an audio arrangement expert.\n\nTask: Break down the sonic architecture of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Deconstruct the function of the track by separating it into:\n- The rhythm section (drums/bass dynamics)\n- Lead melody instrumentation\n- Counter-melodies and atmospheric background textures`
            : ctx.album
              ? `Role: Act as an audio arrangement expert.\n\nTask: Break down the overarching sonic palette of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Analyze the balance of instrumentation, recurring sound design textures, and how the physical arrangement supports the album's primary mood.`
              : `Role: Act as an audio arrangement expert.\n\nTask: Define the core sonic architecture of ${ctx.artist}.\n\nOutput Format: Detail the specific instrumental textures, arrangement techniques, and tone choices that define their signature, recognizable sound.`
        },
        {
          label: "Technical", prompt: ctx => ctx.track
            ? `Role: Act as a studio mix engineer.\n\nTask: Analyze the technical mix and master of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Return a technical breakdown discussing:\n- Specific outboard gear or synthesizers utilized\n- Frequency balance and panning choices\n- Dynamic range compression and spatial effects (reverb/delay)`
            : ctx.album
              ? `Role: Act as a studio mix engineer.\n\nTask: Analyze the mix engineering and mastering philosophy of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Discuss the dynamic range (e.g., Loudness War context), frequency spectrum balance, analog vs. digital recording mediums used, and spatial depth.`
              : `Role: Act as a studio mix engineer.\n\nTask: Describe the typical mixing and mastering aesthetics favored by ${ctx.artist} and their frequent engineers.\n\nOutput Format: Categorize their typical mixes (e.g., dense, sparse, highly compressed, dynamic) and list their staple outboard gear or DAWs.`
        },
        {
          label: "Vocals", prompt: ctx => ctx.track
            ? `Role: Act as a vocal producer.\n\nTask: Deconstruct the vocal production on "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Detail the suspected microphone techniques, vocal layering/stacking, harmonic structure, tuning processing (e.g., Melodyne/Auto-Tune), and specific spatial effect chains.`
            : ctx.album
              ? `Role: Act as a vocal producer.\n\nTask: Deconstruct the vocal production techniques heavily utilized across "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Focus on vocal tracking methods, doubling, choir/harmonic arrangements, and consistent effect chains used throughout the project.`
              : `Role: Act as a vocal producer.\n\nTask: Analyze the physical vocal techniques and processing norms of ${ctx.artist}.\n\nOutput Format: Discuss their physical vocal range, phrasing tendencies, distinctive timbres, and preferred studio vocal chain processing.`
        },
      ],
    },
    discovery: {
      label: "Discovery",
      items: [
        {
          label: "Similar Artists", prompt: ctx =>
            `Task: Identify 5 well-known, easily accessible artists similar to ${ctx.artist}${ctx.album ? ` and their album "${ctx.album}"` : ""} in sound and style.\n\nOutput Format: Return a Markdown table with columns: Artist, Signature Album or Track, and Similarity Rationale (one sentence, mainstream-friendly).`
        },
        {
          label: "Niche", prompt: ctx => ctx.track
            ? `Task: Bypass standard algorithmic recommendations.\n\nConstraints: Do not suggest mainstream or highly popular artists.\n\nOutput Format: Suggest 5 highly obscure, niche, or underground tracks that perfectly match the tempo, sonic characteristics, and production philosophy of "${ctx.track}" by ${ctx.artist}. Provide a 1-sentence technical justification for each.`
            : ctx.album
              ? `Task: Bypass standard algorithmic recommendations.\n\nConstraints: Do not suggest mainstream or highly popular artists.\n\nOutput Format: Suggest 5 highly obscure, niche, or underground albums that share the exact sonic characteristics, mood, and production ethos of "${ctx.album}" by ${ctx.artist}. Provide a 1-sentence technical justification for each.`
              : `Task: Bypass standard algorithmic recommendations.\n\nConstraints: Do not suggest mainstream or highly popular artists.\n\nOutput Format: Suggest 5 highly obscure, niche, or underground artists that share the exact sonic characteristics and artistic ethos of ${ctx.artist}. Provide a 1-sentence technical justification for each.`
        },
        {
          label: "Samples", prompt: ctx => ctx.track
            ? `Task: Map the complete sample DNA of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: List any tracks sampled or interpolated to create this song, detailing the exact timestamp if known. Additionally, list notable subsequent tracks by other artists that have sampled this specific song.`
            : ctx.album
              ? `Task: Map the sample DNA of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Detail the primary samples and interpolations used in the production of this album. Note if this album has subsequently been heavily sampled by modern producers.`
              : `Task: Map the overall sample lineage of ${ctx.artist}.\n\nOutput Format: Identify their most frequent sample sources and genres. Detail how often their own catalog is sampled by other artists, providing 3 notable examples.`
        },
        {
          label: "Playlist", prompt: ctx => ctx.track
            ? `Task: Design a highly curated 10-track playlist where "${ctx.track}" by ${ctx.artist} serves as the centerpiece (track 5).\n\nConstraints: Ensure seamless sonic and rhythmic transitions between all tracks. Do not include other songs by the same artist.\n\nOutput Format: Output as a Markdown table with columns: Track #, Artist, Track Name, and Transition Rationale (focusing on tempo and key matching).`
            : ctx.album
              ? `Task: Design a 10-track playlist acting as a sonic and thematic sequel to "${ctx.album}" by ${ctx.artist}.\n\nConstraints: Exclude all songs by ${ctx.artist}.\n\nOutput Format: Output as a Markdown table with columns: Track #, Artist, Track Name, and Sonic Rationale.`
              : `Task: Design a 10-track introductory playlist for ${ctx.artist}.\n\nConstraints: Sequence the tracks to gradually build in musical complexity.\n\nOutput Format: Output as a Markdown table with columns: Track #, Track Name, and Rationale for its specific placement in the sequence.`
        },
        {
          label: "Live", prompt: ctx => ctx.track
            ? `Task: Explain the live translation of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Detail the arrangement changes when performed live. Note any instrumentation substitutions, tempo shifts, backing track reliance, or extended solo sections compared to the studio version.`
            : ctx.album
              ? `Task: Detail the touring cycle and live translation associated with "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Provide data on the primary stage design concepts, the structure of the standard setlist, and how complex studio production was adapted for live arenas (hired musicians vs. backing tracks).`
              : `Task: Summarize the live performance philosophy and structural touring history of ${ctx.artist}.\n\nOutput Format: Analyze whether they favor strict studio replication, heavy improvisation, or complete structural rearrangement. Highlight technical stage innovations from their most significant tours.`
        },
      ],
    },
    context: {
      label: "Context",
      items: [
        {
          label: "Influences", prompt: ctx => ctx.track
            ? `Task: Identify the specific artists, genres, or movements that directly influenced "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Return a Markdown list of primary influences, each with a one-sentence explanation of how that influence is audible or evident.`
            : ctx.album
              ? `Task: Identify the specific artists, genres, or movements that directly influenced "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Return a Markdown list of primary influences, each with a one-sentence explanation of how that influence is audible or evident.`
              : `Task: Identify the specific artists, genres, or movements that most directly shaped ${ctx.artist}'s sound and career.\n\nOutput Format: Return a Markdown list of primary influences, each with a one-sentence explanation of how that influence is audible or evident.`
        },
        {
          label: "Impact", prompt: ctx => ctx.track
            ? `Task: Detail the socio-political climate and industry impact of "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Explain how the era's zeitgeist influenced the writing, and conversely, how the track disrupted radio formats, streaming trends, or sub-genre viability.`
            : ctx.album
              ? `Task: Detail the socio-political climate and industry impact of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Explain how the project reflects or critiques its era. Discuss changes it catalyzed regarding label release strategies, production standards, or broader music industry economics.`
              : `Task: Analyze the macro impact of ${ctx.artist} on the music business and culture.\n\nOutput Format: Contextualize them within the socio-political movements of their peak era. Detail how they altered touring models, marketing strategies, or broader genre boundaries.`
        },
        {
          label: "Lore", prompt: ctx => ctx.track
            ? `Task: Document the internet culture and fandom lore associated with "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Identify specific viral trends, persistent memes, copypastas, or subcultural terminology that originated from this audio or its music video.`
            : ctx.album
              ? `Task: Analyze the core fanbase demographic and lore that formed around "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Identify specific subcultures, fashion trends, internet milestones, or widespread memes driven by this specific era of the artist.`
              : `Task: Document the internet lore, fandom demographics, and running jokes native to the ${ctx.artist} catalog.\n\nOutput Format: Detail the official/unofficial name of the fandom, associated subcultures, primary platforms where the fanbase operates, and major memes.`
        },
        {
          label: "Aesthetics", prompt: ctx => ctx.track
            ? `Role: Act as an art director.\n\nTask: Analyze the visual language of the official music video or promotional art for "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Discuss the cinematography, color grading palette, and direct symbolism utilized.`
            : ctx.album
              ? `Role: Act as an art director.\n\nTask: Analyze the visual identity of "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Identify the cover art designer or photographer. Discuss the specific artistic movements that influenced the packaging, typography, and era aesthetics.`
              : `Role: Act as an art director.\n\nTask: Deconstruct the career-spanning visual aesthetics and iconography utilized by ${ctx.artist}.\n\nOutput Format: Analyze how their stage fashion, album artworks, and visual presentation interface with and enhance their audio output.`
        },
        {
          label: "Trivia", prompt: ctx => ctx.track
            ? `Task: Provide deep-cut trivia and debunk myths regarding "${ctx.track}" by ${ctx.artist}.\n\nOutput Format: Return two Markdown lists:\n1. **Facts:** 5 highly obscure, verifiable facts about the recording process.\n2. **Myths:** Identify and correct the most common misheard lyrics or structural misconceptions.`
            : ctx.album
              ? `Task: Provide deep-cut trivia and debunk myths regarding "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Return two Markdown lists:\n1. **Facts:** 5 highly obscure, verifiable facts about scrapped ideas or studio sessions.\n2. **Myths:** Identify and correct the most prominent urban legends or false narratives surrounding the album's meaning.`
              : `Task: Provide deep-cut trivia and debunk myths regarding ${ctx.artist}.\n\nOutput Format: Return two Markdown lists:\n1. **Facts:** 5 obscure, verifiable pieces of insider lore regarding unreleased projects or pre-fame life.\n2. **Myths:** Identify and thoroughly debunk the largest public misconceptions or persistent rumors regarding the artist.`
        },
        {
          label: "Philosophy", prompt: ctx => ctx.album
            ? `Task: Identify the underlying artistic manifesto or ideology driving "${ctx.album}" by ${ctx.artist}.\n\nOutput Format: Detail the philosophical leaning or psychological statement of the work. Cite any specific literature, films, or philosophers that explicitly influenced the project.`
            : `Task: Analyze the core creative philosophy and worldview driving ${ctx.artist}.\n\nOutput Format: Detail the ethical, artistic, or existential viewpoints that consistently define their output and how they navigate industry compromises.`
        },
      ],
    },
  };

  const AI_PRESETS = Object.values(AI_CATEGORIES).flatMap(c => c.items.map(item => item.prompt));

  function openSettingsModal(initialTab) {
    const existing = document.getElementById("lfm-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "lfm-modal-overlay";

    // Added "Info" tab
    const tabs = [
      { id: "general", label: "General", icon: "fa-sliders" },
      { id: "sections", label: "Sections", icon: "fa-layer-group" },
      { id: "ai", label: "AI", icon: "fa-flask" },
      { id: "custom", label: "Custom", icon: "fa-link" },
      { id: "advanced", label: "Advanced", icon: "fa-screwdriver-wrench" },
      { id: "docs", label: "Docs", icon: "fa-book" },
      { id: "info", label: "Info", icon: "fa-circle-info" }
    ];

    const customServicesHtml = getCustomServices().map((svc, i) =>
      `<div class="settings-item">
        <div class="settings-info">
          <span class="settings-label">${escHtml(svc.label)}</span>
          <span class="settings-desc">${escHtml(svc.urlTemplate)}</span>
        </div>
        <button class="settings-remove-btn" data-index="${i}"><i class="fa-solid fa-xmark"></i></button>
      </div>`
    ).join("") ||
      '<p class="settings-section-title" style="padding:10px 12px;margin:0;">No custom services added yet.</p>';

    overlay.innerHTML = `
      <div id="lfm-modal-box" class="settings-modal">
        <div class="settings-header">
          <h2>Settings</h2>
          <div style="display:flex;align-items:center;gap:8px;position:absolute;right:16px;top:50%;transform:translateY(-50%);">
            <span id="lfm-modal-close" style="cursor:pointer;color:var(--text-secondary);font-size:16px;line-height:1;transition:color .15s;"><i class="fa-solid fa-xmark"></i></span>
          </div>
        </div>
        <div class="settings-body">
          <div class="settings-tabs" id="settings-sidebar">
            ${tabs.map(t => `<button class="settings-tab${t.id === "general" ? " active" : ""}" data-tab="${t.id}" title="${t.label}"><i class="fa-solid ${t.icon}"></i><span class="tab-label">${t.label}</span></button>`).join("")}
          </div>
          <div class="settings-content">

        <div class="settings-panel" data-panel="general" style="display:flex">
          <div class="settings-group" style="gap: 8px;">
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Last.fm Username</span>
                <span class="settings-desc">Generate dynamic profile metrics and image canvas links.</span>
              </div>
              <input type="text" id="modal-username-input" placeholder="Username">
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Inline Toggle</span>
                <span class="settings-desc">Choose between the bubble button, minimal icon, or hide entirely.</span>
              </div>
              <select id="modal-icon-style">
                <option value="bubble">Bubble</option>
                <option value="minimal">Minimal</option>
                <option value="hidden">Highlight Only</option>
              </select>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Opening Behavior</span>
                <span class="settings-desc">Popup opens a centered window; Tab opens a regular background tab.</span>
              </div>
              <select id="modal-toggle-open-mode">
                <option value="popup">Popup Window</option>
                <option value="tab">New Tab</option>
              </select>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Toggle Position</span>
                <span class="settings-desc">Move the main floating button to avoid UI overlaps.</span>
              </div>
              <select id="modal-toggle-position">
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Menu Behavior</span>
                <span class="settings-desc">Control when the toolbox menu closes after clicking a service.</span>
              </div>
              <select id="modal-close-behavior">
                <option value="close">Unfocus Close</option>
                <option value="keep">Keep Open</option>
                <option value="timeout">Auto-Close</option>
              </select>
            </div>
            <div class="settings-item" id="modal-close-delay-container" style="display: none;">
              <div class="settings-info">
                <span class="settings-label">Auto-Close Delay (Seconds)</span>
                <span class="settings-desc">Time to wait before closing the panel.</span>
              </div>
              <input type="number" id="modal-close-delay-input" min="1" max="60" value="3">
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Hover Highlight</span>
                <span class="settings-desc">Eligible items turn red when hovered to denote right-click capacity.</span>
              </div>
              <div id="modal-toggle-highlight" class="toggle-switch"><i class="fa-solid fa-radiation"></i></div>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Color Mode</span>
                <span class="settings-desc">Toggle user interface between Dark (Default) and Light Mode.</span>
              </div>
              <div id="modal-toggle-light-mode" class="toggle-switch"><i class="fa-solid fa-radiation"></i></div>
            </div>
          </div>
        </div>

        <div class="settings-panel" data-panel="sections" style="display:none">
          <p class="settings-section-title">Enable or disable categories or fine-tune specific items.</p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${CATEGORY_ORDER.map(cat => {
      const isCatHidden = localStorage.getItem("setting-section-" + cat) === "false";
      const isOpenAll = localStorage.getItem("setting-openall-" + cat) === "true";

      let itemsHtml = `<div class="settings-item-subgroup" id="subgroup-cat-${cat}" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color); display: ${isCatHidden ? 'none' : 'grid'}; grid-template-columns: repeat(3, 1fr); gap: 6px 12px;">`;

      SERVICE_CATEGORIES[cat].forEach(id => {
        const label = SERVICE_LABELS[id] || id;
        const isItemHidden = localStorage.getItem("setting-svc-hidden-" + id) === "true";
        itemsHtml += `
                  <div class="settings-item" style="padding: 2px 4px; min-height: 24px;">
                    <div class="settings-info">
                      <span class="settings-label" style="font-weight: 500; font-size: 11.5px; color: var(--text-primary);">${label}</span>
                    </div>
                    <div id="modal-toggle-svc-${id}" class="toggle-switch ${!isItemHidden ? 'active' : ''}" style="width: 14px; height: 14px; border-radius: 3px; border-width: 1px;">
                      <i class="fa-solid fa-check" style="font-size: 9px;"></i>
                    </div>
                  </div>`;
      });

      // Append Open All toggle inline with other grid items
      itemsHtml += `
                  <div class="settings-item" style="padding: 2px 4px; min-height: 24px;">
                    <div class="settings-info">
                      <span class="settings-label" style="font-weight: 700; font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Open All</span>
                    </div>
                    <div id="modal-toggle-openall-${cat}" class="toggle-switch ${isOpenAll ? 'active' : ''}" style="width: 14px; height: 14px; border-radius: 3px; border-width: 1px;">
                      <i class="fa-solid fa-check" style="font-size: 9px;"></i>
                    </div>
                  </div>
              </div>`;

      return `
                <div class="category-toggle-block" style="background: var(--bg-secondary); border-radius: 6px; padding: 12px; border: 1px solid var(--border-color);">
                  <div class="settings-item" style="padding: 0;">
                    <div class="settings-info">
                      <span class="settings-label" style="text-transform: uppercase; letter-spacing: 0.5px; font-size: 13px; font-weight: 700; color: var(--brand);">${CATEGORY_LABELS[cat]}</span>
                    </div>
                    <div id="modal-toggle-section-${cat}" class="toggle-switch ${!isCatHidden ? 'active' : ''}">
                      <i class="fa-solid fa-radiation"></i>
                    </div>
                  </div>
                  ${itemsHtml}
                </div>
              `;
    }).join("")}
          </div>
        </div>

        <div class="settings-panel" data-panel="ai" style="display:none">
          <div class="settings-group" style="gap: 12px;">

            <!-- Toggles Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="settings-item settings-grid-card">
                <div class="settings-info">
                  <span class="settings-label">Popup Behavior</span>
                  <span class="settings-desc">Open providers in a popup window.</span>
                </div>
                <div id="modal-toggle-ai-popup" class="toggle-switch"><i class="fa-solid fa-check"></i></div>
              </div>
              <div class="settings-item settings-grid-card">
                <div class="settings-info">
                  <span class="settings-label">Auto-Copy Prompt</span>
                  <span class="settings-desc">Copy to clipboard on open.</span>
                </div>
                <div id="modal-toggle-ai-autocopy" class="toggle-switch"><i class="fa-solid fa-check"></i></div>
              </div>
            </div>

            <!-- Selects Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="settings-item settings-grid-card">
                <div class="settings-info">
                  <span class="settings-label">Default Provider</span>
                </div>
                <select id="setting-select-default-ai-provider" style="width: auto; min-width: 110px;">
                  ${AI_PROVIDERS.map(p => `<option value="${p.id}">${p.label}</option>`).join("")}
                </select>
              </div>
              <div class="settings-item settings-grid-card">
                <div class="settings-info">
                  <span class="settings-label">Default Category</span>
                </div>
                <select id="setting-select-default-ai-category" style="width: auto; min-width: 110px;">
                  ${Object.entries(AI_CATEGORIES).map(([key, cat]) => `<option value="${key}">${cat.label}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Prompt Preview & Editor -->
            <div class="settings-grid-card" style="display: flex; flex-direction: column;">
              <p class="settings-card-title">Prompt Preview &amp; Editor</p>
              <p class="settings-desc" style="margin: -6px 0 10px;">Select a preset to preview and edit. Changes are saved per-preset.</p>
              <div style="display: flex; gap: 8px; width: 100%;">
                <select id="setting-ai-preview-category" style="flex: 1;"></select>
                <select id="setting-ai-preview-preset" style="flex: 1;"></select>
              </div>
              <textarea id="setting-ai-preview-text" style="width: 100%; height: 90px; box-sizing: border-box; resize: vertical; padding: 8px; margin-top: 8px; font-size: 12px; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-primary); border-radius: 4px;"></textarea>
              <div style="display: flex; gap: 8px; align-items: center; width: 100%; margin-top: 8px;">
                <button id="setting-ai-preview-save-btn" style="padding: 5px 14px; font-size: 11px; font-weight: 700; border-radius: 4px; background: rgba(var(--brand-rgb),.12); border: 1px solid var(--brand); color: var(--text-primary); cursor: pointer; transition: background .15s;">Save Preset</button>
                <button id="setting-ai-preview-reset-btn" style="padding: 5px 10px; font-size: 11px; border-radius: 4px; background: var(--bg-hover); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; transition: background .15s;">Reset to Default</button>
                <span id="setting-ai-preview-status" style="font-size: 11px; color: var(--text-secondary); margin-left: auto;"></span>
              </div>
            </div>

            <!-- Custom Instructions -->
            <div class="settings-grid-card" style="display: flex; flex-direction: column;">
              <p class="settings-card-title">Custom Instructions</p>
              <p class="settings-desc" style="margin: -6px 0 10px;">Appended to all generated prompts (e.g., "Format as markdown").</p>
              <textarea id="setting-ai-custom-suffix" style="width: 100%; height: 60px; box-sizing: border-box; resize: vertical; padding: 8px; font-size: 12px; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-primary); border-radius: 4px;"></textarea>
            </div>

          </div>
        </div>

        <div class="settings-panel" data-panel="custom" style="display:none">
          <p class="settings-section-title">Add custom links to the toolbox. Use variables like <code>{artist}</code>, <code>{album}</code>, <code>{track}</code>, and <code>{query}</code> in the URL template.</p>
          <div id="settings-custom-list">
            ${customServicesHtml}
          </div>
          <div class="settings-custom-form">
            <input type="text" id="settings-custom-label" placeholder="Label">
            <input type="text" id="settings-custom-url" placeholder="URL with {artist} {album} {track}">
            <button id="settings-custom-add"><i class="fa-solid fa-plus"></i> Add</button>
          </div>
        </div>

        <div class="settings-panel" data-panel="advanced" style="display:none;">
          <p class="settings-section-title" style="margin: 0 0 10px; flex-shrink: 0;">Backup, restore, fine-tune, or reset your Last.fm Toolbox configuration state variables.</p>

          <div style="flex: 1; display: flex; flex-direction: column; min-height: 0; gap: 8px;">
            <!-- Editor stretches to fill all available space automatically -->
            <textarea id="modal-advanced-json-editor" spellcheck="false" style="flex: 1; width: 100%; min-height: 0; box-sizing: border-box; font-family: monospace; font-size: 11px; line-height: 1.4; background: var(--input-bg); border: 1px solid var(--input-border); color: #00ce37; border-radius: 6px; padding: 10px; resize: none; margin: 0;"></textarea>

            <!-- Bottom action row -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-color); flex-wrap: wrap; flex-shrink: 0;">
              <div style="display: flex; gap: 6px;">
                <button id="settings-export-btn" class="settings-tab" style="padding: 4px 10px !important; font-size: 11px !important; border-radius: 4px !important; margin: 0; background: transparent;"><i class="fa-solid fa-copy"></i> Export</button>
                <button id="settings-import-btn" class="settings-tab" style="padding: 4px 10px !important; font-size: 11px !important; border-radius: 4px !important; margin: 0; background: transparent;"><i class="fa-solid fa-file-import"></i> Import</button>
                <button id="settings-reset-btn" class="settings-tab" style="padding: 4px 10px !important; font-size: 11px !important; border-radius: 4px !important; margin: 0; border-color: var(--brand) !important; color: var(--brand) !important; background: rgba(218,35,35,0.06);"><i class="fa-solid fa-arrow-rotate-left"></i> Reset</button>
              </div>
              <button id="settings-save-json-btn" class="settings-tab active" style="padding: 4px 14px !important; font-size: 11px !important; border-radius: 4px !important; margin: 0; font-weight: 600;"><i class="fa-solid fa-floppy-disk"></i> Apply Live Edits</button>
            </div>
          </div>
        </div>

        <div class="settings-panel" data-panel="docs" style="display:none">
          <p class="settings-section-title">A quick reference for everything the toolbox can do.</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">

            <div class="settings-card">
              <p class="settings-card-title">Keyboard Shortcuts</p>
              <p class="settings-desc" style="margin:0;"><code>Ctrl+Shift+E</code> opens or closes the toolbox using the current page's context. <code>Esc</code> closes whatever's open — a modal first, then the menu.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">The Floating Button</p>
              <p class="settings-desc" style="margin:0;">Left-click toggles the menu. Right-click cycles its screen corner: bottom-left → bottom-right → top-left → top-right.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Right-Click Any Link</p>
              <p class="settings-desc" style="margin:0;">Right-click any artist, album, or track link on Last.fm — grid cards, chartlists, and the "..." more menu included — to jump straight into the toolbox for that item, even with inline icons hidden.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Inline Icons</p>
              <p class="settings-desc" style="margin:0;">Choose Bubble, Minimal, or Highlight Only under Settings &gt; General &gt; Inline Toggle. Highlight Only skips the icons and just turns eligible links red on hover.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Manual Search</p>
              <p class="settings-desc" style="margin:0;">Type <code>Artist</code>, <code>Artist - Album</code>, or <code>Artist - Album - Track</code> into the search box and hit Enter to load that context. Click the <code>?</code> icon for a format reminder.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Sections &amp; Open All</p>
              <p class="settings-desc" style="margin:0;">Click a category header to expand or collapse it — your choice is remembered. Open All is off by default; enable it per-category in Settings &gt; Sections to launch every service in that category, staggered so your browser doesn't choke.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Service Rows</p>
              <p class="settings-desc" style="margin:0;">Clicking a service opens it using your Opening Behavior setting (Tab or Popup). Hover a row for a <code>+</code> button that always forces a new tab, or a robot icon that sends that context straight into the AI Prompt Generator.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">TheAudioDB Extras</p>
              <p class="settings-desc" style="margin:0;">The main link resolves straight to the artist's visual page. The <code>&lt;/&gt;</code> and Markdown buttons next to it download the raw API data or a formatted band profile — nothing downloads if no match is found.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">AI Prompt Generator</p>
              <p class="settings-desc" style="margin:0;">Pick a category and preset, edit the generated prompt inline, then Copy, Open, or Copy &amp; Open. Your last-used provider is remembered, and Settings &gt; AI &gt; Auto-Copy Prompt copies before opening.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Menu Behavior</p>
              <p class="settings-desc" style="margin:0;">Decide whether the toolbox closes immediately after clicking a service, stays open, or auto-closes after a delay — set it in Settings &gt; General &gt; Menu Behavior.</p>
            </div>

            <div class="settings-card">
              <p class="settings-card-title">Troubleshooting</p>
              <p class="settings-desc" style="margin:0;">Button hidden behind other page UI? Use <code>Ctrl+Shift+E</code>, or your userscript manager's menu commands (Toggle / Settings / Cycle Popup) instead.</p>
            </div>

          </div>
        </div>

<div class="settings-panel" data-panel="info" style="display:none">
          <div style="text-align: center; margin-bottom: 24px; padding-top: 10px;">
            <i class="fa-brands fa-lastfm" style="font-size: 42px; color: var(--brand); margin-bottom: 8px;"></i>
            <h3 style="margin: 0; color: var(--text-primary); font-size: 18px;">Last.fm: Toolbox</h3>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 12px;">Version 6 by deathrashed</p>
          </div>

          <div class="settings-group" style="gap: 12px;">
            <p class="settings-section-title" style="margin: 0 0 4px;">Project Links</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <a href="https://greasyfork.org/scripts/563609" target="_blank" class="settings-item settings-grid-card" style="text-decoration: none; align-items: flex-start;">
                <div class="settings-info" style="gap: 4px;">
                  <span class="settings-label">Greasy Fork</span>
                  <span class="settings-desc">Rate &amp; review the script.</span>
                </div>
                <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--text-secondary); margin-top: 2px;"></i>
              </a>
              <a href="https://github.com/deathrashed/lastfm-userscript" target="_blank" class="settings-item settings-grid-card" style="text-decoration: none; align-items: flex-start;">
                <div class="settings-info" style="gap: 4px;">
                  <span class="settings-label">GitHub Repository</span>
                  <span class="settings-desc">Source, fork, or star.</span>
                </div>
                <i class="fa-brands fa-github" style="color: var(--text-secondary); font-size: 16px; margin-top: 2px;"></i>
              </a>
              <a href="https://github.com/deathrashed/lastfm-userscript/issues/new" target="_blank" class="settings-item settings-grid-card" style="text-decoration: none; grid-column: 1 / -1;">
                <div class="settings-info" style="gap: 4px;">
                  <span class="settings-label">Feature Requests &amp; Bug Reports</span>
                  <span class="settings-desc">Submit ideas or report issues directly via GitHub Issues.</span>
                </div>
                <i class="fa-solid fa-lightbulb" style="color: var(--brand); font-size: 16px;"></i>
              </a>
            </div>

            <p class="settings-section-title" style="margin: 8px 0 4px;">Recommended Resources</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <a href="https://www.bijou.fm/tools?service=Last.fm" target="_blank" class="settings-item settings-grid-card" style="text-decoration: none; align-items: flex-start;">
                <div class="settings-info" style="gap: 4px;">
                  <span class="settings-label">Bijou</span>
                  <span class="settings-desc">Last.fm tools &amp; utilities.</span>
                </div>
                <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--text-secondary); margin-top: 2px;"></i>
              </a>
              <a href="https://github.com/chr1sx/Last.fm-Artwork-Upload-Helper/" target="_blank" class="settings-item settings-grid-card" style="text-decoration: none; align-items: flex-start;">
                <div class="settings-info" style="gap: 4px;">
                  <span class="settings-label">Artwork Uploader</span>
                  <span class="settings-desc">Upload custom artwork.</span>
                </div>
                <i class="fa-brands fa-github" style="color: var(--text-secondary); font-size: 16px; margin-top: 2px;"></i>
              </a>
            </div>
          </div>
        </div>
        <div id="settings-footer" style="text-align:center;padding:12px 24px 6px;font-size:11px;color:var(--text-secondary);border-top:1px solid var(--border-color);margin-top:12px;flex-shrink:0;">
          <span id="settings-footer-label">General</span>
        </div>
          </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById("lfm-modal-close").addEventListener("click", () => overlay.remove());

    overlay.querySelectorAll(".settings-tab").forEach(tab => {
      tab.addEventListener("click", function () {
        overlay.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        overlay.querySelectorAll(".settings-panel").forEach(p => p.style.display = "none");
        const panel = overlay.querySelector(`.settings-panel[data-panel="${this.dataset.tab}"]`);
        if (panel) panel.style.display = "flex";
        const footerLabel = document.getElementById("settings-footer-label");
        const tabLabel = this.querySelector(".tab-label");
        if (footerLabel && tabLabel) footerLabel.textContent = tabLabel.textContent;
      });
    });

    // If a specific tab was requested (e.g. from AI modal gear button), activate it
    if (initialTab) {
      const targetTab = overlay.querySelector(`.settings-tab[data-tab="${initialTab}"]`);
      if (targetTab) {
        overlay.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
        targetTab.classList.add("active");
        overlay.querySelectorAll(".settings-panel").forEach(p => p.style.display = "none");
        const panel = overlay.querySelector(`.settings-panel[data-panel="${initialTab}"]`);
        if (panel) panel.style.display = "flex";
        const footerLabel = document.getElementById("settings-footer-label");
        const tabLabel = targetTab.querySelector(".tab-label");
        if (footerLabel && tabLabel) footerLabel.textContent = tabLabel.textContent;
      }
    }

    const sidebarToggle = document.getElementById("settings-sidebar-toggle-btn");
    const sidebar = document.getElementById("settings-sidebar");
    if (sidebarToggle && sidebar) {
      if (localStorage.getItem("setting-sidebar-expanded") !== "false") {
        sidebar.classList.add("expanded");
        sidebarToggle.innerHTML = '<i class="fa-solid fa-chevron-left"></i><span class="toggle-label">Collapse</span>';
      }
      sidebarToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        const expanded = sidebar.classList.toggle("expanded");
        localStorage.setItem("setting-sidebar-expanded", expanded ? "true" : "false");
        this.innerHTML = expanded
          ? '<i class="fa-solid fa-chevron-left"></i><span class="toggle-label">Collapse</span>'
          : '<i class="fa-solid fa-chevron-right"></i><span class="toggle-label">Expand</span>';
      });
    }

    overlay.querySelectorAll(".settings-remove-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const list = getCustomServices();
        list.splice(parseInt(this.dataset.index, 10), 1);
        saveCustomServices(list);
        overlay.remove();
        openSettingsModal();
      });
    });

    document.getElementById("settings-custom-add")?.addEventListener("click", () => {
      const label = document.getElementById("settings-custom-label").value.trim();
      const urlTemplate = document.getElementById("settings-custom-url").value.trim();
      if (!label || !urlTemplate) return;
      const services = getCustomServices();
      services.push({ label, urlTemplate });
      saveCustomServices(services);
      overlay.remove();
      openSettingsModal();
    });

    setupToggles();

    // Wire up AI settings prompt preview with persistent per-preset editing
    const aiPreviewCat = document.getElementById("setting-ai-preview-category");
    const aiPreviewPreset = document.getElementById("setting-ai-preview-preset");
    const aiPreviewText = document.getElementById("setting-ai-preview-text");
    const aiPreviewSaveBtn = document.getElementById("setting-ai-preview-save-btn");
    const aiPreviewResetBtn = document.getElementById("setting-ai-preview-reset-btn");
    const aiPreviewStatus = document.getElementById("setting-ai-preview-status");

    if (aiPreviewCat && aiPreviewPreset && aiPreviewText) {
      // Populate category dropdown
      aiPreviewCat.innerHTML = Object.entries(AI_CATEGORIES).map(([key, cat]) =>
        `<option value="${key}">${cat.label}</option>`
      ).join("");

      function getPreviewStorageKey() {
        const realCtx = buildContext(currentContext);
        const ctxType = realCtx.track ? "track" : (realCtx.album ? "album" : "artist");
        return `setting-ai-preset-override-${aiPreviewCat.value}-${aiPreviewPreset.value}-${ctxType}`;
      }

      function getDefaultPromptText() {
        const catKey = aiPreviewCat.value;
        const category = AI_CATEGORIES[catKey];
        if (!category) return "";
        const idx = parseInt(aiPreviewPreset.value, 10);
        const item = category.items[idx];
        if (!item) return "";

        const realCtx = buildContext(currentContext);
        const placeholderCtx = {};
        if (realCtx.artist) placeholderCtx.artist = "{artist}";
        if (realCtx.album) placeholderCtx.album = "{album}";
        if (realCtx.track) placeholderCtx.track = "{track}";

        const suffix = localStorage.getItem("setting-ai-custom-suffix") || "";
        const suffixStr = suffix ? "\n\n" + suffix : "";
        return item.prompt(placeholderCtx) + suffixStr;
      }

      function loadPreviewText() {
        const override = localStorage.getItem(getPreviewStorageKey());
        aiPreviewText.value = override !== null ? override : getDefaultPromptText();
        const hasOverride = override !== null;
        if (aiPreviewStatus) aiPreviewStatus.textContent = hasOverride ? "✎ Custom" : "";
      }

      function populatePresets() {
        const catKey = aiPreviewCat.value;
        const category = AI_CATEGORIES[catKey];
        if (!category) return;
        aiPreviewPreset.innerHTML = category.items.map((item, i) =>
          `<option value="${i}">${item.label}</option>`
        ).join("");
        loadPreviewText();
      }

      aiPreviewCat.addEventListener("change", populatePresets);
      aiPreviewPreset.addEventListener("change", loadPreviewText);
      populatePresets();

      if (aiPreviewSaveBtn) {
        aiPreviewSaveBtn.addEventListener("click", () => {
          localStorage.setItem(getPreviewStorageKey(), aiPreviewText.value);
          if (aiPreviewStatus) {
            aiPreviewStatus.textContent = "✓ Saved";
            setTimeout(() => { aiPreviewStatus.textContent = "✎ Custom"; }, 1500);
          }
        });
      }

      if (aiPreviewResetBtn) {
        aiPreviewResetBtn.addEventListener("click", () => {
          localStorage.removeItem(getPreviewStorageKey());
          aiPreviewText.value = getDefaultPromptText();
          if (aiPreviewStatus) {
            aiPreviewStatus.textContent = "↺ Reset";
            setTimeout(() => { aiPreviewStatus.textContent = ""; }, 1500);
          }
        });
      }
    }

    const posSelect = document.getElementById("modal-toggle-position");
    if (posSelect) {
      posSelect.value = getTogglePosition();
      posSelect.addEventListener("change", function () {
        localStorage.setItem(TOGGLE_POSITION_KEY, this.value);
        applyTogglePosition();
      });
    }

    const iconStyleSelect = document.getElementById("modal-icon-style");
    if (iconStyleSelect) {
      iconStyleSelect.value = localStorage.getItem("setting-icon-style") || "bubble";
      iconStyleSelect.addEventListener("change", function () {
        localStorage.setItem("setting-icon-style", this.value);
        document.documentElement.classList.toggle("lfm-icon-style-minimal", this.value === "minimal");
        document.documentElement.classList.toggle("lfm-icons-hidden", this.value === "hidden");
      });
    }

    const openModeSelect = document.getElementById("modal-toggle-open-mode");
    if (openModeSelect) {
      openModeSelect.value = localStorage.getItem("musicengine.defaultOpenMode") || "tab";
      openModeSelect.addEventListener("change", function () {
        localStorage.setItem("musicengine.defaultOpenMode", this.value);
        updateServiceLaunchButtonsVisibility();
      });
    }

    // 1. Stored Profile User string tracker
    const usernameInput = document.getElementById("modal-username-input");
    if (usernameInput) {
      usernameInput.value = localStorage.getItem("setting-lfm-username") || "";
      usernameInput.addEventListener("input", function () {
        localStorage.setItem("setting-lfm-username", this.value.trim());
      });
    }

    // 2. Menu Auto-Close Behavior Visibility Loop & Listeners
    const closeBehaviorSelect = document.getElementById("modal-close-behavior");
    const delayContainer = document.getElementById("modal-close-delay-container");
    const delayInput = document.getElementById("modal-close-delay-input");

    if (closeBehaviorSelect && delayContainer && delayInput) {
      const updateDelayVisibility = (val) => {
        delayContainer.style.display = val === "timeout" ? "flex" : "none";
      };

      closeBehaviorSelect.value = localStorage.getItem("setting-close-behavior") || "close";
      updateDelayVisibility(closeBehaviorSelect.value);

      closeBehaviorSelect.addEventListener("change", function () {
        localStorage.setItem("setting-close-behavior", this.value);
        updateDelayVisibility(this.value);
      });

      delayInput.value = localStorage.getItem("setting-close-delay") || "3";
      delayInput.addEventListener("input", function () {
        localStorage.setItem("setting-close-delay", this.value);
      });
    }

    document.getElementById("settings-export-btn")?.addEventListener("click", () => {
      const config = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("setting-") || key.startsWith("musicengine.") || key === "lfm-custom-services") {
          config[key] = localStorage.getItem(key);
        }
      }
      const json = JSON.stringify(config, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lastfm-toolbox-settings.json";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Settings file downloaded.");
    });

    document.getElementById("settings-import-btn")?.addEventListener("click", () => {
      showToast("Paste settings JSON into the prompt that follows");
      setTimeout(() => {
        const dataStr = prompt("Paste your exported settings JSON string here:");
        if (!dataStr) return;
        try {
          const config = JSON.parse(dataStr);
          Object.keys(config).forEach(key => {
            if (key.startsWith("setting-") || key.startsWith("musicengine.") || key === "lfm-custom-services") {
              localStorage.setItem(key, config[key]);
            }
          });
          showToast("Settings imported! Reloading page...");
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          showToast("Invalid settings JSON: " + err.message);
        }
      }, 100);
    });

    document.getElementById("settings-reset-btn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all preferences to defaults? (Your custom services list will be preserved)")) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if ((key.startsWith("setting-") || key.startsWith("musicengine.")) && key !== "lfm-custom-services") {
            localStorage.removeItem(key);
          }
        }
        showToast("Settings reset! Reloading page...");
        setTimeout(() => location.reload(), 800);
      }
    });

    // Power-User JSON Editor Initialization & Event Hooks
    const jsonEditor = document.getElementById("modal-advanced-json-editor");
    const saveJsonBtn = document.getElementById("settings-save-json-btn");

    if (jsonEditor && saveJsonBtn) {
      refreshJsonEditor();

      // Bind parsing intercept listener trigger on click events
      saveJsonBtn.addEventListener("click", function () {
        try {
          const parsedConfig = JSON.parse(jsonEditor.value);

          // Clear current keys to guarantee absolute parity on batch deletions
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith("setting-") || key.startsWith("musicengine.") || key === "lfm-custom-services") {
              localStorage.removeItem(key);
            }
          }

          // Commit valid parsed fields back into localStorage keys
          Object.keys(parsedConfig).forEach(key => {
            const val = parsedConfig[key];
            const serializedVal = (typeof val === "object" && val !== null) ? JSON.stringify(val) : String(val);
            localStorage.setItem(key, serializedVal);
          });

          showToast("Configuration state rewritten cleanly! Reloading page...");
          setTimeout(() => location.reload(), 800);
        } catch (err) {
          alert("Syntax Error: Invalid JSON detected. Please check brackets, comma assignments, and quotes.\n\nDetails: " + err.message);
        }
      });
    }

    // Auto-update JSON editor when interacting with UI toggles
    document.getElementById("lfm-modal-box").addEventListener("click", () => setTimeout(refreshJsonEditor, 10));
    document.getElementById("lfm-modal-box").addEventListener("input", () => setTimeout(refreshJsonEditor, 10));
    document.getElementById("lfm-modal-box").addEventListener("change", () => setTimeout(refreshJsonEditor, 10));
  }

  function refreshJsonEditor() {
    const jsonEditor = document.getElementById("modal-advanced-json-editor");
    if (!jsonEditor || document.activeElement === jsonEditor) return;

    const configObj = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("setting-") || key.startsWith("musicengine.") || key === "lfm-custom-services") {
        try {
          configObj[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          configObj[key] = localStorage.getItem(key);
        }
      }
    }
    jsonEditor.value = JSON.stringify(configObj, null, 2);
  }

  function openAIModal() {
    const existing = document.getElementById("lfm-modal-overlay");
    if (existing) existing.remove();

    const ctx = buildContext(currentContext);
    const suffix = localStorage.getItem("setting-ai-custom-suffix") || "";
    const suffixStr = suffix ? "\n\n" + suffix : "";

    const defaultPrompt = (ctx.track
      ? `Give me a comprehensive overview of the song ${ctx.track} by ${ctx.artist}`
      : ctx.album
        ? `Give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}`
        : ctx.artist
          ? `Give me a comprehensive overview of the band ${ctx.artist}`
          : "") + suffixStr;

    const defaultProvider = localStorage.getItem("setting-default-ai-provider") || "chatgpt-link";
    const lastProvider = localStorage.getItem("lfm-last-ai-provider") || defaultProvider;

    const overlay = document.createElement("div");
    overlay.id = "lfm-modal-overlay";

    const contextIcon = ctx.track ? "fa-music" : ctx.album ? "fa-compact-disc" : ctx.artist ? "fa-user" : "fa-circle-question";
    const contextType = ctx.track ? "Track" : ctx.album ? "Album" : ctx.artist ? "Artist" : "None";
    const contextName = ctx.track ? `${ctx.track} — ${ctx.artist}` : ctx.album ? `${ctx.album} — ${ctx.artist}` : ctx.artist || "";

    // Read default category from settings
    const defaultCatKey = localStorage.getItem("setting-default-ai-category") || "overview";

    const catOptions = Object.entries(AI_CATEGORIES).map(([key, cat]) =>
      `<option value="${key}" ${key === defaultCatKey ? 'selected' : ''}>${cat.label}</option>`
    ).join("");

    overlay.innerHTML = `
      <div id="lfm-modal-box" class="ai-modal" style="width: 600px; padding: 20px;">
        <div class="modal-header" style="position: relative; display: flex; justify-content: center; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="color: var(--brand); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;"><i class="fa-solid fa-flask"></i> AI Prompt Generator</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">Configure Request</div>
          </div>
          <div style="position: absolute; right: 0; top: 0; display: flex; align-items: center; gap: 8px;">
            <span id="ai-modal-settings-btn" title="AI Settings" style="cursor: pointer; color: var(--text-secondary); font-size: 14px; transition: color .15s;"><i class="fa-solid fa-gear"></i></span>
            <span id="lfm-modal-close" style="cursor: pointer; color: var(--text-secondary); font-size: 16px; transition: color .15s;"><i class="fa-solid fa-xmark"></i></span>
          </div>
        </div>

        <div id="ai-context-display">
          <span class="ai-context-icon" style="background: rgba(218,35,35,0.1); border-radius: 4px; padding: 4px; height: 24px; width: 24px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid ${contextIcon}"></i></span>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="ai-context-type" style="padding: 0; background: transparent; font-size: 9px;">${contextType} Context</span>
            <span class="ai-context-name" style="font-size: 14px;">${escHtml(contextName)}</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Category</label>
            <select id="ai-category-select" style="width: 100%; min-width: 100%;">${catOptions}</select>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Prompt Preset</label>
            <select id="ai-preset-select" style="width: 100%; min-width: 100%;"></select>
          </div>
        </div>

        <textarea id="ai-prompt-text" style="flex: 1; width: 100%; resize: none; margin-bottom: 12px; background: var(--bg-primary); border: 1px solid var(--border-color);"></textarea>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px solid var(--border-color); gap: 6px; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 180px; min-width: 140px;">
            <label style="font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Engine</label>
            <select id="ai-provider-select" style="width: 100%; min-width: 100%;">
              ${AI_PROVIDERS.map(p => `<option value="${p.id}"${p.id === lastProvider ? " selected" : ""}>${p.label}</option>`).join("")}
            </select>
          </div>
          <div class="lfm-modal-actions" style="margin-top: 0; display: flex; gap: 6px; flex-wrap: wrap; align-items: stretch;">
            <button id="ai-copy-btn" style="padding: 4px 10px; font-size: 11px; border-radius: 4px; margin: 0; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: border-color .2s; min-width: max-content;"><i class="fa-solid fa-copy"></i> Copy</button>
            <button id="ai-open-btn" style="padding: 4px 10px; font-size: 11px; border-radius: 4px; margin: 0; background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: border-color .2s; min-width: max-content;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</button>
            <button id="ai-copy-open-btn" style="padding: 4px 10px; font-size: 11px; border-radius: 4px; margin: 0; background: rgba(var(--brand-rgb), .10); color: var(--text-primary); border: 1px solid var(--brand); cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; transition: border-color .2s; min-width: max-content;"><i class="fa-solid fa-copy"></i> Copy &amp; Open</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    function updatePresets() {
      const catKey = document.getElementById("ai-category-select").value;
      const category = AI_CATEGORIES[catKey];
      if (!category) return;
      const select = document.getElementById("ai-preset-select");
      select.innerHTML = category.items.map((item, i) => {
        const ctxType = ctx.track ? "track" : (ctx.album ? "album" : "artist");
        const override = localStorage.getItem(`setting-ai-preset-override-${catKey}-${i}-${ctxType}`);

        let full;
        if (override !== null) {
          full = override
            .replace(/\{artist\}/g, ctx.artist || "")
            .replace(/\{album\}/g, ctx.album || "")
            .replace(/\{track\}/g, ctx.track || "");
        } else {
          const suffix = localStorage.getItem("setting-ai-custom-suffix") || "";
          const suffixStr = suffix ? "\n\n" + suffix : "";
          full = item.prompt(ctx) + suffixStr;
        }

        return `<option value="${i}" data-prompt="${escHtml(full)}">${item.label}${override !== null ? " ✎" : ""}</option>`;
      }).join("");
      const first = select.options[0];
      if (first) document.getElementById("ai-prompt-text").value = first.dataset.prompt;
    }

    document.getElementById("ai-category-select").addEventListener("change", updatePresets);
    document.getElementById("ai-preset-select").addEventListener("change", function () {
      const opt = this.options[this.selectedIndex];
      if (opt) document.getElementById("ai-prompt-text").value = opt.dataset.prompt;
    });

    if (ctx.artist) {
      updatePresets();
    }

    document.getElementById("ai-copy-btn").addEventListener("click", () => {
      const text = document.getElementById("ai-prompt-text").value;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById("ai-copy-btn");
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
        });
      }
    });

    document.getElementById("ai-open-btn").addEventListener("click", () => {
      const text = document.getElementById("ai-prompt-text").value;
      const providerId = document.getElementById("ai-provider-select").value;
      if (!text) return;

      localStorage.setItem("lfm-last-ai-provider", providerId);
      const provider = AI_PROVIDERS.find(p => p.id === providerId);

      const isAutoCopy = localStorage.getItem("setting-ai-autocopy") === "true";

      if (isAutoCopy) {
        navigator.clipboard.writeText(text).then(() => {
          if (provider) openAIUrl(provider.url(text));
        });
      } else {
        if (provider) openAIUrl(provider.url(text));
      }
    });

    document.getElementById("ai-copy-open-btn").addEventListener("click", () => {
      const text = document.getElementById("ai-prompt-text").value;
      const providerId = document.getElementById("ai-provider-select").value;
      if (!text) return;
      localStorage.setItem("lfm-last-ai-provider", providerId);
      navigator.clipboard.writeText(text).then(() => {
        const provider = AI_PROVIDERS.find(p => p.id === providerId);
        if (provider) openAIUrl(provider.url(text));
      });
    });

    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById("lfm-modal-close").addEventListener("click", () => overlay.remove());

    document.getElementById("ai-modal-settings-btn").addEventListener("click", () => {
      overlay.remove();
      openSettingsModal("ai");
    });
  }

  function setupKeyboardShortcut() {
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        const menu = document.getElementById("external-music-menu");
        if (menu.classList.contains("visible")) {
          menu.classList.remove("visible");
        } else {
          showPopupWithContext();
        }
      }
      if (e.key === "Escape") {
        const overlay = document.getElementById("lfm-modal-overlay");
        if (overlay) { overlay.remove(); e.preventDefault(); return; }
        const menu = document.getElementById("external-music-menu");
        if (menu?.classList.contains("visible")) {
          menu.classList.remove("visible");
          e.preventDefault();
        }
      }
    });
  }

  function setupNavigationDetection() {
    const navObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        document.getElementById("external-music-menu")?.classList.remove("visible");

        requestAnimationFrame(() => {
          addContextMenu(document);
          addChartlistContextEntries(document);
        });
      }
    });

    navObserver.observe(document.querySelector("title") || document.head, {
      childList: true,
      subtree: true,
    });
  }

  const iconStyle = localStorage.getItem("setting-icon-style") || "bubble";
  document.documentElement.classList.toggle("lfm-icon-style-minimal", iconStyle === "minimal");
  document.documentElement.classList.toggle("lfm-icons-hidden", iconStyle === "hidden");

  if (localStorage.getItem("setting-highlight-eligible") === "true") {
    document.documentElement.classList.add("lfm-highlight-eligible");
  }
  if (localStorage.getItem("setting-light-mode") === "true") {
    document.documentElement.classList.add("lfm-light-mode");
  }

  // Parse individual category Open All button visibility (Default is hidden/false)
  CATEGORY_ORDER.forEach(cat => {
    const isOpenAll = localStorage.getItem("setting-openall-" + cat) === "true";
    const menuLink = document.querySelector(`.open-all-link[data-category="${cat}"]`);
    if (menuLink) {
      menuLink.style.display = isOpenAll ? "block" : "none";
    }
  });

  // Parse individual service hidden states on load sequence
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("setting-svc-hidden-") && localStorage.getItem(key) === "true") {
      const svcId = key.replace("setting-svc-hidden-", "");
      document.querySelector(`.service-row:has(#${svcId})`)?.classList.add("lfm-service-hidden");
    }
  }

  applyTogglePosition();
  setupUI();
  setupKeyboardShortcut();
  setupNavigationDetection();
  addContextMenu(document);
  addChartlistContextEntries(document);

  // Debounced execution to prevent main-thread blocking
  let debounceTimer;
  const observer = new MutationObserver(mutations => {
    let shouldUpdate = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) shouldUpdate = true;
    });

    if (shouldUpdate) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        addContextMenu(document);
        addChartlistContextEntries(document);
      }, 250);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      addContextMenu(document);
      addChartlistContextEntries(document);
    }
  });
})();
