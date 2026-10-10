/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Song } from '../../types/song';
import { SongArtwork } from './SongArtwork';
import { usePlayer } from '../../context/PlayerContext';
import { Heart, Plus, Mic } from 'lucide-react';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const { selectSongForStage, addToQueue, toggleFavorite, isFavorite } = usePlayer();
  const favorite = isFavorite(song.id);

  const difficultyColor = 'text-neutral-300';

  return (
    <article className="song-card glass-card group relative border rounded-2xl p-2 flex flex-col justify-between">
      {/* Favorite button stays anchored to the card, outside the rotating artwork. */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(song.id);
        }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        className="glass-control absolute top-2 right-2 p-1.5 rounded-lg text-white active:scale-90 z-20"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 hover:text-white'
          }`}
        />
      </button>
      <div>
        {/* Top media container & quick actions */}
        <div className="relative aspect-square w-3/4 mx-auto mb-2">
          <div className="absolute inset-0 rounded-full overflow-hidden bg-black/40">
            <div className="song-card-record-spin w-full h-full overflow-hidden rounded-full">
              <SongArtwork song={song} size="lg" className="w-full h-full rounded-full" showGenreBadge={false} />
            </div>
            {/* Quick perform overlay button on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto z-10">
              <button
                onClick={() => selectSongForStage(song)}
                className="glass-primary glass-overlay-primary px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 active:scale-95"
              >
                <Mic className="w-3.5 h-3.5 fill-black" />
                <span>Sing Now</span>
              </button>
              <button
                onClick={() => addToQueue(song)}
                className="glass-control glass-overlay-control p-1.5 text-white text-xs rounded-lg shadow-lg flex items-center gap-1 transform translate-y-1 group-hover:translate-y-0 active:scale-95"
                title="Add to queue"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Title & Artist */}
        <div className="space-y-0.5">
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
        <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
          <span className="min-w-0 truncate" title={song.genre}>{song.genre}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span>{song.year}</span>
        </div>

        {/* Song metrics & difficulty */}
        <div className="mt-1 flex items-center justify-between text-xs pt-1 border-t border-white/[0.12]">
          <span className={`font-medium ${difficultyColor}`}>
            {song.difficulty}
          </span>
          <span className="font-mono tabular-nums text-neutral-400">
            {song.durationFormatted}
          </span>
        </div>
      </div>

      {/* Primary bottom action row */}
      <div className="mt-2 pt-2 border-t border-white/[0.12] flex items-center justify-between gap-2">
        <button
          onClick={() => addToQueue(song)}
          className="glass-control flex-1 min-h-8 py-1 px-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Queue</span>
        </button>
        <button
          onClick={() => selectSongForStage(song)}
          className="glass-control glass-selected min-h-8 py-1 px-2.5 text-xs font-semibold text-amber-300 hover:text-amber-200 rounded-lg flex items-center justify-center gap-1"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
      </div>
    </article>
  );
};
