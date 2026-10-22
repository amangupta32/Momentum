import React, { useState } from 'react';
import { Palette, Check, RotateCcw, X, Sparkles } from 'lucide-react';

export interface BoardTheme {
  id: string;
  name: string;
  category: 'solid' | 'gradient' | 'pattern';
  previewStyle: React.CSSProperties;
  boardStyle: React.CSSProperties;
  darkCards?: boolean;
}

export const BOARD_THEMES: BoardTheme[] = [
  // Default
  {
    id: 'default',
    name: 'Default Clean',
    category: 'solid',
    previewStyle: { backgroundColor: '#FAF8F5' },
    boardStyle: { backgroundColor: '#FAF8F5' },
  },
  // Solid Colors
  {
    id: 'solid-forest',
    name: 'Forest Slate',
    category: 'solid',
    previewStyle: { backgroundColor: '#1E3A2F' },
    boardStyle: { backgroundColor: '#1E3A2F' },
    darkCards: true,
  },
  {
    id: 'solid-navy',
    name: 'Midnight Navy',
    category: 'solid',
    previewStyle: { backgroundColor: '#0F172A' },
    boardStyle: { backgroundColor: '#0F172A' },
    darkCards: true,
  },
  {
    id: 'solid-terracotta',
    name: 'Terracotta',
    category: 'solid',
    previewStyle: { backgroundColor: '#7C2D12' },
    boardStyle: { backgroundColor: '#7C2D12' },
    darkCards: true,
  },
  {
    id: 'solid-plum',
    name: 'Royal Plum',
    category: 'solid',
    previewStyle: { backgroundColor: '#581C87' },
    boardStyle: { backgroundColor: '#581C87' },
    darkCards: true,
  },
  {
    id: 'solid-sage',
    name: 'Soft Sage',
    category: 'solid',
    previewStyle: { backgroundColor: '#E2EBE5' },
    boardStyle: { backgroundColor: '#E2EBE5' },
  },

  // Soft Gradients
  {
    id: 'grad-sunset',
    name: 'Sunset Glow',
    category: 'gradient',
    previewStyle: { background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 50%, #FDBA74 100%)' },
    boardStyle: { background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)' },
  },
  {
    id: 'grad-aurora',
    name: 'Northern Light',
    category: 'gradient',
    previewStyle: { background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)' },
    boardStyle: { background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #0F172A 100%)' },
    darkCards: true,
  },
  {
    id: 'grad-ocean',
    name: 'Ocean Breeze',
    category: 'gradient',
    previewStyle: { background: 'linear-gradient(135deg, #0284C7 0%, #0F172A 100%)' },
    boardStyle: { background: 'linear-gradient(135deg, #0369A1 0%, #075985 50%, #0F172A 100%)' },
    darkCards: true,
  },
  {
    id: 'grad-dusk',
    name: 'Dusk Velvet',
    category: 'gradient',
    previewStyle: { background: 'linear-gradient(135deg, #312E81 0%, #581C87 100%)' },
    boardStyle: { background: 'linear-gradient(135deg, #312E81 0%, #4C1D95 50%, #581C87 100%)' },
    darkCards: true,
  },
  {
    id: 'grad-lavender',
    name: 'Morning Mist',
    category: 'gradient',
    previewStyle: { background: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)' },
    boardStyle: { background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #E9D5FF 100%)' },
  },

  // Patterns
  {
    id: 'pattern-dots',
    name: 'Minimalist Dots',
    category: 'pattern',
    previewStyle: {
      backgroundColor: '#FAF8F5',
      backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
      backgroundSize: '16px 16px',
    },
    boardStyle: {
      backgroundColor: '#FAF8F5',
      backgroundImage: 'radial-gradient(#B8B0A0 1.5px, transparent 1.5px)',
      backgroundSize: '24px 24px',
    },
  },
  {
    id: 'pattern-grid',
    name: 'Blueprint Grid',
    category: 'pattern',
    previewStyle: {
      backgroundColor: '#0F172A',
      backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '16px 16px',
    },
    boardStyle: {
      backgroundColor: '#0F172A',
      backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    },
    darkCards: true,
  },
  {
    id: 'pattern-topography',
    name: 'Zen Lines',
    category: 'pattern',
    previewStyle: {
      backgroundColor: '#F1F5F9',
      backgroundImage: 'repeating-linear-gradient(45deg, #E2E8F0 0, #E2E8F0 1px, transparent 0, transparent 12px)',
    },
    boardStyle: {
      backgroundColor: '#F8FAFC',
      backgroundImage: 'repeating-linear-gradient(45deg, #E2E8F0 0, #E2E8F0 1.5px, transparent 0, transparent 20px)',
    },
  },
];

export function getBoardTheme(themeId: string | null | undefined): BoardTheme {
  const match = BOARD_THEMES.find((t) => t.id === themeId);
  return match || BOARD_THEMES[0];
}

interface BoardBackgroundPickerProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export const BoardBackgroundPicker: React.FC<BoardBackgroundPickerProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'solid' | 'gradient' | 'pattern'>('all');

  const filteredThemes =
    activeTab === 'all' ? BOARD_THEMES : BOARD_THEMES.filter((t) => t.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E7F0E8] text-[#1E3A2F] flex items-center justify-center">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[#1C221F] text-sm">Board Background</h3>
              <p className="text-xs text-[#737C76]">Customize the mood of your task board</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737C76] hover:bg-[#F2EFE9] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-1 border-b border-[#E8E4DA] flex items-center gap-2 bg-[#FAF8F5]/50">
          {(['all', 'solid', 'gradient', 'pattern'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[#1E3A2F] text-white shadow-2xs'
                  : 'text-[#737C76] hover:text-[#1C221F] hover:bg-white'
              }`}
            >
              {tab === 'all' ? 'All Styles' : `${tab}s`}
            </button>
          ))}

          <button
            onClick={() => onSelectTheme('default')}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs text-[#737C76] hover:text-[#1E3A2F] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E8E4DA]"
            title="Reset to default background"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Swatches Grid */}
        <div className="p-5 overflow-y-auto max-h-[380px] grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredThemes.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className={`group relative rounded-xl border-2 transition-all p-1 text-left flex flex-col gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-[#1E3A2F] ring-2 ring-[#1E3A2F]/20 shadow-md scale-[1.02]'
                    : 'border-[#E8E4DA] hover:border-[#1E3A2F]/50 hover:shadow-xs'
                }`}
              >
                <div
                  className="w-full h-18 rounded-lg relative overflow-hidden border border-black/5 flex items-center justify-center transition-transform group-hover:scale-101"
                  style={theme.previewStyle}
                >
                  {/* Miniature columns preview */}
                  <div className="flex gap-1.5 opacity-60">
                    <div className="w-5 h-10 rounded bg-white/70 shadow-2xs" />
                    <div className="w-5 h-8 rounded bg-white/70 shadow-2xs" />
                    <div className="w-5 h-12 rounded bg-white/70 shadow-2xs" />
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#1E3A2F]/25 flex items-center justify-center backdrop-blur-2xs">
                      <div className="w-6 h-6 rounded-full bg-[#1E3A2F] text-white flex items-center justify-center shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1C221F] truncate">{theme.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#737C76]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#1E3A2F]" />
            High readability guaranteed on all themes
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E3A2F] text-white rounded-lg font-medium hover:bg-[#162A22] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
