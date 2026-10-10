/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { SongArtwork } from '../library/SongArtwork';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ListMusic,
  ArrowLeft,
  Heart,
  X,
  Music2,
  Trash2,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const KaraokeStage: React.FC = () => {
  const {
    currentSong,
    setActiveScreen,
    queue,
    removeFromQueue,
    selectSongForStage,
    toggleFavorite,
    isFavorite,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    lyrics,
    lyricsLoading,
    activeLyricIndex,
    audioError,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
  } = usePlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const lyricScrollContainerRef = useRef<HTMLDivElement>(null);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, (displayTime / duration) * 100) : 0;

  // Handle Fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!stageContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await stageContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut listener for karaoke performance (Space to toggle play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        playPrevious();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'q' || e.key === 'Q') {
        setIsQueueOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrevious, toggleFullscreen]);

  // Auto-scroll lyrics smoothly to keep active line centered
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricScrollContainerRef.current) {
      const activeEl = document.getElementById(`lyric-line-${activeLyricIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeLyricIndex]);

  // Scrub bar handlers
  const handleScrubStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updateScrubFromEvent(e);
  };

  const updateScrubFromEvent = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    const target = document.getElementById('karaoke-seek-rail');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = ratio * duration;
    setScrubTime(targetSeconds);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handlePointerMove = (e: PointerEvent) => {
      updateScrubFromEvent(e);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const target = document.getElementById('karaoke-seek-rail');
      if (target) {
        const rect = target.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const finalTime = ratio * duration;
        seek(finalTime);
      }
      setIsScrubbing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing, duration, seek]);

  if (!currentSong) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#121622] border border-white/8 text-center space-y-4">
        <Music2 className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No song selected</h2>
        <p className="text-sm text-neutral-400">
          Choose a song from your collection to start singing.
        </p>
        <button
          onClick={() => setActiveScreen('library')}
          className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          Open Song Library
        </button>
      </div>
    );
  }

  const favorite = isFavorite(currentSong.id);

  return (
    <div
      ref={stageContainerRef}
      className={`relative flex flex-col justify-between bg-[#0b0d13] text-white select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-6 sm:p-10'
          : 'rounded-2xl border border-white/10 p-5 sm:p-7 min-h-[580px] h-[calc(100vh-140px)] max-h-[820px]'
      }`}
    >
      {/* 1. Song Header (Compact: Artwork, Title, Artist, Duration) */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/8 shrink-0">
        {/* Left: Back to library & Song Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => setActiveScreen('library')}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title="Back to Song Library"
            aria-label="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <SongArtwork song={currentSong} size="sm" className="w-11 h-11 rounded-lg shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate font-display">
                {currentSong.title}
              </h2>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="text-neutral-400 hover:text-white transition-colors"
                title={favorite ? 'Favorited' : 'Favorite'}
              >
                <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="truncate">{currentSong.artist}</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="font-mono tabular-nums text-neutral-300">
                {formatTime(duration || currentSong.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Queue toggle & Fullscreen toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border ${
              isQueueOpen
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                : 'bg-white/5 text-neutral-300 hover:text-white border-white/10'
            }`}
            title="Toggle Upcoming Queue"
          >
            <ListMusic className="w-4 h-4" />
            <span className="hidden sm:inline">Queue</span>
            {queue.length > 0 && (
              <span className="font-mono text-[11px] bg-amber-400 text-black font-semibold px-1.5 py-0.2 rounded-full">
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Karaoke (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main Synchronized Lyric Display (Visual Centerpiece) */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden my-4 py-2">
        {lyricsLoading ? (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading synchronized lyrics...</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="text-center max-w-md px-6 py-8 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Music2 className="w-8 h-8 text-neutral-500 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-200">
              No synchronized lyrics added yet
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Place a matching <code className="text-amber-300 font-mono">{currentSong.lyricsPath}</code> file in the public folder to display synchronized lines here.
            </p>
          </div>
        ) : (
          <div
            ref={lyricScrollContainerRef}
            className="w-full h-full overflow-y-auto scrollbar-none flex flex-col items-center justify-start py-12 px-4 space-y-7"
          >
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              const isPast = idx < activeLyricIndex;
              const isUpcoming = idx > activeLyricIndex;

              return (
                <div
                  key={line.id}
                  id={`lyric-line-${idx}`}
                  onClick={() => seek(line.time)}
                  className={`text-center max-w-3xl transition-all duration-300 cursor-pointer select-none px-4 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-amber-300 font-bold text-2xl sm:text-3xl md:text-4xl drop-shadow-md scale-105'
                      : isPast
                      ? 'text-neutral-600 font-medium text-base sm:text-lg md:text-xl hover:text-neutral-400 opacity-60'
                      : 'text-neutral-400 font-medium text-lg sm:text-xl md:text-2xl hover:text-neutral-200 opacity-80'
                  }`}
                  title={`Jump to ${line.rawTime}`}
                >
                  <p className="leading-snug tracking-tight font-display">
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact Queue Slide-out Panel from Stage */}
        {isQueueOpen && (
          <aside
            aria-label="Upcoming Queue Panel"
            className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#11141e]/98 backdrop-blur-xl border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl z-30 transition-transform duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-display">Upcoming Queue</h3>
                  <span className="font-mono text-xs text-neutral-400">({queue.length})</span>
                </div>
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400 space-y-3">
                  <p>Queue is empty.</p>
                  <button
                    onClick={() => {
                      setIsQueueOpen(false);
                      setActiveScreen('library');
                    }}
                    className="px-3.5 py-1.5 bg-amber-400 text-black font-semibold rounded-lg text-xs"
                  >
                    Add Songs from Library
                  </button>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                  {queue.map((item, idx) => (
                    <div
                      key={item.queueId}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-4 text-center font-mono text-neutral-500 tabular-nums">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{item.song.title}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{item.song.artist}</p>
                          <p className="text-[10px] text-amber-400/90 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>{item.singerName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            selectSongForStage(item.song, true);
                            removeFromQueue(item.queueId);
                          }}
                          className="px-2 py-1 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 rounded font-medium text-[11px]"
                          title="Sing now"
                        >
                          Sing
                        </button>
                        <button
                          onClick={() => removeFromQueue(item.queueId)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setIsQueueOpen(false);
                  setActiveScreen('queue');
                }}
                className="text-neutral-400 hover:text-white"
              >
                Open Full Queue Page →
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* 3. Functional Playback Controls Area */}
      <footer className="shrink-0 pt-3 border-t border-white/8 space-y-3">
        {audioError && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                Audio file not found: <code className="font-mono text-amber-200">{currentSong.audioPath}</code>
              </span>
            </div>
            <span className="text-[11px] text-amber-400/70 hidden sm:inline shrink-0">
              Drop file into public/audio/
            </span>
          </div>
        )}

        {/* Seekable Progress Bar */}
        <div className="space-y-1">
          <div
            id="karaoke-seek-rail"
            onPointerDown={handleScrubStart}
            className="w-full h-2 bg-white/10 hover:bg-white/15 rounded-full relative cursor-pointer group transition-colors"
          >
            <div
              className="h-full bg-amber-400 rounded-full relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Scrub thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 tabular-nums">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration || currentSong.duration)}</span>
          </div>
        </div>

        {/* Primary Control Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Left spacer / song label */}
          <div className="w-32 hidden sm:block text-xs text-neutral-500 truncate">
            {currentSong.genre} · {currentSong.year}
          </div>

          {/* Center Playback Trio */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={playPrevious}
              aria-label="Previous track"
              className="p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
              title="Previous Track (Ctrl + Left)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              aria-label="Next track"
              className="p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
              title="Next Track (Ctrl + Right)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Right: Volume & Fullscreen */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                }}
                aria-label="Volume slider"
                className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
