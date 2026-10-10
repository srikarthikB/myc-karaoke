/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { SongArtwork } from '../library/SongArtwork';
import { Mic, ListMusic, Heart, Play, Pause, SkipForward } from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    activeScreen,
    setActiveScreen,
    queue,
    toggleFavorite,
    isFavorite,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
  } = usePlayer();

  // On the Karaoke Stage itself, hide the bottom bar so it does not compete or duplicate controls
  if (!currentSong || activeScreen === 'player') return null;

  const favorite = isFavorite(currentSong.id);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside
      aria-label="Persistent Mini Player"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#111111]/95 backdrop-blur-lg border-t border-white/[0.12] px-6 py-3 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 sm:flex-initial">
          <SongArtwork song={currentSong} size="sm" className="w-11 h-11 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                {currentSong.title}
              </h4>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="text-neutral-400 hover:text-white transition-colors"
                title={favorite ? 'Favorited' : 'Favorite'}
              >
                <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Center player controls for mini-bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            aria-label="Next song"
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            title="Next song"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono tabular-nums">{formatTime(currentTime)}</span>
            <div className="w-36 md:w-56 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveScreen('queue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border ${
              activeScreen === 'queue'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/5 text-neutral-300 hover:text-white border-white/[0.12]'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
            {queue.length > 0 && (
              <span className="ml-0.5 font-mono text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded">
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveScreen('player')}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 fill-black" />
            <span>Stage</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
