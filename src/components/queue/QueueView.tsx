/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { SongArtwork } from '../library/SongArtwork';
import { ChevronUp, ChevronDown, Trash2, Mic, Music, UserCheck, Play } from 'lucide-react';

export const QueueView: React.FC = () => {
  const {
    queue,
    currentSong,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    selectSongForStage,
    setActiveScreen,
  } = usePlayer();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.12]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Party Queue
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono tabular-nums">{queue.length} upcoming tracks</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Up next for family & friends</span>
          </div>
        </div>

        {queue.length > 0 && (
          <button
            onClick={clearQueue}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-amber-300 hover:bg-amber-400/10 border border-white/[0.12] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {/* Currently on stage / loaded */}
      {currentSong && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1B1B1B] to-[#111111] border border-amber-500/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Loaded on Stage</span>
            </div>
            <button
              onClick={() => setActiveScreen('player')}
              className="px-3 py-1 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <Play className="w-3 h-3 fill-black" />
              <span>Go to Stage</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <SongArtwork song={currentSong} size="md" className="w-16 h-16 sm:w-20 sm:h-20" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {currentSong.title}
              </h3>
              <p className="text-sm text-neutral-300 truncate">
                {currentSong.artist}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                <span>{currentSong.genre}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span>{currentSong.year}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="font-mono tabular-nums text-neutral-300">{currentSong.durationFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming list */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Upcoming Lineup ({queue.length})
        </h2>

        {queue.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.12] bg-[#111111] p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/[0.12] flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">The queue is empty</h3>
            <p className="mt-1 text-sm text-neutral-400 max-w-sm mx-auto">
              Browse the song catalogue and click &quot;+ Queue&quot; to line up songs for the mic.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setActiveScreen('library')}
                className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                Browse Song Library
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queue.map((item, index) => (
              <div
                key={item.queueId}
                className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#111111] hover:bg-[#1B1B1B] border border-white/[0.12] transition-colors"
              >
                {/* Position & Artwork */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center font-mono font-semibold text-xs text-neutral-400 tabular-nums">
                    #{index + 1}
                  </span>
                  <SongArtwork song={item.song} size="sm" className="w-12 h-12 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                      {item.song.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {item.song.artist}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                        <UserCheck className="w-3 h-3" />
                        {item.singerName}
                      </span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span>{item.song.genre}</span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span className="font-mono tabular-nums">{item.song.durationFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Queue Controls: Reorder, Stage, Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move Up */}
                  <button
                    onClick={() => moveQueueItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => moveQueueItem(index, 'down')}
                    disabled={index === queue.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Perform next */}
                  <button
                    onClick={() => {
                      selectSongForStage(item.song);
                      removeFromQueue(item.queueId);
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center gap-1 border border-amber-500/20"
                    title="Send to stage now"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sing</span>
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromQueue(item.queueId)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
