import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  ChevronRight,
  CheckCheck,
  Flame,
  ExternalLink,
  Users,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';

interface TopBarProps {
  onToggleMembers?: () => void;
  membersPanelOpen?: boolean;
  onReplayOnboarding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMembers,
  membersPanelOpen = false,
  onReplayOnboarding,
}) => {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    setSearchOpen,
    openQuickCreate,
    activeWorkspace,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
    signOut,
    streakDays,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabLabels: Record<string, string> = {
    home: 'Overview',
    my_goals: 'Personal Tasks & Goals',
    group_goals: 'Projects & Goals',
    task_board: 'Team Tasks',
    commitment_wall: 'Commitment Wall',
    blocker_radar: 'Blocker Radar',
    notes: 'Notes & Docs',
    team: 'Members & Roles',
    activity: 'Activity Feed',
    weekly_review: 'Weekly Reset',
    settings: 'Settings & Profile',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DA] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-[#5C6560] hover:text-[#1C221F] hover:bg-[#F2EFE9] transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium min-w-0">
          <span className="text-[#8E9892] truncate hidden sm:inline">
            {activeWorkspace.name}
          </span>
          <ChevronRight size={13} className="text-[#B8B0A0] shrink-0 hidden sm:inline" />
          <span className="text-[#1C221F] font-semibold truncate">
            {tabLabels[activeTab] || 'Overview'}
          </span>
        </nav>
      </div>

      {/* Right: Search, Quick-Create, Notifications, Member Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E8E4DA] text-[#737C76] hover:border-[#1E3A2F]/40 hover:text-[#1C221F] text-xs transition-all shadow-2xs group"
          title="Search workspace (Cmd+K)"
        >
          <Search size={14} className="group-hover:text-[#1E3A2F]" />
          <span className="hidden md:inline text-left w-32 truncate">Search workspace...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#8E9892] bg-[#FAF8F5] border border-[#E8E4DA] rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick create button with onboarding ID */}
        <button
          id="onboarding-create-btn"
          onClick={() => openQuickCreate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A2F] text-white text-xs font-semibold hover:bg-[#162A22] transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
          title="Create a task, goal, or note"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Create</span>
        </button>

        {/* Toggle Discord-style Member Sidebar */}
        {onToggleMembers && (
          <button
            onClick={onToggleMembers}
            className={`p-2 rounded-xl border transition-all ${
              membersPanelOpen
                ? 'bg-[#E7F0E8] text-[#1E3A2F] border-[#CDE0D0]'
                : 'bg-white text-[#5C6560] border-[#E8E4DA] hover:text-[#1C221F] hover:bg-[#FAF8F5]'
            }`}
            title="Toggle Team Members panel"
          >
            <Users size={17} />
          </button>
        )}

        {/* Tour / Replay Onboarding Button */}
        {onReplayOnboarding && (
          <button
            onClick={onReplayOnboarding}
            className="p-2 rounded-xl bg-white border border-[#E8E4DA] text-[#5C6560] hover:text-[#1C221F] hover:bg-[#FAF8F5] transition-all"
            title="Interactive App Tour"
          >
            <HelpCircle size={17} />
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-xl bg-white text-[#5C6560] hover:text-[#1C221F] border border-[#E8E4DA] hover:bg-[#FAF8F5] transition-all"
            aria-label="View notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-0 z-30 animate-in fade-in overflow-hidden">
                <div className="p-3 border-b border-[#E8E4DA] flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1C221F]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-[#1E3A2F] hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F2EFE9]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8E9892]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markNotificationAsRead(item.id);
                          if (item.linkTab) {
                            setActiveTab(item.linkTab as any);
                            setNotificationsOpen(false);
                          }
                        }}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[#FAF8F5] flex items-start gap-2.5 ${
                          !item.read ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <span
                          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            !item.read ? 'bg-emerald-600' : 'bg-[#D6D0C2]'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#1C221F] flex items-center justify-between">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[10px] text-[#8E9892] ml-2 shrink-0">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C6560] mt-0.5 line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Pill with Cartoon Animal Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-full hover:bg-white border border-transparent hover:border-[#E8E4DA] transition-all cursor-pointer"
            title="User Profile & Settings"
          >
            <AnimalAvatar
              avatar={currentUser.avatar}
              name={currentUser.name}
              size={32}
              showBadge
              status="online"
            />
            <span className="text-xs font-semibold text-[#1C221F] hidden md:inline truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-4 z-30 animate-in fade-in">
                {/* User card */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DA]">
                  <AnimalAvatar
                    avatar={currentUser.avatar}
                    name={currentUser.name}
                    size={46}
                    showBadge
                    status="online"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#1C221F] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-[#737C76] truncate">{currentUser.email}</div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium mt-1">
                      <Flame size={12} className="fill-amber-500 text-amber-500" />
                      <span>{streakDays} Day Momentum Streak</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between text-left px-2.5 py-2 text-xs font-medium text-[#4A524D] hover:bg-[#FAF8F5] rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Settings size={14} />
                      Profile & Animal Avatar
                    </span>
                    <ChevronRight size={13} className="text-[#8E9892]" />
                  </button>
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        await signOut();
                      } catch {
                        /* Ignore */
                      }
                    }}
                    className="w-full flex items-center justify-between text-left px-2.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <span>Sign out</span>
                    <ExternalLink size={13} className="text-rose-500" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
