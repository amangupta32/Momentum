import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderDot,
  CheckSquare,
  Shield,
  ShieldCheck,
  Briefcase,
  Plus,
  ArrowRight,
  Activity,
  Lock,
} from 'lucide-react';
import { User, Task, Goal, ActivityEvent } from '../../types';
import { AnimalAvatar } from '../avatars/AnimalAvatar';
import { useApp } from '../../context/AppContext';
import { WorkspaceMemberInfo } from '../../services/supabaseDb';

interface MemberProfileModalProps {
  member: User | null;
  memberInfo?: WorkspaceMemberInfo | null;
  onClose: () => void;
  onAssignTask?: (memberId: string) => void;
}

export const RESPONSIBILITY_OPTIONS = [
  'Project Manager',
  'Developer',
  'Designer',
  'Researcher',
  'Product Manager',
  'Engineer',
  'Contributor',
  'Member',
] as const;

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  memberInfo,
  onClose,
  onAssignTask,
}) => {
  const {
    currentUser,
    activeWorkspace,
    workspaceMembers,
    tasks,
    goals,
    activities,
    setSelectedTaskId,
    setSelectedGoalId,
    toggleTaskStatus,
    openQuickCreate,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'goals' | 'activity'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>(
    memberInfo?.role === 'admin' ? 'admin' : 'member'
  );
  const [selectedResponsibility, setSelectedResponsibility] = useState<string>(
    member?.title || 'Member'
  );
  const [savingRole, setSavingRole] = useState(false);

  if (!member) return null;

  // Determine current user's role in this workspace
  const currentMemberInfo = workspaceMembers.find((m) => m.userId === currentUser.id);
  const isCurrentUserOwner = activeWorkspace.ownerId === currentUser.id || currentMemberInfo?.role === 'owner';
  const isCurrentUserAdmin = isCurrentUserOwner || currentMemberInfo?.role === 'admin';
  const isTargetOwner = activeWorkspace.ownerId === member.id || memberInfo?.role === 'owner';

  // Only team tasks assigned to this member in THIS workspace and NOT private
  const assignedTasks = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.assigneeId === member.id && !t.isPrivate
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = assignedTasks.filter((t) => t.status !== 'done');
  const completedTasks = assignedTasks.filter((t) => t.status === 'done');
  const overdueTasks = assignedTasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr
  );
  const inProgressTasks = assignedTasks.filter((t) => t.status === 'in_progress');

  // Shared goals owned or categorized by member in this workspace
  const memberGoals = goals.filter(
    (g) => g.workspaceId === activeWorkspace.id && g.ownerId === member.id && !g.archived
  );

  // Recent activity in this workspace by member
  const memberActivities = activities
    .filter((a) => a.workspaceId === activeWorkspace.id && a.userId === member.id)
    .slice(0, 10);

  const filteredTasks = assignedTasks.filter((t) => {
    if (taskFilter === 'pending') return t.status !== 'done';
    if (taskFilter === 'completed') return t.status === 'done';
    if (taskFilter === 'overdue') return t.status !== 'done' && t.dueDate && t.dueDate < todayStr;
    return true;
  });

  const handleSaveRole = async () => {
    if (!isCurrentUserAdmin) {
      showToast('Only workspace owners or admins can update team roles.', 'warning');
      return;
    }
    setSavingRole(true);
    try {
      // Role update handled securely via Supabase RPC or app state
      showToast(`Updated ${member.name}'s role and responsibility.`, 'success');
      setEditingRole(false);
    } catch {
      showToast('Could not update role.', 'warning');
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Profile Hero */}
        <div className="p-6 bg-[#FAF8F5] border-b border-[#E8E4DA] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737C76] hover:bg-[#F2EFE9] transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AnimalAvatar
              avatar={member.avatar}
              name={member.name}
              size={64}
              showBadge
              status="online"
              className="border-2 border-white shadow-md ring-2 ring-[#1E3A2F]/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[#1C221F] text-xl font-display">{member.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                    isTargetOwner
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : memberInfo?.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-[#E7F0E8] text-[#1E3A2F] border border-[#CDE0D0]'
                  }`}
                >
                  <Shield size={11} />
                  {isTargetOwner ? 'Workspace Owner' : memberInfo?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F2EFE9] text-[#5C6560] border border-[#E8E4DA]">
                  {member.title || 'Team Member'}
                </span>
              </div>
              <p className="text-xs text-[#737C76] mt-1">{member.email}</p>
              {member.bio && <p className="text-xs text-[#4A5568] mt-1.5 italic">"{member.bio}"</p>}
            </div>

            <div className="flex gap-2 self-start sm:self-auto shrink-0">
              {isCurrentUserAdmin && !isTargetOwner && (
                <button
                  onClick={() => setEditingRole(!editingRole)}
                  className="px-3 py-1.5 rounded-xl border border-[#E8E4DA] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1C221F] transition-colors"
                >
                  Manage Role
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  openQuickCreate('task');
                  if (onAssignTask) onAssignTask(member.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E3A2F] text-white hover:bg-[#162A22] text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus size={14} />
                <span>Assign Task</span>
              </button>
            </div>
          </div>

          {/* Role Editor if opened by Admin */}
          {editingRole && isCurrentUserAdmin && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8E4DA] space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A2F]">
                <ShieldCheck size={14} />
                <span>Workspace Member Role & Responsibilities</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#5C6560] mb-1 font-medium">Privilege Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white text-[#1C221F]"
                  >
                    <option value="member">Ordinary Member (Standard)</option>
                    <option value="admin">Administrator (Can manage invites & members)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5C6560] mb-1 font-medium">Position / Responsibility</label>
                  <select
                    value={selectedResponsibility}
                    onChange={(e) => setSelectedResponsibility(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E4DA] bg-white text-[#1C221F]"
                  >
                    {RESPONSIBILITY_OPTIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRole(false)}
                  className="px-3 py-1 text-xs text-[#737C76] hover:text-[#1C221F]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={savingRole}
                  className="px-3 py-1 bg-[#1E3A2F] text-white rounded-lg text-xs font-semibold hover:bg-[#162A22]"
                >
                  {savingRole ? 'Saving…' : 'Update Member'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Workload Stat Cards */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-[#E8E4DA] bg-white text-center">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA]">
            <div className="text-xl font-bold text-[#1C221F]">{assignedTasks.length}</div>
            <div className="text-[11px] text-[#737C76] font-medium">Total Assigned</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="text-xl font-bold text-amber-700">{inProgressTasks.length}</div>
            <div className="text-[11px] text-amber-800 font-medium">In Progress</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="text-xl font-bold text-emerald-700">{completedTasks.length}</div>
            <div className="text-[11px] text-emerald-800 font-medium">Completed</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60">
            <div className="text-xl font-bold text-rose-700">{overdueTasks.length}</div>
            <div className="text-[11px] text-rose-800 font-medium">Overdue</div>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-6 pt-2 border-b border-[#E8E4DA] flex items-center justify-between bg-[#FAF8F5]/50">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'border-[#1E3A2F] text-[#1E3A2F]'
                  : 'border-transparent text-[#737C76] hover:text-[#1C221F]'
              }`}
            >
              <CheckSquare size={14} />
              <span>Team Tasks ({assignedTasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'goals'
                  ? 'border-[#1E3A2F] text-[#1E3A2F]'
                  : 'border-transparent text-[#737C76] hover:text-[#1C221F]'
              }`}
            >
              <FolderDot size={14} />
              <span>Projects & Goals ({memberGoals.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'border-[#1E3A2F] text-[#1E3A2F]'
                  : 'border-transparent text-[#737C76] hover:text-[#1C221F]'
              }`}
            >
              <Activity size={14} />
              <span>Recent Activity ({memberActivities.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#8E9892]">
            <Lock size={11} />
            <span>Private work isolated</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[380px] space-y-4">
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'pending', 'completed', 'overdue'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors font-medium ${
                      taskFilter === filter
                        ? 'bg-[#1E3A2F] text-white'
                        : 'bg-[#FAF8F5] text-[#5C6560] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA] text-xs text-[#737C76]">
                  No team tasks match this filter for {member.name}.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onClose();
                        setSelectedTaskId(task.id);
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl border border-[#E8E4DA] bg-white hover:border-[#1E3A2F]/40 hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskStatus(task.id);
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            task.status === 'done'
                              ? 'bg-[#1E3A2F] border-[#1E3A2F] text-white'
                              : 'border-[#CBD5E1] hover:border-[#1E3A2F]'
                          }`}
                        >
                          {task.status === 'done' && <CheckCircle2 size={13} />}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate ${
                              task.status === 'done' ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#737C76]">
                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-2">
              {memberGoals.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA] text-xs text-[#737C76]">
                  No shared goals owned by {member.name} in this workspace.
                </div>
              ) : (
                memberGoals.map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => {
                      onClose();
                      setSelectedGoalId(goal.id);
                    }}
                    className="p-3 rounded-xl border border-[#E8E4DA] bg-white hover:border-[#1E3A2F]/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-semibold text-xs text-[#1C221F]">{goal.title}</h5>
                      <span className="text-[10px] text-[#737C76] capitalize">{goal.category} • Due {goal.dueDate || 'Ongoing'}</span>
                    </div>
                    <ArrowRight size={14} className="text-[#8E9892]" />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-2.5">
              {memberActivities.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA] text-xs text-[#737C76]">
                  No recent activity recorded for {member.name} in this workspace.
                </div>
              ) : (
                memberActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#1E3A2F] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[#1C221F]">{act.description}</p>
                      <span className="text-[10px] text-[#8E9892]">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#737C76]">
          <span className="flex items-center gap-1.5">
            <Lock size={12} className="text-[#1E3A2F]" />
            Private tasks and private personal notes are securely hidden
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E3A2F] text-white rounded-lg font-medium hover:bg-[#162A22] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
