import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
  LoaderCircle
} from 'lucide-react';
import { extractYouTubeVideoId } from '../../utils/videoUtils';

/**
 * Student-side YouTube player that keeps the video link out of reach.
 *
 * What it does:
 *  - Plays through the YouTube IFrame API with YouTube's own controls turned off.
 *  - The YouTube frame is taller than the visible box, so YouTube's title bar
 *    (title + share + "copy link") and bottom logo sit outside the visible area.
 *  - A transparent layer covers the video: no click, right-click ("Copy video URL")
 *    or keyboard shortcut ever reaches YouTube, so nothing links out to YouTube.
 *  - Its own controls: play/pause, ±10s, seek, volume, speed, fullscreen.
 *  - Covers YouTube's end screen (suggested videos) with its own "Replay / Next" panel.
 *  - Faint moving watermark with the student's name & phone to discourage screen recording.
 *
 * Limit: the browser still has to load the video ID, so someone using developer tools can
 * find it. For full protection, host videos where embedding can be locked to your domain.
 */

// ---- Load the YouTube IFrame API once ------------------------------------------
let ytApiPromise = null;
const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      ytApiPromise = null;
      reject(new Error('Could not load the video player'));
    };
    document.head.appendChild(script);
  });
  return ytApiPromise;
};

const fmt = (secs) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
// How far the YouTube frame extends above/below the visible box (hides title bar & logo)
const CROP_PX = 90;

export const ProtectedVideoPlayer = ({ videoUrl, title, watermark, onEnded, nextLabel }) => {
  const videoId = extractYouTubeVideoId(videoUrl);
  const wrapperRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const hideTimer = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | ready | playing | paused | buffering | ended | error
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false); // iPhone: no element fullscreen
  const [controlsVisible, setControlsVisible] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState(0);

  // ---- Create / destroy the YouTube player ----------------------------------------
  useEffect(() => {
    if (!videoId) return undefined;
    let cancelled = false;
    setStatus('loading');
    setStarted(false);
    setCurrent(0);
    setDuration(0);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        const target = document.createElement('div');
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(target);
        playerRef.current = new YT.Player(target, {
          host: 'https://www.youtube-nocookie.com',
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0, // no YouTube control bar (it contains the YouTube link/logo)
            disablekb: 1, // no YouTube keyboard shortcuts
            fs: 0,
            rel: 0, // related videos only from the same channel
            modestbranding: 1,
            iv_load_policy: 3, // no annotations/cards
            playsinline: 1,
            cc_load_policy: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              const iframe = e.target.getIframe();
              iframe.setAttribute('tabindex', '-1'); // keyboard can't reach YouTube
              iframe.setAttribute('title', title || 'Lesson video');
              iframe.style.pointerEvents = 'none';
              setDuration(e.target.getDuration() || 0);
              setVolume(e.target.getVolume?.() ?? 100);
              setStatus('ready');
            },
            onStateChange: (e) => {
              const S = window.YT.PlayerState;
              if (e.data === S.PLAYING) {
                setStarted(true);
                setStatus('playing');
                setDuration(e.target.getDuration() || 0);
              } else if (e.data === S.PAUSED) setStatus('paused');
              else if (e.data === S.BUFFERING) setStatus('buffering');
              else if (e.data === S.ENDED) setStatus('ended');
            },
            onError: () => setStatus('error')
          }
        });
      })
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch (e) {}
      playerRef.current = null;
    };
  }, [videoId, title]);

  // ---- Progress polling while playing --------------------------------------------------
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime) setCurrent(p.getCurrentTime());
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  // ---- Fullscreen tracking -----------------------------------------------------------------
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ---- Watermark moves every few seconds ------------------------------------------------
  useEffect(() => {
    if (!watermark) return undefined;
    const id = setInterval(() => setWatermarkPos((p) => (p + 1) % 4), 7000);
    return () => clearInterval(id);
  }, [watermark]);

  // ---- Auto-hide controls while playing -------------------------------------------------
  const pokeControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
  }, []);
  useEffect(() => {
    if (status !== 'playing') {
      setControlsVisible(true);
      clearTimeout(hideTimer.current);
    } else pokeControls();
    return () => clearTimeout(hideTimer.current);
  }, [status, pokeControls]);

  const p = () => playerRef.current;
  const ready = status !== 'loading' && status !== 'error';

  const togglePlay = () => {
    if (!ready) return;
    if (status === 'playing' || status === 'buffering') p()?.pauseVideo();
    else {
      if (status === 'ended') p()?.seekTo(0, true);
      p()?.playVideo();
    }
  };
  const seekTo = (t) => {
    const clamped = Math.min(Math.max(0, t), duration || 0);
    p()?.seekTo(clamped, true);
    setCurrent(clamped);
  };
  const toggleMute = () => {
    if (muted) {
      p()?.unMute();
      setMuted(false);
    } else {
      p()?.mute();
      setMuted(true);
    }
  };
  const changeVolume = (v) => {
    p()?.setVolume(v);
    setVolume(v);
    if (v > 0 && muted) {
      p()?.unMute();
      setMuted(false);
    }
  };
  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    p()?.setPlaybackRate(next);
    setSpeed(next);
  };
  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    } else if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        setPseudoFullscreen((v) => !v);
      }
    } else {
      setPseudoFullscreen((v) => !v); // iPhone Safari: fill the screen with CSS instead
    }
  };

  // Our own keyboard shortcuts (YouTube's are disabled)
  const onKeyDown = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight') seekTo(current + 10);
    else if (e.key === 'ArrowLeft') seekTo(current - 10);
    else if (e.key === 'f') toggleFullscreen();
    else if (e.key === 'm') toggleMute();
    else return;
    pokeControls();
  };

  if (!videoId) return null;

  const showControls = controlsVisible || status !== 'playing';
  const pct = duration ? (current / duration) * 100 : 0;
  const wmPositions = ['top-[12%] left-[6%]', 'top-[12%] right-[6%]', 'bottom-[22%] right-[6%]', 'bottom-[22%] left-[6%]'];

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={pokeControls}
      onTouchStart={pokeControls}
      aria-label={`Video player: ${title || 'lesson'}`}
      className={`relative bg-black overflow-hidden select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        pseudoFullscreen ? 'fixed inset-0 z-[100] w-screen h-[100dvh]' : 'w-full aspect-video'
      } ${status === 'playing' && !showControls ? 'cursor-none' : ''}`}
    >
      {/* YouTube frame: taller than the box so its title bar & logo are cut off */}
      <div
        ref={mountRef}
        className="absolute left-0 right-0 [&>iframe]:w-full [&>iframe]:h-full"
        style={{ top: -CROP_PX, height: `calc(100% + ${CROP_PX * 2}px)` }}
        aria-hidden="true"
      />

      {/* Click shield: nothing on the video can be clicked through to YouTube */}
      <button
        type="button"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
        aria-label={status === 'playing' ? 'Pause' : 'Play'}
        tabIndex={-1}
      />

      {/* Watermark */}
      {watermark && started && status !== 'ended' && (
        <div
          className={`absolute ${wmPositions[watermarkPos]} pointer-events-none text-[10px] sm:text-xs font-semibold text-white/25 transition-all duration-1000 whitespace-nowrap`}
          aria-hidden="true"
        >
          {watermark}
        </div>
      )}

      {/* Before first play: our own cover (hides YouTube's title/thumbnail screen) */}
      {!started && status !== 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#07242B] via-[#0A333C] to-[#0D4450] flex flex-col items-center justify-center gap-3 p-4 text-center pointer-events-none">
          {status === 'loading' ? (
            <LoaderCircle className="w-10 h-10 text-teal-300 animate-spin" />
          ) : (
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-[#0C4E5B] flex items-center justify-center shadow-xl">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
            </span>
          )}
          <p className="text-white font-bold text-sm sm:text-base max-w-md line-clamp-2">{title}</p>
        </div>
      )}

      {/* Paused: keep the frame visible (students read the board), show a play badge */}
      {started && status === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/55 text-white flex items-center justify-center">
            <Play className="w-7 h-7 fill-current ml-1" />
          </span>
        </div>
      )}

      {status === 'buffering' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LoaderCircle className="w-10 h-10 text-white/80 animate-spin" />
        </div>
      )}

      {/* Ended: cover YouTube's end screen (suggested videos) */}
      {status === 'ended' && (
        <div className="absolute inset-0 bg-[#07191E] flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-white font-bold text-sm sm:text-base">Lesson complete 🎉</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Replay
            </button>
            {onEnded && (
              <button
                type="button"
                onClick={onEnded}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <SkipForward className="w-4 h-4" /> {nextLabel || 'Next lesson'}
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 bg-[#07191E] flex flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="text-white font-bold text-sm">This video can't be played right now.</p>
          <p className="text-slate-400 text-xs max-w-sm">Check your internet connection, or ask the admin. The video may be private or removed.</p>
        </div>
      )}

      {/* Our controls */}
      {ready && started && status !== 'ended' && (
        <div
          className={`absolute inset-x-0 bottom-0 px-2.5 sm:px-4 pb-2 sm:pb-3 pt-8 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={Math.min(current, duration || 0)}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek"
            className="w-full h-1.5 cursor-pointer accent-teal-400"
            style={{ background: `linear-gradient(to right, #2dd4bf ${pct}%, rgba(255,255,255,0.25) ${pct}%)`, borderRadius: 9999, appearance: 'none' }}
          />
          <div className="flex items-center gap-1 sm:gap-2 mt-1.5 text-white">
            <button type="button" onClick={togglePlay} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15" aria-label={status === 'playing' ? 'Pause' : 'Play'}>
              {status === 'playing' || status === 'buffering' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button type="button" onClick={() => seekTo(current - 10)} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15" aria-label="Back 10 seconds">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => seekTo(current + 10)} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15" aria-label="Forward 10 seconds">
              <RotateCw className="w-4 h-4" />
            </button>
            <button type="button" onClick={toggleMute} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15" aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Volume"
              className="hidden sm:block w-20 accent-white cursor-pointer"
            />
            <span className="text-[11px] sm:text-xs font-mono tabular-nums ml-1 whitespace-nowrap">
              {fmt(current)} / {fmt(duration)}
            </span>
            <span className="flex-1" />
            <button type="button" onClick={cycleSpeed} className="px-2 py-1 rounded-lg hover:bg-white/15 text-[11px] sm:text-xs font-bold tabular-nums" aria-label={`Playback speed ${speed}x`}>
              {speed}x
            </button>
            <button type="button" onClick={toggleFullscreen} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15" aria-label={isFullscreen || pseudoFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen || pseudoFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
