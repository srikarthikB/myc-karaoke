/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MicroSlats from '../components/MicroSlats';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { AppHeader } from './components/layout/AppHeader';
import { PlayerBar } from './components/layout/PlayerBar';
import { SongLibrary } from './components/library/SongLibrary';
import { KaraokeStage } from './components/player/KaraokeStage';
import { QueueView } from './components/queue/QueueView';
import { LocalSetupModal } from './components/common/LocalSetupModal';

const AppContent: React.FC = () => {
  const { activeScreen } = usePlayer();

  return (
    <div className="relative isolate h-dvh overflow-hidden flex flex-col bg-[#090909] text-[#F5F5F5] selection:bg-amber-400 selection:text-black">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
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
      </div>

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
