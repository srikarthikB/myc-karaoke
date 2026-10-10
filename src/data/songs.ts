/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import songData from './songs.json';
import { Song, SongCatalogue } from '../types/song';

export const INITIAL_CATALOGUE: SongCatalogue = songData as SongCatalogue;

export const DEFAULT_SONGS: Song[] = INITIAL_CATALOGUE.songs;

/**
 * Unique list of genres present in the catalogue
 */
export const AVAILABLE_GENRES = [
  'All Genres',
  ...Array.from(new Set(DEFAULT_SONGS.map((s) => s.genre))),
];
