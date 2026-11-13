/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import MicroSlats from '../components/MicroSlats';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { AppHeader } from './components/layout/AppHeader';
import { PlayerBar } from './components/layout/PlayerBar';
import { SongLibrary } from './components/library/SongLibrary';
import { KaraokeStage } from './components/player/KaraokeStage';
import { QueueView } from './components/queue/QueueView';
import { LocalSetupModal } from './components/common/LocalSetupModal';

const AppContent: React.FC = () => {
  const {
    activeScreen,
    togglePlay,
    playNext,
    playPrevious,
    toggleMute,
    setVolume,
    volume,
  } = usePlayer();
  const controlsRef = useRef({ togglePlay, playNext, playPrevious, toggleMute, setVolume, volume });
  const [stageFullscreen, setStageFullscreen] = useState(false);
  controlsRef.current = { togglePlay, playNext, playPrevious, toggleMute, setVolume, volume };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const controls = controlsRef.current;
      if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) controls.togglePlay();
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (!event.repeat) controls.playNext();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        if (!event.repeat) controls.playPrevious();
      } else if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        if (!event.repeat) controls.toggleMute();
      } else if (event.code === 'ArrowUp') {
        event.preventDefault();
        controls.setVolume(Math.min(1, controls.volume + 0.05));
      } else if (event.code === 'ArrowDown') {
        event.preventDefault();
        controls.setVolume(Math.max(0, controls.volume - 0.05));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const updateFullscreen = () => setStageFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  return (
    <div className="relative isolate h-dvh overflow-hidden flex flex-col bg-[#090909] text-[#F5F5F5] selection:bg-amber-400 selection:text-black">
      {/* Animated background */}
      {!stageFullscreen && <div className="fixed inset-0 -z-10">
        <MicroSlats
          preset="swell"
          color="#3A3A3A"
          glintColor="#F5F5F5"
          backgroundColor="#000000"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          stretch={0}
          speed={0.6}
          scale={1.5}
          direction={250}
          chop={0.55}
          glint={0.7}
          contrast={1.25}
          perspective={0.55}
          fog={0.55}
          interactive={true}
          cursorStrength={1}
          cursorSize={40}
          trail={1.4}
          style={{}}
        />
      </div>}

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <AppHeader />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <main className={`w-full mx-auto py-4 sm:py-6 pb-6 ${
            activeScreen === 'library'
              ? 'max-w-[1600px] px-3 sm:px-4 lg:px-6'
              : 'max-w-7xl px-4 sm:px-6 lg:px-8'
          }`}>
            {activeScreen === 'library' && <SongLibrary />}
            {activeScreen === 'player' && <KaraokeStage />}
            {activeScreen === 'queue' && <QueueView />}
          </main>
        </div>

        <PlayerBar />
        <LocalSetupModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
