import React, { useState } from 'react';
import {
  Compass,
  CheckSquare,
  Target,
  Users,
  LayoutGrid,
  FileText,
  Flame,
  CalendarCheck,
  Settings,
  ChevronDown,
  Plus,
  ShieldAlert,
  FolderDot,
  PanelLeftClose,
  PanelLeft,
  Activity,
  PlusCircle,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

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
    streakDays,
    tasks,
    goals,
    blockersSummary,
  } = useApp();

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [createWsModalOpen, setCreateWsModalOpen] = useState(false);
  const [joinWsModalOpen, setJoinWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counter metrics
  const activeTasksCount = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.status !== 'done'
  ).length;

  const activeGoalsCount = goals.filter(
    (g) => g.workspaceId === activeWorkspace.id && !g.archived
  ).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'home', label: 'My Day / Overview', icon: Compass },
    { id: 'my_goals', label: 'Personal Goals', icon: Target },
    { id: 'group_goals', label: 'Group Goals', icon: FolderDot, badge: activeGoalsCount },
    { id: 'task_board', label: 'Task Board', icon: CheckSquare, badge: activeTasksCount },
    { id: 'commitment_wall', label: 'Commitment Wall', icon: LayoutGrid },
    {
      id: 'blocker_radar',
      label: 'Blocker Radar',
      icon: ShieldAlert,
      badge: blockersSummary.totalBlockers > 0 ? blockersSummary.totalBlockers : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    { id: 'notes', label: 'Notes & Docs', icon: FileText },
    { id: 'team', label: 'Team Workspace', icon: Users },
    { id: 'activity', label: 'Activity Feed', icon: Activity },
    { id: 'weekly_review', label: 'Weekly Reset', icon: CalendarCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    } catch {
      // Error handled by showToast in AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const success = await joinWorkspace(inviteCode.trim());
      if (success) {
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
          className="fixed inset-0 bg-black/25 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#FAF8F5] border-r border-[#E8E4DA] flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-18'
        }`}
      >
        {/* Workspace Switcher Header */}
        <div className="h-16 px-4 border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F2EFE9] transition-colors text-left group"
              title="Switch Workspace"
            >
              <div className="w-8 h-8 rounded-md bg-[#1E3A2F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                M
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs tracking-wide uppercase text-[#737C76]">
                    Workspace
                  </div>
                  <div className="text-sm font-medium text-[#1C221F] truncate flex items-center gap-1">
                    <span className="truncate">{activeWorkspace.name}</span>
                    <ChevronDown size={14} className="text-[#8E9892] shrink-0" />
                  </div>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {workspaceDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setWorkspaceDropdownOpen(false)}
                />
                <div className="absolute top-12 left-0 w-64 bg-white rounded-xl shadow-lg border border-[#E8E4DA] p-1.5 z-30 animate-scale-in">
                  <div className="text-[11px] font-semibold text-[#8E9892] px-2.5 py-1 uppercase tracking-wider">
                    Switch Workspace
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspace(ws.id);
                          setWorkspaceDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          ws.id === activeWorkspace.id
                            ? 'bg-[#F2EFE9] text-[#1E3A2F] font-semibold'
                            : 'text-[#4A524D] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ws.color }}
                          />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {ws.id === activeWorkspace.id && (
                          <span className="text-[10px] bg-[#1E3A2F] text-white px-1.5 py-0.5 rounded font-mono">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#E8E4DA] mt-1 pt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setWorkspaceDropdownOpen(false);
                        setCreateWsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1E3A2F] hover:bg-[#F2EFE9] transition-colors"
                    >
                      <PlusCircle size={14} />
                      <span>Create New Workspace</span>
                    </button>
                    <button
                      onClick={() => {
                        setWorkspaceDropdownOpen(false);
                        setJoinWsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5C6560] hover:bg-[#F2EFE9] transition-colors"
                    >
                      <UserPlus size={14} />
                      <span>Join with Code</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-md text-[#737C76] hover:text-[#1C221F] hover:bg-[#F2EFE9] transition-colors shrink-0"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        {/* Quick Action Button */}
        {sidebarOpen ? (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => openQuickCreate()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-medium rounded-lg shadow-xs transition-all duration-150 active:scale-[0.98]"
            >
              <Plus size={15} />
              <span>Quick Create</span>
            </button>
          </div>
        ) : (
          <div className="p-2 flex justify-center">
            <button
              onClick={() => openQuickCreate()}
              className="w-10 h-10 rounded-lg bg-[#1E3A2F] text-white flex items-center justify-center hover:bg-[#162A22] shadow-xs transition-all"
              title="Quick Create"
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#EAE6DC] text-[#1E3A2F] font-semibold shadow-xs'
                    : 'text-[#4A524D] hover:bg-[#F3EFE7] hover:text-[#1C221F]'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={isActive ? 'text-[#1E3A2F]' : 'text-[#737C76] shrink-0'}
                />
                {sidebarOpen && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {sidebarOpen && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium border ${
                      item.badgeColor || 'bg-[#E2DDD3] text-[#4A524D] border-[#D6D0C2]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Momentum Streak Badge */}
        <div className="p-3 border-t border-[#E8E4DA] bg-[#F5F2EA]">
          <div
            onClick={() => setActiveTab('settings')}
            className={`cursor-pointer rounded-lg p-2.5 bg-white border border-[#E8E4DA] shadow-xs flex items-center gap-2.5 hover:border-[#1E3A2F]/30 transition-all ${
              !sidebarOpen ? 'justify-center p-2' : ''
            }`}
            title="Momentum Streak Details"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Flame size={18} className="fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-[#737C76] flex items-center justify-between">
                  <span>Streak</span>
                  <span className="font-semibold text-amber-700">{streakDays} Days</span>
                </div>
                <div className="text-[10px] text-[#8E9892] truncate">
                  Daily deliberate execution
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CREATE WORKSPACE MODAL */}
      {createWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setCreateWsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <h3 className="text-lg font-bold text-[#1C221F]">Create Workspace</h3>
              <button
                onClick={() => setCreateWsModalOpen(false)}
                className="p-1 rounded-lg text-[#8E9892] hover:bg-[#FAF8F5]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Growth Team or Core Product"
                  className="w-full px-3 py-2 text-xs border border-[#E8E4DA] rounded-xl focus:outline-none focus:border-[#1E3A2F]"
                  required
                  minLength={2}
                  maxLength={80}
                  autoFocus
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
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4DA] rounded-xl focus:outline-none focus:border-[#1E3A2F] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateWsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C6560] hover:bg-[#FAF8F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-[#1E3A2F] hover:bg-[#162A22] text-white rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating…' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN WORKSPACE MODAL */}
      {joinWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setJoinWsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <h3 className="text-lg font-bold text-[#1C221F]">Join a Workspace</h3>
              <button
                onClick={() => setJoinWsModalOpen(false)}
                className="p-1 rounded-lg text-[#8E9892] hover:bg-[#FAF8F5]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleJoinWorkspace} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C221F] mb-1">
                  Invitation Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste your invitation code here"
                  className="w-full px-3 py-2 text-xs font-mono border border-[#E8E4DA] rounded-xl focus:outline-none focus:border-[#1E3A2F]"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-[#737C76] mt-1.5">
                  Ask your workspace owner or admin for an invite code.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinWsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5C6560] hover:bg-[#FAF8F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteCode.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-[#1E3A2F] hover:bg-[#162A22] text-white rounded-xl disabled:opacity-50"
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
