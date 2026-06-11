// ==UserScript==
// @name           Last.fm: Toolbox
// @namespace      https://github.com/deathrashed/lastfm-userscript
// @description    A smart, quick-access popup for Last.fm with Font Awesome icons and 30+ external services.
// @icon           https://cdn.icon-icons.com/icons2/808/PNG/512/lastfm_icon-icons.com_66107.png
// @match          https://www.last.fm/*
// @match          https://www.lastfm.*/*
// @match          https://cn.last.fm/*
// @version        4
// @license        MIT
// @grant          GM_addStyle
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
      --brand-hover: #FF1B20;
      --shadow: rgba(0,0,0,.3);
      --menu-shadow: rgba(0,0,0,.3);
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
    }

    #external-music-button {
      position: fixed;
      bottom: 20px;
      left: 20px;
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
      z-index: 9999;
      transition: background .2s, color .2s;
    }

    #external-music-button:hover {
      background: var(--bg-hover);
      color: var(--brand-hover);
    }

    #external-music-menu {
      position: fixed;
      bottom: 70px;
      left: 20px;
      background: var(--bg-primary);
      border-radius: 8px;
      box-shadow: 0 4px 16px var(--menu-shadow);
      display: none;
      z-index: 9999;
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
    #lfm-scroll-area::-webkit-scrollbar-track { background: #282828; }
    #lfm-scroll-area::-webkit-scrollbar-thumb { background: #666; border-radius: 3px; }
    #lfm-scroll-area::-webkit-scrollbar-thumb:hover { background: #999; }

    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-track { background: #e5e5e5; }
    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb { background: #a0a0a0; }
    .lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb:hover { background: #7a7a7a; }

    #external-music-menu.visible {
      display: block;
      animation: lfmSlideUp .2s ease-out;
    }

    @keyframes lfmSlideUp {
      from { opacity: 0; transform: translateY(10px); }
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

    #external-music-menu a {
      display: block;
      padding: 8px 15px;
      color: var(--text-primary) !important;
      text-decoration: none !important;
      font-size: 13px;
      direction: ltr;
      transition: background .15s;
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
      position: relative;
      width: 38px;
      height: 20px;
      background: var(--toggle-off);
      border-radius: 10px;
      cursor: pointer;
      transition: background .2s;
      flex-shrink: 0;
    }

    .toggle-switch.active { background: var(--toggle-on); }

    .toggle-switch::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      background: var(--text-primary);
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform .2s, background .2s;
    }

    .toggle-switch.active::after {
      transform: translateX(18px);
      background: #fff;
    }

    .hidden-section { display: none !important; }

    #search-input-container {
      padding: 10px 15px;
      display: flex;
      justify-content: center;
      direction: ltr;
    }

    #search-input {
      width: 170px;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 6px 10px;
      color: var(--text-primary);
      font-size: 13px;
      transition: border-color .2s;
    }

    #search-input:focus {
      outline: none;
      border-color: var(--brand);
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
    #lfm-modal-box button {
      background: var(--bg-secondary);
      border: 1px solid var(--input-border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      transition: background .15s;
    }

    #lfm-modal-box select:hover,
    #lfm-modal-box button:hover {
      background: var(--bg-hover);
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

.lfm-hide-hover-icons .lfm-hover-icon,
.lfm-hide-hover-icons .lfm-grid-toolbox-icon {
  display: none !important;
}

.lfm-hide-open-all .open-all-link {
  display: none !important;
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
  transition: transform .15s, background .15s;
}

#lfm-modal-box .btn-primary:hover {
  background: var(--brand-hover) !important;
  transform: scale(1.03);
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

#lfm-menu-header {
  padding: 12px 15px 4px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

#lfm-header-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  line-height: 1.4;
  align-self: flex-start;
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

.settings-modal #lfm-modal-box {
  min-width: 380px;
  max-width: 480px;
}

.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.settings-tab {
  padding: 6px 14px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: background .15s, color .15s;
}

.settings-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.settings-tab.active {
  background: var(--brand);
  color: #fff;
}

.settings-panel {
  min-height: 80px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background .15s;
}

.settings-item:hover {
  background: var(--bg-hover);
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
  padding: 9px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, transform .15s, box-shadow .15s;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.lfm-modal-actions button:hover {
  transform: scale(1.03);
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

.ai-modal #lfm-modal-box {
  width: 720px;
  max-width: 90vw;
  max-height: 85vh;
}

#lfm-scroll-area::-webkit-scrollbar,
.ai-modal #lfm-modal-box::-webkit-scrollbar,
.settings-modal #lfm-modal-box::-webkit-scrollbar,
#settings-custom-list::-webkit-scrollbar {
  width: 6px;
}

#lfm-scroll-area::-webkit-scrollbar-track,
.ai-modal #lfm-modal-box::-webkit-scrollbar-track,
.settings-modal #lfm-modal-box::-webkit-scrollbar-track,
#settings-custom-list::-webkit-scrollbar-track {
  background: #282828;
}

#lfm-scroll-area::-webkit-scrollbar-thumb,
.ai-modal #lfm-modal-box::-webkit-scrollbar-thumb,
.settings-modal #lfm-modal-box::-webkit-scrollbar-thumb,
#settings-custom-list::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

#lfm-scroll-area::-webkit-scrollbar-thumb:hover,
.ai-modal #lfm-modal-box::-webkit-scrollbar-thumb:hover,
.settings-modal #lfm-modal-box::-webkit-scrollbar-thumb:hover,
#settings-custom-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-track,
.lfm-light-mode .ai-modal #lfm-modal-box::-webkit-scrollbar-track,
.lfm-light-mode .settings-modal #lfm-modal-box::-webkit-scrollbar-track,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-track {
  background: #e5e5e5;
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb,
.lfm-light-mode .ai-modal #lfm-modal-box::-webkit-scrollbar-thumb,
.lfm-light-mode .settings-modal #lfm-modal-box::-webkit-scrollbar-thumb,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-thumb {
  background: #a0a0a0;
}

.lfm-light-mode #lfm-scroll-area::-webkit-scrollbar-thumb:hover,
.lfm-light-mode .ai-modal #lfm-modal-box::-webkit-scrollbar-thumb:hover,
.lfm-light-mode .settings-modal #lfm-modal-box::-webkit-scrollbar-thumb:hover,
.lfm-light-mode #settings-custom-list::-webkit-scrollbar-thumb:hover {
  background: #7a7a7a;
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

.service-launch-btn:hover {
  opacity: 1 !important;
  color: var(--brand);
}

.service-launch-btn i,
.service-launch-btn svg {
  pointer-events: none;
}
  `);

  let currentContext = { type: "artist", artist: "", album: "", track: "" };
  let lastUrl = location.href;
  let observerScheduled = false;

  const CATEGORY_ORDER = ["databases", "streaming", "lyrics", "covers", "social", "additional", "ai"];

  const CATEGORY_LABELS = {
    databases: "Databases",
    streaming: "Streaming",
    lyrics: "Lyrics",
    covers: "Covers & Images",
    social: "Social Media",
    additional: "Additional",
    ai: "AI",
  };

  const SERVICE_CATEGORIES = {
    databases: ["google-band-link", "metal-archives-link", "rym-link", "discogs-link", "musicbrainz-link", "wikipedia-link", "album-of-the-year-link"],
    streaming: ["spotify-link", "youtube-link", "youtube-music-link", "apple-music-link", "bandcamp-link", "soundcloud-link", "deezer-link", "tidal-link", "amazon-link", "qobuz-link"],
    lyrics: ["genius-link", "darklyrics-link", "google-lyrics-link", "musixmatch-link"],
    covers: ["cov-musichoarderz-link", "google-images-link", "yahoo-images-link", "bing-images-link"],
    social: ["instagram-link", "facebook-link", "reddit-link"],
    additional: ["allmusic-link", "chosic-link", "spirit-of-metal-link", "metalstorm-link", "fanart-tv-link", "lucida-link", "sputnikmusic-link"],
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
    "youtube-music-link": "YouTube Music",
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
    "google-images-link": "Google Images",
    "yahoo-images-link": "Yahoo Images",
    "bing-images-link": "Bing Images",
    "instagram-link": "Instagram",
    "facebook-link": "Facebook",
    "reddit-link": "Reddit",
    "allmusic-link": "AllMusic",
    "chosic-link": "Chosic",
    "spirit-of-metal-link": "Spirit of Metal",
    "metalstorm-link": "Metal Storm",
    "fanart-tv-link": "Fanart.tv",
    "lucida-link": "Lucida",
    "album-of-the-year-link": "Album of the Year",
    "sputnikmusic-link": "Sputnikmusic",
    "perplexity-link": "Perplexity",
    "chatgpt-link": "ChatGPT",
    "claude-link": "Claude",
    "brave-ai-link": "Brave AI",
    "mistral-link": "Mistral",
    "huggingchat-link": "HuggingChat",
    "you-link": "You.com",
    "grok-link": "Grok",
  };

  function getServiceIcon(id) {
    const icons = {
      "search-link": '<i class="fa-solid fa-icons"></i>',
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
      "tidal-link": '<i class="fa-brands fa-tidal"></i>',
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
      "perplexity-link": '<i class="fa-solid fa-magnifying-glass"></i>',
      "chatgpt-link": '<i class="fa-solid fa-robot"></i>',
      "claude-link": '<i class="fa-solid fa-clover"></i>',
      "brave-ai-link": '<i class="fa-solid fa-shield-halved"></i>',
      "mistral-link": '<i class="fa-solid fa-wind"></i>',
      "huggingchat-link": '<i class="fa-solid fa-face-smile"></i>',
      "you-link": '<i class="fa-solid fa-circle-question"></i>',
      "grok-link": '<i class="fa-brands fa-x-twitter"></i>',
    };

    return icons[id] || '<i class="fa-solid fa-link"></i>';
  }

  const SERVICE_URLS = {
    "search-link": ctx => ctx.artist ? `https://www.google.com/search?udm=50&source=searchlabs&q=${ctx.query}` : "#",
    "listen-link": ctx => ctx.artist ? `https://monochrome.tf/search/${ctx.query}` : "#",
    "google-band-link": ctx => ctx.artist ? `https://www.google.com/search?q=${ctx.query}+${ctx.type}` : "#",
    "metal-archives-link": ctx => ctx.artist ? ctx.album ? `https://www.metal-archives.com/search?type=album_title&searchString=${ctx.encodedAlbum}` : `https://www.metal-archives.com/search?type=band_name&searchString=${ctx.encodedArtist}` : "#",
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
    "amazon-link": ctx => ctx.artist ? `https://music.amazon.com.au/search?k=${ctx.query}` : "#",
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
    "lucida-link": ctx => ctx.artist ? `https://lucida.to/search?query=${ctx.query}&service=qobuz` : "#",
    "album-of-the-year-link": ctx => ctx.artist ? ctx.album ? `https://www.albumoftheyear.org/search/albums/?q=${ctx.encodedAlbum}` : `https://www.albumoftheyear.org/search/?q=${ctx.encodedArtist}` : "#",
    "sputnikmusic-link": ctx => ctx.artist ? `https://www.sputnikmusic.com/search?q=${ctx.query}` : "#",
    "perplexity-link": ctx => ctx.artist ? `https://www.perplexity.ai/search/new?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "chatgpt-link": ctx => ctx.artist ? `https://chatgpt.com/?prompt=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "claude-link": ctx => ctx.artist ? `https://claude.ai/new?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "brave-ai-link": ctx => ctx.artist ? `https://search.brave.com/ask?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "mistral-link": ctx => ctx.artist ? `https://chat.mistral.ai/chat?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "huggingchat-link": ctx => ctx.artist ? `https://huggingface.co/chat/?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "you-link": ctx => ctx.artist ? `https://you.com/search?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
    "grok-link": ctx => ctx.artist ? `https://grok.com?q=${encodeURIComponent(ctx.album ? `give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}` : `give me a comprehensive overview of the band ${ctx.artist}`)}` : "#",
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
    const titleEl = document.getElementById("lfm-header-title");
    const subtitleEl = document.getElementById("lfm-header-subtitle");
    if (badgeEl) {
      const typeKey = ctx.type === "track" ? "track" : ctx.type === "album" ? "album" : "artist";
      const typeLabel = typeKey === "track" ? "Track" : typeKey === "album" ? "Album" : "Artist";
      badgeEl.textContent = typeLabel;
      badgeEl.className = "context-badge context-badge-" + typeKey;
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
        link.id === "open-ai-btn";
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
      setTimeout(() => window.open(url, "_blank"), i * 400);
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

  function openExternalToolWindow(url, name, width = 1000, height = 800) {
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const popup = window.open(url, name,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup || popup.closed) {
      window.open(url, "_blank");
    }
  }

  function openAIUrl(url) {
    if (localStorage.getItem("setting-ai-popup") !== "false") {
      openExternalToolWindow(url, "LastFmToolboxAI");
    } else {
      window.open(url, "_blank");
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
    return localStorage.getItem("musicengine.defaultOpenMode") || "popup";
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
        html += `<button class="service-launch-btn" data-service-id="${id}" title="Open in new tab"><i class="fa-solid fa-plus"></i></button>`;
        html += `</div>`;
      });
      html += `<a href="#" class="open-all-link" data-category="${cat}"><i class="fa-solid fa-forward"></i>Open All</a>`;
      html += `</div><hr></div>`;
    });
    return html;
  }

  function setupUI() {
    const button = document.createElement("div");
    button.id = "external-music-button";
    button.innerHTML = '<i class="fa-brands fa-lastfm"></i>';
    button.title = "Last.fm Toolbox (Ctrl+Shift+E)";

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
        <div id="lfm-menu-header">
          <div id="lfm-header-badge"></div>
          <div id="lfm-header-title"></div>
          <div id="lfm-header-subtitle"></div>
        </div>
        <div id="lfm-quick-actions">
          <a href="#" id="search-link" target="_blank" title="Search"><i class="fa-solid fa-search"></i><span>Search</span></a>
          <a href="#" id="listen-link" target="_blank" title="Listen"><i class="fa-solid fa-headphones"></i><span>Listen</span></a>
          <a href="#" id="open-ai-btn" title="AI Prompt"><i class="fa-solid fa-robot"></i><span>AI</span></a>
        </div>
        ${buildCategoryHTML()}
        <div class="section-block" data-section="custom">
        <p class="menu-section" data-section="custom" aria-expanded="false">
          <span>Manual Search</span>
          <span class="section-chevron">▶</span>
        </p>
        <div class="section-content" data-section="custom">
          <div id="search-input-container">
            <input type="text" id="search-input" placeholder="Artist or Artist - Album">
          </div>
          <p id="search-help">Accepted formats:<br>Artist<br>Artist - Album<br>Artist - Album - Track</p>
        </div></div>
        <div id="lfm-footer">
          <a href="#" id="open-settings-btn" title="Settings"><i class="fa-solid fa-gear"></i></a>
          <a href="#" id="footer-toggle-lights" title="Toggle dark/light mode"><i class="fa-solid fa-moon"></i></a>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

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

    menu.querySelectorAll(".service-link").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const url = this.href;
        if (!url || url === "#" || url === location.href + "#") return;
        menu.classList.remove("visible");
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
        menu.classList.remove("visible");
        window.open(link.href, "_blank", "noopener,noreferrer");
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
    const hoverToggle = document.getElementById("modal-toggle-artist-symbol") || document.getElementById("toggle-artist-symbol");
    if (hoverToggle) {
      if (localStorage.getItem("setting-artist-symbol") === "false") {
        hoverToggle.classList.remove("active");
        hoverToggle.dataset.text = "Show";
        document.documentElement.classList.add("lfm-hide-hover-icons");
      } else {
        hoverToggle.classList.add("active");
        hoverToggle.dataset.text = "Hide";
        document.documentElement.classList.remove("lfm-hide-hover-icons");
      }
      hoverToggle.onclick = function () {
        this.classList.toggle("active");
        const active = this.classList.contains("active");
        localStorage.setItem("setting-artist-symbol", active ? "true" : "false");
        this.dataset.text = active ? "Hide" : "Show";
        document.documentElement.classList.toggle("lfm-hide-hover-icons", !active);
      };
    }
    CATEGORY_ORDER.forEach(cat => {
      const toggle = document.getElementById("modal-toggle-section-" + cat) || document.getElementById("toggle-section-" + cat);
      const block = document.querySelector(`.section-block[data-section="${cat}"]`);
      if (!toggle) return;
      if (localStorage.getItem("setting-section-" + cat) === "true") {
        toggle.classList.add("active");
        toggle.dataset.text = "Show";
        block?.classList.add("hidden-section");
      } else {
        toggle.classList.remove("active");
        toggle.dataset.text = "Hide";
        block?.classList.remove("hidden-section");
      }
      toggle.onclick = function () {
        this.classList.toggle("active");
        const hidden = this.classList.contains("active");
        localStorage.setItem("setting-section-" + cat, hidden ? "true" : "false");
        this.dataset.text = hidden ? "Show" : "Hide";
        block?.classList.toggle("hidden-section", hidden);
      };
    });
    const openAllToggle = document.getElementById("modal-toggle-open-all") || document.getElementById("toggle-open-all");
    if (openAllToggle) {
      if (localStorage.getItem("setting-open-all") === "false") {
        openAllToggle.classList.remove("active");
        openAllToggle.dataset.text = "Show";
        document.querySelectorAll(".open-all-link").forEach(el => el.classList.add("hidden-section"));
      } else {
        openAllToggle.classList.add("active");
        openAllToggle.dataset.text = "Hide";
        document.querySelectorAll(".open-all-link").forEach(el => el.classList.remove("hidden-section"));
      }
      openAllToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-open-all", active ? "true" : "false");
        this.dataset.text = active ? "Hide" : "Show";
        document.documentElement.classList.toggle("lfm-hide-open-all", !active);
        document.querySelectorAll(".open-all-link").forEach(el => {
          el.classList.toggle("hidden-section", !active);
        });
      };
    }
    const lightToggle = document.getElementById("modal-toggle-light-mode") || document.getElementById("toggle-light-mode");
    if (lightToggle) {
      if (localStorage.getItem("setting-light-mode") === "true") {
        lightToggle.classList.add("active");
        lightToggle.dataset.text = "On";
        document.documentElement.classList.add("lfm-light-mode");
      } else {
        lightToggle.classList.remove("active");
        lightToggle.dataset.text = "Off";
        document.documentElement.classList.remove("lfm-light-mode");
      }
      lightToggle.onclick = function () {
        const active = this.classList.toggle("active");
        localStorage.setItem("setting-light-mode", active ? "true" : "false");
        this.dataset.text = active ? "On" : "Off";
        document.documentElement.classList.toggle("lfm-light-mode", active);
      };
    }
    const openModeToggle = document.getElementById("modal-toggle-open-mode");
    if (openModeToggle) {
      const stored = localStorage.getItem("musicengine.defaultOpenMode");
      if (stored === "tab") {
        openModeToggle.classList.remove("active");
        openModeToggle.dataset.text = "Tab";
      } else {
        openModeToggle.classList.add("active");
        openModeToggle.dataset.text = "Popup";
      }
      openModeToggle.onclick = function () {
        const isPopup = this.classList.toggle("active");
        localStorage.setItem("musicengine.defaultOpenMode", isPopup ? "popup" : "tab");
        this.dataset.text = isPopup ? "Popup" : "Tab";
      };
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
          label: "Overview", prompt: ctx => ctx.track
            ? `Give me a comprehensive overview of the song ${ctx.track} by ${ctx.artist}`
            : ctx.album
              ? `Give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}`
              : `Give me a comprehensive overview of the band ${ctx.artist}`
        },
        {
          label: "Summary", prompt: ctx => ctx.track
            ? `Summarize the song ${ctx.track} by ${ctx.artist} in a few paragraphs`
            : ctx.album
              ? `Summarize the album ${ctx.album} by ${ctx.artist} in a few paragraphs`
              : `Summarize the career of ${ctx.artist} in a few paragraphs`
        },
        {
          label: "Background", prompt: ctx => ctx.track
            ? `What is the background and origin of the song ${ctx.track} by ${ctx.artist}?`
            : ctx.album
              ? `What is the background and recording history of the album ${ctx.album} by ${ctx.artist}?`
              : `What is the background and origin story of ${ctx.artist}?`
        },
      ],
    },
    analysis: {
      label: "Analysis",
      items: [
        {
          label: "Themes", prompt: ctx => ctx.track
            ? `What are the key themes and influences in the song ${ctx.track} by ${ctx.artist}?`
            : ctx.album
              ? `What are the key themes and influences in the album ${ctx.album} by ${ctx.artist}?`
              : `What are the key themes and influences in ${ctx.artist}'s music?`
        },
        {
          label: "Lyrics", prompt: ctx => ctx.track
            ? `Analyze the lyrics and themes of ${ctx.track} by ${ctx.artist}`
            : ctx.album
              ? `Analyze the lyrics and themes of ${ctx.album} by ${ctx.artist}`
              : `Analyze the lyrics and themes commonly found in ${ctx.artist}'s music`
        },
        {
          label: "Genre", prompt: ctx => ctx.track
            ? `What genre would you classify ${ctx.track} by ${ctx.artist} as and why?`
            : ctx.album
              ? `What genre would you classify ${ctx.album} by ${ctx.artist} as and why?`
              : `What genre would you classify ${ctx.artist} as and why?`
        },
        {
          label: "Compare", prompt: ctx => ctx.album
            ? `Compare ${ctx.album} by ${ctx.artist} to the artist's previous work`
            : `Compare ${ctx.artist} to similar artists`
        },
      ],
    },
    discovery: {
      label: "Discovery",
      items: [
        {
          label: "Similar", prompt: ctx => ctx.album
            ? `List similar albums to ${ctx.album} by ${ctx.artist}`
            : `List similar artists and albums for fans of ${ctx.artist}`
        },
        {
          label: "Hidden Gems", prompt: ctx => ctx.album
            ? `What are some hidden gems or deep cuts similar to ${ctx.album} by ${ctx.artist}?`
            : `What are some hidden gems or lesser-known tracks by ${ctx.artist}?`
        },
        { label: "Recommendations", prompt: ctx => `If I like ${ctx.artist}${ctx.album ? `'s album ${ctx.album}` : ""}, what else would I enjoy?` },
      ],
    },
    historical: {
      label: "Historical",
      items: [
        {
          label: "Context", prompt: ctx => ctx.album
            ? `What is the historical context of ${ctx.album} by ${ctx.artist}?`
            : `What is the historical context of ${ctx.artist}?`
        },
        {
          label: "Reception", prompt: ctx => ctx.album
            ? `How was ${ctx.album} by ${ctx.artist} received at release and how has its legacy evolved?`
            : `How has ${ctx.artist}'s sound evolved over their career?`
        },
        {
          label: "Legacy", prompt: ctx => ctx.track
            ? `What is the legacy and cultural impact of ${ctx.track} by ${ctx.artist}?`
            : ctx.album
              ? `What is the lasting legacy of ${ctx.album} by ${ctx.artist}?`
              : `What is the legacy and influence of ${ctx.artist} on music?`
        },
      ],
    },
    technical: {
      label: "Technical",
      items: [
        {
          label: "Production", prompt: ctx => ctx.album
            ? `Describe the production, recording, and sound engineering of ${ctx.album} by ${ctx.artist}`
            : `Describe the production style and recording approach of ${ctx.artist}`
        },
        {
          label: "Personnel", prompt: ctx => ctx.album
            ? `Who were the musicians, producers, and engineers on ${ctx.album} by ${ctx.artist}?`
            : `Who are the key members, collaborators, and producers associated with ${ctx.artist}?`
        },
        {
          label: "Songwriting", prompt: ctx => ctx.track
            ? `Analyze the songwriting, structure, and composition of ${ctx.track} by ${ctx.artist}`
            : ctx.album
              ? `Analyze the songwriting and composition across ${ctx.album} by ${ctx.artist}`
              : `Describe the songwriting style and creative process of ${ctx.artist}`
        },
      ],
    },
  };

  const AI_PRESETS = Object.values(AI_CATEGORIES).flatMap(c => c.items.map(item => item.prompt));

  function openSettingsModal() {
    const existing = document.getElementById("lfm-modal-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "lfm-modal-overlay";

    const tabs = [
      { id: "general", label: "General", icon: "fa-sliders" },
      { id: "sections", label: "Sections", icon: "fa-layer-group" },
      { id: "ai", label: "AI", icon: "fa-robot" },
      { id: "custom", label: "Custom", icon: "fa-link" },
      { id: "advanced", label: "Advanced", icon: "fa-screwdriver-wrench" },
    ];

    const customServicesHtml = getCustomServices().map((svc, i) =>
      `<div class="settings-item">
        <div class="settings-info">
          <span class="settings-label">${escHtml(svc.label)}</span>
          <span class="settings-desc">${escHtml(svc.urlTemplate)}</span>
        </div>
        <button class="settings-remove-btn" data-index="${i}"><i class="fa-solid fa-xmark"></i></button>
      </div>`
    ).join("") || '<p class="settings-section-title" style="padding:10px 12px;margin:0;">No custom services added yet.</p>';

    overlay.innerHTML = `
      <div id="lfm-modal-box" class="settings-modal">
        <span id="lfm-modal-close"><i class="fa-solid fa-xmark"></i></span>
        <h2><i class="fa-solid fa-gear"></i> Settings</h2>

        <div class="settings-tabs">
          ${tabs.map(t => `<button class="settings-tab${t.id === "general" ? " active" : ""}" data-tab="${t.id}"><i class="fa-solid ${t.icon}"></i> ${t.label}</button>`).join("")}
        </div>

        <div class="settings-panel" data-panel="general">
          <div class="settings-group">
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Hover &amp; Grid Icons</span>
                <span class="settings-desc">Shows the small Last.fm toolbox icon beside artist links and image cards.</span>
              </div>
              <div id="modal-toggle-artist-symbol" class="toggle-switch active" data-text="Hide"></div>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Open All Links</span>
                <span class="settings-desc">Shows or hides the Open All option inside categories.</span>
              </div>
              <div id="modal-toggle-open-all" class="toggle-switch active" data-text="Hide"></div>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Light Mode</span>
                <span class="settings-desc">Use a brighter interface designed for daytime browsing.</span>
              </div>
              <div id="modal-toggle-light-mode" class="toggle-switch" data-text="Off"></div>
            </div>
            <div class="settings-item">
              <div class="settings-info">
                <span class="settings-label">Default Open Mode</span>
                <span class="settings-desc">Popup opens services in a centered window; New Tab opens in a regular browser tab.</span>
              </div>
              <div id="modal-toggle-open-mode" class="toggle-switch active" data-text="Popup"></div>
            </div>
          </div>
        </div>

        <div class="settings-panel" data-panel="sections" style="display:none">
          <p class="settings-section-title">Show or hide entire categories from the toolbox menu.</p>
          ${CATEGORY_ORDER.map(cat => `<div class="settings-item">
            <div class="settings-info">
              <span class="settings-label">${CATEGORY_LABELS[cat]}</span>
              <span class="settings-desc">${cat === "databases" ? "Google, Metal Archives, RateYourMusic, Discogs, MusicBrainz, Wikipedia, Album of the Year" : cat === "streaming" ? "Spotify, YouTube, Apple Music, Bandcamp, SoundCloud, Deezer, Tidal, Qobuz, Amazon" : cat === "lyrics" ? "Genius, DarkLyrics, Musixmatch" : cat === "covers" ? "MusicHoarders, Google Images, Yahoo Images, Bing Images" : cat === "social" ? "Instagram, Facebook, Reddit" : cat === "additional" ? "AllMusic, Chosic, Spirit of Metal, Metal Storm, Fanart.tv, Lucida, Sputnikmusic" : "Perplexity, ChatGPT, Claude, Brave AI, Mistral, HuggingChat, You.com, Grok"}</span>
            </div>
            <div id="modal-toggle-section-${cat}" class="toggle-switch" data-text="Hide"></div>
          </div>`).join("")}
        </div>

        <div class="settings-panel" data-panel="ai" style="display:none">
          <div class="settings-item">
            <div class="settings-info">
              <span class="settings-label">AI Open Mode</span>
              <span class="settings-desc">Opens AI providers in a centered popup window instead of a new browser tab.</span>
            </div>
            <div id="modal-toggle-ai-popup" class="toggle-switch active" data-text="Popup"></div>
          </div>
        </div>

        <div class="settings-panel" data-panel="custom" style="display:none">
          <div id="settings-custom-list">
            ${customServicesHtml}
          </div>
          <div class="settings-custom-form">
            <input type="text" id="settings-custom-label" placeholder="Label">
            <input type="text" id="settings-custom-url" placeholder="URL with {artist} {album} {track}">
            <button id="settings-custom-add"><i class="fa-solid fa-plus"></i> Add</button>
          </div>
        </div>

        <div class="settings-panel" data-panel="advanced" style="display:none">
          <p class="settings-section-title">Advanced settings and integrations — coming soon.</p>
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
        if (panel) panel.style.display = "block";
      });
    });

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
  }

  function openAIModal() {
    const existing = document.getElementById("lfm-modal-overlay");
    if (existing) existing.remove();

    const ctx = buildContext(currentContext);
    const defaultPrompt = ctx.track
      ? `Give me a comprehensive overview of the song ${ctx.track} by ${ctx.artist}`
      : ctx.album
        ? `Give me a comprehensive overview of the album ${ctx.album} by ${ctx.artist}`
        : ctx.artist
          ? `Give me a comprehensive overview of the band ${ctx.artist}`
          : "";

    const lastProvider = localStorage.getItem("lfm-last-ai-provider") || "chatgpt-link";

    const overlay = document.createElement("div");
    overlay.id = "lfm-modal-overlay";

    const contextIcon = ctx.track ? "fa-music" : ctx.album ? "fa-compact-disc" : ctx.artist ? "fa-user" : "fa-circle-question";
    const contextType = ctx.track ? "Track" : ctx.album ? "Album" : ctx.artist ? "Artist" : "None";
    const contextName = ctx.track ? `${ctx.track} — ${ctx.artist}` : ctx.album ? `${ctx.album} — ${ctx.artist}` : ctx.artist || "";

    const catOptions = Object.entries(AI_CATEGORIES).map(([key, cat]) =>
      `<option value="${key}">${cat.label}</option>`
    ).join("");

    overlay.innerHTML = `
      <div id="lfm-modal-box" class="ai-modal">
        <div class="modal-header">
          <span class="modal-header-icon"><i class="fa-solid fa-robot"></i></span>
          <span class="modal-header-title">AI Prompt</span>
          <span id="lfm-modal-close" class="modal-header-close"><i class="fa-solid fa-xmark"></i></span>
        </div>

        <div id="ai-context-display">
          <span class="ai-context-icon"><i class="fa-solid ${contextIcon}"></i></span>
          <span class="ai-context-type">${contextType}</span>
          <span class="ai-context-name">${escHtml(contextName)}</span>
        </div>

        <hr class="modal-hr">

        <div class="ai-dropdown-row">
          <div class="ai-field">
            <label for="ai-category-select">Category</label>
            <select id="ai-category-select">${catOptions}</select>
          </div>
          <div class="ai-field">
            <label for="ai-preset-select">Prompt</label>
            <select id="ai-preset-select"></select>
          </div>
        </div>

        <hr class="modal-hr">

        <textarea id="ai-prompt-text" placeholder="Write your prompt here..." rows="4">${escHtml(defaultPrompt)}</textarea>

        <hr class="modal-hr">

        <div class="ai-provider-row">
          <label for="ai-provider-select">Provider</label>
          <select id="ai-provider-select">
            ${AI_PROVIDERS.map(p => `<option value="${p.id}"${p.id === lastProvider ? " selected" : ""}>${p.label}</option>`).join("")}
          </select>
        </div>

        <div class="lfm-modal-actions">
          <button id="ai-copy-btn"><i class="fa-solid fa-copy"></i> Copy</button>
          <button id="ai-open-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open</button>
          <button id="ai-copy-open-btn" class="btn-primary"><i class="fa-solid fa-copy"></i> Copy &amp; Open</button>
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
        const full = item.prompt(ctx);
        return `<option value="${i}" data-prompt="${escHtml(full)}">${item.label}</option>`;
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
      if (provider) openAIUrl(provider.url(text));
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

  if (localStorage.getItem("setting-light-mode") === "true") {
    document.documentElement.classList.add("lfm-light-mode");
  }
  if (localStorage.getItem("setting-open-all") === "false") {
    document.documentElement.classList.add("lfm-hide-open-all");
  }

  setupUI();
  setupKeyboardShortcut();
  setupNavigationDetection();
  addContextMenu(document);
  addChartlistContextEntries(document);

  const observer = new MutationObserver(mutations => {
    const nodes = [];

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) nodes.push(node);
      });
    });

    if (observerScheduled) return;
    observerScheduled = true;

    requestAnimationFrame(() => {
      observerScheduled = false;

      nodes.forEach(node => {
        addContextMenu(node);
        addChartlistContextEntries(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    addContextMenu(document);
    addChartlistContextEntries(document);
  }, 2000);

  setInterval(() => {
    addContextMenu(document);
  }, 3000);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      addContextMenu(document);
      addChartlistContextEntries(document);
    }
  });
})();
