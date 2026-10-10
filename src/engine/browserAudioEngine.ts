/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioEngineStatus, IAudioEngine } from './audioTypes';

export type AudioEventCallback = (status: AudioEngineStatus) => void;

export function safeEncodeURI(uri: string): string {
  try {
    return encodeURI(decodeURI(uri));
  } catch {
    return encodeURI(uri);
  }
}

export class BrowserAudioEngine implements IAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string = '';
  private status: AudioEngineStatus = {
    isLoaded: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    error: null,
  };
  private listeners: Set<AudioEventCallback> = new Set();
  private simulatedTimer: number | null = null;
  private isSimulatingTime = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.attachListeners();
    }
  }

  private attachListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      this.isSimulatingTime = false;
      this.status.isLoaded = true;
      this.status.duration = this.audio?.duration || this.status.duration;
      this.status.error = null;
      this.notify();
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSimulatingTime && this.audio) {
        this.status.currentTime = this.audio.currentTime;
        this.notify();
      }
    });

    this.audio.addEventListener('play', () => {
      this.status.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.status.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      this.status.isPlaying = false;
      this.stopSimulation();
      this.notify();
    });

    this.audio.addEventListener('error', () => {
      // Audio file not found or unsupported
      this.status.isLoaded = false;
      this.status.error = 'Audio track not found in /public/audio/';
      this.notify();
    });
  }

  public subscribe(cb: AudioEventCallback): () => void {
    this.listeners.add(cb);
    cb(this.getStatus());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const s = this.getStatus();
    this.listeners.forEach((cb) => cb(s));
  }

  public async load(src: string, fallbackDuration = 0): Promise<void> {
    this.stopSimulation();
    this.currentSrc = src;
    this.status.currentTime = 0;
    this.status.duration = fallbackDuration;
    this.status.isPlaying = false;
    this.status.error = null;

    if (!this.audio) return;

    this.audio.pause();
    this.audio.src = safeEncodeURI(src);
    this.audio.load();
    this.notify();
  }

  public async play(): Promise<void> {
    if (!this.audio) return;

    try {
      await this.audio.play();
      this.status.isPlaying = true;
      this.status.error = null;
      this.notify();
    } catch {
      // If audio file doesn't exist on disk yet, smoothly run simulation timer so UI controls & lyrics work
      this.isSimulatingTime = true;
      this.status.isPlaying = true;
      this.startSimulation();
      this.notify();
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.status.isPlaying = false;
    this.stopSimulation();
    this.notify();
  }

  public seek(timeInSeconds: number): void {
    const target = Math.max(0, Math.min(timeInSeconds, this.status.duration || 9999));
    this.status.currentTime = target;

    if (this.audio && !this.isSimulatingTime) {
      try {
        this.audio.currentTime = target;
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  public setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    this.status.volume = v;
    if (this.audio) {
      this.audio.volume = v;
    }
    this.notify();
  }

  public toggleMute(): void {
    this.status.muted = !this.status.muted;
    if (this.audio) {
      this.audio.muted = this.status.muted;
    }
    this.notify();
  }

  public setPlaybackRate(rate: number): void {
    this.status.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.notify();
  }

  public getCurrentTime(): number {
    return this.status.currentTime;
  }

  public getDuration(): number {
    return this.status.duration;
  }

  public getStatus(): AudioEngineStatus {
    return { ...this.status };
  }

  private startSimulation() {
    this.stopSimulation();
    let lastTime = performance.now();

    this.simulatedTimer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (this.status.isPlaying) {
        this.status.currentTime += delta;
        if (this.status.duration > 0 && this.status.currentTime >= this.status.duration) {
          this.status.currentTime = this.status.duration;
          this.pause();
        }
        this.notify();
      }
    }, 100);
  }

  private stopSimulation() {
    if (this.simulatedTimer !== null) {
      clearInterval(this.simulatedTimer);
      this.simulatedTimer = null;
    }
  }

  public dispose(): void {
    this.stopSimulation();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.listeners.clear();
  }
}

export const globalAudioEngine = new BrowserAudioEngine();
