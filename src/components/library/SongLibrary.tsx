/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Disc3,
  Heart,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { usePlayer, SortField } from '../../context/PlayerContext';
import { AVAILABLE_GENRES } from '../../data/songs';
import { Song } from '../../types/song';
import { getArtistArtworkPath } from '../../utils/artistArtwork';
import { BrowseFolderCard } from './BrowseFolderCard';
import { SongArtwork } from './SongArtwork';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { LibraryDropdown } from './LibraryDropdown';

interface SongCollection {
  key: string;
  name: string;
  detail: string;
  songs: Song[];
}

const difficultyRank: Record<Song['difficulty'], number> = {
  Casual: 1,
  Moderate: 2,
  Demanding: 3,
};

const collectionKey = (value: string) => value.trim().toLocaleLowerCase();
const albumFolderName = (album: string) => {
  const name = album.trim();
  const normalized = collectionKey(name);
  if (normalized === '× (deluxe edition)') return '×';
  if (normalized === '= (tour edition)') return '=';
  return name || 'Unknown Album';
};

const SongLibraryGrid: React.FC<{ songs: Song[] }> = ({ songs }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
    {songs.map((song) => <SongCard key={song.id} song={song} />)}
  </div>
);

const SongLibraryRows: React.FC<{ songs: Song[] }> = ({ songs }) => (
  <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#111111] divide-y divide-white/[0.12]">
    <div className="hidden grid-cols-12 gap-4 bg-white/[0.02] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-500 md:grid">
      <div className="col-span-6 flex items-center gap-3 pl-8">Track Title &amp; Artist</div>
      <div className="col-span-2">Genre / Year</div>
      <div className="col-span-2">Difficulty</div>
      <div className="col-span-2 text-right pr-2">Duration &amp; Action</div>
    </div>
    <div className="divide-y divide-white/[0.12]">
      {songs.map((song, index) => <SongRow key={song.id} song={song} index={index} />)}
    </div>
  </div>
);

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
    browseMode,
    setBrowseMode,
    selectedCollection,
    setSelectedCollection,
    onlyFavorites,
    setOnlyFavorites,
  } = usePlayer();

  const filteredSongs = useMemo(() => songs
    .filter((song) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLocaleLowerCase();
        const searchValues = [
          song.title,
          song.artist,
          song.album,
          song.genre,
          song.vocalKey,
          ...song.tags,
        ];
        if (!searchValues.some((value) => value.toLocaleLowerCase().includes(query))) return false;
      }

      if (selectedGenre !== 'All Genres' && song.genre !== selectedGenre) return false;
      if (onlyFavorites && !favorites.has(song.id)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'year') return b.year - a.year;
      return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
    }), [songs, searchQuery, selectedGenre, onlyFavorites, favorites, sortBy]);

  const albumGroups = useMemo(() => {
    const grouped = new Map<string, { name: string; songs: Song[] }>();
    for (const song of filteredSongs) {
      const name = albumFolderName(song.album);
      const key = collectionKey(name);
      const group = grouped.get(key) ?? { name, songs: [] };
      group.songs.push(song);
      grouped.set(key, group);
    }

    return Array.from(grouped, ([key, group]): SongCollection => {
      const artists = Array.from(new Map(group.songs
        .map((song) => song.artist.trim() || 'Unknown Artist')
        .map((artist) => [collectionKey(artist), artist])).values());
      return { key, name: group.name, detail: artists.join(', '), songs: group.songs };
    });
  }, [filteredSongs]);

  const artistGroups = useMemo(() => {
    const grouped = new Map<string, { name: string; songs: Song[] }>();
    for (const song of filteredSongs) {
      const credits = song.artist.split(',').map((artist) => artist.trim()).filter(Boolean);
      const distinctCredits = credits.length ? Array.from(new Map(credits.map((artist) => [collectionKey(artist), artist])).values()) : ['Unknown Artist'];
      for (const name of distinctCredits) {
        const key = collectionKey(name);
        const group = grouped.get(key) ?? { name, songs: [] };
        if (!group.songs.some((groupSong) => groupSong.id === song.id)) group.songs.push(song);
        grouped.set(key, group);
      }
    }

    return Array.from(grouped, ([key, group]): SongCollection => {
      const albums = Array.from(new Set(group.songs.map((song) => collectionKey(albumFolderName(song.album)))));
      return {
        key,
        name: group.name,
        detail: `${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`,
        songs: group.songs,
      };
    });
  }, [filteredSongs]);

  const visibleCollections = useMemo(() => {
    if (browseMode === 'songs') return [];
    const groups = browseMode === 'albums' ? albumGroups : artistGroups;
    return [...groups].sort((a, b) => {
      if (sortBy === 'artist') {
        return (browseMode === 'artists' ? a.name : a.detail).localeCompare(browseMode === 'artists' ? b.name : b.detail)
          || a.name.localeCompare(b.name);
      }
      if (sortBy === 'duration') {
        const aDuration = a.songs.reduce((total, song) => total + song.duration, 0);
        const bDuration = b.songs.reduce((total, song) => total + song.duration, 0);
        return bDuration - aDuration || a.name.localeCompare(b.name);
      }
      if (sortBy === 'year') {
        const aYear = Math.max(...a.songs.map((song) => song.year));
        const bYear = Math.max(...b.songs.map((song) => song.year));
        return bYear - aYear || a.name.localeCompare(b.name);
      }
      if (sortBy === 'difficulty') {
        const aDifficulty = Math.max(...a.songs.map((song) => difficultyRank[song.difficulty]));
        const bDifficulty = Math.max(...b.songs.map((song) => difficultyRank[song.difficulty]));
        return bDifficulty - aDifficulty || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [albumGroups, artistGroups, browseMode, sortBy]);

  const selectedSongs = selectedCollection
    ? visibleCollections.find((group) => group.key === selectedCollection.key)?.songs ?? []
    : [];
  const selectedArtworkSong = selectedSongs[0];
  const showSongViewToggle = browseMode === 'songs' || selectedCollection !== null;

  const selectBrowseMode = (mode: 'songs' | 'albums' | 'artists') => {
    setBrowseMode(mode);
    setSelectedCollection(null);
  };

  const backLabel = selectedCollection?.mode === 'albums' ? 'Back to Albums' : 'Back to Artists';

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex w-full justify-center pt-1">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search songs, albums, artists, or genres..."
            aria-label="Search songs, albums, artists, or genres"
            className="glass-field w-full rounded-xl border py-2.5 pl-11 pr-10 text-sm text-white shadow-inner placeholder:text-neutral-500 transition-colors focus:border-amber-400/80 focus:outline-none focus:ring-1 focus:ring-amber-400/80"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="glass-control glass-search-clear absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-0.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-white/[0.12] bg-[#151515] p-1 scrollbar-none" role="group" aria-label="Song browsing mode">
          {([
            { mode: 'songs' as const, label: 'All Songs', Icon: LayoutGrid },
            { mode: 'albums' as const, label: 'Albums', Icon: Disc3 },
            { mode: 'artists' as const, label: 'Artists', Icon: Users },
          ]).map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => selectBrowseMode(mode)}
              aria-pressed={browseMode === mode}
              className={`glass-control inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${browseMode === mode ? 'glass-selected text-amber-200 shadow-sm' : 'text-neutral-400 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setOnlyFavorites((current) => !current)}
            aria-pressed={onlyFavorites}
            className={`glass-control flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${onlyFavorites ? 'glass-selected text-amber-300' : 'text-neutral-300 hover:text-white'}`}
          >
            <Heart className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
            {favorites.size > 0 && <span className="ml-0.5 font-mono text-[11px] opacity-80 tabular-nums">({favorites.size})</span>}
          </button>

          <LibraryDropdown
            label="Genre"
            value={selectedGenre}
            options={AVAILABLE_GENRES}
            onChange={setSelectedGenre}
            ariaLabel="Filter by genre"
          />

          <LibraryDropdown
            label="Sort"
            value={sortBy === 'title' ? 'Song Title' : ({ artist: 'Artist', duration: 'Duration', year: 'Release Year', difficulty: 'Vocal Difficulty' }[sortBy] ?? sortBy)}
            options={[
              'Song Title',
              'Artist',
              'Duration',
              'Release Year',
              'Vocal Difficulty',
            ]}
            onChange={(option) => setSortBy(({ 'Song Title': 'title', Artist: 'artist', Duration: 'duration', 'Release Year': 'year', 'Vocal Difficulty': 'difficulty' }[option] ?? sortBy) as SortField)}
            ariaLabel="Sort songs or folders"
          />

          {showSongViewToggle && (
            <div className="flex items-center rounded-lg border border-white/[0.12] bg-[#1B1B1B] p-0.5" role="group" aria-label="Song list layout">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`glass-control rounded-md p-1.5 ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`glass-control rounded-md p-1.5 ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                title="List view"
                aria-label="List view"
                aria-pressed={viewMode === 'table'}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCollection ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#111111]/90 p-3 sm:p-4">
            <button
              type="button"
              onClick={() => setSelectedCollection(null)}
              className="glass-control inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.12] px-3 text-xs font-semibold text-neutral-200 transition-colors hover:border-amber-400/40 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </button>
            {selectedArtworkSong ? (
              <SongArtwork song={selectedArtworkSong} size="sm" className="h-12 w-12 rounded-lg" showGenreBadge={false} />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] text-amber-200">
                {selectedCollection.mode === 'albums' ? <Disc3 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">
                {selectedCollection.mode === 'albums' ? 'Album' : 'Artist'}
              </p>
              <h2 className="truncate text-base font-semibold text-white" title={selectedCollection.name}>{selectedCollection.name}</h2>
              <p className="text-xs text-neutral-400">
                {selectedSongs.length} {selectedSongs.length === 1 ? 'song' : 'songs'}
                {selectedCollection.mode === 'artists' && selectedSongs.length > 0
                  ? ` · ${new Set(selectedSongs.map((song) => collectionKey(albumFolderName(song.album)))).size} albums`
                  : ''}
              </p>
            </div>
          </div>
          {selectedSongs.length > 0 ? (
            viewMode === 'grid' ? <SongLibraryGrid songs={selectedSongs} /> : <SongLibraryRows songs={selectedSongs} />
          ) : (
            <div className="rounded-2xl border border-white/[0.12] bg-[#111111] p-10 text-center">
              <p className="text-sm font-medium text-white">No songs in this folder match the current filters.</p>
              <p className="mt-1 text-xs text-neutral-400">Change the search or genre filter, or go back to browse other folders.</p>
            </div>
          )}
        </section>
      ) : filteredSongs.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.12] bg-[#111111] p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-white/5 text-neutral-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No songs found</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-400">
            {onlyFavorites
              ? "You haven't favorited any songs matching this search yet."
              : `No tracks match "${searchQuery || selectedGenre}". Try clearing your filters.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All Genres');
              setOnlyFavorites(false);
            }}
            className="glass-control mt-4 rounded-lg px-4 py-2 text-xs font-semibold text-neutral-200"
          >
            Reset Filters
          </button>
        </div>
      ) : browseMode === 'songs' ? (
        viewMode === 'grid' ? <SongLibraryGrid songs={filteredSongs} /> : <SongLibraryRows songs={filteredSongs} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {visibleCollections.map((group) => (
            <BrowseFolderCard
              key={group.key}
              kind={browseMode === 'albums' ? 'album' : 'artist'}
              name={group.name}
              detail={group.detail}
              count={group.songs.length}
              artworkSong={group.songs[0]}
              artistArtworkPath={browseMode === 'artists' ? getArtistArtworkPath(group.name) : null}
              onClick={() => setSelectedCollection({ mode: browseMode, key: group.key, name: group.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
