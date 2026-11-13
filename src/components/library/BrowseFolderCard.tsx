/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Disc3, FolderOpen, Users } from 'lucide-react';
import { Song } from '../../types/song';
import { SongArtwork } from './SongArtwork';

interface BrowseFolderCardProps {
  kind: 'album' | 'artist';
  name: string;
  detail: string;
  count: number;
  artworkSong: Song;
  artistArtworkPath?: string | null;
  onClick: () => void;
}

export const BrowseFolderCard: React.FC<BrowseFolderCardProps> = ({
  kind,
  name,
  detail,
  count,
  artworkSong,
  artistArtworkPath,
  onClick,
}) => {
  const isAlbum = kind === 'album';
  const TypeIcon = isAlbum ? Disc3 : Users;
  const [artistArtworkFailed, setArtistArtworkFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${isAlbum ? 'album' : 'artist'} ${name}, ${count} ${count === 1 ? 'song' : 'songs'}`}
      className="glass-card group relative flex min-h-32 w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.12] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-300/80 to-amber-600/20 opacity-70 transition-opacity group-hover:opacity-100" />
      <span className="relative ml-1 shrink-0">
        <span className="absolute -top-2 left-1 h-2 w-9 rounded-t-md border border-b-0 border-amber-300/25 bg-amber-300/10" />
        {isAlbum || !artistArtworkPath || artistArtworkFailed ? (
          <SongArtwork
            song={artworkSong}
            size="md"
            className="h-20 w-20 rounded-xl shadow-lg shadow-black/30"
            showGenreBadge={false}
          />
        ) : (
          <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/[0.12] shadow-lg shadow-black/30">
            <img
              src={artistArtworkPath}
              alt={`${name} artist photo`}
              onError={() => setArtistArtworkFailed(true)}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300/30 bg-[#191715] text-amber-200 shadow-md">
          <FolderOpen className="h-4 w-4" aria-hidden="true" />
        </span>
      </span>

      <span className="min-w-0 flex-1 py-1">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">
          <TypeIcon className="h-3 w-3" aria-hidden="true" />
          {isAlbum ? 'Album folder' : 'Artist folder'}
        </span>
        <span className="mt-1 block truncate text-sm font-semibold text-white" title={name}>
          {name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-neutral-400" title={detail}>
          {detail}
        </span>
        <span className="mt-2 block text-xs text-neutral-500">
          {count} {count === 1 ? 'song' : 'songs'}
        </span>
      </span>
    </button>
  );
};
