/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, QueueItem, ActiveScreen } from '../types/song';
import { LyricLine } from '../engine/lyricTypes';
import { DEFAULT_SONGS } from '../data/songs';
import { globalAudioEngine, safeEncodeURI } from '../engine/browserAudioEngine';
import { defaultLyricParser } from '../engine/lyricParser';

export type SortField = 'title' | 'artist' | 'duration' | 'year' | 'difficulty';

interface PlayerContextType {
  songs: Song[];
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  currentSong: Song | null;
  selectSongForStage: (song: Song, autoPlay?: boolean) => void;
  queue: QueueItem[];
  addToQueue: (song: Song, singerName?: string) => void;
  removeFromQueue: (queueId: string) => void;
  moveQueueItem: (index: number, direction: 'up' | 'down') => void;
  clearQueue: () => void;
  favorites: Set<string>;
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  sortBy: SortField;
  setSortBy: (sort: SortField) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  isQueueDrawerOpen: boolean;
  setIsQueueDrawerOpen: (open: boolean) => void;
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
  // Audio playback and sync engine state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  lyrics: LyricLine[];
  lyricsLoading: boolean;
  activeLyricIndex: number;
  audioError: string | null;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY_FAVORITES = 'myc_favorites_v1';
const STORAGE_KEY_VIEW_MODE = 'myc_view_mode_v1';
const STORAGE_KEY_QUEUE = 'myc_queue_v1';

const loadQueue = (songs: Song[]): QueueItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
    if (!saved) return [];

    const storedItems: unknown = JSON.parse(saved);
    if (!Array.isArray(storedItems)) return [];

    const songsById = new Map(songs.map((song) => [song.id, song]));
    const seenSongIds = new Set<string>();
    const seenQueueIds = new Set<string>();

    return storedItems.flatMap((item): QueueItem[] => {
      if (
        typeof item !== 'object' ||
        item === null ||
        !('queueId' in item) ||
        typeof item.queueId !== 'string' ||
        item.queueId.trim().length === 0 ||
        !('songId' in item) ||
        typeof item.songId !== 'string' ||
        !('singerName' in item) ||
        typeof item.singerName !== 'string' ||
        item.singerName.trim().length === 0 ||
        !('addedAt' in item) ||
        typeof item.addedAt !== 'number' ||
        !Number.isFinite(item.addedAt)
      ) {
        return [];
      }

      const song = songsById.get(item.songId);
      if (
        !song ||
        seenSongIds.has(song.id) ||
        seenQueueIds.has(item.queueId)
      ) {
        return [];
      }

      seenSongIds.add(song.id);
      seenQueueIds.add(item.queueId);
      return [{
        queueId: item.queueId,
        song,
        singerName: item.singerName,
        addedAt: item.addedAt,
      }];
    });
  } catch {
    return [];
  }
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs] = useState<Song[]>(DEFAULT_SONGS);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('library');
  const [currentSong, setCurrentSong] = useState<Song | null>(DEFAULT_SONGS[0] || null);
  const [queue, setQueue] = useState<QueueItem[]>(() => loadQueue(DEFAULT_SONGS));

  // Audio engine state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_SONGS[0]?.duration || 0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  // Persistent favorites from localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return new Set<string>(['myc-01']);
  });

  // Persistent view mode
  const [viewMode, setViewModeState] = useState<'grid' | 'table'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
      if (saved === 'grid' || saved === 'table') return saved;
    } catch {
      // ignore
    }
    return 'grid';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState<SortField>('title');
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Subscribe to audio engine updates
  useEffect(() => {
    const unsubscribe = globalAudioEngine.subscribe((status) => {
      setIsPlaying(status.isPlaying);
      setCurrentTime(status.currentTime);
      if (status.duration > 0) {
        setDuration(status.duration);
      }
      setVolumeState(status.volume);
      setIsMuted(status.muted);
      setAudioError(status.error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update active lyric index whenever currentTime or lyrics change
  useEffect(() => {
    if (lyrics.length === 0) {
      setActiveLyricIndex(-1);
      return;
    }
    const idx = defaultLyricParser.findActiveLineIndex(lyrics, currentTime);
    setActiveLyricIndex(idx);
  }, [currentTime, lyrics]);

  // Load song audio and fetch synchronized lyrics whenever currentSong changes
  const loadSongResources = useCallback(async (song: Song, autoPlay = false) => {
    // 1. Audio load
    setDuration(song.duration);
    setCurrentTime(0);
    await globalAudioEngine.load(song.audioPath, song.duration);

    // 2. Lyrics fetch & parse
    setLyricsLoading(true);
    setLyrics([]);
    try {
      const res = await fetch(safeEncodeURI(song.lyricsPath));
      if (res.ok) {
        const text = await res.text();
        const parsed = defaultLyricParser.parse(text);
        setLyrics(parsed.lines);
      } else {
        setLyrics([]);
      }
    } catch {
      setLyrics([]);
    } finally {
      setLyricsLoading(false);
    }

    if (autoPlay) {
      globalAudioEngine.play();
    }
  }, []);

  // Initial load of default song
  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (!initialLoadRef.current && currentSong) {
      initialLoadRef.current = true;
      loadSongResources(currentSong, false);
    }
  }, [currentSong, loadSongResources]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(favorites)));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      const storedQueue = queue.map(({ queueId, song, singerName, addedAt }) => ({
        queueId,
        songId: song.id,
        singerName,
        addedAt,
      }));
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(storedQueue));
    } catch {
      // ignore
    }
  }, [queue]);

  const setViewMode = (mode: 'grid' | 'table') => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
    } catch {
      // ignore
    }
  };

  const toggleFavorite = (songId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const isFavorite = (songId: string) => favorites.has(songId);

  const selectSongForStage = (song: Song, autoPlay = false) => {
    setCurrentSong(song);
    loadSongResources(song, autoPlay);
    setActiveScreen('player');
  };

  const addToQueue = (song: Song, singerName = 'Guest') => {
    const newItem: QueueItem = {
      queueId: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      song,
      singerName,
      addedAt: Date.now(),
    };
    setQueue((prev) => (
      prev.some((item) => item.song.id === song.id) ? prev : [...prev, newItem]
    ));
  };

  const removeFromQueue = (queueId: string) => {
    setQueue((prev) => prev.filter((item) => item.queueId !== queueId));
  };

  const moveQueueItem = (index: number, direction: 'up' | 'down') => {
    setQueue((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Playback control implementations
  const togglePlay = () => {
    if (isPlaying) {
      globalAudioEngine.pause();
    } else {
      globalAudioEngine.play();
    }
  };

  const play = () => {
    globalAudioEngine.play();
  };

  const pause = () => {
    globalAudioEngine.pause();
  };

  const seek = (time: number) => {
    globalAudioEngine.seek(time);
  };

  const setVolume = (vol: number) => {
    globalAudioEngine.setVolume(vol);
  };

  const toggleMute = () => {
    globalAudioEngine.toggleMute();
  };

  const playNext = () => {
    const nextItem = queue[0];
    if (!nextItem) return;

    setQueue((prev) => prev.slice(1));
    selectSongForStage(nextItem.song, true);
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      selectSongForStage(songs[prevIndex], true);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        songs,
        activeScreen,
        setActiveScreen,
        currentSong,
        selectSongForStage,
        queue,
        addToQueue,
        removeFromQueue,
        moveQueueItem,
        clearQueue,
        favorites,
        toggleFavorite,
        isFavorite,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        isQueueDrawerOpen,
        setIsQueueDrawerOpen,
        isSetupModalOpen,
        setIsSetupModalOpen,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        lyrics,
        lyricsLoading,
        activeLyricIndex,
        audioError,
        togglePlay,
        play,
        pause,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
