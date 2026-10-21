import React, { useState } from 'react';
import { Download, Settings, ShieldCheck, UserRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const { activeWorkspace, currentUser, signOut, tasks, goals, notes, refreshData, showToast } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      account: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
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
      <div className="pb-3 border-b border-[#E8E4DA]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
          <Settings size={14} />
          <span>Account & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] mt-2">Settings</h1>
        <p className="text-sm text-[#5C6560] mt-1">Manage your Momentum account, cloud synchronization, and personal data.</p>
      </div>

      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E7F0E8] text-[#1E3A2F] flex items-center justify-center font-bold text-lg">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserRound size={22} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#1C221F]">{currentUser.name}</h2>
            <p className="text-sm text-[#737C76] truncate">{currentUser.email || 'Supabase Authenticated'}</p>
          </div>
          <span className="text-xs rounded-full bg-[#E7F0E8] text-[#1E3A2F] px-2.5 py-1 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} /> Signed In
          </span>
        </div>

        <div className="mt-5 border-t border-[#EEEAE2] pt-4 flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Synchronizing…' : 'Sync with Cloud'}</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DA] hover:bg-[#FAF8F5] text-sm font-medium rounded-xl transition-colors"
          >
            <Download size={15} />
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
            className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#284f3e] text-white text-sm font-medium rounded-xl transition-colors ml-auto"
          >
            Sign Out
          </button>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E8E4DA] p-5 sm:p-6 shadow-2xs">
        <div className="flex gap-3">
          <ShieldCheck className="text-[#2B7555] shrink-0" size={21} />
          <div>
            <h2 className="font-semibold text-[#1C221F]">Cloud Synchronization & Row-Level Security</h2>
            <p className="text-sm text-[#66716A] mt-1 leading-relaxed">
              {isSupabaseConfigured ? (
                <>
                  Your Momentum account is connected to Supabase PostgreSQL. Goals, tasks, notes, team memberships, and activities are backed by PostgreSQL Row Level Security (RLS). Private goals and private tasks are cryptographically isolated so only you can access them.
                </>
              ) : (
                <>
                  Supabase publishable key is pending in <code>.env.local</code>. Authentication and local caching are operational. Once you add your publishable key, cloud syncing and real-time multiplayer updates will activate automatically.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
