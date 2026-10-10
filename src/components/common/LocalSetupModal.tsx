/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Terminal, FolderCheck, Music, Check, Copy } from 'lucide-react';

export const LocalSetupModal: React.FC = () => {
  const { isSetupModalOpen, setIsSetupModalOpen } = usePlayer();
  const [copied, setCopied] = useState<string | null>(null);

  if (!isSetupModalOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#242424] border border-white/[0.12] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.12]">
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              Running myc on Your Windows Laptop
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Local-first karaoke without cloud subscriptions or accounts
            </p>
          </div>
          <button
            onClick={() => setIsSetupModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Start Commands */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Terminal className="w-4 h-4" />
            <span>1. Launch App Locally (PowerShell or Terminal)</span>
          </div>
          <p className="text-xs text-neutral-300">
            In your project directory, run:
          </p>
          <div className="relative bg-[#111111] border border-white/[0.12] rounded-xl p-3 font-mono text-xs text-neutral-200">
            <code>npm install && npm run dev</code>
            <button
              onClick={() => copyToClipboard('npm install && npm run dev', 'cmd')}
              className="absolute right-3 top-2.5 p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
              title="Copy command"
            >
              {copied === 'cmd' ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">
            Open <span className="text-amber-300 font-mono">http://localhost:3000</span> in Chrome, Edge, or Firefox.
          </p>
        </div>

        {/* Step 2: Adding the 5 Audio Files */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <FolderCheck className="w-4 h-4" />
            <span>2. Where to Place Your 5 Instrumental Tracks</span>
          </div>
          <p className="text-xs text-neutral-300">
            Copy your instrumental audio files into the project&apos;s <code className="text-amber-300 font-mono">/public/audio/</code> folder:
          </p>
          <div className="bg-[#111111] border border-white/[0.12] rounded-xl p-3 font-mono text-xs text-neutral-300 space-y-1">
            <p className="text-neutral-500"># Place audio files in public/audio/</p>
            <p className="text-neutral-300">public/audio/The A Team.mp3</p>
            <p className="text-neutral-300">public/audio/Drunk.mp3</p>
            <p className="text-neutral-300">public/audio/Lego House.mp3</p>
            <p className="text-neutral-300">public/audio/You Need Me, I Don't Need You.mp3</p>
            <p className="text-neutral-300">public/audio/BLOW.mp3</p>
          </div>
        </div>

        {/* Step 3: Placing LRC Lyrics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <Music className="w-4 h-4" />
            <span>3. Synchronized .lrc Lyrics</span>
          </div>
          <p className="text-xs text-neutral-300">
            Place matching timestamped <code className="text-amber-300 font-mono">.lrc</code> lyric files in <code className="text-amber-300 font-mono">/public/lyrics/</code>.
          </p>
          <div className="bg-[#111111] border border-white/[0.12] rounded-xl p-3 font-mono text-xs text-neutral-300 space-y-1">
            <p className="text-neutral-500"># Standard LRC timestamp format:</p>
            <p>[00:14.20] Just a small town girl</p>
            <p>[00:18.05] Livin' in a lonely world</p>
            <p>[00:22.10] She took the midnight train goin' anywhere</p>
          </div>
        </div>

        {/* Step 4: Song Catalogue Mapping */}
        <div className="p-4 rounded-xl bg-[#1B1B1B] border border-white/[0.12] text-xs text-neutral-300 space-y-1.5">
          <p className="font-semibold text-white">Configuring Metadata & Titles</p>
          <p className="text-neutral-400">
            Song titles, artists, vocal keys, genres, and notes can be edited directly in <code className="text-amber-300 font-mono">src/data/songs.json</code>. No backend or database required.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.12] flex items-center justify-end">
          <button
            onClick={() => setIsSetupModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
