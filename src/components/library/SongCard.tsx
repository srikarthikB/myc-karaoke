/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Song } from '../../types/song';
import { SongArtwork } from './SongArtwork';
import { usePlayer } from '../../context/PlayerContext';
import { Heart, Plus, Mic, Music } from 'lucide-react';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const { selectSongForStage, addToQueue, toggleFavorite, isFavorite } = usePlayer();
  const favorite = isFavorite(song.id);

  const difficultyColor = 'text-neutral-300';

  return (
    <article className="group relative bg-[#111111] hover:bg-[#1B1B1B] border border-white/[0.12] hover:border-white/[0.12] rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm">
      <div>
        {/* Top media container & quick actions */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 mb-3.5 flex items-center justify-center">
          <SongArtwork song={song} size="lg" className="w-full h-full" />

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(song.id);
            }}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-transform active:scale-90 border border-white/[0.12] z-20"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 hover:text-white'
              }`}
            />
          </button>

          {/* Quick perform overlay button on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto z-10">
            <button
              onClick={() => selectSongForStage(song)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform active:scale-95"
            >
              <Mic className="w-3.5 h-3.5 fill-black" />
              <span>Sing Now</span>
            </button>
            <button
              onClick={() => addToQueue(song)}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs rounded-lg shadow-lg flex items-center gap-1 transform translate-y-1 group-hover:translate-y-0 transition-transform active:scale-95 border border-white/20"
              title="Add to queue"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Artist */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-tight truncate" title={song.title}>
            {song.title}
          </h3>
          <p className="text-sm text-neutral-400 truncate">
            {song.artist}
            {song.originalArtist && song.originalArtist !== song.artist && (
              <span className="text-xs text-neutral-500 ml-1">({song.originalArtist})</span>
            )}
          </p>
        </div>

        {/* Unboxed Metadata Line (Frontend Constitution: No static pill boxes) */}
        <div className="mt-2.5 flex items-center gap-2 text-xs text-neutral-400">
          <span>{song.genre}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>{song.year}</span>
        </div>

        {/* Song metrics & difficulty */}
        <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-white/[0.12]">
          <span className={`font-medium ${difficultyColor}`}>
            {song.difficulty}
          </span>
          <span className="font-mono tabular-nums text-neutral-400">
            {song.durationFormatted}
          </span>
        </div>
      </div>

      {/* Primary bottom action row */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.12] flex items-center justify-between gap-2">
        <button
          onClick={() => addToQueue(song)}
          className="flex-1 py-1.5 px-2.5 text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1 border border-white/[0.12]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Queue</span>
        </button>
        <button
          onClick={() => selectSongForStage(song)}
          className="py-1.5 px-3 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center justify-center gap-1 border border-amber-500/20"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
      </div>
    </article>
  );
};
