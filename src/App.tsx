import { useState, useEffect } from 'react';
import { AppMode, RetroTheme } from './types/math';
import { Header } from './components/Header';
import { PracticeMode } from './components/PracticeMode';
import { MockTestMode } from './components/MockTestMode';
import { HandbookModal } from './components/HandbookModal';
import { sound } from './utils/sound';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('practice');
  const [theme, setTheme] = useState<RetroTheme>('amber');
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);

  // Initialize preferences
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('radical_theme') as RetroTheme;
      if (savedTheme && ['amber', 'green', 'blue', 'paper'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      const savedScanlines = localStorage.getItem('radical_scanlines');
      if (savedScanlines !== null) {
        setScanlines(savedScanlines === 'true');
      }
      setIsMuted(sound.getMuted());
    } catch {
      // Ignore localStorage exceptions
    }
  }, []);

  const handleSelectTheme = (newTheme: RetroTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('radical_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  const handleToggleScanlines = () => {
    const nextVal = !scanlines;
    setScanlines(nextVal);
    try {
      localStorage.setItem('radical_scanlines', String(nextVal));
    } catch {
      // Ignore
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHandbookOpen) {
        setIsHandbookOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHandbookOpen]);

  return (
    <div className={`min-h-screen flex flex-col font-mono theme-${theme} relative text-[var(--color-text,#fef3c7)]`} style={{ backgroundColor: 'var(--color-bg,#120e06)' }}>
      {/* Optional CRT Scanlines Overlay */}
      {scanlines && <div className="fixed inset-0 z-40 scanlines-overlay pointer-events-none" />}

      {/* Top Header Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        theme={theme}
        onSelectTheme={handleSelectTheme}
        scanlines={scanlines}
        onToggleScanlines={handleToggleScanlines}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHandbook={() => setIsHandbookOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 relative z-10 crt-screen">
        {currentMode === 'practice' && (
          <PracticeMode onOpenHandbook={() => setIsHandbookOpen(true)} />
        )}

        {currentMode === 'mock-test' && (
          <MockTestMode
            onSwitchToPractice={() => setCurrentMode('practice')}
            onOpenHandbook={() => setIsHandbookOpen(true)}
          />
        )}
      </main>

      {/* Rules Handbook Reference Modal */}
      <HandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />

      {/* Retro Microcomputer Chassis Footer */}
      <footer 
        className="border-t-2 py-3 px-4 text-xs font-mono select-none"
        style={{ borderColor: 'var(--color-border,#78350f)', backgroundColor: 'var(--color-surface,#1c150c)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[var(--color-text-dim,#b45309)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--color-primary,#f59e0b)]">RADICAL-OS //</span>
            <span>OPERATIONS OF RADICALS MATHEMATICS REVIEWER</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>STATIC SINGLE-PAGE APP</span>
            <span>·</span>
            <span>GITHUB PAGES READY</span>
            <span>·</span>
            <button
              onClick={() => setIsHandbookOpen(true)}
              className="hover:text-[var(--color-primary-bright,#fbbf24)] underline"
            >
              FORMULA HANDBOOK
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
