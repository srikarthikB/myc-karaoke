/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioEngineStatus, IAudioEngine } from './audioTypes';

export type AudioEventCallback = (status: AudioEngineStatus) => void;
export type AudioEndedCallback = () => void;
export interface AudioFrequencyBands {
  bass: number;
  mid: number;
  treble: number;
}

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
  private endedListeners: Set<AudioEndedCallback> = new Set();
  private simulatedTimer: number | null = null;
  private isSimulatingTime = false;
  private loadGeneration = 0;
  private endedGeneration = -1;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;

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
      if (!this.audio?.ended) return;
      this.status.isPlaying = false;
      this.stopSimulation();
      this.notify();
      this.notifyEnded();
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

  public subscribeEnded(cb: AudioEndedCallback): () => void {
    this.endedListeners.add(cb);
    return () => {
      this.endedListeners.delete(cb);
    };
  }

  private notify() {
    const s = this.getStatus();
    this.listeners.forEach((cb) => cb(s));
  }

  private notifyEnded() {
    if (this.endedGeneration === this.loadGeneration) return;
    this.endedGeneration = this.loadGeneration;
    this.endedListeners.forEach((cb) => cb());
  }

  public async load(src: string, fallbackDuration = 0): Promise<void> {
    this.stopSimulation();
    this.isSimulatingTime = false;
    this.loadGeneration += 1;
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
      this.ensureAnalyser();
      if (this.audioContext?.state === 'suspended') await this.audioContext.resume();
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

  private ensureAnalyser() {
    if (!this.audio || this.mediaSource || typeof AudioContext === 'undefined') return;
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.72;
      this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      this.mediaSource = this.audioContext.createMediaElementSource(this.audio);
      this.mediaSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch {
      // Keep playback available if Web Audio analysis is unavailable.
      this.analyser = null;
      this.frequencyData = null;
    }
  }

  /** Read normalized frequency-band levels from the one active media element. */
  public getFrequencyBands(): AudioFrequencyBands {
    if (!this.status.isPlaying || this.isSimulatingTime || !this.analyser || !this.frequencyData) {
      return { bass: 0, mid: 0, treble: 0 };
    }
    this.analyser.getByteFrequencyData(this.frequencyData);
    const average = (start: number, end: number) => {
      let sum = 0;
      for (let i = start; i < end; i++) sum += this.frequencyData![i];
      const raw = sum / Math.max(1, end - start) / 255;
      // Calibrate the byte spectrum against a broad music range. The previous
      // narrow range saturated on ordinary playback, hiding band-to-band changes.
      const normalized = Math.max(0, Math.min(1, (raw - 0.1) / 0.62));
      return Math.pow(normalized, 0.85);
    };
    return {
      bass: average(1, 9),
      mid: average(9, 56),
      treble: average(56, 190),
    };
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
          this.status.isPlaying = false;
          this.isSimulatingTime = false;
          this.stopSimulation();
          this.notify();
          this.notifyEnded();
          return;
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
    this.mediaSource?.disconnect();
    this.analyser?.disconnect();
    void this.audioContext?.close();
    this.mediaSource = null;
    this.analyser = null;
    this.audioContext = null;
    this.frequencyData = null;
    this.listeners.clear();
    this.endedListeners.clear();
  }
}

export const globalAudioEngine = new BrowserAudioEngine();
