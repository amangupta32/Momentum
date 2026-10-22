import React from 'react';
import {
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Users,
  Target,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalAvatar } from '../avatars/AnimalAvatar';

export const CommitmentWallView: React.FC = () => {
  const {
    goals,
    tasks,
    users,
    activeWorkspace,
    setSelectedGoalId,
    getGoalProgress,
    getGoalHealthState,
    openQuickCreate,
  } = useApp();

  const activeGoals = goals.filter(
    (g) => g.workspaceId === activeWorkspace.id && !g.archived
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <LayoutGrid size={14} className="text-[#1E3A2F]" />
            <span>Public Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            The Commitment Wall
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Visible commitments forge resilient teams. High-level ambitions mapped to real accountable owners.
          </p>
        </div>

        <button
          onClick={() => openQuickCreate('group_goal')}
          className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0"
        >
          Add Shared Commitment
        </button>
      </div>

      {/* Grid of Commitments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeGoals.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E4DA] p-8">
            <ShieldCheck size={36} className="mx-auto text-[#B8B0A0] mb-2" />
            <h3 className="text-sm font-bold text-[#1C221F]">No active commitments</h3>
            <p className="text-xs text-[#8E9892] mt-1">Add a shared goal to display it on the wall.</p>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const health = getGoalHealthState(goal);
            const owner = users.find((u) => u.id === goal.ownerId);
            const linkedTasks = tasks.filter((t) => t.linkedGoalId === goal.id);
            const completedMilestones = goal.milestones.filter((m) => m.completed).length;

            const healthStyle = {
              on_track: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              at_risk: 'bg-amber-50 text-amber-800 border-amber-200',
              blocked: 'bg-rose-50 text-rose-800 border-rose-200',
              completed: 'bg-blue-50 text-blue-800 border-blue-200',
            }[health];

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className="cursor-pointer group relative bg-white rounded-2xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737C76] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DA]">
                      {goal.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthStyle}`}>
                      {health.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-[#1C221F] font-display group-hover:text-[#1E3A2F] transition-colors leading-snug">
                      {goal.title}
                    </h3>
                    <ArrowUpRight
                      size={16}
                      className="text-[#B8B0A0] group-hover:text-[#1E3A2F] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>

                  {goal.description && (
                    <p className="text-xs text-[#5C6560] line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress Ring / Visual Bar */}
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E4DA] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C221F]">Delivery Progress</span>
                    <span className="font-mono font-bold text-base text-[#1E3A2F]">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[#EAE6DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E3A2F] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-[#8E9892]">
                    <span>
                      {completedMilestones} of {goal.milestones.length} milestones
                    </span>
                    <span>
                      {linkedTasks.filter((t) => t.status === 'done').length}/{linkedTasks.length}{' '}
                      tasks
                    </span>
                  </div>
                </div>

                {/* Owner & Target Date */}
                <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AnimalAvatar
                      avatar={owner?.avatar}
                      name={owner?.name}
                      size={24}
                    />
                    <div>
                      <div className="text-[10px] text-[#8E9892] uppercase font-semibold">
                        Accountable
                      </div>
                      <div className="font-bold text-[#1C221F] text-[11px] truncate max-w-[100px]">
                        {owner?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-[#8E9892] uppercase font-semibold">
                      Target Date
                    </div>
                    <div className="font-bold text-[#1C221F] text-[11px] flex items-center gap-1">
                      <Calendar size={11} className="text-[#8E9892]" />
                      <span>{goal.dueDate}</span>
                    </div>
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
