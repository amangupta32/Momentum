import React, { useState } from 'react';
import {
  Users,
  Target,
  Flame,
  Layers,
  ArrowRight,
  UserPlus,
  Copy,
  Check,
  X,
  Shield,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';
import { MemberProfileModal } from './MemberProfileModal';

export const TeamView: React.FC = () => {
  const {
    users,
    tasks,
    goals,
    activeWorkspace,
    workspaceMembers,
    setSelectedTaskId,
    setSelectedGoalId,
    currentUser,
    createInvitation,
    showToast,
  } = useApp();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUser.id);
  const [profileModalMember, setProfileModalMember] = useState<typeof currentUser | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedMember = users.find((u) => u.id === selectedMemberId) || users[0] || currentUser;

  // Workspace tasks assigned to this member (shared team tasks only)
  const memberTasks = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.assigneeId === selectedMember.id && !t.isPrivate
  );

  const pendingTasks = memberTasks.filter((t) => t.status !== 'done');
  const completedTasks = memberTasks.filter((t) => t.status === 'done');

  // Goals owned by member
  const memberGoals = goals.filter(
    (g) => g.ownerId === selectedMember.id && !g.archived
  );

  const getMemberRole = (userId: string): string => {
    if (activeWorkspace.ownerId === userId) return 'Owner';
    const mem = workspaceMembers.find((m) => m.userId === userId);
    if (!mem) return 'Member';
    return mem.role.charAt(0).toUpperCase() + mem.role.slice(1);
  };

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const code = await createInvitation(72, 10);
      setGeneratedCode(code);
      setInviteModalOpen(true);
    } catch {
      showToast('Could not create invitation', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    showToast('Invitation code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <Users size={14} className="text-[#1E3A2F]" />
            <span>Team Workspaces & Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Team Members & Workloads
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Transparent workloads, shared accountability, and individual contributions in {activeWorkspace.name}.
          </p>
        </div>

        <button
          onClick={handleGenerateInvite}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl transition-all shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <UserPlus size={15} />
          <span>{isGenerating ? 'Generating…' : 'Invite Teammate'}</span>
        </button>
      </div>

      {/* Grid: Member Roster on Left, Detail Workload on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Members Roster: 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E8E4DA] p-4 shadow-2xs space-y-2">
          <div className="text-[11px] font-semibold text-[#8E9892] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Workspace Members ({users.length})</span>
            <span className="text-[10px] text-[#1E3A2F] font-mono">{activeWorkspace.name}</span>
          </div>

          <div className="space-y-1">
            {users.map((member) => {
              const activeCount = tasks.filter(
                (t) => t.workspaceId === activeWorkspace.id && t.assigneeId === member.id && !t.isPrivate && t.status !== 'done'
              ).length;

              const isSelected = selectedMember.id === member.id;
              const roleTitle = getMemberRole(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`cursor-pointer p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FAF8F5] border-[#1E3A2F] shadow-xs'
                      : 'border-[#E8E4DA] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AnimalAvatar
                      avatar={member.avatar}
                      name={member.name}
                      size={36}
                      showBadge
                      status="online"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#1C221F] truncate flex items-center gap-1.5">
                        <span className="truncate">{member.name}</span>
                        {member.id === currentUser.id && (
                          <span className="text-[9px] bg-[#1E3A2F] text-white px-1.5 py-0.2 rounded font-mono">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5C6560] truncate flex items-center gap-1.5">
                        <span className="truncate">{member.title}</span>
                        <span>•</span>
                        <span className="text-[#1E3A2F] font-medium">{roleTitle}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      activeCount > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                        : 'bg-[#F2EFE9] text-[#8E9892] border-transparent'
                    }`}
                  >
                    {activeCount} active
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Profile & Assigned Work: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AnimalAvatar
                  avatar={selectedMember.avatar}
                  name={selectedMember.name}
                  size={56}
                  showBadge
                  status="online"
                  className="ring-2 ring-[#1E3A2F]"
                />
                <div>
                  <h2 className="text-xl font-bold text-[#1C221F] font-display">
                    {selectedMember.name}
                  </h2>
                  <div className="text-xs text-[#5C6560] mt-0.5 font-medium flex items-center gap-1.5">
                    <span>{selectedMember.title}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[#1E3A2F] font-semibold">
                      <Shield size={12} /> {getMemberRole(selectedMember.id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-amber-700 mt-1 font-semibold">
                    <Flame size={13} className="fill-amber-500 text-amber-500" />
                    <span>{selectedMember.streakDays} Day Momentum Streak</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProfileModalMember(selectedMember)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl transition-colors shadow-xs"
                >
                  Full Profile & Tasks
                </button>
              </div>
            </div>

            {selectedMember.bio && (
              <p className="text-xs text-[#5C6560] pt-2 border-t border-[#E8E4DA] leading-relaxed">
                "{selectedMember.bio}"
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DA]">
                <div className="text-xl font-bold text-[#1C221F]">{pendingTasks.length}</div>
                <div className="text-[11px] text-[#737C76]">Pending Team Tasks</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-xl font-bold text-emerald-800">{completedTasks.length}</div>
                <div className="text-[11px] text-emerald-700">Completed in Team</div>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DA]">
                <div className="text-xl font-bold text-[#1C221F]">{memberGoals.length}</div>
                <div className="text-[11px] text-[#737C76]">Goals Owned</div>
              </div>
            </div>
          </div>

          {/* Assigned Team Tasks Section */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1C221F]">
                  Shared Team Tasks ({memberTasks.length})
                </h3>
                <p className="text-xs text-[#737C76] flex items-center gap-1 mt-0.5">
                  <Lock size={11} className="text-[#1E3A2F]" />
                  <span>Personal private tasks are isolated and not shown to teammates</span>
                </p>
              </div>
            </div>

            {memberTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8E9892] border border-dashed border-[#E8E4DA] rounded-xl">
                No shared team tasks currently assigned to {selectedMember.name}.
              </div>
            ) : (
              <div className="space-y-2">
                {memberTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="p-3 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:shadow-2xs transition-all flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          task.status === 'done'
                            ? 'bg-emerald-500'
                            : task.status === 'in_progress'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span
                        className={`font-semibold truncate ${
                          task.status === 'done' ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {task.dueDate && (
                        <span className="text-[11px] text-[#8E9892] flex items-center gap-1">
                          <Clock size={11} />
                          <span>{task.dueDate}</span>
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#5C6560] border border-[#E8E4DA]">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Profile Modal */}
      {profileModalMember && (
        <MemberProfileModal
          member={profileModalMember}
          memberInfo={workspaceMembers.find((m) => m.userId === profileModalMember.id)}
          onClose={() => setProfileModalMember(null)}
        />
      )}

      {/* Invitation Modal */}
      {inviteModalOpen && generatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DA]">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#1E3A2F]" />
                <h3 className="font-bold text-sm text-[#1C221F]">Team Invitation Code</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[#8E9892] hover:text-[#1C221F]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#5C6560]">
              Share this code with teammates to grant access to{' '}
              <strong className="text-[#1C221F]">{activeWorkspace.name}</strong>. Valid for 72 hours.
            </p>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DA] flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-[#1E3A2F] tracking-wider break-all select-all">
                {generatedCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-[#1E3A2F] hover:bg-[#162A22] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[11px] text-[#737C76] bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
              <strong>Security Policy:</strong> Joining members are granted standard Member role. Workspace Owners & Admins can assign project responsibilities later.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-semibold text-[#1C221F] rounded-xl border border-[#E8E4DA]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
