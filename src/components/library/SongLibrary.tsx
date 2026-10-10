/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { usePlayer, SortField } from '../../context/PlayerContext';
import { AVAILABLE_GENRES } from '../../data/songs';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { Search, LayoutGrid, List, Sparkles, Heart, Filter, X } from 'lucide-react';

export const SongLibrary: React.FC = () => {
  const {
    songs,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    favorites,
  } = usePlayer();

  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = song.title.toLowerCase().includes(q);
          const matchArtist = song.artist.toLowerCase().includes(q);
          const matchGenre = song.genre.toLowerCase().includes(q);
          const matchKey = song.vocalKey.toLowerCase().includes(q);
          const matchTags = song.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchArtist && !matchGenre && !matchKey && !matchTags) {
            return false;
          }
        }

        // Genre filter
        if (selectedGenre !== 'All Genres' && song.genre !== selectedGenre) {
          return false;
        }

        // Favorites filter
        if (onlyFavorites && !favorites.has(song.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
        if (sortBy === 'duration') return b.duration - a.duration;
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'difficulty') {
          const rank = { Casual: 1, Moderate: 2, Demanding: 3 };
          return rank[b.difficulty] - rank[a.difficulty];
        }
        return 0;
      });
  }, [songs, searchQuery, selectedGenre, onlyFavorites, favorites, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Prominent Centered Search Bar */}
      <div className="flex justify-center w-full pt-1">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, artist, or genre..."
            className="w-full bg-[#131622] border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Toolbar: Favorites on the left, Sort and View mode on the right */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        {/* Favorites filter (Left) */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border ${
            onlyFavorites
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-white/5 border-white/8 text-neutral-300 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>Favorites</span>
          {favorites.size > 0 && (
            <span className="ml-0.5 font-mono text-[11px] opacity-80 tabular-nums">
              ({favorites.size})
            </span>
          )}
        </button>

        {/* Sort control and View mode toggle (Right) */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-[#131622] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="title">Song Title</option>
              <option value="artist">Artist</option>
              <option value="duration">Duration</option>
              <option value="year">Release Year</option>
              <option value="difficulty">Vocal Difficulty</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid or Table */}
          <div className="flex items-center bg-[#141824] p-0.5 rounded-lg border border-white/8">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Genre Filter Segmented Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {AVAILABLE_GENRES.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-black shadow-sm font-semibold'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Content Rendering: Grid vs Table vs Empty State */}
      {filteredSongs.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#131622] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No songs found</h3>
          <p className="mt-1 text-sm text-neutral-400 max-w-sm mx-auto">
            {onlyFavorites
              ? "You haven't favorited any songs matching this search yet."
              : `No tracks match "${searchQuery || selectedGenre}". Try clearing your filters.`}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All Genres');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="bg-[#121622] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider bg-white/[0.02]">
            <div className="col-span-6 flex items-center gap-3 pl-8">
              <span>Track Title & Artist</span>
            </div>
            <div className="col-span-2">Genre / Year</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 text-right pr-2">Duration & Action</div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {filteredSongs.map((song, idx) => (
              <SongRow key={song.id} song={song} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
