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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    setCurrentUser,
    createInvitation,
    showToast,
  } = useApp();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUser.id);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedMember = users.find((u) => u.id === selectedMemberId) || users[0] || currentUser;

  // Workspace tasks assigned to this member
  const memberTasks = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.assigneeId === selectedMember.id
  );

  const pendingTasks = memberTasks.filter((t) => t.status !== 'done');
  const completedTasks = memberTasks.filter((t) => t.status === 'done');

  // Goals owned by member
  const memberGoals = goals.filter(
    (g) => g.ownerId === selectedMember.id && !g.archived
  );

  const getMemberRole = (userId: string): string => {
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
            <span>Team Responsibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Who is Doing What?
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Transparent workloads, shared accountability, and individual contributions in {activeWorkspace.name}.
          </p>
        </div>

        <button
          onClick={handleGenerateInvite}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-xl transition-all shadow-xs self-start sm:self-auto shrink-0"
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
                (t) => t.workspaceId === activeWorkspace.id && t.assigneeId === member.id && t.status !== 'done'
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
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#1E3A2F]/20"
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

          {users.length === 1 && (
            <div className="p-3 text-center text-xs text-[#737C76] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA] mt-3">
              <p className="font-medium text-[#1C221F]">You're currently solo</p>
              <p className="text-[11px] mt-0.5">Click "Invite Teammate" to share goals and tasks with your team.</p>
            </div>
          )}
        </div>

        {/* Member Profile & Assigned Work: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1E3A2F]"
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

              {selectedMember.id !== currentUser.id && (
                <button
                  onClick={() => setCurrentUser(selectedMember.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#1E3A2F] bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#E8E4DA] rounded-xl transition-colors shrink-0"
                >
                  View as this Member
                </button>
              )}
            </div>

            {selectedMember.bio && (
              <p className="text-xs text-[#5C6560] pt-2 border-t border-[#E8E4DA] leading-relaxed">
                "{selectedMember.bio}"
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DA]">
                <div className="text-base font-bold text-[#1C221F] font-mono">
                  {pendingTasks.length}
                </div>
                <div className="text-[10px] text-[#8E9892] uppercase font-semibold mt-0.5">
                  Tasks In Progress
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DA]">
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {completedTasks.length}
                </div>
                <div className="text-[10px] text-[#8E9892] uppercase font-semibold mt-0.5">
                  Tasks Delivered
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DA]">
                <div className="text-base font-bold text-[#1E3A2F] font-mono">
                  {memberGoals.length}
                </div>
                <div className="text-[10px] text-[#8E9892] uppercase font-semibold mt-0.5">
                  Goals Owned
                </div>
              </div>
            </div>
          </div>

          {/* Active Tasks Assigned */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-[#1E3A2F]" />
              Current Assigned Tasks ({pendingTasks.length})
            </h3>

            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                  No pending tasks right now. Workload is clear!
                </div>
              ) : (
                pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="cursor-pointer p-3 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:bg-[#FAF8F5] flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#1C221F] truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-[#737C76] flex items-center gap-2 mt-0.5">
                        <span className="capitalize">{t.status.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Due {t.dueDate}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#B8B0A0] shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals Owned by Member */}
          {memberGoals.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
                <Target size={14} className="text-[#1E3A2F]" />
                Goals Owned ({memberGoals.length})
              </h3>

              <div className="space-y-2">
                {memberGoals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className="cursor-pointer p-3 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:bg-[#FAF8F5] flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-[#1C221F] truncate">
                        {g.title}
                      </div>
                      <div className="text-[11px] text-[#737C76] mt-0.5">
                        <span>{g.category}</span> • <span>Due {g.dueDate}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#B8B0A0] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INVITATION MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setInviteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E4DA] p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-[#1E3A2F]" />
                <h3 className="text-base font-bold text-[#1C221F]">Invite to {activeWorkspace.name}</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-[#8E9892] hover:bg-[#FAF8F5]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-[#5C6560] leading-relaxed">
                Share this secure one-time invitation code with your teammate. They can join via the
                workspace switcher using "Join with Code".
              </p>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DA] flex items-center justify-between gap-3">
                <code className="text-xs font-mono font-bold text-[#1E3A2F] break-all select-all">
                  {generatedCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E3A2F] bg-white border border-[#E8E4DA] rounded-lg hover:bg-[#F2EFE9] transition-colors shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-[#737C76] space-y-1">
                <div>• Code is valid for 72 hours</div>
                <div>• Can be used up to 10 times</div>
                <div>• New members join with standard member permissions</div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#1E3A2F] text-white rounded-xl hover:bg-[#162A22]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
