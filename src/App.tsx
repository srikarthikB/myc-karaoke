/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
    <div className="min-h-screen bg-[#0b0d12] text-[#f1f3f7] flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Bar Contract (Wordmark - Nav Links - Primary CTA) */}
      <AppHeader />

      {/* Main Viewport */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${activeScreen === 'player' ? 'pb-6' : 'pb-28'}`}>
        {activeScreen === 'library' && <SongLibrary />}
        {activeScreen === 'player' && <KaraokeStage />}
        {activeScreen === 'queue' && <QueueView />}
      </main>

      {/* Persistent Mini Player Bar across screens */}
      <PlayerBar />

      {/* Local Setup & Instructions Modal */}
      <LocalSetupModal />
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
