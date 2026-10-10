/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILyricParser, LyricLine, ParsedLyrics } from './lyricTypes';

export class LyricParser implements ILyricParser {
  /**
   * Parse a raw .lrc string into structured ParsedLyrics
   */
  parse(rawLrc: string): ParsedLyrics {
    const lines: LyricLine[] = [];
    const meta: { [key: string]: string } = {};

    if (!rawLrc || typeof rawLrc !== 'string') {
      return { lines: [] };
    }

    const rawLines = rawLrc.split(/\r?\n/);
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      // Check metadata tags e.g. [ti:Title]
      const metaMatch = line.match(/^\[([a-zA-Z]+):(.*)\]$/);
      if (metaMatch && !/^\d/.test(metaMatch[1])) {
        meta[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
        continue;
      }

      // Find all timestamps in this line
      const timestamps: { time: number; raw: string }[] = [];
      let match: RegExpExecArray | null;
      timeRegex.lastIndex = 0;

      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const fractions = match[3] ? parseFloat(`0.${match[3]}`) : 0;
        const totalSeconds = minutes * 60 + seconds + fractions;

        timestamps.push({
          time: totalSeconds,
          raw: match[0].replace(/[\[\]]/g, ''),
        });
      }

      // The text after all timestamps
      const text = line.replace(timeRegex, '').trim();

      if (timestamps.length > 0 && text) {
        for (const ts of timestamps) {
          lines.push({
            id: `line-${ts.time.toFixed(2)}-${Math.random().toString(36).substring(2, 6)}`,
            time: ts.time,
            rawTime: ts.raw,
            text,
          });
        }
      }
    }

    // Sort chronologically
    lines.sort((a, b) => a.time - b.time);

    return {
      title: meta['ti'],
      artist: meta['ar'],
      album: meta['al'],
      by: meta['by'],
      offsetMs: meta['offset'] ? parseInt(meta['offset'], 10) : 0,
      lines,
    };
  }

  /**
   * Find index of active line for given current playback time
   */
  findActiveLineIndex(lines: LyricLine[], currentTime: number, leadOffsetSeconds = 0.2): number {
    if (!lines || lines.length === 0) return -1;

    const adjustedTime = currentTime + leadOffsetSeconds;

    // If before first line
    if (adjustedTime < lines[0].time) {
      return 0;
    }

    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const next = lines[i + 1];

      if (adjustedTime >= current.time && (!next || adjustedTime < next.time)) {
        return i;
      }
    }

    return lines.length - 1;
  }
}

export const defaultLyricParser = new LyricParser();
