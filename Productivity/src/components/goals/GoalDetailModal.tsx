import React, { useState } from 'react';
import {
  X,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  FolderOpen,
  Lock,
  Globe,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';

export const GoalDetailModal: React.FC = () => {
  const {
    selectedGoalId,
    setSelectedGoalId,
    goals,
    tasks,
    users,
    notes,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    toggleTaskStatus,
    openQuickCreate,
    setSelectedTaskId,
    setSelectedNoteId,
    setActiveTab,
    getGoalProgress,
    getGoalHealthState,
  } = useApp();

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  if (!selectedGoalId) return null;

  const goal = goals.find((g) => g.id === selectedGoalId);
  if (!goal) return null;

  const owner = users.find((u) => u.id === goal.ownerId);
  const linkedTasks = tasks.filter((t) => t.linkedGoalId === goal.id);
  const linkedNotes = notes.filter((n) => n.linkedGoalId === goal.id);

  const progress = getGoalProgress(goal);
  const health = getGoalHealthState(goal);

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newMilestone = {
      id: 'm-' + Date.now(),
      title: newMilestoneTitle.trim(),
      dueDate: goal.dueDate,
      completed: false,
    };

    updateGoal(goal.id, {
      milestones: [...goal.milestones, newMilestone],
    });
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const handleRemoveMilestone = (milestoneId: string) => {
    updateGoal(goal.id, {
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    });
  };

  const toggleVisibility = () => {
    const nextVis = goal.visibility === 'private' ? 'workspace' : 'private';
    updateGoal(goal.id, { visibility: nextVis });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
      deleteGoal(goal.id);
      setSelectedGoalId(null);
    }
  };

  const healthBadge = {
    on_track: { text: 'On Track', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    at_risk: { text: 'At Risk', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    blocked: { text: 'Blocked', style: 'bg-rose-50 text-rose-800 border-rose-200' },
    completed: { text: 'Completed', style: 'bg-blue-50 text-blue-800 border-blue-200' },
  }[health];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedGoalId(null)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8E4DA] overflow-hidden z-10 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wide bg-[#1E3A2F]/10 text-[#1E3A2F]">
              {goal.type === 'personal' ? 'Personal Ambition' : 'Group Commitment'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${healthBadge.style}`}>
              {healthBadge.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Visibility Toggle */}
            <button
              onClick={toggleVisibility}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#5C6560] hover:text-[#1C221F] bg-white border border-[#E8E4DA] rounded-lg transition-colors"
              title="Toggle visibility with workspace"
            >
              {goal.visibility === 'workspace' ? (
                <>
                  <Globe size={13} className="text-emerald-700" />
                  <span>Shared with Team</span>
                </>
              ) : (
                <>
                  <Lock size={13} className="text-amber-700" />
                  <span>Private to You</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedGoalId(null)}
              className="text-[#8E9892] hover:text-[#1C221F] p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-[#1C221F] font-display">{goal.title}</h2>
            {goal.description && (
              <p className="text-xs text-[#5C6560] mt-1.5 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          {/* Key Meta Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DA] text-xs">
            <div>
              <div className="text-[10px] text-[#8E9892] uppercase font-semibold">Owner</div>
              <div className="font-medium text-[#1C221F] mt-0.5 flex items-center gap-1.5 truncate">
                <AnimalAvatar
                  avatar={owner?.avatar}
                  name={owner?.name}
                  size={18}
                />
                <span className="truncate">{owner?.name || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#8E9892] uppercase font-semibold">Category</div>
              <div className="font-medium text-[#1C221F] mt-0.5">{goal.category}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#8E9892] uppercase font-semibold">Priority</div>
              <div className="font-medium text-[#1C221F] capitalize mt-0.5">{goal.priority}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#8E9892] uppercase font-semibold">Target Date</div>
              <div className="font-medium text-[#1C221F] mt-0.5 flex items-center gap-1">
                <Calendar size={12} className="text-[#8E9892]" />
                <span>{goal.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="p-4 bg-white rounded-xl border border-[#E8E4DA] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C221F] flex items-center gap-1.5">
                <Target size={14} className="text-[#1E3A2F]" />
                Derived Progress
              </span>
              <span className="font-mono font-bold text-sm text-[#1E3A2F]">{progress}%</span>
            </div>

            <div className="w-full h-2.5 bg-[#F2EFE9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E3A2F] transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-[11px] text-[#8E9892] flex justify-between">
              <span>
                {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length}{' '}
                milestones finished
              </span>
              <span>
                {linkedTasks.filter((t) => t.status === 'done').length} of {linkedTasks.length}{' '}
                tasks completed
              </span>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#1C221F] uppercase tracking-wider">
                Measurable Milestones ({goal.milestones.length})
              </h4>
              <button
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="text-xs text-[#1E3A2F] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Add Milestone Inline Form */}
            {showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Conduct initial pilot test"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A2F] rounded-lg shadow-2xs"
                >
                  Save
                </button>
              </form>
            )}

            <div className="space-y-1.5">
              {goal.milestones.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                  No milestones defined yet.
                </div>
              ) : (
                goal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs transition-colors group"
                  >
                    <button
                      onClick={() => toggleMilestone(goal.id, milestone.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-[#B8B0A0] shrink-0" />
                      )}
                      <span
                        className={`truncate font-medium ${
                          milestone.completed ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                        }`}
                      >
                        {milestone.title}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8E9892]">{milestone.dueDate}</span>
                      <button
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="text-[#8E9892] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Remove milestone"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Associated Tasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#1C221F] uppercase tracking-wider">
                Linked Tasks ({linkedTasks.length})
              </h4>
              <button
                onClick={() => {
                  setSelectedGoalId(null);
                  openQuickCreate('task');
                }}
                className="text-xs text-[#1E3A2F] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>New Linked Task</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {linkedTasks.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                  No tasks directly linked to this goal yet.
                </div>
              ) : (
                linkedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={t.status === 'done'}
                        onChange={() => toggleTaskStatus(t.id)}
                        className="w-4 h-4 rounded text-[#1E3A2F] cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          setSelectedGoalId(null);
                          setSelectedTaskId(t.id);
                        }}
                        className={`truncate text-left font-medium hover:underline ${
                          t.status === 'done' ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                        }`}
                      >
                        {t.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-[#F2EFE9] text-[#5C6560]">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Associated Documents */}
          {linkedNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#1C221F] uppercase tracking-wider">
                Associated Documents ({linkedNotes.length})
              </h4>
              <div className="space-y-1">
                {linkedNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedGoalId(null);
                      setSelectedNoteId(note.id);
                      setActiveTab('notes');
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg border border-[#E8E4DA] hover:bg-[#FAF8F5] text-left text-xs text-[#1C221F] font-medium"
                  >
                    <FolderOpen size={14} className="text-[#1E3A2F]" />
                    <span className="truncate">{note.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8E4DA] bg-[#FAF8F5] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Goal</span>
          </button>

          <button
            onClick={() => setSelectedGoalId(null)}
            className="px-4 py-1.5 text-xs font-medium text-[#1C221F] bg-white border border-[#E8E4DA] hover:bg-[#F2EFE9] rounded-xl shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
