/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Song } from '../../types/song';
import { getAlbumCoverPath } from '../../utils/albumArtwork';
import { ArtworkFallback } from './ArtworkFallback';

interface SongArtworkProps {
  song: Song;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showGenreBadge?: boolean;
}

export const SongArtwork: React.FC<SongArtworkProps> = ({
  song,
  size = 'md',
  className = '',
  showGenreBadge = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const artworkPath = getAlbumCoverPath(song.album);

  // If no artwork provided or loading failed, render procedural fallback
  if (!artworkPath || imgError) {
    return <ArtworkFallback song={song} size={size} className={className} showGenreBadge={showGenreBadge} />;
  }

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    hero: 'w-64 h-64 sm:w-80 sm:h-80',
  }[size];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.12] shrink-0 ${sizeClasses} ${className}`}>
      <img
        src={artworkPath}
        alt={`${song.album} album cover`}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
