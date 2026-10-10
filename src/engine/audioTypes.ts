/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AudioEngineStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  error: string | null;
}

/**
 * Interface defining the future audio playback engine.
 * UI components interact with this abstract interface rather than
 * raw HTMLAudioElement instances.
 */
export interface IAudioEngine {
  load(src: string): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(timeInSeconds: number): void;
  setVolume(volume: number): void;
  setPlaybackRate(rate: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getStatus(): AudioEngineStatus;
  dispose(): void;
}
