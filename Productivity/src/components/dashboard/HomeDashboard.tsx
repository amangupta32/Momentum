import React from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Target,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Users,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HomeDashboard: React.FC = () => {
  const {
    currentUser,
    activeWorkspace,
    streakDays,
    tasks,
    goals,
    activities,
    users,
    toggleTaskStatus,
    openQuickCreate,
    setSelectedGoalId,
    setSelectedTaskId,
    setActiveTab,
    getGoalProgress,
    getGoalHealthState,
    blockersSummary,
  } = useApp();

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Today's focus tasks (prioritized tasks assigned to current user or flagged isTodayFocus)
  const todayFocusTasks = tasks
    .filter(
      (t) =>
        t.workspaceId === activeWorkspace.id &&
        (t.isTodayFocus || t.assigneeId === currentUser.id) &&
        t.status !== 'done'
    )
    .slice(0, 4);

  // Up next tasks (any pending tasks in workspace)
  const upNextTasks = tasks
    .filter((t) => t.workspaceId === activeWorkspace.id && t.status !== 'done')
    .slice(0, 5);

  // Personal goals
  const personalGoals = goals.filter(
    (g) => g.ownerId === currentUser.id && !g.archived
  );

  // Team goals
  const teamGoals = goals.filter(
    (g) => g.workspaceId === activeWorkspace.id && g.type === 'group' && !g.archived
  );

  // Recent workspace activities
  const recentActivities = activities
    .filter((a) => a.workspaceId === activeWorkspace.id)
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <span>{todayDateString}</span>
            <span>•</span>
            <span className="text-[#1E3A2F] font-bold">{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
          </h1>
        </div>

        {/* Momentum Streak Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-white rounded-xl border border-[#E8E4DA] shadow-2xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Flame size={16} className="fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8E9892]">Momentum Streak</div>
              <div className="text-xs font-bold text-[#1C221F]">
                {streakDays} Days of Progress
              </div>
            </div>
          </div>

          <button
            onClick={() => openQuickCreate('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Motivational Philosophy Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A2F] to-[#2D5A46] text-white p-5 sm:p-6 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles size={14} />
            <span>Daily Deliberate Action</span>
          </div>
          <p className="font-editorial text-lg sm:text-xl font-normal italic leading-snug text-[#F5F2EA]">
            "Real momentum is not a sudden epiphany; it is the compound interest of small,
            accountable milestones accomplished day after day."
          </p>
          <div className="text-xs text-emerald-200/80 font-medium pt-1">
            {todayFocusTasks.length > 0 ? (
              <span>You have {todayFocusTasks.length} high-impact priority tasks lined up for today.</span>
            ) : (
              <span>All priority focus tasks for today are checked off! Clean momentum.</span>
            )}
          </div>
        </div>

        {/* Decorative subtle geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* 3. Main Grid: Today's Focus & Up Next */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Focus & Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Focus Section */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-[#1C221F] font-display">
                  Today's Focus
                </h2>
                <span className="text-xs text-[#8E9892]">
                  ({todayFocusTasks.length} pending)
                </span>
              </div>
              <button
                onClick={() => setActiveTab('task_board')}
                className="text-xs text-[#1E3A2F] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Board</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {todayFocusTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                  No active focus tasks right now. Check "Up Next" or create a new task.
                </div>
              ) : (
                todayFocusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F]/30 hover:bg-[#FAF8F5] text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-[#B8B0A0] hover:text-emerald-600 transition-colors shrink-0"
                        title="Mark complete"
                      >
                        <Circle size={17} />
                      </button>
                      <button
                        onClick={() => setSelectedTaskId(task.id)}
                        className="truncate text-left font-medium text-[#1C221F] hover:text-[#1E3A2F] group-hover:underline"
                      >
                        {task.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium capitalize ${
                          task.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#F2EFE9] text-[#5C6560]'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-[11px] text-[#8E9892] flex items-center gap-1 hidden sm:flex">
                          <Clock size={11} />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Group Goals Section */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#1E3A2F]" />
                <h2 className="text-sm font-bold text-[#1C221F] font-display">
                  Team Goals in {activeWorkspace.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('group_goals')}
                className="text-xs text-[#1E3A2F] font-semibold hover:underline flex items-center gap-1"
              >
                <span>All Group Goals</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamGoals.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                  No group goals created yet in this workspace.
                </div>
              ) : (
                teamGoals.map((goal) => {
                  const progress = getGoalProgress(goal);
                  const health = getGoalHealthState(goal);
                  const owner = users.find((u) => u.id === goal.ownerId);

                  return (
                    <div
                      key={goal.id}
                      onClick={() => setSelectedGoalId(goal.id)}
                      className="cursor-pointer p-4 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:shadow-xs transition-all bg-[#FAF8F5]/60 hover:bg-white flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-[#8E9892] uppercase">
                            {goal.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              health === 'on_track'
                                ? 'bg-emerald-100 text-emerald-800'
                                : health === 'at_risk'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {health.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-[#1C221F] line-clamp-1">
                          {goal.title}
                        </h3>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-[#5C6560] mb-1">
                          <span>Progress</span>
                          <span className="font-mono font-bold text-[#1E3A2F]">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#EAE6DC] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E3A2F] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E8E4DA] flex items-center justify-between text-[11px] text-[#8E9892]">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={owner?.avatar}
                            alt={owner?.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="truncate max-w-[80px]">{owner?.name}</span>
                        </div>
                        <span>Due {goal.dueDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Personal Goals Section */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#1E3A2F]" />
                <h2 className="text-sm font-bold text-[#1C221F] font-display">
                  My Personal Goals
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('my_goals')}
                className="text-xs text-[#1E3A2F] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Personal Goals</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {personalGoals.map((goal) => {
                const progress = getGoalProgress(goal);
                const nextMilestone = goal.milestones.find((m) => !m.completed);

                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className="cursor-pointer p-4 rounded-xl border border-[#E8E4DA] hover:border-[#1E3A2F] hover:bg-[#FAF8F5] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] text-[#8E9892] uppercase font-semibold">
                          <span>{goal.category}</span>
                          <span>•</span>
                          <span>Due {goal.dueDate}</span>
                        </div>
                        <h3 className="font-bold text-xs text-[#1C221F] mt-0.5">{goal.title}</h3>
                        {nextMilestone && (
                          <div className="text-[11px] text-[#5C6560] mt-1 flex items-center gap-1.5">
                            <span className="text-[#8E9892]">Next milestone:</span>
                            <span className="font-medium text-[#1E3A2F] truncate">
                              {nextMilestone.title}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-[#1E3A2F]">
                          {progress}%
                        </span>
                        <div className="w-20 sm:w-28 h-2 bg-[#F2EFE9] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#1E3A2F] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Up Next, Weekly Visualization, Activity */}
        <div className="space-y-6">
          {/* Up Next Task List */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#1E3A2F]" />
                Up Next ({upNextTasks.length})
              </h3>
              <button
                onClick={() => openQuickCreate('task')}
                className="text-[11px] text-[#1E3A2F] font-semibold hover:underline flex items-center gap-0.5"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {upNextTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8E4DA] text-xs transition-colors"
                >
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    <Circle size={15} className="text-[#B8B0A0] hover:text-emerald-600 shrink-0" />
                    <span className="truncate text-[#1C221F] font-medium">{t.title}</span>
                  </button>
                  <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-[#F2EFE9] text-[#737C76] shrink-0 ml-2">
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress Bar Visualization */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1E3A2F]" />
                Weekly Velocity
              </h3>
              <button
                onClick={() => setActiveTab('weekly_review')}
                className="text-[11px] text-[#1E3A2F] font-semibold hover:underline"
              >
                Review
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center pt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const heights = [40, 65, 85, 50, 75, 30, 60];
                const isCurrent = i === 1; // Tuesday demo day
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-full bg-[#FAF8F5] rounded-lg h-24 flex items-end justify-center p-1 border border-[#E8E4DA]">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          isCurrent ? 'bg-[#1E3A2F]' : 'bg-[#D6D0C2]'
                        }`}
                        style={{ height: `${heights[i]}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium ${
                        isCurrent ? 'text-[#1E3A2F] font-bold' : 'text-[#8E9892]'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-[11px] text-[#5C6560] flex items-center justify-between">
              <span>Completed this week:</span>
              <span className="font-bold text-[#1C221F]">
                {tasks.filter((t) => t.status === 'done').length} Tasks Done
              </span>
            </div>
          </div>

          {/* Recent Live Activity */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1C221F] uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-[11px] text-[#1E3A2F] font-semibold hover:underline"
              >
                All
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const user = users.find((u) => u.id === act.userId);
                return (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[#1C221F]">
                        <span className="font-semibold">{user?.name}</span>{' '}
                        <span className="text-[#5C6560]">{act.description}</span>
                      </p>
                      <span className="text-[10px] text-[#8E9892]">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
