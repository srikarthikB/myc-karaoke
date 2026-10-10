/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Song } from '../../types/song';
import { SongArtwork } from './SongArtwork';
import { usePlayer } from '../../context/PlayerContext';
import { Heart, Plus, Mic } from 'lucide-react';

interface SongRowProps {
  song: Song;
  index: number;
}

export const SongRow: React.FC<SongRowProps> = ({ song, index }) => {
  const { selectSongForStage, addToQueue, toggleFavorite, isFavorite } = usePlayer();
  const favorite = isFavorite(song.id);

  const difficultyColor = {
    Casual: 'text-emerald-400',
    Moderate: 'text-amber-400',
    Demanding: 'text-rose-400',
  }[song.difficulty];

  return (
    <div
      onClick={() => selectSongForStage(song)}
      className="group grid grid-cols-12 items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/[0.04] last:border-b-0 text-sm select-none"
    >
      {/* Index & Artwork & Title/Artist (Cols 1-6) */}
      <div className="col-span-12 md:col-span-6 flex items-center gap-3 min-w-0">
        <span className="w-5 text-right font-mono text-xs text-neutral-500 tabular-nums">
          {index + 1}
        </span>
        <SongArtwork song={song} size="sm" className="w-10 h-10 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
            {song.title}
          </p>
          <p className="text-xs text-neutral-400 truncate">
            {song.artist}
            {song.originalArtist && song.originalArtist !== song.artist && (
              <span className="text-neutral-500 ml-1">({song.originalArtist})</span>
            )}
          </p>
        </div>
      </div>

      {/* Genre & Year (Cols 7-8) */}
      <div className="hidden md:flex md:col-span-2 items-center text-xs text-neutral-400 truncate">
        <span>{song.genre}</span>
        <span aria-hidden="true" className="mx-1.5 text-neutral-600">·</span>
        <span className="font-mono tabular-nums">{song.year}</span>
      </div>

      {/* Difficulty (Cols 9-10) */}
      <div className="hidden md:flex md:col-span-2 items-center text-xs">
        <span className={`font-medium ${difficultyColor}`}>
          {song.difficulty}
        </span>
      </div>

      {/* Duration & Actions (Cols 11-12) */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
        <span className="font-mono tabular-nums text-xs text-neutral-400 mr-2">
          {song.durationFormatted}
        </span>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title={favorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Add to queue */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
          }}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Add to queue"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Sing */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectSongForStage(song);
          }}
          className="p-1.5 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors"
          title="Perform on stage"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
