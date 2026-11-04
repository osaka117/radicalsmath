import React from 'react';
import { AppMode, RetroTheme } from '../types/math';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Eye, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  theme: RetroTheme;
  onSelectTheme: (theme: RetroTheme) => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHandbook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  theme,
  onSelectTheme,
  scanlines,
  onToggleScanlines,
  isMuted,
  onToggleMute,
  onOpenHandbook,
}) => {
  const handleNav = (mode: AppMode) => {
    sound.playSwitch();
    onSelectMode(mode);
  };

  const handleHandbookClick = () => {
    sound.playClick();
    onOpenHandbook();
  };

  const handleThemeChange = (newTheme: RetroTheme) => {
    sound.playClick();
    onSelectTheme(newTheme);
  };

  const themes: { id: RetroTheme; label: string; previewColor: string }[] = [
    { id: 'amber', label: 'Amber CRT', previewColor: '#f59e0b' },
    { id: 'green', label: 'Phosphor Green', previewColor: '#22c55e' },
    { id: 'blue', label: 'DOS Electric', previewColor: '#38bdf8' },
    { id: 'paper', label: 'Paper Lab', previewColor: '#786f63' },
  ];

  return (
    <header className="border-b-2 select-none" style={{ borderColor: 'var(--color-border, #78350f)', backgroundColor: 'var(--color-surface, #1c150c)' }}>
      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span 
              className="text-2xl sm:text-3xl font-extrabold tracking-wider"
              style={{ fontFamily: 'var(--term-font-pixel)', color: 'var(--color-primary-bright, #fbbf24)' }}
            >
              RADICAL-OS
            </span>
            <span className="hidden sm:inline-block text-xs font-mono opacity-60 text-[var(--color-text-dim,#b45309)]">
              v2.4 [REV]
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-6 font-mono text-xs sm:text-sm">
          <button
            onClick={() => handleNav('practice')}
            className={`px-2.5 py-1 transition-all whitespace-nowrap shrink-0 border ${
              currentMode === 'practice'
                ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                : 'text-[var(--color-text,#fef3c7)] border-transparent hover:border-[var(--color-border,#78350f)]'
            }`}
          >
            PRACTICE MODE
          </button>

          <button
            onClick={() => handleNav('mock-test')}
            className={`px-2.5 py-1 transition-all whitespace-nowrap shrink-0 border ${
              currentMode === 'mock-test'
                ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                : 'text-[var(--color-text,#fef3c7)] border-transparent hover:border-[var(--color-border,#78350f)]'
            }`}
          >
            MOCK TEST
          </button>

          <button
            onClick={handleHandbookClick}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-primary-bright,#fbbf24)] transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>RULES HANDBOOK</span>
          </button>
        </nav>

        {/* Zone 3: Primary Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={handleHandbookClick}
            className="md:hidden p-1.5 border border-[var(--color-border,#78350f)] text-xs text-[var(--color-primary-bright,#fbbf24)]"
            title="Open Rules Handbook"
            aria-label="Open Rules Handbook"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleScanlines();
            }}
            className={`p-1.5 sm:px-2 sm:py-1 border text-xs font-mono flex items-center gap-1 transition-colors ${
              scanlines
                ? 'border-[var(--color-primary,#f59e0b)] text-[var(--color-primary-bright,#fbbf24)] bg-black/20'
                : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)]'
            }`}
            title="Toggle CRT Scanline Overlay"
            aria-label="Toggle CRT Scanlines"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{scanlines ? 'CRT: ON' : 'CRT: OFF'}</span>
          </button>

          {/* Retro Audio Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            className={`p-1.5 sm:px-2 sm:py-1 border text-xs font-mono flex items-center gap-1 transition-colors ${
              !isMuted
                ? 'border-[var(--color-primary,#f59e0b)] text-[var(--color-primary-bright,#fbbf24)] bg-black/20'
                : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)]'
            }`}
            title={isMuted ? 'Unmute 8-Bit Audio' : 'Mute 8-Bit Audio'}
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isMuted ? 'MUTE' : 'AUDIO'}</span>
          </button>

          {/* Theme Dropdown / Selector */}
          <div className="flex items-center gap-1 pl-1 border-l border-[var(--color-border,#78350f)]">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`w-5 h-5 rounded-none border transition-transform ${
                  theme === t.id
                    ? 'border-white scale-110 shadow-xs'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.previewColor }}
                title={`Switch to ${t.label} theme`}
                aria-label={`Switch to ${t.label} theme`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sub-strip: Retro Computer System Breadcrumb */}
      <div 
        className="px-4 py-1 text-[11px] font-mono border-t flex items-center justify-between text-[var(--color-text-dim,#b45309)]"
        style={{ borderColor: 'var(--color-border,#78350f)', backgroundColor: 'var(--color-bg,#120e06)' }}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-[var(--color-primary-bright,#fbbf24)]">SYSTEM //</span>
          <span>OPERATIONS OF RADICALS CURRICULUM</span>
          <span className="hidden sm:inline">· NO COMPREHENSION LIMITS</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span>STATIC SPA ENGINE</span>
          <span className="hidden sm:inline">· PURE CLIENT MATHEMATICS</span>
        </div>
      </div>
    </header>
  );
};
