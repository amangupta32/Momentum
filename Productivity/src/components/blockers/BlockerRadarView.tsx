import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BlockerRadarView: React.FC = () => {
  const {
    blockersSummary,
    users,
    toggleTaskStatus,
    updateTask,
    setSelectedTaskId,
    setSelectedGoalId,
    activeWorkspace,
  } = useApp();

  const { overdueTasks, urgentUnfinishedTasks, atRiskGoals, totalBlockers } =
    blockersSummary;

  // Extend due date by 3 days helper
  const handleExtendDueDate = (taskId: string, currentDueDate: string) => {
    const current = currentDueDate ? new Date(currentDueDate) : new Date();
    current.setDate(current.getDate() + 3);
    const newDueDate = current.toISOString().split('T')[0];
    updateTask(taskId, { dueDate: newDueDate });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
            <ShieldAlert size={15} />
            <span>Risk Prevention & Triage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Blocker Radar
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Detect friction early. Overdue deadlines, at-risk goals, and urgent stalled items requiring immediate team attention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              totalBlockers === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {totalBlockers === 0 ? 'Radar Clear • 0 Blockers' : `${totalBlockers} Items Need Attention`}
          </span>
        </div>
      </div>

      {totalBlockers === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E4DA] p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-[#1C221F]">All Clear on the Radar</h3>
          <p className="text-xs text-[#5C6560] mt-1 max-w-md mx-auto">
            No overdue tasks or at-risk commitments detected in {activeWorkspace.name}. All milestones are progressing on schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-rose-50/70 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertTriangle size={15} />
                  <span>Overdue Tasks ({overdueTasks.length})</span>
                </div>
                <span className="text-[11px] text-rose-600 font-medium">Immediate Action Required</span>
              </div>

              <div className="divide-y divide-[#F2EFE9] p-2">
                {overdueTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 hover:bg-[#FAF8F5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="text-[#B8B0A0] hover:text-emerald-600 shrink-0"
                          title="Mark complete"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="font-bold text-xs text-[#1C221F] hover:underline truncate text-left block"
                          >
                            {task.title}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-rose-700 mt-0.5 font-medium">
                            <Clock size={11} />
                            <span>Passed deadline: {task.dueDate}</span>
                            <span>•</span>
                            <span>Assigned to {assignee?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleExtendDueDate(task.id, task.dueDate)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#5C6560] bg-white border border-[#E8E4DA] hover:bg-[#F2EFE9] rounded-lg transition-colors flex items-center gap-1"
                          title="Push deadline out by 3 days"
                        >
                          <RotateCcw size={11} />
                          <span>+3 Days</span>
                        </button>
                        <button
                          onClick={() => setSelectedTaskId(task.id)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-[#1E3A2F] hover:bg-[#162A22] rounded-lg shadow-2xs"
                        >
                          Inspect & Triage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. At-Risk or Blocked Goals */}
          {atRiskGoals.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-2xs overflow-hidden">
              <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <ShieldAlert size={15} />
                  <span>At-Risk / Blocked Commitments ({atRiskGoals.length})</span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">Check milestones</span>
              </div>

              <div className="divide-y divide-[#F2EFE9] p-2">
                {atRiskGoals.map((goal) => {
                  const owner = users.find((u) => u.id === goal.ownerId);
                  return (
                    <div
                      key={goal.id}
                      onClick={() => setSelectedGoalId(goal.id)}
                      className="p-3 hover:bg-[#FAF8F5] rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            {goal.category}
                          </span>
                          <h4 className="font-bold text-xs text-[#1C221F] truncate">{goal.title}</h4>
                        </div>
                        <p className="text-[11px] text-[#5C6560] mt-1 line-clamp-1">
                          {goal.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right text-[11px] hidden sm:block">
                          <div className="text-[#8E9892]">Target</div>
                          <div className="font-semibold text-[#1C221F]">{goal.dueDate}</div>
                        </div>
                        <ArrowRight size={14} className="text-[#8E9892]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Urgent Pending Tasks */}
          {urgentUnfinishedTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-2xs overflow-hidden">
              <div className="p-4 bg-[#FAF8F5] border-b border-[#E8E4DA] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C221F]">
                  <Clock size={15} className="text-[#1E3A2F]" />
                  <span>Urgent Stalled Tasks ({urgentUnfinishedTasks.length})</span>
                </div>
                <span className="text-[11px] text-[#8E9892]">High priority backlog</span>
              </div>

              <div className="divide-y divide-[#F2EFE9] p-2">
                {urgentUnfinishedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 hover:bg-[#FAF8F5] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2.5">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-[#B8B0A0] hover:text-emerald-600 shrink-0"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedTaskId(task.id)}
                        className="truncate text-left font-medium text-[#1C221F] hover:underline"
                      >
                        {task.title}
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-xs font-semibold text-[#1E3A2F] hover:underline"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
