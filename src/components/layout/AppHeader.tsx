/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Mic, ListMusic, Music2, BookOpen } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { activeScreen, setActiveScreen, queue, setIsSetupModalOpen } = usePlayer();

  return (
    <header className="app-header glass-panel glass-header sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-white/[0.12] select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveScreen('library')}
          className="glass-nav-item flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-white font-display">
              myc
            </span>
            <span className="text-xs font-medium text-amber-400/90 tracking-wider uppercase font-mono">
              karaoke
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={() => setActiveScreen('library')}
          className={`glass-nav-item flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeScreen === 'library'
              ? 'text-white border-amber-400 font-semibold'
              : 'text-neutral-400 border-transparent hover:text-neutral-200'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>Song Library</span>
        </button>

        <button
          onClick={() => setActiveScreen('player')}
          className={`glass-nav-item flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeScreen === 'player'
              ? 'text-white border-amber-400 font-semibold'
              : 'text-neutral-400 border-transparent hover:text-neutral-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Karaoke Stage</span>
        </button>

        <button
          onClick={() => setActiveScreen('queue')}
          className={`glass-nav-item flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeScreen === 'queue'
              ? 'text-white border-amber-400 font-semibold'
              : 'text-neutral-400 border-transparent hover:text-neutral-200'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>Queue</span>
          {queue.length > 0 && (
            <span className="ml-1 text-xs px-1.5 py-0.2 font-mono tabular-nums bg-white/10 text-amber-300 rounded">
              {queue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="glass-nav-item flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 text-neutral-400 border-transparent hover:text-amber-300"
        >
          <BookOpen className="w-4 h-4" />
          <span>Local Setup Guide</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveScreen('player')}
          className="glass-primary px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Mic className="w-3.5 h-3.5 fill-black" />
          <span>Launch Stage</span>
        </button>
      </div>
    </header>
  );
};
