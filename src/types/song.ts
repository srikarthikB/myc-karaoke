/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SongDifficulty = 'Casual' | 'Moderate' | 'Demanding';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  originalArtist?: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "3:42"
  genre: string;
  year: number;
  vocalKey: string; // e.g. "C Major", "F# Minor"
  difficulty: SongDifficulty;
  bpm?: number;
  tags: string[];
  audioPath: string; // relative to /public e.g. "/audio/track_01.mp3"
  lyricsPath: string; // relative to /public e.g. "/lyrics/track_01.lrc"
  hasBackingVocals?: boolean;
  notes?: string;
}

export interface SongCatalogue {
  version: string;
  updatedAt: string;
  songs: Song[];
}

export interface QueueItem {
  queueId: string;
  song: Song;
  singerName: string; // who holds the mic
  addedAt: number;
}

export type ActiveScreen = 'library' | 'player' | 'queue';
