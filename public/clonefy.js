(function () {
  // ----- Config: mapping van language codes naar naam + vlag -----
  const languageData = {
    NL: { name: "Nederlands", countryCode: "nl" },
    EN: { name: "English", countryCode: "gb" },
    FR: { name: "Français", countryCode: "fr" },
    DE: { name: "Deutsch", countryCode: "de" },
    ES: { name: "Español", countryCode: "es" },
    IT: { name: "Italiano", countryCode: "it" },
    PL: { name: "Polski", countryCode: "pl" },
    TR: { name: "Türkçe", countryCode: "tr" },
    AR: { name: "العربية", countryCode: "sa" },
    ZH: { name: "中文", countryCode: "cn" },
    MA: { name: "الدارجة", countryCode: "ma" },
  };

  // Kleine helper: tijd formatteren
  function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) seconds = 0;
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return m + ":" + s;
  }

  // HTML-template voor de player. Dit wordt in de container gezet.
  function buildPlayerHTML() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        :root{ --vp-radius: 12px; }
        .vp-host { font-family:'Poppins',sans-serif; }

        .video-player-container {
          position:relative; overflow:hidden; border-radius:var(--vp-radius);
          background:#000; isolation:isolate;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          aspect-ratio: 16/9; width: 100%;
        }
        video { display:block; width:100%; height:100%; object-fit:cover; cursor: pointer; }

        .hidden { display: none !important; }

        .controls-container {
          position:absolute; left:0; right:0; bottom:0;
          display:flex; align-items:center;
          height: 48px;
          padding: 0 12px;
          color:#000; z-index:30; transition: opacity 0.5s ease-in-out;
          gap: 8px;
        }
        .controls-hidden { opacity:0; pointer-events:none; }

        .controls-container::before {
          content:""; position:absolute; left:0; right:0; bottom:0; top:-2px;
          background:#fff; z-index:0; pointer-events:none;
        }
        .controls-container > * { position:relative; z-index:1; }

        .control-btn {
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          height: 32px; width: 32px;
          padding: 0;
          border-radius: 4px;
          transition: background-color 0.2s;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .control-btn:hover { background-color: rgba(0,0,0,0.05); }

        .control-btn svg { width:20px; height:20px; stroke: #000; stroke-width: 1.8; display: block; }

        .timecode {
          font-size:.8rem; font-weight:500;
          display:flex; align-items:center;
          height: 32px;
          white-space:nowrap; cursor:pointer; color: #000;
          margin-left: 4px;
        }

        .progress-bar-container {
          flex-grow:1; height:4px;
          margin:0 12px;
          background:#e5e7eb; border-radius:9999px; overflow:hidden; cursor: pointer;
        }
        .progress-bar-fill { height:100%; width:0%; background:#000; border-radius:9999px; }

        .language-selector { position:relative; display:flex; align-items:center; height: 32px; }

        .language-btn {
          width: auto;
          padding: 0 8px;
          min-width: unset;
          gap: 6px;
          font-weight:600; font-size: 13px;
        }
        .language-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

        .language-dropdown {
          position:absolute; bottom: calc(100% + 8px); right:-8px; z-index: 60;
          background:#fff; border-radius:.35rem;
          box-shadow:0 4px 12px -2px rgba(0,0,0,.15);
          list-style:none; padding: .3rem 0; margin:0;
          min-width: 180px;
          max-height: 150px;
          overflow-y: auto;
          visibility:hidden; opacity:0; transition:opacity .15s, visibility .15s, transform .15s;
          transform: translateY(6px);
        }
        .language-dropdown.active { visibility:visible; opacity:1; transform: translateY(0); }

        .language-dropdown li {
          display: flex; align-items: center;
          padding: 0.35rem 0.8rem;
          min-height: 32px;
          border-radius: 0; cursor: pointer; color: #000;
          font-size: 0.85rem; font-weight: 500;
        }
        .language-dropdown li:hover { background: rgba(0, 0, 0, .04); }
        .language-dropdown li.active-lang { background: rgba(0, 0, 0, .08); cursor: default; }

        .language-dropdown .flag { display: flex; align-items: center; justify-content: center; margin-right: 0.8rem; }
        .language-dropdown .flag img {
          width: 26px; height: auto; border-radius: 3px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .overlay-indicator { position:absolute; inset:0; pointer-events:none; z-index:25; }
        .overlay-badge {
          position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);
          width: 46px; height: 46px; border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.7); background: rgba(0,0,0,0.12);
          display:grid; place-items:center; opacity:0; transition: opacity 220ms ease-in-out;
        }
        .overlay-badge svg { stroke: #fff; width: 28px; height: 28px; }
        .overlay-badge.show { opacity:0.95; }

        @media (max-width: 600px) {
          .controls-container { height: 36px; padding: 0 8px; gap: 4px; }
          .control-btn { height: 26px; width: 26px; }
          .control-btn svg { width: 16px; height: 16px; }
          .timecode { font-size: 10px; margin-left: 2px; height: 26px; }
          .progress-bar-container { margin: 0 6px; height: 3px; }
          .language-selector { height: 26px; }
          .language-btn { font-size: 10px; padding: 0 4px; gap: 3px; }
          .language-btn svg { width: 14px; height: 14px; }
          .language-dropdown {
            right: 0;
            min-width: 140px;
            bottom: calc(100% + 4px);
            max-height: 130px;
          }
          .language-dropdown li {
            font-size: 11px;
            padding: 0.25rem 0.5rem;
            min-height: 28px;
          }
          .language-dropdown .flag img {
            width: 20px; margin-right: 0.5rem;
          }
          .overlay-badge { width: 36px; height: 36px; }
          .overlay-badge svg { width: 20px; height: 20px; }
        }
      </style>

      <div id="video-player" class="video-player-container vp-host">
        <video id="main-video" preload="auto" playsinline webkit-playsinline tabindex="-1"></video>

        <div class="overlay-indicator" aria-hidden="true">
          <div id="overlay-play" class="overlay-badge">
            <svg viewBox="0 0 24 24" stroke-width="1.8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.9 4.5C6.5 4.3 6 4.6 6 5.1V18.9C6 19.4 6.5 19.7 6.9 19.5L18.6 12.5C19 12.3 19 11.7 18.6 11.5L6.9 4.5Z" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div id="overlay-pause" class="overlay-badge">
            <svg viewBox="0 0 24 24" stroke-width="1.8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18.4V5.6C6 5.3 6.3 5 6.6 5H9.4C9.7 5 10 5.3 10 5.6V18.4C10 18.7 9.7 19 9.4 19H6.6C6.3 19 6 18.7 6 18.4Z" stroke="#ffffff"/>
              <path d="M14 18.4V5.6C14 5.3 14.3 5 14.6 5H17.4C17.7 5 18 5.3 18 5.6V18.4C18 18.7 17.7 19 17.4 19H14.6C14.3 19 14 18.7 14 18.4Z" stroke="#ffffff"/>
            </svg>
          </div>
        </div>

        <div id="controls-container" class="controls-container">
          <button type="button" id="play-pause-btn" class="control-btn">
            <span id="play-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.9 4.5C6.5 4.3 6 4.6 6 5.1V18.9C6 19.4 6.5 19.7 6.9 19.5L18.6 12.5C19 12.3 19 11.7 18.6 11.5L6.9 4.5Z" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span id="pause-icon" style="display:none">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18.4V5.6C6 5.3 6.3 5 6.6 5H9.4C9.7 5 10 5.3 10 5.6V18.4C10 18.7 9.7 19 9.4 19H6.6C6.3 19 6 18.7 6 18.4Z" stroke="#000" stroke-width="1.8"/>
                <path d="M14 18.4V5.6C14 5.3 14.3 5 14.6 5H17.4C17.7 5 18 5.3 18 5.6V18.4C18 18.7 17.7 19 17.4 19H14.6C14.3 19 14 18.7 14 18.4Z" stroke="#000" stroke-width="1.8"/>
              </svg>
            </span>
          </button>

          <div id="timecode" class="timecode">
            <span id="current-time">00:00</span> / <span id="total-time">00:00</span>
          </div>

          <div class="progress-bar-container">
            <div id="progress-bar-fill" class="progress-bar-fill"></div>
          </div>

          <button type="button" id="volume-btn" class="control-btn">
            <span id="volume-high-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </span>
            <span id="volume-mute-icon" class="hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </span>
          </button>

          <div class="language-selector">
            <button type="button" id="language-btn" class="control-btn language-btn">
              <svg viewBox="0 0 24 24" stroke-width="1.8" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 8.51724H12M17 8.51724H15.2143M12 8.51724H15.2143M12 8.51724V7M15.2143 8.51724C14.6282 10.5922 13.4009 12.5536 12 14.2773M8.42857 18C9.561 16.9691 10.84 15.7047 12 14.2773M12 14.2773C11.2857 13.4483 10.2857 12.1069 10 11.5M12 14.2773L14.1429 16.4828" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span id="current-lang-code">NL</span>
            </button>
            <ul id="language-dropdown" class="language-dropdown"></ul>
          </div>

          <button type="button" id="fullscreen-btn" class="control-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  // Koppelt alle events etc. container = div met de HTML hierboven erin.
  function setupPlayer(container, config) {
    const playerContainer = container.querySelector("#video-player");
    const video = container.querySelector("#main-video");
    const controlsContainer = container.querySelector("#controls-container");
    const playPauseBtn = container.querySelector("#play-pause-btn");
    const playIcon = container.querySelector("#play-icon");
    const pauseIcon = container.querySelector("#pause-icon");
    const currentTimeEl = container.querySelector("#current-time");
    const totalTimeEl = container.querySelector("#total-time");
    const progressBarContainer = container.querySelector(".progress-bar-container");
    const progressBarFill = container.querySelector("#progress-bar-fill");
    const volumeBtn = container.querySelector("#volume-btn");
    const volumeHighIcon = container.querySelector("#volume-high-icon");
    const volumeMuteIcon = container.querySelector("#volume-mute-icon");
    const languageBtn = container.querySelector("#language-btn");
    const currentLangCodeEl = container.querySelector("#current-lang-code");
    const languageDropdown = container.querySelector("#language-dropdown");
    const fullscreenBtn = container.querySelector("#fullscreen-btn");
    const overlayPlay = container.querySelector("#overlay-play");
    const overlayPause = container.querySelector("#overlay-pause");

    const videoSources = {};
    (config.videos || []).forEach((v) => {
      videoSources[v.code] = v.url;
    });

    let currentLang = config.defaultLanguage || Object.keys(videoSources)[0] || "NL";
    let controlsTimeout;
    let dropdownOpen = false;

    function updateVolumeIcon() {
      if (video.muted) {
        volumeHighIcon.classList.add("hidden");
        volumeMuteIcon.classList.remove("hidden");
      } else {
        volumeHighIcon.classList.remove("hidden");
        volumeMuteIcon.classList.add("hidden");
      }
    }

    function buildLanguageDropdown() {
      languageDropdown.innerHTML = "";
      Object.keys(videoSources).forEach((code) => {
        const meta = languageData[code] || { name: code, countryCode: "nl" };
        const flagUrl = "https://flagcdn.com/w40/" + meta.countryCode + ".png";
        const li = document.createElement("li");
        if (code === currentLang) {
          li.classList.add("active-lang");
        } else {
          li.onclick = () => switchLanguage(code);
        }
        li.innerHTML =
          '<span class="flag"><img src="' +
          flagUrl +
          '"></span><span>' +
          meta.name +
          "</span>";
        languageDropdown.appendChild(li);
      });
    }

    function switchLanguage(code) {
      if (!videoSources[code] || code === currentLang) return;
      currentLang = code;
      video.src = videoSources[currentLang];
      video.currentTime = 0;
      currentLangCodeEl.textContent = currentLang;
      buildLanguageDropdown();
      closeDropdown();
      video.load();
      video.addEventListener(
        "canplay",
        () => {
          video.play().catch(() => {});
        },
        { once: true }
      );
    }

    function showControls() {
      controlsContainer.classList.remove("controls-hidden");
      clearTimeout(controlsTimeout);
      if (!video.paused && !dropdownOpen) {
        controlsTimeout = setTimeout(() => {
          controlsContainer.classList.add("controls-hidden");
        }, 1000);
      }
    }

    function togglePlay() {
      if (video.paused) {
        video.play().catch(() => {});
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
        overlayPlay.classList.remove("show");
        overlayPause.classList.add("show");
        setTimeout(() => overlayPause.classList.remove("show"), 300);
      } else {
        video.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
        overlayPlay.classList.add("show");
      }
      showControls();
    }

    function openDropdown() {
      languageDropdown.classList.add("active");
      dropdownOpen = true;
    }

    function closeDropdown() {
      languageDropdown.classList.remove("active");
      dropdownOpen = false;
      showControls();
    }

    // Events
    playPauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
    video.addEventListener("click", togglePlay);

    volumeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateVolumeIcon();
    });

    video.addEventListener("timeupdate", () => {
      currentTimeEl.textContent = formatTime(video.currentTime);
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBarFill.style.width = pct + "%";
      }
    });

    video.addEventListener("loadedmetadata", () => {
      totalTimeEl.textContent = formatTime(video.duration);
    });

    video.addEventListener("play", showControls);
    video.addEventListener("pause", showControls);

    progressBarContainer.addEventListener("click", (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      video.currentTime = pct * video.duration;
    });

    languageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdownOpen) openDropdown();
      else openDropdown();
      if (dropdownOpen) closeDropdown();
    });

    languageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    fullscreenBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen().catch(() => {
            if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
          });
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    });

    playerContainer.addEventListener("mousemove", showControls);
    playerContainer.addEventListener("touchstart", showControls);

    // Init
    if (videoSources[currentLang]) {
      video.src = videoSources[currentLang];
    } else {
      const first = Object.keys(videoSources)[0];
      if (first) {
        currentLang = first;
        video.src = videoSources[first];
      }
    }
    currentLangCodeEl.textContent = currentLang;
    buildLanguageDropdown();
    updateVolumeIcon();
    video.load();
  }

  // Eén embed init
  async function initContainer(container, embedId) {
    if (!embedId) return;

    container.innerHTML = "Loading embed...";

    try {
      const res = await fetch("/api/embed/" + encodeURIComponent(embedId));
      if (!res.ok) throw new Error("config not found");
      const config = await res.json();

      container.innerHTML = buildPlayerHTML();
      setupPlayer(container, config);
    } catch (e) {
      console.error("Clonefy embed error", e);
      container.innerHTML = "<div style='color:red;font-family:sans-serif;font-size:14px;'>Kon embed niet laden.</div>";
    }
  }

  // Automatische init op DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    const nodes = document.querySelectorAll("[data-embed-id]");
    nodes.forEach((node) => {
      const embedId = node.getAttribute("data-embed-id");
      initContainer(node, embedId);
    });
  });

  // Optionele globale functie, als je ooit handmatig wilt initialiseren
  window.initClonefyEmbed = function (options) {
    const embedId = options.embedId;
    const elementId = options.elementId || "clonefy-player";
    const container = document.getElementById(elementId);
    if (!container) {
      console.error("Clonefy: container niet gevonden:", elementId);
      return;
    }
    initContainer(container, embedId);
  };
})();
