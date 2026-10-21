import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  FolderDot,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoalType } from '../../types';

interface GoalsViewProps {
  type: GoalType;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ type }) => {
  const {
    goals,
    tasks,
    users,
    currentUser,
    activeWorkspace,
    openQuickCreate,
    setSelectedGoalId,
    getGoalProgress,
    getGoalHealthState,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  // Filter based on type and current workspace
  const workspaceGoals = goals.filter((g) => {
    if (g.archived) return false;
    if (type === 'personal') {
      return g.type === 'personal' && g.ownerId === currentUser.id;
    }
    return g.type === 'group' && g.workspaceId === activeWorkspace.id;
  });

  const filteredGoals = workspaceGoals.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    if (healthFilter !== 'all') {
      const h = getGoalHealthState(g);
      if (h !== healthFilter) return false;
    }
    return true;
  });

  const categories = ['all', 'Product', 'Engineering', 'Growth', 'Learning', 'Fitness', 'Operations'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            {type === 'personal' ? (
              <>
                <Target size={14} className="text-[#1E3A2F]" />
                <span>Personal Ambitions</span>
              </>
            ) : (
              <>
                <Users size={14} className="text-[#1E3A2F]" />
                <span>Group Commitments in {activeWorkspace.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            {type === 'personal' ? 'My Goals & Mastery' : 'Shared Team Objectives'}
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            {type === 'personal'
              ? 'Organize ambitions, break into measurable milestones, and turn goals into daily execution.'
              : 'Collective roadmap, shared ownership, transparent progress, and visible accountability.'}
          </p>
        </div>

        <button
          onClick={() => openQuickCreate(type === 'personal' ? 'personal_goal' : 'group_goal')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] shrink-0"
        >
          <Plus size={15} />
          <span>New {type === 'personal' ? 'Personal' : 'Group'} Goal</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E4DA] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#8E9892] text-[11px] font-semibold uppercase mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1E3A2F] text-white font-semibold'
                  : 'text-[#5C6560] hover:bg-[#FAF8F5]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8E9892] text-[11px] font-semibold uppercase">Status:</span>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#E8E4DA] bg-white outline-none font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E4DA] p-8">
            <Target size={32} className="mx-auto text-[#B8B0A0] mb-2" />
            <h3 className="text-sm font-bold text-[#1C221F]">No goals found</h3>
            <p className="text-xs text-[#8E9892] mt-1 max-w-sm mx-auto">
              Create your first {type} goal or adjust the category and status filters above.
            </p>
            <button
              onClick={() => openQuickCreate(type === 'personal' ? 'personal_goal' : 'group_goal')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A2F] rounded-xl shadow-xs"
            >
              Create Goal
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const health = getGoalHealthState(goal);
            const owner = users.find((u) => u.id === goal.ownerId);
            const linkedTasks = tasks.filter((t) => t.linkedGoalId === goal.id);
            const completedMilestones = goal.milestones.filter((m) => m.completed).length;

            const healthConfig = {
              on_track: { label: 'On Track', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              at_risk: { label: 'At Risk', style: 'bg-amber-50 text-amber-800 border-amber-200' },
              blocked: { label: 'Blocked', style: 'bg-rose-50 text-rose-800 border-rose-200' },
              completed: { label: 'Completed', style: 'bg-blue-50 text-blue-800 border-blue-200' },
            }[health];

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className="group cursor-pointer bg-white rounded-2xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[11px] text-[#737C76] uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {goal.visibility === 'workspace' ? (
                        <span title="Shared with workspace">
                          <Globe size={13} className="text-emerald-700" />
                        </span>
                      ) : (
                        <span title="Private">
                          <Lock size={13} className="text-[#8E9892]" />
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${healthConfig.style}`}
                      >
                        {healthConfig.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#1C221F] font-display group-hover:text-[#1E3A2F] transition-colors line-clamp-2">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-[#5C6560] line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#737C76] font-medium text-[11px]">Progress</span>
                    <span className="font-mono font-bold text-sm text-[#1E3A2F]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F2EFE9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E3A2F] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8E9892] pt-0.5">
                    <span>
                      {completedMilestones}/{goal.milestones.length} milestones
                    </span>
                    <span>{linkedTasks.length} linked tasks</span>
                  </div>
                </div>

                {/* Milestones preview chips */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {goal.milestones.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 text-[11px] text-[#5C6560] truncate"
                      >
                        <CheckCircle2
                          size={13}
                          className={m.completed ? 'text-emerald-600' : 'text-[#D6D0C2]'}
                        />
                        <span
                          className={`truncate ${
                            m.completed ? 'line-through text-[#8E9892]' : 'text-[#1C221F]'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                    ))}
                    {goal.milestones.length > 2 && (
                      <div className="text-[10px] text-[#8E9892] pl-5">
                        +{goal.milestones.length - 2} more milestones
                      </div>
                    )}
                  </div>
                )}

                {/* Footer metadata */}
                <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs text-[#8E9892]">
                  <div className="flex items-center gap-1.5 truncate">
                    <img
                      src={owner?.avatar}
                      alt={owner?.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate text-[#5C6560] font-medium text-[11px]">
                      {owner?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-[11px]">
                    <Calendar size={12} />
                    <span>Due {goal.dueDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
