import React, { useState } from 'react';
import type { User } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MemberSidebar } from './components/layout/MemberSidebar';
import { MemberProfileModal } from './components/team/MemberProfileModal';
import { InteractiveOnboarding } from './components/onboarding/InteractiveOnboarding';
import { Toaster } from './components/layout/Toaster';
import { SearchModal } from './components/modals/SearchModal';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { GoalDetailModal } from './components/goals/GoalDetailModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { GoalsView } from './components/goals/GoalsView';
import { TaskBoardView } from './components/tasks/TaskBoardView';
import { CommitmentWallView } from './components/commitment/CommitmentWallView';
import { BlockerRadarView } from './components/blockers/BlockerRadarView';
import { NotesView } from './components/notes/NotesView';
import { TeamView } from './components/team/TeamView';
import { ActivityView } from './components/activity/ActivityView';
import { WeeklyReviewView } from './components/review/WeeklyReviewView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthGate } from './components/auth/AuthGate';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    sidebarOpen,
    onboardingCompleted,
    setOnboardingCompleted,
    restartOnboarding,
    selectedMemberForProfile,
    setSelectedMemberForProfile,
    membersPanelOpen,
    toggleMembersPanel,
    setMembersPanelOpen,
    openQuickCreate,
  } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'my_goals':
        return <GoalsView type="personal" />;
      case 'group_goals':
        return <GoalsView type="group" />;
      case 'task_board':
        return <TaskBoardView />;
      case 'commitment_wall':
        return <CommitmentWallView />;
      case 'blocker_radar':
        return <BlockerRadarView />;
      case 'notes':
        return <NotesView />;
      case 'team':
        return <TeamView />;
      case 'activity':
        return <ActivityView />;
      case 'weekly_review':
        return <WeeklyReviewView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C221F] flex flex-col font-sans selection:bg-[#1E3A2F] selection:text-white">
      {/* Discord-inspired Left Rail & Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-[296px]' : 'lg:pl-[72px]'
        }`}
      >
        <TopBar
          onToggleMembers={toggleMembersPanel}
          membersPanelOpen={membersPanelOpen}
          onReplayOnboarding={restartOnboarding}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Active View Container */}
          <main className="flex-1 overflow-y-auto pb-16">{renderActiveView()}</main>

          {/* Discord-style Right Member Panel */}
          <MemberSidebar
            isOpen={membersPanelOpen}
            onClose={() => setMembersPanelOpen(false)}
            onSelectMember={(member) => setSelectedMemberForProfile(member)}
            onInvite={() => openQuickCreate('task')}
          />
        </div>
      </div>

      {/* Member Profile Drawer Modal */}
      {selectedMemberForProfile && (
        <MemberProfileModal
          member={selectedMemberForProfile}
          onClose={() => setSelectedMemberForProfile(null)}
        />
      )}

      {/* Interactive Onboarding Tour (First-time users only) */}
      <InteractiveOnboarding
        completed={onboardingCompleted}
        onComplete={() => setOnboardingCompleted(true)}
      />

      {/* Global Modals & Dialogs */}
      <SearchModal />
      <QuickCreateModal />
      <GoalDetailModal />
      <TaskDetailModal />
      <Toaster />
    </div>
  );
};

export default function App() {
  return (
    <AuthGate>
      {(identity, signOut) => {
        const user: User = {
          id: identity.id,
          name: identity.name,
          email: identity.email,
          avatar: identity.avatar,
          role: 'Member',
          title: identity.title,
          bio: identity.bio,
          streakDays: 0,
        };
        return (
          <AppProvider initialUser={user} signOut={signOut}>
            <MainLayout />
          </AppProvider>
        );
      }}
    </AuthGate>
  );
}
