import React, { useState } from 'react';
import {
  Compass,
  CheckSquare,
  Users,
  Target,
  FileText,
  CalendarCheck,
  Settings,
  ChevronDown,
  Plus,
  ShieldAlert,
  FolderDot,
  PanelLeftClose,
  PanelLeft,
  Activity,
  UserPlus,
  Home,
  Briefcase,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab, Workspace } from '../../types';
import { AnimalAvatar } from '../avatars/AnimalAvatar';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    createWorkspace,
    joinWorkspace,
    openQuickCreate,
    tasks,
    goals,
    currentUser,
    signOut,
  } = useApp();

  const [createWsModalOpen, setCreateWsModalOpen] = useState(false);
  const [joinWsModalOpen, setJoinWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counters
  const teamTasksCount = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && !t.isPrivate && t.status !== 'done'
  ).length;

  const personalTasksCount = tasks.filter(
    (t) =>
      (t.workspaceId === activeWorkspace.id || t.creatorId === currentUser.id) &&
      (t.isPrivate || t.creatorId === currentUser.id) &&
      t.status !== 'done'
  ).length;

  const activeGoalsCount = goals.filter(
    (g) => g.workspaceId === activeWorkspace.id && !g.archived
  ).length;

  // Discord-inspired Navigation sections
  const navSections: {
    title: string;
    items: {
      id: ActiveTab;
      label: string;
      icon: React.ElementType;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'Core Workspace',
      items: [
        { id: 'home', label: 'Overview', icon: Compass },
        { id: 'task_board', label: 'Team Tasks', icon: CheckSquare, badge: teamTasksCount },
        { id: 'group_goals', label: 'Projects & Goals', icon: FolderDot, badge: activeGoalsCount },
      ],
    },
    {
      title: 'Individual Work',
      items: [
        { id: 'my_goals', label: 'Personal Tasks & Goals', icon: Target, badge: personalTasksCount },
        { id: 'notes', label: 'Notes & Docs', icon: FileText },
        { id: 'weekly_review', label: 'Weekly Reset', icon: CalendarCheck },
      ],
    },
    {
      title: 'Collaboration',
      items: [
        { id: 'team', label: 'Members & Roles', icon: Users },
        { id: 'activity', label: 'Activity Feed', icon: Activity },
      ],
    },
  ];

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createWorkspace(newWsName.trim(), newWsDesc.trim());
      setNewWsName('');
      setNewWsDesc('');
      setCreateWsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const ok = await joinWorkspace(inviteCode.trim());
      if (ok) {
        setInviteCode('');
        setJoinWsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Container: Rail + Sidebar */}
      <aside
        id="onboarding-workspace-nav"
        className={`fixed top-0 bottom-0 left-0 z-40 flex bg-[#FAF8F5] border-r border-[#E8E4DA] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ========================================================= */}
        {/* 1. DISCORD-STYLE WORKSPACE RAIL (FAR LEFT)                */}
        {/* ========================================================= */}
        <div className="w-18 bg-[#162A22] flex flex-col items-center py-4 gap-3 shrink-0 select-none z-10 border-r border-[#1E3A2F]">
          {/* Logo / Momentum Brand Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#1E3A2F] text-[#FAF8F5] flex items-center justify-center font-bold text-lg shadow-md mb-1 hover:rounded-xl transition-all cursor-pointer">
            <span className="font-display">M</span>
          </div>

          <div className="w-8 h-[1px] bg-white/15 my-0.5" />

          {/* Workspace Icons List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 w-full flex flex-col items-center py-1">
            {workspaces.map((ws, idx) => {
              const isActive = ws.id === activeWorkspace.id;
              const initials = ws.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={ws.id} className="relative group flex items-center justify-center w-full">
                  {/* Active Indicator Pill */}
                  <span
                    className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
                      isActive ? 'h-8' : 'h-2 opacity-0 group-hover:opacity-100 group-hover:h-5'
                    }`}
                  />

                  {/* Workspace Button */}
                  <button
                    onClick={() => setActiveWorkspace(ws.id)}
                    className={`w-12 h-12 flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-xs cursor-pointer ${
                      isActive
                        ? 'rounded-2xl bg-[#E7F0E8] text-[#162A22] shadow-sm'
                        : 'rounded-3xl hover:rounded-2xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                    title={ws.name}
                  >
                    {idx === 0 ? <Home size={18} /> : initials || 'WS'}
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute left-16 px-2.5 py-1 bg-[#1C221F] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {ws.name}
                  </div>
                </div>
              );
            })}

            {/* Add / Join Workspace Button */}
            <div className="relative group flex items-center justify-center w-full pt-1">
              <button
                onClick={() => setCreateWsModalOpen(true)}
                className="w-12 h-12 rounded-3xl hover:rounded-2xl bg-white/10 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                title="Create or Join Workspace"
              >
                <Plus size={20} />
              </button>
              <div className="absolute left-16 px-2.5 py-1 bg-[#1C221F] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Add Workspace
              </div>
            </div>
          </div>

          {/* User Animal Avatar at the bottom of the rail */}
          <div className="mt-auto pt-2 border-t border-white/10 flex flex-col items-center">
            <button
              onClick={() => setActiveTab('settings')}
              className="relative group p-1 rounded-2xl hover:bg-white/10 transition-colors"
              title="Profile & Settings"
            >
              <AnimalAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                size={40}
                showBadge
                status="online"
              />
              <div className="absolute left-16 bottom-2 px-2.5 py-1 bg-[#1C221F] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {currentUser.name} • Settings
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. WORKSPACE SECTIONS SIDEBAR                             */}
        {/* ========================================================= */}
        <div className="w-56 flex flex-col h-full bg-[#FAF8F5] select-none">
          {/* Workspace Header */}
          <div className="h-16 px-4 border-b border-[#E8E4DA] flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm text-[#1C221F] truncate font-display">
                {activeWorkspace.name}
              </h2>
              <span className="text-[10px] text-[#737C76] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Momentum Space
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md text-[#737C76] hover:bg-[#F2EFE9]"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          </div>

          {/* Workspace Action Buttons (Invite / Join) */}
          <div className="px-3 pt-3 pb-1 flex gap-2">
            <button
              onClick={() => setJoinWsModalOpen(true)}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-[#F2EFE9] border border-[#E8E4DA] rounded-xl text-[11px] font-semibold text-[#1E3A2F] flex items-center justify-center gap-1 transition-colors shadow-2xs"
            >
              <UserPlus size={12} />
              <span>Join via Code</span>
            </button>
          </div>

          {/* Nav Items Grouped */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#8E9892]">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1E3A2F] text-white shadow-2xs'
                          : 'text-[#5C6560] hover:text-[#1C221F] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-[#737C76]'} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#E8E4DA] text-[#5C6560]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Profile Bar */}
          <div className="p-3 border-t border-[#E8E4DA] bg-white flex items-center justify-between">
            <div
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            >
              <AnimalAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                size={32}
                showBadge
                status="online"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1C221F] truncate group-hover:text-[#1E3A2F]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#737C76] truncate">
                  {currentUser.title || 'Contributor'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-1.5 rounded-lg text-[#737C76] hover:text-[#1C221F] hover:bg-[#FAF8F5] transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* CREATE WORKSPACE MODAL                                    */}
      {/* ========================================================= */}
      {createWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#1C221F]">Create Team Workspace</h3>
            <p className="text-xs text-[#737C76] mt-1">
              Start a shared space to organize tasks, goals, and team members.
            </p>

            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Acme Engineering or Growth Crew"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="What is this workspace focused on?"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateWsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C6560] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl hover:bg-[#162A22] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating…' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* JOIN WORKSPACE MODAL                                      */}
      {/* ========================================================= */}
      {joinWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#1C221F]">Join Workspace via Invitation</h3>
            <p className="text-xs text-[#737C76] mt-1">
              Enter the invitation code provided by your workspace admin.
            </p>

            <form onSubmit={handleJoinWorkspace} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Invitation Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste invitation code here..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DA] text-[11px] text-[#737C76] flex items-center gap-2">
                <Lock size={14} className="text-[#1E3A2F] shrink-0" />
                <span>You will join as a team member. Admins can assign project roles later.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinWsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C6560] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteCode.trim()}
                  className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl hover:bg-[#162A22] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining…' : 'Join Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
