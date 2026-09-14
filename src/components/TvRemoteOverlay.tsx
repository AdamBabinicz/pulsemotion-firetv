import React, { useState } from 'react';
import { Tv, ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Language, ThemeMode, translations } from '../data/translations';

interface TvRemoteOverlayProps {
  onPrev: () => void;
  onNext: () => void;
  onAction: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  lang: Language;
  theme: ThemeMode;
}

export const TvRemoteOverlay: React.FC<TvRemoteOverlayProps> = ({
  onPrev,
  onNext,
  onAction,
  onToggleSound,
  isMuted,
  lang,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Remote Mini Trigger */}
      <button
        id="btn-open-remote"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-2xl backdrop-blur-md transition-all text-xs font-semibold ${
          isDark
            ? 'bg-neutral-900/95 hover:bg-neutral-800 text-neutral-200 border-neutral-700'
            : 'bg-white/95 hover:bg-neutral-100 text-neutral-800 border-neutral-300 shadow-lg'
        }`}
      >
        <Tv className="w-4 h-4 text-emerald-500" />
        <span>{isOpen ? t.hideRemote : t.showRemote}</span>
      </button>

      {/* Floating D-PAD Remote Drawer */}
      {isOpen && (
        <div
          className={`absolute bottom-12 right-0 w-64 p-4 rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            isDark
              ? 'bg-neutral-900 border-neutral-700 text-white'
              : 'bg-white border-neutral-300 text-neutral-900'
          }`}
        >
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              {t.tvRemoteTitle}
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              D-PAD
            </span>
          </div>

          {/* D-Pad Buttons */}
          <div
            className={`w-36 h-36 relative flex items-center justify-center rounded-full border p-2 shadow-inner ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
            }`}
          >
            {/* Left Button */}
            <button
              id="remote-btn-left"
              onClick={onPrev}
              className={`absolute left-2 p-2.5 rounded-full active:scale-90 transition-all ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white hover:bg-neutral-200 text-neutral-800 shadow-sm'
              }`}
              title="Left / Prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Center OK / Action Button */}
            <button
              id="remote-btn-ok"
              onClick={onAction}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-95 transition-all"
              title="OK / Action"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>

            {/* Right Button */}
            <button
              id="remote-btn-right"
              onClick={onNext}
              className={`absolute right-2 p-2.5 rounded-full active:scale-90 transition-all ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                  : 'bg-white hover:bg-neutral-200 text-neutral-800 shadow-sm'
              }`}
              title="Right / Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="w-full grid grid-cols-2 gap-2 mt-3">
            <button
              id="remote-btn-mute"
              onClick={onToggleSound}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
              {isMuted ? t.soundMuted : t.soundActive}
            </button>

            <button
              id="remote-btn-reset"
              onClick={onAction}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.resetBtn}
            </button>
          </div>

          {/* Keyboard Hints */}
          <div
            className={`mt-3 pt-2 border-t w-full text-[10px] flex flex-col gap-1 ${
              isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'
            }`}
          >
            <div className="flex justify-between">
              <span>{t.navHint}:</span>
              <span className={`font-mono ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>← / →</span>
            </div>
            <div className="flex justify-between">
              <span>{t.confirmHint}:</span>
              <span className={`font-mono ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>Space / Enter</span>
            </div>
            <div className="flex justify-between">
              <span>{t.muteHint}:</span>
              <span className={`font-mono ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>M</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
