/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LyricLine {
  id: string;
  time: number; // in seconds, e.g. 14.25
  rawTime: string; // e.g. "00:14.25"
  text: string;
}

export interface ParsedLyrics {
  title?: string;
  artist?: string;
  album?: string;
  by?: string;
  offsetMs?: number;
  lines: LyricLine[];
}

export interface ILyricParser {
  parse(rawLrc: string): ParsedLyrics;
  findActiveLineIndex(lines: LyricLine[], currentTime: number, leadOffsetSeconds?: number): number;
}
