/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Song } from '../../types/song';

interface ArtworkFallbackProps {
  song: Song;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showVinylGrooves?: boolean;
}

// Curated palettes for boutique music identity (deep tones, high-contrast accents)
const PALETTES = [
  {
    bg: 'from-[#1a1c29] via-[#12141e] to-[#0c0d14]',
    labelBg: '#d97706', // warm amber
    accent: '#fbbf24',
    textColor: '#fffbeb',
  },
  {
    bg: 'from-[#1c2226] via-[#10171a] to-[#080d0f]',
    labelBg: '#0d9488', // teal
    accent: '#2dd4bf',
    textColor: '#f0fdfa',
  },
  {
    bg: 'from-[#251829] via-[#170e1c] to-[#0d0711]',
    labelBg: '#c026d3', // fuchsia / amethyst
    accent: '#e879f9',
    textColor: '#fdf4ff',
  },
  {
    bg: 'from-[#281d18] via-[#17100b] to-[#0c0805]',
    labelBg: '#ea580c', // copper / warm terracotta
    accent: '#fb923c',
    textColor: '#fff7ed',
  },
  {
    bg: 'from-[#16212e] via-[#0f1722] to-[#080c12]',
    labelBg: '#3b82f6', // electric cobalt
    accent: '#60a5fa',
    textColor: '#eff6ff',
  },
];

export const ArtworkFallback: React.FC<ArtworkFallbackProps> = ({
  song,
  size = 'md',
  className = '',
  showVinylGrooves = true,
}) => {
  // Deterministic palette pick based on song ID or title characters
  const palette = useMemo(() => {
    let hash = 0;
    const str = `${song.title}-${song.artist}-${song.id}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % PALETTES.length;
    return PALETTES[index];
  }, [song.title, song.artist, song.id]);

  // Extract initials
  const initials = useMemo(() => {
    const words = song.title.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }, [song.title]);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-48 h-48 text-base',
    hero: 'w-64 h-64 sm:w-80 sm:h-80 text-xl',
  }[size];

  return (
    <div
      className={`relative select-none overflow-hidden rounded-xl bg-gradient-to-br ${palette.bg} flex items-center justify-center shrink-0 border border-white/10 shadow-inner group ${sizeClasses} ${className}`}
      aria-label={`${song.title} by ${song.artist} cover`}
    >
      {/* Vinyl groove overlays */}
      {showVinylGrooves && (
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none transition-transform duration-700 ease-out group-hover:rotate-12"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle concentric sound grooves */}
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />
          <circle cx="100" cy="100" r="76" stroke="white" strokeWidth="0.75" opacity="0.25" />
          <circle cx="100" cy="100" r="62" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <circle cx="100" cy="100" r="48" stroke="white" strokeWidth="0.75" opacity="0.35" />
          <circle cx="100" cy="100" r="34" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
          
          {/* Shimmer light reflection ray */}
          <line x1="20" y1="20" x2="180" y2="180" stroke="white" strokeWidth="1" strokeOpacity="0.08" />
          <line x1="180" y1="20" x2="20" y2="180" stroke="white" strokeWidth="1" strokeOpacity="0.05" />
        </svg>
      )}

      {/* Center vinyl record label / hub */}
      <div
        className="relative z-10 flex flex-col items-center justify-center rounded-full shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-105"
        style={{
          width: size === 'sm' ? '60%' : size === 'md' ? '54%' : '44%',
          height: size === 'sm' ? '60%' : size === 'md' ? '54%' : '44%',
          backgroundColor: palette.labelBg,
        }}
      >
        {/* Tiny spindle hole */}
        <div className="absolute w-2 h-2 rounded-full bg-[#0b0d12] border border-white/30 z-20" />

        {/* Initials marker */}
        <span
          className="font-bold tracking-tight leading-none z-10 drop-shadow"
          style={{ color: palette.textColor }}
        >
          {initials}
        </span>
      </div>

      {/* Subtle corner badge for genre if large size */}
      {(size === 'lg' || size === 'hero') && (
        <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none z-10">
          <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest truncate">
            {song.genre}
          </p>
        </div>
      )}
    </div>
  );
};
