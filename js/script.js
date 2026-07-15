/* =========================================================
   MONTHSARY — script.js
   Handles: flash/splash screen loader, scroll-reveal animations,
   smooth scroll to letter, and the memories lightbox.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     0b) NORMAL PAGE SCROLLING ENABLED
     Full page scroll is now enabled for smooth navigation
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     1) SPLASH SCREEN
     Simulated progress bar + minimum display time so the
     flower-spin animation is always visible, then fades out
     into the main content.
     --------------------------------------------------------- */
  const splash = document.getElementById('splash-screen');
  const progressBar = document.getElementById('splashProgressBar');
  const mainContent = document.getElementById('main-content');

  const MIN_DISPLAY_MS = 2600; // minimum time splash stays visible
  const startTime = Date.now();
  let progress = 0;

  const progressInterval = setInterval(() => {
    // ease progress up to ~92%, final jump happens on finish()
    progress += Math.random() * 10;
    if (progress > 92) progress = 92;
    progressBar.style.width = progress + '%';
  }, 180);

  function finishSplash() {
    clearInterval(progressInterval);
    progressBar.style.width = '100%';

    setTimeout(() => {
      splash.classList.add('fade-out');
      document.body.style.overflow = '';
      mainContent.classList.add('visible');

      // kick off reveal animations once main content is shown
      initScrollReveal();

      // remove splash from DOM after transition completes
      setTimeout(() => splash.remove(), 900);
    }, 250);
  }

  // lock scroll while splash is showing
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);
    setTimeout(finishSplash, remaining);
  });

  // safety net: if 'load' never fires (e.g. slow assets), force-finish
  setTimeout(finishSplash, 6000);

  /* ---------------------------------------------------------
     2) "Open My Letter" button — smooth scroll to letter section
     --------------------------------------------------------- */
  const openLetterBtn = document.getElementById('openLetterBtn');
  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      const target = document.getElementById('letter');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------------------------------------------------
     2a) GLOBAL AUDIO TRAFFIC CONTROL
     Only one song (letter song OR vinyl song) is ever allowed
     to play at the same time. Whenever one starts, every other
     registered track gets paused automatically.
     --------------------------------------------------------- */
  const allAudioTracks = [];

  function registerAudioTrack(audioEl) {
    if (!audioEl || allAudioTracks.includes(audioEl)) return;
    allAudioTracks.push(audioEl);

    // whenever this track starts playing, pause every other track
    audioEl.addEventListener('play', () => {
      allAudioTracks.forEach(other => {
        if (other !== audioEl && !other.paused) {
          other.pause();
        }
      });
    });
  }

  /* ---------------------------------------------------------
     2b) Mail letter open/close + next-page arrow
     --------------------------------------------------------- */
  const mailEnvelope = document.getElementById('mailEnvelope');
  const mailOpenBtn = document.getElementById('mailOpenBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const letterSong = new Audio('./audio/MyVoice/my_voice.mp3');
  letterSong.preload = 'auto';
  registerAudioTrack(letterSong);

  if (mailEnvelope && mailOpenBtn) {
    const label = mailOpenBtn.querySelector('.mail-open-label');
    let isMailOpen = false;

    mailOpenBtn.addEventListener('click', () => {
      isMailOpen = !isMailOpen;
      mailEnvelope.classList.toggle('is-open', isMailOpen);
      mailOpenBtn.setAttribute('aria-expanded', String(isMailOpen));
      if (label) label.textContent = isMailOpen ? 'Close the letter' : 'Open my letter';

      if (letterSong) {
        if (isMailOpen) {
          letterSong.currentTime = 0;
          letterSong.play().catch(() => {});
        } else {
          letterSong.pause();
        }
      }
    });

    // when the letter song finishes on its own, it's already paused
    // (audio elements stop automatically at the end since there's no
    // loop attribute) — this just keeps the label in sync.
    letterSong.addEventListener('ended', () => {
      isMailOpen = false;
      mailEnvelope.classList.remove('is-open');
      mailOpenBtn.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = 'Open my letter';
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const target = document.getElementById('song');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const toMemoriesBtn = document.getElementById('toMemoriesBtn');
  if (toMemoriesBtn) {
    toMemoriesBtn.addEventListener('click', () => {
      const target = document.getElementById('videos');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const toPicturesBtn = document.getElementById('toPicturesBtn');
  if (toPicturesBtn) {
    toPicturesBtn.addEventListener('click', () => {
      const target = document.getElementById('memories');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------------------------------------------------
     2d) BACK TO TOP BUTTON — jumps back to the hero section.
     Shows itself once the person has scrolled past the hero.
     --------------------------------------------------------- */
  const backToTopBtn = document.getElementById('backToTopBtn');
  const heroSection = document.getElementById('hero');

  if (backToTopBtn && heroSection) {
    backToTopBtn.addEventListener('click', () => {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      const shouldShow = heroBottom < 0;
      backToTopBtn.style.display = shouldShow ? 'flex' : 'none';
    });
  }

  /* ---------------------------------------------------------
     2c) OUR SONG — vinyl player (play/pause + song switching)
     Replace the "src" paths below with your own audio files,
     and the "art" paths with your own cover images.
     --------------------------------------------------------- */
  const songs = [
    {
      title: 'Lifetime',
      artist: 'Ben&Ben',
      art: './images/song/lifetime.jfif',
      src: './audio/song/lifetime-benandben.mp3'
    },
    {
      title: 'Kabisado',
      artist: '4th of Spades',
      art: './images/song/kabisado.jfif',
      src: './audio/song/kabisado-4thofspades.mp3'
    }
  ];

  const vinylDisc = document.getElementById('vinylDisc');
  const vinylArt = document.getElementById('vinylArt');
  const vinylPlayBtn = document.getElementById('vinylPlayBtn');
  const songAudio = document.getElementById('songAudio');
  const songTitleEl = document.getElementById('songTitle');
  const songArtistEl = document.getElementById('songArtist');
  const songTabs = document.querySelectorAll('.song-tab');

  if (songAudio) registerAudioTrack(songAudio);

  let currentSongIndex = 0;

  function loadSong(index, { autoplay = false } = {}) {
    const song = songs[index];
    if (!song || !songAudio) return;

    currentSongIndex = index;
    songAudio.pause();
    songAudio.currentTime = 0;
    songAudio.src = song.src;

    if (vinylArt) vinylArt.src = song.art;
    if (songTitleEl) songTitleEl.textContent = song.title;
    if (songArtistEl) songArtistEl.textContent = song.artist;

    songTabs.forEach(tab => {
      tab.classList.toggle('active', Number(tab.dataset.index) === index);
    });

    setPlayingState(false);

    if (autoplay) {
      songAudio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(false));
    }
  }

  function setPlayingState(isPlaying) {
    if (vinylDisc) vinylDisc.classList.toggle('playing', isPlaying);
    if (vinylPlayBtn) {
      vinylPlayBtn.classList.toggle('is-playing', isPlaying);
      vinylPlayBtn.setAttribute('aria-label', isPlaying ? 'Pause song' : 'Play song');
    }
  }

  if (vinylPlayBtn && songAudio) {
    vinylPlayBtn.addEventListener('click', () => {
      if (songAudio.paused) {
        songAudio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(false));
      } else {
        songAudio.pause();
        setPlayingState(false);
      }
    });

    // covers both manual pause AND the automatic pause that fires
    // right when the track finishes (ended -> pause), so the vinyl
    // always stops spinning and the icon resets when a song is done.
    songAudio.addEventListener('ended', () => setPlayingState(false));
    songAudio.addEventListener('pause', () => setPlayingState(false));
    songAudio.addEventListener('play', () => setPlayingState(true));
  }

  songTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const index = Number(tab.dataset.index);
      if (index === currentSongIndex) return;
      loadSong(index, { autoplay: !songAudio.paused || vinylPlayBtn?.classList.contains('is-playing') });
    });
  });

  // set initial song info without forcing autoplay (browsers block it anyway)
  if (songAudio) loadSong(0, { autoplay: false });

  /* ---------------------------------------------------------
     3) SCROLL REVEAL — fade + rise elements into view
     --------------------------------------------------------- */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------------------------------------------------------
     4) MEMORIES LIGHTBOX
     --------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const videoCards = document.querySelectorAll('.video-card');

  function openLightbox(src, alt) {
    lightboxContent.innerHTML = `<img src="${src}" alt="${alt || 'Memory photo'}" class="lightbox-image">`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function openVideoLightbox(title, src, poster) {
    if (src) {
      const posterAttr = poster ? `poster="${poster}"` : '';
      lightboxContent.innerHTML = `
        <div class="lightbox-video">
          <video src="${src}" ${posterAttr} controls autoplay playsinline style="max-width:100%; max-height:80vh; border-radius:12px; background:#000;"></video>
          <p class="video-title">${title || 'Video'}</p>
        </div>
      `;

      // stop any playing song right away, then also register the video
      // so it plays nicely with the traffic-control system going forward
      allAudioTracks.forEach(track => { if (!track.paused) track.pause(); });
      const videoEl = lightboxContent.querySelector('video');
      if (videoEl) registerAudioTrack(videoEl);
    } else {
      lightboxContent.innerHTML = `
        <div class="lightbox-video">
          <div class="video-placeholder">
            <span>▶</span>
          </div>
          <p class="video-title">${title || 'Video'}</p>
          <p class="video-modal-caption">Video placeholder for now</p>
        </div>
      `;
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const video = lightboxContent.querySelector('video');
    if (video) video.pause();
    lightboxContent.innerHTML = '';
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const full = item.getAttribute('data-full');
      const img = item.querySelector('img');
      openLightbox(full, img ? img.alt : '');
    });
  });

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-video-title') || 'Video';
      const src = card.getAttribute('data-video-src');
      const poster = card.getAttribute('data-video-poster');
      openVideoLightbox(title, src, poster);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

});