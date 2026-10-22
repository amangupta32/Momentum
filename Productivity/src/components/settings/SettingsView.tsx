import React, { useState } from 'react';
import {
  Download,
  Settings,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Palette,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../services/supabase';
import {
  AnimalAvatar,
  AvatarPicker,
  AnimalType,
  parseAnimalId,
} from '../avatars/AnimalAvatar';
import {
  BoardBackgroundPicker,
  getBoardTheme,
} from '../tasks/BoardBackgroundPicker';

export const SettingsView: React.FC = () => {
  const {
    activeWorkspace,
    currentUser,
    updateUserProfile,
    boardBackground,
    setBoardBackground,
    restartOnboarding,
    setActiveTab,
    signOut,
    tasks,
    goals,
    notes,
    refreshData,
    showToast,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title || 'Contributor');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>(
    parseAnimalId(currentUser.avatar) || 'lion'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [boardPickerOpen, setBoardPickerOpen] = useState(false);

  const currentTheme = getBoardTheme(boardBackground);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Display name cannot be empty.', 'warning');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateUserProfile(name.trim(), selectedAnimal, title.trim(), bio.trim());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      showToast('Could not save profile settings.', 'warning');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast('Data synchronized with Supabase cloud.', 'success');
    } catch {
      showToast('Refresh failed. Please check connection.', 'warning');
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      },
      workspace: activeWorkspace,
      goals,
      tasks,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momentum-${activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Your workspace data was exported.', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E8E4DA]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
          <Settings size={14} className="text-[#1E3A2F]" />
          <span>Account & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] mt-1 font-display">
          Settings & Profile
        </h1>
        <p className="text-sm text-[#5C6560] mt-1">
          Customize your personal animal avatar, display name, workspace mood, and cloud settings.
        </p>
      </div>

      {/* 1. PERSONAL ANIMAL AVATAR & PROFILE */}
      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEEAE2]">
          <div>
            <h2 className="font-bold text-base text-[#1C221F]">Personal Animal Avatar & Identity</h2>
            <p className="text-xs text-[#737C76] mt-0.5">
              Choose your representative animal avatar and custom display name.
            </p>
          </div>
          <span className="text-xs rounded-full bg-[#E7F0E8] text-[#1E3A2F] px-2.5 py-1 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} /> Active
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Picker Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#737C76] mb-3">
              Select Your Animal Avatar
            </label>
            <AvatarPicker selected={selectedAnimal} onSelect={setSelectedAnimal} />
          </div>

          {/* Name & Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                required
                minLength={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden"
              />
              <p className="text-[11px] text-[#8E9892] mt-1">
                Shown on dashboards, task cards, and team member lists.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Designer or Project Manager"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden"
              />
              <p className="text-[11px] text-[#8E9892] mt-1">
                Your role or focus area in this workspace.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C221F] mb-1">
              Personal Bio / Moto (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A brief note about your goals or focus..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#737C76]">
              Avatar & name persist to Supabase across all devices.
            </span>
            <button
              type="submit"
              disabled={isSavingProfile || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {profileSaved ? (
                <>
                  <Check size={14} />
                  <span>Saved!</span>
                </>
              ) : isSavingProfile ? (
                <span>Saving…</span>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. TASK BOARD CUSTOMIZATION */}
      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7F0E8] text-[#1E3A2F] flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1C221F]">Task Board Background</h2>
              <p className="text-xs text-[#737C76] mt-0.5">
                Current theme: <strong className="text-[#1C221F]">{currentTheme.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setBoardPickerOpen(true)}
            className="px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors"
          >
            Customize Board
          </button>
        </div>

        {/* Small preview card */}
        <div
          className="w-full h-16 rounded-xl border border-black/5 overflow-hidden flex items-center justify-center shadow-inner"
          style={currentTheme.boardStyle}
        >
          <div className="flex gap-2 opacity-70">
            <div className="w-8 h-8 rounded bg-white/80 shadow-xs" />
            <div className="w-8 h-8 rounded bg-white/80 shadow-xs" />
            <div className="w-8 h-8 rounded bg-white/80 shadow-xs" />
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE ONBOARDING TOUR */}
      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#1C221F]">Interactive App Guide</h2>
            <p className="text-xs text-[#737C76] mt-0.5">
              Replay the contextual onboarding tour explaining core actions and buttons.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            restartOnboarding();
            setActiveTab('home');
          }}
          className="px-4 py-2 bg-[#1E3A2F] text-white hover:bg-[#162A22] text-xs font-semibold rounded-xl transition-colors shadow-2xs"
        >
          Replay Tour
        </button>
      </section>

      {/* 4. ADVANCED TOOLS — BLOCKER RADAR */}
      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#1C221F]">Blocker Radar</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  Advanced Tool
                </span>
              </div>
              <p className="text-xs text-[#737C76] mt-0.5">
                Heuristic diagnostics for overdue milestones, at-risk tasks, and team bottlenecks.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('blocker_radar')}
            className="px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors"
          >
            Launch Radar
          </button>
        </div>
      </section>

      {/* 5. CLOUD SYNCHRONIZATION & DATA BACKUP */}
      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex gap-3">
          <ShieldCheck className="text-[#2B7555] shrink-0" size={22} />
          <div>
            <h2 className="font-semibold text-[#1C221F]">
              Cloud Synchronization & Row-Level Security
            </h2>
            <p className="text-xs sm:text-sm text-[#66716A] mt-1 leading-relaxed">
              {isSupabaseConfigured ? (
                <>
                  Your Momentum account is connected to Supabase PostgreSQL. Goals, tasks, notes,
                  team memberships, and activities are backed by PostgreSQL Row Level Security
                  (RLS). Private goals and personal tasks are cryptographically isolated.
                </>
              ) : (
                <>
                  Supabase publishable key is pending in <code>.env.local</code>. Authentication and
                  local caching are operational.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-[#EEEAE2] pt-4 flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Synchronizing…' : 'Sync with Cloud'}</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs font-semibold rounded-xl transition-colors"
          >
            <Download size={14} />
            <span>Export Workspace Data</span>
          </button>
          <button
            onClick={async () => {
              try {
                await signOut();
              } catch {
                showToast('Could not sign out. Please try again.', 'warning');
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors ml-auto"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Board Background Picker Modal */}
      {boardPickerOpen && (
        <BoardBackgroundPicker
          currentThemeId={boardBackground}
          onSelectTheme={(id) => {
            setBoardBackground(id);
          }}
          onClose={() => setBoardPickerOpen(false)}
        />
      )}
    </div>
  );
};
